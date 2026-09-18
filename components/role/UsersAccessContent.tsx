/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import type {
  ColumnDef,
  PaginationState,
  StockFeatures,
} from "@tanstack/react-table";
import {
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
  Building2,
  Mail,
  Briefcase,
  Monitor,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import {
  DataTable,
  SortHeader,
  TriStateCheckbox,
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
  useGetAllUsersAccessQuery,
  useGetUserAccessDetailsQuery,
  useUpdateUserAccessMutation,
} from "@/lib/store/adminApiSlice";
import { Permission, SystemResource, Role } from "@/types/modelsver2";
import { RoleCombobox } from "../combobox/RoleCombobox";

import ActionButton from "@/components/buttons/ActionButton";

// ─── API Types Mapping ────────────────────────────────────────────────────────
interface UserRole {
  id: string;
  name: string;
  permissions?: Permission[];
}

interface UserProfile {
  employeeCode?: string;
  phoneNumber?: string;
  jobTitle?: string;
  department?: string;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  status: string;
  role?: UserRole | null;
  profile?: UserProfile | null;
  bonusPermsCount?: number;
  bonusPermissions?: Permission[];
  bonusPermissionIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Component Helpers ────────────────────────────────────────────────────────
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

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  ACTIVE: {
    label: "Đang làm việc",
    className: "badge-success",
    icon: CheckCircle,
  },
  INACTIVE: { label: "Đã nghỉ", className: "badge-neutral", icon: UserX },
};

// ─── Bonus Permission Group Card ──────────────────────────────────────────────
function BonusPermissionGroupCard({
  resource,
  currentBonusPerms,
  rolePerms,
  isEditing,
  onTogglePerm,
  onToggleGroupAll,
}: {
  resource: SystemResource;
  currentBonusPerms: Set<string>;
  rolePerms: Set<string>;
  isEditing: boolean;
  onTogglePerm: (id: string) => void;
  onToggleGroupAll: (resourceId: string, permissions: Permission[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const permissions = resource.permissions || [];

  if (permissions.length === 0) return null;

  const togglablePerms = permissions.filter((p) => !rolePerms.has(p.id));
  const allTogglableChecked =
    togglablePerms.length > 0 &&
    togglablePerms.every((p) => currentBonusPerms.has(p.id));
  const someTogglableChecked = togglablePerms.some((p) =>
    currentBonusPerms.has(p.id),
  );

  const bonusCount = permissions.filter((p) =>
    currentBonusPerms.has(p.id),
  ).length;
  const roleInheritedCount = permissions.filter((p) =>
    rolePerms.has(p.id),
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
              <Shield size={10} /> {permissions.length} tổng
            </span>
            <span className="flex items-center gap-1 text-primary">
              Mặc định: {roleInheritedCount}
            </span>
            {bonusCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                + {bonusCount} mở rộng
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className={isEditing ? "" : "cursor-not-allowed"}
            title={isEditing ? "" : "Chỉ xem"}
          >
            <input
              type="checkbox"
              checked={allTogglableChecked}
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    someTogglableChecked && !allTogglableChecked;
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
            {permissions.map((perm) => {
              const isInherited = rolePerms.has(perm.id);
              const isBonus = currentBonusPerms.has(perm.id);

              return (
                <label
                  key={perm.id}
                  className={`flex items-center gap-3 p-2.5 rounded-md transition-colors ${
                    isInherited
                      ? "bg-primary/5 opacity-70 cursor-not-allowed border border-primary/10"
                      : isEditing
                        ? "hover:bg-muted/40 cursor-pointer group/item"
                        : "cursor-not-allowed opacity-90"
                  }`}
                  title={
                    isInherited
                      ? "Quyền này đã có sẵn từ Vai trò chính"
                      : !isEditing
                        ? "Chỉ xem"
                        : "Thêm quyền ngoại lệ"
                  }
                >
                  <input
                    type="checkbox"
                    checked={isInherited || isBonus}
                    readOnly={!isEditing || isInherited}
                    onChange={
                      isEditing && !isInherited
                        ? () => onTogglePerm(perm.id)
                        : undefined
                    }
                    className={`accent-primary w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isInherited || !isEditing
                        ? "pointer-events-none opacity-80"
                        : "cursor-pointer"
                    }`}
                    aria-disabled={!isEditing || isInherited}
                    tabIndex={isEditing && !isInherited ? 0 : -1}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate transition-colors ${
                        isInherited
                          ? "text-primary"
                          : isEditing
                            ? "text-foreground group-hover/item:text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {perm.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate opacity-70 mt-0.5">
                      {perm.slug}
                    </p>
                  </div>
                  {isInherited && (
                    <span className="ml-auto text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Vai trò
                    </span>
                  )}
                  {isBonus && !isInherited && (
                    <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Cấp thêm
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function UsersAccessContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const initialDeptFilter = searchParams.get("dept");
  const [deptFilter, setDeptFilter] = useState<string[]>(
    initialDeptFilter ? initialDeptFilter.split(",").filter(Boolean) : [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    searchParams.get("id") || null,
  );

  // ─── API HOOKS ───
  const {
    data: usersRes,
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
  } = useGetAllUsersAccessQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter,
  });

  const { data: userDetailsRes, isFetching: detailsFetching } =
    useGetUserAccessDetailsQuery(selectedUserId ?? "", {
      skip: !selectedUserId,
    });

  const { data: matrixRes } = useGetResourcesMatrixQuery();
  const { data: rolesRes } = useGetRolesQuery({ limit: 100 });
  const [updateUserAccess, { isLoading: isUpdating }] =
    useUpdateUserAccessMutation();
  const isDataLoading = usersLoading || usersFetching;

  const usersData: UserData[] = Array.isArray(usersRes)
    ? usersRes
    : usersRes?.data || [];
  const totalRows = Array.isArray(usersRes)
    ? usersData.length
    : usersRes?.meta?.pagination?.total || usersData.length;
  const pageCount = Array.isArray(usersRes)
    ? 1
    : usersRes?.meta?.pagination?.total_page || 1;
  const matrixData = matrixRes?.data || [];
  const availableRoles = rolesRes?.data || [];

  const userInfo = useMemo(() => {
    if (!selectedUserId) return null;
    const fromTable = usersData.find((u: UserData) => u.id === selectedUserId);
    if (fromTable) return fromTable;
    return userDetailsRes?.data || null;
  }, [selectedUserId, usersData, userDetailsRes]);

  // ─── EDIT MODE STATES ───
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentBonusPerms, setCurrentBonusPerms] = useState<Set<string>>(
    new Set(),
  );

  // ─── SIDEBAR STATES ───
  const [leftCollapsed, setLeftCollapsed] = useState(!selectedUserId);
  const [rightCollapsed, setRightCollapsed] = useState(!selectedUserId);
  const [rightSections, setRightSections] = useState({
    role: true,
    bonus: true,
  });

  const rolePermsSet = useMemo(() => {
    if (!selectedRoleId) return new Set<string>();

    if (
      selectedRoleId === userDetailsRes?.data?.role?.id &&
      userDetailsRes?.data?.role?.permissions
    ) {
      return new Set(
        userDetailsRes.data.role.permissions.map((p: any) => p.id),
      );
    }

    const role = availableRoles.find((r: Role) => r.id === selectedRoleId);
    if (!role || !role.permissions) return new Set<string>();
    return new Set(role.permissions.map((p: any) => p.id));
  }, [selectedRoleId, availableRoles, userDetailsRes]);

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (globalFilter) params.set("q", globalFilter);
    if (deptFilter.length > 0) params.set("dept", deptFilter.join(","));

    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      params.set("limit", pagination.pageSize.toString());

    if (selectedUserId) params.set("id", selectedUserId);
    else params.delete("id");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [globalFilter, deptFilter, pagination, selectedUserId, pathname, router]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const deptFilterKey = deptFilter.join(",");
  const filteredUsers = useMemo(() => {
    if (deptFilter.length === 0) return usersData;
    return usersData.filter(
      (u: UserData) =>
        u.profile?.department && deptFilter.includes(u.profile.department),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersData, deptFilterKey]);

  const [prevUserDetails, setPrevUserDetails] = useState<any>(null);
  if (userDetailsRes !== prevUserDetails) {
    setPrevUserDetails(userDetailsRes);
    const data = userDetailsRes?.data;
    if (!isEditing && data) {
      setSelectedRoleId(data.role?.id || "");
      setCurrentBonusPerms(new Set(data.bonusPermissionIds || []));
    }
  }

  const hasChanges = useMemo(() => {
    const data = userDetailsRes?.data;
    if (!data) return false;
    if (selectedRoleId !== (data.role?.id || "")) return true;

    const originalBonus = new Set(data.bonusPermissionIds || []);
    if (originalBonus.size !== currentBonusPerms.size) return true;
    for (const p of currentBonusPerms) {
      if (!originalBonus.has(p)) return true;
    }
    return false;
  }, [selectedRoleId, currentBonusPerms, userDetailsRes]);

  const handleSelectUser = useCallback(
    (id: string) => {
      if (selectedUserId !== id) {
        setSelectedUserId(id);
        setIsEditing(false);
        setLeftCollapsed(false);
        setRightCollapsed(false);
      }
    },
    [selectedUserId],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedUserId(null);
    setIsEditing(false);
    setLeftCollapsed(true);
    setRightCollapsed(true);
  }, []);

  const handleCancelEdit = () => {
    setIsEditing(false);
    const data = userDetailsRes?.data;
    setSelectedRoleId(data?.role?.id || "");
    setCurrentBonusPerms(new Set(data?.bonusPermissionIds || []));
  };

  const toggleBonusPerm = (permId: string) => {
    if (!isEditing) return;
    setCurrentBonusPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleGroupAll = (resourceId: string, permissions: Permission[]) => {
    if (!isEditing) return;

    const togglablePerms = permissions.filter((p) => !rolePermsSet.has(p.id));
    if (togglablePerms.length === 0) return;

    const allTogglableChecked = togglablePerms.every((p) =>
      currentBonusPerms.has(p.id),
    );

    setCurrentBonusPerms((prev) => {
      const next = new Set(prev);
      if (allTogglableChecked) {
        togglablePerms.forEach((p) => next.delete(p.id));
      } else {
        togglablePerms.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  // ── Users table columns ────────────────────────
  const userColumns = useMemo<ColumnDef<StockFeatures, UserData, any>[]>(
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
          <TriStateCheckbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "fullName",
        size: 250,
        meta: { title: "Nhân viên" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Nhân viên</SortHeader>
        ),
        cell: ({ row }: any) => {
          const isSelected = row.original.id === selectedUserId;
          return (
            <div className="flex items-center gap-3 truncate">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {row.original.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate transition-colors ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {row.original.fullName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate opacity-80 mt-0.5">
                  {row.original.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        size: 150,
        meta: { title: "Phòng ban" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban / Chức vụ</SortHeader>
        ),
        cell: ({ row }: any) => (
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {row.original.profile?.department || "Chưa xác định"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {row.original.profile?.jobTitle || "Chưa xác định"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "roleName",
        size: 160,
        meta: { title: "Vai trò Hệ thống" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Vai trò
          </span>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-muted-foreground" />
            <span className="text-xs text-foreground truncate font-medium">
              {row.original.role?.name || "Chưa phân quyền"}
            </span>
          </div>
        ),
      },
      {
        id: "bonusPerms",
        size: 80,
        meta: { title: "Quyền mở rộng" },
        header: () => (
          <div className="flex justify-center">
            <ShieldAlert size={12} className="text-muted-foreground" />
          </div>
        ),
        cell: ({ row }: any) => {
          const count = row.original.bonusPermsCount || 0;
          if (count === 0)
            return (
              <div className="text-center text-xs text-muted-foreground opacity-50">
                -
              </div>
            );
          return (
            <div className="flex justify-center">
              <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums">
                +{count}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        size: 110,
        meta: { title: "Trạng thái" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Trạng thái
          </span>
        ),
        cell: ({ getValue }: any) => {
          const config =
            statusConfig[getValue() as string] || statusConfig.INACTIVE;
          return <Badge config={config} />;
        },
      },
      {
        id: "actions",
        size: 160,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => {
          const isViewing = row.original.id === selectedUserId;

          return (
            <div
              className="flex items-center justify-end gap-0.5"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => handleSelectUser(row.original.id)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
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
                tooltip="Xóa phân quyền"
                className="!w-7 !h-7 !p-0 hover:bg-red-50 hover:text-red-600 text-muted-foreground"
                requireConfirm
                confirmTitle="Xóa quyền truy cập?"
                confirmMessage={`Xác nhận gỡ toàn bộ quyền truy cập của "${row.original.fullName}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa"
                onAction={async () => {
                  await new Promise((r) => setTimeout(r, 1200));
                  return row.original.fullName;
                }}
                loadingMessage="Đang xóa..."
                successMessage={(name) => `Đã xóa quyền truy cập của ${name}.`}
              >
                <Trash2 size={14} />
              </ActionButton>

              <button
                type="button"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
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
    [selectedUserId, handleSelectUser],
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* ── MOBILE & TABLET RESTRICTION (< xl / < 1280px) ── */}
      <div className="flex xl:hidden flex-1 h-full w-full items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm bg-card p-8 rounded-2xl border border-border shadow-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
            <Monitor size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-foreground">
              Yêu cầu màn hình máy tính (Desktop)
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tính năng <strong>Phân quyền Người dùng</strong> được thiết kế theo cấu trúc 3 cột song song (Danh sách Nhân viên - Thông tin tài khoản - Quyền mở rộng) để quản lý ma trận IAM an toàn.
            </p>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/60">
              Vui lòng sử dụng máy tính có màn hình từ <strong>1280px trở lên</strong> (không hỗ trợ điện thoại và máy tính bảng).
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary text-xs px-4 py-2 mt-2 cursor-pointer inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={14} /> Quay lại trang trước
          </button>
        </div>
      </div>

      {/* ── DESKTOP-ONLY INTERFACE (>= xl / >= 1280px) ── */}
      <div className="hidden xl:flex flex-col h-full flex-1 min-h-0 overflow-hidden">
        {/* Global Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-border bg-card z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Phân quyền Người dùng
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalRows} tài khoản · Quản lý vai trò và cấp quyền ngoại lệ cho từng cá nhân
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                variant="ghost"
                className="!h-8 !px-3 !text-xs !font-medium"
                isLoading={usersFetching}
                onAction={async () => {
                  await new Promise((r) => setTimeout(r, 1200));
                  return "Danh_sach_Phan_quyen.xlsx";
                }}
                loadingMessage="Đang chuẩn bị dữ liệu xuất..."
                successMessage={(file) => `Đã tải xuống ${file}`}
                toastOptions={{ showProgress: true, duration: 5000 }}
              >
                <Download size={13} /> Xuất Excel
              </ActionButton>

              <ActionButton
                variant="ghost"
                className="!h-8 !px-3 !text-xs !font-medium"
                isLoading={usersFetching}
                onAction={async () => {
                  await refetchUsers();
                }}
                loadingMessage="Đang làm mới..."
                successMessage="Dữ liệu đã được cập nhật"
              >
                <RefreshCw size={13} /> Làm mới
              </ActionButton>
            </div>
          </div>
        </div>

        {/* 3-Column Architecture */}
        <div className="flex-1 min-h-0 relative">
          <DetailLayout
            // title="Quản lý Truy cập"
            leftSidebar={{
              collapsed: leftCollapsed,
              onCollapseChange: setLeftCollapsed,
              defaultCollapsed: !selectedUserId,
              content: (collapsed) => {
                if (collapsed || !selectedUserId) {
                  return (
                    <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                      <div
                        className="relative group cursor-help"
                        title="Vui lòng chọn nhân viên"
                      >
                        <User size={20} />
                      </div>
                    </div>
                  );
                }

                if (!userInfo) return null;

                return (
                  <div className="flex flex-col h-full fade-in p-5">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-3 shadow-sm border-2 border-background ring-2 ring-primary/20">
                        {userInfo.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <h2 className="text-base font-bold text-foreground">
                        {userInfo.fullName}
                      </h2>
                      <div className="mt-2">
                        <Badge
                          config={
                            statusConfig[userInfo.status] ||
                            statusConfig.INACTIVE
                          }
                        />
                      </div>

                      <div className="w-full mt-6 space-y-3 text-left">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-muted flex-shrink-0 text-muted-foreground">
                            <Briefcase size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground text-[10px]">
                              Chức vụ
                            </p>
                            <p className="font-semibold text-foreground truncate">
                              {userInfo.profile?.jobTitle || "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-muted flex-shrink-0 text-muted-foreground">
                            <Building2 size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground text-[10px]">
                              Phòng ban
                            </p>
                            <p className="font-semibold text-foreground truncate">
                              {userInfo.profile?.department || "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-muted flex-shrink-0 text-muted-foreground">
                            <Mail size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground text-[10px]">
                              Email
                            </p>
                            <p className="font-medium text-foreground truncate">
                              {userInfo.email || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 mt-auto">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">
                          Nhật ký Truy cập
                        </h3>
                        <div className="relative">
                          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border z-0" />
                          <div className="space-y-5 relative z-10">
                            {userInfo.updatedAt && (
                              <div className="flex gap-4">
                                <div className="w-3 h-3 rounded-full bg-background border-2 border-primary mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                    Thay đổi quyền hạn
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground mb-1">
                                    {new Date(
                                      userInfo.updatedAt,
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                              </div>
                            )}
                            {userInfo.createdAt && (
                              <div className="flex gap-4">
                                <div className="w-3 h-3 rounded-full bg-background border-2 border-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                    Tạo tài khoản
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground mb-1">
                                    {new Date(
                                      userInfo.createdAt,
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                              </div>
                            )}
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
              defaultCollapsed: !selectedUserId,
              content: (collapsed) => {
                if (collapsed || !selectedUserId) {
                  return (
                    <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                      <div className="relative group cursor-help">
                        <Shield size={20} />
                      </div>
                    </div>
                  );
                }

                if (detailsFetching && !userDetailsRes?.data) {
                  return (
                    <div className="flex justify-center items-center h-full text-primary fade-in">
                      <RefreshCw className="animate-spin" size={24} />
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col h-full fade-in">
                    <DetailAccordion
                      title="Vai trò Chính (Primary Role)"
                      icon={<Shield size={14} />}
                      isExpanded={rightSections.role}
                      onToggle={() =>
                        setRightSections((p) => ({ ...p, role: !p.role }))
                      }
                    >
                      <div className="space-y-4 pt-1">
                        <div className="bg-muted/20 p-3 rounded-lg border border-border/50 flex items-start gap-2.5">
                          <ShieldAlert
                            size={14}
                            className="text-primary mt-0.5 flex-shrink-0"
                          />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Vai trò hệ thống quyết định nhóm quyền cốt lõi. Các
                            quyền thuộc vai trò này sẽ{" "}
                            <span className="font-semibold text-foreground">
                              mặc định được gán
                            </span>{" "}
                            và bị mờ ở phần Quyền Mở Rộng.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                            Áp dụng Vai trò
                          </label>

                          <div
                            className={
                              !isEditing
                                ? "pointer-events-none opacity-60 grayscale transition-all"
                                : ""
                            }
                          >
                            <RoleCombobox
                              availableRoles={availableRoles}
                              selectedRoleId={selectedRoleId}
                              onChange={(val: string) => setSelectedRoleId(val)}
                            />
                          </div>
                        </div>
                      </div>
                    </DetailAccordion>

                    <DetailAccordion
                      title={`Quyền Mở Rộng (${currentBonusPerms.size})`}
                      icon={<ShieldAlert size={14} />}
                      isExpanded={rightSections.bonus}
                      onToggle={() =>
                        setRightSections((p) => ({ ...p, bonus: !p.bonus }))
                      }
                      className="border-b-0 lg:border-b"
                    >
                      <div className="space-y-4 pt-2">
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                          Cấp thêm quyền ngoại lệ ngoài vai trò chính. Các quyền
                          bị mờ là quyền đã có sẵn.
                        </p>
                        {matrixData.map((resource: SystemResource) => (
                          <BonusPermissionGroupCard
                            key={resource.id}
                            resource={resource}
                            currentBonusPerms={currentBonusPerms}
                            rolePerms={rolePermsSet}
                            isEditing={isEditing}
                            onTogglePerm={toggleBonusPerm}
                            onToggleGroupAll={toggleGroupAll}
                          />
                        ))}
                      </div>
                    </DetailAccordion>
                  </div>
                );
              },
            }}
            footer={
              selectedUserId ? (
                <>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mr-auto">
                    <Clock size={13} /> Cập nhật lần cuối:{" "}
                    {userInfo?.updatedAt
                      ? new Date(userInfo.updatedAt).toLocaleDateString("vi-VN")
                      : "—"}
                  </div>

                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        className="btn-secondary flex items-center justify-center text-xs px-4 h-8 mr-2 cursor-pointer"
                        onClick={handleCloseDetail}
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        className="btn-primary flex items-center justify-center gap-2 text-xs px-5 h-8 cursor-pointer"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit size={14} /> Chỉnh sửa
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-secondary flex items-center justify-center text-xs px-4 h-8 cursor-pointer"
                        onClick={handleCancelEdit}
                      >
                        Hủy
                      </button>

                      <ActionButton
                        variant="primary"
                        className="text-xs px-5 !h-8 !py-0 min-w-[140px] justify-center cursor-pointer"
                        isLoading={isUpdating || detailsFetching}
                        disabled={!hasChanges}
                        onAction={async () => {
                          await updateUserAccess({
                            id: selectedUserId,
                            roleId: selectedRoleId,
                            bonusPermissionIds: Array.from(currentBonusPerms),
                          }).unwrap();
                          setIsEditing(false);
                          refetchUsers();
                          return userInfo?.fullName;
                        }}
                        loadingMessage="Đang lưu phân quyền..."
                        successMessage={(name) =>
                          `Đã cập nhật quyền cho "${name}"`
                        }
                        errorMessage="Lỗi khi lưu phân quyền người dùng."
                      >
                        <Save size={14} /> Lưu thay đổi
                      </ActionButton>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full text-center text-xs font-medium text-muted-foreground italic flex items-center justify-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Vui lòng chọn nhân viên để cấu hình quyền
                </div>
              )
            }
          >
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <DataTable
                columns={userColumns}
                data={filteredUsers}
                pageCount={pageCount}
                totalRows={totalRows}
                globalFilter={globalFilter}
                onGlobalFilterChange={(v) =>
                  handleFilterChange(setGlobalFilter, v)
                }
                pagination={pagination}
                onPaginationChange={setPagination}
                isFetching={usersFetching}
                isLoading={isDataLoading}
                skeletonRowCount={8}
                onRowClick={(row) => handleSelectUser(row.original.id)}
              />
            </div>
          </DetailLayout>
        </div>
      </div>
    </div>
  );
}