"use client";

import { Droplets, Moon, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  sleepHours: number;
  hydrationMl: number;
  exerciseMinutes: number;
  onSleepChange: (v: number) => void;
  onHydrationChange: (v: number) => void;
  onExerciseChange: (v: number) => void;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  glowClass,
  min,
  max,
  step,
  onChange,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  color: string;
  glowClass: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`glass-card p-3 ${glowClass} flex flex-col items-center gap-2`}
    >
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[11px] text-text-muted font-medium">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold text-text-primary">{value}</span>
        <span className="text-[10px] text-text-muted">{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgba(129,140,248,0.6) 0%, rgba(167,139,250,0.6) ${((value - min) / (max - min)) * 100}%, var(--slider-track) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </motion.div>
  );
}

export default function WellnessMetrics({
  sleepHours,
  hydrationMl,
  exerciseMinutes,
  onSleepChange,
  onHydrationChange,
  onExerciseChange,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
        Wellness Metrics
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={sleepHours}
          unit="hrs"
          color="from-indigo-500/30 to-violet-500/30"
          glowClass="glow-indigo"
          min={0}
          max={12}
          step={0.5}
          onChange={onSleepChange}
          delay={0.6}
        />
        <MetricCard
          icon={Droplets}
          label="Water"
          value={hydrationMl}
          unit="ml"
          color="from-sky-500/30 to-cyan-500/30"
          glowClass=""
          min={0}
          max={4000}
          step={100}
          onChange={onHydrationChange}
          delay={0.65}
        />
        <MetricCard
          icon={Dumbbell}
          label="Exercise"
          value={exerciseMinutes}
          unit="min"
          color="from-green-500/30 to-emerald-500/30"
          glowClass="glow-green"
          min={0}
          max={180}
          step={5}
          onChange={onExerciseChange}
          delay={0.7}
        />
      </div>
    </div>
  );
}
