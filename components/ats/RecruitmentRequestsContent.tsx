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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
} from "lucide-react";

import {
  DataTable,
  SortHeader,
  FacetFilter,
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
    <span className={`badge ${config.className} text-[10px] px-1.5 py-0.5`}>
      {Icon && <Icon size={11} />}
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

  const { data: deptRes, isLoading: isDeptLoading } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });
  const departments = deptRes?.data || [];

  const departmentOptions = useMemo<SelectOption<string>[]>(
    () =>
      departments.map((d) => ({
        value: d.id,
        label: `[${d.code}] ${d.name}`,
        description: d.description || undefined,
        icon: <Building2 size={13} className="text-muted-foreground" />,
      })),
    [departments],
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
              placeholder="VD: Cần tuyển gấp 2 Kỹ sư MEP hiện trường dự án Đồng Nai. Ưu tiên có kinh nghiệm shop drawing..."
              className="input-base w-full text-xs resize-none leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Chỉ cần nhập ghi chú yêu cầu tóm tắt. Bộ phận HR sẽ tiếp nhận và
              chuẩn hóa JD.
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

// ─── Table-Row Item Component For Mobile ────────────────────────────────────
function MobileRequisitionRow({
  req,
  locale,
  onQuickView,
}: {
  req: RecruitmentRequest;
  locale: string;
  onQuickView: (r: RecruitmentRequest) => void;
}) {
  const router = useRouter();
  const rawReq = req as any;

  const statusCfg =
    REQ_STATUS_CONFIG[req.status] ||
    REQ_STATUS_CONFIG[RecruitmentRequestStatus.PENDING_HR];

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
      onClick={() => router.push(`/${locale}/ats/request-management/${req.id}`)}
      className="flex items-center justify-between py-2.5 px-3 border-b border-border/60 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer group text-xs select-none"
    >
      <div className="flex-1 min-w-0 pr-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-mono text-[10px] font-bold text-primary">
            #{requestCode ? requestCode.slice(-4) : "REQ"}
          </span>
          <Badge config={statusCfg} />
        </div>
        <p className="font-semibold text-foreground text-xs truncate leading-snug">
          {title}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 truncate">
          <span className="truncate max-w-[130px]">{deptName}</span>
          <span>•</span>
          <span>{headcount} người</span>
          <span>•</span>
          <span>{new Date(req.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onQuickView(req)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Xem nhanh"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(`/${locale}/ats/request-management/${req.id}`)
          }
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
export default function RecruitmentRequestsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useMemo(() => pathname.split("/")[1] || "vi", [pathname]);

  useSyncAtsEventsQuery();

  const [selectedReq, setSelectedReq] = useState<RecruitmentRequest | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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

  const { data: deptFilterRes } = useGetDepartmentsQuery({
    isActive: true,
    limit: 100,
    sortBy: "name",
    sortOrder: "ASC",
  });

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

  const handleCreateRequest = async (formData: {
    rawRequestNote: string;
    departmentId: string;
  }) => {
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
              Yêu Cầu Tuyển Dụng
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} yêu cầu · Quy trình phối hợp Trưởng phòng &amp; HR
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Yeu_cau_Tuyen_dung_2026.xlsx";
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
              onClick={() => setShowCreateForm(true)}
              title="Gửi yêu cầu tuyển dụng"
            >
              <Plus size={14} className="shrink-0" />
              <span className="hidden sm:inline">Gửi yêu cầu tuyển dụng</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── MOBILE LIST VIEW (< md) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden">
        {/* Mobile Search & Drawer Trigger */}
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
              placeholder="Tìm theo chức danh, mã..."
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
          {requestsData.length === 0 && !isDataLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Search size={28} className="text-muted-foreground/30" />
              <p className="text-xs font-semibold text-muted-foreground">
                Không tìm thấy yêu cầu nào phù hợp
              </p>
            </div>
          ) : (
            requestsData.map((req: RecruitmentRequest) => (
              <MobileRequisitionRow
                key={req.id}
                req={req}
                locale={locale}
                onQuickView={setSelectedReq}
              />
            ))
          )}
        </div>

        {/* ── MOBILE BOTTOM PAGINATION (FIXED/DOCKED) ── */}
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
          data={requestsData}
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
          onRowClick={(row) => setSelectedReq(row.original)}
        />
      </div>

      {/* ── BOTTOM DRAWER FOR MOBILE FILTER & SORT ── */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-card rounded-t-2xl border-t border-border p-4 max-h-[80vh] flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Lọc &amp; Sắp xếp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Filter: Trạng thái */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Trạng thái
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
                            : [opt.value]; // single select mode for backend consistency
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

              {/* Filter: Phòng ban */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Phòng ban
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto border border-border/60 rounded-lg p-2 bg-muted/10">
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

            {/* Modal Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-secondary text-xs h-9 px-3 text-red-600"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="btn-primary text-xs h-9 flex-1"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

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
