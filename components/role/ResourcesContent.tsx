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
  Eye,
  ShieldAlert,
  Clock,
  RefreshCw,
  FileText,
  Monitor,
  Layers,
  X,
  CheckCircle,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  AlertTriangle,
  Download,
  Save,
} from "lucide-react";
import { gooeyToast } from "@/components/ui/goey-toaster";

import {
  DataTable,
  SortHeader,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import { DetailLayout } from "@/components/layouts/DetailLayout";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// API Hooks
import {
  useGetResourcesQuery,
  useGetResourceDetailsQuery,
  useGetResourcesMatrixQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useToggleResourceStatusMutation,
  useDeleteResourceMutation,
  useGetPermissionsEnumQuery,
  useTogglePermissionStatusMutation,
  useDeletePermissionMutation,
} from "@/lib/store/adminApiSlice";
import { SystemResource, Permission } from "@/types/modelsver2";

import ActionButton from "@/components/buttons/ActionButton";
import ActionSwitch from "@/components/buttons/ActionSwitch";

// ─── Constants for Auto-Generation Translations ──────────────────────────────
const ACTION_LABELS: Record<string, string> = {
  read: "Xem (Read)",
  create: "Tạo (Create)",
  update: "Sửa (Update)",
  delete: "Xóa (Delete)",
  manage: "Quản lý (Manage)",
  approve: "Duyệt (Approve)",
  audit: "Kiểm toán (Audit)",
  process: "Xử lý (Process)",
};

const SCOPE_LABELS: Record<string, string> = {
  own: "Cá nhân (Own)",
  dept: "Phòng ban (Dept)",
  any: "Tất cả (Any)",
};

// ─── Modal Component for Creating a Resource ───────────────────────────────────
function CreateResourceModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const { data: enumsRes, isLoading: enumsLoading } =
    useGetPermissionsEnumQuery();

  const availableActions =
    enumsRes?.data?.actions?.filter((a) => a !== "*") || [];
  const availableScopes = enumsRes?.data?.scopes || [];

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && availableActions.length > 0 && selectedActions.length === 0) {
      setSelectedActions(
        availableActions.filter((a) =>
          ["read", "create", "update", "delete"].includes(a),
        ),
      );
    }
    if (isOpen && availableScopes.length > 0 && selectedScopes.length === 0) {
      setSelectedScopes(availableScopes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, enumsLoading]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setSlug("");
      setDescription("");
      setSelectedActions([]);
      setSelectedScopes([]);
    }
  }, [isOpen]);

  const [createResource, { isLoading }] = useCreateResourceMutation();

  const toggleAction = (id: string) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const toggleScope = (id: string) => {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const generatedPermissionsCount =
    selectedActions.length * selectedScopes.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      gooeyToast.error("Vui lòng nhập tên và mã (slug) tài nguyên");
      return;
    }

    try {
      const permissionsPayload = [];
      for (const action of selectedActions) {
        for (const scope of selectedScopes) {
          permissionsPayload.push({
            action: action,
            scope: scope,
            name: `${action} ${slug}`,
            description: `Auto-generated permission for ${action} on ${slug} at ${scope} scope`,
          });
        }
      }

      await createResource({
        name,
        slug: slug.toLowerCase(),
        description,
        isLive: false,
        permissions: permissionsPayload,
      }).unwrap();

      gooeyToast.success("Đã tạo tài nguyên hệ thống thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      gooeyToast.error("Lỗi khi tạo tài nguyên");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Thêm Tài nguyên (Phân hệ) Mới
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đăng ký một phân hệ mới vào hệ thống IAM
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <form
            id="create-resource-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                Thông tin Cơ bản
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tên tài nguyên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (
                        !slug ||
                        slug === name.toLowerCase().replace(/\s+/g, "_")
                      ) {
                        setSlug(
                          e.target.value.toLowerCase().replace(/\s+/g, "_"),
                        );
                      }
                    }}
                    placeholder="VD: Quản lý Kho"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Mã (Slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                    }
                    placeholder="VD: inventory"
                    className="w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chức năng của phân hệ này..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Auto-Generate Permissions */}
            <div className="space-y-4">
              <div className="flex items-end justify-between border-b border-border pb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Khởi tạo Quyền hạn (Auto-Generate)
                </h4>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Sẽ tạo {generatedPermissionsCount} quyền
                </span>
              </div>

              {enumsLoading ? (
                <div className="flex justify-center p-4">
                  <RefreshCw
                    className="animate-spin text-muted-foreground"
                    size={20}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Actions */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Hành động (Actions)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableActions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => toggleAction(action)}
                          className={`px-2.5 py-1.5 text-[11px] uppercase font-medium rounded-md border transition-colors ${
                            selectedActions.includes(action)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {ACTION_LABELS[action] || action}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scopes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Phạm vi (Scopes)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableScopes.map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => toggleScope(scope)}
                          className={`px-2.5 py-1.5 text-[11px] uppercase font-medium rounded-md border transition-colors ${
                            selectedScopes.includes(scope)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {SCOPE_LABELS[scope] || scope}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {generatedPermissionsCount > 0 && (
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground leading-relaxed mt-2">
                  <p className="font-semibold text-foreground mb-1">
                    Ví dụ quyền sẽ được tạo:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] opacity-80">
                    {selectedActions.slice(0, 2).map((a) =>
                      selectedScopes.slice(0, 2).map((s) => (
                        <li key={`${a}-${s}`}>
                          {slug || "resource"}:{a}:{s}
                        </li>
                      )),
                    )}
                    {generatedPermissionsCount > 4 && (
                      <li>... và {generatedPermissionsCount - 4} quyền khác</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="px-5 py-4 border-t border-border bg-muted/10 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Hủy
          </button>
          <ActionButton
            type="submit"
            form="create-resource-form"
            disabled={
              isLoading || generatedPermissionsCount === 0 || !name || !slug
            }
            className="btn-primary flex items-center gap-1.5 px-5 py-2 text-xs disabled:opacity-50"
            isLoading={isLoading}
          >
            Lưu Tài nguyên
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function ResourcesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initial State from URL
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [permSearch, setPermSearch] = useState("");

  // Track ID instead of full object for deep-linking & performance
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    searchParams.get("id") || null,
  );

  // ─── EDIT MODE STATES ───
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  // API Hooks
  const {
    data: resourcesRes,
    isLoading: resourcesLoading,
    isFetching: resourcesFetching,
    refetch: refetchResources,
  } = useGetResourcesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter,
  });

  // Fetch full details of the selected resource including its full permissions array
  const { data: resourceDetailsRes, isFetching: detailsFetching } =
    useGetResourceDetailsQuery(selectedResourceId ?? "", {
      skip: !selectedResourceId,
    });

  const [updateResource, { isLoading: isUpdatingResource }] =
    useUpdateResourceMutation();
  const [deletePermission] = useDeletePermissionMutation();
  const [deleteResource] = useDeleteResourceMutation();
  const [toggleResourceStatus] = useToggleResourceStatusMutation();
  const [togglePermissionStatus] = useTogglePermissionStatusMutation();

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (globalFilter) params.set("q", globalFilter);
    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      params.set("limit", pagination.pageSize.toString());

    if (selectedResourceId) params.set("id", selectedResourceId);
    else params.delete("id");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [globalFilter, pagination, selectedResourceId, pathname, router]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const resourcesData = Array.isArray(resourcesRes)
    ? resourcesRes
    : resourcesRes?.data || [];
  const totalRows = Array.isArray(resourcesRes)
    ? resourcesRes.length
    : resourcesRes?.meta?.pagination?.total || resourcesData.length;
  const pageCount = Array.isArray(resourcesRes)
    ? 1
    : resourcesRes?.meta?.pagination?.total_page || 1;

  // Use the detailed API response if available, otherwise fallback to table data while loading
  const resourceInfo = useMemo(() => {
    if (!selectedResourceId) return null;
    return (
      resourceDetailsRes?.data ||
      resourcesData.find((r: SystemResource) => r.id === selectedResourceId) ||
      null
    );
  }, [selectedResourceId, resourcesData, resourceDetailsRes]);

  // Sync Edit Form with Data (Render Phase Sync để tránh Cascading Renders)
  const [prevResourceInfo, setPrevResourceInfo] = useState<any>(null);
  if (resourceInfo !== prevResourceInfo) {
    setPrevResourceInfo(resourceInfo);
    if (!isEditing && resourceInfo) {
      setEditForm({
        name: resourceInfo.name || "",
        slug: resourceInfo.slug || "",
        description: resourceInfo.description || "",
      });
    }
  }

  const hasChanges = useMemo(() => {
    if (!resourceInfo) return false;
    return (
      editForm.name !== resourceInfo.name ||
      editForm.slug !== resourceInfo.slug ||
      editForm.description !== (resourceInfo.description || "")
    );
  }, [editForm, resourceInfo]);

  const filteredResources = useMemo(() => {
    if (!globalFilter) return resourcesData;
    const lowerQ = globalFilter.toLowerCase();
    return resourcesData.filter(
      (r: SystemResource) =>
        r.name.toLowerCase().includes(lowerQ) ||
        r.slug.toLowerCase().includes(lowerQ),
    );
  }, [resourcesData, globalFilter]);

  // ─── SIDEBAR STATES ───
  const [leftCollapsed, setLeftCollapsed] = useState(!selectedResourceId);
  const [rightCollapsed, setRightCollapsed] = useState(!selectedResourceId);

  const handleSelectResource = useCallback(
    (id: string) => {
      if (selectedResourceId !== id) {
        setSelectedResourceId(id);
        setPermSearch("");
        setLeftCollapsed(false);
        setRightCollapsed(false);
        setIsEditing(false); // Reset edit mode on selection change
      }
    },
    [selectedResourceId],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedResourceId(null);
    setLeftCollapsed(true);
    setRightCollapsed(true);
    setIsEditing(false);
  }, []);

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (resourceInfo) {
      setEditForm({
        name: resourceInfo.name || "",
        slug: resourceInfo.slug || "",
        description: resourceInfo.description || "",
      });
    }
  };

  // ── Resources table columns ────────────────────────
  const resourceColumns = useMemo<ColumnDef<StockFeatures, any>[]>(
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
        accessorKey: "name",
        size: 200,
        meta: { title: "Tên Phân hệ (Resource)" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Tài nguyên</SortHeader>
        ),
        cell: ({ row }: any) => {
          const isSelected = row.original.id === selectedResourceId;
          return (
            <div className="flex items-center gap-3 truncate">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Layers size={14} />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}
                >
                  {row.original.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate opacity-80 mt-0.5">
                  {row.original.slug}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        meta: { title: "Mô tả" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Mô tả
          </span>
        ),
        cell: ({ getValue }: any) => {
          return (
            <span className="text-xs text-muted-foreground truncate block">
              {getValue() || "-"}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        id: "permissionCount",
        size: 70,
        meta: { title: "Số lượng Quyền" },
        header: () => (
          <div className="flex justify-center">
            <ShieldAlert size={12} className="text-muted-foreground" />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="text-center text-xs font-semibold text-foreground tabular-nums">
            {row.original.permissions?.length || 0}
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
                  row.original.isLive ? "Tắt phân hệ?" : "Kích hoạt phân hệ?"
                }
                confirmMessage={`Bạn có chắc chắn muốn ${row.original.isLive ? "tắt" : "bật"} trạng thái hoạt động của phân hệ "${row.original.name}"?`}
                confirmLabel="Xác nhận"
                onAction={async (newChecked) => {
                  await toggleResourceStatus({
                    id: row.original.id,
                    isLive: newChecked,
                  }).unwrap();
                  return { name: row.original.name, isLive: newChecked };
                }}
                loadingMessage="Đang xử lý..."
                successMessage={({ name, isLive }) =>
                  `Đã ${isLive ? "kích hoạt" : "tắt"} phân hệ ${name}`
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
          const isViewing = row.original.id === selectedResourceId;
          return (
            <div
              className="flex items-center justify-end gap-0.5"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button
                onClick={() => handleSelectResource(row.original.id)}
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
                tooltip="Xóa phân hệ"
                className="!w-7 !h-7 !p-0 hover:bg-red-50 hover:text-red-600 text-muted-foreground"
                requireConfirm
                confirmTitle="Xóa phân hệ?"
                confirmMessage={`Xác nhận xóa phân hệ "${row.original.name}" và toàn bộ quyền liên quan? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa"
                onAction={async () => {
                  await deleteResource(row.original.id).unwrap();
                  if (selectedResourceId === row.original.id)
                    handleCloseDetail();
                  refetchResources();
                  return row.original.name;
                }}
                loadingMessage="Đang xóa..."
                successMessage={(name) => `Đã xóa phân hệ ${name}.`}
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
    [
      selectedResourceId,
      handleSelectResource,
      handleCloseDetail,
      toggleResourceStatus,
      deleteResource,
      refetchResources,
    ],
  );

  return (
    <>
      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetchResources()}
      />

      <div className="flex flex-col h-full bg-background overflow-hidden">
        <div className="flex lg:hidden flex-1 items-center justify-center px-6">
          <div className="text-center max-w-xs bg-card p-6 rounded-2xl border border-border shadow-sm">
            <Monitor size={40} className="text-primary/40 mx-auto mb-4" />
            <h2 className="text-sm font-bold text-foreground mb-2">
              Tính năng tối ưu cho Desktop
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quản lý tài nguyên hệ thống yêu cầu không gian hiển thị rộng. Vui
              lòng sử dụng máy tính để trải nghiệm.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-4 md:px-5 py-4 border-b border-border bg-card z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-base md:text-lg font-bold text-foreground">
                Tài nguyên Hệ thống (Resources)
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalRows} phân hệ chức năng đang được quản lý
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                variant="ghost"
                className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
                isLoading={resourcesFetching}
                onAction={async () => {
                  await new Promise((r) => setTimeout(r, 1200));
                  return "Danh_sach_Phan_he.xlsx";
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
                isLoading={resourcesFetching}
                onAction={async () => {
                  await refetchResources();
                }}
                loadingMessage="Đang làm mới..."
                successMessage="Dữ liệu đã được cập nhật"
              >
                <RefreshCw size={13} /> Làm mới
              </ActionButton>

              <ActionButton
                variant="primary"
                className="!h-8 !px-3 !py-0 !text-xs"
                onAction={() => setIsCreateModalOpen(true)}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Thêm Phân hệ mới</span>
                <span className="sm:hidden">Thêm</span>
              </ActionButton>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <DetailLayout
            title="Chi tiết Tài nguyên"
            leftSidebar={{
              collapsed: leftCollapsed,
              onCollapseChange: setLeftCollapsed,
              defaultCollapsed: !selectedResourceId,
              content: (collapsed) => {
                if (collapsed || !selectedResourceId) {
                  return (
                    <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                      <div
                        className="relative group cursor-help"
                        title="Vui lòng chọn tài nguyên để thao tác"
                      >
                        <FileText size={20} />
                      </div>
                      {selectedResourceId && (
                        <div
                          className="relative group cursor-help"
                          title="Lịch sử"
                        >
                          <Clock size={20} />
                        </div>
                      )}
                    </div>
                  );
                }

                if (!resourceInfo) return null;

                return (
                  <div className="flex flex-col h-full fade-in p-5">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-3 shadow-sm">
                        {editForm.slug?.slice(0, 2).toUpperCase() ||
                          resourceInfo.slug?.slice(0, 2).toUpperCase()}
                      </div>

                      {!isEditing ? (
                        <>
                          <h2 className="text-base font-bold text-foreground">
                            {resourceInfo.name}
                          </h2>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5 px-2 py-0.5 bg-muted/50 rounded">
                            {resourceInfo.slug}
                          </p>
                        </>
                      ) : (
                        <div className="w-full space-y-2 px-2 mt-1">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                name: e.target.value,
                              }))
                            }
                            className="w-full input-base text-sm font-bold text-center py-1.5"
                            placeholder="Tên tài nguyên"
                          />
                          <input
                            type="text"
                            value={editForm.slug}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                slug: e.target.value,
                              }))
                            }
                            className="w-full input-base text-xs font-mono text-center py-1.5"
                            placeholder="Slug"
                          />
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center justify-center gap-2 w-full mt-6">
                          <ActionButton
                            iconOnly
                            variant="secondary"
                            tooltip="Chỉnh sửa thông tin"
                            className="!w-9 !h-9 !rounded-full"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit size={14} />
                          </ActionButton>
                          <div className="w-px h-5 bg-border mx-1" />
                          <ActionButton
                            iconOnly
                            variant="destructive"
                            tooltip="Xóa tài nguyên"
                            className="!w-9 !h-9 !rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                            requireConfirm
                            confirmTitle="Xóa phân hệ?"
                            confirmMessage={`Xác nhận xóa phân hệ "${resourceInfo.name}" và toàn bộ quyền liên quan? Hành động này không thể hoàn tác.`}
                            confirmLabel="Xóa"
                            onAction={async () => {
                              await deleteResource(resourceInfo.id).unwrap();
                              handleCloseDetail();
                              refetchResources();
                              return resourceInfo.name;
                            }}
                            loadingMessage="Đang xóa..."
                            successMessage={(name) => `Đã xóa phân hệ ${name}.`}
                          >
                            <Trash2 size={14} />
                          </ActionButton>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3">
                          Mô tả Phân hệ
                        </h3>
                        {!isEditing ? (
                          <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                            {resourceInfo.description ||
                              "Chưa có mô tả cho phân hệ này."}
                          </p>
                        ) : (
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                            rows={4}
                            className="w-full input-base text-xs p-3 resize-none bg-background leading-relaxed"
                            placeholder="Nhập mô tả..."
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">
                          Lịch sử hệ thống
                        </h3>
                        <div className="relative">
                          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border z-0" />
                          <div className="space-y-5 relative z-10">
                            {/* DELETE LOG */}
                            {resourceInfo.deletedAt && (
                              <div className="flex gap-4">
                                <div className="w-3 h-3 rounded-full bg-background border-2 border-red-500 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="text-xs font-bold text-red-600 leading-tight mb-0.5">
                                    Đã xóa
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground mb-1">
                                    {new Date(
                                      resourceInfo.deletedAt,
                                    ).toLocaleString("vi-VN")}
                                  </p>
                                  {resourceInfo.deletedByName && (
                                    <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                                      Bởi: {resourceInfo.deletedByName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* UPDATE LOG */}
                            {resourceInfo.updatedAt && (
                              <div className="flex gap-4">
                                <div className="w-3 h-3 rounded-full bg-background border-2 border-primary mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                    Cập nhật gần nhất
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground mb-1">
                                    {new Date(
                                      resourceInfo.updatedAt,
                                    ).toLocaleString("vi-VN")}
                                  </p>
                                  {resourceInfo.updatedByName && (
                                    <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                                      Bởi: {resourceInfo.updatedByName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* CREATE LOG */}
                            {resourceInfo.createdAt && (
                              <div className="flex gap-4">
                                <div className="w-3 h-3 rounded-full bg-background border-2 border-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                    Khởi tạo hệ thống
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground mb-1">
                                    {new Date(
                                      resourceInfo.createdAt,
                                    ).toLocaleString("vi-VN")}
                                  </p>
                                  {resourceInfo.createdByName && (
                                    <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                                      Bởi: {resourceInfo.createdByName}
                                    </p>
                                  )}
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
            /* ─── RIGHT COLUMN: Permissions inside Resource ─── */
            rightSidebar={{
              collapsed: rightCollapsed,
              onCollapseChange: setRightCollapsed,
              defaultCollapsed: !selectedResourceId,
              content: (collapsed) => {
                if (collapsed || !selectedResourceId) {
                  return (
                    <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                      <div
                        className="relative group cursor-help"
                        title="Vui lòng chọn tài nguyên để xem quyền"
                      >
                        <ShieldAlert size={20} />
                      </div>
                    </div>
                  );
                }

                // Show spinner if we are fetching deep details
                if (
                  detailsFetching &&
                  (!resourceInfo || !resourceInfo.permissions)
                ) {
                  return (
                    <div className="flex justify-center items-center h-full text-primary fade-in">
                      <RefreshCw className="animate-spin" size={24} />
                    </div>
                  );
                }

                const allPermissions = resourceInfo?.permissions || [];

                const filteredPermissions = allPermissions.filter(
                  (perm: Permission) => {
                    const searchLower = permSearch.toLowerCase();
                    return (
                      perm.name.toLowerCase().includes(searchLower) ||
                      perm.slug.toLowerCase().includes(searchLower) ||
                      perm.action.toLowerCase().includes(searchLower) ||
                      perm.scope.toLowerCase().includes(searchLower)
                    );
                  },
                );

                return (
                  <div className="flex flex-col h-full fade-in overflow-y-auto custom-scrollbar p-1">
                    <div className="mb-4 pt-1 space-y-3">
                      <div>
                        <h3 className="text-xs font-bold text-foreground px-2">
                          Quản lý Quyền hạn (Permissions)
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1 px-2">
                          Các quyền thuộc phân hệ này. Bấm vào &quot;Chỉnh
                          sửa&quot; ở Footer để quản lý các quyền này.
                        </p>
                      </div>

                      <div className="px-2">
                        <div className="relative">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <input
                            type="text"
                            placeholder="Tìm quyền (tên, action, scope)..."
                            value={permSearch}
                            onChange={(e) => setPermSearch(e.target.value)}
                            className="input-base pl-8 py-1.5 text-xs w-full bg-background"
                          />
                          {permSearch && (
                            <button
                              onClick={() => setPermSearch("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {allPermissions.length === 0 ? (
                      <div className="text-center py-8 opacity-60">
                        <ShieldAlert
                          size={24}
                          className="text-muted-foreground mx-auto mb-2"
                        />
                        <p className="text-[10px] font-medium text-foreground">
                          Phân hệ này chưa có quyền nào
                        </p>
                      </div>
                    ) : filteredPermissions.length === 0 ? (
                      <div className="text-center py-8 opacity-60">
                        <Search
                          size={24}
                          className="text-muted-foreground mx-auto mb-2"
                        />
                        <p className="text-[10px] font-medium text-foreground">
                          Không tìm thấy quyền phù hợp
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 pb-6 px-1">
                        {filteredPermissions.map((perm: Permission) => (
                          <div
                            key={perm.id}
                            className={`flex flex-col gap-2 p-3 bg-muted/10 border border-border/50 rounded-xl transition-colors group ${
                              !perm.isLive ? "opacity-70 hover:opacity-100" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between min-w-0">
                              <div className="flex items-center justify-between w-full">
                                <div className="min-w-0 pr-2">
                                  <p
                                    className={`text-xs font-bold truncate transition-colors ${
                                      perm.isLive
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {perm.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono truncate mt-1">
                                    {perm.slug}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* Permission Live Toggle - Disabled when !isEditing */}
                                  <div
                                    title={
                                      !isEditing
                                        ? "Bấm 'Chỉnh sửa' để thay đổi"
                                        : ""
                                    }
                                  >
                                    <ActionSwitch
                                      checked={!!perm.isLive}
                                      disabled={!isEditing}
                                      requireConfirm
                                      confirmTitle={
                                        perm.isLive
                                          ? "Tắt quyền?"
                                          : "Kích hoạt quyền?"
                                      }
                                      confirmMessage={`Xác nhận ${perm.isLive ? "tắt" : "bật"} quyền "${perm.name}"?`}
                                      confirmLabel="Xác nhận"
                                      onAction={async (newChecked) => {
                                        await togglePermissionStatus({
                                          id: perm.id,
                                          isLive: newChecked,
                                        }).unwrap();
                                        refetchResources();
                                        return {
                                          name: perm.name,
                                          isLive: newChecked,
                                        };
                                      }}
                                      successMessage={({ name, isLive }) =>
                                        `Đã ${isLive ? "kích hoạt" : "tắt"} quyền ${name}`
                                      }
                                      errorMessage="Lỗi khi lưu trạng thái quyền"
                                    />
                                  </div>

                                  {isEditing && (
                                    <ActionButton
                                      iconOnly
                                      variant="ghost"
                                      className="!w-6 !h-6 !p-0 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                      tooltip="Xóa quyền này vĩnh viễn"
                                      requireConfirm
                                      confirmTitle="Xóa quyền?"
                                      confirmMessage={`Bạn có chắc chắn muốn xóa quyền "${perm.name}" vĩnh viễn? Việc này có thể ảnh hưởng đến hệ thống đang chạy.`}
                                      confirmLabel="Xóa"
                                      onAction={async () => {
                                        await deletePermission(
                                          perm.id,
                                        ).unwrap();
                                        refetchResources();
                                        return perm.name;
                                      }}
                                      successMessage={(name) =>
                                        `Đã xóa quyền ${name}`
                                      }
                                    >
                                      <Trash2 size={13} />
                                    </ActionButton>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-0.5">
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                                {perm.action}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                {perm.scope}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            }}
            /* ── FOOTER: Save and Add Permission Actions ── */
            footer={
              selectedResourceId ? (
                <>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mr-auto hidden sm:flex">
                    <Clock size={13} /> Cập nhật lần cuối:{" "}
                    {resourceInfo?.updatedAt
                      ? new Date(resourceInfo.updatedAt).toLocaleDateString(
                          "vi-VN",
                        )
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
                      {/* Đã xóa mr-auto và loại bỏ các dấu chấm than (!) */}
                      <ActionButton
                        isUnderDevelopment
                        variant="outline"
                        className="text-xs px-4 py-2 border-dashed hidden lg:flex"
                      >
                        <Plus size={13} className="mr-1 inline-block" /> Thêm
                        Quyền
                      </ActionButton>

                      <button
                        className="btn-secondary text-xs px-4 py-2"
                        onClick={handleCancelEdit}
                      >
                        Hủy
                      </button>

                      <ActionButton
                        variant="primary"
                        className="text-xs px-5 py-2 min-w-[140px] justify-center"
                        isLoading={isUpdatingResource || detailsFetching}
                        disabled={!hasChanges}
                        onAction={async () => {
                          await updateResource({
                            id: selectedResourceId,
                            name: editForm.name,
                            slug: editForm.slug,
                            description: editForm.description,
                          }).unwrap();
                          setIsEditing(false);
                          refetchResources();
                          return editForm.name;
                        }}
                        loadingMessage="Đang lưu thay đổi..."
                        successMessage={(name) =>
                          `Đã cập nhật tài nguyên "${name}"`
                        }
                        errorMessage="Lỗi khi lưu thông tin."
                      >
                        <Save size={14} /> Lưu thay đổi
                      </ActionButton>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full text-center text-xs font-medium text-muted-foreground italic flex items-center justify-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Vui lòng chọn tài nguyên để thao tác
                </div>
              )
            }
          >
            <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <DataTable
                  columns={resourceColumns}
                  data={filteredResources}
                  pageCount={pageCount}
                  totalRows={totalRows}
                  globalFilter={globalFilter}
                  onGlobalFilterChange={(v) =>
                    handleFilterChange(setGlobalFilter, v)
                  }
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  isLoading={resourcesLoading}
                  skeletonRowCount={8}
                  onRowClick={(row) => handleSelectResource(row.original.id)}
                />
              </div>
            </div>
          </DetailLayout>
        </div>
      </div>
    </>
  );
}
