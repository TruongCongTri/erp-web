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
  MoreHorizontal,
  Search,
  ExternalLink,
  UserCheck,
  Calendar,
  AlertTriangle,
  Briefcase,
  Clock,
  FileText,
  UserX,
} from "lucide-react";

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
  useGetAllProfilesQuery,
  useGetProfileByCodeQuery,
  useGetProfileSecurelyMutation,
  // useUpdateEmployeeProfileMutation, // Dành cho tính năng Edit sau này
} from "@/lib/store/hrApiSlice";
import ProfileDrawer from "./ProfileDrawer";

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
function ProfileCard({
  profile,
  onView,
}: {
  profile: any;
  onView: (e: any) => void;
}) {
  const statusCfg =
    hrisStatusConfig[profile.status] || hrisStatusConfig.INACTIVE;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted/50 cursor-pointer"
      onClick={() => onView(profile)}
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {profile.fullName?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {profile.fullName}
          </p>
          <Badge config={statusCfg} />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {profile.jobTitle || "Chưa cập nhật"}
        </p>
        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
          <code className="bg-muted px-1 py-0.5 rounded border border-border">
            {profile.employeeCode}
          </code>
          <span>· {profile.department || "Chưa cập nhật"}</span>
        </p>
      </div>
      <Eye size={16} className="text-muted-foreground flex-shrink-0" />
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function ProfileManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ─── STATE MANAGEMENT ───
  const [selectedProfileCode, setSelectedProfileCode] = useState<string | null>(
    null,
  );

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
  // 1. Fetch list of Profiles
  const {
    data: profilesRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllProfilesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    department: deptFilter.length > 0 ? deptFilter.join(",") : undefined,
    status: statusFilter.length > 0 ? statusFilter.join(",") : undefined,
    contractType:
      contractFilter.length > 0 ? contractFilter.join(",") : undefined,
  });

  // 2. Fetch specific Profile details when selected
  const { data: profileDetailsRes, isFetching: isDetailsFetching } =
    useGetProfileByCodeQuery(selectedProfileCode ?? "", {
      skip: !selectedProfileCode,
    });

  // 3. Mutation to unlock sensitive data
  const [getProfileSecurely] = useGetProfileSecurelyMutation();

  const isDataLoading = isLoading || isFetching;
  const profilesData = Array.isArray(profilesRes)
    ? profilesRes
    : profilesRes?.data || [];
  const totalRows = Array.isArray(profilesRes)
    ? profilesData.length
    : profilesRes?.meta?.pagination?.total || profilesData.length;
  const pageCount = Array.isArray(profilesRes)
    ? 1
    : profilesRes?.meta?.pagination?.total_page || 1;

  // ─── DATA MERGING ───
  // Gộp dữ liệu cơ bản (từ list) + dữ liệu chi tiết + dữ liệu bảo mật (nếu đã mở khóa)
  const activeProfileData = useMemo(() => {
    if (!selectedProfileCode) return null;

    // Tìm base data từ list
    const baseListInfo = profilesData.find(
      (p: any) => p.employeeCode === selectedProfileCode,
    );
    let base = { ...baseListInfo, _isFetching: isDetailsFetching };

    // Gộp data chi tiết
    if (profileDetailsRes?.data) {
      // Để tái sử dụng EmployeeDrawer (vốn được thiết kế cho AuthUser),
      // ta cần map một vài field của Profile vào root object
      const details = profileDetailsRes.data;
      base = {
        ...base,
        ...details,
        profile: details, // Wrap profile object to match EmployeeDrawer expectations
        email: details.email || base.email,
      };
    }

    // Gộp data bảo mật
    if (unlockedData) {
      base = { ...base, ...unlockedData };
    }

    return base;
  }, [
    selectedProfileCode,
    profilesData,
    profileDetailsRes,
    isDetailsFetching,
    unlockedData,
  ]);

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
  const handleSelectProfile = (profile: any) => {
    setSelectedProfileCode(profile.employeeCode);
    setUnlockedData(null);
  };

  const handleCloseDetail = () => {
    setSelectedProfileCode(null);
    setUnlockedData(null);
  };

  const handleUnlockSubmit = async (
    target: "identity" | "financial",
    passwordInput: string,
  ) => {
    if (!selectedProfileCode) return;

    // Call unified secure endpoint
    const res: any = await getProfileSecurely({
      employeeCode: selectedProfileCode,
      passwordDto: { password: passwordInput },
    }).unwrap();

    // The API returns the FULL profile including sensitive fields.
    // We extract what we need based on the target.
    const securePayload: any = {};
    if (target === "identity") {
      securePayload.identityData = {
        idNumber: res?.data?.cccdNumber,
        issueDate: res?.data?.dateOfIssue,
        gender: res?.data?.gender,
        placeOfResidence: res?.data?.placeOfResidence,
        placeOfIssue: res?.data?.placeOfIssue,
      };
    } else if (target === "financial") {
      securePayload.financialData = {
        taxCode: res?.data?.taxCode,
        socialInsuranceNumber: res?.data?.socialInsuranceNumber,
        bankName: res?.data?.bankName,
        accountNumber: res?.data?.bankAccount,
        baseSalary: res?.data?.baseSalary,
      };
    }

    setUnlockedData((prev: any) => ({ ...prev, ...securePayload }));
    gooeyToast.success("Mở khóa dữ liệu thành công");
  };

  // ─── COLUMNS ───
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
        id: "employeeCode",
        accessorKey: "employeeCode",
        size: 110,
        meta: { title: "Mã NV" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Mã NV
          </span>
        ),
        cell: ({ getValue }: any) => (
          <code className="text-[11px] text-muted-foreground font-mono">
            {getValue() || "-"}
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
                {row.original.email || "Chưa có email"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "department",
        accessorKey: "department",
        size: 160,
        meta: { title: "Phòng ban" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-foreground truncate block">
            {getValue() || "Chưa cập nhật"}
          </span>
        ),
      },
      {
        id: "jobTitle",
        accessorKey: "jobTitle",
        size: 160,
        meta: { title: "Chức vụ" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Chức vụ</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-foreground truncate block">
            {getValue() || "Chưa cập nhật"}
          </span>
        ),
      },
      {
        id: "contractType",
        accessorKey: "contractType",
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
            label: val || "Không rõ",
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
        accessorKey: "joinDate",
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
              {new Date(val as string).toLocaleDateString("vi-VN")}
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
              onClick={() => handleSelectProfile(row.original)}
              className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
              title="Xem nhanh"
            >
              <Eye size={14} />
            </button>

            <Link
              href={`/vi/hr/profile-management/${row.original.employeeCode}`}
              className="p-1.5 rounded hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition-colors"
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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Quản lý Hồ sơ Nhân sự
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalRows} hồ sơ gốc hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Danh_sach_Ho_so_2026.xlsx";
              }}
              loadingMessage="Đang chuẩn bị file..."
              successMessage={(file) => `Đã tải xuống ${file}`}
            >
              <Download size={14} className="mr-1.5" /> Xuất Excel
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await refetch();
              }}
            >
              <RefreshCw
                size={14}
                className={`mr-1.5 ${isDataLoading ? "animate-spin" : ""}`}
              />{" "}
              Làm mới
            </ActionButton>

            <ActionButton
              isUnderDevelopment
              variant="primary"
              className="!h-8 !px-3 !py-0 !text-xs"
            >
              <Plus size={14} className="mr-1.5" />
              <span className="hidden sm:inline">Tạo hồ sơ mới</span>
              <span className="sm:hidden">Tạo mới</span>
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto md:hidden px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {totalRows} hồ sơ
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
        {profilesData.length === 0 && !isDataLoading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Search size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không tìm thấy hồ sơ
            </p>
          </div>
        ) : (
          profilesData.map((prof: any) => (
            <ProfileCard
              key={prof.employeeCode}
              profile={prof}
              onView={handleSelectProfile}
            />
          ))
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
        <DataTable
          columns={columns}
          data={profilesData}
          pageCount={pageCount}
          totalRows={totalRows}
          globalFilter={globalFilter}
          onGlobalFilterChange={(v) => handleFilterChange(setGlobalFilter, v)}
          pagination={pagination}
          onPaginationChange={setPagination}
          tabletHiddenColumns={["joinDate", "contractType"]}
          facetFilters={facetFiltersNode}
          mobileFacetFilters={mobileFacetFiltersNode}
          isLoading={isLoading}
          skeletonRowCount={8}
          enableMultiRowSelection={true}
        />
      </div>

      {/* ── PASS ACTIVE PROFILE DATA TO DRAWER ── */}
      <ProfileDrawer
        employee={activeProfileData}
        onClose={handleCloseDetail}
        onUnlock={handleUnlockSubmit}
        onWipeData={() => setUnlockedData(null)}
        detailHref={
          activeProfileData?.employeeCode
            ? `/vi/hr/profile-management/${activeProfileData.employeeCode}`
            : undefined
        }
      />
    </div>
  );
}
