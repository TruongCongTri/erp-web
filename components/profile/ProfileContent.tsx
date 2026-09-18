/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  Edit,
  X,
  AlertTriangle,
  KeyRound,
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
  ActivitySquare,
  Shield,
  UserMinus,
  RefreshCw,
  Briefcase,
  FileSignature,
  Receipt,
  Download,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { gooeyToast } from "@/components/ui/goey-toaster";
import {
  DetailLayout,
  DetailAccordion,
} from "@/components/layouts/DetailLayout";
import ActionButton from "@/components/buttons/ActionButton";

// ─── API HOOKS ───────────────────────────────────────────────────────────────
import {
  useGetMeQuery,
  useUpdateProfileMutation,
} from "@/lib/store/authApiSlice";
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

// Mock 12 tháng lương cho năm 2026
const mockPayslips = Array.from({ length: 12 }).map((_, i) => ({
  month: `${12 - i}/2026`,
  status: i < 4 ? "Đã thanh toán" : i === 4 ? "Đang xử lý" : "Chưa đến kỳ",
  isAvailable: i < 4,
}));

const mockContracts = [
  {
    id: "c1",
    title: "Thỏa thuận bảo mật (NDA)",
    date: "01/05/2026",
    status: "Hiệu lực",
  },
  {
    id: "c2",
    title: "Hợp đồng lao động (Xác định TH)",
    date: "01/05/2026",
    status: "Hiệu lực",
  },
  {
    id: "c3",
    title: "Hợp đồng thử việc",
    date: "01/03/2026",
    status: "Hết hạn",
  },
];

// ─── Modal 1: Đổi Mật Khẩu ──────────────────────────────────────────────────
function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmitPassword = async () => {
    if (!oldPassword) {
      gooeyToast.error("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 6) {
      gooeyToast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      gooeyToast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
    return "Đổi mật khẩu thành công!";
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Đổi mật khẩu tài khoản
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Cập nhật mật khẩu định kỳ để bảo vệ tài khoản
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                className="input-base text-xs w-full pr-8"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showOldPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                className="input-base text-xs w-full pr-8"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="input-base text-xs w-full pr-8"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-border bg-muted/10 flex justify-end gap-2 rounded-b-xl">
          <ActionButton
            variant="secondary"
            onClick={onClose}
            className="text-xs px-3 py-1.5 h-8"
          >
            Hủy
          </ActionButton>
          <ActionButton
            variant="primary"
            onAction={handleSubmitPassword}
            loadingMessage="Đang cập nhật mật khẩu..."
            successMessage={(msg) => msg}
            className="text-xs px-4 py-1.5 h-8"
          >
            Xác nhận đổi
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Modal 2: Chỉnh Sửa Hồ Sơ Cá Nhân ────────────────────────────────────────
function EditProfileModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialData: any;
  onClose: () => void;
  onSave: (data: any) => Promise<any>;
}) {
  const [formData, setFormData] = useState({
    phoneNumber: initialData?.phoneNumber || "",
    location: initialData?.location || "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Edit size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Chỉnh sửa thông tin hồ sơ
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Cập nhật số điện thoại và địa chỉ làm việc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
              <Phone size={13} className="text-muted-foreground" />
              Số điện thoại liên lạc
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              placeholder="VD: 0912345678"
              className="input-base text-xs w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
              <MapPin size={13} className="text-muted-foreground" />
              Địa điểm / Chi nhánh làm việc
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="VD: Trụ sở TP.HCM, VP Đồng Nai..."
              className="input-base text-xs w-full"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-border bg-muted/10 flex justify-end gap-2 rounded-b-xl">
          <ActionButton
            variant="secondary"
            onClick={onClose}
            className="text-xs px-3 py-1.5 h-8"
          >
            Hủy
          </ActionButton>
          <ActionButton
            variant="primary"
            onAction={async () => {
              await onSave(formData);
              onClose();
            }}
            loadingMessage="Đang lưu thay đổi..."
            successMessage="Cập nhật hồ sơ thành công!"
            className="text-xs px-4 py-1.5 h-8"
          >
            Lưu thay đổi
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────────────────────
export default function ProfileContent() {
  // ─── API HOOKS ───
  const { data: meRes, isLoading } = useGetMeQuery();
  const [updateProfile] = useUpdateProfileMutation();

  // Accordion States for Right Sidebar
  const [rightSections, setRightSections] = useState({
    stats: true,
    documents: true,
    payslips: false,
    permissions: false,
  });

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const user = meRes?.data;

  const toggleRight = (k: keyof typeof rightSections) =>
    setRightSections((p) => ({ ...p, [k]: !p[k] }));

  const handleSaveProfile = async (dataToUpdate: any) => {
    try {
      await updateProfile(dataToUpdate).unwrap();
    } catch {
      throw new Error("Không thể cập nhật hồ sơ");
    }
  };

  // ─── LOADING STATES ───
  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
        <RefreshCw className="animate-spin" size={32} />
        <p className="text-sm font-semibold text-foreground">
          Đang tải hồ sơ của bạn...
        </p>
      </div>
    );
  }

  const currentStatus = user.status?.toLowerCase() || "active";
  const statusCfg =
    hrisStatusConfig[currentStatus] || hrisStatusConfig["active"];

  const currentContract =
    user.profile?.contractType?.toLowerCase() || "full-time";
  const contractCfg =
    contractConfig[currentContract] || contractConfig["full-time"];

  const basicFields = [
    {
      key: "email",
      label: "Email",
      icon: <Mail size={14} />,
      val: user.email,
    },
    {
      key: "phoneNumber",
      label: "Điện thoại",
      icon: <Phone size={14} />,
      val: user.profile?.phoneNumber,
    },
    {
      key: "department",
      label: "Phòng ban",
      icon: <Building2 size={14} />,
      val: user.profile?.department,
    },
    {
      key: "jobTitle",
      label: "Chức vụ",
      icon: <UserCheck size={14} />,
      val: user.profile?.jobTitle,
    },
    {
      key: "location",
      label: "Địa điểm",
      icon: <MapPin size={14} />,
      val: user.profile?.location,
    },
    {
      key: "joinDate",
      label: "Ngày vào làm",
      icon: <Calendar size={14} />,
      val: user.profile?.joinDate
        ? new Date(user.profile.joinDate).toLocaleDateString("vi-VN")
        : "",
    },
  ];

  return (
    <>
      <DetailLayout
        // title="Hồ sơ cá nhân"
        leftSidebar={{
          defaultCollapsed: false,
          content: (collapsed) =>
            collapsed ? (
              /* ── TRẠNG THÁI THU GỌN (COLLAPSED) ── */
              <div className="flex flex-col items-center h-full overflow-hidden fade-in">
                <div className="shrink-0 flex flex-col items-center py-6 pb-2 w-full">
                  <div
                    className="relative cursor-help"
                    title={`${user.fullName}\n${
                      user.profile?.jobTitle || "Nhân sự"
                    }\nTrạng thái: ${statusCfg.label}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-md">
                      {user.fullName?.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="w-8 h-px bg-border my-3" />
                  <ActionButton
                    iconOnly
                    variant="ghost"
                    tooltip="Chỉnh sửa hồ sơ"
                    onClick={() => setShowEditModal(true)}
                    className="!w-8 !h-8 !rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit size={14} />
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
              /* ── TRẠNG THÁI MỞ RỘNG (EXPANDED) ── */
              <div className="flex flex-col h-full overflow-hidden fade-in">
                <div className="shrink-0 p-5 pb-4 border-b border-border bg-card/60 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
                    {user.fullName?.slice(0, 2).toUpperCase()}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    {user.fullName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    {user.profile?.jobTitle || "Chưa cập nhật"}
                  </p>

                  {/* THIẾT LẬP CÙNG 1 DÒNG (flex-nowrap) */}
                  <div className="flex items-center justify-center gap-1.5 flex-nowrap w-full overflow-hidden mb-4">
                    <Badge config={statusCfg} />
                    <Badge config={contractCfg} />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-5 space-y-6">
                  <div>
                    <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Thông tin liên lạc
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {basicFields.map((f) => (
                        <div key={f.key}>
                          <label className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
                            {f.icon} {f.label}
                          </label>
                          <p className="text-xs font-semibold text-foreground">
                            {f.val || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── SENSITIVE DATA SECTION (BẢO MẬT & ĐANG MÃ HÓA) ── */}
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
                <div className="relative group cursor-help" title="Thông số">
                  <ActivitySquare size={16} />
                </div>
                <div
                  className="relative group cursor-help"
                  title="Hồ sơ & Hợp đồng"
                >
                  <FileSignature size={16} />
                </div>
                <div className="relative group cursor-help" title="Bảng lương">
                  <Receipt size={16} />
                </div>
                <div className="relative group cursor-help" title="Quyền hạn">
                  <Shield size={16} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full fade-in pb-10">
                <DetailAccordion
                  title="Thông số hệ thống"
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
                        {user.profile?.employeeCode || "—"}
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

                {/* HỒ SƠ & HỢP ĐỒNG - DÙNG ACTION BUTTON VỚI ISUNDERDEVELOPMENT */}
                <DetailAccordion
                  title="Hồ sơ & Hợp đồng"
                  icon={<FileSignature size={14} />}
                  isExpanded={rightSections.documents}
                  onToggle={() => toggleRight("documents")}
                  className="border-b-0 lg:border-b"
                >
                  <div className="space-y-2">
                    {mockContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="p-3 rounded-lg border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {contract.title}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-sm flex-shrink-0 font-bold ${
                              contract.status === "Hiệu lực"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {contract.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar size={10} /> {contract.date}
                          </p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ActionButton
                              iconOnly
                              variant="ghost"
                              isUnderDevelopment={true}
                              tooltip="Xem tài liệu (Đang phát triển)"
                              className="!w-7 !h-7 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded transition-colors"
                            >
                              <Eye size={13} />
                            </ActionButton>
                            <ActionButton
                              iconOnly
                              variant="ghost"
                              isUnderDevelopment={true}
                              tooltip="Tải xuống (Đang phát triển)"
                              className="!w-7 !h-7 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded transition-colors"
                            >
                              <Download size={13} />
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailAccordion>

                {/* BẢNG LƯƠNG - DÙNG ACTION BUTTON VỚI ISUNDERDEVELOPMENT */}
                <DetailAccordion
                  title="Bảng lương (2026)"
                  icon={<Receipt size={14} />}
                  isExpanded={rightSections.payslips}
                  onToggle={() => toggleRight("payslips")}
                  className="border-b-0 lg:border-b"
                >
                  <div className="space-y-1">
                    {mockPayslips.map((slip, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 group"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              slip.isAvailable ? "bg-emerald-500" : "bg-muted"
                            }`}
                          />
                          <span className="text-xs text-foreground font-medium">
                            Tháng {slip.month}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground mr-1.5">
                            {slip.status}
                          </span>
                          {slip.isAvailable ? (
                            <div className="flex items-center gap-0.5">
                              <ActionButton
                                iconOnly
                                variant="ghost"
                                isUnderDevelopment={true}
                                tooltip="Xem trực tiếp (Đang phát triển)"
                                className="!w-6 !h-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              >
                                <Eye size={12} />
                              </ActionButton>
                              <ActionButton
                                iconOnly
                                variant="ghost"
                                isUnderDevelopment={true}
                                tooltip="Tải PDF (Đang phát triển)"
                                className="!w-6 !h-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              >
                                <Download size={12} />
                              </ActionButton>
                            </div>
                          ) : (
                            <div className="w-14" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailAccordion>

                <DetailAccordion
                  title="Quyền hạn truy cập"
                  icon={<Shield size={14} />}
                  isExpanded={rightSections.permissions}
                  onToggle={() => toggleRight("permissions")}
                >
                  <div className="space-y-1.5">
                    {user.role?.name ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/40 rounded border border-border/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          <code className="text-[10px] text-muted-foreground font-mono font-medium">
                            Vai trò: {user.role.name}
                          </code>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                          Nếu bạn cần thêm quyền, vui lòng truy cập{" "}
                          <Link
                            href="/vi/claim-profile"
                            className="text-primary hover:underline font-semibold"
                          >
                            Yêu cầu cấp quyền
                          </Link>
                          .
                        </p>
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
              className="mr-auto border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs px-3 py-2"
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyRound size={13} className="mr-1.5" />
              <span className="hidden sm:inline">Đổi mật khẩu</span>
            </ActionButton>

            <ActionButton
              variant="primary"
              onClick={() => setShowEditModal(true)}
              className="text-xs px-4 py-2 sm:ml-2"
            >
              <Edit size={13} className="mr-1.5" /> Chỉnh sửa hồ sơ
            </ActionButton>
          </>
        }
      >
        <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-muted/5 relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="w-20 h-20 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-6 shadow-sm z-10">
            <ActivitySquare size={32} className="text-muted-foreground/60" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2 z-10">
            Bảng chấm công & Hoạt động
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed z-10">
            Khu vực này sắp tới sẽ hiển thị lịch sử check-in, đơn từ nghỉ phép
            và hiệu suất KPI cá nhân của bạn.
          </p>
        </div>
      </DetailLayout>

      {/* Render Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Render Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        initialData={user.profile || {}}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}
