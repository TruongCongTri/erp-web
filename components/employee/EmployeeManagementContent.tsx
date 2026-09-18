/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type {
  ColumnDef,
  StockFeatures,
  PaginationState,
} from "@tanstack/react-table";
import {
  Download,
  RefreshCw,
  Eye,
  Edit,
  UserX,
  MoreHorizontal,
  Search,
  ExternalLink,
  Plus,
  X,
  UserCheck,
  Calendar,
  AlertTriangle,
  Briefcase,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
} from "lucide-react";

import EmployeeDrawer from "./EmployeeDrawer";
import {
  DataTable,
  SortHeader,
  FacetFilter,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import Link from "next/link";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ─── API HOOKS ───────────────────────────────────────────────────────────────
import {
  useGetAuthUsersQuery,
  useGetAuthUserDetailsQuery,
  useUnlockIdentityDataMutation,
  useUnlockFinancialDataMutation,
} from "@/lib/store/hrApiSlice";

// ─── TYPES & CONFIGS ─────────────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  ACTIVE: "Đang làm việc",
  ON_LEAVE: "Nghỉ phép",
  SUSPENDED: "Tạm đình chỉ",
  TERMINATED: "Đã nghỉ việc",
  INACTIVE: "Đã nghỉ",
};

const contractLabels: Record<string, string> = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  contractor: "Nhà thầu",
};

const DEPARTMENTS = [
  "Khối Thi công",
  "Khối Dự toán",
  "Khối Vận hành & Hậu cần",
  "Ban Giám đốc",
  "Hành chính Nhân sự",
  "Kế toán",
  "Kỹ thuật",
];

// ─── Whisper Badge Component ───────────────────────────────────────────────────
function Badge({
  config,
}: {
  config: { label: string; className: string; icon?: React.ElementType };
}) {
  const Icon = config.icon;
  return (
    <span className={`badge ${config.className} text-[10px] px-1.5 py-0.5`}>
      {Icon && <Icon size={11} />}
      {config.label}
    </span>
  );
}

// ─── Whisper State Configurations ──────────────────────────────────────────────
const hrisStatusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  ACTIVE: {
    label: "Đang làm việc",
    className: "badge-hris-active",
    icon: UserCheck,
  },
  ON_LEAVE: {
    label: "Nghỉ phép",
    className: "badge-hris-leave",
    icon: Calendar,
  },
  SUSPENDED: {
    label: "Tạm đình chỉ",
    className: "badge-hris-action",
    icon: AlertTriangle,
  },
  TERMINATED: {
    label: "Đã nghỉ việc",
    className: "badge-hris-terminated",
    icon: UserX,
  },
  INACTIVE: {
    label: "Đã nghỉ",
    className: "badge-neutral",
    icon: UserX,
  },
};

const contractConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  "full-time": {
    label: "Toàn thời gian",
    className: "badge-info",
    icon: Briefcase,
  },
  "part-time": {
    label: "Bán thời gian",
    className: "badge-warning",
    icon: Clock,
  },
  contractor: { label: "Nhà thầu", className: "badge-neutral", icon: FileText },
};

// ─── Table-Row Styled Mobile Item Component ───────────────────────────────────
function MobileEmployeeRow({
  employee,
  locale,
  onQuickView,
}: {
  employee: any;
  locale: string;
  onQuickView: (e: any) => void;
}) {
  const router = useRouter();
  const statusCfg =
    hrisStatusConfig[employee.status] || hrisStatusConfig.INACTIVE;

  return (
    <div
      onClick={() => router.push(`/${locale}/hr/employee-management/${employee.id}`)}
      className="flex items-center justify-between py-2.5 px-3 border-b border-border/60 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer group text-xs select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2.5 flex-1">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-2xs">
          {employee.fullName?.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="font-semibold text-foreground text-xs truncate">
              {employee.fullName}
            </p>
            <Badge config={statusCfg} />
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {employee.profile?.jobTitle || "Chưa cập nhật"} · {employee.profile?.department || "Chưa gán ban"}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onQuickView(employee)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Xem nhanh Drawer"
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/hr/employee-management/${employee.id}`)}
          className="p-1.5 rounded-md text-muted-foreground/60 group-hover:text-primary transition-colors"
          title="Trang chi tiết nhân viên"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function EmployeeManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useMemo(() => pathname.split("/")[1] || "vi", [pathname]);

  // ─── STATE MANAGEMENT ───
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Secure Flow States
  const [unlockedData, setUnlockedData] = useState<any>(null);

  // Filter & Pagination States
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [deptFilter, setDeptFilter] = useState<string[]>(
    searchParams.get("dept")?.split(",").filter(Boolean) || [],
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [contractFilter, setContractFilter] = useState<string[]>(
    searchParams.get("contract")?.split(",").filter(Boolean) || [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  // ─── API HOOKS ───
  const {
    data: usersRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAuthUsersQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    department: deptFilter.length > 0 ? deptFilter.join(",") : undefined,
    status: statusFilter.length > 0 ? statusFilter.join(",") : undefined,
    contractType:
      contractFilter.length > 0 ? contractFilter.join(",") : undefined,
  });

  const { data: userDetailsRes, isFetching: isDetailsFetching } =
    useGetAuthUserDetailsQuery(selectedEmployee?.id ?? "", {
      skip: !selectedEmployee?.id,
    });

  const [unlockIdentity] = useUnlockIdentityDataMutation();
  const [unlockFinancial] = useUnlockFinancialDataMutation();

  const isDataLoading = isLoading || isFetching;
  const usersData = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
  const totalRows = Array.isArray(usersRes)
    ? usersData.length
    : usersRes?.meta?.pagination?.total || usersData.length;
  const pageCount = Array.isArray(usersRes)
    ? 1
    : usersRes?.meta?.pagination?.total_page || 1;

  // ─── DATA MERGING ───
  const activeEmployeeData = useMemo(() => {
    if (!selectedEmployee) return null;
    let base = { ...selectedEmployee, _isFetching: isDetailsFetching };

    if (userDetailsRes?.data) {
      base = { ...base, ...userDetailsRes.data };
    }
    if (unlockedData) {
      base = { ...base, ...unlockedData };
    }

    return base;
  }, [selectedEmployee, userDetailsRes, isDetailsFetching, unlockedData]);

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (globalFilter) params.set("q", globalFilter);
    if (deptFilter.length) params.set("dept", deptFilter.join(","));
    if (statusFilter.length) params.set("status", statusFilter.join(","));
    if (contractFilter.length) params.set("contract", contractFilter.join(","));

    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      params.set("limit", pagination.pageSize.toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    globalFilter,
    deptFilter,
    statusFilter,
    contractFilter,
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

  // ─── SECURITY & UI HANDLERS ───
  const handleSelectEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setUnlockedData(null);
  };

  const handleCloseDetail = () => {
    setSelectedEmployee(null);
    setUnlockedData(null);
  };

  const handleUnlockSubmit = async (
    target: "identity" | "financial",
    passwordInput: string,
  ) => {
    if (!selectedEmployee?.id) return;

    let res: any;
    if (target === "identity") {
      res = await unlockIdentity({
        id: selectedEmployee.id,
        passwordDto: { password: passwordInput },
      }).unwrap();
    } else if (target === "financial") {
      res = await unlockFinancial({
        id: selectedEmployee.id,
        passwordDto: { password: passwordInput },
      }).unwrap();
    }

    setUnlockedData((prev: any) => ({
      ...prev,
      [target === "identity" ? "identityData" : "financialData"]: res?.data,
    }));
    gooeyToast.success("Mở khóa dữ liệu thành công");
  };

  const columns = useMemo<ColumnDef<StockFeatures, any, any>[]>(
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
        id: "code",
        accessorFn: (row) => row.profile?.employeeCode || "-",
        size: 110,
        meta: { title: "Mã NV" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Mã NV
          </span>
        ),
        cell: ({ getValue }: any) => (
          <code className="text-[11px] text-muted-foreground font-mono">
            {getValue()}
          </code>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "fullName",
        size: 250,
        meta: { title: "Họ và tên" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Họ và tên</SortHeader>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
              {row.original.fullName?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {row.original.fullName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "department",
        accessorFn: (row) => row.profile?.department || "Chưa cập nhật",
        size: 160,
        meta: { title: "Phòng ban" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-foreground truncate block">
            {getValue()}
          </span>
        ),
      },
      {
        id: "jobTitle",
        accessorFn: (row) => row.profile?.jobTitle || "Chưa cập nhật",
        size: 160,
        meta: { title: "Chức vụ" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Chức vụ</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-foreground truncate block">
            {getValue()}
          </span>
        ),
      },
      {
        id: "contractType",
        accessorFn: (row) => row.profile?.contractType || "full-time",
        size: 140,
        meta: { title: "Hợp đồng" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Hợp đồng
          </span>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as string;
          const config = contractConfig[val] ?? {
            label: val,
            className: "badge-neutral",
            icon: FileText,
          };
          return <Badge config={config} />;
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
          const val = getValue() as string;
          return (
            <Badge
              config={hrisStatusConfig[val] || hrisStatusConfig.INACTIVE}
            />
          );
        },
      },
      {
        id: "joinDate",
        accessorFn: (row) => row.profile?.joinDate || row.createdAt,
        size: 120,
        meta: { title: "Ngày vào làm" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Ngày vào làm</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue();
          if (!val)
            return <span className="text-xs text-muted-foreground">-</span>;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {new Date(val).toLocaleDateString("vi-VN")}
            </span>
          );
        },
      },
      {
        id: "actions",
        size: 160,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => (
          <div
            className="flex items-center justify-end gap-0.5"
            onClick={(e: any) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handleSelectEmployee(row.original)}
              className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer"
              title="Xem nhanh"
            >
              <Eye size={14} />
            </button>

            <Link
              href={`/${locale}/hr/employee-management/${row.original.id}`}
              className="p-1.5 rounded hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition-colors inline-flex items-center justify-center"
              title="Xem trang chi tiết"
            >
              <ExternalLink size={14} />
            </Link>

            <ActionButton
              isUnderDevelopment
              iconOnly
              variant="ghost"
              tooltip="Chỉnh sửa"
              className="!w-7 !h-7 !p-0 hover:bg-green-50 hover:text-green-600 text-muted-foreground"
            >
              <Edit size={14} />
            </ActionButton>

            <ActionButton
              iconOnly
              variant="ghost"
              tooltip="Tạm đình chỉ"
              className="!w-7 !h-7 !p-0 hover:bg-red-50 hover:text-red-600 text-muted-foreground"
              requireConfirm
              confirmTitle="Tạm đình chỉ nhân sự?"
              confirmMessage={`Xác nhận tạm đình chỉ ${row.original.fullName}? Hệ thống sẽ ngay lập tức thu hồi mọi quyền truy cập.`}
              confirmLabel="Đình chỉ"
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return row.original.fullName;
              }}
              loadingMessage="Đang xử lý..."
              successMessage={(name) => `Đã tạm đình chỉ ${name}.`}
            >
              <UserX size={14} />
            </ActionButton>

            <button
              type="button"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Thêm tùy chọn"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [locale],
  );

  // Facet Options
  const deptOptions = useMemo(
    () => DEPARTMENTS.map((d) => ({ value: d, label: d, count: 0 })),
    [],
  );
  const statusOptions = useMemo(
    () =>
      Object.entries(statusLabels).map(([val, label]) => ({
        value: val,
        label,
        count: 0,
      })),
    [],
  );
  const contractOptions = useMemo(
    () =>
      Object.entries(contractLabels).map(([val, label]) => ({
        value: val,
        label,
        count: 0,
      })),
    [],
  );

  const activeFilterCount =
    deptFilter.length + statusFilter.length + contractFilter.length;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setDeptFilter([]);
    setStatusFilter([]);
    setContractFilter([]);
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
        label="Hợp đồng"
        options={contractOptions}
        selected={contractFilter}
        onChange={(v) => handleFilterChange(setContractFilter, v)}
      />
      {activeFilterCount > 0 && (
        <button
          type="button"
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Quản lý Nhân viên
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} nhân viên · Quản lý tập trung hồ sơ nhân sự
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Danh_sach_Nhan_vien_2026.xlsx";
              }}
              loadingMessage="Đang chuẩn bị file..."
              successMessage={(file) => `Đã tải xuống ${file}`}
              toastOptions={{
                showProgress: true,
                duration: 5000,
              }}
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
              isUnderDevelopment
              variant="primary"
              isLoading={isDataLoading}
              className="!h-8 !px-2 sm:!px-3 !py-0 !text-xs"
              title="Thêm nhân viên"
            >
              <Plus size={14} className="shrink-0" />
              <span className="hidden sm:inline">Thêm nhân viên</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── MOBILE LIST VIEW (< md) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden">
        {/* Search & Filter Trigger Bar */}
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
              placeholder="Tìm theo tên, email, mã NV..."
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
          {usersData.length === 0 && !isDataLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Search size={28} className="text-muted-foreground/30" />
              <p className="text-xs font-semibold text-muted-foreground">
                Không tìm thấy nhân viên nào phù hợp
              </p>
            </div>
          ) : (
            usersData.map((emp: any) => (
              <MobileEmployeeRow
                key={emp.id}
                employee={emp}
                locale={locale}
                onQuickView={handleSelectEmployee}
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
          data={usersData}
          pageCount={pageCount}
          totalRows={totalRows}
          globalFilter={globalFilter}
          onGlobalFilterChange={(v) => handleFilterChange(setGlobalFilter, v)}
          pagination={pagination}
          onPaginationChange={setPagination}
          tabletHiddenColumns={["joinDate", "manager"]}
          facetFilters={facetFiltersNode}
          isLoading={isDataLoading}
          skeletonRowCount={8}
          enableMultiRowSelection={true}
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
                  Lọc &amp; Sắp xếp nhân sự
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
              {/* Filter: Phòng ban */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Phòng ban trực thuộc
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

              {/* Filter: Trạng thái nhân sự */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Trạng thái làm việc
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

              {/* Filter: Loại hợp đồng */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Loại hợp đồng
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {contractOptions.map((opt) => {
                    const isSelected = contractFilter.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? contractFilter.filter((v) => v !== opt.value)
                            : [opt.value];
                          handleFilterChange(setContractFilter, next);
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

      {/* ── PASS ACTIVE EMPLOYEE DATA TO DRAWER ── */}
      <EmployeeDrawer
        employee={activeEmployeeData}
        onClose={handleCloseDetail}
        onUnlock={handleUnlockSubmit}
        onWipeData={() => setUnlockedData(null)}
      />
    </div>
  );
}