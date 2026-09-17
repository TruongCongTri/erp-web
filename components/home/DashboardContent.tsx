"use client";
import React, { useState } from "react";
import HRDashboard from "./HRDashboard";
import ITDashboard from "./ITDashboard";
import {
  Users,
  Briefcase,
  Clock,
  Shield,
  AlertTriangle,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import KpiCard from "./KpiCard";
import ActivityFeed from "./ActivityFeed";
import PendingApprovals from "./PendingApprovals";
import DepartmentGrid from "./DepartmentGrid";
import HeadcountChart from "./HeadcountChart";

// ─── Role simulation ──────────────────────────────────────────────────────────

type UserRole = "hr" | "it" | "general";

interface UserProfile {
  name: string;
  dept: string;
  role: UserRole;
  label: string;
}

const USER_PROFILES: UserProfile[] = [
  {
    name: "Nguyễn Thị Hương",
    dept: "Phòng Quản lý Nhân lực",
    role: "hr",
    label: "HR Manager",
  },
  {
    name: "Trần Minh Khoa",
    dept: "Phòng Công nghệ / Hệ thống",
    role: "it",
    label: "System Admin",
  },
  {
    name: "Sơn Lêu",
    dept: "Phòng Kinh doanh",
    role: "general",
    label: "Nhân viên",
  },
];

// ─── General Dashboard (existing) ────────────────────────────────────────────

function GeneralDashboard() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chủ nhật, 31 tháng 8 năm 2026 · Cập nhật lúc 06:32
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs py-1.5">Xuất báo cáo</button>
          <button className="btn-primary text-xs py-1.5">
            <UserPlus size={14} className="inline mr-1" />
            Thêm nhân viên
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Tổng nhân viên"
          value="154"
          subtext="Đang hoạt động"
          trend={{ value: "3 mới tháng này", positive: true }}
          icon={<Users size={18} />}
          accent="green"
        />
        <KpiCard
          label="Dự án đang chạy"
          value="23"
          subtext="6 dự án sắp hết hạn"
          trend={{ value: "2 mới", positive: true }}
          icon={<Briefcase size={18} />}
          accent="blue"
        />
        <KpiCard
          label="Chờ phê duyệt"
          value="12"
          subtext="4 ưu tiên cao"
          trend={{ value: "5 tăng", positive: false }}
          icon={<Clock size={18} />}
          accent="amber"
        />
        <KpiCard
          label="Vị trí tuyển dụng"
          value="7"
          subtext="3 ứng viên đang xét"
          trend={{ value: "2 mới", positive: true }}
          icon={<UserPlus size={18} />}
          accent="blue"
        />
        <KpiCard
          label="Vai trò hệ thống"
          value="11"
          subtext="41 quyền được định nghĩa"
          icon={<Shield size={18} />}
          accent="green"
        />
        <KpiCard
          label="Sự cố an toàn"
          value="2"
          subtext="Tháng 8 — cần xử lý"
          trend={{ value: "2 mới", positive: false }}
          icon={<AlertTriangle size={18} />}
          accent="red"
        />
      </div>
      <DepartmentGrid />
      <div
        className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        style={{ height: "280px" }}
      >
        <div className="lg:col-span-2 xl:col-span-2">
          <HeadcountChart />
        </div>
        <div className="lg:col-span-1 xl:col-span-1">
          <PendingApprovals />
        </div>
        <div className="lg:col-span-3 xl:col-span-2">
          <ActivityFeed />
        </div>
      </div>
      <div className="h-4" />
    </div>
  );
}

// ─── Main DashboardContent ────────────────────────────────────────────────────

export default function DashboardContent() {
  const [activeProfile, setActiveProfile] = useState<UserProfile>(
    USER_PROFILES[0],
  );
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative h-full">
      {/* Role switcher bar — demo only */}
      <div className="flex items-center gap-3 px-5 py-2 bg-amber-50 border-b border-amber-200 flex-shrink-0">
        <span className="text-[11px] text-amber-700 font-medium">
          🎭 Demo: Xem dashboard theo vai trò
        </span>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowSwitcher((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            {activeProfile.name} · {activeProfile.label}
            <ChevronDown size={12} />
          </button>
          {showSwitcher && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSwitcher(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border shadow-xl z-50">
                {USER_PROFILES.map((profile) => (
                  <button
                    key={profile.role}
                    onClick={() => {
                      setActiveProfile(profile);
                      setShowSwitcher(false);
                    }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0 ${activeProfile.role === profile.role ? "bg-muted" : ""}`}
                  >
                    <div
                      className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      {profile.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {profile.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {profile.dept}
                      </p>
                      <p
                        className="text-[10px] font-medium mt-0.5"
                        style={{ color: "var(--primary)" }}
                      >
                        {profile.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role-based dashboard rendering */}
      {activeProfile.role === "hr" && <HRDashboard />}
      {activeProfile.role === "it" && <ITDashboard />}
      {activeProfile.role === "general" && <GeneralDashboard />}
    </div>
  );
}
