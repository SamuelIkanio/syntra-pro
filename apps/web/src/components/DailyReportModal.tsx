"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { DailyReport } from "@/lib/api";

interface Props {
  report: DailyReport;
  onClose: () => void;
}

function severityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="w-4 h-4 text-accent-rose" />;
    case "warning":
      return <AlertCircle className="w-4 h-4 text-accent-amber" />;
    default:
      return <Info className="w-4 h-4 text-accent-sky" />;
  }
}

function severityBorder(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-accent-rose/20";
    case "warning":
      return "border-accent-amber/20";
    default:
      return "border-accent-sky/20";
  }
}

export default function DailyReportModal({ report, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        key="report-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        data-testid="daily-report-modal"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(24px) saturate(1.4)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            boxShadow:
              "0 0 60px rgba(129, 140, 248, 0.12), 0 25px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(167, 139, 250, 0.2))",
                  boxShadow: "0 0 16px rgba(129, 140, 248, 0.15)",
                }}
              >
                <FileText className="w-5 h-5 text-accent-indigo" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  Daily Report
                </h2>
                <span className="text-[10px] text-text-muted">{report.date}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              aria-label="Close report"
            >
              <X className="w-4 h-4 text-text-muted" />
            </motion.button>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Summary */}
            <div className="glass-card p-4" data-testid="report-summary">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Summary
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {report.summary}
              </p>
            </div>

            {/* Triggered Insights */}
            {report.triggered_insights.length > 0 && (
              <div data-testid="report-insights">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Triggered Insights
                </h3>
                <div className="space-y-2">
                  {report.triggered_insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.08 }}
                      className={`glass-card p-3 border-l-2 ${severityBorder(insight.severity)}`}
                      data-testid={`report-insight-${idx}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex-shrink-0">
                          {severityIcon(insight.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                            {insight.category}
                          </span>
                          <p className="text-sm text-text-secondary leading-relaxed mt-0.5">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Tips */}
            {report.personalized_tips.length > 0 && (
              <div data-testid="report-tips">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-violet" /> Personalized Tips
                </h3>
                <div className="space-y-2">
                  {report.personalized_tips.map((tip, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.15 + idx * 0.08 }}
                      className="glass-card p-3 flex items-start gap-2.5"
                      data-testid={`report-tip-${idx}`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: "linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(129, 140, 248, 0.15))",
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-violet" />
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {tip}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Dismiss Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-accent-indigo to-accent-violet shadow-lg shadow-accent-indigo/20 transition-all"
              data-testid="report-dismiss"
            >
              Got It
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
