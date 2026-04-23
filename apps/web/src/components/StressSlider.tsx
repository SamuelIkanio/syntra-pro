"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Props { value: number; onChange: (v: number) => void; }

function getStressLabel(val: number): string { if (val <= 2) return "Calm"; if (val <= 4) return "Mild"; if (val <= 6) return "Moderate"; if (val <= 8) return "High"; return "Extreme"; }
function getStressEmoji(val: number): string { if (val <= 2) return "\ud83e\uddd8"; if (val <= 4) return "\ud83d\ude0c"; if (val <= 6) return "\ud83d\ude24"; if (val <= 8) return "\ud83d\udd25"; return "\ud83c\udf0b"; }
function getStressColor(val: number): string { if (val <= 2) return "#34d399"; if (val <= 4) return "#38bdf8"; if (val <= 6) return "#fbbf24"; if (val <= 8) return "#fb7185"; return "#ef4444"; }

export default function StressSlider({ value, onChange }: Props) {
  const pct = ((value - 1) / 9) * 100;
  const color = getStressColor(value);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }} className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">Stress Level</h3>
      <div className="glass-card p-4 glow-rose">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-rose/20 to-orange-400/20 flex items-center justify-center backdrop-blur-sm"><Flame className="w-4 h-4 text-accent-rose" /></div>
            <span className="text-sm font-semibold text-text-primary">Stress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.span key={`emoji-${value}`} initial={{ rotate: -15, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} className="text-xl">{getStressEmoji(value)}</motion.span>
            <motion.span key={`val-${value}`} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg font-bold text-text-primary tabular-nums">{value}</motion.span>
            <span className="text-xs text-text-muted">/10</span>
          </div>
        </div>
        <div className="relative">
          <input type="range" min={1} max={10} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full cursor-pointer" style={{ background: `linear-gradient(to right, #34d399 0%, ${color} ${pct}%, var(--slider-track) ${pct}%)` }} />
          <div className="absolute top-0 left-0 h-1.5 rounded-full pointer-events-none transition-all duration-200" style={{ width: `${pct}%`, boxShadow: `0 0 12px ${color}50, 0 0 4px ${color}30`, minWidth: '2px' }} />
        </div>
        <div className="flex justify-between mt-3 items-center">
          <span className="text-[10px] text-accent-green font-medium">Calm</span>
          <motion.span key={value} initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm" style={{ color, backgroundColor: `${color}12`, borderColor: `${color}25`, boxShadow: `0 0 16px ${color}15` }}>{getStressLabel(value)}</motion.span>
          <span className="text-[10px] text-accent-rose font-medium">Extreme</span>
        </div>
      </div>
    </motion.div>
  );
}
