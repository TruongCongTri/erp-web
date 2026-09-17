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
  Search,
  X,
  Star,
  Users,
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
  MobileFilterSheet,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import { DetailLayout } from "@/components/layouts/DetailLayout";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { DetailDrawer } from "@/components/layouts/DetailDrawer";

// ─── RTK QUERY HOOKS ────────────────────────────────────────────────────────
import {
  useGetNotificationsListQuery,
  useGetNotificationEnumsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  AppNotification,
} from "@/lib/store/notificationsApiSlice";
import NotificationDrawer from "./NofificationDrawer";
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

// AI screening outcome notifications (ats module) share one visual
// treatment differentiated by tier: green/HIGH, amber/MEDIUM, red/LOW.
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
    <span className={`badge ${config.className}`}>
      {Icon && <Icon size={12} />}
      {config.label || label}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function NotificationsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocaleFromPathname(pathname);

  // 1. Fetch Danh mục (Enums)
  const { data: enumsRes } = useGetNotificationEnumsQuery();
  const enums = enumsRes?.data;

  // 2. Initial States từ URL
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

  // Date Range State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate")!)
      : undefined,
    to: searchParams.get("toDate")
      ? new Date(searchParams.get("toDate")!)
      : undefined,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "20", 10),
  });

  const [selectedNoti, setSelectedNoti] = useState<AppNotification | null>(
    null,
  );
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // ─── XỬ LÝ SERVER-SIDE PARAMS ───
  // Map mảng statusFilter ("UNREAD", "READ") thành biến isRead boolean truyền cho backend
  let isReadParam: boolean | undefined = undefined;
  if (statusFilter.length === 1) {
    isReadParam = statusFilter[0] === "READ";
  }

  // Hook API List
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
  const unreadCount = fetchedList.filter((n) => !n.isRead).length; // Thống kê UI trên trang hiện tại

  // Mutations
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllAsReadMutation();

  // ─── ACTIONS ───
  const handleSelectNoti = async (noti: AppNotification) => {
    setSelectedNoti(noti);
    setIsRightCollapsed(false);
    if (!noti.isRead) {
      try {
        await markAsRead(noti.id).unwrap();
      } catch (err) {}
    }
  };

  // ID đang chờ được mở: lấy từ URL lúc vào trang (F5 / chia sẻ link / bấm từ
  // chuông thông báo). Giữ trong state để effect "SYNC URL" bên dưới không xoá
  // mất `?id=` trong lúc danh sách còn đang tải.
  const idFromUrl = searchParams.get("id");
  const [pendingNotiId, setPendingNotiId] = useState<string | null>(idFromUrl);

  // Chỉ phản ứng khi `id` trên URL thực sự đổi (vd: đang ở trang này rồi bấm 1
  // thông báo trên chuông). Đóng Drawer sẽ xoá `id` khỏi URL nên lần sau bấm lại
  // đúng thông báo đó vẫn mở được.
  const handledUrlIdRef = useRef<string | null>(idFromUrl);
  useEffect(() => {
    if (idFromUrl === handledUrlIdRef.current) return;
    handledUrlIdRef.current = idFromUrl;
    if (idFromUrl) setPendingNotiId(idFromUrl);
  }, [idFromUrl]);

  // Tự động khôi phục (Auto-select) khi danh sách đã có dữ liệu
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

  // ─── SYNC URL ───
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

    // Sync ID lên URL
    if (selectedNoti && !isRightCollapsed) {
      params.set("id", selectedNoti.id);
    } else if (pendingNotiId) {
      // Chưa resolve xong -> giữ nguyên id để không mất deep-link
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

  // ─── ACTIONS ───

  const handleSearchChange = (val: string) => {
    setGlobalFilter(val);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

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

  // ─── LỌC DỮ LIỆU LOCAL (Client-side display filter on the fetched page) ───
  // const filteredData = useMemo(() => {
  //   return fetchedList.filter((n) => {
  //     const matchCategory =
  //       categoryFilter.length === 0 || categoryFilter.includes(n.category);
  //     const matchStatus =
  //       statusFilter.length === 0 ||
  //       statusFilter.includes(n.isRead ? "READ" : "UNREAD");
  //     return matchCategory && matchStatus;
  //   });
  // }, [fetchedList, categoryFilter, statusFilter]);

  // const handleSelectNoti = async (noti: AppNotification) => {
  //   setSelectedNoti(noti);
  //   setIsRightCollapsed(false);
  //   if (!noti.isRead) {
  //     try {
  //       await markAsRead(noti.id).unwrap();
  //     } catch (err) {}
  //   }
  // };


  const clearAllFilters = () => {
    setGlobalFilter("");
    setCategoryFilter([]);
    setPriorityFilter([]);
    setStatusFilter([]);
    setActionStateFilter([]);
    setDateRange(undefined);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // ─── TABLE COLUMNS ───
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
        size: 80,
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
              className={`flex items-center justify-center w-6 h-6 rounded-md ${config?.className || "bg-gray-100 text-gray-500"}`}
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
            <div className="flex items-start gap-3">
              <div className="pt-1.5 flex-shrink-0 w-2 flex justify-center">
                {isUnread ? (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
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
                  className={`text-sm truncate ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}
                >
                  {row.original.title}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[95%]">
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
        accessorKey: "actionState",
        size: 120,
        meta: { title: "Trạng thái xử lý" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Trạng thái xử lý
          </span>
        ),
        cell: ({ row }: any) => {
          const state = row.original.actionState || "NONE";
          if (state === "NONE")
            return <span className="text-[10px] text-muted-foreground">—</span>;
          return (
            <Badge
              config={ACTION_STATE_CONFIG[state] || ACTION_STATE_CONFIG.NONE}
            />
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
              {new Date(val).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        size: 60,
        meta: { title: "" },
        header: () => null,
        cell: ({ row }: any) => (
          <div
            className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButton
              iconOnly
              variant="ghost"
              tooltip="Xóa"
              className="!w-7 !h-7 !p-0 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded"
              requireConfirm
              confirmTitle="Xóa thông báo?"
              confirmLabel="Xóa"
              onAction={() => handleDelete(row.original.id)}
            >
              <Trash2 size={14} />
            </ActionButton>
          </div>
        ),
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
      {/* ── DATE RANGE PICKER (MATCHING FACET FILTER STYLE) ── */}
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

      {enums?.actionStates && (
        <FacetFilter
          label="Trạng thái xử lý"
          options={enums.actionStates
            .filter((s) => s !== "NONE")
            .map((s) => ({
              value: s,
              label: ACTION_STATE_CONFIG[s]?.label || s,
              count: 0,
            }))}
          selected={actionStateFilter}
          onChange={(v) => handleFilterChange(setActionStateFilter, v)}
        />
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="ml-2 text-xs text-red-600 hover:underline"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── HEADER ── */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              disabled={unreadCount === 0 || isMarkingAll}
              onAction={handleMarkAll}
            >
              <CheckCircle2 size={14} className="mr-1.5" /> Đánh dấu đã đọc
            </ActionButton>
            <ActionButton
              variant="ghost"
              className="!h-8 !px-3 !text-xs !font-medium"
              onAction={async () => {
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                refetch();
              }}
              isLoading={isFetching}
            >
              <RefreshCw size={14} className="mr-1.5" /> Làm mới
            </ActionButton>
          </div>
        </div>

        {/* <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="input-base pl-9 py-1.5 text-xs w-full bg-muted/30 focus:bg-background"
            />
          </div>
          <div className="hidden xl:flex items-center gap-2">
            {facetFiltersNode}
          </div>
          <div className="xl:hidden">
            <MobileFilterSheet
              activeCount={activeFilterCount}
              onClearAll={clearAllFilters}
            >
              {facetFiltersNode}
            </MobileFilterSheet>
          </div>
        </div> */}
      </div>

      {/* ── LAYOUT ── */}
      <div className="flex-1 min-h-0 relative">
        <DetailLayout
          title="Thông báo"
          // leftSidebar={{ defaultCollapsed: true, content: () => null }}
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

              const catCfg = CATEGORY_CONFIG[selectedNoti.category] || CATEGORY_CONFIG.SYSTEM;
              const prioCfg = PRIORITY_CONFIG[selectedNoti.priority] || PRIORITY_CONFIG.NORMAL;
              const actorCfg = ACTOR_TYPE_CONFIG[selectedNoti.actorType] || ACTOR_TYPE_CONFIG.SYSTEM_CRON;
              const ActorIcon = actorCfg.icon;
              // Chuẩn hoá link BE trả về (vd: Yêu cầu tuyển dụng đã đổi route)
              const actionHref = resolveNotificationActionHref(
                selectedNoti.actionUrl,
                locale,
              );

              return (
                <div className="flex flex-col h-full fade-in bg-card">
                  {/* ── HEADER PANE ── */}
                  <div className="px-5 py-2 border-b border-border/50 relative shrink-0">
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${prioCfg.className.split(" ")[1]}`}
                    />
                    
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3 mt-1">
                      <Badge config={catCfg} />
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${prioCfg.className}`}
                      >
                        <prioCfg.icon size={10} /> {prioCfg.label}
                      </span>
                      {CANDIDATE_SCREENING_TASK_TYPE_CONFIG[
                        selectedNoti.taskType
                      ] && (
                        <span
                          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${CANDIDATE_SCREENING_TASK_TYPE_CONFIG[selectedNoti.taskType].className}`}
                        >
                          {React.createElement(
                            CANDIDATE_SCREENING_TASK_TYPE_CONFIG[
                              selectedNoti.taskType
                            ].icon,
                            { size: 10 },
                          )}
                          {selectedNoti.taskType}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-foreground leading-tight mb-4">
                      {selectedNoti.title}
                    </h2>

                    {/* Sender Info (Flat) */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <ActorIcon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {selectedNoti.actorSnapshot?.name || actorCfg.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          Tới: Bạn <span className="opacity-50">•</span>{" "}
                          {new Date(selectedNoti.createdAt).toLocaleString("vi-VN", { dateStyle: "full", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── BODY PANE (SCROLLABLE) ── */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Action State */}
                    {selectedNoti.actionState !== "NONE" && (
                      <div className="px-5 py-4 border-b border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Trạng thái xử lý yêu cầu
                        </p>
                        <Badge
                          config={
                            ACTION_STATE_CONFIG[selectedNoti.actionState] ||
                            ACTION_STATE_CONFIG.PENDING
                          }
                        />
                      </div>
                    )}

                    {/* Notification Content */}
                    <div className="px-5 py-6 border-b border-border/50">
                      <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {selectedNoti.body}
                      </div>
                    </div>

                    {/* Meta Data Tham chiếu */}
                    <div className="px-5 py-5 bg-muted/10 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Thông tin tham chiếu
                      </p>

                      <div className="grid grid-cols-1 gap-1">
                        {selectedNoti.targetEntityType && (
                          <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                            <span className="text-[11px] text-muted-foreground">Đối tượng</span>
                            <span className="text-[11px] font-semibold text-foreground text-right">
                              {selectedNoti.targetEntityType} #{selectedNoti.targetEntityId}
                            </span>
                          </div>
                        )}
                        {selectedNoti.taskType && (
                          <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                            <span className="text-[11px] text-muted-foreground">Loại tác vụ</span>
                            <span className="text-[11px] font-semibold text-foreground text-right">
                              {selectedNoti.taskType}
                            </span>
                          </div>
                        )}
                        {selectedNoti.departmentId && selectedNoti.departmentId !== "GLOBAL" && (
                          <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                            <span className="text-[11px] text-muted-foreground">Phân luồng</span>
                            <span className="text-[11px] font-semibold text-foreground text-right">
                              {selectedNoti.departmentId}
                            </span>
                          </div>
                        )}
                        {selectedNoti.deliveryChannels && selectedNoti.deliveryChannels.length > 0 && (
                          <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                            <span className="text-[11px] text-muted-foreground">Kênh nhận</span>
                            <span className="text-[11px] font-semibold text-foreground text-right">
                              {selectedNoti.deliveryChannels.join(", ")}
                            </span>
                          </div>
                        )}
                        {selectedNoti.readAt && (
                          <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                            <span className="text-[11px] text-muted-foreground">Đã xem lúc</span>
                            <span className="text-[11px] font-semibold text-foreground text-right">
                              {new Date(selectedNoti.readAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── FOOTER PANE (FIXED ACTIONS) ── */}
                  <div className="px-4 py-2 border-t border-border bg-card shrink-0 flex items-center justify-between gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <ActionButton
                      iconOnly
                      variant="ghost"
                      tooltip="Xóa thông báo"
                      className="!w-9 !h-9 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-full shrink-0"
                      requireConfirm
                      confirmTitle="Xóa thông báo?"
                      confirmLabel="Xóa"
                      onAction={() => handleDelete(selectedNoti.id)}
                    >
                      <Trash2 size={16} />
                    </ActionButton>

                    {actionHref && (
                      <Link href={actionHref} className="flex-1">
                        <button className="btn-primary w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-lg shadow-sm">
                          Hành động / Xem chi tiết <ExternalLink size={14} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            },
          }}
        >
          {/* ── CENTER: DATA TABLE ── */}
          <div className="flex-1 min-h-0 flex-col flex bg-background relative">
            <DataTable
              columns={columns}
              data={fetchedList} // Không xài filteredData nữa vì API đã filter
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

      {/* ── MOBILE READING DRAWER ── */}
      <div className="md:hidden">
        <NotificationDrawer
          noti={selectedNoti}
          onClose={() => setIsRightCollapsed(true)}
        />
      </div>
    </div>
  );
}
