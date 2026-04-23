"use client";

import {
  Battery, Brain, Droplets, Eye, Frown,
  HeartPulse, Moon, ThermometerSun, Wind,
} from "lucide-react";
import { motion } from "framer-motion";

const SYMPTOMS = [
  { id: "fatigue", label: "Fatigue", icon: Battery, activeColor: "text-amber-400", activeBorder: "border-amber-400/30", activeBg: "bg-amber-400/10" },
  { id: "headache", label: "Headache", icon: Brain, activeColor: "text-rose-400", activeBorder: "border-rose-400/30", activeBg: "bg-rose-400/10" },
  { id: "bloating", label: "Bloating", icon: Wind, activeColor: "text-sky-400", activeBorder: "border-sky-400/30", activeBg: "bg-sky-400/10" },
  { id: "nausea", label: "Nausea", icon: Frown, activeColor: "text-green-400", activeBorder: "border-green-400/30", activeBg: "bg-green-400/10" },
  { id: "insomnia", label: "Insomnia", icon: Moon, activeColor: "text-indigo-400", activeBorder: "border-indigo-400/30", activeBg: "bg-indigo-400/10" },
  { id: "anxiety", label: "Anxiety", icon: HeartPulse, activeColor: "text-pink-400", activeBorder: "border-pink-400/30", activeBg: "bg-pink-400/10" },
  { id: "dehydration", label: "Dehydration", icon: Droplets, activeColor: "text-cyan-400", activeBorder: "border-cyan-400/30", activeBg: "bg-cyan-400/10" },
  { id: "eye_strain", label: "Eye Strain", icon: Eye, activeColor: "text-purple-400", activeBorder: "border-purple-400/30", activeBg: "bg-purple-400/10" },
  { id: "fever", label: "Fever", icon: ThermometerSun, activeColor: "text-orange-400", activeBorder: "border-orange-400/30", activeBg: "bg-orange-400/10" },
] as const;

interface Props {
  selected: string[];
  onChange: (symptoms: string[]) => void;
}

export default function SymptomToggleGrid({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Symptoms
        </h3>
        {selected.length > 0 && (
          <span className="text-xs text-accent-rose font-medium px-2 py-0.5 rounded-full bg-accent-rose/10 border border-accent-rose/20">
            {selected.length} active
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SYMPTOMS.map((symptom, i) => {
          const active = selected.includes(symptom.id);
          return (
            <motion.button
              key={symptom.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.4 + i * 0.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggle(symptom.id)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 ${
                active
                  ? `${symptom.activeBg} ${symptom.activeBorder}`
                  : "glass-card"
              }`}
            >
              <symptom.icon
                className={`w-5 h-5 transition-colors ${
                  active ? symptom.activeColor : "text-text-muted"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  active ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {symptom.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
