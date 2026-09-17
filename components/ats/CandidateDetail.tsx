/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  ChevronLeft,
  GraduationCap,
  Download,
  BrainCircuit,
  Building2,
  Globe,
  ChevronUp,
  ChevronDown,
  X,
  Users,
  Lock,
  Layers,
  FileX,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Award,
  BookOpen,
} from "lucide-react";
import {
  HorizontalDetailLayout,
  HorizontalDetailAccordion,
} from "@/components/layouts/HorizontalDetailLayout";
import ActionButton from "@/components/buttons/ActionButton";
import { usePermissions } from "@/hooks/usePermissions";
import { gooeyToast } from "@/components/ui/goey-toaster";
import {
  useGetCandidateByIdQuery,
  useUpdateApplicationStatusMutation,
  useRescreenApplicationMutation,
  useDeleteSubmissionCvMutation,
  ApplicationPhase,
  APPLICATION_PHASE_TRANSITIONS,
  PlatformSource,
  AiScreeningTier,
} from "@/lib/store/atsApiSlice";

// ─── PHÂN TÍCH VÀ HIỂN THỊ 3 PHẦN AI REASONING PHẲNG ─────────────────────────
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
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200 ",
    bulletColor: "text-emerald-600 ",
    defaultTitle: "1. Điểm mạnh phù hợp",
  },
  missing: {
    icon: AlertCircle,
    border: "border-l-2 border-amber-500",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200 ",
    bulletColor: "text-amber-600 ",
    defaultTitle: "2. Tiêu chí còn thiếu hoặc chưa rõ",
  },
  risk: {
    icon: ShieldAlert,
    border: "border-l-2 border-rose-500",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200 ",
    bulletColor: "text-rose-600 ",
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

// ─── STATUS CONFIGS (Mapped to ApplicationPhase) ──────────────────────────────
const statusBadgeConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  [ApplicationPhase.APPLIED]: {
    label: "Mới ứng tuyển",
    className: "badge-neutral",
    icon: Calendar,
  },
  [ApplicationPhase.AI_SCREENING]: {
    label: "AI Sàng lọc",
    className: "badge-warning",
    icon: BrainCircuit,
  },
  [ApplicationPhase.SCREENING_FAILED]: {
    label: "Lỗi sàng lọc",
    className: "bg-orange-100 text-orange-800 border-orange-300",
    icon: AlertTriangle,
  },
  [ApplicationPhase.SHORTLISTED]: {
    label: "Ứng viên tiềm năng",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: Star,
  },
  [ApplicationPhase.SAVED_POOL]: {
    label: "Kho tài năng (Pool)",
    className: "bg-sky-100 text-sky-700 border-sky-200",
    icon: Users,
  },
  [ApplicationPhase.SCREENING_REJECTED]: {
    label: "Từ chối / Loại",
    className: "badge-danger",
    icon: XCircle,
  },
  [ApplicationPhase.INTERVIEWING]: {
    label: "Phỏng vấn",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Users,
  },
  [ApplicationPhase.OFFERED]: {
    label: "Đề nghị tuyển",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  [ApplicationPhase.HIRED]: {
    label: "Đã tuyển dụng",
    className: "badge-success",
    icon: CheckCircle,
  },
  [ApplicationPhase.WITHDRAWN]: {
    label: "Ứng viên rút đơn",
    className: "bg-slate-200 text-slate-600 border-slate-300",
    icon: Clock,
  },
};

const PLATFORM_CONFIG: Record<
  PlatformSource,
  { label: string; bg: string; text: string }
> = {
  [PlatformSource.LINKEDIN]: {
    label: "LinkedIn",
    bg: "bg-[#0a66c2]/10",
    text: "text-[#0a66c2]",
  },
  [PlatformSource.FACEBOOK]: {
    label: "Facebook",
    bg: "bg-[#1877f2]/10",
    text: "text-[#1877f2]",
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
  [PlatformSource.COMPANY_WEBSITE]: {
    label: "Website",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  [PlatformSource.ZALO]: {
    label: "Zalo",
    bg: "bg-blue-400/10",
    text: "text-blue-500",
  },
  [PlatformSource.REFERRAL]: {
    label: "Giới thiệu",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
  },
  [PlatformSource.MANUAL_ENTRY]: {
    label: "Thủ công",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
};

// ─── PROGRESS TRACKER COMPONENT ────────────────────────────────────────────────
const STATUS_FLOW = [
  { id: ApplicationPhase.APPLIED, label: "Mới ứng tuyển", index: 0 },
  { id: ApplicationPhase.AI_SCREENING, label: "AI Sàng lọc", index: 1 },
  { id: ApplicationPhase.INTERVIEWING, label: "Phỏng vấn", index: 2 },
  { id: ApplicationPhase.OFFERED, label: "Đề nghị (Offer)", index: 3 },
  { id: ApplicationPhase.HIRED, label: "Đã tuyển", index: 4 },
  { id: ApplicationPhase.SCREENING_REJECTED, label: "Từ chối", index: -1 },
];

function ProgressTrackerLine({ currentStage }: { currentStage: string }) {
  const isRejected =
    currentStage === ApplicationPhase.SCREENING_REJECTED ||
    currentStage === ApplicationPhase.WITHDRAWN;
  const isFailed = currentStage === ApplicationPhase.SCREENING_FAILED;
  const currentIndex = isRejected
    ? -1
    : isFailed
      ? 1 // failure happens during the AI_SCREENING step
      : (STATUS_FLOW.find((s) => s.id === currentStage)?.index ?? 0);
  const standardFlow = STATUS_FLOW.filter((s) => s.index >= 0);

  return (
    <div className="relative w-full py-5">
      <div className="absolute top-1/2 left-6 right-6 h-1 -translate-y-1/2 z-0 bg-muted" />
      {!isRejected && (
        <div
          className="absolute top-1/2 left-6 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500"
          style={{
            width: `calc(${(currentIndex / (standardFlow.length - 1)) * 100}% - 48px)`,
          }}
        />
      )}
      <div className="relative z-10 flex justify-between">
        {standardFlow.map((step, i) => {
          const isCompleted = !isRejected && i <= currentIndex;
          const isCurrent = !isRejected && i === currentIndex;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center w-12 group"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-card transition-colors duration-300
                ${isCurrent ? "border-primary shadow-[0_0_0_3px_rgba(var(--primary),0.2)]" : isCompleted ? "border-primary bg-primary" : "border-muted"}
                ${isRejected && i === 0 ? "border-red-500 bg-red-50" : ""}
              `}
              >
                {isCompleted && !isCurrent && (
                  <CheckCircle size={10} className="text-white" />
                )}
                {isRejected && i === 0 && (
                  <X size={10} className="text-red-500" />
                )}
              </div>
              <span
                className={`absolute top-full mt-2 text-[10px] font-medium whitespace-nowrap ${isCurrent ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {isRejected && i === 0 ? "Từ chối" : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMPONENT HỒ SƠ ỨNG VIÊN: THIẾT KẾ PHẲNG & THU GỌN LƯỢT NỘP ──────────────
function ApplicationPipelineCard({
  app,
  defaultExpanded = false,
  locale,
  candidateId,
  canUpdateCandidate,
  onAdvanceStage,
  onRescreen,
}: {
  app: any;
  defaultExpanded?: boolean;
  locale: string;
  candidateId: string;
  canUpdateCandidate: boolean;
  onAdvanceStage: (appId: string, nextStatus: ApplicationPhase) => void;
  onRescreen: (appId: string) => void;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [deleteCv, { isLoading: isDeletingCv }] =
    useDeleteSubmissionCvMutation();

  const handleDeleteCv = async (submissionId: string) => {
    try {
      await deleteCv({ applicationId: app.id, submissionId }).unwrap();
      gooeyToast.success("Đã xóa CV khỏi hệ thống lưu trữ.");
    } catch {
      gooeyToast.error("Xóa CV thất bại. Vui lòng thử lại.");
    }
  };

  const submissionsList: any[] = app.submissions || [];
  const firstSub = submissionsList[0];
  const cvUrl = firstSub?.cvUrl || app.resumeUrl;

  const statusCfg =
    statusBadgeConfig[app.status] ||
    statusBadgeConfig[ApplicationPhase.APPLIED];
  const jobTitle = app.jobPost?.publicTitle || "Chưa có tên Job";
  const department =
    app.jobPost?.recruitmentRequest?.department?.name || "N/A";

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

  return (
    <div className="border-b border-border/50 pb-6 mb-5 last:border-0 last:pb-0 last:mb-0">
      {/* Header (Clickable Toggle) */}
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {app.jobPost?.jobCode || "ATS-JOB"}
            </span>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {jobTitle}
            </h4>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <Building2 size={10} /> {department}
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
          <span className={`badge ${statusCfg.className} text-[10px]`}>
            {statusCfg.label}
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 pt-1">
          {/* Progress Tracker */}
          <div className="px-3 my-2">
            <ProgressTrackerLine currentStage={app.status} />
          </div>

          {/* AI Match Score & Reasoning */}
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
                {new Date(app.updatedAt || app.createdAt).toLocaleDateString(
                  "vi-VN",
                )}
              </span>
            </div>

            <div className="pt-1 max-h-96 overflow-y-auto custom-scrollbar">
              <StructuredAiReasoning content={app.aiReasoning} />
            </div>
          </div>

          {/* Collapsible Submissions Table */}
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
                          Nguồn &amp; Thời gian nộp
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
                                        className="font-medium text-foreground group-hover:text-primary transition-colors truncate block max-w-[200px]"
                                        title={sub.cvFileKey || "Tệp hồ sơ CV"}
                                      >
                                        {sub.cvFileKey || "Hồ sơ ứng viên CV"}
                                      </span>

                                      {isPurged && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200  mt-0.5">
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

                                    {!isPurged &&
                                      app.status ===
                                        ApplicationPhase.SCREENING_REJECTED && (
                                        <button
                                          type="button"
                                          disabled={isDeletingCv}
                                          onClick={() => handleDeleteCv(sub.id)}
                                          className="p-1 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                                          title="Xóa CV ngay bây giờ"
                                        >
                                          <FileX size={13} />
                                        </button>
                                      )}
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

          {app.status === ApplicationPhase.SCREENING_FAILED && (
            <div className="mb-2 text-[11px] text-orange-800 bg-orange-50 border border-orange-200 rounded px-2.5 py-2 flex items-start gap-1.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span>
                {(app.internalHrNotes as string | undefined)?.includes(
                  "[Lỗi sàng lọc tự động]",
                )
                  ? app.internalHrNotes
                  : "Sàng lọc AI thất bại do lỗi kỹ thuật (không phải do CV bị đánh giá thấp). Vui lòng thử chấm điểm lại."}
              </span>
            </div>
          )}

          {app.status === ApplicationPhase.SCREENING_REJECTED &&
            !firstSub?.isCvPurged &&
            firstSub?.cvPurgeAt && (
              <div className="mb-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-2 flex items-start gap-1.5">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>
                  CV sẽ tự động bị xóa vào{" "}
                  {new Date(firstSub.cvPurgeAt).toLocaleDateString("vi-VN")}.
                  Cập nhật trạng thái ứng viên để giữ lại CV.
                </span>
              </div>
            )}

          {/* Action Pipeline Buttons */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {cvUrl && !firstSub?.isCvPurged && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-[11px] h-7 px-2.5 inline-flex items-center gap-1 text-primary cursor-pointer mr-2"
                >
                  <Download size={12} /> Tải bản CV mới nhất
                </a>
              )}

              {!canUpdateCandidate ? (
                <div
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/60 cursor-help"
                  title="Chỉ nhân sự (HR) hoặc người quản lý có thẩm quyền mới có thể chuyển vòng tuyển dụng"
                >
                  <Lock size={11} /> Chế độ chỉ xem tiến trình
                </div>
              ) : (
                <>
                  {app.status === ApplicationPhase.SCREENING_FAILED && (
                    <ActionButton
                      variant="primary"
                      className="text-[11px] h-7 px-2.5"
                      requireConfirm={true}
                      confirmTitle="Chấm điểm lại"
                      confirmMessage="Đưa hồ sơ này vào hàng đợi chấm điểm AI lại?"
                      confirmLabel="Chấm điểm lại"
                      cancelLabel="Hủy"
                      onAction={() => onRescreen(app.id)}
                    >
                      Chấm điểm lại
                    </ActionButton>
                  )}

                  {(() => {
                    const targets =
                      APPLICATION_PHASE_TRANSITIONS[
                        app.status as ApplicationPhase
                      ] || [];
                    if (targets.length === 0) return null;

                    const RISKY_TARGETS = new Set([
                      ApplicationPhase.HIRED,
                      ApplicationPhase.SCREENING_REJECTED,
                      ApplicationPhase.WITHDRAWN,
                    ]);

                    return (
                      <select
                        value=""
                        onChange={(e) => {
                          const next = e.target.value as ApplicationPhase;
                          if (!next) return;
                          if (RISKY_TARGETS.has(next)) {
                            const label =
                              statusBadgeConfig[next]?.label || next;
                            if (
                              !window.confirm(
                                `Bạn có chắc chắn muốn chuyển ứng viên sang trạng thái "${label}"?`,
                              )
                            ) {
                              e.target.value = "";
                              return;
                            }
                          }
                          onAdvanceStage(app.id, next);
                          e.target.value = "";
                        }}
                        className="btn-secondary text-[11px] h-7 px-2 cursor-pointer bg-card"
                      >
                        <option value="">Chuyển đến...</option>
                        {targets.map((target) => (
                          <option key={target} value={target}>
                            {statusBadgeConfig[target]?.label || target}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </>
              )}
            </div>

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
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
type SectionKey = "applications" | "profile" | "experience_education";

export default function CandidateDetail({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();
  const { userPerms } = usePermissions();

  const { data: res, isLoading, refetch } = useGetCandidateByIdQuery(id);
  const candidate = res?.data;

  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [rescreenApplication] = useRescreenApplicationMutation();
  const [activeSection, setActiveSection] =
    useState<SectionKey>("applications");

  // ── PHÂN QUYỀN RBAC CHO TRANG CHI TIẾT CANDIDATE ──
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

  const canUpdateCandidate =
    hasPermission("ats_candidate", "update") ||
    hasPermission("ats_candidate", "approve") ||
    userPerms.includes("ats:candidates:manage") ||
    userPerms.includes("ats:candidates:edit") ||
    userPerms.includes("*:*:any");

  const applications: any[] = useMemo(
    () => candidate?.applications || [],
    [candidate],
  );

  // Trích xuất toàn bộ danh sách tệp CV thực tế từ các đơn ứng tuyển
  const allActualCvs = useMemo(() => {
    const map = new Map<
      string,
      {
        url: string;
        fileName: string;
        jobTitle: string;
        jobCode: string;
        date: string;
        source: string;
        isPurged: boolean;
      }
    >();

    applications.forEach((app: any) => {
      const jobTitle = app.jobPost?.publicTitle || "Bản tin tuyển dụng";
      const jobCode = app.jobPost?.jobCode || "JOB";

      (app.submissions || []).forEach((sub: any) => {
        if (sub.cvUrl || sub.cvFileKey) {
          const key = sub.cvUrl || sub.cvFileKey;
          if (!map.has(key)) {
            map.set(key, {
              url: sub.cvUrl,
              fileName: sub.cvFileKey || "Tệp hồ sơ CV",
              jobTitle,
              jobCode,
              date: sub.createdAt,
              source: sub.platformSource || PlatformSource.COMPANY_WEBSITE,
              isPurged: Boolean(sub.isCvPurged),
            });
          }
        }
      });

      if (app.resumeUrl && !map.has(app.resumeUrl)) {
        map.set(app.resumeUrl, {
          url: app.resumeUrl,
          fileName: "Hồ sơ CV đính kèm",
          jobTitle,
          jobCode,
          date: app.appliedAt || app.createdAt,
          source: app.source || PlatformSource.MANUAL_ENTRY,
          isPurged: false,
        });
      }
    });

    return Array.from(map.values());
  }, [applications]);

  // Dữ liệu thực tế cho Accordion 3 (Kinh nghiệm, Học vấn, Chứng chỉ)
  const realExperiences: any[] = useMemo(
    () =>
      candidate?.experiences ||
      candidate?.workExperiences ||
      candidate?.workExperience ||
      [],
    [candidate],
  );

  const realEducations: any[] = useMemo(
    () => candidate?.educations || candidate?.education || [],
    [candidate],
  );

  const realCertificates: any[] = useMemo(
    () => candidate?.certificates || candidate?.certifications || [],
    [candidate],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Clock className="animate-spin mr-2 text-primary" size={20} />
        <span className="text-xs text-muted-foreground">
          Đang tải hồ sơ ứng viên...
        </span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
        <p className="text-sm font-semibold text-foreground">
          Không tìm thấy ứng viên.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/ats/candidate-management`)}
          className="btn-secondary text-xs px-4 py-2 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleAdvanceStage = async (
    applicationId: string,
    nextStatus: ApplicationPhase,
  ) => {
    if (!canUpdateCandidate) {
      gooeyToast.error(
        "Bạn không có thẩm quyền chuyển vòng tuyển dụng của ứng viên này.",
      );
      return;
    }

    try {
      await updateStatus({
        applicationId,
        body: { status: nextStatus },
      }).unwrap();
      gooeyToast.success(
        `Đã chuyển trạng thái ứng viên sang: ${statusBadgeConfig[nextStatus]?.label || nextStatus}`,
      );
      refetch();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi cập nhật vòng tuyển dụng.");
    }
  };

  const handleRescreen = async (applicationId: string) => {
    if (!canUpdateCandidate) {
      gooeyToast.error(
        "Bạn không có thẩm quyền chấm điểm lại hồ sơ ứng viên này.",
      );
      return;
    }

    try {
      await rescreenApplication(applicationId).unwrap();
      gooeyToast.success("Đã đưa hồ sơ vào hàng đợi chấm điểm AI lại.");
      refetch();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi chấm điểm lại hồ sơ.");
    }
  };

  return (
    <HorizontalDetailLayout
      sidebar={{
        defaultCollapsed: false,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center py-4 px-1 space-y-4 text-xs select-none">
              <div
                className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-xs cursor-default"
                title={candidate.fullName}
              >
                {candidate.fullName
                  ? candidate.fullName.slice(0, 2).toUpperCase()
                  : "UV"}
              </div>

              <div className="w-5 h-px bg-border/60" />

              <div
                className="flex flex-col items-center text-center group cursor-help py-1"
                title={`Tổng vị trí đã nộp: ${applications.length} vị trí`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center transition-colors">
                  <Briefcase size={14} />
                </div>
                <span className="font-mono font-bold text-[12px] text-primary mt-1 leading-none">
                  {applications.length}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  Đơn
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-6 text-xs overflow-y-auto max-h-screen custom-scrollbar">
              {/* Candidate Header */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-border/60">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-2.5 border border-primary/20 shadow-sm">
                  {candidate.fullName.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="font-bold text-foreground text-sm leading-snug">
                  {candidate.fullName}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {candidate.headline || "Hồ sơ ứng viên"}
                </p>
              </div>

              {/* Contact details */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Thông tin liên hệ
                </p>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Mail
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-foreground truncate">
                      {candidate.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-foreground">
                      {candidate.phone || candidate.phoneNumber || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-foreground">
                      {candidate.location || "Chưa cập nhật địa điểm"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Applications Counter */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Tổng vị trí đã ứng tuyển
                </p>
                <p className="text-2xl font-black text-primary font-mono">
                  {applications.length}
                </p>
              </div>
            </div>
          ),
      }}
      sidePanel={null}
      footer={
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/ats/candidate-management`)}
            className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={13} /> Danh sách ứng viên
          </button>
          <div className="text-xs text-muted-foreground">
            Hồ sơ cập nhật:{" "}
            {candidate.updatedAt
              ? new Date(candidate.updatedAt).toLocaleDateString("vi-VN")
              : "N/A"}
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-row min-w-0 bg-card overflow-hidden shadow-sm h-full w-full">
        {/* ========================================================================= */}
        {/* ACCORDION 1: TIẾN TRÌNH ỨNG TUYỂN & ĐÁNH GIÁ AI PHẲNG                     */}
        {/* ========================================================================= */}
        <HorizontalDetailAccordion
          title={`1. Đợt ứng tuyển & Tiến trình AI (${applications.length})`}
          icon={<Briefcase size={14} />}
          isExpanded={activeSection === "applications"}
          onToggle={() => setActiveSection("applications")}
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
                  Chưa có dữ liệu ứng tuyển
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Ứng viên chưa nộp đơn vào vị trí công việc nào cụ thể trong hệ
                  thống.
                </p>
              </div>
            ) : (
              applications.map((app: any, idx: number) => (
                <ApplicationPipelineCard
                  key={app.id}
                  app={app}
                  defaultExpanded={idx === 0}
                  locale={locale}
                  candidateId={candidate.id}
                  canUpdateCandidate={canUpdateCandidate}
                  onAdvanceStage={handleAdvanceStage}
                  onRescreen={handleRescreen}
                />
              ))
            )}
          </div>
        </HorizontalDetailAccordion>

        {/* ========================================================================= */}
        {/* ACCORDION 2: NĂNG LỰC & KỸ NĂNG (DỮ LIỆU THỰC TẾ 100%)                    */}
        {/* ========================================================================= */}
        <HorizontalDetailAccordion
          title="2. Năng lực & Kỹ năng"
          icon={<GraduationCap size={14} />}
          isExpanded={activeSection === "profile"}
          onToggle={() => setActiveSection("profile")}
          expandedWidth="lg:flex-1 lg:min-w-[540px]"
          collapsedWidth="lg:w-12"
        >
          <div className="space-y-5 max-w-2xl text-xs leading-relaxed p-1">
            {/* Tóm tắt tiểu sử */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText size={13} className="text-primary" /> Tóm tắt tiểu sử
              </h4>
              {candidate.bio ? (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {candidate.bio}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px] pl-1">
                  Ứng viên chưa cập nhật phần giới thiệu bản thân.
                </p>
              )}
            </div>

            {/* Kỹ năng chuyên môn */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Star size={13} className="text-primary" /> Kỹ năng chuyên môn
              </h4>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((sk: string) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-md bg-muted text-foreground text-[11px] font-medium border border-border/60"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px] pl-1">
                  Chưa có danh sách kỹ năng được phân loại.
                </p>
              )}
            </div>

            {/* Liên kết cá nhân / Portfolio thực tế */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe size={13} className="text-primary" /> Liên kết hồ sơ
                &amp; Portfolio
              </h4>
              <div className="space-y-2">
                {candidate.linkedInUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                    <span className="font-semibold text-foreground w-24 shrink-0">
                      LinkedIn:
                    </span>
                    <a
                      href={candidate.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {candidate.linkedInUrl}
                    </a>
                  </div>
                )}
                {candidate.portfolioUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                    <span className="font-semibold text-foreground w-24 shrink-0">
                      Portfolio:
                    </span>
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {candidate.portfolioUrl}
                    </a>
                  </div>
                )}
                {candidate.githubUrl && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                    <span className="font-semibold text-foreground w-24 shrink-0">
                      GitHub:
                    </span>
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {candidate.githubUrl}
                    </a>
                  </div>
                )}
                {!candidate.linkedInUrl &&
                  !candidate.portfolioUrl &&
                  !candidate.githubUrl && (
                    <p className="text-muted-foreground italic text-[11px] pl-1">
                      Chưa đính kèm đường dẫn hồ sơ trực tuyến.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </HorizontalDetailAccordion>

        {/* ========================================================================= */}
        {/* ACCORDION 3: KINH NGHIỆM, HỌC VẤN & TOÀN BỘ TỆP CV THỰC TẾ               */}
        {/* ========================================================================= */}
        <HorizontalDetailAccordion
          title="3. Quá trình làm việc & Học vấn"
          icon={<BookOpen size={14} />}
          isExpanded={activeSection === "experience_education"}
          onToggle={() => setActiveSection("experience_education")}
          expandedWidth="lg:flex-1 lg:min-w-[540px]"
          collapsedWidth="lg:w-12"
        >
          <div className="space-y-6 max-w-2xl text-xs leading-relaxed p-1">
            {/* 1. Lịch sử kinh nghiệm công tác */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Briefcase size={13} className="text-primary" /> Kinh nghiệm
                  làm việc
                </h4>
                {typeof candidate.experienceYears === "number" && (
                  <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {candidate.experienceYears} năm kinh nghiệm
                  </span>
                )}
              </div>

              {realExperiences.length > 0 ? (
                <div className="space-y-3">
                  {realExperiences.map((exp: any, eIdx: number) => (
                    <div
                      key={exp.id || eIdx}
                      className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-xs text-foreground">
                            {exp.position || exp.title || "Vị trí chuyên môn"}
                          </p>
                          <p className="text-[11px] font-medium text-primary">
                            {exp.company ||
                              exp.companyName ||
                              "Đơn vị công tác"}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {exp.startDate || ""} -{" "}
                          {exp.isCurrent ? "Hiện tại" : exp.endDate || ""}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-[11px] text-foreground/85 whitespace-pre-wrap pt-1 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px] pl-1">
                  Chưa có dữ liệu phân rã từng vị trí công tác cụ thể trong hồ
                  sơ.
                </p>
              )}
            </div>

            {/* 2. Quá trình học vấn & Bằng cấp */}
            <div className="space-y-3 pt-3 border-t border-border/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <GraduationCap size={13} className="text-primary" /> Quá trình
                học vấn &amp; Đào tạo
              </h4>

              {realEducations.length > 0 ? (
                <div className="space-y-3">
                  {realEducations.map((edu: any, edIdx: number) => (
                    <div
                      key={edu.id || edIdx}
                      className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-xs text-foreground">
                            {edu.school || edu.institution || "Cơ sở đào tạo"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {edu.degree || "Bằng cấp"}
                            {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                          </p>
                        </div>
                        {(edu.startDate || edu.endDate) && (
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                            {edu.startDate || ""} - {edu.endDate || ""}
                          </span>
                        )}
                      </div>
                      {edu.description && (
                        <p className="text-[11px] text-foreground/80 pt-1 leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px] pl-1">
                  Chưa cập nhật thông tin học vấn chính quy.
                </p>
              )}
            </div>

            {/* 3. Chứng chỉ nghề nghiệp (nếu có) */}
            {realCertificates.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-border/50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Award size={13} className="text-primary" /> Chứng chỉ nghề
                  nghiệp
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {realCertificates.map((cert: any, cIdx: number) => (
                    <div
                      key={cert.id || cIdx}
                      className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex flex-col justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-foreground">
                          {cert.name || "Chứng chỉ"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {cert.issuer || "Đơn vị cấp"}
                        </p>
                      </div>
                      {cert.issueDate && (
                        <span className="text-[9px] font-mono text-muted-foreground mt-1">
                          Ngày cấp: {cert.issueDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Toàn bộ tệp hồ sơ CV đã nộp thực tế */}
            <div className="space-y-2.5 pt-3 border-t border-border/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers size={13} className="text-primary" /> Tệp CV &amp; Tài
                liệu đã nộp ({allActualCvs.length})
              </h4>

              {allActualCvs.length > 0 ? (
                <div className="divide-y divide-border/40 border border-border/60 rounded-xl overflow-hidden">
                  {allActualCvs.map((cvItem, cvIdx) => (
                    <div
                      key={cvIdx}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {cvItem.isPurged ? (
                          <FileX size={15} className="text-rose-500 shrink-0" />
                        ) : (
                          <FileText
                            size={15}
                            className="text-primary shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-foreground truncate max-w-[240px]">
                            {cvItem.fileName}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {cvItem.jobTitle} [{cvItem.jobCode}] · Nộp:{" "}
                            {new Date(cvItem.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cvItem.isPurged ? (
                          <span className="text-[10px] text-rose-600 bg-rose-50  px-2 py-0.5 rounded border border-rose-200">
                            Đã xóa S3
                          </span>
                        ) : cvItem.url ? (
                          <a
                            href={cvItem.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary text-[11px] h-7 px-2.5 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} /> Tải CV
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11px] pl-1">
                  Chưa có tệp CV đính kèm nào được ghi nhận trên hệ thống.
                </p>
              )}
            </div>
          </div>
        </HorizontalDetailAccordion>
      </div>
    </HorizontalDetailLayout>
  );
}
