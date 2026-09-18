/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type {
  ColumnDef,
  StockFeatures,
  PaginationState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  CheckCircle2,
  Trash2,
  MailOpen,
  Bell,
  ShieldAlert,
  Info,
  RefreshCw,
  ExternalLink,
  Siren,
  Megaphone,
  CheckSquare,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Bot,
  Webhook,
  User,
  Clock,
  CheckCircle,
  XCircle,
  CalendarIcon,
  X,
  Star,
  Users,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";

// Shadcn UI Imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import { DetailLayout } from "@/components/layouts/DetailLayout";
import { DetailDrawer } from "@/components/layouts/DetailDrawer";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ─── RTK QUERY HOOKS ────────────────────────────────────────────────────────
import {
  useGetNotificationsListQuery,
  useGetNotificationEnumsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  AppNotification,
} from "@/lib/store/notificationsApiSlice";
import {
  getLocaleFromPathname,
  resolveNotificationActionHref,
} from "@/lib/notificationLinks";

// ─── DYNAMIC UI CONFIGS BASED ON ENUMS ───────────────────────────────────────
const CATEGORY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  TASK: { label: "Công việc", className: "badge-success", icon: CheckSquare },
  APPROVAL: {
    label: "Phê duyệt",
    className: "badge-warning",
    icon: ShieldAlert,
  },
  SYSTEM: { label: "Hệ thống", className: "badge-info", icon: Info },
  ALERT: {
    label: "Cảnh báo",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: Siren,
  },
  ANNOUNCEMENT: {
    label: "Thông báo chung",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Megaphone,
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  LOW: {
    label: "Thấp",
    className: "text-gray-500 bg-gray-100",
    icon: ArrowDown,
  },
  NORMAL: {
    label: "Bình thường",
    className: "text-blue-600 bg-blue-50",
    icon: Minus,
  },
  HIGH: {
    label: "Cao",
    className: "text-orange-600 bg-orange-50",
    icon: ArrowUp,
  },
  URGENT: {
    label: "Khẩn cấp",
    className: "text-red-600 bg-red-50",
    icon: AlertTriangle,
  },
};

const ACTION_STATE_CONFIG: Record<
  string,
  { label: string; className: string; icon?: React.ElementType }
> = {
  NONE: {
    label: "Chỉ đọc",
    className: "bg-gray-100 text-gray-500 border-transparent",
  },
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  RESOLVED: {
    label: "Đã giải quyết",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-200 text-slate-600 border-slate-300",
    icon: XCircle,
  },
};

const ACTOR_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  USER: { label: "Người dùng", icon: User },
  SYSTEM_CRON: { label: "Hệ thống (Tự động)", icon: Bot },
  WORKFLOW_ENGINE: { label: "Quy trình (Workflow)", icon: Activity },
  THIRD_PARTY_WEBHOOK: { label: "Ứng dụng thứ 3", icon: Webhook },
};

const CANDIDATE_SCREENING_TASK_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; className: string }
> = {
  CANDIDATE_SHORTLISTED: {
    icon: Star,
    className: "bg-emerald-100 text-emerald-700",
  },
  CANDIDATE_POOLED: {
    icon: Users,
    className: "bg-amber-100 text-amber-700",
  },
  CANDIDATE_SCREENING_REJECTED: {
    icon: XCircle,
    className: "bg-rose-100 text-rose-700",
  },
};

function Badge({
  label,
  config,
}: {
  label?: string;
  config?: { label: string; className: string; icon?: React.ElementType };
}) {
  if (!config) return <span className="badge badge-neutral">{label}</span>;
  const Icon = config.icon;
  return (
    <span
      className={`badge ${config.className} inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5`}
    >
      {Icon && <Icon size={11} />}
      {config.label || label}
    </span>
  );
}

// ─── REUSABLE DETAIL CONTENT PANE (DESKTOP SIDEBAR & MOBILE DRAWER) ─────────
function NotificationDetailPane({
  noti,
  locale,
  onClose,
  onDelete,
}: {
  noti: AppNotification;
  locale: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const catCfg = CATEGORY_CONFIG[noti.category] || CATEGORY_CONFIG.SYSTEM;
  const prioCfg = PRIORITY_CONFIG[noti.priority] || PRIORITY_CONFIG.NORMAL;
  const actorCfg =
    ACTOR_TYPE_CONFIG[noti.actorType] || ACTOR_TYPE_CONFIG.SYSTEM_CRON;
  const ActorIcon = actorCfg.icon;
  const actionHref = resolveNotificationActionHref(noti.actionUrl, locale);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header Pane */}
      <div className="px-5 py-3 border-b border-border/60 relative shrink-0">
        <div
          className={`absolute top-0 left-0 w-full h-1 ${
            prioCfg.className.split(" ")[1] || "bg-primary"
          }`}
        />

        <div className="flex items-center justify-between gap-2 mb-2.5 mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge config={catCfg} />
            <span
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${prioCfg.className}`}
            >
              <prioCfg.icon size={10} /> {prioCfg.label}
            </span>
            {CANDIDATE_SCREENING_TASK_TYPE_CONFIG[noti.taskType] && (
              <span
                className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                  CANDIDATE_SCREENING_TASK_TYPE_CONFIG[noti.taskType].className
                }`}
              >
                {React.createElement(
                  CANDIDATE_SCREENING_TASK_TYPE_CONFIG[noti.taskType].icon,
                  { size: 10 },
                )}
                {noti.taskType}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Đóng chi tiết"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug mb-3">
          {noti.title}
        </h2>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
            <ActorIcon size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {noti.actorSnapshot?.name || actorCfg.label}
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              Tới: Bạn <span className="opacity-50">•</span>{" "}
              {noti.createdAt
                ? new Date(noti.createdAt).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Body Pane */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-5 space-y-5">
        {noti.actionState !== "NONE" && (
          <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Trạng thái xử lý yêu cầu
            </p>
            <Badge
              config={
                ACTION_STATE_CONFIG[noti.actionState] ||
                ACTION_STATE_CONFIG.PENDING
              }
            />
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Nội dung thông báo
          </p>
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-background p-4 rounded-xl border border-border/60 shadow-xs">
            {noti.body}
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
            Thông tin tham chiếu
          </p>

          <div className="grid grid-cols-1 gap-1 text-xs">
            {noti.targetEntityType && (
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">Đối tượng</span>
                <span className="font-semibold text-foreground text-right font-mono">
                  {noti.targetEntityType} #{noti.targetEntityId}
                </span>
              </div>
            )}
            {noti.taskType && (
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">Loại tác vụ</span>
                <span className="font-semibold text-foreground text-right">
                  {noti.taskType}
                </span>
              </div>
            )}
            {noti.departmentId && noti.departmentId !== "GLOBAL" && (
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">Phân luồng</span>
                <span className="font-semibold text-foreground text-right">
                  {noti.departmentId}
                </span>
              </div>
            )}
            {noti.deliveryChannels && noti.deliveryChannels.length > 0 && (
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">Kênh nhận</span>
                <span className="font-semibold text-foreground text-right">
                  {noti.deliveryChannels.join(", ")}
                </span>
              </div>
            )}
            {noti.readAt && (
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">Đã xem lúc</span>
                <span className="font-semibold text-foreground text-right tabular-nums">
                  {new Date(noti.readAt).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Pane */}
      <div className="px-4 py-3 border-t border-border bg-card shrink-0 flex items-center justify-between gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <ActionButton
          iconOnly
          variant="ghost"
          tooltip="Xóa thông báo"
          className="!w-9 !h-9 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0 cursor-pointer"
          requireConfirm
          confirmTitle="Xóa thông báo?"
          confirmLabel="Xóa"
          onAction={() => onDelete(noti.id)}
        >
          <Trash2 size={16} />
        </ActionButton>

        {actionHref && (
          <Link href={actionHref} className="flex-1 min-w-0">
            <button className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg shadow-sm font-semibold cursor-pointer">
              <span className="truncate">Hành động / Xem chi tiết</span>
              <ExternalLink size={14} className="shrink-0" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Table-Row Styled Mobile Item ────────────────────────────────────────────
function MobileNotificationRow({
  noti,
  locale,
  onQuickView,
  onMarkRead,
}: {
  noti: AppNotification;
  locale: string;
  onQuickView: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
}) {
  const router = useRouter();
  const actionHref = resolveNotificationActionHref(noti.actionUrl, locale);
  const catCfg = CATEGORY_CONFIG[noti.category] || CATEGORY_CONFIG.SYSTEM;
  const prioCfg = PRIORITY_CONFIG[noti.priority] || PRIORITY_CONFIG.NORMAL;
  const isUnread = !noti.isRead;

  const handleRowClick = () => {
    if (isUnread) {
      onMarkRead(noti.id);
    }
    if (actionHref) {
      if (actionHref.startsWith("http://") || actionHref.startsWith("https://")) {
        window.open(actionHref, "_blank");
      } else {
        router.push(actionHref);
      }
    } else {
      onQuickView(noti);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center justify-between py-2.5 px-3 border-b border-border/60 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer group text-xs select-none ${
        isUnread ? "bg-primary/[0.02]" : ""
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0 pr-2 flex-1">
        {/* Unread dot indicator */}
        <div className="pt-1.5 shrink-0">
          {isUnread ? (
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-transparent" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span
              className={`flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${prioCfg.className}`}
            >
              <prioCfg.icon size={9} /> {prioCfg.label}
            </span>
            <span
              className={`badge ${catCfg.className} text-[9px] px-1.5 py-0.2`}
            >
              {catCfg.label}
            </span>
            {noti.taskType && (
              <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1 rounded">
                {noti.taskType}
              </span>
            )}
          </div>

          <p
            className={`text-xs truncate leading-snug ${
              isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"
            }`}
          >
            {noti.title}
          </p>

          <p className="text-[10px] text-muted-foreground truncate mt-0.5 max-w-[95%]">
            {noti.body}
          </p>

          <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono mt-1">
            <span>{noti.actorSnapshot?.name || "Hệ thống"}</span>
            <span>•</span>
            <span>
              {noti.createdAt
                ? new Date(noti.createdAt).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Row Quick Action Buttons */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onQuickView(noti)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Xem chi tiết"
        >
          <Eye size={15} />
        </button>

        {actionHref && (
          <button
            type="button"
            onClick={handleRowClick}
            className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            title="Đến trang xử lý"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function NotificationsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);

  // 1. Fetch Enums
  const { data: enumsRes } = useGetNotificationEnumsQuery();
  const enums = enumsRes?.data;

  // 2. Filter & Navigation States
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || [],
  );
  const [priorityFilter, setPriorityFilter] = useState<string[]>(
    searchParams.get("priority")?.split(",").filter(Boolean) || [],
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [actionStateFilter, setActionStateFilter] = useState<string[]>(
    searchParams.get("actionState")?.split(",").filter(Boolean) || [],
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate")!)
      : undefined,
    to: searchParams.get("toDate")
      ? new Date(searchParams.get("toDate")!)
      : undefined,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
    pageSize: parseInt(searchParams.get("limit") || "20", 10),
  });

  const idFromUrl = searchParams.get("id");
  const [selectedNoti, setSelectedNoti] = useState<AppNotification | null>(
    null,
  );
  const [isRightCollapsed, setIsRightCollapsed] = useState(!idFromUrl);
  const [pendingNotiId, setPendingNotiId] = useState<string | null>(idFromUrl);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Backend query params
  let isReadParam: boolean | undefined = undefined;
  if (statusFilter.length === 1) {
    isReadParam = statusFilter[0] === "READ";
  }

  const {
    data: listRes,
    isFetching,
    refetch,
  } = useGetNotificationsListQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    category: categoryFilter.length ? categoryFilter.join(",") : undefined,
    priority: priorityFilter.length ? priorityFilter.join(",") : undefined,
    actionState: actionStateFilter.length
      ? actionStateFilter.join(",")
      : undefined,
    isRead: isReadParam,
    fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const fetchedList = listRes?.data || [];
  const totalRows = listRes?.meta?.pagination?.total || 0;
  const pageCount = listRes?.meta?.pagination?.total_page || 1;
  const unreadCount = fetchedList.filter((n) => !n.isRead).length;

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();

  const handleSelectNoti = async (noti: AppNotification) => {
    setSelectedNoti(noti);
    setIsRightCollapsed(false);

    if (!noti.isRead) {
      try {
        await markAsRead(noti.id).unwrap();
      } catch {}
    }
  };

  const handleCloseDetail = () => {
    setIsRightCollapsed(true);
    setSelectedNoti(null);
  };

  const handledUrlIdRef = useRef<string | null>(idFromUrl);
  useEffect(() => {
    if (idFromUrl === handledUrlIdRef.current) return;
    handledUrlIdRef.current = idFromUrl;
    if (idFromUrl) setPendingNotiId(idFromUrl);
  }, [idFromUrl]);

  useEffect(() => {
    if (!pendingNotiId) return;

    const noti =
      selectedNoti?.id === pendingNotiId
        ? selectedNoti
        : fetchedList.find((n) => n.id === pendingNotiId);

    if (noti) {
      handleSelectNoti(noti);
      setPendingNotiId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingNotiId, fetchedList, selectedNoti]);

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (globalFilter) params.set("q", globalFilter);
    if (categoryFilter.length) params.set("category", categoryFilter.join(","));
    if (priorityFilter.length) params.set("priority", priorityFilter.join(","));
    if (statusFilter.length) params.set("status", statusFilter.join(","));
    if (actionStateFilter.length)
      params.set("actionState", actionStateFilter.join(","));
    if (dateRange?.from) params.set("fromDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("toDate", dateRange.to.toISOString());

    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 20)
      params.set("limit", pagination.pageSize.toString());

    if (selectedNoti && !isRightCollapsed) {
      params.set("id", selectedNoti.id);
    } else if (pendingNotiId) {
      params.set("id", pendingNotiId);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    globalFilter,
    categoryFilter,
    priorityFilter,
    statusFilter,
    actionStateFilter,
    dateRange,
    pagination,
    selectedNoti,
    pendingNotiId,
    isRightCollapsed,
    pathname,
    router,
  ]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead().unwrap();
      gooeyToast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      gooeyToast.error("Lỗi khi xử lý");
    }
  };

  const handleDelete = async (id: string) => {
    gooeyToast.info("Chức năng xóa thông báo đang được cập nhật.");
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setCategoryFilter([]);
    setPriorityFilter([]);
    setStatusFilter([]);
    setActionStateFilter([]);
    setDateRange(undefined);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // ─── COLUMNS ───
  const columns = useMemo<ColumnDef<StockFeatures, AppNotification, any>[]>(
    () => [
      {
        id: "select",
        size: 40,
        header: ({ table }: any) => (
          <TriStateCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: any) => (
          <div onClick={(e) => e.stopPropagation()}>
            <TriStateCheckbox
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "priority",
        size: 70,
        meta: { title: "Ưu tiên" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Ưu tiên
          </span>
        ),
        cell: ({ row }: any) => {
          const priority = (row.original.priority || "NORMAL") as string;
          const config = PRIORITY_CONFIG[priority];
          const Icon = config?.icon || Minus;
          return (
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-md ${
                config?.className || "bg-gray-100 text-gray-500"
              }`}
              title={config?.label}
            >
              <Icon size={14} />
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        size: 380,
        meta: { title: "Nội dung" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Nội dung thông báo</SortHeader>
        ),
        cell: ({ row }: any) => {
          const isUnread = !row.original.isRead;
          const screeningCfg =
            CANDIDATE_SCREENING_TASK_TYPE_CONFIG[row.original.taskType];
          return (
            <div className="flex items-start gap-2.5">
              <div className="pt-1.5 shrink-0 w-2 flex justify-center">
                {isUnread ? (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-transparent" />
                )}
              </div>
              {screeningCfg && (
                <div
                  className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-md shrink-0 ${screeningCfg.className}`}
                >
                  <screeningCfg.icon size={13} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs sm:text-sm truncate ${
                    isUnread
                      ? "font-bold text-foreground"
                      : "font-medium text-foreground/80"
                  }`}
                >
                  {row.original.title}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-[95%]">
                  {row.original.body}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        size: 130,
        meta: { title: "Danh mục" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Danh mục
          </span>
        ),
        cell: ({ row }: any) => {
          const cat = row.original.category || "SYSTEM";
          return (
            <Badge config={CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.SYSTEM} />
          );
        },
      },
      {
        id: "source",
        size: 140,
        meta: { title: "Nguồn" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Nguồn
          </span>
        ),
        cell: ({ row }: any) => {
          const type = row.original.actorType || "SYSTEM_CRON";
          const config =
            ACTOR_TYPE_CONFIG[type] || ACTOR_TYPE_CONFIG.SYSTEM_CRON;
          const name = row.original.actorSnapshot?.name || config.label;
          const Icon = config.icon;
          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <Icon size={12} /> <span className="truncate">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        size: 130,
        meta: { title: "Thời gian" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Thời gian</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as string;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {val
                ? new Date(val).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </span>
          );
        },
      },
    ],
    [],
  );

  const activeFilterCount =
    statusFilter.length +
    categoryFilter.length +
    priorityFilter.length +
    actionStateFilter.length +
    (dateRange?.from ? 1 : 0);

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 h-auto min-h-[30px] text-xs font-medium border rounded transition-colors shadow-none",
              dateRange?.from
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <CalendarIcon size={12} className="opacity-70" />
            <span className={dateRange?.from ? "font-semibold" : "font-medium"}>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM", { locale: vi })} -{" "}
                    {format(dateRange.to, "dd/MM", { locale: vi })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM", { locale: vi })
                )
              ) : (
                "Thời gian"
              )}
            </span>
            {dateRange?.from && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange(undefined);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X size={11} />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            numberOfMonths={2}
            locale={vi}
          />
        </PopoverContent>
      </Popover>

      <FacetFilter
        label="Đọc/Chưa đọc"
        options={[
          { value: "UNREAD", label: "Chưa đọc", count: unreadCount },
          {
            value: "READ",
            label: "Đã đọc",
            count: fetchedList.length - unreadCount,
          },
        ]}
        selected={statusFilter}
        onChange={(v) => handleFilterChange(setStatusFilter, v)}
      />

      {enums?.categories && (
        <FacetFilter
          label="Danh mục"
          options={enums.categories.map((cat) => ({
            value: cat,
            label: CATEGORY_CONFIG[cat]?.label || cat,
            count: 0,
          }))}
          selected={categoryFilter}
          onChange={(v) => handleFilterChange(setCategoryFilter, v)}
        />
      )}

      {enums?.priorities && (
        <FacetFilter
          label="Ưu tiên"
          options={enums.priorities.map((p) => ({
            value: p,
            label: PRIORITY_CONFIG[p]?.label || p,
            count: 0,
          }))}
          selected={priorityFilter}
          onChange={(v) => handleFilterChange(setPriorityFilter, v)}
        />
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="ml-2 text-xs text-red-600 hover:underline cursor-pointer"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── TOP ACTION BAR ── */}
      <div className="shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-foreground">
                Trung tâm Thông báo
              </h1>
              <p className="text-xs text-muted-foreground">
                {totalRows} thông báo <span className="opacity-50">•</span>{" "}
                <span className="font-bold text-primary">
                  {unreadCount} chưa đọc
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ActionButton
              variant="secondary"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium cursor-pointer"
              disabled={unreadCount === 0 || isMarkingAll}
              onAction={handleMarkAll}
              title="Đánh dấu tất cả là đã đọc"
            >
              <CheckCircle2 size={14} className="shrink-0 sm:mr-1.5" />
              <span className="hidden sm:inline">Đánh dấu đã đọc</span>
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium cursor-pointer"
              onAction={async () => {
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                refetch();
              }}
              isLoading={isFetching}
              title="Làm mới"
            >
              <RefreshCw
                size={14}
                className={`shrink-0 ${isFetching ? "animate-spin" : ""} sm:mr-1.5`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── MOBILE LIST VIEW (< md) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden">
        {/* Search & Mobile Filter Bar */}
        <div className="p-3 border-b border-border bg-card flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) =>
                handleFilterChange(setGlobalFilter, e.target.value)
              }
              placeholder="Tìm theo tiêu đề, nội dung..."
              className="input-base pl-9 pr-7 py-1 text-xs w-full h-8"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => handleFilterChange(setGlobalFilter, "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilter(true)}
            className={`h-8 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-xs transition-colors shrink-0 cursor-pointer ${
              activeFilterCount > 0
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
            title="Mở bộ lọc"
          >
            <SlidersHorizontal size={13} />
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white font-mono text-[9px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Table-Row List */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-border/40">
          {fetchedList.length === 0 && !isFetching ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <MailOpen size={32} className="text-muted-foreground/30" />
              <p className="text-xs font-semibold text-muted-foreground">
                Không tìm thấy thông báo nào
              </p>
            </div>
          ) : (
            fetchedList.map((noti) => (
              <MobileNotificationRow
                key={noti.id}
                noti={noti}
                locale={locale}
                onQuickView={handleSelectNoti}
                onMarkRead={(id) => markAsRead(id)}
              />
            ))
          )}
        </div>

        {/* ── DOCKED MOBILE BOTTOM PAGINATION ── */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            {pagination.pageIndex * pagination.pageSize + 1}-
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              totalRows,
            )}{" "}
            / {totalRows}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.pageIndex === 0 || isFetching}
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
              }
              className="p-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-[11px] px-1 font-semibold text-foreground">
              {pagination.pageIndex + 1}/{pageCount || 1}
            </span>
            <button
              type="button"
              disabled={pagination.pageIndex >= pageCount - 1 || isFetching}
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
              }
              className="p-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP INTERFACE (md:) ── */}
      <div className="flex-1 min-h-0 relative hidden md:block">
        <DetailLayout
          rightSidebar={{
            collapsed: isRightCollapsed || !selectedNoti,
            onCollapseChange: setIsRightCollapsed,
            defaultCollapsed: true,
            content: (collapsed) => {
              if (collapsed || !selectedNoti) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 fade-in p-6 text-center">
                    <MailOpen size={48} className="mb-4 stroke-[1.5px]" />
                    <p className="text-sm font-medium">
                      Chọn một thông báo để đọc
                    </p>
                  </div>
                );
              }

              return (
                <NotificationDetailPane
                  noti={selectedNoti}
                  locale={locale}
                  onClose={handleCloseDetail}
                  onDelete={handleDelete}
                />
              );
            },
          }}
        >
          {/* Main Desktop DataTable */}
          <div className="flex-1 min-h-0 flex-col flex bg-background relative">
            <DataTable
              columns={columns}
              data={fetchedList}
              pageCount={pageCount}
              totalRows={totalRows}
              globalFilter={globalFilter}
              onGlobalFilterChange={(v) =>
                handleFilterChange(setGlobalFilter, v)
              }
              pagination={pagination}
              onPaginationChange={setPagination}
              facetFilters={facetFiltersNode}
              enableMultiRowSelection={true}
              isLoading={isFetching}
              skeletonRowCount={8}
              onRowClick={(row) => handleSelectNoti(row.original)}
              emptyMessage={
                isFetching ? "Đang tải dữ liệu..." : "Không có thông báo nào"
              }
              emptyIcon={
                <MailOpen size={32} className="text-muted-foreground/30" />
              }
            />
          </div>
        </DetailLayout>
      </div>

      {/* ── MOBILE DETAIL DRAWER ── */}
      <div className="md:hidden">
        <DetailDrawer
          isOpen={!isRightCollapsed && !!selectedNoti}
          onClose={handleCloseDetail}
          title="Chi tiết thông báo"
          subtitle={
            selectedNoti
              ? CATEGORY_CONFIG[selectedNoti.category]?.label ||
                selectedNoti.category
              : undefined
          }
          icon={<Bell size={16} className="text-primary" />}
        >
          {selectedNoti && (
            <NotificationDetailPane
              noti={selectedNoti}
              locale={locale}
              onClose={handleCloseDetail}
              onDelete={handleDelete}
            />
          )}
        </DetailDrawer>
      </div>

      {/* ── BOTTOM DRAWER FOR MOBILE FILTER ── */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-card rounded-t-2xl border-t border-border p-4 max-h-[82vh] flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Lọc thông báo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs custom-scrollbar">
              {/* Filter: Trạng thái đọc */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Trạng thái đọc
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "UNREAD", label: `Chưa đọc (${unreadCount})` },
                    {
                      value: "READ",
                      label: `Đã đọc (${fetchedList.length - unreadCount})`,
                    },
                  ].map((opt) => {
                    const isSelected = statusFilter.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? statusFilter.filter((v) => v !== opt.value)
                            : [opt.value];
                          handleFilterChange(setStatusFilter, next);
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Danh mục */}
              {enums?.categories && (
                <div>
                  <label className="font-semibold text-foreground mb-2 block">
                    Danh mục
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {enums.categories.map((cat) => {
                      const isSelected = categoryFilter.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? categoryFilter.filter((v) => v !== cat)
                              : [...categoryFilter, cat];
                            handleFilterChange(setCategoryFilter, next);
                          }}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {CATEGORY_CONFIG[cat]?.label || cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter: Ưu tiên */}
              {enums?.priorities && (
                <div>
                  <label className="font-semibold text-foreground mb-2 block">
                    Mức độ ưu tiên
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {enums.priorities.map((p) => {
                      const isSelected = priorityFilter.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            const next = isSelected
                              ? priorityFilter.filter((v) => v !== p)
                              : [p];
                            handleFilterChange(setPriorityFilter, next);
                          }}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {PRIORITY_CONFIG[p]?.label || p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sheet Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-secondary text-xs h-9 px-3 text-red-600 cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="btn-primary text-xs h-9 flex-1 cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}