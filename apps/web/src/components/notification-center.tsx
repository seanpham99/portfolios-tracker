"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  TrendingUp,
  Wallet,
  BarChart3,
  Info,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  useNotifications,
  portfolioStore,
  type Notification,
} from "@/stores/portfolio-store";
import { GlassCard } from "./glass-card";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "price_alert":
      return <TrendingUp className="h-4 w-4" />;
    case "portfolio_change":
      return <Wallet className="h-4 w-4" />;
    case "market_movement":
      return <BarChart3 className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

function getNotificationColor(type: Notification["type"]) {
  switch (type) {
    case "price_alert":
      return "text-emerald-400 bg-emerald-500/10";
    case "portfolio_change":
      return "text-indigo-400 bg-indigo-500/10";
    case "market_movement":
      return "text-amber-400 bg-amber-500/10";
    default:
      return "text-zinc-400 bg-zinc-500/10";
  }
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full z-50 mt-2 w-[380px]"
            >
              <GlassCard className="overflow-hidden" hover={false}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                  <h3 className="font-serif text-lg font-medium text-white">
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() =>
                          portfolioStore.markAllNotificationsRead()
                        }
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                      >
                        <Check className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-zinc-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "flex gap-3 border-b border-white/[0.05] px-4 py-3 transition-colors hover:bg-white/[0.02]",
                          !notification.read && "bg-white/[0.02]",
                        )}
                        onClick={() =>
                          portfolioStore.markNotificationRead(notification.id)
                        }
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            getNotificationColor(notification.type),
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                notification.read
                                  ? "text-zinc-400"
                                  : "text-white",
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] text-zinc-600">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
