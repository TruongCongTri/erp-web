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
  XCircle,
  CheckCircle,
  Globe,
  Briefcase,
  DollarSign,
  Hash,
  Ban,
  Layers,
} from "lucide-react";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  MobileFilterSheet,
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
    <span className={`badge ${config.className}`}>
      {Icon && <Icon size={12} />}
      {config.label || label}
    </span>
  );
}

// ─── Mobile Card Component ───────────────────────────────────────────────────
function JobPostCard({
  job,
  locale,
  onView,
  onPreview,
}: {
  job: JobPost;
  locale: string;
  onView: (j: JobPost) => void;
  onPreview: (j: JobPost) => void;
}) {
  const statusCfg =
    JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG[JobPostStatus.DRAFT];

  const deptName = getDeptName(job.recruitmentRequest?.department);

  const salaryDisplay = job.isSalaryNegotiable
    ? "Thỏa thuận"
    : job.salaryMin
      ? `${(job.salaryMin / 1000000).toFixed(0)}M - ${(job.salaryMax / 1000000).toFixed(0)}M`
      : "Theo thỏa thuận";

  return (
    <div
      onClick={() => onView(job)}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted/50 cursor-pointer shadow-sm hover:border-primary/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 border border-primary/20">
        {job.jobCode ? job.jobCode.slice(-3) : "JD"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {job.publicTitle}
          </p>
          <Badge config={statusCfg} />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {deptName} · {job.level} · Lương: {salaryDisplay}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(job);
          }}
          className="p-2 rounded hover:bg-purple-50 text-purple-600 transition-colors"
          title="Xem trước bài đăng"
        >
          <Eye size={16} />
        </button>

        <Link
          href={`/${locale}/ats/jobs-management/${job.id}`}
          onClick={(e) => e.stopPropagation()}
          prefetch={false}
          className="p-2 rounded hover:bg-primary/10 text-primary transition-colors inline-flex items-center justify-center"
          title="Chi tiết bài đăng"
        >
          <ExternalLink size={16} />
        </Link>
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

  // Realtime Sync Listener
  useSyncAtsEventsQuery();

  // State Management
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [previewJob, setPreviewJob] = useState<JobPost | null>(null);

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

  // Tải danh mục phòng ban
  const { data: deptFilterRes } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });

  // ─── RTK QUERY HOOKS ───
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
    //   isTemplate: false,
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

  console.log("job posts", listRes);

  
  // Debounced URL Sync
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

  // ─── TABLE COLUMNS ───
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
                className="p-2 rounded hover:bg-purple-50 text-purple-600 transition-colors border border-transparent hover:border-purple-200"
                title="Xem trước định dạng bài đăng"
              >
                <Eye size={14} />
              </button>

              <Link
                href={`/${locale}/ats/jobs-management/${job.id}`}
                prefetch={false}
                className="p-2 rounded hover:bg-primary/10 text-primary transition-colors border border-transparent hover:border-primary/20 inline-flex items-center justify-center"
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

  // Facet Options
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

  const mobileFacetFiltersNode = (
    <MobileFilterSheet
      activeCount={activeFilterCount}
      onClearAll={clearAllFilters}
    >
      {facetFiltersNode}
    </MobileFilterSheet>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Bản Tin Tuyển Dụng
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} bản tin · Quản lý xuất bản đa kênh & thu hút ứng viên
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Ban_tin_Tuyen_dung_2026.xlsx";
              }}
              loadingMessage="Đang chuẩn bị file..."
              successMessage={(file) => `Đã tải xuống ${file}`}
            >
              <Download size={14} /> Xuất Excel
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await refetch();
              }}
              loadingMessage="Đang làm mới..."
              successMessage="Dữ liệu đã được cập nhật"
            >
              <RefreshCw size={14} /> Làm mới
            </ActionButton>

            <ActionButton
              variant="primary"
              className="!h-8 !px-3 !py-0 !text-xs"
              onClick={() => router.push(`/${locale}/ats/request-management`)}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Khởi tạo từ Yêu cầu</span>
              <span className="sm:hidden">Tạo tin</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto md:hidden px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {totalRows} bản tin
          </span>
          {mobileFacetFiltersNode}
        </div>
        <div className="relative mb-3">
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
            className="input-base pl-9 py-1.5 text-xs w-full"
          />
        </div>
        {jobsData.length === 0 && !isDataLoading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Search size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không tìm thấy bản tin tuyển dụng
            </p>
          </div>
        ) : (
          jobsData.map((job: JobPost) => (
            <JobPostCard
              key={job.id}
              job={job}
              locale={locale}
              onView={setSelectedJob}
              onPreview={setPreviewJob}
            />
          ))
        )}
      </div>

      {/* DESKTOP DATA TABLE */}
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
          mobileFacetFilters={mobileFacetFiltersNode}
          isLoading={isDataLoading}
          skeletonRowCount={8}
          enableMultiRowSelection={true}
          onRowClick={(row) => setSelectedJob(row.original)}
        />
      </div>

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