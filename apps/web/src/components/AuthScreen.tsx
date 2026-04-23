"use client";

import { useState } from "react";
import { Activity, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary bg-mesh p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 180 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shadow-2xl shadow-accent-indigo/30"
            style={{ boxShadow: "0 0 40px rgba(129, 140, 248, 0.3), 0 0 80px rgba(129, 140, 248, 0.1)" }}
          >
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text mb-1">SYNTRA Pro</h1>
          <p className="text-sm text-text-muted">Health Intelligence by Triune Dynamic</p>
        </div>

        <div className="glass-card p-6 glow-indigo">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] mb-6 border border-white/[0.06]">
            {(["login", "register"] as const).map((tab) => (
              <motion.button
                key={tab}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setMode(tab); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === tab
                    ? "bg-gradient-to-r from-accent-indigo to-accent-violet text-white shadow-lg shadow-accent-indigo/20"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab === "login" ? "Sign In" : "Register"}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-indigo/30 focus:border-accent-indigo/40 placeholder:text-text-muted/50 text-text-primary backdrop-blur-sm"
                      required={mode === "register"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-indigo/30 focus:border-accent-indigo/40 placeholder:text-text-muted/50 text-text-primary backdrop-blur-sm"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                placeholder={mode === "register" ? "Password (min 8 chars)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-indigo/30 focus:border-accent-indigo/40 placeholder:text-text-muted/50 text-text-primary backdrop-blur-sm"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-3 py-2 rounded-lg backdrop-blur-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(129, 140, 248, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="btn-premium-save w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-gradient-to-r from-accent-indigo to-accent-violet rounded-xl disabled:opacity-50 transition-all shadow-xl shadow-accent-indigo/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-[11px] text-text-muted mt-6">
          &copy; 2026 Triune Dynamic Limited. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
