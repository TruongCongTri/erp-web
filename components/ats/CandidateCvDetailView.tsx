/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ExternalLink,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  Layers,
  Lock,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
  FileX,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";

import { gooeyToast } from "@/components/ui/goey-toaster";
import { usePermissions } from "@/hooks/usePermissions";
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
import {
  SearchableSelect,
  SelectOption,
} from "@/components/buttons/SearchableSelect";
import { DownloadCvButton } from "@/components/buttons/DownloadCvButton";

// ─── PHÂN TÍCH VÀ HIỂN THỊ 3 PHẦN AI REASONING PHẲNG CHO TỪNG BẢN CV ──────────
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
        Chưa có nhận định đánh giá chuyên môn chi tiết cho bản CV này.
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

// ─── CẤU TRÚC ĐỊNH DANH MỖI BẢN CV KÈM DỮ LIỆU ĐỘC LẬP ────────────────────────
interface CandidateCvItem {
  id: string; // submissionId hoặc appId-resume
  applicationId: string;
  jobTitle: string;
  jobCode: string;
  cvUrl: string;
  cvFileKey: string;
  cvFileName: string;
  source: PlatformSource | string;
  uploadedAt: string;
  versionIndex: number;
  aiScore: number | null;
  aiTier: AiScreeningTier | string | null;
  aiReasoning: string | null;
  coverLetter?: string | null;
  isCvPurged?: boolean;
  matchedSkills?: string[];
  missingSkills?: string[];
  submission?: any;
}

const APPLICATION_STATUS_CONFIG: Record<
  ApplicationPhase,
  { label: string; className: string }
> = {
  [ApplicationPhase.APPLIED]: {
    label: "Mới nộp CV",
    className: "badge-neutral",
  },
  [ApplicationPhase.AI_SCREENING]: {
    label: "AI Sàng lọc CV",
    className: "badge-warning",
  },
  [ApplicationPhase.SCREENING_FAILED]: {
    label: "Lỗi sàng lọc",
    className: "bg-orange-100 text-orange-800 border-orange-300 font-semibold",
  },
  [ApplicationPhase.SHORTLISTED]: {
    label: "Ứng viên tiềm năng",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  [ApplicationPhase.SAVED_POOL]: {
    label: "Kho tài năng (Pool)",
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  [ApplicationPhase.SCREENING_REJECTED]: {
    label: "Từ chối / Loại",
    className: "badge-danger",
  },
  [ApplicationPhase.INTERVIEWING]: {
    label: "Phỏng vấn",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  [ApplicationPhase.OFFERED]: {
    label: "Đề nghị tuyển dụng",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  [ApplicationPhase.HIRED]: {
    label: "Đã tuyển dụng",
    className: "badge-success",
  },
  [ApplicationPhase.WITHDRAWN]: {
    label: "Ứng viên rút đơn",
    className: "bg-slate-200 text-slate-600 border-slate-300",
  },
};

export default function CandidateCvDetailView({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userPerms } = usePermissions();

  const querySubmissionId = searchParams.get("submissionId");
  const queryAppId = searchParams.get("appId");
  const queryCvUrl = searchParams.get("cvUrl");

  const { data: res, isLoading, refetch } = useGetCandidateByIdQuery(id);
  const candidate = res?.data;

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateApplicationStatusMutation();
  const [rescreenApplication, { isLoading: isRescreening }] =
    useRescreenApplicationMutation();
  const [deleteCv, { isLoading: isDeletingCv }] =
    useDeleteSubmissionCvMutation();

  const [hrNote, setHrNote] = useState("");

  // Presigned URL state for secure iframe preview
  const [presignedViewerUrl, setPresignedViewerUrl] = useState<string | null>(
    null,
  );
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Phân quyền RBAC
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

  // 1. TỔNG HỢP TOÀN BỘ CÁC BẢN CV
  const allCvItems = useMemo<CandidateCvItem[]>(() => {
    if (!candidate) return [];
    const list: CandidateCvItem[] = [];
    const applications = candidate.applications || [];

    applications.forEach((app: any) => {
      const jobTitle = app.jobPost?.publicTitle || "Vị trí ứng tuyển";
      const jobCode = app.jobPost?.jobCode || "JOB";

      if (app.submissions && app.submissions.length > 0) {
        app.submissions.forEach((sub: any, sIdx: number) => {
          if (sub.cvUrl || sub.cvFileKey) {
            const hasScore =
              typeof sub.aiScore === "number" && sub.aiScore >= 0;
            const fileKey = sub.cvFileKey || sub.cvUrl || "";

            list.push({
              id: sub.id || `${app.id}-sub-${sIdx}`,
              applicationId: app.id,
              jobTitle,
              jobCode,
              cvUrl: sub.cvUrl,
              cvFileKey: fileKey,
              cvFileName:
                sub.originalFileName ||
                sub.cvFileName ||
                (fileKey.includes("/") ? fileKey.split("/").pop()! : fileKey) ||
                `CV_${jobCode}_v${sIdx + 1}.pdf`,
              source: sub.platformSource || PlatformSource.COMPANY_WEBSITE,
              uploadedAt: new Date(
                sub.createdAt || app.appliedAt || app.createdAt,
              ).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              versionIndex: sIdx + 1,
              aiScore: hasScore ? sub.aiScore : (app.aiScore ?? null),
              aiTier: sub.aiTier || app.aiTier || null,
              aiReasoning: sub.aiReasoning || app.aiReasoning || null,
              coverLetter: sub.coverLetter || null,
              isCvPurged: Boolean(sub.isCvPurged),
              matchedSkills:
                sub.matchedSkills || sub.skills || candidate.skills || [],
              missingSkills: sub.missingSkills || [],
              submission: sub,
            });
          }
        });
      }

      if (app.resumeUrl) {
        const isDuplicate = list.some((item) => item.cvUrl === app.resumeUrl);
        if (!isDuplicate) {
          const hasScore = typeof app.aiScore === "number" && app.aiScore >= 0;
          const fileKey = app.resumeFileKey || app.resumeUrl;

          list.push({
            id: `${app.id}-resume`,
            applicationId: app.id,
            jobTitle,
            jobCode,
            cvUrl: app.resumeUrl,
            cvFileKey: fileKey,
            cvFileName:
              app.originalFileName ||
              (fileKey.includes("/") ? fileKey.split("/").pop()! : fileKey) ||
              `CV_${jobCode}_Direct.pdf`,
            source: app.source || PlatformSource.MANUAL_ENTRY,
            uploadedAt: new Date(app.appliedAt || app.createdAt).toLocaleString(
              "vi-VN",
              {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            ),
            versionIndex: 1,
            aiScore: hasScore ? app.aiScore : null,
            aiTier: app.aiTier || null,
            aiReasoning: app.aiReasoning || null,
            coverLetter: null,
            isCvPurged: false,
            matchedSkills: candidate.skills || [],
            missingSkills: [],
            submission: null,
          });
        }
      }
    });

    return list;
  }, [candidate]);

  const cvSelectOptions = useMemo<SelectOption<string>[]>(
    () =>
      allCvItems.map((c) => ({
        value: c.id,
        label: c.cvFileName,
        description: `[${c.jobCode}] ${c.source} · Nộp: ${c.uploadedAt}${
          typeof c.aiScore === "number" ? ` · ${c.aiScore}đ` : ""
        }`,
        icon: <FileText size={14} className="text-primary shrink-0" />,
      })),
    [allCvItems],
  );

  // 2. XÁC ĐỊNH BẢN CV ĐANG ĐƯỢC CHỌN (ACTIVE CV)
  const [selectedCvId, setSelectedCvId] = useState<string>("");

  useEffect(() => {
    if (allCvItems.length === 0) return;

    if (querySubmissionId) {
      const match = allCvItems.find((c) => c.id === querySubmissionId);
      if (match) {
        setSelectedCvId(match.id);
        return;
      }
    }

    if (queryCvUrl) {
      const match = allCvItems.find((c) => c.cvUrl === queryCvUrl);
      if (match) {
        setSelectedCvId(match.id);
        return;
      }
    }

    if (queryAppId) {
      const match = allCvItems.find((c) => c.applicationId === queryAppId);
      if (match) {
        setSelectedCvId(match.id);
        return;
      }
    }

    if (!selectedCvId && allCvItems[0]) {
      setSelectedCvId(allCvItems[0].id);
    }
  }, [allCvItems, querySubmissionId, queryAppId, queryCvUrl, selectedCvId]);

  const activeCv = useMemo(() => {
    return allCvItems.find((c) => c.id === selectedCvId) || allCvItems[0];
  }, [allCvItems, selectedCvId]);

  // 3. TẠO URL XEM PDF TRỰC TIẾP QUA S3 PRE-SIGNED URL
  useEffect(() => {
    let isMounted = true;
    if (!activeCv || activeCv.isCvPurged) {
      setPresignedViewerUrl(null);
      return;
    }

    async function fetchViewerUrl() {
      setLoadingPreview(true);
      try {
        const key = activeCv?.cvFileKey || activeCv?.cvUrl;
        if (!key) {
          setPresignedViewerUrl(null);
          return;
        }

        // Call Next.js endpoint for pre-signed view URL
        const res = await fetch(
          `/api/cv?key=${encodeURIComponent(key)}&action=view`,
        );
        if (!res.ok) throw new Error("Không thể ký URL S3");
        const data = await res.json();
        if (isMounted && data.url) {
          setPresignedViewerUrl(data.url);
        }
      } catch (err: any) {
        gooeyToast.error(`Không thể tải bản xem trước CV: ${err.message}`);
        if (isMounted) setPresignedViewerUrl(activeCv?.cvUrl || null);
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    }

    fetchViewerUrl();

    return () => {
      isMounted = false;
    };
  }, [activeCv]);

  const activeApp = useMemo(() => {
    if (!candidate?.applications) return null;
    return (
      candidate.applications.find(
        (a: any) => a.id === activeCv?.applicationId,
      ) || candidate.applications[0]
    );
  }, [candidate, activeCv]);

  const handleSelectCv = (newCvId: string | null) => {
    if (!newCvId) return;
    setSelectedCvId(newCvId);
    const target = allCvItems.find((c) => c.id === newCvId);
    if (target) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("submissionId", target.id);
      params.set("appId", target.applicationId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleAdvanceStage = async (nextPhase: ApplicationPhase) => {
    if (!canUpdateCandidate) {
      gooeyToast.error(
        "Bạn không có quyền cập nhật tiến trình tuyển dụng cho ứng viên này.",
      );
      return;
    }

    if (!activeApp?.id) return;

    try {
      await updateStatus({
        applicationId: activeApp.id,
        body: {
          status: nextPhase,
          note: hrNote.trim() || undefined,
        },
      }).unwrap();

      gooeyToast.success(
        `Đã chuyển trạng thái sang: ${APPLICATION_STATUS_CONFIG[nextPhase]?.label || nextPhase}`,
      );
      setHrNote("");
      refetch();
    } catch (err: any) {
      gooeyToast.error(
        err?.data?.message || "Lỗi cập nhật tiến trình tuyển dụng.",
      );
    }
  };

  const handleRescreen = async () => {
    if (!canUpdateCandidate) {
      gooeyToast.error(
        "Bạn không có thẩm quyền chấm điểm lại hồ sơ ứng viên này.",
      );
      return;
    }
    if (!activeApp?.id) return;

    try {
      await rescreenApplication(activeApp.id).unwrap();
      gooeyToast.success("Đã đưa hồ sơ vào hàng đợi chấm điểm AI lại.");
      refetch();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi chấm điểm lại hồ sơ.");
    }
  };

  const handleDeleteCv = async (submissionId: string) => {
    if (!activeApp?.id) return;
    try {
      await deleteCv({
        applicationId: activeApp.id,
        submissionId,
      }).unwrap();
      gooeyToast.success("Đã xóa CV khỏi hệ thống lưu trữ.");
      refetch();
    } catch {
      gooeyToast.error("Xóa CV thất bại. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Clock className="animate-spin text-primary mr-2" size={20} />
        <span className="text-xs text-muted-foreground">
          Đang tải hồ sơ CV ứng viên...
        </span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
        <AlertTriangle size={32} className="text-amber-500" />
        <p className="text-sm font-semibold text-foreground">
          Không tìm thấy ứng viên.
        </p>
        <button
          onClick={() => router.push(`/${locale}/ats/candidate-management`)}
          className="btn-secondary text-xs px-4 py-2 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const statusCfg =
    APPLICATION_STATUS_CONFIG[activeApp?.status as ApplicationPhase] ||
    APPLICATION_STATUS_CONFIG[ApplicationPhase.APPLIED];

  const hasActiveAiScore =
    typeof activeCv?.aiScore === "number" && activeCv.aiScore >= 0;
  const activeAiScore = hasActiveAiScore ? (activeCv!.aiScore as number) : null;
  const activeAiTier = hasActiveAiScore
    ? activeCv?.aiTier || activeApp?.aiTier || null
    : null;

  const activeTierConfig =
    activeAiScore === null
      ? {
          bg: "bg-muted text-muted-foreground",
          label: "Tier N/A",
        }
      : activeAiTier === AiScreeningTier.HIGH || activeAiScore >= 80
        ? { bg: "bg-emerald-500 text-white", label: "Tier 1 (Xuất sắc)" }
        : activeAiTier === AiScreeningTier.MEDIUM || activeAiScore >= 50
          ? { bg: "bg-amber-500 text-white", label: "Tier 2 (Kho tiềm năng)" }
          : { bg: "bg-rose-500 text-white", label: "Tier 3 (Không đạt sơ bộ)" };

  const matchedSkillsList =
    activeCv?.matchedSkills && activeCv.matchedSkills.length > 0
      ? activeCv.matchedSkills
      : candidate.skills && candidate.skills.length > 0
        ? candidate.skills
        : [];

  const missingSkillsList =
    activeCv?.missingSkills && activeCv.missingSkills.length > 0
      ? activeCv.missingSkills
      : [];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* ─── TOP CONTROL BAR ─── */}
      <div className="flex-shrink-0 px-4 md:px-6 py-2.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(`/${locale}/ats/candidate-management/${id}`)
            }
            className="btn-secondary text-xs h-8 px-2.5 flex items-center gap-1.5 cursor-pointer shadow-xs text-foreground hover:text-primary"
            title="Về trang chi tiết hồ sơ ứng viên này"
          >
            <User size={13} className="text-primary" />
            <span className="hidden sm:inline">Hồ sơ ứng viên</span>
          </button>

          <div className="min-w-0 pl-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm md:text-base font-bold text-foreground truncate">
                {candidate.fullName}
              </h1>
              <span className={`badge ${statusCfg.className} text-[10px]`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Vị trí đang đánh giá:{" "}
              <strong className="text-foreground">
                {activeApp?.jobPost?.publicTitle || "Bản tin tuyển dụng"}
              </strong>{" "}
              ({activeApp?.jobPost?.jobCode || "JOB"})
            </p>
          </div>
        </div>

        {/* BỘ CHỌN LINK CV TÍCH HỢP SEARCHABLE SELECT VÀ REUSABLE DOWNLOAD BUTTON */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              Chọn bản CV:
            </span>
            <div className="w-[260px] md:w-[340px]">
              <SearchableSelect
                options={cvSelectOptions}
                value={selectedCvId}
                onChange={handleSelectCv}
                placeholder="Chọn bản CV..."
                searchPlaceholder="Tìm theo tên file, mã tin hoặc vị trí..."
              />
            </div>
          </div>

          {!activeCv?.isCvPurged && (
            <DownloadCvButton
              fileKey={activeCv?.cvFileKey}
              fallbackUrl={presignedViewerUrl || activeCv?.cvUrl}
              fileName={activeCv?.cvFileName || `${candidate.fullName}_CV.pdf`}
              variant="primary"
            />
          )}
        </div>
      </div>

      {/* ─── MAIN 2-COLUMN SPLIT CANVAS ─── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* CỘT TRÁI: DOCUMENT PREVIEW (PDF EMBED VIA SIGNED URL) */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/20 h-full overflow-hidden">
          <div className="px-4 py-2 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 truncate">
              {activeCv?.isCvPurged ? (
                <FileX size={14} className="text-rose-500 shrink-0" />
              ) : (
                <FileText size={14} className="text-primary shrink-0" />
              )}
              <span className="font-semibold text-foreground truncate max-w-[280px]">
                {activeCv?.cvFileName || "Tập tin CV"}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                (Kênh: {activeCv?.source || "Hệ thống"} - Nộp lúc:{" "}
                {activeCv?.uploadedAt || "N/A"})
              </span>
              {activeCv?.isCvPurged && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shrink-0">
                  <AlertTriangle size={9} /> Đã xóa S3
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {presignedViewerUrl && !activeCv?.isCvPurged && (
                <a
                  href={presignedViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium shrink-0"
                >
                  <span>Mở tab mới</span>
                  <ExternalLink size={12} />
                </a>
              )}

              {!activeCv?.isCvPurged &&
                activeApp?.status === ApplicationPhase.SCREENING_REJECTED && (
                  <button
                    type="button"
                    disabled={isDeletingCv}
                    onClick={() => activeCv?.id && handleDeleteCv(activeCv.id)}
                    className="text-rose-600 hover:underline inline-flex items-center gap-1 font-medium shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <FileX size={12} />
                    <span>Xóa CV ngay</span>
                  </button>
                )}
            </div>
          </div>

          {!activeCv?.isCvPurged && activeCv?.submission?.cvPurgeAt && (
            <div className="px-4 py-1.5 border-b border-border bg-amber-50 text-amber-700 text-[10px] flex items-center gap-1.5 shrink-0">
              <AlertTriangle size={11} className="shrink-0" />
              CV sẽ tự động bị xóa vào{" "}
              {new Date(activeCv.submission.cvPurgeAt).toLocaleDateString(
                "vi-VN",
              )}
              . Cập nhật trạng thái ứng viên để giữ lại CV.
            </div>
          )}

          <div className="flex-1 bg-neutral-900/5 relative overflow-hidden flex items-center justify-center">
            {loadingPreview ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin text-primary" size={24} />
                <span className="text-xs font-medium">
                  Đang tải tài liệu PDF...
                </span>
              </div>
            ) : activeCv?.isCvPurged ? (
              <div className="flex flex-col items-center gap-2 text-center p-6 text-rose-600">
                <FileX size={40} className="opacity-80" />
                <p className="text-xs font-bold">
                  Tệp CV đã bị xóa khỏi kho lưu trữ S3
                </p>
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  Theo chính sách bảo vệ dữ liệu (Data Retention), tệp CV điểm
                  thấp đã được tự động loại bỏ. Nhận định AI vẫn được lưu giữ
                  đầy đủ ở cột bên phải.
                </p>
              </div>
            ) : presignedViewerUrl ? (
              <iframe
                src={`${presignedViewerUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border border-border"
                title="CV Document Preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-6 text-muted-foreground">
                <FileText size={36} className="opacity-40" />
                <p className="text-xs font-semibold">
                  Bản ghi này chưa có đường dẫn tệp CV.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: AI EVALUATION RIÊNG BIỆT CHO BẢN CV ĐANG CHỌN */}
        <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 bg-card flex flex-col h-full overflow-y-auto custom-scrollbar border-l border-border/60 divide-y divide-border/60">
          {/* Điểm AI Match riêng của bản CV */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BrainCircuit size={14} className="text-primary" /> Đánh giá AI
                (Bản CV này)
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTierConfig.bg}`}
              >
                {activeTierConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 items-center bg-muted/20 p-3.5 rounded-xl border border-border/60">
              <div className="flex flex-col items-center justify-center text-center border-r border-border/60 pr-2">
                <span className="text-2xl font-black font-mono text-foreground">
                  {activeAiScore === null ? "N/A" : activeAiScore}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                  Điểm phù hợp
                </span>
              </div>
              <div className="col-span-2 text-[11px] leading-relaxed text-muted-foreground pl-1">
                Đánh giá mức độ tương thích giữa kinh nghiệm trong tệp{" "}
                <strong className="text-foreground">
                  {activeCv?.cvFileName}
                </strong>{" "}
                với tiêu chuẩn tuyển dụng vị trí{" "}
                <strong className="text-foreground">
                  {activeCv?.jobTitle}
                </strong>
                .
              </div>
            </div>

            {/* Thư giới thiệu (Cover Letter) nếu lượt nộp này có kèm */}
            {activeCv?.coverLetter && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MessageSquare size={11} className="text-primary" /> Thư ứng
                  tuyển (Cover Letter)
                </p>
                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {activeCv.coverLetter}
                </p>
              </div>
            )}

            {/* Nhận định AI chi tiết 3 phần theo đúng bản CV */}
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles size={11} /> Chi tiết phân tích chuyên môn
              </p>
              <StructuredAiReasoning content={activeCv?.aiReasoning} />
            </div>

            {/* Kỹ năng trích xuất từ CV */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <CheckCircle2 size={12} /> Kỹ năng đã xác thực trên CV
                </p>
                <div className="flex flex-wrap gap-1">
                  {matchedSkillsList.length > 0 ? (
                    matchedSkillsList.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] italic text-muted-foreground">
                      N/A
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <AlertTriangle size={12} /> Tiêu chí cần kiểm tra thêm khi
                  phỏng vấn
                </p>
                <div className="flex flex-wrap gap-1">
                  {missingSkillsList.length > 0 ? (
                    missingSkillsList.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] italic text-muted-foreground">
                      N/A
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin hồ sơ ứng viên kèm nút liên kết đến trang hồ sơ */}
          <div className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Thông tin liên hệ ứng viên
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(`/${locale}/ats/candidate-management/${id}`)
                }
                className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Đến trang hồ sơ chi tiết ứng viên"
              >
                <span>Trang hồ sơ</span>
                <ExternalLink size={11} />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2.5">
                <Mail size={13} className="text-muted-foreground shrink-0" />
                <span className="text-foreground truncate">
                  {candidate.email}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-mono">
                <Phone size={13} className="text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {candidate.phoneNumber || candidate.phone || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={13} className="text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {candidate.location || "Chưa cập nhật địa điểm"}
                </span>
              </div>
              {candidate.linkedInUrl && (
                <div className="flex items-center gap-2.5">
                  <Globe size={13} className="text-muted-foreground shrink-0" />
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
          </div>

          {/* Điều phối vòng tuyển dụng & Ghi chú HR */}
          <div className="p-5 space-y-3 text-xs flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Đánh giá &amp; Chuyển vòng ứng viên
            </p>

            {!canUpdateCandidate ? (
              <div
                className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 p-3 rounded-xl border border-border/60"
                title="Chỉ nhân sự hoặc người quản lý có thẩm quyền mới có thể chuyển vòng tuyển dụng"
              >
                <Lock size={14} className="shrink-0 text-muted-foreground" />
                <span>
                  Bạn đang ở chế độ xem thẩm định (Read-Only). Quyền chuyển vòng
                  tuyển dụng thuộc về bộ phận Nhân sự (HR).
                </span>
              </div>
            ) : (
              <>
                {activeApp?.status === ApplicationPhase.SCREENING_FAILED && (
                  <div className="mb-1 text-[11px] text-orange-800 bg-orange-50 border border-orange-200 rounded px-2.5 py-2 flex items-start gap-1.5">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    <span>
                      {(
                        activeApp?.internalHrNotes as string | undefined
                      )?.includes("[Lỗi sàng lọc tự động]")
                        ? activeApp.internalHrNotes
                        : "Sàng lọc AI thất bại do lỗi kỹ thuật (không phải do CV bị đánh giá thấp)."}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {activeApp?.status === ApplicationPhase.SCREENING_FAILED && (
                    <button
                      type="button"
                      onClick={handleRescreen}
                      disabled={isRescreening}
                      className="btn-primary text-[11px] h-7 px-2.5 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles size={12} />
                      {isRescreening ? "Đang gửi..." : "Chấm điểm lại"}
                    </button>
                  )}

                  {(() => {
                    const targets =
                      APPLICATION_PHASE_TRANSITIONS[
                        activeApp?.status as ApplicationPhase
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
                        disabled={isUpdatingStatus}
                        onChange={(e) => {
                          const next = e.target.value as ApplicationPhase;
                          if (!next) return;
                          if (RISKY_TARGETS.has(next)) {
                            const label =
                              APPLICATION_STATUS_CONFIG[next]?.label || next;
                            if (
                              !window.confirm(
                                `Bạn có chắc chắn muốn chuyển ứng viên sang trạng thái "${label}"?`,
                              )
                            ) {
                              e.target.value = "";
                              return;
                            }
                          }
                          handleAdvanceStage(next);
                          e.target.value = "";
                        }}
                        className="btn-secondary text-[11px] h-7 px-2 cursor-pointer bg-card disabled:opacity-50"
                      >
                        <option value="">Chuyển đến...</option>
                        {targets.map((target) => (
                          <option key={target} value={target}>
                            {APPLICATION_STATUS_CONFIG[target]?.label || target}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <textarea
                  rows={3}
                  value={hrNote}
                  onChange={(e) => setHrNote(e.target.value)}
                  placeholder="Ghi chú đánh giá sau khi duyệt bản CV này..."
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring custom-scrollbar resize-none"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
