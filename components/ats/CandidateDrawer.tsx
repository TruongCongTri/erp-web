/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  FileText,
  ChevronRight,
  User,
  Briefcase,
  Star,
  Clock,
  Users,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  BrainCircuit,
  Download,
  Eye,
  Globe,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";

// ─── TYPES MAPPED FROM ATS API ───────────────────────────────────────────────
export enum ApplicationPhase {
  NEW = "NEW",
  AI_SCREENING = "AI_SCREENING",
  HR_SCREENING = "HR_SCREENING",
  INTERVIEW = "INTERVIEW",
  OFFERED = "OFFERED",
  BACKUP = "BACKUP",
  REJECTED = "REJECTED",
}

interface CandidateDrawerProps {
  candidate: any | null; // Truyền CandidateProfile từ useGetCandidatesQuery
  onClose: () => void;
  locale?: string;
}

// ─── Whisper Badge Component ───────────────────────────────────────────────────
function DrawerBadge({
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

// ─── STATUS CONFIGS (Mapped to ApplicationPhase) ──────────────────────────────
const statusBadgeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  NEW: { label: "Mới ứng tuyển", className: "badge-ats-new", icon: Sparkles },
  AI_SCREENING: {
    label: "AI Sàng lọc",
    className: "badge-ats-review",
    icon: BrainCircuit,
  },
  HR_SCREENING: {
    label: "HR Sàng lọc",
    className: "badge-ats-review",
    icon: FileText,
  },
  INTERVIEW: { label: "Phỏng vấn", className: "badge-ats-review", icon: Users },
  OFFERED: {
    label: "Đề nghị (Offer)",
    className: "badge-ats-offer",
    icon: Clock,
  },
  BACKUP: { label: "Dự phòng", className: "badge-neutral", icon: Clock },
  REJECTED: { label: "Từ chối", className: "badge-ats-rejected", icon: X },
};

// Ưu tiên (Fallback nếu ATS chưa có cơ chế Priority)
const priorityBadgeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  high: {
    label: "Ưu tiên: Cao",
    className: "badge-error",
    icon: AlertTriangle,
  },
  medium: {
    label: "Ưu tiên: Bình thường",
    className: "badge-info",
    icon: Briefcase,
  },
  low: { label: "Ưu tiên: Thấp", className: "badge-neutral", icon: Clock },
};

// ─── Collapsible Application Card Sub-Component ────────────────────────────────
function ApplicationPipelineCard({
  app,
  defaultExpanded = false,
  locale,
  candidateId,
  onClose,
}: {
  app: any; // Đây là JobApplication từ API
  defaultExpanded?: boolean;
  locale: string;
  candidateId: string;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Lấy dữ liệu từ JobApplication > JobPost > RecruitmentRequest
  const statusCfg = statusBadgeConfig[app.status] || statusBadgeConfig["NEW"];
  const jobTitle = app.jobPost?.publicTitle || "Chưa có tên Job";
  const department = app.jobPost?.request?.department || "Không rõ phòng ban";

  // Mock dữ liệu ngày (Có thể cập nhật nếu API trả về chi tiết thời gian JobPost)
  const postedDate = "N/A";
  const endDate = "N/A";

  return (
    <div className="border-b border-border/50 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      {/* Header (Clickable Toggle) */}
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 pr-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors truncate">
            {jobTitle}
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <Building2 size={10} /> {department}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={10} /> Đăng: {postedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> Hạn: {endDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <DrawerBadge config={statusCfg} />
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Content (Submissions List Table) */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-muted/10 border border-border rounded-lg overflow-hidden mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-3 py-2 font-semibold">Nguồn & Nền tảng</th>
                  <th className="px-3 py-2 font-semibold">Hồ sơ đính kèm</th>
                  <th className="px-3 py-2 font-semibold text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {app.submissions && app.submissions.length > 0 ? (
                  app.submissions.map((sub: any) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Globe size={11} className="text-muted-foreground" />{" "}
                          {sub.platformSource || "Website"}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          ID:{" "}
                          {sub.externalApplicationId || sub.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-1.5 font-semibold text-primary hover:underline cursor-pointer">
                          <FileText size={13} />
                          {sub.cvFileKey || "Hồ sơ ứng viên"}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {sub.cvUrl ? "Có Link CV" : "Không có Link CV"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 align-middle text-right">
                        <button
                          className="p-1.5 hover:text-primary text-muted-foreground transition-colors"
                          title="Xem trước"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="p-1.5 hover:text-primary text-muted-foreground transition-colors"
                          title="Tải xuống"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-muted-foreground italic"
                    >
                      Chưa có hồ sơ đính kèm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer of Card */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-muted-foreground">
              Đã nhận {app.submissions?.length || 0} phiên bản CV.
            </p>
            <Link
              href={`/${locale}/hr/ats/${candidateId}?app=${app.id}`}
              onClick={onClose}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
            >
              <BrainCircuit size={13} />
              Đánh giá mức độ phù hợp
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Drawer Component ─────────────────────────────────────────────────────
export default function CandidateDrawer({
  candidate,
  onClose,
  locale = "vi",
}: CandidateDrawerProps) {
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    overview: true,
    application: true,
    applicationsList: true,
    skills: false, // Fallback if you implement AI skill parsing later
    references: false,
  });

  if (!candidate) return null;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Safe checks using the new API structure
  const initials = candidate.fullName
    ? candidate.fullName.substring(0, 2).toUpperCase()
    : "U";

  // Extract primary info from the first application
  const firstApp = candidate.applications?.[0];
  const currentAppStatus = firstApp?.status || "NEW";

  const statusCfg =
    statusBadgeConfig[currentAppStatus] || statusBadgeConfig["NEW"];
  const priorityCfg = priorityBadgeConfig["high"]; // Mock priority since it's missing in API

  const primaryJobTitle = firstApp?.jobPost?.publicTitle || "Ứng viên tự do";
  const primaryDepartment = firstApp?.jobPost?.request?.department || "N/A";

  // Dữ liệu mock (Kinh nghiệm, Nguồn) có thể được thay thế nếu AI Screening API trả về
  const aiScore = firstApp?.aiScore;

  return (
    <DetailDrawer
      isOpen={!!candidate}
      onClose={onClose}
      title={candidate.fullName}
      subtitle={primaryJobTitle}
      headerClassName="bg-card text-foreground border-b border-border shadow-sm"
      icon={
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {initials}
        </div>
      }
      footer={
        <Link
          href={`/${locale}/hr/ats/${candidate.id}`}
          onClick={onClose}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          Xem chi tiết đầy đủ
          <ChevronRight size={15} />
        </Link>
      }
    >
      {/* ─── SECTION 1: OVERVIEW ─── */}
      <DrawerSection
        title="Tổng quan"
        icon={<User size={14} />}
        isExpanded={openSections.overview}
        onToggle={() => toggleSection("overview")}
        collapsedSummary={
          <div className="flex items-center gap-2 text-muted-foreground">
            {React.createElement(statusCfg.icon, { size: 14 })}
            <span className="text-xs font-medium truncate">
              {statusCfg.label}
            </span>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <DrawerBadge config={statusCfg} />
            <DrawerBadge config={priorityCfg} />
            {firstApp?.referredBy && (
              <span className="badge badge-special">
                <Users size={12} /> Giới thiệu:{" "}
                {firstApp.referredBy.name || "Nội bộ"}
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-6 flex justify-center text-muted-foreground">
                <Mail size={13} />
              </div>
              <span className="text-xs font-medium text-foreground truncate">
                {candidate.email}
              </span>
            </div>
            {candidate.phoneNumber && (
              <div className="flex items-center gap-3">
                <div className="w-6 flex justify-center text-muted-foreground">
                  <Phone size={13} />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {candidate.phoneNumber}
                </span>
              </div>
            )}
            {candidate.linkedInUrl && (
              <div className="flex items-center gap-3">
                <div className="w-6 flex justify-center text-muted-foreground">
                  <Globe size={13} />
                </div>
                <Link
                  href={candidate.linkedInUrl}
                  target="_blank"
                  className="text-xs font-medium text-primary hover:underline truncate"
                >
                  {candidate.linkedInUrl}
                </Link>
              </div>
            )}
          </div>
        </div>
      </DrawerSection>

      {/* ─── SECTION 2: APPLICATION INFO (Primary) ─── */}
      <DrawerSection
        title="Thông tin ứng tuyển gần nhất"
        icon={<Briefcase size={14} />}
        isExpanded={openSections.application}
        onToggle={() => toggleSection("application")}
      >
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            {
              icon: <Building2 size={12} />,
              label: "Phòng ban",
              value: primaryDepartment,
            },
            {
              icon: <Calendar size={12} />,
              label: "Ngày tạo hồ sơ",
              value: new Date(candidate.createdAt).toLocaleDateString("vi-VN"),
            },
            {
              icon: <Star size={12} />,
              label: "Nguồn chính",
              value: firstApp?.submissions?.[0]?.platformSource || "Website",
            },
            {
              icon: <BrainCircuit size={12} />,
              label: "AI Đánh giá",
              value: aiScore !== undefined ? `${aiScore}/100` : "Chưa có",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-muted/30 border border-border/50 rounded-lg p-2.5"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                {item.icon}
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </DrawerSection>

      {/* ─── SECTION 3: APPLIED JOBS (Unified Pipeline View) ─── */}
      <DrawerSection
        title={`Chi tiết ứng tuyển (${candidate.applications?.length || 0})`}
        icon={<FileText size={14} />}
        isExpanded={openSections.applicationsList}
        onToggle={() => toggleSection("applicationsList")}
      >
        <div className="space-y-2">
          {candidate.applications && candidate.applications.length > 0 ? (
            candidate.applications.map((app: any, index: number) => (
              <ApplicationPipelineCard
                key={app.id}
                app={app}
                defaultExpanded={index === 0}
                locale={locale}
                candidateId={candidate.id}
                onClose={onClose}
              />
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground italic text-xs">
              Ứng viên chưa ứng tuyển vị trí nào cụ thể.
            </div>
          )}
        </div>
      </DrawerSection>
    </DetailDrawer>
  );
}
