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
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  UserX,
  MoreHorizontal,
  Search,
  ExternalLink,
  UserCheck,
  Calendar,
  AlertTriangle,
  Briefcase,
  Clock,
  FileText,
} from "lucide-react";

import EmployeeDrawer from "./EmployeeDrawer";
import {
  DataTable,
  SortHeader,
  FacetFilter,
  MobileFilterSheet,
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
    <span className={`badge ${config.className}`}>
      {Icon && <Icon size={12} />}
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

// ─── Mobile Card Component ─────────────────────────────────────────────────────
function EmployeeCard({
  employee,
  onView,
}: {
  employee: any;
  onView: (e: any) => void;
}) {
  const statusCfg =
    hrisStatusConfig[employee.status] || hrisStatusConfig.INACTIVE;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted/50 cursor-pointer"
      onClick={() => onView(employee)}
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {employee.fullName?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {employee.fullName}
          </p>
          <Badge config={statusCfg} />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {employee.profile?.jobTitle || "Chưa cập nhật"}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {employee.profile?.department || "Chưa cập nhật"}
        </p>
      </div>
      <Eye size={16} className="text-muted-foreground flex-shrink-0" />
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function EmployeeManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ─── STATE MANAGEMENT ───
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  // Secure Flow States
  const [unlockedData, setUnlockedData] = useState<any>(null); // Stores sensitive data temporarily

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
  // Merge basic table data + fetched deep data + temporarily unlocked sensitive data
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
    // CRITICAL: Wipe any previously unlocked data when switching users
    setUnlockedData(null);
  };

  const handleCloseDetail = () => {
    setSelectedEmployee(null);
    // CRITICAL: Wipe the unmasked data from memory when the drawer closes
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

    // Merge the unmasked data into our local secure state under the correct key
    setUnlockedData((prev: any) => ({
      ...prev,
      [target === "identity" ? "identityData" : "financialData"]: res?.data,
    }));
    gooeyToast.success("Mở khóa dữ liệu thành công");
  };

  // 2. Updated Columns mapped to API UserData structure
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
            {/* Sync UI Toggle -> Keep Native Button */}
            <button
              onClick={() => handleSelectEmployee(row.original)}
              className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
              title="Xem nhanh"
            >
              <Eye size={14} />
            </button>

            {/* Native Link */}
            <Link
              href={`/vi/hr/employee-management/${row.original.id}`}
              className="p-1.5 rounded hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition-colors"
              title="Xem trang chi tiết"
            >
              <ExternalLink size={14} />
            </Link>

            {/* Development Action -> ActionButton */}
            <ActionButton
              isUnderDevelopment
              iconOnly
              variant="ghost"
              tooltip="Chỉnh sửa"
              className="!w-7 !h-7 !p-0 hover:bg-green-50 hover:text-green-600 text-muted-foreground"
            >
              <Edit size={14} />
            </ActionButton>

            {/* Confirmation Action -> ActionButton */}
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

            {/* Simple Menu Trigger -> Keep Native */}
            <button
              className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
              title="Thêm tùy chọn"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
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
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Quản lý Nhân viên
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} nhân viên · Quản lý tập trung
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
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
              isUnderDevelopment
              variant="primary"
              isLoading={isDataLoading}
              className="!h-8 !px-3 !py-0 !text-xs"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Thêm nhân viên</span>
              <span className="sm:hidden">Thêm</span>
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto md:hidden px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {totalRows} nhân viên
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
            placeholder="Tìm theo tên, mã NV..."
            className="input-base pl-9 py-1.5 text-xs w-full"
          />
        </div>
        {usersData.length === 0 && !isDataLoading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Search size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không tìm thấy nhân viên
            </p>
          </div>
        ) : (
          usersData.map((emp: any) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onView={handleSelectEmployee}
            />
          ))
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
        {/* <div className="w-full h-0.5 bg-transparent relative overflow-hidden z-20">
          {isFetching && (
            <div className="absolute inset-y-0 bg-primary animate-[indeterminate_1.5s_infinite_linear] w-1/3 rounded-full" />
          )}
        </div> */}
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
          mobileFacetFilters={mobileFacetFiltersNode}
          isFetching={isFetching}
          isLoading={isDataLoading}
          // isLoading={isLoading} // change from isDataLoading
          skeletonRowCount={8}
          enableMultiRowSelection={true}
        />
      </div>

      {/* ── PASS ACTIVE EMPLOYEE DATA TO DRAWER ── */}
      <EmployeeDrawer
        employee={activeEmployeeData}
        onClose={handleCloseDetail}
        onUnlock={handleUnlockSubmit}
        onWipeData={() => setUnlockedData(null)} // Truyền hàm wipe data
      />
    </div>
  );
}
