"use client";

import { Droplets, Moon, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  sleepHours: number; hydrationMl: number; exerciseMinutes: number;
  onSleepChange: (v: number) => void; onHydrationChange: (v: number) => void; onExerciseChange: (v: number) => void;
}

function MetricCard({ icon: Icon, label, value, unit, color, glowColor, glowClass, min, max, step, gradientFrom, gradientTo, onChange, delay }: {
  icon: React.ElementType; label: string; value: number; unit: string; color: string; glowColor: string; glowClass: string;
  min: number; max: number; step: number; gradientFrom: string; gradientTo: string; onChange: (v: number) => void; delay: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay }} whileHover={{ scale: 1.02 }} className={`glass-card p-3 ${glowClass} flex flex-col items-center gap-2`}>
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`} style={{ boxShadow: `0 0 16px ${glowColor}` }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[11px] text-text-muted font-medium">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <motion.span key={value} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-lg font-bold text-text-primary tabular-nums">{value}</motion.span>
        <span className="text-[10px] text-text-muted">{unit}</span>
      </div>
      <div className="w-full relative">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1 rounded-full cursor-pointer" style={{ background: `linear-gradient(to right, ${gradientFrom} 0%, ${gradientTo} ${pct}%, var(--slider-track) ${pct}%)` }} />
      </div>
    </motion.div>
  );
}

export default function WellnessMetrics({ sleepHours, hydrationMl, exerciseMinutes, onSleepChange, onHydrationChange, onExerciseChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">Wellness Metrics</h3>
      <div className="grid grid-cols-3 gap-2.5">
        <MetricCard icon={Moon} label="Sleep" value={sleepHours} unit="hrs" color="bg-gradient-to-br from-indigo-500/40 to-violet-500/40" glowColor="rgba(129, 140, 248, 0.2)" glowClass="glow-indigo" min={0} max={12} step={0.5} gradientFrom="#818cf8" gradientTo="#a78bfa" onChange={onSleepChange} delay={0.6} />
        <MetricCard icon={Droplets} label="Water" value={hydrationMl} unit="ml" color="bg-gradient-to-br from-sky-500/40 to-cyan-500/40" glowColor="rgba(56, 189, 248, 0.2)" glowClass="" min={0} max={4000} step={100} gradientFrom="#38bdf8" gradientTo="#22d3ee" onChange={onHydrationChange} delay={0.65} />
        <MetricCard icon={Dumbbell} label="Exercise" value={exerciseMinutes} unit="min" color="bg-gradient-to-br from-green-500/40 to-emerald-500/40" glowColor="rgba(52, 211, 153, 0.2)" glowClass="glow-green" min={0} max={180} step={5} gradientFrom="#34d399" gradientTo="#10b981" onChange={onExerciseChange} delay={0.7} />
      </div>
    </div>
  );
}
