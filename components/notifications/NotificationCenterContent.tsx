"use client";
import React, { useState, useMemo } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Search,
  Check,
  Trash2,
  ChevronRight,
  Megaphone,
  Wrench,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type NotifCategory = "approval" | "hr" | "system" | "alert" | "announcement";
type NotifPriority = "high" | "medium" | "low";

interface Notification {
  id: string;
  category: NotifCategory;
  priority: NotifPriority;
  title: string;
  body: string;
  time: string;
  timestamp: number;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
  sender?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialNotifications: Notification[] = [
  {
    id: "n-001",
    category: "approval",
    priority: "high",
    read: false,
    title: "Yêu cầu phê duyệt mới",
    body: "Nguyễn Văn An đã nộp đơn xin nghỉ phép 3 ngày (02/09 – 04/09/2026). Cần phê duyệt trước 01/09.",
    time: "5 phút trước",
    timestamp: Date.now() - 5 * 60 * 1000,
    actionLabel: "Xem yêu cầu",
    actionHref: "/vi/hr/approval-center",
    sender: "Hệ thống Phê duyệt",
  },
  {
    id: "n-002",
    category: "hr",
    priority: "high",
    read: false,
    title: "3 ứng viên mới đang chờ xét duyệt",
    body: "Có 3 ứng viên mới vừa nộp hồ sơ cho vị trí Kỹ sư kết cấu cao cấp. Vui lòng xem xét và phân loại.",
    time: "1 giờ trước",
    timestamp: Date.now() - 60 * 60 * 1000,
    actionLabel: "Xem ATS",
    actionHref: "/vi/hr/ats",
    sender: "Module Tuyển dụng",
  },
  {
    id: "n-003",
    category: "approval",
    priority: "high",
    read: false,
    title: "Phê duyệt chi phí #PO-2026-089 cần xử lý",
    body: "Đề xuất chi phí đào tạo BIM Q3/2026 trị giá ₫45,000,000 đang chờ phê duyệt. Hạn: 05/09/2026.",
    time: "2 giờ trước",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    actionLabel: "Phê duyệt ngay",
    actionHref: "/vi/hr/approval-center",
    sender: "Phòng Kế toán",
  },
  {
    id: "n-004",
    category: "hr",
    priority: "medium",
    read: false,
    title: "Phỏng vấn được lên lịch",
    body: "Vòng phỏng vấn kỹ thuật với ứng viên Trần Thị Lan đã được lên lịch vào 14:00 ngày 02/09/2026.",
    time: "3 giờ trước",
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    actionLabel: "Xem lịch",
    actionHref: "/vi/hr/interview-tracker",
    sender: "Module PV & Onboarding",
  },
  {
    id: "n-005",
    category: "announcement",
    priority: "medium",
    read: false,
    title: "Báo cáo lương tháng 8 đã sẵn sàng",
    body: "Bảng lương tháng 8/2026 đã được kế toán xác nhận và sẵn sàng để xem xét. Tổng quỹ lương: ₫1,240,000,000.",
    time: "Hôm qua, 16:30",
    timestamp: Date.now() - 20 * 60 * 60 * 1000,
    sender: "Phòng Kế toán",
  },
  {
    id: "n-006",
    category: "system",
    priority: "low",
    read: true,
    title: "Cập nhật hệ thống thành công",
    body: "ConstructERP đã được cập nhật lên phiên bản 2.4.1. Các tính năng mới: Notification Center, Audit Log Viewer.",
    time: "Hôm qua, 08:00",
    timestamp: Date.now() - 28 * 60 * 60 * 1000,
    sender: "Hệ thống",
  },
  {
    id: "n-007",
    category: "alert",
    priority: "high",
    read: true,
    title: "Cảnh báo: Hợp đồng sắp hết hạn",
    body: "Hợp đồng lao động của 2 nhân viên (Hoàng Long Phước, Vũ Thanh Liêm) sẽ hết hạn trong 30 ngày tới.",
    time: "2 ngày trước",
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    actionLabel: "Xem nhân viên",
    actionHref: "/vi/hr/employee-management",
    sender: "Module Nhân sự",
  },
  {
    id: "n-008",
    category: "hr",
    priority: "medium",
    read: true,
    title: "Onboarding hoàn tất: Lê Minh Khoa",
    body: "Nhân viên mới Lê Minh Khoa đã hoàn thành tất cả các bước onboarding. Tài khoản hệ thống đã được kích hoạt.",
    time: "3 ngày trước",
    timestamp: Date.now() - 72 * 60 * 60 * 1000,
    sender: "Module PV & Onboarding",
  },
  {
    id: "n-009",
    category: "announcement",
    priority: "low",
    read: true,
    title: "Thông báo nghỉ lễ Quốc khánh 2/9",
    body: "Công ty nghỉ lễ Quốc khánh từ 01/09 đến 03/09/2026. Các yêu cầu khẩn cấp liên hệ trực tiếp quản lý.",
    time: "4 ngày trước",
    timestamp: Date.now() - 96 * 60 * 60 * 1000,
    sender: "Ban Giám đốc",
  },
  {
    id: "n-010",
    category: "system",
    priority: "low",
    read: true,
    title: "Sao lưu dữ liệu định kỳ hoàn tất",
    body: "Quá trình sao lưu dữ liệu hàng tuần đã hoàn tất thành công. Dữ liệu được lưu trữ an toàn trên cloud.",
    time: "5 ngày trước",
    timestamp: Date.now() - 120 * 60 * 60 * 1000,
    sender: "Hệ thống IT",
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const categoryConfig: Record<
  NotifCategory,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  approval: {
    label: "Phê duyệt",
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: <CheckCircle size={14} />,
  },
  hr: {
    label: "Nhân sự",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: <UserCheck size={14} />,
  },
  system: {
    label: "Hệ thống",
    color: "text-slate-600",
    bg: "bg-slate-100",
    icon: <Wrench size={14} />,
  },
  alert: {
    label: "Cảnh báo",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: <AlertTriangle size={14} />,
  },
  announcement: {
    label: "Thông báo",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: <Megaphone size={14} />,
  },
};

const priorityDot: Record<NotifPriority, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-slate-300",
};

// ─── Notification Row ─────────────────────────────────────────────────────────
function NotifRow({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cat = categoryConfig[notif.category];
  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3.5 border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer ${!notif.read ? "bg-accent/5" : ""}`}
      onClick={() => onRead(notif.id)}
    >
      {/* Category icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cat.bg}`}
      >
        <span className={cat.color}>{cat.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}
            >
              {cat.label}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[notif.priority]}`}
            />
            {!notif.read && (
              <span className="text-[10px] font-bold text-accent">MỚI</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
            {notif.time}
          </span>
        </div>
        <p
          className={`text-sm mt-1 leading-snug ${!notif.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}
        >
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {notif.body}
        </p>
        <div className="flex items-center gap-3 mt-2">
          {notif.sender && (
            <span className="text-[10px] text-muted-foreground">
              Từ: {notif.sender}
            </span>
          )}
          {notif.actionLabel && notif.actionHref && (
            <a
              href={notif.actionHref}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              {notif.actionLabel} <ChevronRight size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notif.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-all flex-shrink-0 mt-0.5"
        title="Xóa thông báo"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotificationCenterContent({
  locale,
}: {
  locale: string;
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [activeCategory, setActiveCategory] = useState<"all" | NotifCategory>(
    "all",
  );
  const [activeRead, setActiveRead] = useState<"all" | "unread" | "read">(
    "all",
  );
  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    let result = notifications;
    if (activeCategory !== "all")
      result = result.filter((n) => n.category === activeCategory);
    if (activeRead === "unread") result = result.filter((n) => !n.read);
    if (activeRead === "read") result = result.filter((n) => n.read);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, activeCategory, activeRead, search]);

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const categories: Array<{
    value: "all" | NotifCategory;
    label: string;
    count: number;
  }> = [
    { value: "all", label: "Tất cả", count: notifications.length },
    {
      value: "approval",
      label: "Phê duyệt",
      count: notifications.filter((n) => n.category === "approval").length,
    },
    {
      value: "hr",
      label: "Nhân sự",
      count: notifications.filter((n) => n.category === "hr").length,
    },
    {
      value: "alert",
      label: "Cảnh báo",
      count: notifications.filter((n) => n.category === "alert").length,
    },
    {
      value: "announcement",
      label: "Thông báo",
      count: notifications.filter((n) => n.category === "announcement").length,
    },
    {
      value: "system",
      label: "Hệ thống",
      count: notifications.filter((n) => n.category === "system").length,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                Trung tâm Thông báo
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý tất cả thông báo và cảnh báo hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg bg-card hover:bg-muted transition-colors"
              >
                <Check size={13} /> Đánh dấu tất cả đã đọc
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <Trash2 size={13} /> Xóa đã đọc
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            {
              label: "Tổng thông báo",
              value: notifications.length,
              color: "text-foreground",
              bg: "bg-muted/50",
            },
            {
              label: "Chưa đọc",
              value: unreadCount,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Phê duyệt chờ",
              value: notifications.filter(
                (n) => n.category === "approval" && !n.read,
              ).length,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Cảnh báo",
              value: notifications.filter((n) => n.category === "alert").length,
              color: "text-red-700",
              bg: "bg-red-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl px-4 py-3 ${stat.bg} border border-border/50`}
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-card/50 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm thông báo..."
            className="input-base pl-8 text-xs w-full"
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat.label}
              {cat.count > 0 && (
                <span
                  className={`ml-1.5 text-[10px] ${activeCategory === cat.value ? "text-white/70" : "text-muted-foreground"}`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Read filter */}
        <div className="flex items-center gap-1 ml-auto">
          {(["all", "unread", "read"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveRead(v)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeRead === v
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {v === "all" ? "Tất cả" : v === "unread" ? "Chưa đọc" : "Đã đọc"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Không có thông báo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Không tìm thấy thông báo phù hợp với bộ lọc
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
            <NotifRow
              key={notif.id}
              notif={notif}
              onRead={markRead}
              onDelete={deleteNotif}
            />
          ))
        )}
      </div>
    </div>
  );
}
