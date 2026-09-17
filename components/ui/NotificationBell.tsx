// components/ui/NotificationBell.tsx
"use client";

import React, { useMemo } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/lib/store/notificationsApiSlice";

export function NotificationBell() {
  // This automatically fetches history AND opens the WebSocket connection
  const { data: notifRes, isLoading } = useGetNotificationsQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = notifRes?.data || [];

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <div className="relative group cursor-pointer">
      <div className="p-2 rounded-full hover:bg-muted transition-colors">
        <Bell size={20} className="text-muted-foreground" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Basic Dropdown (Add your own Popover component here for better UI) */}
      <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-3 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-bold text-foreground">Thông báo</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck size={12} /> Đánh dấu đã đọc
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <p className="text-xs text-center p-4 text-muted-foreground">
              Đang tải...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-center p-4 text-muted-foreground">
              Không có thông báo nào
            </p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  notif.isRead ? "opacity-60" : "bg-primary/5 cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-bold text-foreground">
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {notif.body}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-2">
                  {new Date(notif.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
