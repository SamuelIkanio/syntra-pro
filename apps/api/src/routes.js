const express = require("express");
const { getDb } = require("./db");
const { hashPassword, verifyPassword, signToken, authMiddleware } = require("./auth");
const { runInsightEngine, generateDailyReport } = require("./insights");
const {
  registerSchema, loginSchema, createLogSchema,
  getLogsQuerySchema, dateParamSchema,
  validate, validateQuery, validateParams,
} = require("./validation");

const router = express.Router();

// ==================== AUTH ROUTES ====================

router.post("/auth/register", validate(registerSchema), (req, res) => {
  try {
    const { email, password, name } = req.validatedBody;
    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = hashPassword(password);
    const result = db.prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)").run(email, passwordHash, name);
    const token = signToken({ sub: result.lastInsertRowid, email, name });
    res.status(201).json({ token, user: { id: result.lastInsertRowid, email, name } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", validate(loginSchema), (req, res) => {
  try {
    const { email, password } = req.validatedBody;
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken({ sub: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ==================== LOG ROUTES (Protected) ====================

router.post("/logs", authMiddleware, validate(createLogSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, energy, mood, stress, symptoms, meals, overallScore, notes, sleepHours, hydrationMl, exerciseMinutes } = req.validatedBody;
    const db = getDb();

    const upsertLog = db.transaction(() => {
      const existing = db.prepare("SELECT id FROM daily_logs WHERE user_id = ? AND date = ?").get(userId, date);
      let logId;
      if (existing) {
        db.prepare(`UPDATE daily_logs SET energy_level = ?, mood = ?, stress_level = ?, overall_score = ?, notes = ?, sleep_hours = ?, hydration_ml = ?, exercise_minutes = ?, updated_at = datetime('now') WHERE id = ?`).run(energy, mood, stress, overallScore ?? null, notes, sleepHours, hydrationMl, exerciseMinutes, existing.id);
        logId = existing.id;
        db.prepare("DELETE FROM symptoms WHERE log_id = ?").run(logId);
        db.prepare("DELETE FROM diet_logs WHERE log_id = ?").run(logId);
      } else {
        const result = db.prepare(`INSERT INTO daily_logs (user_id, date, energy_level, mood, stress_level, overall_score, notes, sleep_hours, hydration_ml, exercise_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(userId, date, energy, mood, stress, overallScore ?? null, notes, sleepHours, hydrationMl, exerciseMinutes);
        logId = Number(result.lastInsertRowid);
      }
      const insertSymptom = db.prepare("INSERT INTO symptoms (log_id, date, name, severity) VALUES (?, ?, ?, ?)");
      for (const s of symptoms) insertSymptom.run(logId, date, typeof s === "string" ? s : s.name, typeof s === "object" && s.severity ? Number(s.severity) : 5);
      const insertMeal = db.prepare("INSERT INTO diet_logs (log_id, date, meal_type, description, health_score, calories, tags) VALUES (?, ?, ?, ?, ?, ?, ?)");
      for (const m of meals) insertMeal.run(logId, date, m.type || m.meal_type || "Snack", m.description || "", m.healthScore || m.health_score || 3, m.calories || 0, JSON.stringify(m.tags || []));
      return logId;
    });

    const logId = upsertLog();
    
    // Generate report after saving
    const report = await generateDailyReport(userId, date);
    
    res.status(201).json({ 
      id: logId, 
      date, 
      message: "Log saved successfully",
      report 
    });
  } catch (err) {
    console.error("POST /logs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logs", authMiddleware, validateQuery(getLogsQuerySchema), (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    const { limit, offset, from, to } = req.validatedQuery;
    let sql = "SELECT * FROM daily_logs WHERE user_id = ?";
    const params = [userId];
    if (from) { sql += " AND date >= ?"; params.push(from); }
    if (to) { sql += " AND date <= ?"; params.push(to); }
    sql += " ORDER BY date DESC";
    if (limit) { sql += " LIMIT ?"; params.push(limit); }
    if (offset) { sql += " OFFSET ?"; params.push(offset); }
    const logs = db.prepare(sql).all(...params);
    const getSymptoms = db.prepare("SELECT name, severity FROM symptoms WHERE log_id = ?");
    const getMeals = db.prepare("SELECT meal_type, description, health_score, calories, tags FROM diet_logs WHERE log_id = ?");
    const enriched = logs.map(log => ({
      id: log.id, date: log.date, energy: log.energy_level, mood: log.mood, stress: log.stress_level, overallScore: log.overall_score, notes: log.notes, sleepHours: log.sleep_hours, hydrationMl: log.hydration_ml, exercise_minutes: log.exercise_minutes, symptoms: getSymptoms.all(log.id).map(s => s.name), meals: getMeals.all(log.id).map(m => ({ type: m.meal_type, description: m.description, healthScore: m.health_score, calories: m.calories, tags: JSON.parse(m.tags || "[]") })), createdAt: log.created_at, updatedAt: log.updated_at,
    }));
    res.json({ logs: enriched, total: db.prepare("SELECT COUNT(*) as count FROM daily_logs WHERE user_id = ?").get(userId).count });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/logs/:date", authMiddleware, validateParams(dateParamSchema), (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    const { date } = req.validatedParams;
    const log = db.prepare("SELECT * FROM daily_logs WHERE user_id = ? AND date = ?").get(userId, date);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json({
      id: log.id, date: log.date, energy: log.energy_level, mood: log.mood, stress: log.stress_level, overallScore: log.overall_score, notes: log.notes, sleepHours: log.sleep_hours, hydration_ml: log.hydration_ml, exercise_minutes: log.exercise_minutes, symptoms: db.prepare("SELECT name FROM symptoms WHERE log_id = ?").all(log.id).map(s => s.name), meals: db.prepare("SELECT meal_type, description, health_score, calories, tags FROM diet_logs WHERE log_id = ?").all(log.id).map(m => ({ type: m.meal_type, description: m.description, healthScore: m.health_score, calories: m.calories, tags: JSON.parse(m.tags || "[]") })), createdAt: log.created_at, updatedAt: log.updated_at,
    });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const result = await runInsightEngine(req.user.id);
    res.json(result);
  } catch (err) { res.status(500).json({ error: "Failed to generate insights" }); }
});

router.get("/health", (req, res) => {
  res.json({ status: "ok", version: "2.0.0-pro", timestamp: new Date().toISOString() });
});

module.exports = router;
