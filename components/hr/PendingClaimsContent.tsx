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
  Monitor,
  XCircle,
  UserPlus,
  ArrowRight,
  FileCheck,
  ShieldCheck,
  FileText,
  ArrowUp,
  MapPin,
  Phone,
  Mail,
  User,
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
  status: string; // Thực tế: "PENDING_APPROVAL"
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
    <span className={`badge ${config.className}`}>
      {Icon && <Icon size={12} />}
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

// ─── Main Content Component ────────────────────────────────────────────────────
export default function PendingClaimsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<any>();

  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") || "1", 10) - 1,
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    searchParams.get("id") || null,
  );

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
    const params = new URLSearchParams(searchParams.toString());
    if (globalFilter) params.set("q", globalFilter);
    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 10)
      params.set("limit", pagination.pageSize.toString());

    if (selectedClaimId) params.set("id", selectedClaimId);
    else params.delete("id");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [globalFilter, pagination, selectedClaimId, pathname, router]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleSelectClaim = useCallback(
    (id: string) => {
      if (selectedClaimId !== id) {
        setSelectedClaimId(id);
        setLeftCollapsed(false);
        setRightCollapsed(false);
      }
    },
    [selectedClaimId],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedClaimId(null);
    setLeftCollapsed(true);
    setRightCollapsed(true);
  }, []);

  // ─── ACTIONS ───
  const handleApproveSubmit = useCallback(async () => {
    if (!selectedClaimId) return;
    try {
      await approveClaim(selectedClaimId).unwrap();
      handleCloseDetail();
      return "Phê duyệt thành công. Tài khoản đã liên kết với hồ sơ.";
    } catch (error: any) {
      throw new Error(error?.data?.message || "Lỗi khi phê duyệt yêu cầu.");
    }
  }, [approveClaim, selectedClaimId, handleCloseDetail]);

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await rejectClaim(id).unwrap();
        if (selectedClaimId === id) handleCloseDetail();
        return "Đã từ chối yêu cầu nhận hồ sơ.";
      } catch (error: any) {
        throw new Error(error?.data?.message || "Lỗi khi từ chối yêu cầu.");
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
                  className={`text-xs font-bold truncate transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}
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
        cell: ({ getValue }: any) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Date(getValue() as string).toLocaleString("vi-VN")}
          </span>
        ),
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
                onClick={() => handleSelectClaim(row.original.id)}
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
                iconOnly
                variant="ghost"
                tooltip="Từ chối"
                className="!w-7 !h-7 !p-0 hover:bg-red-50 hover:text-red-600 text-muted-foreground"
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

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* ─── THE TWITTER-STYLE FLOATING BADGE ─── */}
      {newClaimsCount > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <button
            onClick={handleRefreshClick}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-lg hover:bg-primary/90 hover:shadow-primary/20 transition-all font-bold text-xs"
          >
            <ArrowUp size={14} className="animate-bounce" />
            Có {newClaimsCount} yêu cầu mới. Nhấn để làm mới.
          </button>
        </div>
      )}

      <div className="flex lg:hidden flex-1 items-center justify-center px-6">
        <div className="text-center max-w-xs bg-card p-6 rounded-2xl border border-border shadow-sm">
          <Monitor size={40} className="text-primary/40 mx-auto mb-4" />
          <h2 className="text-sm font-bold text-foreground mb-2">
            Tính năng tối ưu cho Desktop
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kiểm duyệt hồ sơ yêu cầu không gian hiển thị rộng. Vui lòng sử dụng
            máy tính để trải nghiệm.
          </p>
        </div>
      </div>

      {/* ── Global Header ── */}
      <div className="flex-shrink-0 px-4 md:px-5 py-4 border-b border-border bg-card z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              Kiểm duyệt Yêu cầu nhận hồ sơ
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý và xác minh danh tính người dùng liên kết với hồ sơ nhân
              sự
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isFetching}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1200));
                return "Danh_sach_Yeu_cau.xlsx";
              }}
              loadingMessage="Đang chuẩn bị dữ liệu xuất..."
              successMessage={(file) => `Đã tải xuống ${file}`}
            >
              <Download size={13} /> Xuất Excel
            </ActionButton>

            <ActionButton
              variant="secondary"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isFetching}
              onAction={async () => handleRefreshClick()}
            >
              <RefreshCw
                size={13}
                className={isFetching ? "animate-spin" : ""}
              />
              Làm mới
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── 3-Column Architecture ── */}
      <div className="flex-1 min-h-0 relative">
        <DetailLayout
          title="Chi tiết Yêu cầu"
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
                    <ArrowRight size={20} className="rotate-90 sm:rotate-0" />
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
                  {/* System Profile Details Fetch */}
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
                              Đây là dữ liệu chính thức đang lưu trong hệ thống
                              nhân sự cho mã{" "}
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
                                  Phòng ban & Chức vụ
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
                            className="mx-auto mb-2 opacity-50"
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

                  <DetailAccordion
                    title="Lịch sử yêu cầu"
                    icon={<Clock size={14} />}
                    isExpanded={rightSections.history}
                    onToggle={() =>
                      setRightSections((p) => ({ ...p, history: !p.history }))
                    }
                    className="border-b-0 lg:border-b"
                  >
                    <div className="relative pt-2">
                      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border z-0" />
                      <div className="space-y-5 relative z-10">
                        <div className="flex gap-4">
                          <div className="w-3 h-3 rounded-full bg-background border-2 border-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                              Tài khoản được tạo
                            </h4>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(selectedClaim.createdAt).toLocaleString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                        </div>
                        {selectedClaim.updatedAt &&
                          selectedClaim.updatedAt !==
                            selectedClaim.createdAt && (
                            <div className="flex gap-4">
                              <div className="w-3 h-3 rounded-full bg-background border-2 border-amber-500 mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                                  Cập nhật lần cuối
                                </h4>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(
                                    selectedClaim.updatedAt,
                                  ).toLocaleString("vi-VN")}
                                </p>
                              </div>
                            </div>
                          )}
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
                  className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs py-2"
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
                  className="flex-1 text-xs py-2"
                  requireConfirm
                  confirmTitle="Phê duyệt liên kết?"
                  confirmMessage={`Tài khoản này sẽ được liên kết và kế thừa mọi dữ liệu của hồ sơ hệ thống. Xác nhận?`}
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
          <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
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
          </div>
        </DetailLayout>
      </div>
    </div>
  );
}
