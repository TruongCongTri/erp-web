/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  DollarSign,
  Users,
  Globe,
  Clock,
  Eye,
  Copy,
  ChevronLeft,
  Ban,
  FileText,
  GraduationCap,
  RefreshCw,
  Send,
  Calendar,
  ExternalLink,
  Download,
  AlertCircle,
  Phone,
  Mail,
  ChevronUp,
  ChevronDown,
  BrainCircuit,
  Lock,
  Sparkles,
  AlertTriangle,
  FileX,
  MessageSquare,
  Layers,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  PlusCircle,
  User,
} from "lucide-react";

import {
  HorizontalDetailLayout,
  HorizontalDetailAccordion,
} from "@/components/layouts/HorizontalDetailLayout";
import ActionButton from "@/components/buttons/ActionButton";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useGetJobPostByIdQuery,
  usePublishJobPostMutation,
  useCloseJobPostMutation,
  JobPostStatus,
  PlatformSource,
  ApplicationPhase,
  AiScreeningTier,
  getDeptName,
} from "@/lib/store/atsApiSlice";
import { gooeyToast } from "@/components/ui/goey-toaster";
import JobPostPreviewModal from "@/components/ats/JobPostPreviewModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import AutomationChannelsPanel, {
  AutomationChannelsPanelHandle,
  AUTOMATION_CHANNELS_ENABLED,
} from "@/components/ats/publishing/AutomationChannelsPanel";
import AutomationJobStatusGrid from "@/components/ats/publishing/AutomationJobStatusGrid";
import {
  AutomationPlatform,
  useGetAutomationJobsQuery,
} from "@/lib/store/publishingAutomationApiSlice";

// ─── PHÂN TÍCH VÀ HIỂN THỊ 3 PHẦN AI REASONING PHẲNG CHO HR ───────────────────
type SectionType = "strength" | "missing" | "risk" | "general";

interface ParsedSection {
  type: SectionType;
  title: string;
  lines: string[];
}

function parseInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function parseAiReasoning(content?: string | null): ParsedSection[] {
  if (!content || !content.trim()) return [];

  const lines = content.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const normalized = trimmed
      .replace(/^[\d.)\s#*-]+/, "")
      .replace(/[:*#_]+$/, "")
      .trim()
      .toLowerCase();

    let detectedType: SectionType | null = null;
    if (
      normalized.includes("điểm mạnh") ||
      normalized.includes("thế mạnh") ||
      (normalized.includes("phù hợp") && !normalized.includes("tiêu chí"))
    ) {
      detectedType = "strength";
    } else if (
      normalized.includes("còn thiếu") ||
      normalized.includes("chưa rõ") ||
      normalized.includes("chưa đáp ứng") ||
      normalized.includes("hạn chế")
    ) {
      detectedType = "missing";
    } else if (
      normalized.includes("rủi ro") ||
      normalized.includes("red flag") ||
      normalized.includes("cảnh báo")
    ) {
      detectedType = "risk";
    }

    if (detectedType) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        type: detectedType,
        title: trimmed.replace(/^[#*\s-]+|[#*:]+$/g, "").trim(),
        lines: [],
      };
    } else {
      if (!currentSection) {
        currentSection = {
          type: "general",
          title: "Tổng quan nhận định",
          lines: [],
        };
      }
      currentSection.lines.push(trimmed);
    }
  }

  if (currentSection) sections.push(currentSection);
  return sections;
}

const SECTION_CONFIG: Record<
  SectionType,
  {
    icon: React.ElementType;
    border: string;
    badgeBg: string;
    bulletColor: string;
    defaultTitle: string;
  }
> = {
  strength: {
    icon: CheckCircle2,
    border: "border-l-2 border-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bulletColor: "text-emerald-600",
    defaultTitle: "1. Điểm mạnh phù hợp",
  },
  missing: {
    icon: AlertCircle,
    border: "border-l-2 border-amber-500",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    bulletColor: "text-amber-600",
    defaultTitle: "2. Tiêu chí còn thiếu hoặc chưa rõ",
  },
  risk: {
    icon: ShieldAlert,
    border: "border-l-2 border-rose-500",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    bulletColor: "text-rose-600",
    defaultTitle: "3. Rủi ro / Red flags",
  },
  general: {
    icon: HelpCircle,
    border: "border-l-2 border-muted-foreground/40",
    badgeBg: "bg-muted text-muted-foreground border-border",
    bulletColor: "text-muted-foreground",
    defaultTitle: "Nhận định chung",
  },
};

export function StructuredAiReasoning({
  content,
}: {
  content?: string | null;
}) {
  const sections = useMemo(() => parseAiReasoning(content), [content]);

  if (!sections.length) {
    return (
      <span className="italic text-muted-foreground text-[11px]">
        Chưa có nhận định đánh giá chuyên môn chi tiết.
      </span>
    );
  }

  return (
    <div className="space-y-3.5 text-xs">
      {sections.map((sec, sIdx) => {
        const cfg = SECTION_CONFIG[sec.type];
        const Icon = cfg.icon;

        return (
          <div key={sIdx} className={`pl-3 ${cfg.border} space-y-1.5`}>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.badgeBg}`}
              >
                <Icon size={11} />
                {sec.title || cfg.defaultTitle}
              </span>
            </div>

            <div className="space-y-1 text-foreground/90 pl-0.5">
              {sec.lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[*•-]\s*/, "");
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    <span
                      className={`text-[11px] font-bold mt-0.5 shrink-0 ${cfg.bulletColor}`}
                    >
                      •
                    </span>
                    <span className="flex-1">{parseInlineBold(cleanLine)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── KÊNH HỖ TRỢ XUẤT BẢN TRỰC TIẾP HIỆN TẠI ───────────────────────────────────
// Chỉ Website nội bộ đang hoạt động; các kênh khác đang trong quá trình phát
// triển và hiển thị ở trạng thái khoá ("Sắp ra mắt ở v2").
const SUPPORTED_PUBLISH_PLATFORMS: PlatformSource[] = [
  PlatformSource.COMPANY_WEBSITE,
];

// ─── DANH SÁCH TOÀN BỘ CÁC KÊNH PHÂN PHỐI ─────────────────────────────────────
const CHANNELS_CONFIG: {
  key: PlatformSource;
  label: string;
  badgeLabel: string;
  iconBg: string;
  desc: string;
  audience: string;
}[] = [
  {
    key: PlatformSource.LINKEDIN,
    label: "LinkedIn Job Board & Feed",
    badgeLabel: "LinkedIn",
    iconBg: "bg-[#0a66c2] text-white",
    desc: "Mạng xã hội việc làm cho chuyên gia, kỹ sư trưởng và quản lý dự án.",
    audience: "Chuyên gia & Kỹ sư cấp cao",
  },
  {
    key: PlatformSource.FACEBOOK,
    label: "Facebook Fanpage Doanh Nghiệp",
    badgeLabel: "Facebook",
    iconBg: "bg-[#1877f2] text-white",
    desc: "Bài đăng tuyển dụng chính thức trên trang Fanpage tuyển dụng Chính Nam.",
    audience: "Đại chúng & Mạng xã hội",
  },
  {
    key: PlatformSource.COMPANY_WEBSITE,
    label: "Cổng Tuyển Dụng Website Nội Bộ",
    badgeLabel: "Website",
    iconBg: "bg-primary text-primary-foreground",
    desc: "Đăng tải trực tiếp tại hệ thống career.chinhnambkd.vn.",
    audience: "Ứng viên nộp trực tiếp",
  },
  {
    key: PlatformSource.VIETNAMWORKS,
    label: "VietnamWorks Job Portal",
    badgeLabel: "VietnamWorks",
    iconBg: "bg-orange-600 text-white",
    desc: "Nền tảng tuyển dụng chuyên nghiệp cho kỹ sư dự án và chỉ huy trưởng.",
    audience: "Kỹ sư có kinh nghiệm",
  },
  {
    key: PlatformSource.ZALO,
    label: "Zalo Mini App & Tuyển Dụng OA",
    badgeLabel: "Zalo",
    iconBg: "bg-blue-500 text-white",
    desc: "Kênh tuyển dụng nhanh phục vụ tuyển kỹ sư hiện trường và địa phương.",
    audience: "Kỹ sư hiện trường & Địa phương",
  },
];

// ─── STATUS CONFIG CHO PIPELINE ỨNG TUYỂN ─────────────────────────────────────
const APPLICATION_STATUS_CONFIG: Record<
  ApplicationPhase,
  { label: string; className: string }
> = {
  [ApplicationPhase.APPLIED]: {
    label: "Mới nộp CV",
    className: "bg-slate-100 text-slate-700 border-slate-200 ",
  },
  [ApplicationPhase.AI_SCREENING]: {
    label: "Đang sàng lọc AI",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [ApplicationPhase.SCREENING_FAILED]: {
    label: "Lỗi sàng lọc",
    className: "bg-orange-100 text-orange-800 border-orange-300 font-semibold",
  },
  [ApplicationPhase.SHORTLISTED]: {
    label: "Xuất sắc (Tier 1)",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
  },
  [ApplicationPhase.SAVED_POOL]: {
    label: "Kho tiềm năng (Tier 2)",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [ApplicationPhase.SCREENING_REJECTED]: {
    label: "Không đạt (Tier 3)",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
  [ApplicationPhase.INTERVIEWING]: {
    label: "Phỏng vấn",
    className: "bg-purple-100 text-purple-700 border-purple-200 font-semibold",
  },
  [ApplicationPhase.OFFERED]: {
    label: "Đề nghị tuyển dụng",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200 ",
  },
  [ApplicationPhase.HIRED]: {
    label: "Đã tuyển dụng",
    className: "bg-teal-100 text-teal-800 border-teal-300 font-semibold ",
  },
  [ApplicationPhase.WITHDRAWN]: {
    label: "Rút hồ sơ",
    className: "bg-gray-100 text-gray-500 border-gray-200 italic ",
  },
};

const PLATFORM_BADGE_CONFIG: Record<
  PlatformSource,
  { label: string; bg: string; text: string }
> = {
  [PlatformSource.LINKEDIN]: {
    label: "LinkedIn",
    bg: "bg-[#0a66c2]/10",
    text: "text-[#0a66c2]",
  },
  [PlatformSource.TOPCV]: {
    label: "TopCV",
    bg: "bg-[#00b14f]/10",
    text: "text-[#00b14f]",
  },
  [PlatformSource.VIETNAMWORKS]: {
    label: "VietnamWorks",
    bg: "bg-orange-500/10",
    text: "text-orange-600",
  },
  [PlatformSource.CAREERVIET]: {
    label: "CareerViet",
    bg: "bg-red-500/10",
    text: "text-red-600",
  },
  [PlatformSource.FACEBOOK]: {
    label: "Facebook",
    bg: "bg-[#1877f2]/10",
    text: "text-[#1877f2]",
  },
  [PlatformSource.ZALO]: {
    label: "Zalo",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
  },
  [PlatformSource.COMPANY_WEBSITE]: {
    label: "Website",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  [PlatformSource.REFERRAL]: {
    label: "Giới thiệu nội bộ",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
  },
  [PlatformSource.MANUAL_ENTRY]: {
    label: "Nhập thủ công",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
};

// ─── COMPONENT CARD COLLAPSIBLE CHO KÊNH PHÂN PHỐI ───────────────────────────
function ChannelPipelineCard({
  channel,
  job,
  defaultExpanded = false,
  isPublishing,
  publishingChannel,
  canPublish,
  onPublish,
  onPreview,
}: {
  channel: (typeof CHANNELS_CONFIG)[0];
  job: any;
  defaultExpanded?: boolean;
  isPublishing: boolean;
  publishingChannel: string | null;
  canPublish: boolean;
  onPublish: (channelKey: PlatformSource) => void;
  onPreview: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const targetPlatforms: string[] = job.targetPlatforms || [];

  const isPublished =
    targetPlatforms.includes(channel.key) &&
    job.status === JobPostStatus.PUBLISHED;

  const isSupported = SUPPORTED_PUBLISH_PLATFORMS.includes(channel.key);

  const handleUnsupportedChannelClick = () => {
    gooeyToast.info(
      `Tính năng kết nối API với kênh [${channel.badgeLabel}] sẽ được phát triển ở phiên bản tiếp theo.`,
    );
  };

  return (
    <div className="border-b border-border/50 pb-6 mb-5 last:border-0 last:pb-0 last:mb-0">
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {channel.badgeLabel.toUpperCase()}
            </span>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {channel.label}
            </h4>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <Users size={10} /> Đối tượng: {channel.audience}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> Trạng thái:{" "}
              {isPublished ? "Đã phát sóng" : "Chưa kích hoạt"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {isPublished ? "Đã xuất bản" : "Chưa đăng"}
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {channel.desc}
          </p>

          <div className="bg-muted/10 border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-3 py-2 font-semibold">Kênh phân phối</th>
                  <th className="px-3 py-2 font-semibold">
                    Thời gian phát sóng
                  </th>
                  <th className="px-3 py-2 font-semibold text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${channel.iconBg}`}
                      >
                        {channel.key.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate block">
                          {channel.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {channel.key}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-middle text-[11px] text-foreground font-mono">
                    {isPublished && job.publishedAt
                      ? new Date(job.publishedAt).toLocaleString("vi-VN")
                      : "Chưa xuất bản"}
                  </td>
                  <td className="px-3 py-2.5 align-middle text-right">
                    {isPublished ? (
                      <button
                        type="button"
                        onClick={onPreview}
                        className="btn-secondary text-[11px] h-7 px-2.5 inline-flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                      >
                        <Eye size={12} /> Xem bài đăng
                      </button>
                    ) : !isSupported ? (
                      <ActionButton
                        variant="outline"
                        className="text-[11px] h-7 px-2.5 inline-flex items-center gap-1 text-muted-foreground bg-muted/40 border-dashed border-border opacity-70 cursor-not-allowed"
                        disabled={true}
                        onAction={handleUnsupportedChannelClick}
                      >
                        <Lock size={11} /> Sắp ra mắt ở v2
                      </ActionButton>
                    ) : !canPublish ? (
                      <div
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/60 cursor-help"
                        title="Bạn chỉ có quyền xem, chỉ HR/Admin mới có quyền xuất bản"
                      >
                        <Lock size={11} /> Chờ HR xuất bản
                      </div>
                    ) : (
                      <ActionButton
                        variant="primary"
                        className="text-[11px] h-7 px-3 inline-flex items-center gap-1.5 shadow-xs"
                        allowedPermissions={[
                          "ats_job_post:update:any",
                          "ats_job_post:create:any",
                          "ats:jobs:publish",
                          "ats:jobs:manage",
                        ]}
                        permissionBehavior="disable"
                        disabled={
                          isPublishing && publishingChannel === channel.key
                        }
                        isLoading={
                          isPublishing && publishingChannel === channel.key
                        }
                        onAction={() => onPublish(channel.key)}
                      >
                        <Send size={11} />
                        <span>
                          {isPublishing && publishingChannel === channel.key
                            ? "Đang xuất bản..."
                            : "Đăng kênh này"}
                        </span>
                      </ActionButton>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT HỒ SƠ ỨNG VIÊN: THIẾT KẾ PHẲNG & THU GỌN LƯỢT NỘP ──────────────
function JobApplicationPipelineCard({
  app,
  defaultExpanded = false,
  locale,
}: {
  app: any;
  defaultExpanded?: boolean;
  locale: string;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const candidate = app.candidate;
  const candidateId = candidate?.id || app.candidateId;
  const submissionsList: any[] = app.submissions || [];
  const firstSub = submissionsList[0];
  const cvUrl = firstSub?.cvUrl || app.resumeUrl;

  const statusInfo =
    APPLICATION_STATUS_CONFIG[app.status as ApplicationPhase] ||
    APPLICATION_STATUS_CONFIG[ApplicationPhase.APPLIED];

  const hasAppAiScore = typeof app.aiScore === "number" && app.aiScore >= 0;
  const appAiScore = hasAppAiScore ? app.aiScore : null;

  const appTierConfig =
    appAiScore === null
      ? { bg: "bg-muted text-muted-foreground", label: "Tier N/A" }
      : app.aiTier === AiScreeningTier.HIGH || appAiScore >= 80
        ? { bg: "bg-emerald-500 text-white", label: "Tier 1 (Xuất sắc)" }
        : app.aiTier === AiScreeningTier.MEDIUM || appAiScore >= 50
          ? { bg: "bg-amber-500 text-white", label: "Tier 2 (Kho tiềm năng)" }
          : { bg: "bg-rose-500 text-white", label: "Tier 3 (Không đạt sơ bộ)" };

  const toggleSubmissionDetails = (subId: string) => {
    setExpandedSubId((prev) => (prev === subId ? null : subId));
  };

  const handleNavigateCandidate = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!candidateId) return;
    router.push(`/${locale}/ats/candidate-management/${candidateId}`);
  };

  return (
    <div className="border-b border-border/50 pb-6 mb-5 last:border-0 last:pb-0 last:mb-0">
      {/* 1. Header Hồ Sơ Ứng Viên (Clickable Toggle) */}
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              UV-{candidate?.id ? candidate.id.slice(-4) : "CAND"}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {candidate?.fullName || "Ứng viên nộp đơn"}
              </h4>
              {candidateId && (
                <button
                  type="button"
                  onClick={handleNavigateCandidate}
                  className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer"
                  title="Mở trang hồ sơ ứng viên"
                >
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <Mail size={10} /> {candidate?.email || "—"}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Phone size={10} />{" "}
              {candidate?.phoneNumber || candidate?.phone || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={10} /> Nộp lúc:{" "}
              {new Date(app.appliedAt || app.createdAt).toLocaleString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`badge ${statusInfo.className} text-[10px] border`}>
            {statusInfo.label}
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* 2. Expanded Content: Thiết kế phẳng, không lồng hộp */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 pt-1">
          {/* Vùng điểm số & Nhận định AI Screening */}
          <div className="space-y-2.5 pb-4 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                    {appAiScore === null ? "N/A" : appAiScore}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    /100
                  </span>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${appTierConfig.bg}`}
                >
                  {appTierConfig.label}
                </span>

                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 ml-1">
                  <BrainCircuit size={14} className="text-primary" /> Đánh giá
                  AI Screening
                </span>
              </div>

              <span className="text-[10px] text-muted-foreground font-mono">
                Đánh giá:{" "}
                {new Date(app.updatedAt || app.createdAt).toLocaleString(
                  "vi-VN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  },
                )}
              </span>
            </div>

            <div className="pt-1 max-h-96 overflow-y-auto custom-scrollbar">
              <StructuredAiReasoning content={app.aiReasoning} />
            </div>
          </div>

          {/* Collapsible: Các lượt nộp hồ sơ (Submissions) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsSubmissionsOpen(!isSubmissionsOpen)}
              className="w-full flex items-center justify-between py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group select-none"
            >
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-primary" />
                <span className="font-semibold text-xs text-foreground">
                  Các lượt nộp hồ sơ
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                  {submissionsList.length}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span>{isSubmissionsOpen ? "Thu gọn" : "Xem chi tiết"}</span>
                {isSubmissionsOpen ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </div>
            </button>

            {isSubmissionsOpen && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="border-t border-border/50 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border/40 text-[10px] uppercase text-muted-foreground tracking-wider">
                      <tr>
                        <th className="py-2 pr-3 font-semibold">Nguồn nộp</th>
                        <th className="py-2 px-3 font-semibold">
                          Tệp CV đính kèm
                        </th>
                        <th className="py-2 px-3 font-semibold text-center">
                          Điểm số
                        </th>
                        <th className="py-2 pl-3 font-semibold text-right">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {submissionsList.length > 0 ? (
                        submissionsList.map((sub: any) => {
                          const isPurged = Boolean(sub.isCvPurged);
                          const subPlatform: PlatformSource =
                            sub.platformSource ||
                            PlatformSource.COMPANY_WEBSITE;
                          const pCfg =
                            PLATFORM_BADGE_CONFIG[subPlatform] ||
                            PLATFORM_BADGE_CONFIG[PlatformSource.MANUAL_ENTRY];

                          const hasSubScore =
                            typeof sub.aiScore === "number" && sub.aiScore >= 0;
                          const subScore = hasSubScore
                            ? sub.aiScore
                            : appAiScore;
                          const subTier = sub.aiTier || app.aiTier;

                          const subTierConfig =
                            subScore === null
                              ? "bg-muted text-muted-foreground"
                              : subTier === AiScreeningTier.HIGH ||
                                  subScore >= 80
                                ? "bg-emerald-500 text-white"
                                : subTier === AiScreeningTier.MEDIUM ||
                                    subScore >= 50
                                  ? "bg-amber-500 text-white"
                                  : "bg-rose-500 text-white";

                          const isSubRowExpanded = expandedSubId === sub.id;

                          return (
                            <React.Fragment key={sub.id}>
                              <tr
                                onClick={() => toggleSubmissionDetails(sub.id)}
                                className="hover:bg-muted/20 transition-colors cursor-pointer group"
                              >
                                <td className="py-2.5 pr-3 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pCfg.bg} ${pCfg.text}`}
                                    >
                                      {pCfg.label}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    {sub.externalApplicationId ||
                                      sub.id.substring(0, 8)}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 align-middle">
                                  <div className="flex items-center gap-2">
                                    {isPurged ? (
                                      <FileX
                                        size={13}
                                        className="text-rose-500 shrink-0"
                                      />
                                    ) : (
                                      <FileText
                                        size={13}
                                        className="text-primary shrink-0"
                                      />
                                    )}

                                    <div className="min-w-0">
                                      <span
                                        className="font-medium text-foreground group-hover:text-primary transition-colors truncate block max-w-[220px]"
                                        title={sub.cvFileKey || "Tệp hồ sơ CV"}
                                      >
                                        {sub.cvFileKey || "Hồ sơ ứng viên CV"}
                                      </span>

                                      {isPurged && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 mt-0.5">
                                          <AlertTriangle size={9} /> Đã xóa S3
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 align-middle text-center">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${subTierConfig}`}
                                  >
                                    {subScore === null ? "N/A" : `${subScore}%`}
                                  </span>
                                </td>

                                <td
                                  className="py-2.5 pl-3 align-middle text-right"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleSubmissionDetails(sub.id)
                                      }
                                      className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                                      title="Xem chi tiết nhận định"
                                    >
                                      {isSubRowExpanded ? (
                                        <ChevronUp size={13} />
                                      ) : (
                                        <ChevronDown size={13} />
                                      )}
                                    </button>

                                    {isPurged ? (
                                      <span
                                        className="p-1 text-muted-foreground/40 cursor-not-allowed"
                                        title="CV đã bị xóa khỏi S3"
                                      >
                                        <FileX size={13} />
                                      </span>
                                    ) : sub.cvUrl ? (
                                      <a
                                        href={sub.cvUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 hover:text-primary text-muted-foreground transition-colors inline-block cursor-pointer"
                                        title="Tải xuống tệp CV gốc"
                                      >
                                        <Download size={13} />
                                      </a>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>

                              {isSubRowExpanded && (
                                <tr>
                                  <td colSpan={4} className="py-2.5 pl-4 pr-1">
                                    <div className="pl-3 border-l-2 border-primary/30 space-y-2 text-xs">
                                      {sub.coverLetter && (
                                        <div className="space-y-0.5">
                                          <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                            <MessageSquare
                                              size={11}
                                              className="text-primary"
                                            />{" "}
                                            Thư giới thiệu (Cover Letter)
                                          </p>
                                          <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[11px]">
                                            {sub.coverLetter}
                                          </p>
                                        </div>
                                      )}

                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <p className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                                            <BrainCircuit size={11} /> Nhận định
                                            AI lượt nộp này
                                          </p>
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            Nộp lúc:{" "}
                                            {new Date(
                                              app.appliedAt || app.createdAt,
                                            ).toLocaleString("vi-VN", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>

                                        <StructuredAiReasoning
                                          content={
                                            sub.aiReasoning || app.aiReasoning
                                          }
                                        />

                                        {isPurged && (
                                          <p className="text-[10px] text-rose-600 flex items-center gap-1 pt-1">
                                            <AlertTriangle
                                              size={11}
                                              className="shrink-0"
                                            />
                                            Tệp CV đã được xóa tự động khỏi S3
                                            theo chính sách bảo vệ dữ liệu.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-3 text-center text-muted-foreground italic"
                          >
                            Chưa có hồ sơ đính kèm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 3. Action Pipeline Buttons */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {cvUrl && !firstSub?.isCvPurged && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-[11px] h-7 px-2.5 inline-flex items-center gap-1 text-primary cursor-pointer"
                >
                  <Download size={12} /> Tải bản CV mới nhất
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Nút xem trực tiếp hồ sơ ứng viên */}
              {candidateId && (
                <button
                  type="button"
                  onClick={handleNavigateCandidate}
                  className="btn-secondary text-[11px] h-7 px-2.5 flex items-center gap-1 cursor-pointer shadow-xs text-foreground hover:text-primary"
                  title="Xem trang hồ sơ chi tiết của ứng viên này"
                >
                  <User size={12} className="text-primary" />
                  <span>Hồ sơ ứng viên</span>
                </button>
              )}

              {/* Nút thẩm định CV & AI Match */}
              <button
                type="button"
                onClick={() => {
                  router.push(
                    `/${locale}/ats/candidate-management/${candidateId}/cv?appId=${app.id}${
                      firstSub?.id ? `&submissionId=${firstSub.id}` : ""
                    }`,
                  );
                }}
                className="btn-primary text-[11px] h-7 px-3 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <BrainCircuit size={12} />
                <span>Thẩm định CV &amp; AI Match</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function JobPostDetailContent({
  id,
  locale = "vi",
}: {
  id: string;
  locale?: string;
}) {
  const router = useRouter();
  const { userPerms } = usePermissions();

  const { data: jobRes, isLoading, refetch } = useGetJobPostByIdQuery(id);
  const job = jobRes?.data;

  const [publishJobPost, { isLoading: isPublishing }] =
    usePublishJobPostMutation();
  const [closeJobPost, { isLoading: isClosing }] = useCloseJobPostMutation();

  const { data: automationJobsRes } = useGetAutomationJobsQuery(
    { atsJobPostingId: id },
    { skip: !id },
  );
  const automationJobs = automationJobsRes?.data || [];
  const alreadyScheduledGroupIds = automationJobs
    .filter((j) => j.platform === AutomationPlatform.FACEBOOK_GROUP && j.group)
    .map((j) => j.group!.id);
  const alreadyScheduledPlatforms: AutomationPlatform[] = [
    AutomationPlatform.TOPCV,
    AutomationPlatform.CAREERVIET,
  ].filter((p) => automationJobs.some((j) => j.platform === p));

  const [activeSection, setActiveSection] = useState<string>("general");
  const [showPreview, setShowPreview] = useState(false);
  const [publishingChannel, setPublishingChannel] = useState<string | null>(
    null,
  );
  const [showAddAutomationChannels, setShowAddAutomationChannels] =
    useState(false);
  const addChannelsPanelRef = useRef<AutomationChannelsPanelHandle>(null);
  const [addChannelsCount, setAddChannelsCount] = useState(0);

  // ── PHÂN QUYỀN RBAC CHO TRANG CHI TIẾT JOB POST ──
  const hasPermission = useMemo(() => {
    return (resource: string, action: string, scope?: string): boolean => {
      if (userPerms.includes("*:*:any") || userPerms.includes("*")) return true;
      return userPerms.some((perm) => {
        const parts = perm.split(":");
        if (parts.length < 2) return false;
        const [r, a, s] = parts;
        const matchR = r === "*" || r === resource;
        const matchA = a === "*" || a === action;
        if (!scope) return matchR && matchA;
        const matchS = s === "*" || s === scope || s === "any";
        return matchR && matchA && matchS;
      });
    };
  }, [userPerms]);

  const canPublish =
    hasPermission("ats_job_post", "update", "any") ||
    hasPermission("ats_job_post", "create", "any") ||
    userPerms.includes("ats:jobs:publish") ||
    userPerms.includes("ats:jobs:manage") ||
    userPerms.includes("*:*:any");

  const canClose =
    hasPermission("ats_job_post", "delete", "any") ||
    hasPermission("ats_job_post", "update", "any") ||
    userPerms.includes("ats:jobs:manage") ||
    userPerms.includes("*:*:any");

  const canViewAutomation =
    hasPermission("publishing_automation", "read", "any") ||
    hasPermission("publishing_automation", "create", "any") ||
    hasPermission("publishing_automation", "update", "any") ||
    hasPermission("publishing_automation", "manage", "any") ||
    userPerms.includes("*:*:any");

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <RefreshCw size={24} className="animate-spin text-primary mr-2" />
        <span className="text-xs text-muted-foreground">
          Đang nạp chi tiết bản tin tuyển dụng...
        </span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <AlertCircle size={32} className="text-amber-500" />
        <p className="text-sm font-semibold text-foreground">
          Không tìm thấy tin tuyển dụng.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/ats/jobs-management`)}
          className="btn-secondary text-xs px-4 py-2 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const deptName = getDeptName(
    job.recruitmentRequest?.department,
    "Kỹ thuật EPC",
  );
  const salaryText = job.isSalaryNegotiable
    ? "Thỏa thuận"
    : job.salaryMin
      ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu VNĐ`
      : "Theo thỏa thuận";

  const targetPlatforms: string[] = job.targetPlatforms || [];
  const applications = job.applications || [];
  const applicationsCount = applications.length || job.applicationsCount || 0;
  const requiredCount = job.headcount || 0;

  const handleCopyMarkdown = async () => {
    const md = `# 📢 TUYỂN DỤNG: ${(job.publicTitle || "").toUpperCase()}
**Đơn vị:** Công ty Cổ phần Thiết kế Xây dựng Chính Nam
**Bộ phận:** ${deptName}
**Mức lương:** ${salaryText}
**Cấp bậc:** ${job.level} (${job.experienceYears} năm KN)
**Hình thức làm việc:** ${job.jobType} (${job.workingModel})

---
### 1. MÔ TẢ CÔNG VIỆC
${job.jobDescription}

### 2. YÊU CẦU ỨNG VIÊN
${job.requirements}

### 3. QUYỀN LỢI & PHÚC LỢI
${job.benefits}
${job.extraBenefits ? `* Quyền lợi bổ sung: ${job.extraBenefits}` : ""}

---
* Liên hệ: ${job.hrRecipientEmail || "talent@chinhnambkd.vn"}`;

    await navigator.clipboard.writeText(md);
    gooeyToast.success("Đã copy Markdown bản tin tuyển dụng!");
  };

  const handlePublishSingleChannel = async (channelKey: PlatformSource) => {
    if (!canPublish) {
      gooeyToast.error(
        "Bạn không có quyền thực hiện xuất bản tin tuyển dụng lên các kênh.",
      );
      return;
    }

    if (!SUPPORTED_PUBLISH_PLATFORMS.includes(channelKey)) {
      gooeyToast.info(
        "Tính năng đăng tuyển qua kênh này sẽ được phát triển ở phiên bản tiếp theo.",
      );
      return;
    }

    try {
      setPublishingChannel(channelKey);
      const updatedPlatforms = Array.from(
        new Set([...targetPlatforms, channelKey]),
      );

      await publishJobPost({
        id: job.id,
        body: {
          targetPlatforms: updatedPlatforms as PlatformSource[],
          bypassHeadApproval: true,
        },
      }).unwrap();

      gooeyToast.success(
        `Bản tin đã được kích hoạt xuất bản lên kênh ${channelKey}!`,
      );
      refetch();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || `Lỗi xuất bản lên ${channelKey}.`);
    } finally {
      setPublishingChannel(null);
    }
  };

  const handleClose = async () => {
    try {
      await closeJobPost(job.id).unwrap();
      gooeyToast.success("Đã đóng tin tuyển dụng.");
      refetch();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi đóng tin.");
    }
  };

  return (
    <>
      <HorizontalDetailLayout
        sidebar={{
          defaultCollapsed: false,
          content: () => (
            <div className="p-5 space-y-5 text-xs overflow-y-auto max-h-screen custom-scrollbar">
              <div className="flex flex-col items-center text-center pb-4 border-b border-border/60">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-mono text-sm font-bold mb-2.5 border border-primary/20 shadow-sm">
                  {job.jobCode ? job.jobCode.slice(-4) : "JOB"}
                </div>
                <h2 className="font-bold text-foreground leading-snug line-clamp-2">
                  {job.publicTitle}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-2.5">
                  {deptName}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    job.status === JobPostStatus.PUBLISHED
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : job.status === JobPostStatus.CLOSED
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {/* Thông số tuyển dụng chính */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign size={13} /> Định biên lương
                  </span>
                  <span className="font-bold text-emerald-600">
                    {salaryText}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users size={13} /> Chỉ tiêu tuyển
                  </span>
                  <span className="font-bold text-foreground">
                    {requiredCount} nhân sự
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Briefcase size={13} /> Cấp bậc
                  </span>
                  <span className="font-medium text-foreground">
                    {job.level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 size={13} /> Chuyên môn
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[120px]">
                    {job.specialization || "Kỹ thuật"}
                  </span>
                </div>
              </div>

              {/* Thống kê ứng viên */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Tổng số hồ sơ ứng tuyển
                </p>
                <p className="text-2xl font-black text-primary font-mono">
                  {applicationsCount}
                </p>
              </div>
            </div>
          ),
        }}
        sidePanel={null}
        footer={
          <div className="w-full flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/ats/jobs-management`)}
              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft size={13} /> Danh sách bản tin
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy size={13} /> Copy Markdown
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer text-purple-600 border-purple-200 hover:bg-purple-50 shadow-xs"
              >
                <Eye size={13} /> Xem trước bài đăng
              </button>

              {job.status === JobPostStatus.PUBLISHED && canClose && (
                <ActionButton
                  variant="destructive"
                  className="text-xs h-8 px-4"
                  allowedPermissions={[
                    "ats_job_post:delete:any",
                    "ats_job_post:update:any",
                    "ats:jobs:manage",
                  ]}
                  permissionBehavior="hide"
                  requireConfirm={true}
                  confirmTitle="Đóng tin tuyển dụng"
                  confirmMessage="Bạn có chắc chắn muốn đóng tin tuyển dụng này? Ứng viên sẽ không thể tiếp tục nộp hồ sơ qua các kênh."
                  confirmLabel="Xác nhận đóng tin"
                  cancelLabel="Hủy"
                  isLoading={isClosing}
                  onAction={handleClose}
                >
                  <Ban size={13} className="mr-1" /> Đóng tin tuyển dụng
                </ActionButton>
              )}
            </div>
          </div>
        }
      >
        {/* Main Canvas Accordions */}
        <div className="flex-1 flex flex-row min-w-0 bg-card overflow-hidden shadow-sm h-full w-full">
          {/* ========================================================================= */}
          {/* ACCORDION 1: CHI TIẾT BẢN TIN TUYỂN DỤNG */}
          {/* ========================================================================= */}
          <HorizontalDetailAccordion
            title="1. Chi tiết bản tin tuyển dụng"
            icon={<FileText size={14} />}
            isExpanded={activeSection === "general"}
            onToggle={() => setActiveSection("general")}
            expandedWidth="lg:flex-1 lg:min-w-[580px]"
            collapsedWidth="lg:w-12"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-xs max-w-3xl leading-relaxed fade-in">
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FileText size={14} /> Mô tả công việc
                </h4>
                <p className="text-foreground/90 whitespace-pre-wrap pl-0.5 leading-relaxed">
                  {job.jobDescription ||
                    "Chưa cập nhật nội dung mô tả công việc."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <GraduationCap size={14} /> Yêu cầu ứng viên
                </h4>
                <p className="text-foreground/90 whitespace-pre-wrap pl-0.5 leading-relaxed">
                  {job.requirements ||
                    "Chưa cập nhật nội dung yêu cầu ứng viên."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <DollarSign size={14} /> Quyền lợi &amp; Chế độ đãi ngộ
                </h4>
                <p className="text-foreground/90 whitespace-pre-wrap pl-0.5 leading-relaxed">
                  {job.benefits || "Chưa cập nhật nội dung quyền lợi."}
                </p>
                {job.extraBenefits && (
                  <p className="text-primary font-medium pl-0.5 pt-0.5">
                    ★ Quyền lợi bổ sung: {job.extraBenefits}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Clock size={14} /> Thời gian làm việc
                </h4>
                <div className="space-y-1 pl-0.5 text-foreground/90">
                  <p className="font-medium">
                    {job.workingHoursStandard || "Thứ 2 – Thứ 6: 08:00 – 17:00"}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {job.workingHoursDetail}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Users size={14} /> Tiêu chuẩn &amp; Kỳ vọng ứng viên
                </h4>
                <div className="space-y-1.5 pl-0.5 text-foreground/90 text-[11px]">
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Học vấn tối thiểu:
                    </span>
                    <span className="font-semibold">
                      {job.minEducation || "Đại học"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Số năm kinh nghiệm:
                    </span>
                    <span className="font-semibold">
                      {job.experienceYears} năm
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Giới tính:
                    </span>
                    <span className="font-semibold">
                      {job.gender || "Không yêu cầu"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Độ tuổi quy định:
                    </span>
                    <span className="font-semibold">
                      {job.ageMin || 24} - {job.ageMax || 35} tuổi
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Kỹ năng phụ (Nice-to-Have):
                    </span>
                    <span>
                      {job.niceToHaveSkills && job.niceToHaveSkills.length > 0
                        ? job.niceToHaveSkills.join(", ")
                        : "Không có yêu cầu"}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Ngoại ngữ:
                    </span>
                    <span>
                      {job.languages && job.languages.length > 0
                        ? job.languages.join(", ")
                        : "Tiếng Việt"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Mail size={14} /> Thông tin liên hệ &amp; Tiếp nhận hồ sơ
                </h4>
                <div className="space-y-1.5 pl-0.5 text-foreground/90 text-[11px]">
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Hạn nhận hồ sơ:
                    </span>
                    <span className="font-semibold">
                      {new Date(job.applicationDeadline).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Chỉ tiêu số lượng tuyển:
                    </span>
                    <span className="font-semibold">
                      {requiredCount} nhân sự
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Người phụ trách:
                    </span>
                    <span>{job.hrRecipientName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Số điện thoại liên hệ:
                    </span>
                    <span className="font-mono">{job.hrRecipientPhone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-muted-foreground w-36 shrink-0">
                      Email nhận hồ sơ:
                    </span>
                    <span className="font-mono text-primary font-medium">
                      {job.hrRecipientEmail}
                    </span>
                  </p>
                  {job.campaignName && (
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground w-36 shrink-0">
                        Chiến dịch tuyển dụng:
                      </span>
                      <span>{job.campaignName}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </HorizontalDetailAccordion>

          {/* ========================================================================= */}
          {/* ACCORDION 2: KÊNH ĐĂNG TUYỂN */}
          {/* ========================================================================= */}
          <HorizontalDetailAccordion
            title={`2. Kênh đăng tuyển (${targetPlatforms.length}/${CHANNELS_CONFIG.length})`}
            icon={<Globe size={14} />}
            isExpanded={activeSection === "channels"}
            onToggle={() => setActiveSection("channels")}
            expandedWidth="lg:flex-1 lg:min-w-[580px]"
            collapsedWidth="lg:w-12"
          >
            <div className="space-y-4 max-w-3xl text-xs">
              {CHANNELS_CONFIG.map((channel, idx) => (
                <ChannelPipelineCard
                  key={channel.key}
                  channel={channel}
                  job={job}
                  defaultExpanded={idx === 0}
                  isPublishing={isPublishing}
                  publishingChannel={publishingChannel}
                  canPublish={canPublish}
                  onPublish={handlePublishSingleChannel}
                  onPreview={() => setShowPreview(true)}
                />
              ))}
            </div>
          </HorizontalDetailAccordion>

          {/* ========================================================================= */}
          {/* ACCORDION 3: KÊNH ĐĂNG TUYỂN TỰ ĐỘNG (FACEBOOK GROUPS / TOPCV / CAREERVIET) */}
          {/* ========================================================================= */}
          {canViewAutomation && (
            <HorizontalDetailAccordion
              title={`3. Kênh đăng tuyển tự động (${automationJobs.length})`}
              icon={<Send size={14} />}
              isExpanded={activeSection === "automation"}
              onToggle={() => setActiveSection("automation")}
              expandedWidth="lg:flex-1 lg:min-w-[580px]"
              collapsedWidth="lg:w-12"
            >
              <div className="space-y-4 max-w-3xl text-xs">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground">
                    Đăng tin tự động lên các nhóm Facebook, TopCV và CareerViet
                    thông qua hệ thống automation.
                    {!AUTOMATION_CHANNELS_ENABLED && (
                      <span className="block mt-0.5 text-amber-600 font-medium">
                        Tính năng thêm kênh mới đang trong quá trình phát
                        triển — hiện chỉ hiển thị trạng thái các kênh đã có.
                      </span>
                    )}
                  </p>
                  <ActionButton
                    variant="outline"
                    className="text-[11px] h-7 px-2.5 inline-flex items-center gap-1 shrink-0"
                    allowedPermissions={[
                      "publishing_automation:create:any",
                      "publishing_automation:manage:any",
                    ]}
                    permissionBehavior="disable"
                    disabled={!AUTOMATION_CHANNELS_ENABLED}
                    tooltip={
                      AUTOMATION_CHANNELS_ENABLED
                        ? undefined
                        : "Tính năng đang phát triển"
                    }
                    onClick={() => setShowAddAutomationChannels(true)}
                  >
                    {AUTOMATION_CHANNELS_ENABLED ? (
                      <>
                        <PlusCircle size={12} /> Thêm kênh
                      </>
                    ) : (
                      <>
                        <Lock size={12} /> Đang phát triển
                      </>
                    )}
                  </ActionButton>
                </div>
                <AutomationJobStatusGrid atsJobPostingId={id} />
              </div>
            </HorizontalDetailAccordion>
          )}

          {/* ========================================================================= */}
          {/* ACCORDION 4: HỒ SƠ ỨNG TUYỂN (THIẾT KẾ PHẲNG, AI SCORE ƯU TIÊN) */}
          {/* ========================================================================= */}
          <HorizontalDetailAccordion
            title={`4. Hồ sơ ứng tuyển (${applicationsCount})`}
            icon={<Users size={14} />}
            isExpanded={activeSection === "submissions"}
            onToggle={() => setActiveSection("submissions")}
            expandedWidth="lg:flex-1 lg:min-w-[580px]"
            collapsedWidth="lg:w-12"
          >
            <div className="space-y-4 max-w-3xl text-xs">
              {applications.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-1.5">
                  <Users
                    size={24}
                    className="text-muted-foreground mx-auto opacity-40"
                  />
                  <p className="font-semibold text-foreground text-xs">
                    Chưa có ứng viên nộp hồ sơ
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Các hồ sơ ứng tuyển nộp từ Website, TopCV, LinkedIn hoặc
                    thêm thủ công sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                applications.map((app: any, idx: number) => (
                  <JobApplicationPipelineCard
                    key={app.id}
                    app={app}
                    defaultExpanded={idx === 0}
                    locale={locale}
                  />
                ))
              )}
            </div>
          </HorizontalDetailAccordion>
        </div>
      </HorizontalDetailLayout>

      {/* Modal Thêm kênh đăng tuyển tự động */}
      <Dialog
        open={showAddAutomationChannels}
        onOpenChange={setShowAddAutomationChannels}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm kênh đăng tuyển tự động</DialogTitle>
            <DialogDescription>
              Chọn thêm nhóm Facebook hoặc cổng tuyển dụng khác để phân phối tin
              tuyển dụng này. Các kênh đã đăng hoặc đang chờ sẽ không hiển thị
              lại ở đây.
            </DialogDescription>
          </DialogHeader>
          <AutomationChannelsPanel
            ref={addChannelsPanelRef}
            atsJobId={id}
            jobTitle={job.publicTitle}
            jobDescription={job.jobDescription}
            jobType={job.jobType}
            requiredSkills={job.mustHaveSkills || []}
            excludeGroupIds={alreadyScheduledGroupIds}
            excludePlatforms={alreadyScheduledPlatforms}
            onSelectionCountChange={setAddChannelsCount}
          />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowAddAutomationChannels(false)}
              className="btn-secondary text-xs px-4 py-2 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <ActionButton
              variant="primary"
              className="text-xs px-5 py-2"
              allowedPermissions={[
                "publishing_automation:create:any",
                "publishing_automation:manage:any",
              ]}
              permissionBehavior="disable"
              onAction={async () => {
                if (addChannelsCount === 0) {
                  throw { message: "Vui lòng chọn ít nhất một kênh." };
                }
                const results =
                  (await addChannelsPanelRef.current?.submit()) || [];
                const failures = results.filter((r) => !r.ok);
                const succeededAny = results.some((r) => r.ok);
                if (failures.length > 0) {
                  throw {
                    type: succeededAny ? "warning" : undefined,
                    message: failures
                      .map((f) => `${f.label}: ${f.message}`)
                      .join(" | "),
                  };
                }
                setShowAddAutomationChannels(false);
              }}
              loadingMessage="Đang thêm kênh đăng tuyển..."
              successMessage="Đã thêm kênh đăng tuyển thành công!"
              errorMessage={(err: any) =>
                err?.message || "Có lỗi khi thêm kênh."
              }
            >
              <Send size={12} /> Đăng
              {addChannelsCount > 0 ? ` (${addChannelsCount})` : ""}
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <JobPostPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={{
          ...job,
          publicTitle: job.publicTitle,
          isSalaryNegotiable: job.isSalaryNegotiable,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          specialization: job.specialization,
          domainKnowledge: job.domainKnowledge,
          level: job.level,
          jobType: job.jobType,
          workingModel: job.workingModel,
          jobDescription: job.jobDescription,
          requirements: job.requirements,
          benefits: job.benefits,
          extraBenefits: job.extraBenefits,
          workLocations: job.workLocations,
          workingHoursStandard: job.workingHoursStandard,
          workingHoursDetail: job.workingHoursDetail,
          minEducation: job.minEducation,
          experienceYears: job.experienceYears,
          gender: job.gender,
          ageMin: job.ageMin,
          ageMax: job.ageMax,
          applicationDeadline: job.applicationDeadline,
          hrRecipientName: job.hrRecipientName,
          hrRecipientPhone: job.hrRecipientPhone,
          hrRecipientEmail: job.hrRecipientEmail,
          campaignName: job.campaignName,
        }}
        jobPost={job}
        departmentName={deptName}
      />
    </>
  );
}
