"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  MapPin,
  Lock,
  Edit,
  UserX,
  UserCheck,
  ChevronRight,
  CreditCard,
  FileText,
  Briefcase,
  AlertTriangle,
  Download,
  UserMinus,
  RefreshCw,
  Clock,
  ShieldAlert,
  X,
} from "lucide-react";
import { DetailDrawer, DrawerSection } from "../layouts/DetailDrawer";
import ActionButton from "@/components/buttons/ActionButton";
import ReAuthModal from "../employee/ReAuthModal";

// ─── REUSABLE DRAWER INTERFACE ───────────────────────────────────────────────
export interface ProfileDrawerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employee: any | null; // Có thể nhận AuthUser hoặc Profile Object
  onClose: () => void;
  onUnlock?: (
    target: "identity" | "financial",
    password: string,
  ) => Promise<void>;
  onWipeData?: () => void;
  // Dynamic Route cho nút "Xem chi tiết đầy đủ"
  detailHref?: string;
}

export type SensitiveSection = "identity" | "financial";

// ─── Whisper Badge Component ───────────────────────────────────────────────────
function DrawerBadge({
  config,
}: {
  config?: { label: string; className: string; icon?: React.ElementType };
}) {
  if (!config) return null;

  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-sm border ${config.className}`}
    >
      {Icon && <Icon size={12} className="flex-shrink-0 stroke-[2.5px]" />}
      {config.label}
    </span>
  );
}

// ─── Whisper State Configurations ──────────────────────────────────────────────
const statusBadgeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  active: {
    label: "Đang làm việc",
    className: "bg-slate-600/5 text-slate-600 border-slate-600/15",
    icon: UserCheck,
  },
  "on-leave": {
    label: "Nghỉ phép",
    className: "bg-purple-600/5 text-purple-600 border-purple-600/15",
    icon: Calendar,
  },
  suspended: {
    label: "Tạm đình chỉ",
    className: "bg-red-600/5 text-red-600 border-red-600/15",
    icon: AlertTriangle,
  },
  terminated: {
    label: "Đã nghỉ việc",
    className:
      "bg-gray-500/5 text-gray-500 border-gray-500/15 line-through decoration-gray-400/50",
    icon: UserX,
  },
  inactive: {
    label: "Không hoạt động",
    className: "bg-zinc-500/5 text-zinc-500 border-zinc-500/15",
    icon: UserMinus,
  },
};

const contractBadgeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  "full-time": {
    label: "Toàn thời gian",
    className: "bg-blue-600/5 text-blue-600 border-blue-600/15",
    icon: Briefcase,
  },
  "part-time": {
    label: "Bán thời gian",
    className: "bg-amber-600/5 text-amber-700 border-amber-600/15",
    icon: Clock,
  },
  contractor: {
    label: "Nhà thầu",
    className: "bg-slate-600/5 text-slate-600 border-slate-600/15",
    icon: FileText,
  },
};

// ─── Component Hiển Thị Dữ Liệu Sau Khi Mở Khóa ───
function UnlockedDataModal({
  section,
  employee,
  onClose,
}: {
  section: SensitiveSection;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employee: any;
  onClose: () => void;
}) {
  const isIdentity = section === "identity";
  const title = isIdentity ? "CCCD / Hộ chiếu" : "Bảo hiểm & Tài chính";
  const Icon = isIdentity ? CreditCard : FileText;
  const iconColor = isIdentity
    ? "text-purple-600 bg-purple-600/20"
    : "text-emerald-700 bg-emerald-700/20";

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}
            >
              <Icon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {employee.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isIdentity ? (
            <div className="space-y-3">
              <div className="bg-purple-600/5 border border-purple-600/15 rounded-lg px-4 py-3">
                <p className="text-[10px] text-purple-700 font-semibold uppercase tracking-wider mb-1">
                  Số CCCD / Hộ chiếu
                </p>
                <p className="text-lg font-bold text-purple-800 font-mono tracking-widest">
                  {employee.identityData?.cccdNumber ||
                    employee.identityData?.idNumber ||
                    "Chưa cập nhật"}
                </p>
              </div>
              <div className="space-y-2">
                {[
                  {
                    label: "Ngày sinh",
                    value:
                      employee.identityData?.dateOfBirth ||
                      employee.identityData?.dob
                        ? new Date(
                            employee.identityData.dateOfBirth ||
                              employee.identityData.dob,
                          ).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật",
                  },
                  {
                    label: "Giới tính",
                    value: employee.identityData?.gender || "Chưa cập nhật",
                  },
                  {
                    label: "Nơi thường trú",
                    value:
                      employee.identityData?.placeOfResidence ||
                      "Chưa cập nhật",
                  },
                  {
                    label: "Ngày cấp",
                    value:
                      employee.identityData?.dateOfIssue ||
                      employee.identityData?.issueDate
                        ? new Date(
                            employee.identityData.dateOfIssue ||
                              employee.identityData.issueDate,
                          ).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật",
                  },
                  {
                    label: "Nơi cấp",
                    value:
                      employee.identityData?.placeOfIssue || "Chưa cập nhật",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-start gap-3 py-1.5 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground flex-shrink-0 w-28">
                      {item.label}
                    </span>
                    <span className="text-xs font-medium text-foreground text-right line-clamp-2">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-700/5 border border-emerald-700/15 rounded-lg px-4 py-3">
                <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider mb-1">
                  Mã số thuế cá nhân
                </p>
                <p className="text-lg font-bold text-emerald-900 font-mono tracking-widest">
                  {employee.financialData?.taxCode || "Chưa cập nhật"}
                </p>
              </div>
              <div className="space-y-2 mt-3">
                {[
                  {
                    label: "Số BHXH",
                    value:
                      employee.financialData?.socialInsuranceNumber ||
                      "Chưa cập nhật",
                  },
                  {
                    label: "Ngân hàng",
                    value: employee.financialData?.bankName || "Chưa cập nhật",
                  },
                  {
                    label: "Số Tài Khoản",
                    value:
                      employee.financialData?.accountNumber || "Chưa cập nhật",
                  },
                  {
                    label: "Lương cơ bản",
                    value: employee.financialData?.baseSalary
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(employee.financialData.baseSalary)
                      : "Chưa cập nhật",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-start gap-3 py-1.5 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground flex-shrink-0 w-28">
                      {item.label}
                    </span>
                    <span className="text-xs font-medium text-foreground text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border bg-muted/10 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Profile Drawer Component ───
export default function ProfileDrawer({
  employee,
  onClose,
  onUnlock,
  onWipeData,
  detailHref,
}: ProfileDrawerProps) {
  const [openSections, setOpenSections] = useState({
    status: true,
    actions: true,
    contact: true,
    sensitive: true,
  });

  const [unlockTarget, setUnlockTarget] = useState<SensitiveSection | null>(
    null,
  );
  const [revealedSection, setRevealedSection] =
    useState<SensitiveSection | null>(null);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentStatus = employee?.status?.toLowerCase() || "inactive";
  const statusCfg =
    statusBadgeConfig[currentStatus] || statusBadgeConfig["inactive"];

  // Handle both flat structure (profile directly) and nested structure (user.profile)
  const profileObject = employee?.profile || employee;

  const currentContract =
    profileObject?.contractType?.toLowerCase() || "full-time";
  const contractCfg =
    contractBadgeConfig[currentContract] || contractBadgeConfig["full-time"];

  const isFetchingDetails = employee?._isFetching;

  const finalHref =
    detailHref ||
    (employee?.id ? `/vi/hr/employee-management/${employee.id}` : "#");

  return (
    <>
      <DetailDrawer
        isOpen={!!employee}
        onClose={onClose}
        title={employee?.fullName || ""}
        subtitle={profileObject?.employeeCode || ""}
        headerClassName="bg-primary text-primary-foreground border-b border-border"
        icon={
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
            {(employee?.fullName || "U").slice(0, 2).toUpperCase()}
          </div>
        }
        footer={
          employee && (
            <div className="flex items-center gap-2 w-full">
              <ActionButton
                variant="secondary"
                iconOnly
                tooltip="Xuất hồ sơ PDF"
                onAction={async () => {
                  await new Promise((res) => setTimeout(res, 1500));
                  return employee.fullName;
                }}
                loadingMessage="Đang trích xuất..."
                successMessage={(name) => `Đã tải xuống hồ sơ của ${name}`}
                toastOptions={{ spring: false }}
              >
                <Download size={16} />
              </ActionButton>

              <Link
                href={finalHref}
                onClick={onClose}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm shadow-sm h-9 rounded-lg"
              >
                Xem chi tiết đầy đủ
                <ChevronRight size={15} />
              </Link>
            </div>
          )
        }
      >
        {employee && (
          <>
            {/* Section 1: Status + Role */}
            <DrawerSection
              title="Tổng quan"
              isExpanded={openSections.status}
              onToggle={() => toggleSection("status")}
              collapsedSummary={
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={14} />
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {profileObject?.jobTitle || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    {statusCfg?.icon && <statusCfg.icon size={14} />}
                  </div>
                </div>
              }
            >
              <div className="flex items-center gap-2 mb-4">
                <DrawerBadge config={statusCfg} />
                <DrawerBadge config={contractCfg} />
              </div>
              <p className="text-sm font-bold text-foreground">
                {profileObject?.jobTitle || "Chức vụ chưa cập nhật"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {profileObject?.department || "Phòng ban chưa cập nhật"}
              </p>
            </DrawerSection>

            {/* Section 2: Quick Actions */}
            <DrawerSection
              title="Hành động nhanh"
              isExpanded={openSections.actions}
              onToggle={() => toggleSection("actions")}
            >
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  isUnderDevelopment
                  variant="outline"
                  className="justify-start border-blue-600/15 text-blue-600 hover:bg-blue-600/10 text-xs px-3 py-2"
                >
                  <Edit size={13} /> Chỉnh sửa hồ sơ
                </ActionButton>

                <ActionButton
                  isUnderDevelopment
                  variant="outline"
                  className="justify-start border-purple-600/15 text-purple-600 hover:bg-purple-600/10 text-xs px-3 py-2"
                >
                  <Shield size={13} /> Đổi vai trò
                </ActionButton>

                <ActionButton
                  isUnderDevelopment
                  variant="outline"
                  className="justify-start border-emerald-700/15 text-emerald-700 hover:bg-emerald-700/10 text-xs px-3 py-2"
                >
                  <Building2 size={13} /> Chuyển phòng
                </ActionButton>

                <ActionButton
                  variant="outline"
                  className="justify-start border-red-600/15 text-red-600 bg-red-600/5 hover:bg-red-600/10 hover:text-red-700 text-xs px-3 py-2"
                  requireConfirm
                  confirmTitle="Tạm đình chỉ nhân sự?"
                  confirmMessage={`Bạn có chắc chắn muốn tạm đình chỉ ${employee.fullName}? Hành động này sẽ thu hồi ngay lập tức toàn bộ quyền truy cập hệ thống của nhân sự này.`}
                  confirmLabel="Đình chỉ ngay"
                  onAction={async () => {
                    await new Promise((res) => setTimeout(res, 1500));
                    return employee.fullName;
                  }}
                  loadingMessage="Đang xử lý..."
                  successMessage={(name) => `Đã tạm đình chỉ ${name}.`}
                >
                  <UserX size={13} /> Tạm đình chỉ
                </ActionButton>
              </div>
            </DrawerSection>

            {/* Section 3: Contact Info */}
            <DrawerSection
              title="Thông tin liên hệ"
              isExpanded={openSections.contact}
              onToggle={() => toggleSection("contact")}
            >
              <div className="space-y-4 relative">
                {isFetchingDetails && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <RefreshCw
                      className="animate-spin text-muted-foreground"
                      size={16}
                    />
                  </div>
                )}
                {[
                  {
                    icon: <Mail size={14} />,
                    label: "Email",
                    value: employee.email || "Chưa có",
                  },
                  {
                    icon: <Phone size={14} />,
                    label: "Điện thoại",
                    value: profileObject?.phoneNumber || "Chưa có",
                  },
                  {
                    icon: <MapPin size={14} />,
                    label: "Địa điểm",
                    value: profileObject?.location || "Chưa có",
                  },
                  {
                    icon: <Calendar size={14} />,
                    label: "Ngày vào làm",
                    value: profileObject?.joinDate
                      ? new Date(profileObject.joinDate).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Chưa có",
                  },
                  {
                    icon: <UserCheck size={14} />,
                    label: "Quản lý",
                    value: profileObject?.managerName || "Chưa có",
                  },
                ].map((item) => (
                  <div
                    key={`info-${item.label}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 flex justify-center text-muted-foreground">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight uppercase font-semibold tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-xs text-foreground font-medium truncate mt-0.5">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>

            {/* Section 4: Sensitive Data (Cập nhật đồng bộ dạng ActionButton icon với trạng thái đang phát triển) */}
            <DrawerSection
              title="Dữ liệu bảo mật"
              icon={<Lock size={12} className="text-muted-foreground" />}
              isExpanded={openSections.sensitive}
              onToggle={() => toggleSection("sensitive")}
            >
              <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                <span className="text-[10px] text-muted-foreground font-medium">
                  Trạng thái mã hóa đa lớp (E2EE)
                </span>
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
                  Tính năng tra cứu số CCCD và Mã số thuế cá nhân đang được hoàn
                  thiện quy chuẩn mã hóa đa lớp nhằm đảm bảo an toàn tuyệt đối
                  trước khi mở quyền sử dụng công khai.
                </span>
              </div>
            </DrawerSection>
          </>
        )}
      </DetailDrawer>

      {/* Render ReAuthModal if a target is selected */}
      {unlockTarget && (
        <ReAuthModal
          sectionLabel={
            unlockTarget === "identity"
              ? "CCCD / Hộ chiếu"
              : "Tài khoản ngân hàng"
          }
          onClose={() => setUnlockTarget(null)}
          onConfirm={async (password) => {
            if (onUnlock) {
              await onUnlock(unlockTarget, password);
              setUnlockTarget(null);
              setRevealedSection(unlockTarget);
            }
          }}
        />
      )}

      {/* Render Popup Show Data */}
      {revealedSection && employee && (
        <UnlockedDataModal
          section={revealedSection}
          employee={employee}
          onClose={() => {
            setRevealedSection(null);
            if (onWipeData) onWipeData();
          }}
        />
      )}
    </>
  );
}
