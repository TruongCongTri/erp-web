"use client";
import React, { useState } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  Key,
  Star,
} from "lucide-react";
import ReAuthModal from "../employee/ReAuthModal";

// ─── Types ──────────────────────────────────────────────────────────────────────
type UserRole =
  | "hr_admin"
  | "dept_head"
  | "employee"
  | "accountant"
  | "it_admin";
type TabKey = "overview" | "work" | "sensitive" | "security";

interface ProfileUser {
  id: string;
  code: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  userRole: UserRole;
  status: string;
  joinDate: string;
  manager: string;
  location: string;
  contractType: string;
  dob: string;
  gender: string;
  nationality: string;
  address: string;
  // Sensitive
  salary?: string;
  cccd?: string;
  taxNumber?: string;
  bankAccount?: string;
  bankName?: string;
  // Work
  currentProjects?: string[];
  skills?: string[];
  certifications?: string[];
  performanceRating?: number;
  leaveBalance?: { annual: number; sick: number; used: number };
  // Security
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

// ─── Mock current logged-in user (role-based) ───────────────────────────────────
const currentUser: ProfileUser = {
  id: "emp-001",
  code: "NV-2024-001",
  name: "Sơn Lêu",
  initials: "SL",
  email: "son.leu@constructerp.vn",
  phone: "0901 234 567",
  department: "Phòng Nhân lực",
  role: "HR Admin",
  userRole: "hr_admin",
  status: "active",
  joinDate: "15/03/2024",
  manager: "Trần Quốc Bảo",
  location: "TP.HCM",
  contractType: "Toàn thời gian",
  dob: "12/05/1990",
  gender: "Nam",
  nationality: "Việt Nam",
  address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
  salary: "₫35,000,000",
  cccd: "079204012345",
  taxNumber: "MST-0234567",
  bankAccount: "0123456789",
  bankName: "Vietcombank",
  currentProjects: [
    "Dự án Vinhomes Grand Park",
    "Hệ thống ERP nội bộ",
    "Tuyển dụng Q3/2026",
  ],
  skills: ["Quản lý nhân sự", "Tuyển dụng", "Đào tạo", "HRIS", "Luật lao động"],
  certifications: ["SHRM-CP 2023", "Chứng chỉ Quản lý Nhân sự - VCCI"],
  performanceRating: 4.5,
  leaveBalance: { annual: 12, sick: 5, used: 4 },
  lastLogin: "31/08/2026 09:10",
  twoFactorEnabled: true,
};

// Role-specific extra info
const roleSpecificInfo: Record<
  UserRole,
  {
    label: string;
    color: string;
    extraFields: { label: string; value: string }[];
  }
> = {
  hr_admin: {
    label: "HR Admin",
    color: "bg-purple-100 text-purple-700",
    extraFields: [
      { label: "Số nhân viên quản lý", value: "142 nhân viên" },
      { label: "Tuyển dụng đang xử lý", value: "8 vị trí" },
      { label: "Phê duyệt chờ xử lý", value: "5 yêu cầu" },
    ],
  },
  dept_head: {
    label: "Trưởng phòng",
    color: "bg-blue-100 text-blue-700",
    extraFields: [
      { label: "Nhân viên trong phòng", value: "18 người" },
      { label: "Dự án đang thực hiện", value: "3 dự án" },
      { label: "Yêu cầu tuyển dụng", value: "2 yêu cầu đang mở" },
    ],
  },
  employee: {
    label: "Nhân viên",
    color: "bg-green-100 text-green-700",
    extraFields: [
      { label: "Phòng ban", value: "Xây dựng" },
      { label: "Dự án hiện tại", value: "Vinhomes Grand Park" },
      { label: "Ngày vào làm", value: "15/03/2024" },
    ],
  },
  accountant: {
    label: "Kế toán",
    color: "bg-amber-100 text-amber-700",
    extraFields: [
      { label: "Phê duyệt chi phí tháng này", value: "23 giao dịch" },
      { label: "Tổng giá trị xử lý", value: "₫1.2 tỷ" },
      { label: "Báo cáo chờ nộp", value: "2 báo cáo" },
    ],
  },
  it_admin: {
    label: "IT Admin",
    color: "bg-slate-100 text-slate-700",
    extraFields: [
      { label: "Hệ thống quản lý", value: "12 servers" },
      { label: "Ticket đang xử lý", value: "7 tickets" },
      { label: "Uptime hệ thống", value: "99.8%" },
    ],
  },
};

// ─── Masked Field ───────────────────────────────────────────────────────────────
function MaskedField({
  label,
  value,
  revealed,
}: {
  label: string;
  value: string;
  revealed: boolean;
}) {
  const masked = value.length > 4 ? "****-****-" + value.slice(-4) : "****";
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-mono font-semibold ${revealed ? "text-foreground" : "text-muted-foreground tracking-widest"}`}
      >
        {revealed ? value : masked}
      </span>
    </div>
  );
}

// ─── Star Rating ────────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : i - 0.5 <= rating
                ? "text-amber-400 fill-amber-200"
                : "text-muted-foreground/30"
          }
        />
      ))}
      <span className="text-xs font-semibold text-foreground ml-1">
        {rating}/5
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function PersonalProfileContent({ locale }: { locale: string }) {
  const [user, setUser] = useState<ProfileUser>(currentUser);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileUser>>({});
  const [sensitiveRevealed, setSensitiveRevealed] = useState(false);
  const [showReAuth, setShowReAuth] = useState(false);
  const [reAuthPurpose, setReAuthPurpose] = useState<
    "sensitive" | "change-password"
  >("sensitive");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const roleInfo = roleSpecificInfo[user.userRole];

  const tabs: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Tổng quan", icon: <User size={14} /> },
    { id: "work", label: "Công việc", icon: <Briefcase size={14} /> },
    { id: "sensitive", label: "Thông tin nhạy cảm", icon: <Lock size={14} /> },
    { id: "security", label: "Bảo mật", icon: <Shield size={14} /> },
  ];

  const handleEdit = () => {
    setEditData({
      name: user.name,
      phone: user.phone,
      address: user.address,
      email: user.email,
    });
    setEditMode(true);
  };

  const handleSave = () => {
    setUser((prev) => ({ ...prev, ...editData }));
    setEditMode(false);
    setEditData({});
  };

  const handleRevealSensitive = () => {
    setReAuthPurpose("sensitive");
    setShowReAuth(true);
  };

  const handleChangePasswordClick = () => {
    setReAuthPurpose("change-password");
    setShowReAuth(true);
  };

  const handleReAuthConfirm = async (_password: string) => {
    setShowReAuth(false);
    if (reAuthPurpose === "sensitive") {
      setSensitiveRevealed(true);
    } else {
      setShowChangePassword(true);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.next !== pwForm.confirm) {
      setPwError("Mật khẩu mới không khớp.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    setPwSuccess(true);
    setShowChangePassword(false);
    setPwForm({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-border bg-card">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground">{user.name}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                Đang làm việc
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.role} · {user.department}
            </p>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail size={11} /> {user.email}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} /> {user.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={11} /> Vào làm {user.joinDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!editMode ? (
              <button
                onClick={handleEdit}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Edit size={13} /> Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-ghost flex items-center gap-1.5 text-xs"
                >
                  <X size={13} /> Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-1.5 text-xs"
                >
                  <Save size={13} /> Lưu
                </button>
              </>
            )}
          </div>
        </div>

        {/* Role-specific stats */}
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {roleInfo.extraFields.map((f, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-muted/40 rounded-xl px-4 py-2.5 min-w-[140px]"
            >
              <p className="text-[10px] text-muted-foreground mb-0.5">
                {f.label}
              </p>
              <p className="text-sm font-bold text-foreground">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 md:px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Họ và tên", key: "name", value: user.name },
                  { label: "Email", key: "email", value: user.email },
                  { label: "Số điện thoại", key: "phone", value: user.phone },
                  { label: "Ngày sinh", key: "dob", value: user.dob },
                  { label: "Giới tính", key: "gender", value: user.gender },
                  {
                    label: "Quốc tịch",
                    key: "nationality",
                    value: user.nationality,
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {field.label}
                    </label>
                    {editMode && ["name", "phone"].includes(field.key) ? (
                      <input
                        type="text"
                        value={(editData as any)[field.key] ?? field.value}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="input-base text-xs"
                      />
                    ) : (
                      <p className="text-sm text-foreground font-medium">
                        {field.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Địa chỉ
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editData.address ?? user.address}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="input-base text-xs w-full"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">
                    {user.address}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Thông tin công ty
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Mã nhân viên", value: user.code },
                  { label: "Phòng ban", value: user.department },
                  { label: "Chức vụ", value: user.role },
                  { label: "Quản lý trực tiếp", value: user.manager },
                  { label: "Loại hợp đồng", value: user.contractType },
                  { label: "Địa điểm làm việc", value: user.location },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {field.label}
                    </label>
                    <p className="text-sm text-foreground font-medium">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Work Tab */}
        {activeTab === "work" && (
          <div className="max-w-2xl space-y-5">
            {/* Performance */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Đánh giá hiệu suất
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-amber-600">
                    {user.performanceRating}
                  </span>
                </div>
                <div>
                  <StarRating rating={user.performanceRating ?? 0} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Đánh giá Q2/2026 · Xuất sắc
                  </p>
                </div>
              </div>
            </div>

            {/* Leave Balance */}
            {user.leaveBalance && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Số ngày nghỉ phép
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Phép năm",
                      value: user.leaveBalance.annual,
                      color: "bg-blue-50 text-blue-700 border-blue-200",
                    },
                    {
                      label: "Phép bệnh",
                      value: user.leaveBalance.sick,
                      color: "bg-red-50 text-red-700 border-red-200",
                    },
                    {
                      label: "Đã dùng",
                      value: user.leaveBalance.used,
                      color: "bg-amber-50 text-amber-700 border-amber-200",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl border p-3 text-center ${item.color}`}
                    >
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-[10px] font-medium mt-0.5">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Projects */}
            {user.currentProjects && user.currentProjects.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Dự án đang tham gia
                </h3>
                <div className="space-y-2">
                  {user.currentProjects.map((proj, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-2 border-b border-border last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {user.skills && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Kỹ năng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {user.certifications && user.certifications.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Chứng chỉ
                </h3>
                <div className="space-y-2">
                  {user.certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-2 border-b border-border last:border-0"
                    >
                      <Award
                        size={14}
                        className="text-amber-500 flex-shrink-0"
                      />
                      <span className="text-sm text-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sensitive Tab */}
        {activeTab === "sensitive" && (
          <div className="max-w-2xl space-y-5">
            {!sensitiveRevealed ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <Lock size={24} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-amber-800 mb-1">
                  Thông tin nhạy cảm được bảo vệ
                </h3>
                <p className="text-xs text-amber-700 mb-4">
                  Lương, CCCD, mã số thuế và tài khoản ngân hàng yêu cầu xác
                  thực lại để xem.
                </p>
                <button
                  onClick={handleRevealSensitive}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  <Lock size={13} /> Xác thực để xem
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <CheckCircle
                    size={14}
                    className="text-green-600 flex-shrink-0"
                  />
                  <p className="text-xs text-green-700">
                    Đã xác thực · Phiên xem sẽ hết hạn sau 10 phút
                  </p>
                  <button
                    onClick={() => setSensitiveRevealed(false)}
                    className="ml-auto text-xs text-green-600 hover:underline"
                  >
                    Ẩn lại
                  </button>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Lương & Thuế
                  </h3>
                  <MaskedField
                    label="Lương cơ bản"
                    value={user.salary ?? ""}
                    revealed={sensitiveRevealed}
                  />
                  <MaskedField
                    label="Mã số thuế"
                    value={user.taxNumber ?? ""}
                    revealed={sensitiveRevealed}
                  />
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    CCCD / CMND
                  </h3>
                  <MaskedField
                    label="Số CCCD"
                    value={user.cccd ?? ""}
                    revealed={sensitiveRevealed}
                  />
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Tài khoản ngân hàng
                  </h3>
                  <MaskedField
                    label="Số tài khoản"
                    value={user.bankAccount ?? ""}
                    revealed={sensitiveRevealed}
                  />
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-xs text-muted-foreground">
                      Ngân hàng
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {user.bankName}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="max-w-2xl space-y-5">
            {pwSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle
                  size={14}
                  className="text-green-600 flex-shrink-0"
                />
                <p className="text-xs text-green-700 font-medium">
                  Đổi mật khẩu thành công!
                </p>
              </div>
            )}

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Bảo mật tài khoản
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Mật khẩu
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Đổi mật khẩu đăng nhập
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleChangePasswordClick}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <Edit size={12} /> Đổi mật khẩu
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                      <Shield size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Xác thực 2 bước (2FA)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bảo vệ tài khoản bằng OTP
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${user.twoFactorEnabled ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                  >
                    {user.twoFactorEnabled ? "Đã bật" : "Chưa bật"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Clock size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Lần đăng nhập cuối
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.lastLogin}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            {showChangePassword && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Đổi mật khẩu
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  {(["current", "next", "confirm"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        {field === "current"
                          ? "Mật khẩu hiện tại"
                          : field === "next"
                            ? "Mật khẩu mới"
                            : "Xác nhận mật khẩu mới"}
                      </label>
                      <div className="relative">
                        <input
                          type={showPw[field] ? "text" : "password"}
                          value={pwForm[field]}
                          onChange={(e) =>
                            setPwForm((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          className="input-base pr-10 text-xs"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPw((prev) => ({
                              ...prev,
                              [field]: !prev[field],
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw[field] ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwError && <p className="text-xs text-red-600">{pwError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="btn-secondary flex-1 text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1 text-xs"
                    >
                      Lưu mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ReAuth Modal */}
      {showReAuth && (
        <ReAuthModal
          onConfirm={handleReAuthConfirm}
          onClose={() => setShowReAuth(false)}
          sectionLabel={
            reAuthPurpose === "sensitive"
              ? "thông tin nhạy cảm"
              : "đổi mật khẩu"
          }
        />
      )}
    </div>
  );
}
