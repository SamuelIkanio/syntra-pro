"use client";

import { useState } from "react";
import { Plus, Utensils, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MealEntry } from "@/app/page";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

interface Props { meals: MealEntry[]; onMealsChange: (meals: MealEntry[]) => void; }

function HealthScorePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button key={star} type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => onChange(star)} className="p-0.5">
          <Star className={`w-5 h-5 transition-all duration-200 ${star <= value ? "text-accent-amber fill-accent-amber drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" : "text-text-muted/30"}`} />
        </motion.button>
      ))}
    </div>
  );
}

function MealCard({ meal, onRemove }: { meal: MealEntry; onRemove: () => void }) {
  const mealColors: Record<string, { text: string; border: string; bg: string }> = {
    Breakfast: { text: "text-amber-400", border: "border-amber-400/20", bg: "bg-amber-400/[0.06]" },
    Lunch: { text: "text-green-400", border: "border-green-400/20", bg: "bg-green-400/[0.06]" },
    Dinner: { text: "text-indigo-400", border: "border-indigo-400/20", bg: "bg-indigo-400/[0.06]" },
    Snack: { text: "text-pink-400", border: "border-pink-400/20", bg: "bg-pink-400/[0.06]" },
  };
  const colors = mealColors[meal.type] || { text: "text-text-muted", border: "border-border-glass", bg: "bg-border-glass" };
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
      className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm ${colors.border} ${colors.bg}`}>
      <Utensils className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">{meal.type}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: meal.healthScore }).map((_, i) => (<Star key={i} className="w-3 h-3 text-accent-amber fill-accent-amber" />))}
          </div>
        </div>
        <p className="text-xs text-text-muted truncate">{meal.description}</p>
      </div>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onRemove}
        className="p-1 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent-rose transition-colors"><X className="w-4 h-4" /></motion.button>
    </motion.div>
  );
}

export default function DietLog({ meals, onMealsChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [mealType, setMealType] = useState<string>(MEAL_TYPES[0]);
  const [description, setDescription] = useState("");
  const [healthScore, setHealthScore] = useState(3);
  const avgScore = meals.length > 0 ? (meals.reduce((s, m) => s + m.healthScore, 0) / meals.length).toFixed(1) : "—";

  const handleAdd = () => {
    if (!description.trim()) return;
    onMealsChange([...meals, { type: mealType, description: description.trim(), healthScore }]);
    setDescription(""); setHealthScore(3); setAdding(false);
  };
  const handleRemove = (index: number) => { onMealsChange(meals.filter((_, i) => i !== index)); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Diet Log</h3>
        {meals.length > 0 && (
          <span className="text-xs text-accent-green font-medium px-2 py-0.5 rounded-full bg-accent-green/10 border border-accent-green/20">Avg: {avgScore} ★</span>
        )}
      </div>
      <div className="glass-card glow-green overflow-hidden">
        <AnimatePresence>
          {meals.length > 0 && (
            <div className="p-3 space-y-2">
              {meals.map((meal, i) => (<MealCard key={`${meal.type}-${i}`} meal={meal} onRemove={() => handleRemove(i)} />))}
            </div>
          )}
        </AnimatePresence>
        {!adding ? (
          <motion.button whileHover={{ backgroundColor: "rgba(129, 140, 248, 0.06)" }} onClick={() => setAdding(true)}
            className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-accent-indigo transition-colors ${meals.length > 0 ? "border-t border-white/[0.06]" : ""}`}>
            <Plus className="w-4 h-4" />Add Meal
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className={`p-4 space-y-3 ${meals.length > 0 ? "border-t border-white/[0.06]" : ""}`}>
            <div className="flex gap-2">
              {MEAL_TYPES.map((type) => (
                <motion.button key={type} whileTap={{ scale: 0.95 }} onClick={() => setMealType(type)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                    mealType === type ? "bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-lg shadow-accent-indigo/20" : "bg-white/[0.04] text-text-muted hover:bg-white/[0.08] border border-white/[0.08]"
                  }`}>{type}</motion.button>
              ))}
            </div>
            <input type="text" placeholder="What did you eat?" value={description} onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-full px-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-indigo/30 focus:border-accent-indigo/40 placeholder:text-text-muted/50 text-text-primary backdrop-blur-sm" autoFocus />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Health:</span>
                <HealthScorePicker value={healthScore} onChange={setHealthScore} />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary rounded-lg transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(129, 140, 248, 0.3)" }} whileTap={{ scale: 0.98 }}
                  onClick={handleAdd} disabled={!description.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-accent-indigo to-accent-violet rounded-lg disabled:opacity-30 transition-all">Add</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
