/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Globe,
  Briefcase,
  DollarSign,
  Hash,
  Ban,
  Layers,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import ActionButton from "@/components/buttons/ActionButton";

// ─── API HOOKS & ATS TYPES ───────────────────────────────────────────────────
import {
  useGetJobPostsQuery,
  useSyncAtsEventsQuery,
  JobPostStatus,
  JobPost,
  JobLevel,
  PlatformSource,
  getDeptName,
} from "@/lib/store/atsApiSlice";
import { useGetDepartmentsQuery } from "@/lib/store/departmentApiSlice";
import JobPostDrawer from "./JobPostDrawer";
import JobPostPreviewModal from "./JobPostPreviewModal";

// ─── STATUS CONFIG (ĐỒNG BỘ 100% VỚI BACKEND & ENUMS) ────────────────────────
const JOB_STATUS_CONFIG: Record<
  JobPostStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  [JobPostStatus.DRAFT]: {
    label: "Bản thảo",
    className: "badge-neutral",
    icon: FileText,
  },
  [JobPostStatus.PENDING_HEAD_APPROVAL]: {
    label: "Chờ duyệt JD",
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: ShieldCheck,
  },
  [JobPostStatus.PUBLISHED]: {
    label: "Đang phát sóng",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    icon: Globe,
  },
  [JobPostStatus.CLOSED]: {
    label: "Đã đóng tin",
    className:
      "bg-slate-200 text-slate-600 border-slate-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
    icon: Ban,
  },
  [JobPostStatus.ARCHIVED]: {
    label: "Đã lưu trữ",
    className:
      "bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-900 dark:text-neutral-500 dark:border-neutral-800",
    icon: Layers,
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
    <span className={`badge ${config.className} text-[10px] px-1.5 py-0.5`}>
      {Icon && <Icon size={11} />}
      {config.label || label}
    </span>
  );
}

// ─── Table-Row Styled Mobile Item ────────────────────────────────────────────
function MobileJobPostRow({
  job,
  locale,
  onQuickView,
}: {
  job: JobPost;
  locale: string;
  onQuickView: (j: JobPost) => void;
}) {
  const router = useRouter();
  const statusCfg =
    JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG[JobPostStatus.DRAFT];

  const deptName = getDeptName(job.recruitmentRequest?.department);

  const salaryDisplay = job.isSalaryNegotiable
    ? "Thỏa thuận"
    : job.salaryMin
      ? `${(job.salaryMin / 1000000).toFixed(0)}M - ${(job.salaryMax / 1000000).toFixed(0)}M`
      : "Thỏa thuận";

  const appCount = job.applicationsCount || 0;

  return (
    <div
      onClick={() => router.push(`/${locale}/ats/jobs-management/${job.id}`)}
      className="flex items-center justify-between py-2.5 px-3 border-b border-border/60 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer group text-xs select-none"
    >
      <div className="flex-1 min-w-0 pr-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-mono text-[10px] font-bold text-primary">
            #{job.jobCode ? job.jobCode.slice(-4) : "JOB"}
          </span>
          <Badge config={statusCfg} />
          {job.level && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
              {job.level}
            </span>
          )}
        </div>

        <p className="font-semibold text-foreground text-xs truncate leading-snug">
          {job.publicTitle}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 truncate">
          <span className="truncate max-w-[130px]">{deptName}</span>
          <span>•</span>
          <span className="text-emerald-600 font-medium">{salaryDisplay}</span>
          <span>•</span>
          <span className="font-mono text-primary font-bold">{appCount} hồ sơ</span>
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onQuickView(job)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Xem nhanh"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/ats/jobs-management/${job.id}`)}
          className="p-1.5 rounded-md text-muted-foreground/60 group-hover:text-primary transition-colors"
          title="Chi tiết"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Content Component ──────────────────────────────────────────────────
export default function JobPostsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useMemo(() => pathname.split("/")[1] || "vi", [pathname]);

  useSyncAtsEventsQuery();

  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [previewJob, setPreviewJob] = useState<JobPost | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filter & Pagination States
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [deptFilter, setDeptFilter] = useState<string[]>(
    searchParams.get("dept")?.split(",").filter(Boolean) || [],
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [levelFilter, setLevelFilter] = useState<string[]>(
    searchParams.get("level")?.split(",").filter(Boolean) || [],
  );
  const [platformFilter, setPlatformFilter] = useState<string[]>(
    searchParams.get("platform")?.split(",").filter(Boolean) || [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const { data: deptFilterRes } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });

  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: globalFilter.trim() || undefined,
      status:
        statusFilter.length === 1
          ? ([statusFilter[0]] as JobPostStatus[])
          : statusFilter.length > 1
            ? (statusFilter as JobPostStatus[])
            : undefined,
      level: levelFilter.length === 1 ? (levelFilter[0] as JobLevel) : undefined,
      platform:
        platformFilter.length > 0
          ? (platformFilter as PlatformSource[])
          : undefined,
    };
  }, [pagination, globalFilter, statusFilter, levelFilter, platformFilter]);

  const {
    data: listRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetJobPostsQuery(queryParams);

  const isDataLoading = isLoading || isFetching;
  const jobsData: JobPost[] = listRes?.data || [];
  const totalRows = listRes?.meta?.pagination?.total || 0;
  const pageCount = listRes?.meta?.pagination?.total_page || 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (globalFilter.trim()) params.set("q", globalFilter.trim());
      if (deptFilter.length) params.set("dept", deptFilter.join(","));
      if (statusFilter.length) params.set("status", statusFilter.join(","));
      if (levelFilter.length) params.set("level", levelFilter.join(","));
      if (platformFilter.length) params.set("platform", platformFilter.join(","));

      if (pagination.pageIndex > 0) {
        params.set("page", (pagination.pageIndex + 1).toString());
      }
      if (pagination.pageSize !== 10) {
        params.set("limit", pagination.pageSize.toString());
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    globalFilter,
    deptFilter,
    statusFilter,
    levelFilter,
    platformFilter,
    pagination,
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

  const columns = useMemo<ColumnDef<StockFeatures, JobPost, any>[]>(
    () => [
      {
        id: "select",
        size: 40,
        meta: { title: "Chọn" },
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
        accessorKey: "jobCode",
        size: 130,
        meta: { title: "Mã Job" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Mã tin</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary">
            <Hash size={12} className="opacity-50" />
            {getValue() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "publicTitle",
        size: 270,
        meta: { title: "Vị trí tuyển dụng" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Tiêu đề tuyển dụng</SortHeader>
        ),
        cell: ({ row }: any) => {
          const title = row.original.publicTitle || "Bản tin tuyển dụng";
          const specialization =
            row.original.specialization || "Kỹ thuật Xây dựng / EPC";

          return (
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0 border border-primary/20">
                {title.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold text-foreground truncate"
                  title={title}
                >
                  {title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  Chuyên môn: {specialization}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "department",
        size: 170,
        meta: { title: "Phòng ban" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban</SortHeader>
        ),
        cell: ({ row }: any) => {
          const dept = row.original.recruitmentRequest?.department;
          const deptName =
            dept?.name || (typeof dept === "string" ? dept : "Chưa gán");
          const deptCode = (dept as any)?.code;

          return (
            <span
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate"
              title={deptName}
            >
              <Building2
                size={12}
                className="text-muted-foreground/50 flex-shrink-0"
              />
              <span className="truncate">
                {deptCode ? `[${deptCode}] ` : ""}
                {deptName}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "level",
        size: 130,
        meta: { title: "Cấp bậc & Hình thức" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Cấp bậc / Hình thức
          </span>
        ),
        cell: ({ row }: any) => {
          const level = row.original.level;
          const model = row.original.workingModel;
          return (
            <div className="text-xs">
              <p className="font-semibold text-foreground">{level}</p>
              <p className="text-[10px] text-muted-foreground">{model}</p>
            </div>
          );
        },
      },
      {
        id: "budgetRange",
        size: 150,
        meta: { title: "Định biên lương" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Định biên lương
          </span>
        ),
        cell: ({ row }: any) => {
          const job = row.original;
          if (job.isSalaryNegotiable) {
            return (
              <span className="text-xs text-muted-foreground italic">
                Thỏa thuận
              </span>
            );
          }
          if (job.salaryMin || job.salaryMax) {
            const minStr = job.salaryMin
              ? `${(job.salaryMin / 1_000_000).toFixed(0)}M`
              : "0";
            const maxStr = job.salaryMax
              ? `${(job.salaryMax / 1_000_000).toFixed(0)}M`
              : "Max";
            return (
              <span className="text-xs text-emerald-600 font-semibold tabular-nums">
                {minStr} - {maxStr} VNĐ
              </span>
            );
          }
          return (
            <span className="text-xs text-muted-foreground italic">
              Thỏa thuận
            </span>
          );
        },
        enableSorting: false,
      },
      {
        id: "targetPlatforms",
        size: 150,
        meta: { title: "Kênh phát hành" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Kênh phân phối
          </span>
        ),
        cell: ({ row }: any) => {
          const platforms: PlatformSource[] = row.original.targetPlatforms || [];
          if (!platforms.length) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex gap-1 flex-wrap">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground border border-border"
                >
                  {p}
                </span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "applicationsCount",
        size: 90,
        meta: { title: "Hồ sơ nộp" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground text-center block w-full">
            Hồ sơ
          </span>
        ),
        cell: ({ row }: any) => {
          const count = row.original.applicationsCount || 0;
          return (
            <div className="text-center">
              <span className="font-bold text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                {count}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        size: 140,
        meta: { title: "Trạng thái" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Trạng thái</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const config =
            JOB_STATUS_CONFIG[getValue() as JobPostStatus] ||
            JOB_STATUS_CONFIG[JobPostStatus.DRAFT];
          return <Badge config={config} />;
        },
      },
      {
        id: "actions",
        size: 90,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => {
          const job: JobPost = row.original;
          return (
            <div
              className="flex items-center justify-end gap-1.5"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewJob(job)}
                className="p-2 rounded hover:bg-purple-50 text-purple-600 transition-colors border border-transparent hover:border-purple-200 cursor-pointer"
                title="Xem trước định dạng bài đăng"
              >
                <Eye size={14} />
              </button>

              <Link
                href={`/${locale}/ats/jobs-management/${job.id}`}
                prefetch={false}
                className="p-2 rounded hover:bg-primary/10 text-primary transition-colors border border-transparent hover:border-primary/20 inline-flex items-center justify-center cursor-pointer"
                title="Chi tiết bản tin tuyển dụng"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [locale],
  );

  const deptOptions = useMemo(
    () =>
      deptFilterRes?.data?.map((d) => ({
        value: d.id,
        label: `[${d.code}] ${d.name}`,
        count: 0,
      })) || [],
    [deptFilterRes],
  );

  const statusOptions = useMemo(
    () =>
      Object.entries(JOB_STATUS_CONFIG).map(([val, cfg]) => ({
        value: val,
        label: cfg.label,
        count: 0,
      })),
    [],
  );

  const levelOptions = useMemo(
    () =>
      Object.values(JobLevel).map((lvl) => ({
        value: lvl,
        label: lvl,
        count: 0,
      })),
    [],
  );

  const platformOptions = useMemo(
    () =>
      Object.values(PlatformSource).map((p) => ({
        value: p,
        label: p,
        count: 0,
      })),
    [],
  );

  const activeFilterCount =
    deptFilter.length +
    statusFilter.length +
    levelFilter.length +
    platformFilter.length;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setDeptFilter([]);
    setStatusFilter([]);
    setLevelFilter([]);
    setPlatformFilter([]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <FacetFilter
        label="Phòng ban"
        options={deptOptions}
        selected={deptFilter}
        onChange={(v) => handleFilterChange(setDeptFilter, v)}
      />
      <FacetFilter
        label="Trạng thái"
        options={statusOptions}
        selected={statusFilter}
        onChange={(v) => handleFilterChange(setStatusFilter, v)}
      />
      <FacetFilter
        label="Cấp bậc"
        options={levelOptions}
        selected={levelFilter}
        onChange={(v) => handleFilterChange(setLevelFilter, v)}
      />
      <FacetFilter
        label="Kênh đăng"
        options={platformOptions}
        selected={platformFilter}
        onChange={(v) => handleFilterChange(setPlatformFilter, v)}
      />
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="ml-2 text-xs text-red-600 hover:underline cursor-pointer"
        >
          Xóa {activeFilterCount} bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── TOP ACTION BAR ── */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Bản Tin Tuyển Dụng
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} bản tin · Quản lý xuất bản đa kênh &amp; thu hút ứng viên
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Ban_tin_Tuyen_dung_2026.xlsx";
              }}
              loadingMessage="Đang chuẩn bị file..."
              successMessage={(file) => `Đã tải xuống ${file}`}
              title="Xuất Excel"
            >
              <Download size={14} className="shrink-0" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await refetch();
              }}
              loadingMessage="Đang làm mới..."
              successMessage="Dữ liệu đã được cập nhật"
              title="Làm mới"
            >
              <RefreshCw size={14} className="shrink-0" />
              <span className="hidden sm:inline">Làm mới</span>
            </ActionButton>

            <ActionButton
              variant="primary"
              className="!h-8 !px-2 sm:!px-3 !py-0 !text-xs"
              onClick={() => router.push(`/${locale}/ats/request-management`)}
              title="Khởi tạo từ Yêu cầu"
            >
              <Plus size={14} className="shrink-0" />
              <span className="hidden sm:inline">Khởi tạo từ Yêu cầu</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── MOBILE LIST VIEW (< md) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden">
        {/* Search & Filter Drawer Trigger */}
        <div className="p-3 border-b border-border bg-card flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) =>
                handleFilterChange(setGlobalFilter, e.target.value)
              }
              placeholder="Tìm theo mã tin, vị trí, chuyên môn..."
              className="input-base pl-9 pr-7 py-1 text-xs w-full h-8"
            />
            {globalFilter && (
              <button
                onClick={() => handleFilterChange(setGlobalFilter, "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
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
            title="Mở bộ lọc & Sắp xếp"
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
          {jobsData.length === 0 && !isDataLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Search size={28} className="text-muted-foreground/30" />
              <p className="text-xs font-semibold text-muted-foreground">
                Không tìm thấy bản tin tuyển dụng
              </p>
            </div>
          ) : (
            jobsData.map((job: JobPost) => (
              <MobileJobPostRow
                key={job.id}
                job={job}
                locale={locale}
                onQuickView={setSelectedJob}
              />
            ))
          )}
        </div>

        {/* ── MOBILE BOTTOM PAGINATION (DOCKED) ── */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            {pagination.pageIndex * pagination.pageSize + 1}-
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRows)} / {totalRows}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.pageIndex === 0 || isDataLoading}
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
              disabled={pagination.pageIndex >= pageCount - 1 || isDataLoading}
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

      {/* ── DESKTOP DATA TABLE (md:) ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
        <DataTable
          columns={columns}
          data={jobsData}
          pageCount={pageCount}
          totalRows={totalRows}
          globalFilter={globalFilter}
          onGlobalFilterChange={(v) => handleFilterChange(setGlobalFilter, v)}
          pagination={pagination}
          onPaginationChange={setPagination}
          facetFilters={facetFiltersNode}
          isLoading={isDataLoading}
          skeletonRowCount={8}
          enableMultiRowSelection={true}
          onRowClick={(row) => setSelectedJob(row.original)}
        />
      </div>

      {/* ── BOTTOM DRAWER FOR MOBILE FILTER & SORT ── */}
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
                  Lọc &amp; Sắp xếp bản tin
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
              {/* Filter: Trạng thái */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Trạng thái bản tin
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map((opt) => {
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
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
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

              {/* Filter: Cấp bậc */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Cấp bậc (Level)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {levelOptions.map((opt) => {
                    const isSelected = levelFilter.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? levelFilter.filter((v) => v !== opt.value)
                            : [opt.value];
                          handleFilterChange(setLevelFilter, next);
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
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

              {/* Filter: Kênh đăng */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Kênh đăng tuyển
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {platformOptions.map((opt) => {
                    const isSelected = platformFilter.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? platformFilter.filter((v) => v !== opt.value)
                            : [...platformFilter, opt.value];
                          handleFilterChange(setPlatformFilter, next);
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
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

              {/* Filter: Phòng ban */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Phòng ban
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto border border-border/60 rounded-lg p-2 bg-muted/10">
                  {deptOptions.map((d) => {
                    const isSelected = deptFilter.includes(d.value);
                    return (
                      <div
                        key={d.value}
                        onClick={() => {
                          const next = isSelected
                            ? deptFilter.filter((v) => v !== d.value)
                            : [d.value];
                          handleFilterChange(setDeptFilter, next);
                        }}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <span className="truncate">{d.label}</span>
                        {isSelected && <Check size={13} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
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

      {/* DRAWER XEM NHANH */}
      {selectedJob && (
        <JobPostDrawer
          jobPostId={selectedJob.id}
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          locale={locale}
        />
      )}

      {/* MODAL XEM TRƯỚC BÀI ĐĂNG */}
      {previewJob && (
        <JobPostPreviewModal
          isOpen={Boolean(previewJob)}
          onClose={() => setPreviewJob(null)}
          formData={previewJob}
          jobPost={previewJob}
          departmentName={getDeptName(previewJob.recruitmentRequest?.department)}
        />
      )}
    </div>
  );
}