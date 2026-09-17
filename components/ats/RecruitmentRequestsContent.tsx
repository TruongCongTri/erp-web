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
  X,
  Send,
  Hash,
} from "lucide-react";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  MobileFilterSheet,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ─── API HOOKS & TYPES ───────────────────────────────────────────────────────
import {
  useGetRecruitmentRequestsQuery,
  useCreateRecruitmentRequestMutation,
  useSyncAtsEventsQuery,
  RecruitmentRequestStatus,
  RecruitmentRequest,
} from "@/lib/store/atsApiSlice";
import { useGetDepartmentsQuery } from "@/lib/store/departmentApiSlice";
import RecruitmentRequestDrawer from "./RecruitmentRequestDrawer";
import { SearchableSelect, SelectOption } from "../buttons/SearchableSelect";

// ─── STATUS CONFIG (ĐỒNG BỘ 100% VỚI BACKEND & ENUMS) ────────────────────────
const REQ_STATUS_CONFIG: Record<
  RecruitmentRequestStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  [RecruitmentRequestStatus.PENDING_HR]: {
    label: "HR tiếp nhận",
    className: "badge-warning",
    icon: Clock,
  },
  [RecruitmentRequestStatus.DRAFTED]: {
    label: "Đã soạn thảo",
    className: "badge-neutral",
    icon: FileText,
  },
  [RecruitmentRequestStatus.PENDING_HEAD_APPROVAL]: {
    label: "Chờ duyệt JD",
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: ShieldCheck,
  },
  [RecruitmentRequestStatus.APPROVED]: {
    label: "Sẵn sàng đăng",
    className: "badge-success",
    icon: CheckCircle,
  },
  [RecruitmentRequestStatus.REJECTED]: {
    label: "Bị từ chối",
    className: "badge-danger",
    icon: XCircle,
  },
  [RecruitmentRequestStatus.COMPLETED]: {
    label: "Hoàn thành",
    className: "bg-emerald-600 text-white border-emerald-600",
    icon: CheckCircle,
  },
  [RecruitmentRequestStatus.CANCELLED]: {
    label: "Đã hủy",
    className:
      "bg-slate-200 text-slate-600 border-slate-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
    icon: XCircle,
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

// ─── Modal Tạo Yêu cầu (Gửi ghi chú thô tới HR) ──────────────────────────────
function HireRequestModal({
  onClose,
  onSubmit,
  isCreating,
}: {
  onClose: () => void;
  onSubmit: (data: { rawRequestNote: string; departmentId: string }) => void;
  isCreating: boolean;
}) {
  const [departmentId, setDepartmentId] = useState<string>("");
  const [rawRequestNote, setRawRequestNote] = useState("");

  // Tải danh sách phòng ban từ departmentApiSlice
  const { data: deptRes, isLoading: isDeptLoading } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });
  const departments = deptRes?.data || [];

  // Chuẩn hóa dữ liệu thành Options cho SearchableSelect
  const departmentOptions = useMemo<SelectOption<string>[]>(
    () =>
      departments.map((d) => ({
        value: d.id,
        label: `[${d.code}] ${d.name}`,
        description: d.description || undefined,
        icon: <Building2 size={13} className="text-muted-foreground" />,
      })),
    [departments]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!departmentId) {
      gooeyToast.error("Vui lòng chọn phòng ban tiếp nhận.");
      return;
    }

    if (!rawRequestNote.trim()) {
      gooeyToast.error("Vui lòng nhập mô tả yêu cầu tuyển dụng.");
      return;
    }

    onSubmit({ rawRequestNote: rawRequestNote.trim(), departmentId });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Gửi Yêu cầu Tuyển dụng
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Dành cho Trưởng bộ phận (Gửi yêu cầu thô tới HR)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Phòng ban đề xuất <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={departmentOptions}
              value={departmentId}
              onChange={(val) => setDepartmentId(val || "")}
              placeholder={
                isDeptLoading
                  ? "Đang tải danh sách phòng ban..."
                  : "Chọn phòng ban đề xuất..."
              }
              searchPlaceholder="Tìm kiếm theo tên, mã phòng ban..."
              disabled={isDeptLoading || isCreating}
              isClearable
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Mô tả yêu cầu tuyển dụng <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={rawRequestNote}
              onChange={(e) => setRawRequestNote(e.target.value)}
              placeholder="VD: Cần tuyển gấp 2 Kỹ sư MEP hiện trường dự án Đồng Nai. Ưu tiên có kinh nghiệm shop drawing và giám sát thi công thực tế..."
              className="input-base w-full text-xs resize-none leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Chỉ cần nhập ghi chú yêu cầu tóm tắt. Bộ phận HR sẽ tiếp nhận,
              dùng AI hỗ trợ chuẩn hóa thành JD hoàn chỉnh và gửi lại để duyệt.
            </p>
          </div>

          <div className="flex gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="btn-secondary flex-1 text-xs h-9 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!rawRequestNote.trim() || !departmentId || isCreating}
              className="btn-primary flex-1 text-xs h-9 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {isCreating ? "Đang gửi..." : "Gửi tới HR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Mobile Card Component ───────────────────────────────────────────────────
function RequisitionCard({
  req,
  locale,
  onView,
}: {
  req: RecruitmentRequest;
  locale: string;
  onView: (r: RecruitmentRequest) => void;
}) {
  const statusCfg =
    REQ_STATUS_CONFIG[req.status] ||
    REQ_STATUS_CONFIG[RecruitmentRequestStatus.PENDING_HR];

  const rawReq = req as any;

  const title =
    rawReq.jobPost?.publicTitle ||
    rawReq.rawRequestNote ||
    rawReq.jobTitle ||
    rawReq.requestCode ||
    "Yêu cầu tuyển dụng mới";

  const deptRaw = req.department;
  const deptName =
    typeof deptRaw === "object" && deptRaw !== null && "name" in deptRaw
      ? (deptRaw as any).name
      : typeof deptRaw === "string"
        ? deptRaw
        : "Chưa gán ban";

  const headcount = rawReq.jobPost?.headcount ?? rawReq.headcount ?? 1;
  const requestCode = rawReq.requestCode;
  return (
    <div
      onClick={() => onView(req)}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted/50 cursor-pointer shadow-sm hover:border-primary/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 border border-primary/20">
        {requestCode ? requestCode.slice(-3) : title.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {title}
          </p>
          <Badge config={statusCfg} />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {deptName} · SL: {headcount}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(req);
          }}
          className="p-2 rounded hover:bg-muted text-muted-foreground transition-colors"
          title="Xem nhanh"
        >
          <Eye size={16} />
        </button>

        <Link
          href={`/${locale}/ats/request-management/${req.id}`}
          onClick={(e) => e.stopPropagation()}
          prefetch={false}
          className="p-2 rounded hover:bg-primary/10 text-primary transition-colors inline-flex items-center justify-center"
          title="Chi tiết Yêu cầu"
        >
          <ExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─── Main Content Component ──────────────────────────────────────────────────
export default function RecruitmentRequestsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useMemo(() => pathname.split("/")[1] || "vi", [pathname]);

  // Realtime Sync Listener
  useSyncAtsEventsQuery();

  // State Management
  const [selectedReq, setSelectedReq] = useState<RecruitmentRequest | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter & Pagination States
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [deptFilter, setDeptFilter] = useState<string[]>(
    searchParams.get("dept")?.split(",").filter(Boolean) || [],
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  // Tải danh mục phòng ban cho Facet Filter
  const { data: deptFilterRes } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });

  // ─── RTK QUERY HOOKS ───
  const {
    data: listRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetRecruitmentRequestsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    status:
      statusFilter.length === 1
        ? (statusFilter[0] as RecruitmentRequestStatus)
        : undefined,
    departmentId: deptFilter.length === 1 ? deptFilter[0] : undefined,
  });

  const [createRequest, { isLoading: isCreating }] =
    useCreateRecruitmentRequestMutation();

  const isDataLoading = isLoading || isFetching;
  const requestsData: RecruitmentRequest[] = listRes?.data || [];
  const totalRows = listRes?.meta?.pagination?.total || 0;
  const pageCount = listRes?.meta?.pagination?.total_page || 1;

  // Debounced URL Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (globalFilter.trim()) params.set("q", globalFilter.trim());
      if (deptFilter.length) params.set("dept", deptFilter.join(","));
      if (statusFilter.length) params.set("status", statusFilter.join(","));

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
  }, [globalFilter, deptFilter, statusFilter, pagination, pathname, router]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // ─── WORKFLOW ACTION (TẠO TỪ GHI CHÚ THÔ) ───
  const handleCreateRequest = async (formData: {
    rawRequestNote: string;
    departmentId: string;
  }) => {
    console.log(formData.departmentId);

    try {
      const res = await createRequest({
        rawRequestNote: formData.rawRequestNote,
        departmentId: formData.departmentId,
      }).unwrap();

      setShowCreateForm(false);
      gooeyToast.success("Đã gửi yêu cầu tuyển dụng tới HR!");

      if (res?.data?.id) {
        router.push(`/${locale}/ats/request-management/${res.data.id}`);
      }
    } catch (err: any) {
      gooeyToast.error(
        err?.data?.message || "Lỗi khi khởi tạo yêu cầu tuyển dụng.",
      );
    }
  };

  // ─── TABLE COLUMNS ───
  const columns = useMemo<ColumnDef<StockFeatures, RecruitmentRequest, any>[]>(
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
        accessorKey: "requestCode",
        size: 130,
        meta: { title: "Mã yêu cầu" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Mã yêu cầu</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary">
            <Hash size={12} className="opacity-50" />
            {getValue() || "—"}
          </span>
        ),
      },
      {
        id: "jobTitle",
        size: 280,
        meta: { title: "Vị trí tuyển dụng" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Nội dung / Chức danh</SortHeader>
        ),
        cell: ({ row }: any) => {
          const title =
            row.original.jobPost?.publicTitle ||
            (row.original as any).jobTitle ||
            row.original.rawRequestNote ||
            "Yêu cầu tuyển dụng mới";

          const requesterName =
            row.original.requester?.fullName || "Trưởng bộ phận";

          return (
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
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
                  Đề xuất bởi: {requesterName}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        size: 180,
        meta: { title: "Phòng ban" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban</SortHeader>
        ),
        cell: ({ row }: any) => {
          const dept = row.original.department;
          const deptName =
            dept?.name || (typeof dept === "string" ? dept : "—");
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
        id: "headcount",
        size: 90,
        meta: { title: "Số lượng" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Số lượng
          </span>
        ),
        cell: ({ row }: any) => {
          const count =
            row.original.jobPost?.headcount ??
            (row.original as any).headcount ??
            "—";
          return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Users size={12} className="text-muted-foreground/50" /> {count}{" "}
              {typeof count === "number" ? "người" : ""}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        size: 150,
        meta: { title: "Trạng thái" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Trạng thái</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const config =
            REQ_STATUS_CONFIG[getValue() as RecruitmentRequestStatus] ||
            REQ_STATUS_CONFIG[RecruitmentRequestStatus.PENDING_HR];
          return <Badge config={config} />;
        },
      },
      {
        id: "budgetRange",
        size: 150,
        meta: { title: "Ngân sách" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Ngân sách
          </span>
        ),
        cell: ({ row }: any) => {
          const jobPost = row.original.jobPost;
          if (jobPost) {
            if (jobPost.isSalaryNegotiable) {
              return (
                <span className="text-xs text-muted-foreground italic">
                  Thỏa thuận
                </span>
              );
            }
            if (jobPost.salaryMin || jobPost.salaryMax) {
              const minStr = jobPost.salaryMin
                ? `${(jobPost.salaryMin / 1_000_000).toFixed(0)}M`
                : "0";
              const maxStr = jobPost.salaryMax
                ? `${(jobPost.salaryMax / 1_000_000).toFixed(0)}M`
                : "Max";
              return (
                <span className="text-xs text-foreground font-medium tabular-nums">
                  {minStr} - {maxStr} VNĐ
                </span>
              );
            }
          }

          const legacyMin = (row.original as any).targetSalaryMin;
          const legacyMax = (row.original as any).targetSalaryMax;
          if (legacyMin || legacyMax) {
            return (
              <span className="text-xs text-foreground font-medium tabular-nums">
                {legacyMin ? `${legacyMin}M` : "0"} -{" "}
                {legacyMax ? `${legacyMax}M` : "Max"} VNĐ
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
        accessorKey: "createdAt",
        size: 110,
        meta: { title: "Ngày gửi" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Ngày gửi</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const dateStr = getValue();
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        size: 90,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => {
          const req: RecruitmentRequest = row.original;
          return (
            <div
              className="flex items-center justify-end gap-1.5"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedReq(req)}
                className="p-2 rounded hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border"
                title="Xem nhanh"
              >
                <Eye size={14} />
              </button>

              <Link
                href={`/${locale}/ats/request-management/${req.id}`}
                prefetch={false}
                className="p-2 rounded hover:bg-primary/10 text-primary transition-colors border border-transparent hover:border-primary/20 inline-flex items-center justify-center"
                title="Chi tiết & Soạn JD"
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

  // Facet Options lấy danh mục từ API phòng ban
  const deptOptions = useMemo(
    () =>
      deptFilterRes?.data?.map((d) => ({
        value: d.id, // Giá trị lọc là UUID chuẩn của phòng ban
        label: `[${d.code}] ${d.name}`,
        count: 0,
      })) || [],
    [deptFilterRes],
  );

  const statusOptions = useMemo(
    () =>
      Object.entries(REQ_STATUS_CONFIG).map(([val, cfg]) => ({
        value: val,
        label: cfg.label,
        count: 0,
      })),
    [],
  );

  const activeFilterCount = deptFilter.length + statusFilter.length;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setDeptFilter([]);
    setStatusFilter([]);
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
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="ml-2 text-xs text-red-600 hover:underline"
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
              Yêu Cầu Tuyển Dụng
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} yêu cầu · Quy trình phối hợp Trưởng phòng & HR
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Yeu_cau_Tuyen_dung_2026.xlsx";
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
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Gửi yêu cầu tuyển dụng</span>
              <span className="sm:hidden">Gửi yêu cầu</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto md:hidden px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {totalRows} yêu cầu
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
            placeholder="Tìm theo chức danh, nội dung..."
            className="input-base pl-9 py-1.5 text-xs w-full"
          />
        </div>
        {requestsData.length === 0 && !isDataLoading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Search size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không tìm thấy yêu cầu
            </p>
          </div>
        ) : (
          requestsData.map((req: RecruitmentRequest) => (
            <RequisitionCard
              key={req.id}
              req={req}
              locale={locale}
              onView={setSelectedReq}
            />
          ))
        )}
      </div>

      {/* DESKTOP DATA TABLE */}
      <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
        <DataTable
          columns={columns}
          data={requestsData}
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
          onRowClick={(row) => setSelectedReq(row.original)}
        />
      </div>

      {/* DRAWER XEM NHANH */}
      {selectedReq && (
        <RecruitmentRequestDrawer
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          locale={locale}
          onNavigateDetail={() => {
            router.push(`/${locale}/ats/request-management/${selectedReq.id}`);
          }}
        />
      )}

      {/* MODAL TẠO YÊU CẦU THÔ */}
      {showCreateForm && (
        <HireRequestModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateRequest}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}
