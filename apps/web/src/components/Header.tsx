"use client";

import { useState } from "react";
import { Activity, Bell, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import NotificationsPanel from "./NotificationsPanel";

export default function Header() {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <>
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="fixed top-0 left-0 right-0 z-50 header-glass">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shadow-lg shadow-accent-indigo/30">
                <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-bg-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight gradient-text leading-tight">SYNTRA</h1>
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/20">Pro</span>
              </div>
              <p className="text-[11px] text-text-muted leading-tight">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && <span className="text-xs text-text-secondary mr-1 hidden min-[380px]:inline font-medium">{user.name.split(" ")[0]}</span>}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => setNotificationsOpen(true)} className="relative w-9 h-9 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-accent-indigo transition-colors" data-testid="bell-button">
              <Bell className="w-[18px] h-[18px]" />
              {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-rose border-2 border-bg-primary" data-testid="unread-indicator" />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-accent-indigo transition-colors">
              <Shield className="w-[18px] h-[18px]" />
            </motion.button>
            {user && <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={logout} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-accent-rose transition-colors" title="Logout"><LogOut className="w-[18px] h-[18px]" /></motion.button>}
          </div>
        </div>
      </motion.header>
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onMarkAllRead={() => setHasUnread(false)} />
    </>
  );
}
