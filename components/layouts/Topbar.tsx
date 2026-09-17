"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Calendar as CalendarIcon,
  Menu,
  ChevronRight,
  CircleQuestionMark,
  Home,
  CheckCheck,
  Briefcase,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GridCalendar } from "@/components/ui/grid-calendar";
import { useLogoutMutation } from "@/lib/store/authApiSlice";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/lib/store/notificationsApiSlice";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { AuthUser } from "@/types/modelsver2";

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  user?: AuthUser | null;
}

const ROUTE_LABELS: Record<string, string> = {
  vi: "Trang chủ",
  en: "Home",
  "under-development": "Đang phát triển",
  "under-developement": "Đang phát triển",
  dashboard: "Bảng tin",
  notifications: "Thông báo",
  tasks: "Công việc",
  meetings: "Lịch họp",
  admin: "Hệ thống",
  "role-permission-matrix": "Phân quyền",
  resources: "Tài nguyên",
  "users-access": "Quyền truy cập",
  "audit-log": "Nhật ký hệ thống",
  hr: "Hành chính Nhân sự",
  "employee-management": "Quản lý nhân viên",
  "profile-management": "Quản lý hồ sơ",
  "leave-request": "Duyệt nghỉ phép",
  "pending-claim": "Yêu cầu truy cập",
  "claim-profile": "Liên kết hồ sơ",
  ats: "Tuyển dụng",
  recruitment: "Tuyển dụng",
  "request-management": "Yêu cầu tuyển dụng",
  "jobs-management": "Tin tuyển dụng",
  "candidate-management": "Quản lý ứng viên",
  finance: "Tài chính Kế toán",
  crm: "Kinh doanh (CRM)",
  contract: "Hợp đồng",
  media: "Truyền thông",
  project: "Quản lý Dự án",
  design: "Thiết kế",
  mep: "Cơ điện (MEP)",
  estimation: "Dự toán",
  construction: "Thi công",
  supply: "Cung ứng",
  asset: "Vật lực",
  document: "Tài liệu (EDMS)",
  report: "Báo cáo (BI)",
  policy: "Chính sách & ISO",
};

const isIdSegment = (segment: string) => {
  return segment.length >= 20 || /^\d+$/.test(segment);
};

const docs = [
  {
    id: "doc-1",
    category: "HR",
    title: "Hướng dẫn duyệt đơn nghỉ phép",
    time: "Cập nhật 2 ngày trước",
  },
  {
    id: "doc-3",
    category: "Admin",
    title: "Cách phân quyền truy cập",
    time: "Cập nhật tháng trước",
  },
];

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const popoverAnimClasses =
  "bg-card text-card-foreground border border-border shadow-xl rounded-lg z-50 duration-200";

export default function Topbar({ onOpenMobileMenu, user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data: notifRes, isLoading: isNotifLoading } = useGetNotificationsQuery(
    undefined,
    { skip: !user }
  );
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = notifRes?.data || [];
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const [entityNames, setEntityNames] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const initTimer = setTimeout(() => setCurrentTime(new Date()), 0);
    const intervalTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  useEffect(() => {
    const paths = pathname.split("/").filter(Boolean);
    paths.forEach((segment, index) => {
      if (isIdSegment(segment) && !entityNames[segment]) {
        const parentResource = paths[index - 1];
        const fetchEntityName = async () => {
          try {
            await new Promise((res) => setTimeout(res, 500));
            let mockName = `Chi tiết ${segment.slice(0, 6)}...`;
            if (parentResource === "employee-management")
              mockName = `Nguyễn Văn ${segment.slice(-3).toUpperCase()}`;
            if (parentResource === "role-permission-matrix")
              mockName = `Vai trò hệ thống`;
            if (parentResource === "project") mockName = `Dự án Landmark 81`;

            setEntityNames((prev) => ({ ...prev, [segment]: mockName }));
          } catch {
            setEntityNames((prev) => ({
              ...prev,
              [segment]: "Không tìm thấy",
            }));
          }
        };
        fetchEntityName();
      }
    });
  }, [pathname, entityNames]);

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];
    let accumulatedPath = "";

    paths.forEach((segment) => {
      accumulatedPath += `/${segment}`;
      if (segment === "vi" || segment === "en") return;

      let label = segment;
      if (ROUTE_LABELS[segment]) {
        label = ROUTE_LABELS[segment];
      } else if (isIdSegment(segment)) {
        label = entityNames[segment] || "Đang tải...";
      } else {
        label =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      }
      breadcrumbs.push({ label, href: accumulatedPath });
    });

    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: "Tổng quan", href: "/vi/dashboard" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      gooeyToast.success("Đăng xuất thành công");
      router.replace("/vi/login");
    } catch {
      router.replace("/vi/login");
    }
  };

  const initials = getInitials(user?.fullName || "User");

  return (
    <header
      className="flex items-center justify-between px-4 bg-primary text-white flex-shrink-0 relative z-20 shadow-md"
      style={{ height: "var(--topbar-height)" }}
    >
      {/* ── LEFT: Navigation & Breadcrumbs ── */}
      <div className="flex items-center min-w-0">
        <div className="flex md:hidden items-center mr-3 pr-3 border-r border-white/20">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-1.5 mr-2 rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white flex-shrink-0"
          >
            <Menu size={20} />
          </button>
          <Link href="/vi/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Home size={16} />
            </div>
            <span className="font-black text-sm tracking-tight text-white hidden sm:block">
              Chính Nam
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center text-sm font-medium text-white/80">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight
                  size={14}
                  className="mx-1.5 text-white/40 flex-shrink-0"
                />
              )}
              <Link
                href={bc.href}
                className={`truncate max-w-[200px] transition-colors ${
                  idx === breadcrumbs.length - 1
                    ? "text-white pointer-events-none"
                    : "hover:text-white"
                }`}
              >
                {bc.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* ── RIGHT: Actions & Profile ── */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Date/Time + Calendar Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="hidden lg:flex items-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white group cursor-pointer bg-transparent border-0"
            >
              {currentTime && (
                <span className="text-xs font-medium mr-1 text-white/70 group-hover:text-white transition-colors">
                  {currentTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <span className="mx-1.5 opacity-50">•</span>
                  {currentTime.toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              )}
              <CalendarIcon size={16} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={`w-auto p-0 border-0 ${popoverAnimClasses}`}
            align="end"
            sideOffset={8}
          >
            <GridCalendar
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          </PopoverContent>
        </Popover>

        {/* Documentation Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-2 rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer bg-transparent border-0"
            >
              <CircleQuestionMark size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={`w-80 p-0 ${popoverAnimClasses}`}
            align="end"
            sideOffset={8}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20 rounded-t-lg">
              <span className="text-sm font-semibold">Tài liệu hướng dẫn</span>
              <Link
                href="/docs"
                className="text-xs text-primary font-medium hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-hide">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-[9px] w-fit font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        d.category === "HR"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30"
                      }`}
                    >
                      {d.category}
                    </span>
                    <p className="text-xs font-medium leading-snug group-hover:text-primary transition-colors">
                      {d.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {d.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-2 rounded-md hover:bg-white/10 transition-colors text-white/80 hover:text-white relative cursor-pointer bg-transparent border-0"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={`w-80 p-0 ${popoverAnimClasses}`}
            align="end"
            sideOffset={8}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/20 rounded-t-lg">
              <span className="text-sm font-semibold">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-xs text-primary font-medium cursor-pointer hover:underline flex items-center gap-1 bg-transparent border-0"
                >
                  <CheckCheck size={12} /> Đánh dấu đã đọc
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-hide p-2 space-y-1">
              {isNotifLoading ? (
                <p className="text-xs text-center p-4 text-muted-foreground">
                  Đang tải...
                </p>
              ) : notifications.length === 0 ? (
                <p className="text-xs text-center p-4 text-muted-foreground">
                  Không có thông báo nào
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      n.isRead
                        ? "opacity-60 hover:bg-muted/50"
                        : "bg-primary/5 cursor-pointer hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          !n.isRead ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-bold leading-snug text-foreground mb-0.5">
                          {n.title}
                        </p>
                        <p className="text-xs leading-snug text-muted-foreground">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                          {new Date(n.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-1.5 py-1 sm:ml-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer bg-transparent border-0"
            >
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold border border-white/10 shadow-sm">
                {initials}
              </div>
              <ChevronDown
                size={14}
                className="text-white/60 hidden sm:block"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={`w-64 p-0 ${popoverAnimClasses}`}
            align="end"
            sideOffset={8}
          >
            <div className="px-4 py-3 border-b border-border bg-muted/20 rounded-t-lg">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.fullName || "Người dùng"}
              </p>
              <p className="text-xs font-medium text-primary mt-0.5 truncate">
                {user?.profile?.jobTitle ||
                  user?.role?.name ||
                  "Chưa thiết lập"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-1">
                {user?.email || "No email"}
              </p>
            </div>
            <div className="py-1">
              <Link
                href="/vi/profile"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                <User size={14} className="text-muted-foreground" /> Hồ sơ cá nhân
              </Link>
              <Link
                href="/vi/claim-profile"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Briefcase size={14} className="text-muted-foreground" /> Yêu cầu cấp quyền
              </Link>
              <Link
                href="/vi/settings"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Settings size={14} className="text-muted-foreground" /> Cài đặt hệ thống
              </Link>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 bg-transparent border-0 cursor-pointer"
                >
                  <LogOut
                    size={14}
                    className={isLoggingOut ? "animate-pulse" : ""}
                  />
                  {isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}