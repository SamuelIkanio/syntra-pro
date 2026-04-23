"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Droplets, Lightbulb, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

export interface Notification {
  id: string;
  type: "trend" | "encouragement" | "insight";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const ICON_MAP = {
  trend: { icon: TrendingUp, color: "text-accent-amber", bg: "bg-accent-amber/15", glow: "shadow-accent-amber/20" },
  encouragement: { icon: Droplets, color: "text-accent-green", bg: "bg-accent-green/15", glow: "shadow-accent-green/20" },
  insight: { icon: Lightbulb, color: "text-accent-violet", bg: "bg-accent-violet/15", glow: "shadow-accent-violet/20" },
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "trend", title: "Stress Trend Alert", message: "3-day trend: High stress detected. Consider a break or mindfulness session.", time: "2h ago", read: false },
  { id: "n2", type: "encouragement", title: "Keep It Up! \ud83d\udca7", message: "Samuel, your energy is up! Keep drinking water.", time: "4h ago", read: false },
  { id: "n3", type: "insight", title: "New Insight Detected", message: "New Insight: Gluten seems to trigger your bloating. Review your diet log.", time: "6h ago", read: false },
  { id: "n4", type: "encouragement", title: "Sleep Improvement", message: "Your sleep quality improved by 15% this week. Great job maintaining your routine!", time: "1d ago", read: true },
  { id: "n5", type: "trend", title: "Mood Pattern", message: "Your mood dips on Mondays. Try scheduling something fun to start the week.", time: "2d ago", read: true },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export default function NotificationsPanel({ isOpen, onClose, onMarkAllRead }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllRead();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            data-testid="notifications-backdrop"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm"
            data-testid="notifications-panel"
          >
            <div className="h-full flex flex-col notifications-glass">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shadow-lg shadow-accent-indigo/25">
                    <Sparkles className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Action Points</h2>
                    {unreadCount > 0 && <p className="text-[11px] text-accent-indigo font-medium">{unreadCount} unread</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-medium text-accent-indigo hover:text-accent-violet transition-colors px-2 py-1 rounded-lg hover:bg-accent-indigo/10"
                      data-testid="mark-all-read"
                    >
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl glass-card flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                    data-testid="close-notifications"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-border-glass to-transparent" />

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                {notifications.map((notification, index) => {
                  const config = ICON_MAP[notification.type];
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      onClick={() => markAsRead(notification.id)}
                      className={`relative glass-card p-3.5 cursor-pointer group ${
                        !notification.read ? "border-accent-indigo/20 shadow-md shadow-accent-indigo/5" : "opacity-70"
                      }`}
                      data-testid={`notification-${notification.id}`}
                    >
                      {!notification.read && (
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent-indigo animate-pulse" data-testid="unread-dot" />
                      )}
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 shrink-0 rounded-xl ${config.bg} flex items-center justify-center shadow-md ${config.glow}`}>
                          <Icon className={`w-[18px] h-[18px] ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-text-primary truncate">{notification.title}</h3>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{notification.message}</p>
                          <p className="text-[10px] text-text-muted mt-1.5">{notification.time}</p>
                        </div>
                      </div>
                      {notification.read && (
                        <div className="absolute bottom-3 right-3">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-green/50" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-5 py-4">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border-glass to-transparent mb-3" />
                <div className="flex items-center justify-center gap-2 text-text-muted">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <p className="text-[10px]">Insights are AI-generated. Always consult your healthcare provider.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { DEFAULT_NOTIFICATIONS };
