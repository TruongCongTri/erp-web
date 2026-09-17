/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  Edit,
  Save,
  X,
  AlertTriangle,
  RotateCcw,
  Trash2,
  FileText,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  Lock,
  ChevronRight,
  ActivitySquare,
  Shield,
  UserX,
  UserMinus,
  RefreshCw,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import {
  DetailLayout,
  DetailAccordion,
} from "@/components/layouts/DetailLayout";
import ActionButton from "@/components/buttons/ActionButton";

// ─── API HOOKS ───────────────────────────────────────────────────────────────
import { useGetFullProfileQuery } from "@/lib/store/hrApiSlice";
import Link from "next/link";

// ─── Whisper Badge Component ───────────────────────────────────────────────────
function Badge({
  config,
}: {
  config?: { label: string; className: string; icon?: React.ElementType };
}) {
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={`badge ${config.className} inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-[11px]`}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      {config.label}
    </span>
  );
}

// ─── Whisper State Configurations ──────────────────────────────────────────────
const hrisStatusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  active: {
    label: "Đang làm việc",
    className: "badge-hris-active",
    icon: UserCheck,
  },
  "on-leave": {
    label: "Nghỉ phép",
    className: "badge-hris-leave",
    icon: Calendar,
  },
  suspended: {
    label: "Tạm đình chỉ",
    className: "badge-hris-action",
    icon: AlertTriangle,
  },
  terminated: {
    label: "Đã nghỉ việc",
    className: "badge-hris-terminated",
    icon: UserX,
  },
  inactive: {
    label: "Không hoạt động",
    className: "badge-neutral",
    icon: UserMinus,
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

// ─── Main Content ──────────────────────────────────────────────────────────────
export default function EmployeeDetailsContent({
  employeeId,
  onBack,
}: {
  employeeId: string;
  onBack: () => void;
}) {
  const {
    data: fullProfileRes,
    isLoading,
    isError,
  } = useGetFullProfileQuery({
    id: employeeId,
  });

  const [rightSections, setRightSections] = useState({
    history: true,
    stats: true,
    permissions: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const employee = fullProfileRes?.data;

  const toggleRight = (k: keyof typeof rightSections) =>
    setRightSections((p) => ({ ...p, [k]: !p[k] }));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-primary bg-background">
        <RefreshCw className="animate-spin" size={32} />
        <p className="text-sm font-semibold text-foreground">
          Đang tải hồ sơ...
        </p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-background">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <UserX size={28} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Không tìm thấy hồ sơ nhân sự
        </p>
        <p className="text-xs text-muted-foreground">ID: {employeeId}</p>
        <ActionButton
          variant="primary"
          onClick={onBack}
          className="text-xs px-4 py-2 mt-2"
        >
          Quay lại danh sách
        </ActionButton>
      </div>
    );
  }

  const isDeleted = employee.status === "TERMINATED";
  const currentStatus = employee.status?.toLowerCase() || "inactive";
  const statusCfg =
    hrisStatusConfig[currentStatus] || hrisStatusConfig["inactive"];

  const currentContract =
    employee.profile?.contractType?.toLowerCase() || "full-time";
  const contractCfg =
    contractConfig[currentContract] || contractConfig["full-time"];

  const basicFields = [
    {
      key: "email",
      label: "Email",
      icon: <Mail size={14} />,
      val: employee.email,
    },
    {
      key: "phone",
      label: "Điện thoại",
      icon: <Phone size={14} />,
      val: employee.profile?.phoneNumber,
    },
    {
      key: "department",
      label: "Phòng ban",
      icon: <Building2 size={14} />,
      val: employee.profile?.department,
    },
    {
      key: "role",
      label: "Chức vụ",
      icon: <UserCheck size={14} />,
      val: employee.profile?.jobTitle,
    },
    {
      key: "location",
      label: "Địa điểm",
      icon: <MapPin size={14} />,
      val: employee.profile?.location,
    },
    {
      key: "joinDate",
      label: "Ngày vào làm",
      icon: <Calendar size={14} />,
      val: employee.profile?.joinDate
        ? new Date(employee.profile.joinDate).toLocaleDateString("vi-VN")
        : "",
    },
  ];

  return (
    <div className="flex-1 bg-background h-full overflow-hidden">
      <DetailLayout
        title="Hồ sơ chi tiết"
        onBack={onBack}
        overlay={
          isDeleted && (
            <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
              <Lock size={48} className="text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold text-foreground">
                Hồ sơ đã bị vô hiệu hóa
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Nhân viên này đã nghỉ việc. Dữ liệu chỉ mang tính chất lưu trữ
                lịch sử.
              </p>
              <ActionButton
                variant="primary"
                onClick={onBack}
                className="mt-6 px-6 py-2 text-sm"
              >
                Quay lại danh sách
              </ActionButton>
            </div>
          )
        }
        leftSidebar={{
          defaultCollapsed: false,
          content: (collapsed) =>
            collapsed ? (
              <div className="flex flex-col items-center h-full overflow-hidden fade-in">
                <div className="shrink-0 flex flex-col items-center py-6 pb-2 w-full">
                  <div
                    className="relative cursor-help"
                    title={`${employee.fullName}\n${
                      employee.profile?.jobTitle || "Chức vụ chưa cập nhật"
                    }\nTrạng thái: ${statusCfg.label}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-md">
                      {employee.fullName?.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="w-8 h-px bg-border my-2" />
                  <ActionButton
                    iconOnly
                    variant="ghost"
                    tooltip="Gọi điện"
                    onClick={() =>
                      window.open(`tel:${employee.profile?.phoneNumber}`)
                    }
                    className="!w-8 !h-8 !rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Phone size={14} />
                  </ActionButton>
                  <ActionButton
                    iconOnly
                    variant="ghost"
                    tooltip="Gửi Email"
                    onClick={() => window.open(`mailto:${employee.email}`)}
                    className="!w-8 !h-8 !rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors mt-1"
                  >
                    <Mail size={14} />
                  </ActionButton>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col items-center gap-3 w-full py-2 pb-6">
                  <div className="w-8 h-px bg-border my-1" />
                  <ActionButton
                    iconOnly
                    variant="ghost"
                    isUnderDevelopment={true}
                    tooltip="CCCD / Định danh (Đang hoàn thiện bảo mật)"
                    className="relative !w-8 !h-8 !rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    <CreditCard size={14} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background rounded-full flex items-center justify-center border border-border">
                      <Lock size={7} className="text-amber-500" />
                    </div>
                  </ActionButton>

                  <ActionButton
                    iconOnly
                    variant="ghost"
                    isUnderDevelopment={true}
                    tooltip="Mã số thuế & Tài chính (Đang hoàn thiện bảo mật)"
                    className="relative !w-8 !h-8 !rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    <FileText size={14} />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-background rounded-full flex items-center justify-center border border-border">
                      <Lock size={7} className="text-amber-500" />
                    </div>
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden fade-in">
                {/* 1. TOP FIXED SECTION */}
                <div className="shrink-0 p-5 pb-4 border-b border-border bg-card/60 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
                    {employee.fullName?.slice(0, 2).toUpperCase()}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    {employee.fullName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    {employee.profile?.jobTitle || "Chưa cập nhật"}
                  </p>

                  {/* THIẾT LẬP CÙNG 1 DÒNG (flex-nowrap) */}
                  <div className="flex items-center justify-center gap-1.5 flex-nowrap w-full overflow-hidden mb-4">
                    <Badge config={statusCfg} />
                    <Badge config={contractCfg} />
                  </div>

                  <div className="flex items-center justify-center gap-2 w-full">
                    <ActionButton
                      iconOnly
                      variant="ghost"
                      tooltip="Gọi điện"
                      onClick={() =>
                        window.open(`tel:${employee.profile?.phoneNumber}`)
                      }
                      className="!w-10 !h-10 sm:!w-9 sm:!h-9 !rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Phone size={15} />
                    </ActionButton>
                    <ActionButton
                      iconOnly
                      variant="ghost"
                      tooltip="Gửi Email"
                      onClick={() => window.open(`mailto:${employee.email}`)}
                      className="!w-10 !h-10 sm:!w-9 sm:!h-9 !rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Mail size={15} />
                    </ActionButton>
                  </div>
                </div>

                {/* 2. BOTTOM SCROLLABLE SECTION */}
                <div className="flex-1 overflow-y-auto scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-5 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3">
                      Thông tin liên lạc
                    </h3>
                    <div className="space-y-4">
                      {basicFields.map((f) => (
                        <div key={f.key}>
                          <label className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
                            {f.icon} {f.label}
                          </label>
                          {editMode && f.key !== "joinDate" ? (
                            <input
                              type="text"
                              value={editData[f.key] || ""}
                              onChange={(e) =>
                                setEditData((p: any) => ({
                                  ...p,
                                  [f.key]: e.target.value,
                                }))
                              }
                              className="input-base text-xs w-full"
                            />
                          ) : (
                            <p className="text-xs font-semibold text-foreground">
                              {f.val || "—"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-3 mt-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Dữ liệu nhạy cảm
                      </h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Đang mã hóa
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ActionButton
                        iconOnly
                        variant="outline"
                        isUnderDevelopment={true}
                        tooltip="Xem CCCD / Hộ chiếu (Đang kiểm thử bảo mật)"
                        className="relative !w-10 !h-10 sm:!w-9 sm:!h-9 !rounded-lg border-border bg-card text-muted-foreground hover:bg-muted"
                      >
                        <CreditCard size={15} />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center border border-border">
                          <Lock size={8} className="text-amber-500" />
                        </div>
                      </ActionButton>

                      <ActionButton
                        iconOnly
                        variant="outline"
                        isUnderDevelopment={true}
                        tooltip="Xem Mã số thuế & Tài chính (Đang kiểm thử bảo mật)"
                        className="relative !w-10 !h-10 sm:!w-9 sm:!h-9 !rounded-lg border-border bg-card text-muted-foreground hover:bg-muted"
                      >
                        <FileText size={15} />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center border border-border">
                          <Lock size={8} className="text-amber-500" />
                        </div>
                      </ActionButton>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-2 leading-relaxed">
                      <ShieldAlert
                        size={14}
                        className="shrink-0 mt-0.5 text-amber-600"
                      />
                      <span>
                        Tính năng tra cứu số CCCD và Mã số thuế cá nhân đang
                        được hoàn thiện quy chuẩn mã hóa đa lớp (E2EE) nhằm đảm
                        bảo an toàn tuyệt đối cho dữ liệu nhạy cảm trên môi
                        trường trực tuyến trước khi mở quyền sử dụng.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ),
        }}
        rightSidebar={{
          defaultCollapsed: false,
          content: (collapsed) =>
            collapsed ? (
              <div className="flex flex-col items-center gap-6 mt-14 fade-in text-muted-foreground">
                <div className="relative group cursor-help" title="Quyền hạn">
                  <Shield size={16} />
                </div>
                <div className="relative group cursor-help" title="Lịch sử">
                  <Clock size={16} />
                </div>
                <div className="relative group cursor-help" title="Thống kê">
                  <ActivitySquare size={16} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full fade-in">
                <DetailAccordion
                  title="Thông số"
                  icon={<ActivitySquare size={14} />}
                  isExpanded={rightSections.stats}
                  onToggle={() => toggleRight("stats")}
                  className="border-b-0 lg:border-b"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-[10px] text-muted-foreground">
                        Mã nhân viên
                      </span>
                      <span className="text-[11px] font-medium text-foreground text-right">
                        {employee.profile?.employeeCode || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-[10px] text-muted-foreground">
                        Trạng thái
                      </span>
                      <Badge config={statusCfg} />
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-[10px] text-muted-foreground">
                        Hợp đồng
                      </span>
                      <Badge config={contractCfg} />
                    </div>
                  </div>
                </DetailAccordion>
                <DetailAccordion
                  title="Lịch sử kiểm tra"
                  icon={<Clock size={14} />}
                  isExpanded={rightSections.history}
                  onToggle={() => toggleRight("history")}
                >
                  <div className="space-y-4">
                    {[
                      {
                        label: "Tạo hồ sơ",
                        time: employee.createdAt
                          ? new Date(employee.createdAt).toLocaleString("vi-VN")
                          : "—",
                        color: "bg-blue-100 text-blue-600",
                      },
                      {
                        label: "Cập nhật cuối",
                        time: employee.updatedAt
                          ? new Date(employee.updatedAt).toLocaleString("vi-VN")
                          : "—",
                        color: "bg-amber-100 text-amber-600",
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0 mt-1.5`}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-foreground">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailAccordion>

                <DetailAccordion
                  title="Quyền hạn hệ thống"
                  icon={<Shield size={14} />}
                  isExpanded={rightSections.permissions}
                  onToggle={() => toggleRight("permissions")}
                >
                  <div className="flex items-center justify-end mb-3">
                    <Link
                      href={`/vi/hr/users-access?id=${employee.id}`}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      Quản lý <ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    {employee.role?.name ? (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/40 rounded border border-border/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        <code className="text-[10px] text-muted-foreground font-mono font-medium">
                          Vai trò: {employee.role.name}
                        </code>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Chưa phân quyền
                      </div>
                    )}
                  </div>
                </DetailAccordion>
              </div>
            ),
        }}
        footer={
          <>
            <ActionButton
              variant="outline"
              className="mr-auto border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs px-3 py-2"
              disabled={employee.status !== "TERMINATED"}
              tooltip={
                employee.status !== "TERMINATED"
                  ? "Chỉ có thể vô hiệu hóa khi nhân sự đã nghỉ việc"
                  : "Vô hiệu hóa hồ sơ"
              }
              requireConfirm
              confirmTitle="Xóa hồ sơ vĩnh viễn?"
              confirmMessage={`Bạn chuẩn bị xóa vĩnh viễn toàn bộ dữ liệu của ${employee.fullName}. Không thể khôi phục. Tiếp tục?`}
              confirmLabel="Xóa vĩnh viễn"
              onAction={async () => {
                await new Promise((res) => setTimeout(res, 1000));
                onBack();
                return employee.fullName;
              }}
              loadingMessage="Đang xóa..."
              successMessage={(name) => `Đã xóa hồ sơ của ${name}`}
            >
              <Trash2 size={13} className="mr-1.5" />
              <span className="hidden sm:inline">Xóa hồ sơ vĩnh viễn</span>
            </ActionButton>

            <ActionButton
              variant="outline"
              className="text-xs px-3 py-2 text-muted-foreground border-border bg-card hover:bg-muted transition-colors"
              requireConfirm
              confirmTitle="Đặt lại mật khẩu"
              confirmMessage={`Hệ thống sẽ gửi một liên kết đặt lại mật khẩu tới email của ${employee.fullName}. Bạn có muốn tiếp tục?`}
              confirmLabel="Gửi email"
              onAction={async () => {
                await new Promise((res) => setTimeout(res, 1000));
                return employee.fullName;
              }}
              loadingMessage="Đang gửi email..."
              successMessage={(name) =>
                `Đã gửi liên kết khôi phục tới email của ${name}`
              }
            >
              <RotateCcw size={13} className="mr-1.5" />
              <span className="hidden sm:inline">Đặt lại mật khẩu</span>
            </ActionButton>

            {!editMode ? (
              <ActionButton
                variant="primary"
                onClick={() => setEditMode(true)}
                className="text-xs px-4 py-2 sm:ml-2"
              >
                <Edit size={13} className="mr-1.5" /> Chỉnh sửa
              </ActionButton>
            ) : (
              <div className="flex gap-2 sm:ml-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => setEditMode(false)}
                  className="text-xs px-3 py-2"
                >
                  <X size={13} className="mr-1.5" /> Hủy
                </ActionButton>
                <ActionButton
                  variant="primary"
                  className="text-xs px-4 py-2"
                  onAction={async () => {
                    await new Promise((res) => setTimeout(res, 1000));
                    setEditMode(false);
                    return employee.fullName;
                  }}
                  loadingMessage="Đang lưu..."
                  successMessage={(name) => `Đã cập nhật thông tin của ${name}`}
                >
                  <Save size={13} className="mr-1.5" /> Lưu
                </ActionButton>
              </div>
            )}
          </>
        }
      >
        <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-muted/5">
          <div className="w-20 h-20 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-6 shadow-sm">
            <ActivitySquare size={32} className="text-muted-foreground/60" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            Không gian Phân hệ
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Khu vực này được thiết kế để tích hợp các phân hệ nghiệp vụ trong
            tương lai như Bảng công (Timesheet), Đánh giá hiệu suất (KPI), Lịch
            sử tài sản, hoặc Quản lý hợp đồng chi tiết.
          </p>
        </div>
      </DetailLayout>
    </div>
  );
}
