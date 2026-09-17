/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
  ChevronRight,
  User,
  Briefcase,
  Clock,
  Sparkles,
  AlertTriangle,
  BrainCircuit,
  Download,
  ExternalLink,
  Globe,
  ChevronUp,
  ChevronDown,
  Layers,
  FileX,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";
import { gooeyToast } from "@/components/ui/goey-toaster";
import {
  ApplicationPhase,
  PlatformSource,
  AiScreeningTier,
  useGetCandidateByIdQuery,
  useDeleteSubmissionCvMutation,
  useRescreenApplicationMutation,
} from "@/lib/store/atsApiSlice";

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
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200 ",
    bulletColor: "text-emerald-600",
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
    className: "bg-amber-100 text-amber-700 border-amber-200 ",
  },
  [ApplicationPhase.SCREENING_FAILED]: {
    label: "Lỗi sàng lọc",
    className: "bg-orange-100 text-orange-800 border-orange-300 font-semibold ",
  },
  [ApplicationPhase.SHORTLISTED]: {
    label: "Xuất sắc (Tier 1)",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold ",
  },
  [ApplicationPhase.SAVED_POOL]: {
    label: "Kho tiềm năng (Tier 2)",
    className: "bg-blue-100 text-blue-700 border-blue-200 ",
  },
  [ApplicationPhase.SCREENING_REJECTED]: {
    label: "Không đạt (Tier 3)",
    className: "bg-rose-100 text-rose-700 border-rose-200 ",
  },
  [ApplicationPhase.INTERVIEWING]: {
    label: "Phỏng vấn",
    className: "bg-purple-100 text-purple-700 border-purple-200 font-semibold ",
  },
  [ApplicationPhase.OFFERED]: {
    label: "Đề nghị tuyển dụng",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200 ",
  },
  [ApplicationPhase.HIRED]: {
    label: "Đã tuyển dụng",
    className: "bg-teal-100 text-teal-800 border-teal-300 font-semibold",
  },
  [ApplicationPhase.WITHDRAWN]: {
    label: "Rút hồ sơ",
    className: "bg-gray-100 text-gray-500 border-gray-200 italic ",
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

// ─── COMPONENT HỒ SƠ ỨNG TUYỂN PHẲNG (KHÔNG HỘP LỒNG HỘP) ──────────────────────
function CandidateApplicationCard({
  app,
  defaultExpanded = false,
  locale,
  candidateId,
  onClose,
}: {
  app: any;
  defaultExpanded?: boolean;
  locale: string;
  candidateId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [deleteCv, { isLoading: isDeletingCv }] =
    useDeleteSubmissionCvMutation();
  const [rescreen, { isLoading: isRescreening }] =
    useRescreenApplicationMutation();

  const handleDeleteCv = async (submissionId: string) => {
    try {
      await deleteCv({ applicationId: app.id, submissionId }).unwrap();
      gooeyToast.success("Đã xóa CV khỏi hệ thống lưu trữ.");
    } catch {
      gooeyToast.error("Xóa CV thất bại. Vui lòng thử lại.");
    }
  };

  const handleRescreen = async () => {
    try {
      await rescreen(app.id).unwrap();
      gooeyToast.success("Đã đưa hồ sơ vào hàng đợi chấm điểm AI lại.");
    } catch {
      gooeyToast.error("Chấm điểm lại thất bại. Vui lòng thử lại.");
    }
  };

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

  const jobTitle = app.jobPost?.publicTitle || "Bản tin tuyển dụng";
  const jobCode = app.jobPost?.jobCode || "JOB";
  const department =
    app.jobPost?.recruitmentRequest?.department?.name || "N/A";

  return (
    <div className="border-b border-border/50 pb-6 mb-5 last:border-0 last:pb-0 last:mb-0">
      {/* 1. Header Đơn ứng tuyển (Clickable Toggle) */}
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {jobCode}
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
          <span className={`badge ${statusInfo.className} text-[10px] border`}>
            {statusInfo.label}
          </span>
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* 2. Expanded Content: Phẳng, tinh tế, không lồng hộp */}
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
                                          onClick={() =>
                                            handleDeleteCv(sub.id)
                                          }
                                          className="p-1 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                                          title="Xóa CV ngay bây giờ"
                                        >
                                          <FileX size={13} />
                                        </button>
                                      )}
                                  </div>
                                </td>
                              </tr>

                              {!isPurged && sub.cvPurgeAt && (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="pb-2 pt-0 px-3"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1.5">
                                      <AlertTriangle
                                        size={11}
                                        className="shrink-0"
                                      />
                                      CV sẽ tự động bị xóa vào{" "}
                                      {new Date(
                                        sub.cvPurgeAt,
                                      ).toLocaleDateString("vi-VN")}
                                      . Cập nhật trạng thái ứng viên để giữ
                                      lại CV.
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* Chi tiết từng lượt nộp phẳng, không đóng khung hộp */}
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
            <div className="text-[11px] text-orange-800 bg-orange-50 border border-orange-200 rounded px-2.5 py-2 flex items-start gap-1.5">
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

              {app.status === ApplicationPhase.SCREENING_FAILED && (
                <button
                  type="button"
                  disabled={isRescreening}
                  onClick={handleRescreen}
                  className="btn-primary text-[11px] h-7 px-2.5 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={12} />
                  {isRescreening ? "Đang gửi..." : "Chấm điểm lại"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
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
      )}
    </div>
  );
}

// ─── MAIN DRAWER COMPONENT ─────────────────────────────────────────────────────
export default function CandidateDrawer({
  candidate: candidateProp,
  candidateId,
  isOpen = true,
  onClose,
  locale = "vi",
}: {
  candidate?: any | null;
  candidateId?: string | null;
  isOpen?: boolean;
  onClose: () => void;
  locale?: string;
}) {
  const router = useRouter();

  const targetId = candidateId || candidateProp?.id;
  const { data: res, isLoading } = useGetCandidateByIdQuery(
    targetId as string,
    {
      skip: !targetId || !!candidateProp,
    },
  );

  const candidate = candidateProp || res?.data;

  const [openSections, setOpenSections] = useState({
    overview: true,
    applicationsList: true,
  });

  if (!isOpen || !targetId) return null;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading || !candidate) {
    return (
      <DetailDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Đang tải..."
        subtitle="Vui lòng đợi"
      >
        <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">
          <Clock className="animate-spin mr-2" size={16} /> Đang nạp thông tin
          ứng viên...
        </div>
      </DetailDrawer>
    );
  }

  const initials = candidate.fullName
    ? candidate.fullName.substring(0, 2).toUpperCase()
    : "UV";

  const applications = candidate.applications || [];
  const firstApp = applications[0];
  const primaryJobTitle =
    firstApp?.jobPost?.publicTitle || "Chưa ứng tuyển vị trí cụ thể";
  const primaryDepartment =
    firstApp?.jobPost?.recruitmentRequest?.department?.name ||
    "Công ty Chính Nam";

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={candidate.fullName}
      subtitle={`[${candidate.id ? candidate.id.slice(-4) : "CAND"}] · ${primaryJobTitle}`}
      headerClassName="bg-card text-foreground border-b border-border shadow-xs"
      icon={
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
          {initials}
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs h-9 px-3.5 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(
                `/${locale}/ats/candidate-management/${candidate.id}`,
              );
            }}
            className="btn-primary text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Trang hồ sơ chi tiết</span>
            <ChevronRight size={14} />
          </button>
        </div>
      }
    >
      {/* ─── SECTION 1: TỔNG QUAN HỒ SƠ ỨNG VIÊN ─── */}
      <DrawerSection
        title="Tổng quan thông tin"
        icon={<User size={14} />}
        isExpanded={openSections.overview}
        onToggle={() => toggleSection("overview")}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                icon: <Mail size={12} />,
                label: "Hộp thư Email",
                value: candidate.email || "—",
              },
              {
                icon: <Phone size={12} />,
                label: "Số điện thoại",
                value: candidate.phone || candidate.phoneNumber || "—",
              },
              {
                icon: <Building2 size={12} />,
                label: "Phòng ban quan tâm",
                value: primaryDepartment,
              },
              {
                icon: <Briefcase size={12} />,
                label: "Kinh nghiệm làm việc",
                value: `${candidate.experienceYears ?? 0} năm`,
              },
              {
                icon: <Calendar size={12} />,
                label: "Ngày tạo hồ sơ",
                value: new Date(candidate.createdAt).toLocaleDateString(
                  "vi-VN",
                ),
              },
              {
                icon: <Layers size={12} />,
                label: "Tổng số vị trí nộp",
                value: `${applications.length} vị trí`,
              },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-2.5">
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

          {candidate.linkedInUrl && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50 text-[11px]">
              <Globe size={13} className="text-primary shrink-0" />
              <span className="text-muted-foreground shrink-0">
                Hồ sơ cá nhân:
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
        </div>
      </DrawerSection>

      {/* ─── SECTION 2: DANH SÁCH ỨNG TUYỂN & CÁC LƯỢT NỘP (SUBMISSIONS) ─── */}
      <DrawerSection
        title={`Tiến trình & Hồ sơ ứng tuyển (${applications.length})`}
        icon={<FileText size={14} />}
        isExpanded={openSections.applicationsList}
        onToggle={() => toggleSection("applicationsList")}
      >
        <div className="space-y-3 text-xs">
          {applications.length > 0 ? (
            applications.map((app: any, index: number) => (
              <CandidateApplicationCard
                key={app.id}
                app={app}
                defaultExpanded={index === 0}
                locale={locale}
                candidateId={candidate.id}
                onClose={onClose}
              />
            ))
          ) : (
            <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/10 space-y-1">
              <FileText
                size={20}
                className="text-muted-foreground mx-auto opacity-40"
              />
              <p className="font-medium text-foreground text-xs">
                Chưa có đơn ứng tuyển
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ứng viên chưa ứng tuyển vào vị trí công việc nào cụ thể.
              </p>
            </div>
          )}
        </div>
      </DrawerSection>
    </DetailDrawer>
  );
}
