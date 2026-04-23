const API_ENDPOINTS = {
  health: "GET /api/health",
  login: "POST /api/auth/login",
  register: "POST /api/auth/register",
  me: "GET /api/auth/me",
  saveLogs: "POST /api/logs",
  getLogs: "GET /api/logs",
  getLogByDate: "GET /api/logs/:date",
  deleteLogs: "DELETE /api/logs/:date",
  insights: "GET /api/insights",
};

const SEVERITY_LEVELS = {
  info: "info",
  warning: "warning",
  critical: "critical",
};

const SYMPTOM_LIST = [
  "fatigue", "headache", "bloating", "nausea", "insomnia",
  "anxiety", "dehydration", "eye_strain", "fever",
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

module.exports = { API_ENDPOINTS, SEVERITY_LEVELS, SYMPTOM_LIST, MEAL_TYPES };
