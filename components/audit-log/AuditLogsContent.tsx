/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Search,
  X,
  CalendarIcon,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  User,
  Activity,
  ArrowRight,
  Database,
  MonitorSmartphone,
  Globe,
  FileDown,
  LayoutTemplate,
  Lock,
  RefreshCw,
} from "lucide-react";

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
  useGetAuditLogsQuery,
  useRequestExportMutation,
  AuditActionType,
  AuditStatus,
  AuditLog,
} from "@/lib/store/auditLogApiSlice";

// ─── DYNAMIC UI CONFIGS ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  [AuditStatus.SUCCESS]: {
    label: "Thành công",
    className: "badge-success",
    icon: CheckCircle2,
  },
  [AuditStatus.FAILED]: {
    label: "Thất bại",
    className: "badge-danger",
    icon: XCircle,
  },
  [AuditStatus.WARNING]: {
    label: "Cảnh báo",
    className: "badge-warning",
    icon: AlertTriangle,
  },
  [AuditStatus.BLOCKED]: {
    label: "Bị chặn",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: ShieldAlert,
  },
};

const ACTION_TYPE_CONFIG: Record<
  string,
  { label: string; colorClass: string }
> = {
  [AuditActionType.CREATE]: {
    label: "Tạo mới",
    colorClass: "text-emerald-600 bg-emerald-50",
  },
  [AuditActionType.UPDATE]: {
    label: "Cập nhật",
    colorClass: "text-blue-600 bg-blue-50",
  },
  [AuditActionType.DELETE]: {
    label: "Xóa",
    colorClass: "text-red-600 bg-red-50",
  },
  [AuditActionType.APPROVE]: {
    label: "Phê duyệt",
    colorClass: "text-emerald-700 bg-emerald-100",
  },
  [AuditActionType.REJECT]: {
    label: "Từ chối",
    colorClass: "text-red-700 bg-red-100",
  },
  [AuditActionType.LOGIN]: {
    label: "Đăng nhập",
    colorClass: "text-purple-600 bg-purple-50",
  },
  [AuditActionType.LOGOUT]: {
    label: "Đăng xuất",
    colorClass: "text-gray-600 bg-gray-50",
  },
  [AuditActionType.EXPORT]: {
    label: "Xuất dữ liệu",
    colorClass: "text-amber-600 bg-amber-50",
  },
  [AuditActionType.PERMISSION_CHANGE]: {
    label: "Đổi quyền",
    colorClass: "text-indigo-600 bg-indigo-50",
  },
};

function Badge({
  config,
  label,
}: {
  config?: { label: string; className: string; icon?: React.ElementType };
  label?: string;
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
export default function AuditLogsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initial States từ URL
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [actionFilter, setActionFilter] = useState<string[]>(
    searchParams.get("action")?.split(",").filter(Boolean) || [],
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
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

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);

  // ─── API HOOKS ───
  const {
    data: listRes,
    isFetching,
    refetch,
  } = useGetAuditLogsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    actionType: actionFilter.length
      ? (actionFilter as AuditActionType[])
      : undefined,
    status: statusFilter.length ? (statusFilter as AuditStatus[]) : undefined,
    fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const fetchedList = listRes?.data || [];
  const totalRows = listRes?.meta?.pagination?.total || 0;
  const pageCount = listRes?.meta?.pagination?.total_page || 1;

  const [requestExport, { isLoading: isExporting }] =
    useRequestExportMutation();

  // ─── SYNC URL ───
  useEffect(() => {
    const params = new URLSearchParams();
    if (globalFilter) params.set("q", globalFilter);
    if (actionFilter.length) params.set("action", actionFilter.join(","));
    if (statusFilter.length) params.set("status", statusFilter.join(","));
    if (dateRange?.from) params.set("fromDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("toDate", dateRange.to.toISOString());

    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 20)
      params.set("limit", pagination.pageSize.toString());

    if (selectedLog && !isRightCollapsed) params.set("id", selectedLog.id);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    globalFilter,
    actionFilter,
    statusFilter,
    dateRange,
    pagination,
    selectedLog,
    isRightCollapsed,
    pathname,
    router,
  ]);

  // Auto-select từ URL
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl && !selectedLog && fetchedList.length > 0) {
      const log = fetchedList.find((n) => n.id === idFromUrl);
      if (log) {
        setSelectedLog(log);
        setIsRightCollapsed(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedList]);

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

  const clearAllFilters = () => {
    setGlobalFilter("");
    setActionFilter([]);
    setStatusFilter([]);
    setDateRange(undefined);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleExport = async () => {
    try {
      await requestExport({
        search: globalFilter || undefined,
        actionType: actionFilter.length
          ? (actionFilter as AuditActionType[])
          : undefined,
        status: statusFilter.length
          ? (statusFilter as AuditStatus[])
          : undefined,
        fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
      }).unwrap();
      gooeyToast.success("Đã gửi yêu cầu xuất dữ liệu", {
        description:
          "Hệ thống đang xử lý ngầm. Bạn có thể tải file trong phần Quản lý Export.",
      });
    } catch {
      gooeyToast.error("Lỗi khi yêu cầu xuất dữ liệu");
    }
  };

  // ─── TABLE COLUMNS ───
  const columns = useMemo<ColumnDef<StockFeatures, AuditLog, any>[]>(
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
        accessorKey: "trackingCode",
        size: 140,
        meta: { title: "Mã theo dõi" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Tracking Code
          </span>
        ),
        cell: ({ row }: any) => (
          <div className="font-mono text-xs font-semibold text-muted-foreground">
            {row.original.trackingCode}
          </div>
        ),
      },
      {
        accessorKey: "actorName",
        size: 220,
        meta: { title: "Người thực hiện" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Người thực hiện</SortHeader>
        ),
        cell: ({ row }: any) => {
          const log = row.original as AuditLog;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/20">
                {log.actorInitials || <User size={12} />}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-semibold text-foreground truncate">
                  {log.actorName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {log.actorTitle || log.actorDepartmentId}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "actionType",
        size: 250,
        meta: { title: "Hành động" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Hành động
          </span>
        ),
        cell: ({ row }: any) => {
          const log = row.original as AuditLog;
          const actionCfg = ACTION_TYPE_CONFIG[log.actionType] || {
            label: log.actionType,
            colorClass: "bg-muted text-muted-foreground",
          };
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${actionCfg.colorClass}`}
                >
                  {actionCfg.label}
                </span>
                <span className="text-xs font-medium text-foreground truncate">
                  {log.resourceLabel}
                </span>
              </div>
              <span
                className="text-[10px] text-muted-foreground truncate max-w-[220px]"
                title={log.summary}
              >
                {log.summary}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        size: 130,
        meta: { title: "Trạng thái" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Trạng thái
          </span>
        ),
        cell: ({ row }: any) => {
          const status = row.original.status as AuditStatus;
          return <Badge config={STATUS_CONFIG[status]} />;
        },
      },
      {
        accessorKey: "timestamp",
        size: 150,
        meta: { title: "Thời gian" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Thời gian</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as string;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {new Date(val).toLocaleString("vi-VN")}
            </span>
          );
        },
      },
    ],
    [],
  );

  const activeFilterCount =
    statusFilter.length + actionFilter.length + (dateRange?.from ? 1 : 0);

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* ── DATE RANGE PICKER ── */}
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
        label="Hành động"
        options={Object.keys(ACTION_TYPE_CONFIG).map((key) => ({
          value: key,
          label: ACTION_TYPE_CONFIG[key].label,
        }))}
        selected={actionFilter}
        onChange={(v) => handleFilterChange(setActionFilter, v)}
      />

      <FacetFilter
        label="Kết quả"
        options={Object.keys(STATUS_CONFIG).map((key) => ({
          value: key,
          label: STATUS_CONFIG[key].label,
        }))}
        selected={statusFilter}
        onChange={(v) => handleFilterChange(setStatusFilter, v)}
      />

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
              <History size={18} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-foreground">
                Nhật ký hệ thống (Audit Logs)
              </h1>
              <p className="text-xs text-muted-foreground">
                Giám sát {totalRows} bản ghi thay đổi dữ liệu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              className="!h-8 !px-3 !text-xs !font-medium"
              onAction={handleExport}
              isLoading={isExporting}
            >
              <FileDown size={14} className="mr-1.5" /> Xuất Excel
            </ActionButton>
            <ActionButton
              variant="ghost"
              className="!h-8 !px-3 !text-xs !font-medium"
              onAction={async () => {
                setPagination((p) => ({ ...p, pageIndex: 0 }));
                refetch();
              }}
              isLoading={isFetching}
            >
              <RefreshCw size={14} className="mr-1.5" /> Làm mới
            </ActionButton>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo Correlation ID, Tracking Code..."
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
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="flex-1 min-h-0 relative">
        <DetailLayout
          title="Chi tiết Log"
          // leftSidebar={{ defaultCollapsed: true, content: () => null }}
          rightSidebar={{
            collapsed: isRightCollapsed || !selectedLog,
            onCollapseChange: setIsRightCollapsed,
            defaultCollapsed: true,
            content: (collapsed) => {
              if (collapsed || !selectedLog) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 fade-in p-6 text-center">
                    <Activity size={48} className="mb-4 stroke-[1.5px]" />
                    <p className="text-sm font-medium">
                      Chọn một bản ghi để xem chi tiết JSON Diff
                    </p>
                  </div>
                );
              }

              const statusCfg = STATUS_CONFIG[selectedLog.status];
              const actionCfg = ACTION_TYPE_CONFIG[selectedLog.actionType];

              return (
                <div className="flex flex-col h-full fade-in bg-card">
                  {/* ── HEADER PANE ── */}
                  <div className="p-5 border-b border-border/50 relative shrink-0">
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${statusCfg.className.split(" ")[0].replace("text-", "bg-")}`}
                    />

                    <div className="flex items-center justify-between mb-4 mt-1">
                      <div className="flex items-center gap-2">
                        <Badge config={statusCfg} />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${actionCfg.colorClass}`}
                        >
                          {actionCfg.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {selectedLog.trackingCode}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-foreground leading-tight mb-2">
                      {selectedLog.summary}
                    </h2>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2 border-t border-border/50 pt-3">
                      <Database size={12} />{" "}
                      <span className="font-semibold text-foreground mr-2">
                        {selectedLog.resourceLabel}
                      </span>
                      <Lock size={12} className="ml-2" /> ID:{" "}
                      {selectedLog.targetEntityId}
                    </div>
                  </div>

                  {/* ── BODY PANE (SCROLLABLE) ── */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-muted/5">
                    {/* Actor Info */}
                    <div className="px-5 py-4 border-b border-border/50 bg-card">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Người thực hiện
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20">
                          {selectedLog.actorInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {selectedLog.actorName}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            {selectedLog.actorTitle}{" "}
                            <span className="opacity-50">•</span>{" "}
                            {selectedLog.actorDepartmentId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Diff Payload (Lịch sử thay đổi) */}
                    <div className="px-5 py-5 border-b border-border/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <LayoutTemplate size={12} /> Chi tiết thay đổi dữ liệu (
                        {selectedLog.diffPayload?.changeType})
                      </p>

                      {selectedLog.diffPayload?.fields &&
                      selectedLog.diffPayload.fields.length > 0 ? (
                        <div className="space-y-2">
                          {selectedLog.diffPayload.fields.map((f, idx) => (
                            <div
                              key={idx}
                              className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-sm"
                            >
                              <div className="px-3 py-1.5 bg-muted/30 border-b border-border/50 text-[10px] font-bold text-muted-foreground flex justify-between">
                                <span>{f.label}</span>
                                <span className="font-mono text-muted-foreground/50">
                                  {f.field}
                                </span>
                              </div>
                              <div className="p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs">
                                <div
                                  className="text-red-600 line-through truncate opacity-80"
                                  title={f.oldDisplay || "Trống"}
                                >
                                  {f.oldDisplay || "—"}
                                </div>
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                  <ArrowRight size={10} />
                                </div>
                                <div
                                  className="text-emerald-700 font-semibold truncate"
                                  title={f.newDisplay || "Trống"}
                                >
                                  {f.newDisplay || "—"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic bg-card p-3 rounded border border-border border-dashed text-center">
                          Không có sự thay đổi field cụ thể nào được ghi nhận.
                        </div>
                      )}
                    </div>

                    {/* Security & Client Context */}
                    <div className="px-5 py-5 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <MonitorSmartphone size={12} /> Technical Context
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                          <span className="text-[11px] text-muted-foreground">
                            Client App
                          </span>
                          <span className="text-[11px] font-mono text-foreground text-right">
                            {selectedLog.clientApp}
                          </span>
                        </div>
                        <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                          <span className="text-[11px] text-muted-foreground">
                            IP Address
                          </span>
                          <span className="text-[11px] font-mono text-foreground text-right">
                            {selectedLog.ipAddress}
                          </span>
                        </div>
                        <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                          <span className="text-[11px] text-muted-foreground">
                            Request URL
                          </span>
                          <span
                            className="text-[11px] font-mono text-foreground text-right max-w-[200px] truncate"
                            title={selectedLog.requestUrl}
                          >
                            {selectedLog.requestUrl}
                          </span>
                        </div>
                        <div className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                          <span className="text-[11px] text-muted-foreground">
                            Correlation ID
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground text-right truncate max-w-[200px]">
                            {selectedLog.correlationId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          }}
        >
          {/* ── CENTER: DATA TABLE ── */}
          <div className="flex-1 min-h-0 flex-col flex bg-background relative pb-16">
            <DataTable
              columns={columns}
              data={fetchedList}
              pageCount={pageCount}
              totalRows={totalRows}
              globalFilter={""}
              onGlobalFilterChange={() => {}}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={isFetching}
              enableMultiRowSelection={true}
              onRowClick={(row) => {
                setSelectedLog(row.original);
                setIsRightCollapsed(false);
              }}
              emptyMessage={
                isFetching ? "Đang tải dữ liệu..." : "Không có nhật ký nào"
              }
              emptyIcon={
                <Activity size={32} className="text-muted-foreground/30" />
              }
            />
          </div>
        </DetailLayout>
      </div>

      {/* ── MOBILE READING DRAWER ── */}
      <div className="md:hidden">
        <DetailDrawer
          isOpen={!!selectedLog && !isRightCollapsed}
          onClose={() => setIsRightCollapsed(true)}
          title="Chi tiết Nhật ký"
        >
          {selectedLog && (
            <div className="p-5 flex flex-col h-[calc(100vh-100px)]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <Badge config={STATUS_CONFIG[selectedLog.status]} />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${ACTION_TYPE_CONFIG[selectedLog.actionType]?.colorClass}`}
                >
                  {ACTION_TYPE_CONFIG[selectedLog.actionType]?.label ||
                    selectedLog.actionType}
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-4 shrink-0">
                {selectedLog.summary}
              </h2>

              <p className="text-xs text-muted-foreground mb-6 pb-4 border-b border-border shrink-0">
                Bởi:{" "}
                <span className="font-semibold text-foreground">
                  {selectedLog.actorName}
                </span>{" "}
                <br />
                Lúc:{" "}
                {new Date(selectedLog.timestamp).toLocaleString("vi-VN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Thay đổi dữ liệu
                </p>
                {selectedLog.diffPayload?.fields &&
                selectedLog.diffPayload.fields.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {selectedLog.diffPayload.fields.map((f, idx) => (
                      <div
                        key={idx}
                        className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-sm"
                      >
                        <div className="px-3 py-1.5 bg-muted/30 border-b border-border/50 text-[10px] font-bold text-muted-foreground">
                          {f.label}
                        </div>
                        <div className="p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs">
                          <div className="text-red-600 line-through truncate">
                            {f.oldDisplay || "—"}
                          </div>
                          <ArrowRight
                            size={10}
                            className="text-muted-foreground"
                          />
                          <div className="text-emerald-700 font-semibold truncate">
                            {f.newDisplay || "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic mb-6">
                    Không ghi nhận thay đổi fields cụ thể.
                  </div>
                )}

                <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-border/50 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Technical Context
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-[11px] text-muted-foreground">
                        IP Address
                      </span>
                      <span className="text-[11px] font-mono text-foreground">
                        {selectedLog.ipAddress}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-[11px] text-muted-foreground">
                        Client
                      </span>
                      <span className="text-[11px] font-mono text-foreground">
                        {selectedLog.clientApp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DetailDrawer>
      </div>
    </div>
  );
}
