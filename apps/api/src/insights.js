const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { getDb } = require("./db");

// Corrected path to the insight engine
const ENGINE_DIR = "/root/workspace/background/syntra-insight-engine";
const PYTHON = "python3";

function buildDatasetFromDb(userId) {
  const db = getDb();

  const logs = db.prepare("SELECT * FROM daily_logs WHERE user_id = ? ORDER BY date ASC").all(userId);
  const logIds = logs.map(l => l.id);

  if (logIds.length === 0) return { daily_logs: [], symptoms: [], diet_logs: [], habits: [] };

  const allSymptoms = db.prepare(
    `SELECT s.*, dl.date as log_date FROM symptoms s JOIN daily_logs dl ON s.log_id = dl.id WHERE dl.user_id = ? ORDER BY dl.date ASC`
  ).all(userId);
  const allMeals = db.prepare(
    `SELECT d.*, dl.date as log_date FROM diet_logs d JOIN daily_logs dl ON d.log_id = dl.id WHERE dl.user_id = ? ORDER BY dl.date ASC`
  ).all(userId);

  function moodToString(moodNum) {
    if (moodNum <= 2) return "terrible";
    if (moodNum <= 4) return "bad";
    if (moodNum <= 6) return "neutral";
    if (moodNum <= 8) return "good";
    return "great";
  }

  const daily_logs = logs.map(l => ({
    date: l.date,
    sleep_hours: l.sleep_hours || 7,
    hydration_ml: l.hydration_ml || 1500,
    energy_level: l.energy_level,
    stress_level: l.stress_level,
    mood: moodToString(l.mood),
    exercise_minutes: l.exercise_minutes || 0,
    notes: l.notes || "",
  }));

  const symptoms = allSymptoms.map(s => ({
    date: s.date || s.log_date,
    name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
    severity: s.severity || 5,
    time_of_day: "",
  }));

  const diet_logs = allMeals.map(m => ({
    date: m.date || m.log_date,
    meal_type: (m.meal_type || "snack").toLowerCase(),
    description: m.description || "",
    calories: m.calories || 0,
    tags: safeParseTags(m.tags),
  }));

  return { daily_logs, symptoms, diet_logs, habits: [] };
}

function safeParseTags(tags) {
  if (Array.isArray(tags)) return tags;
  try { return JSON.parse(tags || "[]"); } catch { return []; }
}

function runInsightEngine(userId) {
  return new Promise((resolve, reject) => {
    const dataset = buildDatasetFromDb(userId);

    if (dataset.daily_logs.length === 0) {
      return resolve({
        summary: { total_insights: 0, critical_count: 0, warning_count: 0, info_count: 0, insights_by_category: {}, top_insights: [] },
        insights: [],
        message: "No data to analyze. Start logging to see insights!",
      });
    }

    const tmpFile = path.join(os.tmpdir(), `syntra-dataset-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify(dataset, null, 2));

    const mainPy = path.join(ENGINE_DIR, "main.py");

    execFile(PYTHON, [mainPy, tmpFile, "--json"], {
      cwd: ENGINE_DIR,
      timeout: 15000,
      env: { ...process.env, PYTHONPATH: ENGINE_DIR },
    }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch {}
      if (err) {
        console.error("Insight engine error:", stderr);
        return reject(new Error(`Insight engine failed: ${stderr}`));
      }
      try { resolve(JSON.parse(stdout)); } catch (parseErr) { reject(new Error(`Failed to parse engine output: ${stdout}`)); }
    });
  });
}

function generateDailyReport(userId, date) {
  return new Promise((resolve, reject) => {
    const dataset = buildDatasetFromDb(userId);
    const tmpFile = path.join(os.tmpdir(), `syntra-report-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, JSON.stringify(dataset, null, 2));

    const mainPy = path.join(ENGINE_DIR, "main.py");

    execFile(PYTHON, [mainPy, tmpFile, "--report", date], {
      cwd: ENGINE_DIR,
      timeout: 15000,
      env: { ...process.env, PYTHONPATH: ENGINE_DIR },
    }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch {}
      if (err) {
        console.error("Report engine error:", stderr);
        return reject(new Error(`Report failed: ${stderr}`));
      }
      try { resolve(JSON.parse(stdout)); } catch (parseErr) { reject(new Error(`Failed to parse report: ${stdout}`)); }
    });
  });
}

module.exports = { runInsightEngine, buildDatasetFromDb, generateDailyReport };
