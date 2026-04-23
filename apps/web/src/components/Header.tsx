"use client";

import { Activity, Bell, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, logout } = useAuth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 glass-card rounded-none border-x-0 border-t-0"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shadow-lg shadow-accent-indigo/20">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-bg-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight gradient-text leading-tight">
                SYNTRA
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/20">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-tight">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-xs text-text-secondary mr-1 hidden min-[380px]:inline">
              {user.name.split(" ")[0]}
            </span>
          )}
          <button className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-accent-indigo transition-colors">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <button className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-accent-indigo transition-colors">
            <Shield className="w-[18px] h-[18px]" />
          </button>
          {user && (
            <button
              onClick={logout}
              className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-accent-rose transition-colors"
              title="Logout"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
