/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Users,
  DollarSign,
  Clock,
  Eye,
  ChevronRight,
  Globe,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  Hash,
  Download,
  BrainCircuit,
  ExternalLink,
  Mail,
  Phone,
  Ban,
  Send,
  Sparkles,
  AlertTriangle,
  FileX,
  UserCheck,
  User,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
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
import ActionButton from "@/components/buttons/ActionButton";
import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { usePermissions } from "@/hooks/usePermissions";
import JobPostPreviewModal from "./JobPostPreviewModal";

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

// ─── STATUS CONFIG (JOB POST STATUS) ──────────────────────────────────────────
const JOB_STATUS_CONFIG: Record<
  JobPostStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  [JobPostStatus.DRAFT]: {
    label: "Bản nháp",
    className: "badge-neutral",
    icon: FileText,
  },
  [JobPostStatus.PENDING_HEAD_APPROVAL]: {
    label: "Chờ Trưởng ban duyệt",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    icon: ShieldCheck,
  },
  [JobPostStatus.PUBLISHED]: {
    label: "Đang tuyển (Published)",
    className: "badge-success",
    icon: CheckCircle,
  },
  [JobPostStatus.CLOSED]: {
    label: "Đã đóng tin",
    className: "badge-danger",
    icon: XCircle,
  },
  [JobPostStatus.ARCHIVED]: {
    label: "Đã lưu trữ",
    className: "bg-slate-200 text-slate-600 border-slate-300",
    icon: Clock,
  },
};

// ─── STATUS CONFIG (APPLICATION PHASE & 3-TIER SCREENING) ─────────────────────
const APPLICATION_STATUS_CONFIG: Record<
  ApplicationPhase,
  { label: string; className: string }
> = {
  [ApplicationPhase.APPLIED]: {
    label: "Mới nộp CV",
    className: "bg-slate-100 text-slate-700 border-slate-200",
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
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  [ApplicationPhase.HIRED]: {
    label: "Đã tuyển dụng",
    className: "bg-teal-100 text-teal-800 border-teal-300 font-semibold",
  },
  [ApplicationPhase.WITHDRAWN]: {
    label: "Rút hồ sơ",
    className: "bg-gray-100 text-gray-500 border-gray-200 italic",
  },
};

// ─── PLATFORM SOURCE BADGE CONFIG ─────────────────────────────────────────────
const PLATFORM_CONFIG: Record<
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

// ─── COMPONENT CARD ỨNG VIÊN PHẲNG (ĐỒNG NHẤT VỚI JOBPOSTDETAILCONTENT) ────────
function JobApplicationDrawerCard({
  app,
  defaultExpanded = false,
  locale,
  onCloseDrawer,
}: {
  app: any;
  defaultExpanded?: boolean;
  locale: string;
  onCloseDrawer: () => void;
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
  const appAiScore = hasAppAiScore ? app.aiScore : 85;

  const appTierConfig =
    app.aiTier === AiScreeningTier.HIGH || appAiScore >= 80
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
    onCloseDrawer();
    router.push(`/${locale}/ats/candidate-management/${candidateId}`);
  };

  return (
    <div className="border-b border-border/50 pb-6 mb-5 last:border-0 last:pb-0 last:mb-0">
      {/* Header Hồ Sơ Ứng Viên (Clickable Toggle) */}
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

      {/* Expanded Content: Thiết kế phẳng, không lồng hộp */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 pt-1">
          {/* Vùng điểm số & Nhận định AI Screening */}
          <div className="space-y-2.5 pb-4 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                    {appAiScore}
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
                {new Date(app.updatedAt || app.createdAt).toLocaleDateString(
                  "vi-VN",
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
                        <th className="py-2 pr-3 font-semibold">
                          Nguồn &amp; Thời gian
                        </th>
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
                            PLATFORM_CONFIG[subPlatform] ||
                            PLATFORM_CONFIG[PlatformSource.MANUAL_ENTRY];

                          const hasSubScore =
                            typeof sub.aiScore === "number" && sub.aiScore >= 0;
                          const subScore = hasSubScore
                            ? sub.aiScore
                            : appAiScore;
                          const subTier = sub.aiTier || app.aiTier;

                          const subTierConfig =
                            subTier === AiScreeningTier.HIGH || subScore >= 80
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
                                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                                    <Clock size={9} />
                                    {new Date(sub.createdAt).toLocaleString(
                                      "vi-VN",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      },
                                    )}
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
                                        className="font-medium text-foreground group-hover:text-primary transition-colors truncate block max-w-[180px]"
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
                                    {subScore}%
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
                                            Thời điểm nộp:{" "}
                                            {new Date(
                                              sub.createdAt,
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
                  onCloseDrawer();
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

interface JobPostDrawerProps {
  jobPostId: string | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  onNavigateDetail?: () => void;
}

export default function JobPostDrawer({
  jobPostId,
  isOpen,
  onClose,
  locale,
  onNavigateDetail,
}: JobPostDrawerProps) {
  const router = useRouter();
  const { userPerms } = usePermissions();

  const [openSections, setOpenSections] = useState({
    overview: true,
    details: true,
    applications: true,
  });
  const [showPreview, setShowPreview] = useState(false);

  const { data: jobRes, isLoading } = useGetJobPostByIdQuery(
    jobPostId as string,
    {
      skip: !isOpen || !jobPostId,
    },
  );
  const job = jobRes?.data;

  const [publishJobPost, { isLoading: isPublishing }] =
    usePublishJobPostMutation();
  const [closeJobPost, { isLoading: isClosing }] = useCloseJobPostMutation();

  // ── PHÂN QUYỀN RBAC ──
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

  if (!isOpen) return null;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const deptName = getDeptName(job?.recruitmentRequest?.department);

  const statusCfg =
    JOB_STATUS_CONFIG[job?.status as JobPostStatus] ||
    JOB_STATUS_CONFIG[JobPostStatus.DRAFT];
  const StatusIcon = statusCfg.icon;

  const title = job?.publicTitle || "Chi tiết tin tuyển dụng";
  const avatarText = job?.jobCode
    ? job.jobCode.slice(-3)
    : title.slice(0, 2).toUpperCase();

  const salaryDisplay = job?.isSalaryNegotiable
    ? "Thỏa thuận"
    : job?.salaryMin
      ? `${(job.salaryMin / 1000000).toFixed(0)}M - ${(job.salaryMax / 1000000).toFixed(0)}M VNĐ`
      : "Theo thỏa thuận";

  const applications = job?.applications || [];
  const targetPlatforms = job?.targetPlatforms || [];

  const handlePublish = async () => {
    if (!job?.id) return;
    try {
      await publishJobPost({
        id: job.id,
        body: {
          targetPlatforms: targetPlatforms.length
            ? targetPlatforms
            : [PlatformSource.LINKEDIN],
          bypassHeadApproval: true,
        },
      }).unwrap();
      gooeyToast.success("Bản tin đã được xuất bản thành công!");
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi khi xuất bản bài đăng.");
    }
  };

  const handleClose = async () => {
    if (!job?.id) return;
    try {
      await closeJobPost(job.id).unwrap();
      gooeyToast.success("Đã đóng tin tuyển dụng thành công.");
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi đóng tin tuyển dụng.");
    }
  };

  const handleOpenDetail = () => {
    onClose();
    if (onNavigateDetail) {
      onNavigateDetail();
    } else if (job?.id) {
      router.push(`/${locale}/ats/jobs-management/${job.id}`);
    }
  };

  return (
    <>
      <DetailDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={`[${job?.jobCode || "JOB"}] · ${deptName}`}
        headerClassName="bg-primary text-primary-foreground border-b border-border"
        icon={
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-mono font-bold text-xs">
            {avatarText}
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-2 w-full flex-wrap">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer shadow-xs"
            >
              <Eye size={13} /> Xem trước
            </button>

            <div className="flex items-center gap-2">
              {job?.status === JobPostStatus.PUBLISHED && canClose && (
                <ActionButton
                  variant="destructive"
                  className="text-xs h-9 px-3.5"
                  allowedPermissions={[
                    "ats_job_post:delete:any",
                    "ats_job_post:update:any",
                    "ats:jobs:manage",
                  ]}
                  permissionBehavior="hide"
                  requireConfirm={true}
                  confirmTitle="Đóng tin tuyển dụng"
                  confirmMessage="Bạn có chắc chắn muốn đóng tin tuyển dụng này? Toàn bộ kênh phân phối sẽ ngừng tiếp nhận hồ sơ mới."
                  confirmLabel="Xác nhận đóng tin"
                  cancelLabel="Hủy"
                  isLoading={isClosing}
                  onAction={handleClose}
                >
                  <Ban size={13} className="mr-1" /> Đóng tin
                </ActionButton>
              )}

              {(job?.status === JobPostStatus.DRAFT ||
                job?.status === JobPostStatus.PENDING_HEAD_APPROVAL) &&
                canPublish && (
                  <ActionButton
                    variant="primary"
                    className="text-xs h-9 px-3.5 bg-blue-600 hover:bg-blue-700"
                    allowedPermissions={[
                      "ats_job_post:update:any",
                      "ats_job_post:create:any",
                      "ats:jobs:publish",
                      "ats:jobs:manage",
                    ]}
                    permissionBehavior="hide"
                    isLoading={isPublishing}
                    onAction={handlePublish}
                  >
                    <Send size={13} className="mr-1.5" /> Đăng tuyển
                  </ActionButton>
                )}

              <button
                type="button"
                onClick={handleOpenDetail}
                className="btn-primary text-xs h-9 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Xem chi tiết</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Clock className="animate-spin text-primary" size={20} />
            <span className="text-xs">Đang nạp thông tin tuyển dụng...</span>
          </div>
        ) : !job ? (
          <div className="p-8 text-center text-muted-foreground italic">
            Không tìm thấy thông tin bản tin tuyển dụng.
          </div>
        ) : (
          <>
            {/* ─── SECTION 1: TỔNG QUAN TIN TUYỂN DỤNG ─── */}
            <DrawerSection
              title="Tổng quan vị trí tuyển dụng"
              icon={<Briefcase size={14} />}
              isExpanded={openSections.overview}
              onToggle={() => toggleSection("overview")}
            >
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}
                  >
                    <StatusIcon size={12} />
                    {statusCfg.label}
                  </span>

                  {typeof job.headcount === "number" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 ">
                      <Users size={11} /> {job.headcount} nhân sự
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <UserCheck size={11} />{" "}
                    {applications.length || job.applicationsCount || 0} ứng viên
                    nộp đơn
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      icon: <Hash size={12} />,
                      label: "Mã tin tuyển dụng",
                      value: job.jobCode || "—",
                    },
                    {
                      icon: <Building2 size={12} />,
                      label: "Phòng ban phụ trách",
                      value: deptName,
                    },
                    {
                      icon: <Briefcase size={12} />,
                      label: "Cấp bậc",
                      value: `${job.level} (${job.experienceYears} năm KN)`,
                    },
                    {
                      icon: <Clock size={12} />,
                      label: "Hình thức làm việc",
                      value: `${job.jobType} (${job.workingModel})`,
                    },
                    {
                      icon: <Calendar size={12} />,
                      label: "Hạn nộp hồ sơ",
                      value: job.applicationDeadline
                        ? new Date(job.applicationDeadline).toLocaleDateString(
                            "vi-VN",
                          )
                        : "—",
                    },
                    {
                      icon: <Layers size={12} />,
                      label: "Yêu cầu tuyển dụng gốc",
                      value:
                        job.recruitmentRequest?.requestCode || "Tạo trực tiếp",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-muted/30 rounded-lg p-2.5"
                    >
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        {item.icon}
                        <span className="text-[10px]">{item.label}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 ">
                  <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <DollarSign size={13} /> Định biên lương bổng
                  </p>
                  <div className="text-xs font-bold text-emerald-700 ">
                    {salaryDisplay}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Globe size={11} className="text-primary" /> Kênh phát sóng
                    bài đăng ({targetPlatforms.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetPlatforms.length > 0 ? (
                      targetPlatforms.map((p: PlatformSource) => {
                        const pCfg = PLATFORM_CONFIG[p] || {
                          label: p,
                          bg: "bg-primary/10",
                          text: "text-primary",
                        };
                        return (
                          <span
                            key={p}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${pCfg.bg} ${pCfg.text}`}
                          >
                            {pCfg.label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground text-[11px] italic">
                        Chưa chọn kênh phân phối bài đăng.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* ─── SECTION 2: MÔ TẢ & TIÊU CHUẨN NĂNG LỰC ─── */}
            <DrawerSection
              title="Mô tả & Tiêu chuẩn tuyển dụng"
              icon={<FileText size={14} />}
              isExpanded={openSections.details}
              onToggle={() => toggleSection("details")}
            >
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Mô tả công việc (Trích yếu)
                  </p>
                  <div className="text-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/50 whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
                    {job.jobDescription || "Chưa có nội dung mô tả công việc."}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Kỹ năng cốt lõi (Must-Have)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.mustHaveSkills?.length ? (
                      job.mustHaveSkills.map((sk: string) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium border border-primary/20"
                        >
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">
                        Không có yêu cầu kỹ năng cụ thể
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      Học vấn tối thiểu:
                    </span>
                    <span className="font-semibold text-foreground">
                      {job.minEducation || "Đại học"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      Người tiếp nhận hồ sơ:
                    </span>
                    <span className="font-semibold text-foreground">
                      {job.hrRecipientName || "HR Chính Nam"}
                    </span>
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* ─── SECTION 3: HỒ SƠ ỨNG TUYỂN (THIẾT KẾ PHẲNG) ─── */}
            <DrawerSection
              title={`Hồ sơ ứng tuyển (${applications.length})`}
              icon={<Users size={14} />}
              isExpanded={openSections.applications}
              onToggle={() => toggleSection("applications")}
            >
              <div className="space-y-3 text-xs">
                {applications.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-1">
                    <Users
                      size={20}
                      className="text-muted-foreground mx-auto opacity-40"
                    />
                    <p className="font-medium text-foreground text-xs">
                      Chưa có ứng viên nộp hồ sơ
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Các hồ sơ ứng tuyển từ Website, TopCV, LinkedIn và các
                      kênh phân phối sẽ tự động xuất hiện tại đây.
                    </p>
                  </div>
                ) : (
                  applications.map((app: any, idx: number) => (
                    <JobApplicationDrawerCard
                      key={app.id}
                      app={app}
                      defaultExpanded={idx === 0}
                      locale={locale}
                      onCloseDrawer={onClose}
                    />
                  ))
                )}
              </div>
            </DrawerSection>
          </>
        )}
      </DetailDrawer>

      {/* Modal xem trước bài đăng (JobPostPreviewModal) */}
      {job && (
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
      )}
    </>
  );
}
