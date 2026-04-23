"use client";

import { Zap, Smile, AlertTriangle, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import type { DailyLogState } from "@/app/page";

interface Props {
  log: DailyLogState;
  overallScore: number;
}

function scoreColor(score: number): string {
  if (score >= 7) return "text-accent-green";
  if (score >= 4) return "text-accent-amber";
  return "text-accent-rose";
}

function scoreGlow(score: number): string {
  if (score >= 7) return "shadow-accent-green/20";
  if (score >= 4) return "shadow-accent-amber/20";
  return "shadow-accent-rose/20";
}

function ringStroke(score: number): string {
  if (score >= 7) return "#34d399";
  if (score >= 4) return "#fbbf24";
  return "#fb7185";
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const stroke = ringStroke(score);

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r={radius}
          fill="none" strokeWidth="4"
          stroke="rgba(255,255,255,0.06)"
        />
        <motion.circle
          cx="40" cy="40" r={radius}
          fill="none" strokeWidth="4"
          strokeLinecap="round"
          stroke={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${stroke}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${scoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-4 glow-indigo"
    >
      <div className="flex items-center gap-4">
        <ScoreRing score={overallScore} />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text-primary mb-0.5">
            Quick Log Summary
          </h2>
          <p className="text-xs text-text-muted mb-3">
            {overallScore >= 7
              ? "Looking great today! \ud83c\udf89"
              : overallScore >= 4
              ? "Solid tracking \u2014 keep it up!"
              : "Take it easy today \ud83d\udc9b"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                className={`flex flex-col items-center rounded-xl ${item.glow} py-1.5 px-1 border border-border-glass`}
              >
                <item.icon className={`w-3.5 h-3.5 ${item.color} mb-0.5`} />
                <span className={`text-sm font-bold ${item.color}`}>
                  {item.value}
                  {item.suffix !== undefined ? item.suffix : "/10"}
                </span>
                <span className="text-[9px] text-text-muted">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
