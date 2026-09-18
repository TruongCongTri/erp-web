/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import type {
  ColumnDef,
  PaginationState,
  StockFeatures,
} from "@tanstack/react-table";
import {
  CheckCircle,
  Eye,
  Clock,
  Download,
  RefreshCw,
  AlertTriangle,
  Building2,
  Briefcase,
  XCircle,
  UserPlus,
  ArrowRight,
  FileCheck,
  ShieldCheck,
  FileText,
  ArrowUp,
  MapPin,
  Phone,
  User,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  UserCheck,
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
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ─── RTK QUERY HOOKS ────────────────────────────────────────────────────────
import {
  useGetPendingClaimsQuery,
  useGetNewPendingClaimsCountQuery,
  useApproveProfileClaimMutation,
  useRejectProfileClaimMutation,
  useGetProfileByCodeQuery,
  hrApiSlice,
} from "@/lib/store/hrApiSlice";

// ─── CẤU TRÚC DỮ LIỆU TỪ API ───────────────────────────
interface ClaimData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  status: string; // "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  role?: any | null;
  profile?: {
    id?: string;
    employeeCode?: string;
    department?: string;
    jobTitle?: string;
    fullName?: string;
  } | null;
  bonusPermsCount?: number;
  evidenceUrl?: string;
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
    <span className={`badge ${config.className} text-[10px] px-1.5 py-0.5`}>
      {Icon && <Icon size={11} />}
      {config.label}
    </span>
  );
}

// ─── STATUS CONFIG ("PENDING_APPROVAL") ──────────────────────────
const statusConfig: Record<string, any> = {
  PENDING_APPROVAL: {
    label: "Chờ duyệt",
    className: "badge-warning",
    icon: Clock,
  },
  APPROVED: {
    label: "Đã phê duyệt",
    className: "badge-success",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Đã từ chối",
    className: "badge-danger",
    icon: XCircle,
  },
};

// ─── Table-Row Styled Mobile Item ────────────────────────────────────────────
function MobileClaimRow({
  claim,
  isSelected,
  onSelect,
}: {
  claim: ClaimData;
  isSelected: boolean;
  onSelect: (claim: ClaimData) => void;
}) {
  const config = statusConfig[claim.status] || statusConfig.PENDING_APPROVAL;

  const targetCode = claim.profile?.employeeCode;
  const targetDept = claim.profile?.department;

  return (
    <div
      onClick={() => onSelect(claim)}
      className={`flex items-center justify-between py-2.5 px-3 border-b border-border/60 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer group text-xs select-none ${
        isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          {(claim.fullName || "U").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="font-semibold text-foreground text-xs truncate">
              {claim.fullName}
            </p>
            <Badge config={config} />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground truncate">
            {targetCode ? (
              <>
                <span className="font-mono text-primary font-bold">
                  {targetCode}
                </span>
                <span>•</span>
                <span className="truncate max-w-[130px]">
                  {targetDept || "Chưa gán ban"}
                </span>
              </>
            ) : (
              <span className="italic text-amber-600">Chưa gắn mã NV</span>
            )}
            <span>•</span>
            <span className="font-mono">
              {claim.createdAt
                ? new Date(claim.createdAt).toLocaleDateString("vi-VN")
                : "—"}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onSelect(claim)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Kiểm duyệt yêu cầu"
        >
          <Eye size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Content Component ────────────────────────────────────────────────────
export default function PendingClaimsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<any>();

  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    searchParams.get("id") || null,
  );
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileReviewModal, setShowMobileReviewModal] = useState(false);

  // ─── 1. RTK QUERY: FETCH LIST ───
  const {
    data: claimsRes,
    isFetching,
    refetch,
  } = useGetPendingClaimsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
  });

  const claimsData: ClaimData[] = claimsRes?.data || [];
  const totalRows = claimsRes?.meta?.pagination?.total || 0;
  const pageCount = claimsRes?.meta?.pagination?.total_page || 1;

  // ─── 2. RTK QUERY: MUTATIONS ───
  const [approveClaim] = useApproveProfileClaimMutation();
  const [rejectClaim] = useRejectProfileClaimMutation();

  // ─── 3. RTK QUERY: SOCKET EVENT LISTENER ───
  const { data: newClaimsCount = 0 } = useGetNewPendingClaimsCountQuery();

  const handleRefreshClick = () => {
    refetch();
    dispatch(
      hrApiSlice.util.updateQueryData(
        "getNewPendingClaimsCount",
        undefined,
        () => 0,
      ),
    );
  };

  // ─── 4. DERIVED STATES ───
  const selectedClaim = useMemo(
    () => claimsData.find((c) => c.id === selectedClaimId) || null,
    [claimsData, selectedClaimId],
  );

  // ─── 5. RTK QUERY: FETCH TARGET PROFILE FOR COMPARISON ───
  const targetEmployeeCode = selectedClaim?.profile?.employeeCode;
  const { data: profileRes, isFetching: isFetchingProfile } =
    useGetProfileByCodeQuery(targetEmployeeCode ?? "", {
      skip: !targetEmployeeCode,
    });
  const targetProfile = profileRes?.data;

  // ─── UI & SIDEBAR STATES ───
  const [leftCollapsed, setLeftCollapsed] = useState(!selectedClaimId);
  const [rightCollapsed, setRightCollapsed] = useState(!selectedClaimId);
  const [rightSections, setRightSections] = useState({
    profileData: true,
    evidence: true,
    history: false,
  });

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (globalFilter) params.set("q", globalFilter);
    if (statusFilter.length) params.set("status", statusFilter.join(","));
    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      params.set("limit", pagination.pageSize.toString());
    if (selectedClaimId) params.set("id", selectedClaimId);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    globalFilter,
    statusFilter,
    pagination,
    selectedClaimId,
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

  const handleSelectClaim = useCallback((id: string) => {
    setSelectedClaimId(id);
    setLeftCollapsed(false);
    setRightCollapsed(false);
  }, []);

  const handleMobileSelectClaim = (claim: ClaimData) => {
    handleSelectClaim(claim.id);
    setShowMobileReviewModal(true);
  };

  const handleCloseDetail = useCallback(() => {
    setSelectedClaimId(null);
    setLeftCollapsed(true);
    setRightCollapsed(true);
    setShowMobileReviewModal(false);
  }, []);

  // ─── ACTIONS ───
  const handleApproveSubmit = useCallback(async () => {
    if (!selectedClaimId) return;
    try {
      await approveClaim(selectedClaimId).unwrap();
      handleCloseDetail();
      gooeyToast.success(
        "Phê duyệt thành công. Tài khoản đã liên kết với hồ sơ.",
      );
    } catch (error: any) {
      gooeyToast.error(error?.data?.message || "Lỗi khi phê duyệt yêu cầu.");
    }
  }, [approveClaim, selectedClaimId, handleCloseDetail]);

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await rejectClaim(id).unwrap();
        if (selectedClaimId === id) handleCloseDetail();
        gooeyToast.info("Đã từ chối yêu cầu nhận hồ sơ.");
      } catch (error: any) {
        gooeyToast.error(error?.data?.message || "Lỗi khi từ chối yêu cầu.");
      }
    },
    [rejectClaim, selectedClaimId, handleCloseDetail],
  );

  // ── TABLE COLUMNS ────────────────────────
  const columns = useMemo<ColumnDef<StockFeatures, ClaimData, any>[]>(
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
        accessorKey: "claimer",
        size: 250,
        meta: { title: "Tài khoản yêu cầu" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Tài khoản yêu cầu</SortHeader>
        ),
        cell: ({ row }: any) => {
          const isSelected = row.original.id === selectedClaimId;
          const name = row.original.fullName || "User";
          return (
            <div className="flex items-center gap-3 truncate">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate transition-colors ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {row.original.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "targetProfile",
        size: 250,
        meta: { title: "Hồ sơ đích" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Hồ sơ nhân sự đích</SortHeader>
        ),
        cell: ({ row }: any) => {
          const profile = row.original.profile;
          if (!profile) {
            return (
              <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5 opacity-80">
                <AlertTriangle size={12} /> Chưa liên kết hồ sơ
              </p>
            );
          }
          return (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                <Building2 size={12} className="text-muted-foreground" />
                {profile.fullName || row.original.fullName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5 flex items-center gap-1.5">
                <Briefcase size={10} />
                {profile.employeeCode || "—"} · {profile.department || "—"}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        size: 140,
        meta: { title: "Thời gian" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Thời gian gửi</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as string;
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {val ? new Date(val).toLocaleString("vi-VN") : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        size: 120,
        meta: { title: "Trạng thái" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Trạng thái
          </span>
        ),
        cell: ({ getValue }: any) => {
          const config =
            statusConfig[getValue() as string] || statusConfig.PENDING_APPROVAL;
          return <Badge config={config} />;
        },
      },
      {
        id: "actions",
        size: 160,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => {
          const isViewing = row.original.id === selectedClaimId;

          return (
            <div
              className="flex items-center justify-end gap-0.5"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => handleSelectClaim(row.original.id)}
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
                iconOnly
                variant="ghost"
                tooltip="Từ chối"
                className="!w-7 !h-7 !p-0 hover:bg-red-50 hover:text-red-600 text-muted-foreground cursor-pointer"
                requireConfirm
                confirmTitle="Từ chối yêu cầu?"
                confirmMessage={`Xác nhận từ chối yêu cầu nhận hồ sơ của "${row.original.fullName}"?`}
                confirmLabel="Từ chối"
                onAction={() => handleReject(row.original.id)}
                loadingMessage="Đang xử lý..."
                successMessage={(msg) => msg}
              >
                <XCircle size={14} />
              </ActionButton>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [selectedClaimId, handleSelectClaim, handleReject],
  );

  const statusFilterOptions = [
    { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã phê duyệt" },
    { value: "REJECTED", label: "Đã từ chối" },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* ── Floating Notification Badge ── */}
      {newClaimsCount > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <button
            type="button"
            onClick={handleRefreshClick}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-all font-bold text-xs cursor-pointer"
          >
            <ArrowUp size={14} className="animate-bounce shrink-0" />
            <span>Có {newClaimsCount} yêu cầu mới. Nhấn để làm mới.</span>
          </button>
        </div>
      )}

      {/* ── Global Header ── */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              Kiểm duyệt Yêu cầu nhận hồ sơ
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalRows} yêu cầu · Quản lý và xác minh liên kết hồ sơ nhân sự
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium cursor-pointer"
              isLoading={isFetching}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Danh_sach_Yeu_cau.xlsx";
              }}
              loadingMessage="Đang xuất file..."
              successMessage={(file) => `Đã tải xuống ${file}`}
              title="Xuất Excel"
            >
              <Download size={13} className="shrink-0" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </ActionButton>

            <ActionButton
              variant="secondary"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium cursor-pointer"
              isLoading={isFetching}
              onAction={async () => handleRefreshClick()}
              title="Làm mới"
            >
              <RefreshCw
                size={13}
                className={`shrink-0 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── MOBILE LIST VIEW (< md) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden">
        {/* Mobile Search & Filter Trigger */}
        <div className="p-3 border-b border-border bg-card flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) =>
                handleFilterChange(setGlobalFilter, e.target.value)
              }
              placeholder="Tìm theo tên, email..."
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
              statusFilter.length > 0
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
            title="Lọc trạng thái"
          >
            <SlidersHorizontal size={13} />
            {statusFilter.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white font-mono text-[9px] flex items-center justify-center">
                {statusFilter.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Rows List */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-border/40">
          {claimsData.length === 0 && !isFetching ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <UserPlus size={28} className="text-muted-foreground/30" />
              <p className="text-xs font-semibold text-muted-foreground">
                Không có yêu cầu nhận hồ sơ nào
              </p>
            </div>
          ) : (
            claimsData.map((claim) => (
              <MobileClaimRow
                key={claim.id}
                claim={claim}
                isSelected={claim.id === selectedClaimId}
                onSelect={handleMobileSelectClaim}
              />
            ))
          )}
        </div>

        {/* Docked Mobile Bottom Pagination */}
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
              disabled={pagination.pageIndex === 0 || isFetching}
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
              disabled={pagination.pageIndex >= pageCount - 1 || isFetching}
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

      {/* ── DESKTOP 3-COLUMN ARCHITECTURE (md:) ── */}
      <div className="flex-1 min-h-0 relative hidden md:block">
        <DetailLayout
          // title="Chi tiết Yêu cầu"
          /* ── LEFT COLUMN: Context (Account vs Claim) ── */
          leftSidebar={{
            collapsed: leftCollapsed,
            onCollapseChange: setLeftCollapsed,
            defaultCollapsed: !selectedClaimId,
            content: (collapsed) => {
              if (collapsed || !selectedClaim) {
                return (
                  <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                    <div
                      className="relative group cursor-help"
                      title="Chọn yêu cầu"
                    >
                      <UserPlus size={20} />
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col h-full fade-in p-5 space-y-6">
                  {/* Claimer Info */}
                  <div className="bg-muted/10 border border-border rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                      <User size={12} /> Tài khoản đăng ký
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {(selectedClaim.fullName || "U")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {selectedClaim.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedClaim.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center text-muted-foreground/50">
                    <ArrowRight size={20} />
                  </div>

                  {/* Target Profile Target Info */}
                  {selectedClaim.profile ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                        <Briefcase size={12} /> Mong muốn nhận Hồ sơ
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {(
                            selectedClaim.profile.fullName ||
                            selectedClaim.fullName
                          )
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {selectedClaim.profile.fullName ||
                              selectedClaim.fullName}
                          </p>
                          <code className="text-[10px] text-muted-foreground bg-background px-1 py-0.5 rounded border border-border mt-1 inline-block">
                            {selectedClaim.profile.employeeCode || "—"}
                          </code>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/10 border border-border border-dashed rounded-xl p-6 text-center shadow-sm">
                      <AlertTriangle
                        size={24}
                        className="text-amber-500 mx-auto mb-3"
                      />
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Chưa liên kết mã hồ sơ
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Tài khoản này chưa trỏ tới mã nhân viên nào trên hệ
                        thống.
                      </p>
                    </div>
                  )}
                </div>
              );
            },
          }}
          /* ─── RIGHT COLUMN: Evidence & System Profile ─── */
          rightSidebar={{
            collapsed: rightCollapsed,
            onCollapseChange: setRightCollapsed,
            defaultCollapsed: !selectedClaimId,
            content: (collapsed) => {
              if (collapsed || !selectedClaim) {
                return (
                  <div className="flex flex-col items-center py-6 gap-6 text-muted-foreground fade-in h-full">
                    <div className="relative group cursor-help">
                      <FileCheck size={20} />
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col h-full fade-in">
                  <DetailAccordion
                    title="Đối chiếu Dữ liệu gốc (Hệ thống)"
                    icon={<Building2 size={14} />}
                    isExpanded={rightSections.profileData}
                    onToggle={() =>
                      setRightSections((p) => ({
                        ...p,
                        profileData: !p.profileData,
                      }))
                    }
                  >
                    <div className="space-y-4 pt-1">
                      {isFetchingProfile ? (
                        <div className="flex justify-center py-6">
                          <RefreshCw
                            size={24}
                            className="animate-spin text-primary"
                          />
                        </div>
                      ) : targetProfile ? (
                        <div className="space-y-3">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                              Dữ liệu chính thức cho mã{" "}
                              <strong>{targetProfile.employeeCode}</strong>.
                            </p>
                          </div>

                          <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <User
                                size={14}
                                className="text-muted-foreground"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                                  Họ và Tên
                                </p>
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {targetProfile.fullName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Briefcase
                                size={14}
                                className="text-muted-foreground"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                                  Phòng ban &amp; Chức vụ
                                </p>
                                <p className="text-xs font-medium text-foreground truncate">
                                  {targetProfile.department} ·{" "}
                                  {targetProfile.jobTitle}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone
                                size={14}
                                className="text-muted-foreground"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                                  Điện thoại
                                </p>
                                <p className="text-xs font-medium text-foreground truncate">
                                  {targetProfile.phoneNumber || "—"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin
                                size={14}
                                className="text-muted-foreground"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">
                                  Địa chỉ
                                </p>
                                <p className="text-xs font-medium text-foreground truncate">
                                  {targetProfile.location || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <AlertTriangle
                            size={24}
                            className="mx-auto mb-2 opacity-50 text-amber-500"
                          />
                          <p className="text-xs font-medium">
                            Hồ sơ này không tồn tại hoặc đã bị xóa
                          </p>
                        </div>
                      )}
                    </div>
                  </DetailAccordion>

                  <DetailAccordion
                    title="Bằng chứng đính kèm"
                    icon={<FileCheck size={14} />}
                    isExpanded={rightSections.evidence}
                    onToggle={() =>
                      setRightSections((p) => ({ ...p, evidence: !p.evidence }))
                    }
                  >
                    <div className="space-y-4 pt-1">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                          Tài liệu (Do User cung cấp)
                        </label>
                        <div className="aspect-[4/3] w-full bg-muted border border-border border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors">
                          {selectedClaim.evidenceUrl ? (
                            <FileText
                              size={24}
                              className="mb-2 text-primary opacity-80"
                            />
                          ) : (
                            <FileText size={24} className="mb-2 opacity-30" />
                          )}
                          <span className="text-xs font-medium">
                            {selectedClaim.evidenceUrl
                              ? "Bản chụp CCCD đính kèm"
                              : "Không có tài liệu đính kèm"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DetailAccordion>
                </div>
              );
            },
          }}
          footer={
            selectedClaimId ? (
              <div className="flex gap-2 w-full">
                <ActionButton
                  variant="outline"
                  className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs py-2 cursor-pointer"
                  requireConfirm
                  confirmTitle="Từ chối yêu cầu?"
                  confirmMessage="Yêu cầu này sẽ bị từ chối. Tài khoản của nhân sự sẽ không được duyệt."
                  confirmLabel="Từ chối"
                  onAction={() => handleReject(selectedClaimId)}
                  successMessage={(msg) => msg}
                >
                  <XCircle size={14} className="mr-1.5" /> Từ chối
                </ActionButton>

                <ActionButton
                  variant="primary"
                  className="flex-1 text-xs py-2 cursor-pointer"
                  requireConfirm
                  confirmTitle="Phê duyệt liên kết?"
                  confirmMessage="Tài khoản này sẽ được liên kết và kế thừa mọi dữ liệu của hồ sơ hệ thống. Xác nhận?"
                  confirmLabel="Phê duyệt"
                  onAction={handleApproveSubmit}
                  successMessage={(msg) => msg}
                >
                  <ShieldCheck size={14} className="mr-1.5" /> Phê duyệt
                </ActionButton>
              </div>
            ) : (
              <div className="w-full text-center text-xs font-medium text-muted-foreground italic flex items-center justify-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Vui lòng chọn một tài khoản để xét duyệt
              </div>
            )
          }
        >
          {/* ─── CENTER COLUMN: DATA TABLE ─── */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <DataTable
              columns={columns}
              data={claimsData}
              pageCount={pageCount}
              totalRows={totalRows}
              globalFilter={globalFilter}
              onGlobalFilterChange={(v) =>
                handleFilterChange(setGlobalFilter, v)
              }
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={isFetching}
              skeletonRowCount={8}
              onRowClick={(row) => handleSelectClaim(row.original.id)}
              enableMultiRowSelection={true}
            />
          </div>
        </DetailLayout>
      </div>

      {/* ── MOBILE QUICK REVIEW & ACTION SHEET ── */}
      {showMobileReviewModal && selectedClaim && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-card rounded-t-2xl border-t border-border p-4 max-h-[85vh] flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Xác minh &amp; Duyệt Hồ sơ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileReviewModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sheet Content: Diff Comparison */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs custom-scrollbar">
              {/* Account Box */}
              <div className="bg-muted/20 border border-border rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                  <User size={11} /> Tài khoản đăng ký
                </p>
                <p className="font-bold text-xs text-foreground">
                  {selectedClaim.fullName}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {selectedClaim.email}
                </p>
              </div>

              {/* Target Profile Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase text-primary mb-1.5 flex items-center gap-1">
                  <Briefcase size={11} /> Hồ sơ yêu cầu nhận
                </p>
                {selectedClaim.profile ? (
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-foreground">
                      {selectedClaim.profile.fullName || selectedClaim.fullName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Mã:{" "}
                      <strong className="font-mono text-primary">
                        {selectedClaim.profile.employeeCode}
                      </strong>{" "}
                      · {selectedClaim.profile.department}
                    </p>
                  </div>
                ) : (
                  <p className="text-amber-600 italic text-[11px]">
                    Chưa gắn mã hồ sơ nhân viên
                  </p>
                )}
              </div>

              {/* System Profile Details If Exists */}
              {targetProfile && (
                <div className="bg-muted/10 border border-border/80 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    Dữ liệu hệ thống gốc ({targetProfile.employeeCode})
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Chức danh
                      </span>
                      <span className="font-medium text-foreground truncate block">
                        {targetProfile.jobTitle || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Điện thoại
                      </span>
                      <span className="font-mono text-foreground truncate block">
                        {targetProfile.phoneNumber || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Evidence Document */}
              <div className="p-3 bg-muted/20 border border-dashed border-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="text-primary shrink-0" />
                  <span className="text-[11px] font-medium truncate">
                    {selectedClaim.evidenceUrl
                      ? "Bản chụp CCCD đính kèm"
                      : "Không có tài liệu đính kèm"}
                  </span>
                </div>
                {selectedClaim.evidenceUrl && (
                  <a
                    href={selectedClaim.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline shrink-0 font-semibold"
                  >
                    Xem file
                  </a>
                )}
              </div>
            </div>

            {/* Direct Approve / Reject Footer Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border shrink-0">
              <ActionButton
                variant="outline"
                className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs h-9 cursor-pointer"
                requireConfirm
                confirmTitle="Từ chối yêu cầu?"
                confirmMessage={`Xác nhận từ chối yêu cầu nhận hồ sơ của "${selectedClaim.fullName}"?`}
                confirmLabel="Từ chối"
                onAction={() => handleReject(selectedClaim.id)}
                successMessage={(msg) => msg}
              >
                <XCircle size={14} className="mr-1.5" /> Từ chối
              </ActionButton>

              <ActionButton
                variant="primary"
                className="flex-1 text-xs h-9 cursor-pointer"
                requireConfirm
                confirmTitle="Phê duyệt liên kết?"
                confirmMessage="Tài khoản này sẽ được liên kết với hồ sơ hệ thống. Xác nhận?"
                confirmLabel="Phê duyệt"
                onAction={handleApproveSubmit}
                successMessage={(msg) => msg}
              >
                <ShieldCheck size={14} className="mr-1.5" /> Phê duyệt
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE FILTER DRAWER ── */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-card rounded-t-2xl border-t border-border p-4 max-h-[70vh] flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Lọc Trạng Thái
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

            <div className="flex-1 overflow-y-auto space-y-3 text-xs">
              <div className="flex flex-wrap gap-2">
                {statusFilterOptions.map((opt) => {
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
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
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

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {statusFilter.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter([]);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  className="btn-secondary text-xs h-9 px-3 text-red-600 cursor-pointer"
                >
                  Xóa lọc
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
    </div>
  );
}
