"use client";

import { motion } from "framer-motion";

const SYMPTOM_OPTIONS = [
  { id: "headache", label: "Headache", emoji: "\ud83e\udd15" },
  { id: "fatigue", label: "Fatigue", emoji: "\ud83d\ude34" },
  { id: "nausea", label: "Nausea", emoji: "\ud83e\udd22" },
  { id: "dizziness", label: "Dizziness", emoji: "\ud83d\ude35" },
  { id: "insomnia", label: "Insomnia", emoji: "\ud83d\ude36\u200d\ud83c\udf2b\ufe0f" },
  { id: "back_pain", label: "Back Pain", emoji: "\ud83e\udeb4" },
  { id: "anxiety", label: "Anxiety", emoji: "\ud83d\ude30" },
  { id: "bloating", label: "Bloating", emoji: "\ud83c\udf88" },
  { id: "joint_pain", label: "Joint Pain", emoji: "\ud83e\uddb4" },
  { id: "brain_fog", label: "Brain Fog", emoji: "\ud83c\udf2b\ufe0f" },
  { id: "chest_tightness", label: "Chest Tight", emoji: "\ud83d\udc94" },
  { id: "eye_strain", label: "Eye Strain", emoji: "\ud83d\udc41\ufe0f" },
];

interface Props {
  selected: string[];
  onToggle: (symptomId: string) => void;
}

export default function SymptomToggleGrid({ selected, onToggle }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="space-y-3"
    >
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
        Symptoms
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {SYMPTOM_OPTIONS.map((symptom, idx) => {
          const isActive = selected.includes(symptom.id);
          return (
            <motion.button
              key={symptom.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.5 + idx * 0.03 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onToggle(symptom.id)}
              className={`relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-all duration-200 border ${
                isActive
                  ? "glass-card border-accent-indigo/40 shadow-lg"
                  : "border-white/5 hover:border-white/10 bg-white/[0.02]"
              }`}
              style={
                isActive
                  ? {
                      background: "rgba(129, 140, 248, 0.08)",
                      boxShadow: "0 0 20px rgba(129,140,248,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }
                  : undefined
              }
              data-testid={`symptom-${symptom.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId={`symptom-check-${symptom.id}`}
                  className="absolute top-1 right-1 w-3 h-3 rounded-full bg-accent-indigo flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
              <span className="text-lg leading-none">{symptom.emoji}</span>
              <span
                className={`text-[10px] font-medium text-center leading-tight transition-colors ${
                  isActive ? "text-accent-indigo" : "text-text-muted"
                }`}
              >
                {symptom.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-text-muted px-1"
        >
          {selected.length} symptom{selected.length > 1 ? "s" : ""} selected
        </motion.p>
      )}
    </motion.div>
  );
}
