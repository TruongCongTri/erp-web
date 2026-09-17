/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import type {
  ColumnDef,
  StockFeatures,
  PaginationState,
} from "@tanstack/react-table";
import {
  Plus,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  FileText,
  Search,
} from "lucide-react";

// Tái sử dụng các Config Badge cũ từ file data của bạn (đảm bảo import đúng đường dẫn)
import {
  candidateDepartments, // Dùng mock bộ phận nếu API chưa cung cấp Facet
  statusBadgeConfig, // Ánh xạ màu sắc cho CandidateStatus
  priorityBadgeConfig, // Nếu API không có "priority", ta sẽ giữ mock config để code không crash
  CandidateStatus,
  ApplicationPriority,
} from "./candidateData";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  MobileFilterSheet,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import CandidateDrawer from "./CandidateDrawer";
import AddCandidateModal from "./AddCandidateModal";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import ActionButton from "@/components/buttons/ActionButton";

// ─── API HOOKS ───────────────────────────────────────────────────────────────
import { useGetCandidatesQuery } from "@/lib/store/atsApiSlice";

// ─── Whisper Badge Component (Local Custom Render) ───────────────────────────
function Badge({
  config,
}: {
  config?: { label: string; className: string; icon?: React.ElementType };
}) {
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.className}`}
    >
      {Icon && <Icon size={10} className="flex-shrink-0" />}
      {config.label}
    </span>
  );
}

// ─── Mobile Candidate Card ─────────────────────────────────────────────────────
function CandidateCard({
  candidate,
  onView,
}: {
  candidate: any;
  onView: (c: any) => void;
}) {
  // Lấy trạng thái từ Application đầu tiên (nếu có)
  const appStatus = (candidate.applications?.[0]?.status ||
    "NEW") as CandidateStatus;
  const statusCfg = statusBadgeConfig[appStatus] || {
    label: appStatus,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

  // Fake Priority nếu Backend không có
  const priorityCfg = priorityBadgeConfig["high"] || {
    label: "High",
    className: "bg-red-50 text-red-700 border-red-200",
  };

  // Tạo Initials
  const initials = candidate.fullName
    ? candidate.fullName.substring(0, 2).toUpperCase()
    : "NA";

  const department =
    candidate.applications?.[0]?.jobPost?.request?.department ||
    "Chưa phân ban";
  const position =
    candidate.applications?.[0]?.jobPost?.publicTitle || "Chưa rõ vị trí";

  return (
    <div
      onClick={() => onView(candidate)}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted/50 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {candidate.fullName}
          </p>
          <Badge config={statusCfg} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{position}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {department}
          </span>
          <Badge config={priorityCfg} />
        </div>
      </div>
      <Eye size={16} className="text-muted-foreground flex-shrink-0" />
    </div>
  );
}

// ─── MAIN ATS CONTENT COMPONENT ──────────────────────────────────────────────
export default function ATSContent() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "vi";

  // State quản lý Filter & Table
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [priorityFilter, setPriorityFilter] = useState<string[]>(
    searchParams.get("priority")?.split(",").filter(Boolean) || [],
  );
  const [deptFilter, setDeptFilter] = useState<string[]>(
    searchParams.get("dept")?.split(",").filter(Boolean) || [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const [drawerCandidate, setDrawerCandidate] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // ─── RTK QUERY: Fetch Candidates ───
  const {
    data: candidatesRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetCandidatesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
  });

  const isDataLoading = isLoading || isFetching;
  const candidatesData = candidatesRes?.data || [];
  const totalRows =
    candidatesRes?.meta?.pagination?.total || candidatesData.length;
  const pageCount = candidatesRes?.meta?.pagination?.total_page || 1;

  // URL Sync
  useEffect(() => {
    const p = new URLSearchParams();
    if (globalFilter) p.set("q", globalFilter);
    if (statusFilter.length > 0) p.set("status", statusFilter.join(","));
    if (priorityFilter.length > 0) p.set("priority", priorityFilter.join(","));
    if (deptFilter.length > 0) p.set("dept", deptFilter.join(","));
    if (pagination.pageIndex > 0)
      p.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      p.set("limit", pagination.pageSize.toString());

    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [
    globalFilter,
    statusFilter,
    priorityFilter,
    deptFilter,
    pagination,
    pathname,
    router,
  ]);

  // Handle Client-side filtering (if backend doesn't support Facet yet)
  const filteredData = useMemo(() => {
    let result = candidatesData;
    if (statusFilter.length > 0) {
      result = result.filter((c) =>
        c.applications?.some((app: any) => statusFilter.includes(app.status)),
      );
    }
    if (deptFilter.length > 0) {
      result = result.filter((c) =>
        c.applications?.some((app: any) =>
          deptFilter.includes(app.jobPost?.request?.department),
        ),
      );
    }
    return result;
  }, [candidatesData, statusFilter, deptFilter]);

  // Tính Count (Mock) cho Facets
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    candidatesData.forEach((c) => {
      const s = c.applications?.[0]?.status;
      if (s) map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [candidatesData]);

  // FIX MEMOIZATION: Wrap setDrawerCandidate with useCallback to safely pass into columns
  const handleOpenDrawer = useCallback((candidate: any) => {
    setDrawerCandidate(candidate);
  }, []);

  // ─── COLUMNS ───
  const columns = useMemo<ColumnDef<StockFeatures, any, any>[]>(
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
        accessorKey: "name",
        header: ({ column }: any) => (
          <SortHeader column={column}>Ứng viên</SortHeader>
        ),
        cell: ({ row }: any) => {
          const initials = row.original.fullName
            ? row.original.fullName.substring(0, 2).toUpperCase()
            : "NA";
          return (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {row.original.fullName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {row.original.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "position",
        accessorFn: (row) =>
          row.applications?.[0]?.jobPost?.publicTitle || "Không rõ",
        header: ({ column }: any) => (
          <SortHeader column={column}>Vị trí ứng tuyển</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-foreground">{getValue()}</span>
        ),
      },
      {
        id: "department",
        accessorFn: (row) =>
          row.applications?.[0]?.jobPost?.request?.department || "Không rõ",
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-muted-foreground">{getValue()}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.applications?.[0]?.status || "NEW",
        header: ({ column }: any) => (
          <SortHeader column={column}>Trạng thái</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as CandidateStatus;
          const config = statusBadgeConfig[val] || {
            label: val || "NEW",
            className: "bg-slate-100 text-slate-600 border-slate-200",
          };
          return <Badge config={config} />;
        },
      },
      {
        id: "priority",
        accessorFn: () => "high", // Mock priority as API lacks it
        header: ({ column }: any) => (
          <SortHeader column={column}>Ưu tiên</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as ApplicationPriority;
          const config = priorityBadgeConfig?.[val] ||
            priorityBadgeConfig?.["high"] || {
              label: val || "High",
              className: "bg-slate-100 text-slate-600 border-slate-200",
            };
          return <Badge config={config} />;
        },
      },
      {
        id: "source",
        accessorFn: (row) =>
          row.applications?.[0]?.submissions?.[0]?.platformSource || "Website",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Nguồn
          </span>
        ),
        cell: ({ getValue }: any) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {getValue()}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }: any) => (
          <SortHeader column={column}>Ngày nộp</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Date(getValue() as string).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        id: "actions",
        size: 140,
        header: () => null,
        cell: ({ row }: any) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e: any) => e.stopPropagation()}
          >
            <ActionButton
              iconOnly
              variant="ghost"
              tooltip="Xem hồ sơ ứng viên"
              className="!w-7 !h-7 !p-0 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 rounded"
              onClick={() => handleOpenDrawer(row.original)}
            >
              <Eye size={14} />
            </ActionButton>

            <ActionButton
              isUnderDevelopment
              iconOnly
              variant="ghost"
              tooltip="Ghi chú phỏng vấn"
              className="!w-7 !h-7 !p-0 text-muted-foreground hover:bg-green-50 hover:text-green-600 rounded"
            >
              <MessageSquare size={14} />
            </ActionButton>

            <ActionButton
              isUnderDevelopment
              iconOnly
              variant="ghost"
              tooltip="Xem CV đính kèm"
              className="!w-7 !h-7 !p-0 text-muted-foreground hover:bg-purple-50 hover:text-purple-600 rounded"
            >
              <FileText size={14} />
            </ActionButton>
          </div>
        ),
        enableSorting: false,
      },
    ],
    // FIX: Đưa hàm đã được bọc bằng useCallback vào array dependencies
    [handleOpenDrawer],
  );

  const hasFilters =
    statusFilter.length > 0 ||
    priorityFilter.length > 0 ||
    deptFilter.length > 0 ||
    globalFilter;
  const activeFilterCount =
    statusFilter.length + priorityFilter.length + deptFilter.length;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter([]);
    setPriorityFilter([]);
    setDeptFilter([]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <FacetFilter
        label="Trạng thái"
        options={Object.entries(statusBadgeConfig).map(([val, cfg]) => ({
          value: val,
          label: cfg.label,
          count: statusCounts[val] ?? 0,
        }))}
        selected={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
      <FacetFilter
        label="Ưu tiên (Mock)"
        options={Object.entries(priorityBadgeConfig).map(([val, cfg]) => ({
          value: val,
          label: cfg.label,
          count: 0,
        }))}
        selected={priorityFilter}
        onChange={(v) => {
          setPriorityFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
      <FacetFilter
        label="Phòng ban"
        options={candidateDepartments.map((d) => ({
          value: d,
          label: d,
          count: 0,
        }))}
        selected={deptFilter}
        onChange={(v) => {
          setDeptFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />
    </div>
  );

  const mobileFacetFiltersNode = (
    <MobileFilterSheet
      activeCount={activeFilterCount}
      onClearAll={clearAllFilters}
    >
      {facetFiltersNode}
    </MobileFilterSheet>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── HEADER ── */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Quản lý Ứng viên (ATS)
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} ứng viên · Cập nhật{" "}
              {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Danh_sach_Ung_vien.xlsx";
              }}
              loadingMessage="Đang chuẩn bị file..."
              successMessage={(file) => `Đã xuất ${file}`}
            >
              <Download size={13} className="mr-1.5" /> Xuất Excel
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => refetch()}
            >
              <RefreshCw
                size={13}
                className={`mr-1.5 ${isDataLoading ? "animate-spin" : ""}`}
              />{" "}
              Làm mới
            </ActionButton>

            {/* FIX: Thêm action trigger onClick để mở Modal */}
            <ActionButton
              variant="primary"
              className="!h-8 !px-3 !py-0 !text-xs"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} className="mr-1.5" />{" "}
              <span className="hidden sm:inline">Thêm ứng viên</span>
              <span className="sm:hidden">Thêm</span>
            </ActionButton>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              placeholder="Tìm theo tên, email..."
              className="input-base pl-9 py-1.5 text-xs w-full bg-background"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-red-600 hover:underline whitespace-nowrap"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE LIST ── */}
      <div className="flex-1 min-h-0 overflow-y-auto md:hidden px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {filteredData.length} ứng viên
          </span>
          {mobileFacetFiltersNode}
        </div>
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Search size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không tìm thấy ứng viên
            </p>
          </div>
        ) : (
          filteredData.map((c: any) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onView={setDrawerCandidate}
            />
          ))
        )}
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
        <DataTable
          columns={columns}
          data={filteredData}
          pageCount={pageCount}
          totalRows={totalRows}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isDataLoading}
          skeletonRowCount={10}
          facetFilters={facetFiltersNode}
          mobileFacetFilters={mobileFacetFiltersNode}
        />
      </div>

      {/* ── QUICK VIEW DRAWER ── */}
      {drawerCandidate && (
        <CandidateDrawer
          candidate={drawerCandidate}
          onClose={() => setDrawerCandidate(null)}
          locale={locale}
        />
      )}

      {/* ── ADD CANDIDATE MODAL ── */}
      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
