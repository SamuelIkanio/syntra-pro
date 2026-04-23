"use client";

import { Battery, Brain, Droplets, Eye, Frown, HeartPulse, Moon, ThermometerSun, Wind } from "lucide-react";
import { motion } from "framer-motion";

const SYMPTOMS = [
  { id: "fatigue", label: "Fatigue", icon: Battery, activeColor: "text-amber-400", activeBorder: "border-amber-400/30", activeBg: "bg-amber-400/10", activeGlow: "rgba(251, 191, 36, 0.15)" },
  { id: "headache", label: "Headache", icon: Brain, activeColor: "text-rose-400", activeBorder: "border-rose-400/30", activeBg: "bg-rose-400/10", activeGlow: "rgba(251, 113, 133, 0.15)" },
  { id: "bloating", label: "Bloating", icon: Wind, activeColor: "text-sky-400", activeBorder: "border-sky-400/30", activeBg: "bg-sky-400/10", activeGlow: "rgba(56, 189, 248, 0.15)" },
  { id: "nausea", label: "Nausea", icon: Frown, activeColor: "text-green-400", activeBorder: "border-green-400/30", activeBg: "bg-green-400/10", activeGlow: "rgba(52, 211, 153, 0.15)" },
  { id: "insomnia", label: "Insomnia", icon: Moon, activeColor: "text-indigo-400", activeBorder: "border-indigo-400/30", activeBg: "bg-indigo-400/10", activeGlow: "rgba(129, 140, 248, 0.15)" },
  { id: "anxiety", label: "Anxiety", icon: HeartPulse, activeColor: "text-pink-400", activeBorder: "border-pink-400/30", activeBg: "bg-pink-400/10", activeGlow: "rgba(244, 114, 182, 0.15)" },
  { id: "dehydration", label: "Dehydration", icon: Droplets, activeColor: "text-cyan-400", activeBorder: "border-cyan-400/30", activeBg: "bg-cyan-400/10", activeGlow: "rgba(34, 211, 238, 0.15)" },
  { id: "eye_strain", label: "Eye Strain", icon: Eye, activeColor: "text-purple-400", activeBorder: "border-purple-400/30", activeBg: "bg-purple-400/10", activeGlow: "rgba(192, 132, 252, 0.15)" },
  { id: "fever", label: "Fever", icon: ThermometerSun, activeColor: "text-orange-400", activeBorder: "border-orange-400/30", activeBg: "bg-orange-400/10", activeGlow: "rgba(251, 146, 60, 0.15)" },
] as const;

interface Props { selected: string[]; onChange: (symptoms: string[]) => void; }

export default function SymptomToggleGrid({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Symptoms</h3>
        {selected.length > 0 && (
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-xs text-accent-rose font-medium px-2 py-0.5 rounded-full bg-accent-rose/10 border border-accent-rose/20">
            {selected.length} active
          </motion.span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {SYMPTOMS.map((symptom, i) => {
          const active = selected.includes(symptom.id);
          return (
            <motion.button key={symptom.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.4 + i * 0.04 }} whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.03 }}
              onClick={() => toggle(symptom.id)}
              className={`symptom-tile flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl border transition-all duration-200 backdrop-blur-sm ${
                active ? `${symptom.activeBg} ${symptom.activeBorder}` : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14]"
              }`}
              style={active ? { boxShadow: `0 0 24px ${symptom.activeGlow}, inset 0 1px 0 rgba(255,255,255,0.06)` } : {}}>
              <motion.div animate={active ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }}>
                <symptom.icon className={`w-5 h-5 transition-colors ${active ? symptom.activeColor : "text-text-muted"}`} />
              </motion.div>
              <span className={`text-[11px] font-medium transition-colors ${active ? "text-text-primary" : "text-text-muted"}`}>{symptom.label}</span>
              {active && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                  style={{ color: symptom.activeGlow.replace('0.15', '1') }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
