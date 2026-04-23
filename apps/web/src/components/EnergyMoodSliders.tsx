"use client";

import { Zap, Smile } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  energy: number;
  mood: number;
  onEnergyChange: (v: number) => void;
  onMoodChange: (v: number) => void;
}

function getEnergyEmoji(val: number): string {
  if (val <= 2) return "\ud83d\ude34";
  if (val <= 4) return "\ud83e\udd71";
  if (val <= 6) return "\ud83d\ude0a";
  if (val <= 8) return "\u26a1";
  return "\ud83d\udd25";
}

function getMoodEmoji(val: number): string {
  if (val <= 2) return "\ud83d\ude22";
  if (val <= 4) return "\ud83d\ude10";
  if (val <= 6) return "\ud83d\ude42";
  if (val <= 8) return "\ud83d\ude04";
  return "\ud83e\udd29";
}

function SliderCard({
  icon: Icon,
  label,
  value,
  emoji,
  gradientFrom,
  gradientTo,
  glowClass,
  onChange,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  glowClass: string;
  onChange: (v: number) => void;
  delay: number;
}) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-4 ${glowClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-accent-indigo" />
          </div>
          <span className="text-sm font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{emoji}</span>
          <span className="text-lg font-bold text-text-primary">{value}</span>
          <span className="text-xs text-text-muted">/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${gradientFrom} 0%, ${gradientTo} ${pct}%, var(--slider-track) ${pct}%)`,
          }}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-text-muted">Low</span>
          <span className="text-[10px] text-text-muted">High</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function EnergyMoodSliders({
  energy,
  mood,
  onEnergyChange,
  onMoodChange,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
        Energy & Mood
      </h3>
      <SliderCard
        icon={Zap}
        label="Energy Level"
        value={energy}
        emoji={getEnergyEmoji(energy)}
        gradientFrom="#fbbf24"
        gradientTo="#f59e0b"
        glowClass="glow-amber"
        onChange={onEnergyChange}
        delay={0.2}
      />
      <SliderCard
        icon={Smile}
        label="Mood"
        value={mood}
        emoji={getMoodEmoji(mood)}
        gradientFrom="#818cf8"
        gradientTo="#a78bfa"
        glowClass="glow-indigo"
        onChange={onMoodChange}
        delay={0.3}
      />
    </div>
  );
}
