const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const symptomSchema = z.union([
  z.string().min(1),
  z.object({ name: z.string().min(1), severity: z.number().int().min(1).max(10).optional().default(5) }),
]);

const mealSchema = z.object({
  type: z.string().optional(),
  meal_type: z.string().optional(),
  description: z.string().default(""),
  healthScore: z.number().int().min(1).max(5).optional(),
  health_score: z.number().int().min(1).max(5).optional(),
  calories: z.number().int().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
});

const createLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  energy: z.number().int().min(1).max(10),
  mood: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
  overallScore: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional().default(""),
  sleepHours: z.number().min(0).max(24).optional().default(0),
  hydrationMl: z.number().int().min(0).optional().default(0),
  exerciseMinutes: z.number().int().min(0).optional().default(0),
  symptoms: z.array(symptomSchema).optional().default([]),
  meals: z.array(mealSchema).optional().default([]),
});

const getLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({ field: i.path.join("."), message: i.message }));
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    req.validatedBody = result.data;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({ field: i.path.join("."), message: i.message }));
      return res.status(400).json({ error: "Invalid query parameters", details: errors });
    }
    req.validatedQuery = result.data;
    next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({ field: i.path.join("."), message: i.message }));
      return res.status(400).json({ error: "Invalid parameters", details: errors });
    }
    req.validatedParams = result.data;
    next();
  };
}

module.exports = { registerSchema, loginSchema, createLogSchema, getLogsQuerySchema, dateParamSchema, validate, validateQuery, validateParams };
