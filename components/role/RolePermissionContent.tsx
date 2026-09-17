/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import type {
  ColumnDef,
  PaginationState,
  StockFeatures,
} from "@tanstack/react-table";
import {
  Search,
  Plus,
  Users,
  Shield,
  User,
  CheckCircle,
  Eye,
  ShieldAlert,
  Save,
  Clock,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserX,
  AlertTriangle,
  FileText,
  Copy,
  Edit,
  Trash2,
  Monitor,
  MoreHorizontal,
} from "lucide-react";
import {
  DataTable,
  SortHeader,
  TriStateCheckbox,
  FacetFilter,
  MobileFilterSheet,
} from "@/components/ui/DataTable";
import {
  DetailLayout,
  DetailAccordion,
} from "@/components/layouts/DetailLayout";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// API Hooks
import {
  useGetRolesQuery,
  useGetResourcesMatrixQuery,
  useGetRoleDetailsQuery,
  useUpdateRolePermissionsMutation,
  useToggleRoleStatusMutation,
  useUnassignSingleUserMutation,
} from "@/lib/store/adminApiSlice";
import { Role, Permission, SystemResource } from "@/types/modelsver2";

import { LiveToggleCell } from "@/components/buttons/LiveToggleCell";
import ActionButton from "@/components/buttons/ActionButton";
import ActionSwitch from "@/components/buttons/ActionSwitch";

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
const roleTypeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  default: { label: "Mặc định", className: "badge-info", icon: Shield },
  custom: { label: "Tùy chỉnh", className: "badge-neutral", icon: User },
};

// ─── Flat Permission Group ────────────────────────────────────
function PermissionGroupCard({
  resource,
  currentPerms,
  isEditing,
  onTogglePerm,
  onToggleGroupAll,
}: {
  resource: SystemResource;
  currentPerms: Set<string>;
  isEditing: boolean;
  onTogglePerm: (id: string) => void;
  onToggleGroupAll: (resourceId: string, permissions: Permission[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const permissions = resource.permissions || [];

  if (permissions.length === 0) return null;

  const allChecked = permissions.every((p) => currentPerms.has(p.id));
  const someChecked = permissions.some((p) => currentPerms.has(p.id));
  const selectedCount = permissions.filter((p) =>
    currentPerms.has(p.id),
  ).length;

  return (
    <div className="border-b border-border/50 pb-5 mb-4 last:border-0 last:pb-0 last:mb-0">
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 pr-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors truncate">
            {resource.name}
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <Shield size={10} /> {permissions.length} quyền
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle
                size={10}
                className={selectedCount > 0 ? "text-emerald-500" : ""}
              />{" "}
              {selectedCount} đã chọn
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Header Checkbox (Select All) */}
          <div
            className={isEditing ? "" : "cursor-not-allowed"}
            title={isEditing ? "" : "Chỉ xem"}
          >
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked && !allChecked;
              }}
              onChange={
                isEditing
                  ? () => onToggleGroupAll(resource.id, permissions)
                  : undefined
              }
              readOnly={!isEditing}
              onClick={(e) => e.stopPropagation()}
              className={`accent-primary w-4 h-4 ${
                isEditing ? "cursor-pointer" : "pointer-events-none opacity-90"
              }`}
              aria-disabled={!isEditing}
              tabIndex={isEditing ? 0 : -1}
            />
          </div>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-muted/10 border border-border/50 rounded-lg p-2 space-y-1">
            {permissions.map((perm) => (
              <label
                key={perm.id}
                className={`flex items-center gap-3 p-2.5 rounded-md transition-colors ${
                  isEditing
                    ? "hover:bg-muted/40 cursor-pointer group/item"
                    : "cursor-not-allowed opacity-90"
                }`}
                title={isEditing ? "" : "Chỉ xem"}
              >
                {/* Individual Checkbox */}
                <input
                  type="checkbox"
                  checked={currentPerms.has(perm.id)}
                  onChange={isEditing ? () => onTogglePerm(perm.id) : undefined}
                  readOnly={!isEditing}
                  className={`accent-primary w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isEditing ? "cursor-pointer" : "pointer-events-none"
                  }`}
                  aria-disabled={!isEditing}
                  tabIndex={isEditing ? 0 : -1}
                />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold text-foreground truncate transition-colors ${isEditing ? "group-hover/item:text-primary" : ""}`}
                  >
                    {perm.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate opacity-70 mt-0.5">
                    {perm.slug}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function RolePermissionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initial State from URL
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const initialTypeFilter = searchParams.get("type");
  const [typeFilter, setTypeFilter] = useState<string[]>(
    initialTypeFilter ? initialTypeFilter.split(",").filter(Boolean) : [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  // Track ID instead of full object for deep-linking
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    searchParams.get("id") || null,
  );

  // API Hooks
  const {
    data: rolesRes,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
    refetch: refetchRoles,
  } = useGetRolesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter,
  });

  const { data: matrixRes } = useGetResourcesMatrixQuery();
  const [updatePermissions, { isLoading: isSaving }] =
    useUpdateRolePermissionsMutation();
  const [unassignUser, { isLoading: isUnassigning }] =
    useUnassignSingleUserMutation();
  const [toggleRoleStatus] = useToggleRoleStatusMutation();

  // 2. Fetch specific role details cleanly via ID
  const { data: selectedRoleDetails, isFetching: detailsFetching } =
    useGetRoleDetailsQuery(selectedRoleId ?? "", {
      skip: !selectedRoleId,
    });

  // Extract Data safely
  const rolesData = rolesRes?.data || [];
  const totalRows = rolesRes?.meta?.pagination?.total || 0;
  const pageCount = rolesRes?.meta?.pagination?.total_page || -1;
  const matrixData = matrixRes?.data || [];

  // 3. Smart Fallback Logic: Try table data first, then API data
  const roleInfo = useMemo(() => {
    if (!selectedRoleId) return null;
    // Check if it exists on the current page of the table
    const fromTable = rolesData.find((r: Role) => r.id === selectedRoleId);
    if (fromTable) return fromTable;
    // Fallback to API data if deep-linked or on another page
    return selectedRoleDetails?.data || null;
  }, [selectedRoleId, rolesData, selectedRoleDetails]);

  // ─── SIDEBAR STATES ───
  const [leftCollapsed, setLeftCollapsed] = useState(!selectedRoleId);
  const [rightCollapsed, setRightCollapsed] = useState(!selectedRoleId);

  const [rightSections, setRightSections] = useState({
    permissions: true,
    users: false,
  });

  const [userSearch, setUserSearch] = useState("");

  // ─── EDIT MODE STATES ───
  const [isEditing, setIsEditing] = useState(false);
  const [currentPerms, setCurrentPerms] = useState<Set<string>>(new Set());

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (globalFilter) params.set("q", globalFilter);
    if (typeFilter.length > 0) params.set("type", typeFilter.join(","));
    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      params.set("limit", pagination.pageSize.toString());

    // Sync the ID
    if (selectedRoleId) params.set("id", selectedRoleId);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [globalFilter, typeFilter, pagination, selectedRoleId, pathname, router]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Derived Counts for Filters
  const typeCounts = useMemo(() => {
    const map: Record<string, number> = { default: 0, custom: 0 };
    rolesData.forEach((r: Role) => {
      const key = r.isDefault ? "default" : "custom";
      map[key]++;
    });
    return map;
  }, [rolesData]);

  // Frontend Filtering for Types
  const filteredRoles = useMemo(() => {
    if (typeFilter.length === 0) return rolesData;
    return rolesData.filter((r: Role) =>
      typeFilter.includes(r.isDefault ? "default" : "custom"),
    );
  }, [rolesData, typeFilter]);

  // Sync state cleanly without triggering cascading effects
  const [prevRoleDetails, setPrevRoleDetails] =
    useState<any>(selectedRoleDetails);
  if (selectedRoleDetails !== prevRoleDetails) {
    setPrevRoleDetails(selectedRoleDetails);
    setCurrentPerms(new Set(selectedRoleDetails?.data?.permissionIds || []));
  }

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!selectedRoleDetails?.data?.permissionIds) return false;
    const originalPerms = new Set(selectedRoleDetails.data.permissionIds);
    if (originalPerms.size !== currentPerms.size) return true;
    for (const p of currentPerms) {
      if (!originalPerms.has(p)) return true;
    }
    return false;
  }, [currentPerms, selectedRoleDetails]);

  const handleSelectRole = useCallback(
    (role: Role) => {
      if (selectedRoleId !== role.id) {
        setSelectedRoleId(role.id);
        setIsEditing(false);
        setLeftCollapsed(false);
        setRightCollapsed(false);
      }
    },
    [selectedRoleId],
  );

  const handleCloseDetail = () => {
    setSelectedRoleId(null);
    setIsEditing(false);
    setLeftCollapsed(true);
    setRightCollapsed(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentPerms(new Set(selectedRoleDetails?.data?.permissionIds || []));
  };

  const togglePerm = (permId: string) => {
    if (!isEditing) return;
    setCurrentPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleGroupAll = (resourceId: string, permissions: Permission[]) => {
    if (!isEditing) return;
    const allChecked = permissions.every((p) => currentPerms.has(p.id));
    setCurrentPerms((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        permissions.forEach((p) => next.delete(p.id));
      } else {
        permissions.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  // ── Roles table columns ────────────────────────
  const roleColumns = useMemo<ColumnDef<StockFeatures, Role, any>[]>(
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
          <TriStateCheckbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        size: 200,
        meta: { title: "Tên Vai Trò" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Vai trò</SortHeader>
        ),
        cell: ({ row }: any) => {
          // FIX: Check against the URL ID, not the row selection state!
          const isSelected = row.original.id === selectedRoleId;
          return (
            <div className="flex items-center gap-2 truncate">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {row.original.slug?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}
                >
                  {row.original.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate opacity-80">
                  {row.original.slug}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isDefault",
        size: 110,
        meta: { title: "Trạng thái" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Phân loại
          </span>
        ),
        cell: ({ getValue }: any) => {
          const config = getValue()
            ? roleTypeConfig.default
            : roleTypeConfig.custom;
          return <Badge config={config} />;
        },
        enableSorting: false,
      },
      {
        id: "userCount",
        size: 70,
        meta: { title: "Người dùng" },
        header: () => (
          <div className="flex justify-center">
            <Users size={12} className="text-muted-foreground" />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="text-center text-xs font-medium text-foreground tabular-nums">
            {row.original.userCount || 0}
          </div>
        ),
      },
      {
        id: "permissionCount",
        size: 80,
        meta: { title: "Quyền hạn" },
        header: () => (
          <div className="flex justify-center">
            <Shield size={13} className="text-muted-foreground" />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="text-center text-xs font-medium text-foreground tabular-nums">
            {row.original.permissionCount || 0}
          </div>
        ),
      },
      {
        id: "liveStatus",
        accessorKey: "isLive",
        size: 70,
        meta: { title: "Kích hoạt" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-center">
            Live
          </span>
        ),
        cell: ({ row }: any) => {
          return (
            <div
              className="flex justify-center items-center h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionSwitch
                checked={!!row.original.isLive}
                requireConfirm
                confirmTitle={
                  row.original.isLive ? "Tắt kích hoạt?" : "Kích hoạt vai trò?"
                }
                confirmMessage={`Bạn có chắc chắn muốn ${row.original.isLive ? "tắt" : "bật"} trạng thái hoạt động của vai trò "${row.original.name}"?`}
                confirmLabel="Xác nhận"
                onAction={async (newChecked) => {
                  await toggleRoleStatus({
                    id: row.original.id,
                    isLive: newChecked,
                  }).unwrap();
                  return { name: row.original.name, isLive: newChecked };
                }}
                loadingMessage="Đang xử lý..."
                successMessage={({ name, isLive }) =>
                  `Đã ${isLive ? "kích hoạt" : "tắt"} vai trò ${name}`
                }
                errorMessage="Lỗi khi thay đổi trạng thái"
              />
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        size: 160,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => {
          // FIX: Check against the URL ID
          const isViewing = row.original.id === selectedRoleId;

          return (
            <div
              className="flex items-center justify-end gap-0.5"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button
                onClick={() => handleSelectRole(row.original)}
                className={`p-1.5 rounded transition-colors ${
                  isViewing
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-blue-50 text-muted-foreground hover:text-blue-600"
                }`}
                title={isViewing ? "Đang xem" : "Xem chi tiết"}
              >
                {isViewing ? <CheckCircle size={14} /> : <Eye size={14} />}
              </button>

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
                isUnderDevelopment
                iconOnly
                variant="ghost"
                tooltip="Nhân bản"
                className="!w-7 !h-7 !p-0 hover:bg-purple-50 hover:text-purple-600 text-muted-foreground"
              >
                <Copy size={14} />
              </ActionButton>

              <ActionButton
                iconOnly
                variant="ghost"
                tooltip="Xóa vai trò"
                className="!w-7 !h-7 !p-0 hover:bg-red-50 hover:text-red-600 text-muted-foreground"
                requireConfirm
                confirmTitle="Xóa vai trò?"
                confirmMessage={`Xác nhận xóa vai trò "${row.original.name}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa"
                onAction={async () => {
                  await new Promise((r) => setTimeout(r, 1200));
                  return row.original.name;
                }}
                loadingMessage="Đang xóa..."
                successMessage={(name) => `Đã xóa vai trò ${name}.`}
              >
                <Trash2 size={14} />
              </ActionButton>

              <button
                className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                title="Thêm tùy chọn"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [toggleRoleStatus, selectedRoleId, handleSelectRole],
  );

  const currentUsers = useMemo(() => {
    const users = (selectedRoleDetails?.data as any)?.users || [];
    return users;
  }, [selectedRoleDetails]);

  const filteredUsers = useMemo(
    () =>
      currentUsers.filter(
        (u: any) =>
          u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email?.toLowerCase().includes(userSearch.toLowerCase()),
      ),
    [currentUsers, userSearch],
  );

  const typeOptions = useMemo(
    () => [
      {
        value: "default",
        label: "Mặc định",
        count: typeCounts["default"] || 0,
      },
      { value: "custom", label: "Tùy chỉnh", count: typeCounts["custom"] || 0 },
    ],
    [typeCounts],
  );

  const activeFilterCount = typeFilter.length;
  const clearAllFilters = () => {
    setGlobalFilter("");
    setTypeFilter([]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <FacetFilter
        label="Phân loại"
        options={typeOptions}
        selected={typeFilter}
        onChange={(v) => handleFilterChange(setTypeFilter, v)}
      />
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="ml-2 text-[10px] text-red-600 hover:underline"
        >
          Xóa bộ lọc
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
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex lg:hidden flex-1 items-center justify-center px-6">
        <div className="text-center max-w-xs bg-card p-6 rounded-2xl border border-border shadow-sm">
          <Monitor size={40} className="text-primary/40 mx-auto mb-4" />
          <h2 className="text-sm font-bold text-foreground mb-2">
            Tính năng tối ưu cho Desktop
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Quản lý ma trận phân quyền yêu cầu không gian hiển thị rộng. Vui
            lòng sử dụng máy tính để trải nghiệm.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 md:px-5 py-4 border-b border-border bg-card z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Quản lý Vai trò hệ thống
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalRows} nhóm quyền đang hoạt động
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={rolesFetching}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Ma_tran_Vai_tro.xlsx";
              }}
              loadingMessage="Đang chuẩn bị dữ liệu xuất..."
              successMessage={(file) => `Đã tải xuống ${file}`}
              toastOptions={{ showProgress: true, duration: 5000 }}
            >
              <Download size={13} /> Xuất Excel
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={rolesFetching}
              onAction={async () => {
                await refetchRoles();
              }}
              loadingMessage="Đang làm mới..."
              successMessage="Dữ liệu đã được cập nhật"
            >
              <RefreshCw size={13} /> Làm mới
            </ActionButton>

            <ActionButton
              isUnderDevelopment
              variant="primary"
              className="!h-8 !px-3 !py-0 !text-xs"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Thêm mới vai trò</span>
              <span className="sm:hidden">Thêm</span>
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <DetailLayout
          title="Ma trận phân quyền"
          leftSidebar={{
            collapsed: leftCollapsed,
            onCollapseChange: setLeftCollapsed,
            defaultCollapsed: !selectedRoleId,
            content: (collapsed) => {
              if (collapsed || !selectedRoleId) {
                return (
                  <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                    <div
                      className="relative group cursor-help"
                      title="Vui lòng chọn vai trò để thao tác"
                    >
                      <FileText size={20} />
                    </div>
                  </div>
                );
              }

              // FIX: Show loading state if we are deep linking and don't have the info yet
              if (!roleInfo && detailsFetching) {
                return (
                  <div className="flex justify-center items-center h-full text-primary">
                    <RefreshCw className="animate-spin" size={24} />
                  </div>
                );
              }
              if (!roleInfo) return null;

              return (
                <div className="flex flex-col h-full fade-in p-5">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-3 shadow-sm">
                      {roleInfo.slug?.slice(0, 2).toUpperCase()}
                    </div>
                    <h2 className="text-base font-bold text-foreground">
                      {roleInfo.name}
                    </h2>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      {roleInfo.slug}
                    </p>
                    <div className="mt-3">
                      <Badge
                        config={
                          roleInfo.isDefault
                            ? roleTypeConfig.default
                            : roleTypeConfig.custom
                        }
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 w-full mt-5">
                      <ActionButton
                        iconOnly
                        variant="secondary"
                        tooltip="Chỉnh sửa thông tin"
                        className="!w-9 !h-9 !rounded-full"
                        onClick={() => setIsEditing(true)}
                        disabled={isEditing}
                      >
                        <Edit size={14} />
                      </ActionButton>

                      <ActionButton
                        isUnderDevelopment
                        iconOnly
                        variant="secondary"
                        tooltip="Nhân bản"
                        className="!w-9 !h-9 !rounded-full"
                        disabled={isEditing}
                      >
                        <Copy size={14} />
                      </ActionButton>

                      <div className="w-px h-5 bg-border mx-1" />

                      <ActionButton
                        iconOnly
                        variant="destructive"
                        tooltip="Xóa vai trò"
                        className="!w-9 !h-9 !rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        requireConfirm
                        disabled={isEditing}
                        confirmTitle="Xóa vai trò?"
                        confirmMessage={`Bạn có chắc chắn muốn xóa vai trò "${roleInfo.name}"? Hành động này không thể hoàn tác.`}
                        confirmLabel="Xóa"
                        onAction={async () => {
                          await new Promise((r) => setTimeout(r, 1200));
                          return roleInfo.name;
                        }}
                        loadingMessage="Đang xóa..."
                        successMessage={(name) => `Đã xóa vai trò ${name}`}
                      >
                        <Trash2 size={14} />
                      </ActionButton>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3">
                        Mô tả
                      </h3>
                      <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                        Vai trò hệ thống cấp phát quyền truy cập phân hệ tương
                        ứng.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">
                        Lịch sử hệ thống
                      </h3>
                      <div className="relative">
                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border z-0" />
                        <div className="space-y-5 relative z-10">
                          {/* DELETE LOG (If exists) */}
                          {roleInfo.deletedAt && (
                            <div className="flex gap-4">
                              <div className="w-3 h-3 rounded-full bg-background border-2 border-red-500 mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-red-600 leading-tight mb-0.5">
                                  Đã xóa
                                </h4>
                                <p className="text-[10px] text-muted-foreground mb-1">
                                  {new Date(roleInfo.deletedAt).toLocaleString(
                                    "vi-VN",
                                  )}
                                </p>
                                {roleInfo.deletedByName && (
                                  <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                                    Bởi: {roleInfo.deletedByName}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* UPDATE LOG */}
                          {roleInfo.updatedAt && (
                            <div className="flex gap-4">
                              <div className="w-3 h-3 rounded-full bg-background border-2 border-primary mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                  Cập nhật gần nhất
                                </h4>
                                <p className="text-[10px] text-muted-foreground mb-1">
                                  {new Date(roleInfo.updatedAt).toLocaleString(
                                    "vi-VN",
                                  )}
                                </p>
                                {roleInfo.updatedByName && (
                                  <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                                    Bởi: {roleInfo.updatedByName}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* CREATE LOG */}
                          <div className="flex gap-4">
                            <div className="w-3 h-3 rounded-full bg-background border-2 border-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                Khởi tạo hệ thống
                              </h4>
                              <p className="text-[10px] text-muted-foreground mb-1">
                                {new Date(roleInfo.createdAt).toLocaleString(
                                  "vi-VN",
                                )}
                              </p>
                              {roleInfo.createdByName && (
                                <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                                  Bởi: {roleInfo.createdByName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          }}
          rightSidebar={{
            collapsed: rightCollapsed,
            onCollapseChange: setRightCollapsed,
            defaultCollapsed: !selectedRoleId,
            content: (collapsed) => {
              if (collapsed || !selectedRoleId) {
                return (
                  <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                    <div
                      className="relative group cursor-help"
                      title="Vui lòng chọn vai trò để thao tác"
                    >
                      <ShieldAlert size={20} />
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex flex-col h-full fade-in">
                  <DetailAccordion
                    title={`Quyền hạn (${currentPerms.size})`}
                    icon={
                      detailsFetching ? (
                        <RefreshCw
                          size={14}
                          className="animate-spin text-primary"
                        />
                      ) : (
                        <ShieldAlert size={14} />
                      )
                    }
                    isExpanded={rightSections.permissions}
                    onToggle={() =>
                      setRightSections((p) => ({
                        ...p,
                        permissions: !p.permissions,
                      }))
                    }
                  >
                    <div className="space-y-4">
                      {matrixData.map((resource: SystemResource) => (
                        <PermissionGroupCard
                          key={resource.id}
                          resource={resource}
                          currentPerms={currentPerms}
                          isEditing={isEditing}
                          onTogglePerm={togglePerm}
                          onToggleGroupAll={toggleGroupAll}
                        />
                      ))}
                    </div>
                  </DetailAccordion>

                  <DetailAccordion
                    title={`Người dùng được gán (${currentUsers.length})`}
                    icon={<Users size={14} />}
                    isExpanded={rightSections.users}
                    onToggle={() =>
                      setRightSections((p) => ({ ...p, users: !p.users }))
                    }
                    className="border-b-0 lg:border-b"
                  >
                    <div className="space-y-4 pt-1">
                      <div className="relative">
                        <Search
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          type="text"
                          placeholder="Tìm nhân viên..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="input-base pl-8 py-1.5 text-xs w-full bg-background"
                        />
                      </div>

                      {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-8 opacity-60">
                          <User
                            size={24}
                            className="text-muted-foreground mb-2"
                          />
                          <p className="text-[10px] font-medium text-foreground">
                            Không tìm thấy nhân sự
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredUsers.map((u: any) => (
                            <div
                              key={u.id}
                              className="flex items-center gap-3 p-2.5 bg-muted/20 border border-border/50 rounded-xl hover:border-primary/30 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {u.fullName
                                  ? u.fullName.slice(0, 2).toUpperCase()
                                  : u.email.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {u.fullName}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  {u.jobTitle || u.email}
                                </p>
                              </div>

                              <ActionButton
                                iconOnly
                                variant="ghost"
                                className="!w-7 !h-7 !p-0 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 disabled:opacity-50"
                                tooltip="Gỡ khỏi vai trò"
                                requireConfirm
                                disabled={isUnassigning || isEditing}
                                confirmTitle="Gỡ vai trò?"
                                confirmMessage={`Bạn có chắc chắn muốn gỡ quyền truy cập của ${u.fullName || u.email}?`}
                                confirmLabel="Gỡ ngay"
                                onAction={async () => {
                                  await unassignUser({
                                    roleId: selectedRoleId!,
                                    userId: u.id,
                                  }).unwrap();
                                  return u.fullName || u.email;
                                }}
                                loadingMessage="Đang xử lý..."
                                successMessage={(name) =>
                                  `Đã gỡ quyền của ${name}`
                                }
                                errorMessage="Lỗi khi gỡ người dùng."
                              >
                                <UserX size={13} />
                              </ActionButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DetailAccordion>
                </div>
              );
            },
          }}
          footer={
            selectedRoleId ? (
              <>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mr-auto hidden sm:flex">
                  <Clock size={13} /> Cập nhật lần cuối:{" "}
                  {roleInfo
                    ? new Date(roleInfo.updatedAt).toLocaleDateString("vi-VN")
                    : "..."}
                </div>

                {!isEditing ? (
                  <>
                    <button
                      className="btn-secondary text-xs px-4 py-2 mr-2"
                      onClick={handleCloseDetail}
                    >
                      Đóng
                    </button>
                    <button
                      className="btn-primary flex items-center gap-2 text-xs px-5 py-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={14} /> Chỉnh sửa
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-secondary text-xs px-4 py-2"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>

                    <ActionButton
                      variant="primary"
                      className="text-xs px-5 py-2 min-w-[140px] justify-center"
                      isLoading={isSaving || detailsFetching}
                      disabled={!hasChanges}
                      onAction={async () => {
                        await updatePermissions({
                          id: selectedRoleId,
                          permissionIds: Array.from(currentPerms),
                        }).unwrap();
                        setIsEditing(false);
                        return roleInfo?.name;
                      }}
                      loadingMessage="Đang lưu thay đổi..."
                      successMessage={(name) => `Đã cập nhật vai trò "${name}"`}
                      errorMessage="Lỗi khi lưu phân quyền."
                    >
                      <Save size={14} /> Lưu thay đổi
                    </ActionButton>
                  </>
                )}
              </>
            ) : (
              <div className="w-full text-center text-xs font-medium text-muted-foreground italic flex items-center justify-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Vui lòng chọn vai trò để thao tác
              </div>
            )
          }
        >
          <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <DataTable
                columns={roleColumns}
                data={filteredRoles}
                pageCount={pageCount}
                totalRows={totalRows}
                globalFilter={globalFilter}
                onGlobalFilterChange={(v) =>
                  handleFilterChange(setGlobalFilter, v)
                }
                pagination={pagination}
                onPaginationChange={setPagination}
                facetFilters={facetFiltersNode}
                mobileFacetFilters={mobileFacetFiltersNode}
                isLoading={rolesLoading}
                skeletonRowCount={8}
                onRowClick={(row) => handleSelectRole(row.original.id)} // Pass ID instead of object
              />
            </div>
          </div>
        </DetailLayout>
      </div>
    </div>
  );
}
