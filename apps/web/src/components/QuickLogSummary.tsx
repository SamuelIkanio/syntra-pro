"use client";

import { Zap, Smile, AlertTriangle, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import type { DailyLogState } from "@/app/page";

interface Props { log: DailyLogState; overallScore: number; }

function scoreColor(score: number): string {
  if (score >= 7) return "text-accent-green";
  if (score >= 4) return "text-accent-amber";
  return "text-accent-rose";
}
function ringStroke(score: number): string {
  if (score >= 7) return "#34d399";
  if (score >= 4) return "#fbbf24";
  return "#fb7185";
}
function ringGlowColor(score: number): string {
  if (score >= 7) return "rgba(52, 211, 153, 0.5)";
  if (score >= 4) return "rgba(251, 191, 36, 0.5)";
  return "rgba(251, 113, 133, 0.5)";
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const stroke = ringStroke(score);
  const glowColor = ringGlowColor(score);
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="42" cy="42" r={radius} fill="none" strokeWidth="5" stroke="url(#ringGradient)" />
        <motion.circle cx="42" cy="42" r={radius} fill="none" strokeWidth="5" strokeLinecap="round" stroke={stroke}
          strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }} filter="url(#ringGlow)" />
      </svg>
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`, opacity: 0.15 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span key={score} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
          className={`text-xl font-bold ${scoreColor(score)}`}>{score.toFixed(1)}</motion.span>
        <span className="text-[10px] text-text-muted -mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

export default function QuickLogSummary({ log, overallScore }: Props) {
  const items = [
    { icon: Zap, label: "Energy", value: log.energy, color: "text-accent-amber", glow: "bg-accent-amber-glow" },
    { icon: Smile, label: "Mood", value: log.mood, color: "text-accent-indigo", glow: "bg-accent-indigo-glow" },
    { icon: AlertTriangle, label: "Symptoms", value: log.symptoms.length, color: "text-accent-rose", glow: "bg-accent-rose-glow", suffix: "" },
    { icon: Utensils, label: "Meals", value: log.meals.length, color: "text-accent-green", glow: "bg-accent-green-glow", suffix: "" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-card p-5 glow-indigo">
      <div className="flex items-center gap-5">
        <ScoreRing score={overallScore} />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text-primary mb-0.5 tracking-tight">Quick Log Summary</h2>
          <p className="text-xs text-text-muted mb-3">
            {overallScore >= 7 ? "Looking great today! 🎉" : overallScore >= 4 ? "Solid tracking — keep it up!" : "Take it easy today 💛"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {items.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                className="flex flex-col items-center rounded-xl bg-white/[0.04] py-2 px-1 border border-white/[0.06] backdrop-blur-sm">
                <item.icon className={`w-3.5 h-3.5 ${item.color} mb-0.5`} />
                <span className={`text-sm font-bold ${item.color}`}>{item.value}{item.suffix !== undefined ? item.suffix : "/10"}</span>
                <span className="text-[9px] text-text-muted">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
