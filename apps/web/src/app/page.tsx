"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle, Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import AuthScreen from "@/components/AuthScreen";
import Header from "@/components/Header";
import QuickLogSummary from "@/components/QuickLogSummary";
import EnergyMoodSliders from "@/components/EnergyMoodSliders";
import SymptomToggleGrid from "@/components/SymptomToggleGrid";
import DietLog from "@/components/DietLog";
import StressSlider from "@/components/StressSlider";
import WellnessMetrics from "@/components/WellnessMetrics";

export interface MealEntry {
  type: string;
  description: string;
  healthScore: number;
}

export interface DailyLogState {
  energy: number;
  mood: number;
  stress: number;
  symptoms: string[];
  meals: MealEntry[];
  sleepHours: number;
  hydrationMl: number;
  exerciseMinutes: number;
  notes: string;
}

const INITIAL_STATE: DailyLogState = {
  energy: 5,
  mood: 5,
  stress: 3,
  symptoms: [],
  meals: [],
  sleepHours: 7,
  hydrationMl: 1500,
  exerciseMinutes: 0,
  notes: "",
};

function DailyLogPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [log, setLog] = useState<DailyLogState>(INITIAL_STATE);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const overallScore = useMemo(() => {
    const energyScore = log.energy;
    const moodScore = log.mood;
    const stressScore = 10 - log.stress;
    const symptomPenalty = Math.min(log.symptoms.length * 0.8, 4);
    const mealBonus =
      log.meals.length > 0
        ? log.meals.reduce((s, m) => s + m.healthScore, 0) / log.meals.length / 2
        : 0;
    const raw = (energyScore + moodScore + stressScore) / 3 - symptomPenalty + mealBonus;
    return Math.max(1, Math.min(10, Math.round(raw * 10) / 10));
  }, [log]);

  const handleSave = async () => {
    if (!token) return;
    setSaveState("saving");
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.saveLogs(token, {
        date: today,
        energy: log.energy,
        mood: log.mood,
        stress: log.stress,
        overallScore,
        notes: log.notes,
        sleepHours: log.sleepHours,
        hydrationMl: log.hydrationMl,
        exerciseMinutes: log.exerciseMinutes,
        symptoms: log.symptoms,
        meals: log.meals.map(m => ({
          type: m.type,
          description: m.description,
          healthScore: m.healthScore,
        })),
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("idle");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary bg-mesh">
        <Loader2 className="w-8 h-8 text-accent-indigo animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 w-full max-w-lg mx-auto px-4 pb-28 pt-4 space-y-5">
        <QuickLogSummary log={log} overallScore={overallScore} />
        <EnergyMoodSliders
          energy={log.energy}
          mood={log.mood}
          onEnergyChange={(v) => setLog((p) => ({ ...p, energy: v }))}
          onMoodChange={(v) => setLog((p) => ({ ...p, mood: v }))}
        />
        <SymptomToggleGrid
          selected={log.symptoms}
          onChange={(symptoms) => setLog((p) => ({ ...p, symptoms }))}
        />
        <DietLog
          meals={log.meals}
          onMealsChange={(meals) => setLog((p) => ({ ...p, meals }))}
        />
        <StressSlider
          value={log.stress}
          onChange={(v) => setLog((p) => ({ ...p, stress: v }))}
        />
        <WellnessMetrics
          sleepHours={log.sleepHours}
          hydrationMl={log.hydrationMl}
          exerciseMinutes={log.exerciseMinutes}
          onSleepChange={(v) => setLog((p) => ({ ...p, sleepHours: v }))}
          onHydrationChange={(v) => setLog((p) => ({ ...p, hydrationMl: v }))}
          onExerciseChange={(v) => setLog((p) => ({ ...p, exerciseMinutes: v }))}
        />

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="space-y-3"
        >
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
            Notes
          </h3>
          <div className="glass-card p-4">
            <textarea
              placeholder="How are you feeling today? Any additional notes..."
              value={log.notes}
              onChange={(e) => setLog((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/40 resize-none focus:outline-none"
            />
          </div>
        </motion.div>
      </div>

      {/* Floating save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent">
        <div className="max-w-lg mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saveState === "saving"}
            className={`w-full py-3.5 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
              saveState === "saved"
                ? "bg-accent-green shadow-accent-green/25"
                : "bg-gradient-to-r from-accent-indigo to-accent-violet shadow-accent-indigo/25 hover:shadow-accent-indigo/40"
            }`}
          >
            {saveState === "saving" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveState === "saved" ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Log Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Daily Log
              </>
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <DailyLogPage />
    </AuthProvider>
  );
}
