// Shared utilities for SYNTRA Pro

const SYMPTOM_OPTIONS = [
  "headache", "fatigue", "nausea", "dizziness", "insomnia",
  "back_pain", "anxiety", "bloating", "joint_pain", "brain_fog",
  "chest_tightness", "eye_strain"
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const HEALTH_SCORE_LABELS = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent"
};

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function calculateOverallScore(energy, mood, stress) {
  return Math.round(((energy + mood + (10 - stress)) / 3) * 10) / 10;
}

module.exports = { SYMPTOM_OPTIONS, MEAL_TYPES, HEALTH_SCORE_LABELS, formatDate, calculateOverallScore };
