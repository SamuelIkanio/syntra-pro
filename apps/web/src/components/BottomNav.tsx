"use client";

import { motion } from "framer-motion";
import { ClipboardList, Clock, Lightbulb } from "lucide-react";

export type NavView = "log" | "timeline" | "insights";

interface Props {
  active: NavView;
  onChange: (view: NavView) => void;
}

const tabs: { id: NavView; label: string; icon: React.ElementType }[] = [
  { id: "log", label: "Log", icon: ClipboardList },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(2, 6, 23, 0.82)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-2xl transition-colors"
              aria-label={tab.label}
              data-testid={`nav-${tab.id}`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "rgba(129, 140, 248, 0.12)",
                    border: "1px solid rgba(129, 140, 248, 0.18)",
                    boxShadow: "0 0 20px rgba(129,140,248,0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-accent-indigo" : "text-text-muted"
                }`}
              />
              <span
                className={`text-[10px] font-semibold relative z-10 transition-colors ${
                  isActive ? "text-accent-indigo" : "text-text-muted"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
