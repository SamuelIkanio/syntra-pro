"use client";

import { motion } from "framer-motion";
import { TrendingUp, Save, Sparkles } from "lucide-react";

interface Props {
  energy: number;
  mood: number;
  stress: number;
  symptomCount: number;
  mealCount: number;
  sleepHours: number;
  hydrationMl: number;
  exerciseMinutes: number;
  onSave: () => void;
  saving: boolean;
  saveSuccess: boolean;
}

export default function QuickLogSummary({
  energy, mood, stress, symptomCount, mealCount,
  sleepHours, hydrationMl, exerciseMinutes,
  onSave, saving, saveSuccess,
}: Props) {
  const overallScore = Math.round(((energy + mood + (10 - stress)) / 3) * 10) / 10;

  function getScoreColor(score: number): string {
    if (score >= 7) return "#34d399";
    if (score >= 5) return "#fbbf24";
    return "#fb7185";
  }

  function getScoreLabel(score: number): string {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Attention";
  }

  const color = getScoreColor(overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="space-y-3"
    >
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
        Daily Summary
      </h3>
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-semibold text-text-primary">Overall Score</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              key={overallScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold tabular-nums"
              style={{ color }}
            >
              {overallScore}
            </motion.span>
            <span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>
              {getScoreLabel(overallScore)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="text-xs"><span className="block text-text-muted">Symptoms</span><span className="text-text-primary font-semibold">{symptomCount}</span></div>
          <div className="text-xs"><span className="block text-text-muted">Meals</span><span className="text-text-primary font-semibold">{mealCount}</span></div>
          <div className="text-xs"><span className="block text-text-muted">Sleep</span><span className="text-text-primary font-semibold">{sleepHours}h</span></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          disabled={saving}
          data-testid="save-log-button"
          className={`w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            saveSuccess
              ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
              : "bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-lg shadow-accent-indigo/30 hover:shadow-accent-indigo/50"
          }`}
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : saveSuccess ? (
            <><Sparkles className="w-4 h-4" /> Saved Successfully!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Daily Log</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
