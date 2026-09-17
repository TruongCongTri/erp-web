// components/ui/NotificationBell.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Bell, CheckCheck } from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/lib/store/notificationsApiSlice";
import {
  getLocaleFromPathname,
  notificationDetailHref,
  notificationsHref,
} from "@/lib/notificationLinks";

export function NotificationBell() {
  // This automatically fetches history AND opens the WebSocket connection
  const { data: notifRes, isLoading } = useGetNotificationsQuery();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [isOpen, setIsOpen] = useState(false);

  const notifications = notifRes?.data || [];

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Bấm vào 1 thông báo: đánh dấu đã đọc rồi mở trang Thông báo kèm chi tiết
  const handleOpenNotif = (id: string, isRead: boolean) => {
    setIsOpen(false);
    if (!isRead) markAsRead(id);
    router.push(notificationDetailHref(id, locale));
  };

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
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
      <div
        className={`absolute right-0 mt-2 w-80 bg-card border border-border shadow-lg rounded-xl transition-all z-50 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="p-3 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-bold text-foreground">Thông báo</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck size={12} /> Đánh dấu đã xem tất cả
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
              <button
                type="button"
                key={notif.id}
                onClick={() => handleOpenNotif(notif.id, notif.isRead)}
                className={`w-full p-3 rounded-lg text-left transition-colors cursor-pointer border-0 ${
                  notif.isRead
                    ? "opacity-60 bg-transparent hover:bg-muted/50"
                    : "bg-primary/5 hover:bg-primary/10"
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
              </button>
            ))
          )}
        </div>

        {/* Link xuống trang Thông báo đầy đủ */}
        <div className="border-t border-border">
          <Link
            href={notificationsHref(locale)}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-primary hover:underline"
          >
            Xem tất cả thông báo
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
