"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  BarChart3,
  Brain,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Insight {
  type: string;
  category: string;
  message: string;
  severity?: string;
}

interface Summary {
  totalLogs?: number;
  avgEnergy?: number;
  avgMood?: number;
  avgStress?: number;
  avgSleep?: number;
  avgHydration?: number;
  avgExercise?: number;
  topSymptoms?: string[];
  [key: string]: unknown;
}

function insightIcon(type: string) {
  switch (type) {
    case "positive":
    case "achievement":
      return <CheckCircle2 className="w-4 h-4 text-accent-green" />;
    case "warning":
    case "alert":
      return <AlertCircle className="w-4 h-4 text-accent-amber" />;
    case "negative":
    case "concern":
      return <TrendingDown className="w-4 h-4 text-accent-rose" />;
    case "trend":
      return <TrendingUp className="w-4 h-4 text-accent-sky" />;
    default:
      return <Lightbulb className="w-4 h-4 text-accent-violet" />;
  }
}

function insightBorder(type: string): string {
  switch (type) {
    case "positive":
    case "achievement":
      return "border-accent-green/20";
    case "warning":
    case "alert":
      return "border-accent-amber/20";
    case "negative":
    case "concern":
      return "border-accent-rose/20";
    case "trend":
      return "border-accent-sky/20";
    default:
      return "border-accent-violet/20";
  }
}

function insightGlow(type: string): string {
  switch (type) {
    case "positive":
    case "achievement":
      return "0 0 16px rgba(52,211,153,0.1)";
    case "warning":
    case "alert":
      return "0 0 16px rgba(251,191,36,0.1)";
    case "negative":
    case "concern":
      return "0 0 16px rgba(251,113,133,0.1)";
    default:
      return "0 0 16px rgba(129,140,248,0.08)";
  }
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="glass-card p-3 flex flex-col items-center gap-1"
    >
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="flex items-baseline gap-0.5">
        <span className="text-lg font-bold text-text-primary tabular-nums">
          {value}
        </span>
        <span className="text-[10px] text-text-muted">{unit}</span>
      </div>
      <span className="text-[10px] text-text-muted">{label}</span>
    </motion.div>
  );
}

export default function InsightsPanel() {
  const { token } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generalTips, setGeneralTips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.insights(token);
      setSummary((res.summary as Summary) ?? null);
      setInsights((res.insights as Insight[]) ?? []);
      setGeneralTips((res.summary as Summary & { general_tips?: string[] })?.general_tips ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-6 h-6 text-accent-indigo" />
        </motion.div>
        <span className="text-xs text-text-muted">
          Analyzing your data…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-accent-rose">{error}</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchInsights}
          className="flex items-center gap-1.5 text-xs text-accent-indigo"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="insights-panel">
      {/* Summary Stats */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Overview
            </h3>
            <span className="text-[10px] text-text-muted">
              {summary.totalLogs ?? 0} logs analyzed
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              label="Avg Energy"
              value={summary.avgEnergy?.toFixed(1) ?? "—"}
              unit="/10"
              icon={TrendingUp}
              color="text-accent-amber"
              delay={0.05}
            />
            <StatCard
              label="Avg Mood"
              value={summary.avgMood?.toFixed(1) ?? "—"}
              unit="/10"
              icon={Brain}
              color="text-accent-indigo"
              delay={0.1}
            />
            <StatCard
              label="Avg Stress"
              value={summary.avgStress?.toFixed(1) ?? "—"}
              unit="/10"
              icon={AlertCircle}
              color="text-accent-rose"
              delay={0.15}
            />
          </div>
        </motion.div>
      )}

      {/* Top Symptoms */}
      {summary?.topSymptoms && summary.topSymptoms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-4"
        >
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Frequent Symptoms
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.topSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="text-xs px-2.5 py-1 rounded-full bg-accent-rose/10 text-accent-rose border border-accent-rose/15 capitalize"
              >
                {symptom}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Insights
          </h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchInsights}
            className="text-text-muted hover:text-accent-indigo transition-colors"
            aria-label="Refresh insights"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {insights.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <Lightbulb className="w-8 h-8 text-text-muted/30" />
            <p className="text-sm text-text-muted">No insights yet</p>
            <p className="text-xs text-text-muted/60">
              Log more data to unlock personalized insights
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2.5">
              {insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className={`glass-card p-4 border-l-2 ${insightBorder(
                    insight.type
                  )}`}
                  style={{ boxShadow: insightGlow(insight.type) }}
                  data-testid={`insight-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {insightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                          {insight.category}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Health Tips */}
      {generalTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          data-testid="health-tips-section"
        >
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 px-1 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-violet" /> Health Tips
          </h3>
          <div className="space-y-2">
            {generalTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + idx * 0.07 }}
                className="glass-card p-3.5 flex items-start gap-3"
                style={{ boxShadow: "0 0 16px rgba(167, 139, 250, 0.06)" }}
                data-testid={`health-tip-${idx}`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(129, 140, 248, 0.15))",
                    boxShadow: "0 0 8px rgba(167, 139, 250, 0.1)",
                  }}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-accent-violet" />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
