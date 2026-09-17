/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Sparkles,
  Globe,
  Clock,
  Trash2,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  Send,
  Activity,
  CheckCircle2,
  Briefcase,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Lock,
  Wand2,
  FileCheck2,
  Edit3,
  X as CloseIcon,
  Save,
  GraduationCap,
  ArrowRight,
  Check,
  Ban,
  UserCheck,
  FastForward,
  Eye,
  Copy,
  Share2,
  Calendar,
  CheckSquare,
  Square,
  Inbox,
} from "lucide-react";

import {
  HorizontalDetailLayout,
  HorizontalDetailAccordion,
} from "@/components/layouts/HorizontalDetailLayout";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { usePermissions } from "@/hooks/usePermissions";
import { SearchableSelect, SelectOption } from "../buttons/SearchableSelect";

// ─── RTK QUERY HOOKS & ATS TYPES ──────────────────────────────────────────────
import {
  useGetRecruitmentRequestByIdQuery,
  useUpdateRecruitmentRequestMutation,
  useReviewRecruitmentRequestMutation,
  useCancelRecruitmentRequestMutation,
  useAiSuggestJdMutation,
  useGetJobTemplatesQuery,
  useCreateJobPostMutation,
  useUpdateJobPostMutation,
  useRequestJobApprovalMutation,
  useReviewJobByHeadMutation,
  usePublishJobPostMutation,
  useCloseJobPostMutation,
  useSyncAtsEventsQuery,
  RecruitmentRequestStatus,
  JobPostStatus,
  PlatformSource,
  JobLevel,
  JobType,
  WorkingModel,
  CandidateGender,
  EducationLevel,
  JobPostCreationMethod,
  JobPost,
  RecruitmentRequest,
} from "@/lib/store/atsApiSlice";

import JobPostPreviewModal from "@/components/ats/JobPostPreviewModal";
import { DropdownActionButton } from "../buttons/DropdownActionButton";
import AutomationChannelsPanel, {
  AutomationChannelsPanelHandle,
} from "@/components/ats/publishing/AutomationChannelsPanel";

type SectionKey = "general" | "description" | "expectations" | "contact";
type CreationMode = "choose" | "ai_flat" | "template_flat" | "editor";

const DEFAULT_DEADLINE = new Date(Date.now() + 30 * 86400000)
  .toISOString()
  .split("T")[0];

const getInitialFormData = (jobPost: JobPost | null | undefined) => {
  if (jobPost) {
    return {
      publicTitle: jobPost.publicTitle || "",
      specialization: jobPost.specialization || "Kỹ thuật Xây dựng / EPC",
      domainKnowledge: jobPost.domainKnowledge || "Dân dụng & Công nghiệp",
      level: jobPost.level || JobLevel.SENIOR,
      jobType: jobPost.jobType || JobType.FULL_TIME,
      workingModel: jobPost.workingModel || WorkingModel.ON_SITE,
      salaryMin: jobPost.salaryMin ?? 15000000,
      salaryMax: jobPost.salaryMax ?? 25000000,
      isSalaryNegotiable: jobPost.isSalaryNegotiable ?? false,
      jobDescription: jobPost.jobDescription || "",
      requirements: jobPost.requirements || "",
      benefits: jobPost.benefits || "",
      extraBenefits: jobPost.extraBenefits || "",
      workLocations: jobPost.workLocations || [
        {
          label: "Trụ sở chính",
          address:
            "255/56T Nguyễn Văn Tiên, khu phố 11A, phường Tân Triều, TP. Đồng Nai",
        },
      ],
      workingHoursStandard:
        jobPost.workingHoursStandard || "Thứ 2 – Thứ 6: 07:30 – 17:00",
      workingHoursDetail:
        jobPost.workingHoursDetail ||
        "Nghỉ trưa 11h30 – 13h00; Thứ 7: 07:30 - 11:30",
      minEducation: jobPost.minEducation || EducationLevel.BACHELOR,
      experienceYears: jobPost.experienceYears ?? 3,
      gender: jobPost.gender || CandidateGender.ANY,
      ageMin: jobPost.ageMin ?? 24,
      ageMax: jobPost.ageMax ?? 35,
      mustHaveSkills: jobPost.mustHaveSkills || ["Revit", "AutoCAD", "BIM 360"],
      niceToHaveSkills: jobPost.niceToHaveSkills || [
        "Tiếng Anh giao tiếp",
        "Navisworks",
      ],
      languages: jobPost.languages || ["Tiếng Việt", "Tiếng Anh"],
      applicationDeadline: jobPost.applicationDeadline
        ? new Date(jobPost.applicationDeadline).toISOString().split("T")[0]
        : DEFAULT_DEADLINE,
      headcount: jobPost.headcount ?? 1,
      hrRecipientName: jobPost.hrRecipientName || "TD Chính Nam",
      hrRecipientPhone: jobPost.hrRecipientPhone || "0937546739",
      hrRecipientEmail: jobPost.hrRecipientEmail || "talent@chinhnambkd.vn",
      campaignName:
        jobPost.campaignName || "Chiến dịch tuyển dụng Kỹ sư EPC 2026",
    };
  }

  return {
    publicTitle: "",
    specialization: "Kỹ thuật Xây dựng / EPC",
    domainKnowledge: "Dân dụng & Công nghiệp",
    level: JobLevel.SENIOR,
    jobType: JobType.FULL_TIME,
    workingModel: WorkingModel.ON_SITE,
    salaryMin: 15000000,
    salaryMax: 25000000,
    isSalaryNegotiable: false,
    jobDescription: "",
    requirements: "",
    benefits: "",
    extraBenefits: "",
    workLocations: [
      {
        label: "Trụ sở chính",
        address:
          "255/56T Nguyễn Văn Tiên, khu phố 11A, phường Tân Triều, TP. Đồng Nai",
      },
    ],
    workingHoursStandard: "Thứ 2 – Thứ 6: 07:30 – 17:00",
    workingHoursDetail: "Nghỉ trưa 11h30 – 13h00; Thứ 7: 07:30 - 11:30",
    minEducation: EducationLevel.BACHELOR,
    experienceYears: 3,
    gender: CandidateGender.ANY,
    ageMin: 24,
    ageMax: 35,
    mustHaveSkills: ["Revit", "AutoCAD", "BIM 360"],
    niceToHaveSkills: ["Tiếng Anh giao tiếp", "Navisworks"],
    languages: ["Tiếng Việt", "Tiếng Anh"],
    applicationDeadline: DEFAULT_DEADLINE,
    headcount: 1,
    hrRecipientName: "TD Chính Nam",
    hrRecipientPhone: "0937546739",
    hrRecipientEmail: "talent@chinhnambkd.vn",
    campaignName: "Chiến dịch tuyển dụng Kỹ sư EPC 2026",
  };
};

function RecruitmentRequestDetailInner({
  req,
  jobPost,
  id,
  refetchReq,
}: {
  req: RecruitmentRequest;
  jobPost?: JobPost | null;
  id: string;
  locale: string;
  refetchReq: () => void;
}) {
  const router = useRouter();
  const { userPerms } = usePermissions();

  const hasPermission = useMemo(() => {
    return (resource: string, action: string): boolean => {
      if (userPerms.includes("*:*:any")) return true;
      return userPerms.some((perm) => {
        const parts = perm.split(":");
        if (parts.length < 2) return false;
        const [r, a] = parts;
        return (r === "*" || r === resource) && (a === "*" || a === action);
      });
    };
  }, [userPerms]);

  // Phân quyền chi tiết RBAC
  const canCreateJd = hasPermission("ats_job_post", "create");
  const canRequestJdApproval = hasPermission("ats_job_post", "update");
  const canManageJd = canCreateJd || canRequestJdApproval;

  const canApprove =
    hasPermission("ats_requisition", "approve") ||
    hasPermission("ats_job_post", "approve");
  const canPublishJob =
    hasPermission("ats_job_post", "update") ||
    hasPermission("ats_job_post", "create");
  const canCloseJob =
    hasPermission("ats_job_post", "update") ||
    hasPermission("ats_job_post", "delete");
  const canCancelRequisition =
    hasPermission("ats_requisition", "update") ||
    hasPermission("ats_requisition", "delete");

  const { data: templatesRes } = useGetJobTemplatesQuery();

  const [updateRecruitmentRequest, { isLoading: isUpdatingReq }] =
    useUpdateRecruitmentRequestMutation();
  const [reviewRequest, { isLoading: isReviewingReq }] =
    useReviewRecruitmentRequestMutation();
  const [cancelRequest, { isLoading: isCancelling }] =
    useCancelRecruitmentRequestMutation();

  const [aiSuggestJd, { isLoading: isAiGenerating }] = useAiSuggestJdMutation();
  const [createJobPost, { isLoading: isCreatingJd }] =
    useCreateJobPostMutation();
  const [updateJobPost, { isLoading: isUpdatingJd }] =
    useUpdateJobPostMutation();
  const [requestJobApproval, { isLoading: isRequestingApproval }] =
    useRequestJobApprovalMutation();
  const [reviewJobByHead, { isLoading: isReviewingJobByHead }] =
    useReviewJobByHeadMutation();
  const [publishJobPost] = usePublishJobPostMutation();
  const [closeJobPost, { isLoading: isClosingJob }] = useCloseJobPostMutation();

  // Nhận diện trạng thái tiến trình
  const isPendingApproval =
    jobPost?.status === JobPostStatus.PENDING_HEAD_APPROVAL ||
    req?.status === RecruitmentRequestStatus.PENDING_HEAD_APPROVAL;

  const isApprovedOrReady =
    jobPost?.status === JobPostStatus.DRAFT &&
    req?.status === RecruitmentRequestStatus.APPROVED;

  const isLockedOrPublished =
    jobPost?.status === JobPostStatus.PUBLISHED ||
    jobPost?.status === JobPostStatus.CLOSED ||
    req?.status === RecruitmentRequestStatus.COMPLETED ||
    req?.status === RecruitmentRequestStatus.CANCELLED;

  // Điều kiện kiểm tra quyền xem bản thảo của Trưởng ban (Head Dept)
  const canViewDraftedJd = Boolean(
    jobPost &&
    (isPendingApproval ||
      isApprovedOrReady ||
      isLockedOrPublished ||
      req?.status === RecruitmentRequestStatus.APPROVED),
  );

  // Trưởng ban không có quyền tạo/sửa JD và JD chưa được gửi duyệt -> Hiển thị Pending for fill-in
  const showPendingFillin = !canManageJd && !canViewDraftedJd;

  const isFormDisabled =
    !canManageJd ||
    isAiGenerating ||
    isPendingApproval ||
    isApprovedOrReady ||
    isLockedOrPublished;

  const [creationMode, setCreationMode] = useState<CreationMode>(
    jobPost || !canManageJd ? "editor" : "choose",
  );
  const [activeSection, setActiveSection] = useState<SectionKey>("general");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const rawNote = req?.rawRequestNote || "";
  const [isEditingRawNote, setIsEditingRawNote] = useState(false);
  const [editedRawNote, setEditedRawNote] = useState(rawNote);

  const [selectedChannels, setSelectedChannels] = useState<PlatformSource[]>(
    () =>
      jobPost?.targetPlatforms?.length
        ? jobPost.targetPlatforms
        : [PlatformSource.LINKEDIN],
  );
  const [scheduleMode, setScheduleMode] = useState<"immediate" | "scheduled">(
    "immediate",
  );
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const automationPanelRef = useRef<AutomationChannelsPanelHandle>(null);
  const [automationChannelsCount, setAutomationChannelsCount] = useState(0);
  const [isAutomationPanelExpanded, setIsAutomationPanelExpanded] =
    useState(false);

  const [formData, setFormData] = useState(() => getInitialFormData(jobPost));

  const [aiFlatPrompt, setAiFlatPrompt] = useState(rawNote);
  const [mustHaveInput, setMustHaveInput] = useState("");
  const [niceToHaveInput, setNiceToHaveInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [newLocation, setNewLocation] = useState({ label: "", address: "" });

  const levelOptions = useMemo<SelectOption<JobLevel>[]>(
    () =>
      Object.values(JobLevel).map((lvl) => ({
        value: lvl,
        label: lvl,
      })),
    [],
  );

  const jobTypeOptions = useMemo<SelectOption<JobType>[]>(
    () =>
      Object.values(JobType).map((jt) => ({
        value: jt,
        label: jt,
      })),
    [],
  );

  const workingModelOptions = useMemo<SelectOption<WorkingModel>[]>(
    () =>
      Object.values(WorkingModel).map((wm) => ({
        value: wm,
        label: wm,
      })),
    [],
  );

  const minEducationOptions = useMemo<SelectOption<EducationLevel>[]>(
    () =>
      Object.values(EducationLevel).map((edu) => ({
        value: edu,
        label: edu,
      })),
    [],
  );

  const genderOptions = useMemo<SelectOption<CandidateGender>[]>(
    () =>
      Object.values(CandidateGender).map((g) => ({
        value: g,
        label: g,
      })),
    [],
  );

  const activeJobPostIdRef = useRef<string | undefined>(jobPost?.id);
  const isInitialMount = useRef(true);
  const hasUserActionRef = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (jobPost?.id) {
      activeJobPostIdRef.current = jobPost.id;
    }
  }, [jobPost?.id]);

  const buildJobPostPayload = (data: typeof formData) => {
    const formattedLocations = (
      data.workLocations && data.workLocations.length > 0
        ? data.workLocations
        : [
            {
              label: "Trụ sở chính",
              address:
                "255/56T Nguyễn Văn Tiên, khu phố 11A, phường Tân Triều, TP. Đồng Nai",
            },
          ]
    ).map((loc: any) => {
      if (typeof loc === "string")
        return { label: "Địa điểm", address: loc.trim() };
      return {
        label: loc.label?.trim() || "Trụ sở",
        address:
          loc.address?.trim() ||
          "255/56T Nguyễn Văn Tiên, khu phố 11A, phường Tân Triều, TP. Đồng Nai",
      };
    });

    const payload: any = {
      creationMethod: JobPostCreationMethod.MANUAL,
      publicTitle:
        data.publicTitle?.trim() ||
        rawNote.split("\n")[0] ||
        "Bản thảo tin tuyển dụng",
      specialization: data.specialization?.trim() || "Kỹ thuật Xây dựng / EPC",
      domainKnowledge: data.domainKnowledge?.trim() || "Dân dụng & Công nghiệp",
      level: data.level || JobLevel.SENIOR,
      jobType: data.jobType || JobType.FULL_TIME,
      workingModel: data.workingModel || WorkingModel.ON_SITE,
      salaryMin: data.isSalaryNegotiable
        ? 0
        : Math.round(Number(data.salaryMin) || 0),
      salaryMax: data.isSalaryNegotiable
        ? 0
        : Math.round(Number(data.salaryMax) || 0),
      isSalaryNegotiable: Boolean(data.isSalaryNegotiable),
      jobDescription:
        data.jobDescription?.trim() || "Mô tả công việc đang soạn thảo...",
      requirements:
        data.requirements?.trim() || "Yêu cầu ứng viên đang soạn thảo...",
      benefits:
        data.benefits?.trim() || "Quyền lợi và chế độ đãi ngộ đang cập nhật...",
      extraBenefits: data.extraBenefits?.trim() || undefined,
      workLocations: formattedLocations,
      workingHoursStandard:
        data.workingHoursStandard?.trim() || "Thứ 2 – Thứ 6: 08:00 – 17:00",
      workingHoursDetail:
        data.workingHoursDetail?.trim() || "Nghỉ trưa 11h30 – 13h00",
      minEducation: data.minEducation || EducationLevel.BACHELOR,
      experienceYears: Math.round(Number(data.experienceYears) || 0),
      gender: data.gender || CandidateGender.ANY,
      ageMin: data.ageMin ? Math.round(Number(data.ageMin)) : undefined,
      ageMax: data.ageMax ? Math.round(Number(data.ageMax)) : undefined,
      mustHaveSkills: data.mustHaveSkills || [],
      niceToHaveSkills: data.niceToHaveSkills || [],
      languages: data.languages || [],
      applicationDeadline: data.applicationDeadline
        ? new Date(data.applicationDeadline).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString(),
      headcount: Math.max(1, Math.round(Number(data.headcount) || 1)),
      hrRecipientName: data.hrRecipientName?.trim() || "TD Chính Nam",
      hrRecipientPhone: data.hrRecipientPhone?.trim() || "0937546739",
      hrRecipientEmail:
        data.hrRecipientEmail?.trim() && data.hrRecipientEmail.includes("@")
          ? data.hrRecipientEmail.trim()
          : "talent@chinhnambkd.vn",
      campaignName: data.campaignName?.trim() || undefined,
      targetPlatforms: selectedChannels?.length
        ? selectedChannels
        : [PlatformSource.LINKEDIN],
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return payload;
  };

  const performSave = async (dataToSave = formData, isSilent = false) => {
    if (!canManageJd || !dataToSave.publicTitle?.trim()) return;
    if (isFormDisabled && !isAiGenerating) return;

    try {
      const payload = buildJobPostPayload(dataToSave);
      const existingId = activeJobPostIdRef.current || jobPost?.id;

      if (existingId) {
        await updateJobPost({ id: existingId, body: payload }).unwrap();
      } else {
        const createRes = await createJobPost({
          recruitmentRequestId: req?.id,
          ...payload,
        }).unwrap();
        if (createRes?.data?.id) {
          activeJobPostIdRef.current = createRes.data.id;
        }
      }

      hasUserActionRef.current = false;

      if (!isSilent) {
        gooeyToast.success(
          existingId
            ? "Đã cập nhật bản thảo tin tuyển dụng!"
            : "Khởi tạo bản tin tuyển dụng thành công!",
        );
      }
      refetchReq();
    } catch (err: any) {
      if (!isSilent) {
        const errorMsg = err?.data?.message;
        const displayMsg = Array.isArray(errorMsg)
          ? errorMsg.join(", ")
          : errorMsg || "Lỗi lưu bản thảo JD.";
        gooeyToast.error(displayMsg);
      }
    }
  };

  // Tự động lưu bản nháp sau 5s chỉnh sửa (chỉ dành cho HR/Admin có quyền canManageJd)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!canManageJd || creationMode !== "editor" || isFormDisabled) {
      return;
    }

    if (!hasUserActionRef.current || !formData.publicTitle?.trim()) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUserActionRef.current) {
        performSave(formData, true);
      }
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, creationMode, isFormDisabled, canManageJd]);

  const generateMarkdownContent = () => {
    const salaryText = formData.isSalaryNegotiable
      ? "Thỏa thuận"
      : `${(formData.salaryMin / 1000000).toFixed(0)} - ${(formData.salaryMax / 1000000).toFixed(0)} triệu VNĐ`;

    const locationsStr = formData.workLocations
      .map((l) => `${l.label}: ${l.address}`)
      .join(" | ");

    return `# 📢 THÔNG BÁO TUYỂN DỤNG: ${formData.publicTitle.toUpperCase()}
**Mã tin:** ${jobPost?.jobCode || req?.requestCode || "ATS-JOB"}
**Đơn vị:** Công ty Cổ phần Thiết kế Xây dựng Chính Nam
**Bộ phận:** ${deptName}
**Mức lương:** ${salaryText}
**Cấp bậc:** ${formData.level} (Kinh nghiệm: ${formData.experienceYears} năm)
**Hình thức làm việc:** ${formData.jobType} (${formData.workingModel})
**Địa điểm:** ${locationsStr}
**Thời gian làm việc:** ${formData.workingHoursStandard} (${formData.workingHoursDetail})

---

### 1. MÔ TẢ CÔNG VIỆC
${formData.jobDescription}

### 2. YÊU CẦU ỨNG VIÊN
${formData.requirements}
* Học vấn: ${formData.minEducation}
* Kỹ năng cốt lõi (Must-Have): ${formData.mustHaveSkills.join(", ")}
* Kỹ năng ưu tiên (Nice-to-Have): ${formData.niceToHaveSkills.join(", ")}
* Ngoại ngữ: ${formData.languages.join(", ")}

### 3. QUYỀN LỢI & ĐÃI NGỘ
${formData.benefits}
${formData.extraBenefits ? `* Chế độ bổ sung: ${formData.extraBenefits}` : ""}

---

### 4. CÁCH THỨC ỨNG TUYỂN
* Hạn nộp hồ sơ: ${formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleDateString("vi-VN") : "—"}
* Đầu mối nhận hồ sơ: ${formData.hrRecipientName}
* Số điện thoại liên hệ: ${formData.hrRecipientPhone}
* Email nhận hồ sơ: ${formData.hrRecipientEmail}

*Ứng viên quan tâm vui lòng gửi CV theo tiêu đề: [Họ tên] - [Vị trí ứng tuyển] về email trên.*`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdownContent();
      await navigator.clipboard.writeText(md);
      gooeyToast.success(
        "Đã sao chép toàn bộ thông tin JD sang định dạng Markdown!",
      );
    } catch {
      gooeyToast.error("Không thể sao chép vào bộ nhớ tạm.");
    }
  };

  const trackerSections = useMemo(() => {
    return [
      {
        key: "general" as SectionKey,
        num: 1,
        title: "1. Thông tin chung",
        subItems: [
          {
            label: "Tiêu đề tin",
            isCompleted: Boolean(formData.publicTitle.trim()),
          },
          {
            label: "Vị trí & Ngành",
            isCompleted: Boolean(
              formData.specialization.trim() && formData.domainKnowledge.trim(),
            ),
          },
          {
            label: "Cấp bậc & Hình thức",
            isCompleted: Boolean(formData.level && formData.workingModel),
          },
          {
            label: "Mức lương định biên",
            isCompleted:
              formData.isSalaryNegotiable ||
              (formData.salaryMin > 0 &&
                formData.salaryMax >= formData.salaryMin),
          },
        ],
      },
      {
        key: "description" as SectionKey,
        num: 2,
        title: "2. Mô tả công việc",
        subItems: [
          {
            label: "Mô tả công việc (JD)",
            isCompleted: Boolean(formData.jobDescription.trim()),
          },
          {
            label: "Yêu cầu ứng viên",
            isCompleted: Boolean(formData.requirements.trim()),
          },
          {
            label: "Quyền lợi ứng viên",
            isCompleted: Boolean(formData.benefits.trim()),
          },
          {
            label: "Địa điểm & Giờ làm",
            isCompleted:
              formData.workLocations.length > 0 &&
              Boolean(formData.workingHoursStandard),
          },
        ],
      },
      {
        key: "expectations" as SectionKey,
        num: 3,
        title: "3. Kỳ vọng ứng viên",
        subItems: [
          {
            label: "Học vấn & Kinh nghiệm",
            isCompleted: Boolean(
              formData.minEducation && formData.experienceYears >= 0,
            ),
          },
          {
            label: "Độ tuổi & Giới tính",
            isCompleted: Boolean(formData.gender),
          },
          {
            label: "Kỹ năng cần có",
            isCompleted: formData.mustHaveSkills.length > 0,
          },
          {
            label: "Ngoại ngữ & Kỹ năng phụ",
            isCompleted: formData.languages.length > 0,
          },
        ],
      },
      {
        key: "contact" as SectionKey,
        num: 4,
        title: "4. Thông tin nhận hồ sơ",
        subItems: [
          {
            label: "Hạn nộp & Số lượng",
            isCompleted: Boolean(
              formData.applicationDeadline && formData.headcount > 0,
            ),
          },
          {
            label: "Người nhận & SĐT",
            isCompleted: Boolean(
              formData.hrRecipientName.trim() &&
              formData.hrRecipientPhone.trim(),
            ),
          },
          {
            label: "Email nhận hồ sơ",
            isCompleted: Boolean(
              formData.hrRecipientEmail.trim() &&
              formData.hrRecipientEmail.includes("@"),
            ),
          },
          {
            label: "Chiến dịch tuyển dụng",
            isCompleted: Boolean(formData.campaignName.trim()),
          },
        ],
      },
    ];
  }, [formData]);

  const overallPercentage = useMemo(() => {
    let total = 0;
    let completed = 0;
    trackerSections.forEach((s) => {
      s.subItems.forEach((sub) => {
        total += 1;
        if (sub.isCompleted) completed += 1;
      });
    });
    return Math.round((completed / total) * 100);
  }, [trackerSections]);

  const activeOptionLabel = useMemo(() => {
    switch (creationMode) {
      case "editor":
        return "Tạo tin thủ công";
      case "ai_flat":
        return "AI gợi ý JD";
      case "template_flat":
        return "Điền từ JD có sẵn";
      default:
        return "";
    }
  }, [creationMode]);

  const handleUpdateRawNote = async () => {
    if (!req || !editedRawNote.trim()) return;
    try {
      await updateRecruitmentRequest({
        id: req.id,
        body: { rawRequestNote: editedRawNote.trim() },
      }).unwrap();
      setIsEditingRawNote(false);
      gooeyToast.success("Đã cập nhật ghi chú nhu cầu tuyển dụng!");
      refetchReq();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi cập nhật ghi chú yêu cầu.");
    }
  };

  const handleRunAiSuggestFlat = async () => {
    try {
      gooeyToast.info(
        "Gemini AI đang tổng hợp và điền các trường tiêu chuẩn...",
      );
      const res = await aiSuggestJd({
        rawPrompt: aiFlatPrompt,
        recruitmentRequestId: req?.id,
      }).unwrap();

      const aiData = res.data;
      const newFormData = {
        ...formData,
        publicTitle:
          aiData.publicTitle || formData.publicTitle || "Kỹ sư Kết cấu",
        specialization: aiData.specialization || formData.specialization,
        domainKnowledge: aiData.domainKnowledge || formData.domainKnowledge,
        level: aiData.level || formData.level,
        jobType: aiData.jobType || formData.jobType,
        workingModel: aiData.workingModel || formData.workingModel,
        salaryMin: aiData.salaryMin ?? formData.salaryMin,
        salaryMax: aiData.salaryMax ?? formData.salaryMax,
        isSalaryNegotiable:
          aiData.isSalaryNegotiable ?? formData.isSalaryNegotiable,
        jobDescription: aiData.jobDescription || formData.jobDescription,
        requirements: aiData.requirements || formData.requirements,
        benefits: aiData.benefits || formData.benefits,
        extraBenefits: aiData.extraBenefits || formData.extraBenefits,
        workLocations: aiData.workLocations?.length
          ? aiData.workLocations
          : formData.workLocations,
        workingHoursStandard:
          aiData.workingHoursStandard || formData.workingHoursStandard,
        workingHoursDetail:
          aiData.workingHoursDetail || formData.workingHoursDetail,
        minEducation: aiData.minEducation || formData.minEducation,
        experienceYears: aiData.experienceYears ?? formData.experienceYears,
        gender: aiData.gender || formData.gender,
        ageMin: aiData.ageMin ?? formData.ageMin,
        ageMax: aiData.ageMax ?? formData.ageMax,
        mustHaveSkills: aiData.mustHaveSkills?.length
          ? aiData.mustHaveSkills
          : formData.mustHaveSkills,
        niceToHaveSkills: aiData.niceToHaveSkills?.length
          ? aiData.niceToHaveSkills
          : formData.niceToHaveSkills,
        languages: aiData.languages?.length
          ? aiData.languages
          : formData.languages,
        headcount: aiData.headcount ?? formData.headcount,
      };

      setFormData(newFormData);
      setCreationMode("editor");
      setActiveSection("general");

      await performSave(newFormData, true);
      gooeyToast.success(
        "AI đã hoàn thành việc điền tự động dữ liệu và lưu bản thảo!",
      );
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi AI sinh bản thảo.");
    }
  };

  const handleSelectTemplate = async (tmpl: any) => {
    const newFormData = {
      ...formData,
      publicTitle: tmpl.publicTitle,
      specialization: tmpl.specialization || formData.specialization,
      domainKnowledge: tmpl.domainKnowledge || formData.domainKnowledge,
      level: tmpl.level || formData.level,
      jobType: tmpl.jobType || formData.jobType,
      workingModel: tmpl.workingModel || formData.workingModel,
      salaryMin: tmpl.salaryMin ?? formData.salaryMin,
      salaryMax: tmpl.salaryMax ?? formData.salaryMax,
      isSalaryNegotiable:
        tmpl.isSalaryNegotiable ?? formData.isSalaryNegotiable,
      jobDescription: tmpl.jobDescription || formData.jobDescription,
      requirements: tmpl.requirements || formData.requirements,
      benefits: tmpl.benefits || formData.benefits,
      extraBenefits: tmpl.extraBenefits || formData.extraBenefits,
      workLocations: tmpl.workLocations || formData.workLocations,
      workingHoursStandard:
        tmpl.workingHoursStandard || formData.workingHoursStandard,
      workingHoursDetail:
        tmpl.workingHoursDetail || formData.workingHoursDetail,
      minEducation: tmpl.minEducation || formData.minEducation,
      experienceYears: tmpl.experienceYears ?? formData.experienceYears,
      mustHaveSkills: tmpl.mustHaveSkills || [],
      niceToHaveSkills: tmpl.niceToHaveSkills || [],
      languages: tmpl.languages || [],
    };

    setFormData(newFormData);
    setCreationMode("editor");
    setActiveSection("general");

    await performSave(newFormData, true);
    gooeyToast.success(`Đã nạp bản mẫu: "${tmpl.publicTitle}" & tự động lưu!`);
  };

  const handleSave = async () => {
    if (!formData.publicTitle.trim()) {
      gooeyToast.error(
        "Vui lòng nhập tiêu đề tin tuyển dụng ở phần Thông tin chung.",
      );
      setActiveSection("general");
      return;
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    await performSave(formData, false);
  };

  const handleSendForApproval = async () => {
    const targetJobId = activeJobPostIdRef.current || jobPost?.id;
    if (!targetJobId) {
      gooeyToast.error("Chưa có bản thảo tin tuyển dụng để gửi duyệt.");
      return;
    }
    try {
      await performSave(formData, true);
      await requestJobApproval(targetJobId).unwrap();
      gooeyToast.success(
        "Đã gửi thông báo yêu cầu Trưởng bộ phận phê duyệt bản thảo JD!",
      );
      refetchReq();
    } catch (err: any) {
      const errorMsg = err?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Lỗi khi gửi yêu cầu duyệt.";
      gooeyToast.error(displayMsg);
    }
  };

  const handleBypassApproval = async () => {
    const targetJobId = activeJobPostIdRef.current || jobPost?.id;
    if (!targetJobId || !req?.id) {
      gooeyToast.error("Không tìm thấy thông tin bản tin để duyệt nhanh.");
      return;
    }
    try {
      await performSave(formData, true);

      await reviewJobByHead({
        id: targetJobId,
        body: {
          isApproved: true,
          reviewNotes: "Bypass phê duyệt trực tiếp bởi Lãnh đạo",
        },
      }).unwrap();

      try {
        await reviewRequest({
          id: req.id,
          body: { status: RecruitmentRequestStatus.APPROVED },
        }).unwrap();
      } catch {
        // Tiếp tục
      }

      gooeyToast.success(
        "Đã phê duyệt nhanh bản thảo JD! Sẵn sàng để xuất bản.",
      );
      refetchReq();
    } catch (err: any) {
      const errorMsg = err?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Lỗi khi thực hiện duyệt nhanh.";
      gooeyToast.error(displayMsg);
    }
  };

  const handleApproveRequisition = async () => {
    if (!req) return;
    try {
      if (jobPost?.id) {
        await reviewJobByHead({
          id: jobPost.id,
          body: { isApproved: true },
        }).unwrap();
      }
      await reviewRequest({
        id: req.id,
        body: { status: RecruitmentRequestStatus.APPROVED },
      }).unwrap();

      gooeyToast.success("Đã phê duyệt yêu cầu tuyển dụng & bản thảo JD!");
      refetchReq();
    } catch (err: any) {
      const errorMsg = err?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Lỗi khi phê duyệt.";
      gooeyToast.error(displayMsg);
    }
  };

  const handleRejectRequisition = async () => {
    if (!req) return;
    if (!rejectionReason.trim()) {
      gooeyToast.error("Vui lòng nhập lý do từ chối yêu cầu tuyển dụng.");
      return;
    }
    try {
      if (jobPost?.id) {
        await reviewJobByHead({
          id: jobPost.id,
          body: {
            isApproved: false,
            reviewNotes: rejectionReason.trim(),
          },
        }).unwrap();
      }
      await reviewRequest({
        id: req.id,
        body: {
          status: RecruitmentRequestStatus.REJECTED,
          rejectionReason: rejectionReason.trim(),
        } as any,
      }).unwrap();

      gooeyToast.info("Đã từ chối yêu cầu tuyển dụng.");
      setShowRejectModal(false);
      refetchReq();
    } catch (err: any) {
      const errorMsg = err?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Lỗi khi xử lý từ chối.";
      gooeyToast.error(displayMsg);
    }
  };

  const totalPublishChannelsCount =
    selectedChannels.length + automationChannelsCount;

  const handleUnifiedPublish = async () => {
    if (!jobPost?.id) return;
    if (totalPublishChannelsCount === 0) {
      throw { message: "Vui lòng chọn ít nhất một kênh để đăng tuyển." };
    }
    if (
      selectedChannels.length > 0 &&
      scheduleMode === "scheduled" &&
      !scheduledPublishAt
    ) {
      throw {
        message: "Vui lòng chọn ngày giờ lên lịch đăng bài cho LinkedIn/Facebook Page.",
      };
    }

    const failures: string[] = [];
    let succeededAny = false;

    if (selectedChannels.length > 0) {
      try {
        await publishJobPost({
          id: jobPost.id,
          body: {
            targetPlatforms: selectedChannels,
            scheduledPublishAt:
              scheduleMode === "scheduled"
                ? new Date(scheduledPublishAt).toISOString()
                : undefined,
            bypassHeadApproval: true,
          },
        }).unwrap();
        succeededAny = true;
      } catch (err: any) {
        const errorMsg = err?.data?.message;
        const displayMsg = Array.isArray(errorMsg)
          ? errorMsg.join(", ")
          : errorMsg || "Lỗi xuất bản LinkedIn/Facebook Page.";
        failures.push(displayMsg);
      }
    }

    if (automationPanelRef.current && automationChannelsCount > 0) {
      const results = await automationPanelRef.current.submit();
      results.forEach((r) => {
        if (r.ok) succeededAny = true;
        else failures.push(`${r.label}: ${r.message}`);
      });
    }

    if (succeededAny) {
      refetchReq();
    }

    if (failures.length > 0) {
      throw {
        type: succeededAny ? "warning" : undefined,
        message: succeededAny
          ? `Đã xuất bản một phần. Kênh lỗi: ${failures.join(" | ")}`
          : failures.join(" | "),
      };
    }

    setShowPublishModal(false);
    return { succeededAny };
  };

  const handleCloseJobPost = async () => {
    if (!jobPost?.id) return;
    try {
      await closeJobPost(jobPost.id).unwrap();
      gooeyToast.success("Đã đóng tin tuyển dụng thành công!");
      refetchReq();
    } catch (err: any) {
      const errorMsg = err?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Lỗi khi đóng tin tuyển dụng.";
      gooeyToast.error(displayMsg);
    }
  };

  const handleCancelRequisition = async () => {
    if (!req) return;
    try {
      await cancelRequest(req.id).unwrap();
      gooeyToast.info("Đã hủy bỏ yêu cầu tuyển dụng.");
      refetchReq();
    } catch (err: any) {
      const errorMsg = err?.data?.message;
      const displayMsg = Array.isArray(errorMsg)
        ? errorMsg.join(", ")
        : errorMsg || "Lỗi hủy yêu cầu.";
      gooeyToast.error(displayMsg);
    }
  };

  const deptObj = req.department;
  const deptName =
    typeof deptObj === "object" && deptObj !== null && "name" in deptObj
      ? (deptObj as any).name
      : typeof deptObj === "string"
        ? deptObj
        : "Chưa gán ban";

  const requestCode = req.requestCode || (req as any).code || id;
  const currentTitle =
    jobPost?.publicTitle ||
    rawNote.split("\n")[0] ||
    `Yêu cầu tuyển dụng [${requestCode}]`;

  const salaryDisplay = formData.isSalaryNegotiable
    ? "Thỏa thuận"
    : `${(formData.salaryMin / 1000000).toFixed(0)} - ${(formData.salaryMax / 1000000).toFixed(0)} triệu VNĐ`;

  return (
    <HorizontalDetailLayout
      sidebar={{
        defaultCollapsed: true,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center py-5 gap-4">
              <div
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-sm cursor-help"
                title={`${currentTitle} - ${deptName}`}
              >
                {requestCode ? requestCode.slice(-3) : "JD"}
              </div>
              <div className="w-8 h-px bg-border my-1" />
              <div
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground cursor-help"
                title={`Phòng ban: ${deptName}`}
              >
                <Building2 size={16} />
              </div>
              <div
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground cursor-help"
                title="Tiến trình tuyển dụng"
              >
                <Activity size={16} />
              </div>
              <div
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground cursor-help"
                title="Metadata & Lịch sử"
              >
                <Clock size={16} />
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-6 fade-in text-xs overflow-y-auto max-h-screen">
              <div className="flex flex-col items-center text-center pb-4 border-b border-border/60">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-mono text-sm font-bold mb-2.5 border border-primary/20 shadow-sm">
                  {requestCode ? requestCode.slice(-4) : "ATS"}
                </div>
                <h2 className="font-bold text-foreground leading-snug line-clamp-2">
                  {currentTitle}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-2.5">
                  {deptName}
                </p>
                <span className="badge badge-neutral text-[10px] font-semibold">
                  {req.status}
                </span>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Chỉ tiêu tuyển dụng
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users size={12} /> Số lượng
                  </span>
                  <span className="font-bold text-foreground">
                    {jobPost?.headcount || 1} nhân sự
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign size={12} /> Định biên lương
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {salaryDisplay}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User size={12} /> Người đề xuất
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[120px]">
                    {req.requester?.fullName || "Dept Head"}
                  </span>
                </div>
              </div>

              {/* Ghi chú gốc */}
              <div className="pt-4 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} className="text-primary" />
                    Ghi chú nhu cầu gốc
                  </span>
                  {canCancelRequisition &&
                    !isEditingRawNote &&
                    !isLockedOrPublished && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditedRawNote(rawNote);
                          setIsEditingRawNote(true);
                        }}
                        className="hover:text-foreground text-primary flex items-center gap-1 cursor-pointer font-medium"
                        title="Chỉnh sửa ghi chú yêu cầu"
                      >
                        <Edit3 size={11} /> Sửa
                      </button>
                    )}
                </div>

                {isEditingRawNote ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={editedRawNote}
                      onChange={(e) => setEditedRawNote(e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background p-2 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring custom-scrollbar"
                      placeholder="Nhập nội dung ghi chú..."
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingRawNote(false)}
                        disabled={isUpdatingReq}
                        className="btn-ghost text-[11px] h-6 px-2 text-muted-foreground cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateRawNote}
                        disabled={isUpdatingReq || !editedRawNote.trim()}
                        className="btn-primary text-[11px] h-6 px-2.5 flex items-center gap-1 cursor-pointer"
                      >
                        <Save size={11} />{" "}
                        {isUpdatingReq ? "Đang lưu..." : "Lưu ghi chú"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {rawNote}
                  </div>
                )}
              </div>

              {/* Quy trình luân chuyển */}
              <div className="pt-4 border-t border-border/60 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Quy trình luân chuyển</span>
                  <Activity size={12} className="text-primary" />
                </p>
                <div className="space-y-3 pt-1">
                  {[
                    {
                      key: RecruitmentRequestStatus.PENDING_HR,
                      label: "Tiếp nhận yêu cầu",
                      desc: "HR nhận yêu cầu từ bộ phận",
                    },
                    {
                      key: RecruitmentRequestStatus.DRAFTED,
                      label: "Soạn thảo JD",
                      desc: "AI / HR chuẩn hóa tiêu chí",
                    },
                    {
                      key: RecruitmentRequestStatus.PENDING_HEAD_APPROVAL,
                      label: "Trưởng ban duyệt",
                      desc: "Lãnh đạo khối thẩm định",
                    },
                    {
                      key: RecruitmentRequestStatus.APPROVED,
                      label: "Sẵn sàng đăng",
                      desc: "Kích hoạt đăng đa kênh",
                    },
                  ].map((step, idx) => {
                    const statusOrder = [
                      RecruitmentRequestStatus.PENDING_HR,
                      RecruitmentRequestStatus.DRAFTED,
                      RecruitmentRequestStatus.PENDING_HEAD_APPROVAL,
                      RecruitmentRequestStatus.APPROVED,
                    ];
                    const currentIdx = statusOrder.indexOf(req.status);
                    const stepIdx = statusOrder.indexOf(step.key);
                    const isDone =
                      currentIdx > stepIdx ||
                      req.status === RecruitmentRequestStatus.COMPLETED;
                    const isCurrent = req.status === step.key;

                    return (
                      <div
                        key={step.key}
                        className="flex items-start gap-2.5 relative"
                      >
                        {idx !== 3 && (
                          <div
                            className={`absolute left-2.5 top-5 w-0.5 h-6 -ml-px ${
                              isDone ? "bg-emerald-500" : "bg-border"
                            }`}
                          />
                        )}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold z-10 ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                                ? "bg-primary text-white ring-2 ring-primary/20"
                                : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {isDone ? <Check size={11} /> : idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[11px] ${
                              isCurrent
                                ? "font-bold text-foreground"
                                : isDone
                                  ? "font-medium text-foreground/90"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông số metadata */}
              <div className="pt-4 border-t border-border/60 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Thông số kiểm soát</span>
                  <Clock size={12} className="text-muted-foreground" />
                </p>
                <div className="bg-muted/30 rounded-xl p-3 space-y-2 border border-border/50 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mã JD</span>
                    <span className="font-mono font-bold text-foreground">
                      {jobPost?.jobCode || "Chưa cấp"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Khởi tạo</span>
                    <span className="text-foreground">
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cập nhật</span>
                    <span className="text-foreground">
                      {req.updatedAt
                        ? new Date(req.updatedAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                  {(req as any)?.rejectionReason && (
                    <div className="pt-1 border-t border-border/50">
                      <span className="text-red-500 font-semibold block text-[10px]">
                        Lý do từ chối:
                      </span>
                      <p className="text-muted-foreground italic text-[10px] mt-0.5">
                        {(req as any).rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
      }}
      sidePanel={null}
      footer={
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            {canCancelRequisition &&
            req.status !== RecruitmentRequestStatus.CANCELLED &&
            req.status !== RecruitmentRequestStatus.COMPLETED ? (
              <ActionButton
                variant="ghost"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 !h-8"
                allowedPermissions={[
                  "ats_requisition:update:any",
                  "ats_requisition:update:dept",
                  "ats_requisition:delete:any",
                ]}
                permissionBehavior="hide"
                requireConfirm={true}
                confirmTitle="Hủy yêu cầu tuyển dụng"
                confirmMessage="Bạn có chắc chắn muốn hủy yêu cầu tuyển dụng này? Toàn bộ quy trình sẽ dừng lại."
                confirmLabel="Xác nhận hủy"
                cancelLabel="Đóng"
                disabled={isCancelling}
                isLoading={isCancelling}
                onAction={handleCancelRequisition}
                successMessage="Đã hủy bỏ yêu cầu tuyển dụng."
              >
                <Trash2 size={13} /> Hủy yêu cầu
              </ActionButton>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* TH1: Giao diện Chờ nhân sự soạn thảo (Head Dept) */}
            {showPendingFillin && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                  <Clock size={13} className="animate-spin text-amber-500" />
                  <span>Đang chờ Nhân sự (HR) soạn thảo JD</span>
                </div>
              </div>
            )}

            {/* TH2: Giao diện thẩm định duyệt JD cho Head Dept */}
            {!canManageJd && canViewDraftedJd && (
              <>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy size={13} /> Copy Markdown
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Eye size={13} /> Xem trước
                </button>

                {isPendingApproval ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-lg">
                      <Clock
                        size={12}
                        className="animate-spin text-amber-500"
                      />
                      <span>Chờ bạn thẩm định & duyệt</span>
                    </div>

                    {canApprove && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowRejectModal(true)}
                          disabled={isReviewingReq || isReviewingJobByHead}
                          className="btn-secondary text-xs px-3 py-1.5 !h-8 text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                        >
                          <XCircle size={13} className="mr-1 inline" /> Từ chối
                        </button>
                        <ActionButton
                          variant="primary"
                          className="text-xs px-4 py-1.5 !h-8 bg-emerald-600 hover:bg-emerald-700"
                          isLoading={isReviewingReq || isReviewingJobByHead}
                          onClick={handleApproveRequisition}
                        >
                          <CheckCircle2 size={13} className="mr-1.5" /> Phê
                          duyệt JD
                        </ActionButton>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                    <Lock size={12} /> Bản tin: {jobPost?.status || req.status}
                  </div>
                )}
              </>
            )}

            {/* TH3: Giao diện Quản lý / Soạn thảo đầy đủ cho HR & Admin */}
            {canManageJd && (
              <>
                {creationMode !== "choose" && (
                  <>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground border border-border text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{activeOptionLabel}</span>
                    </div>

                    {!isLockedOrPublished && !isPendingApproval && (
                      <>
                        {creationMode === "editor" && (
                          <>
                            <button
                              type="button"
                              onClick={handleCopyMarkdown}
                              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Copy size={13} /> Copy Markdown
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowPreviewModal(true)}
                              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              <Eye size={13} /> Xem trước
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setCreationMode("choose")}
                          disabled={isFormDisabled}
                          className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <ChevronLeft size={13} /> Quay lại
                        </button>
                      </>
                    )}
                  </>
                )}

                {creationMode === "ai_flat" && (
                  <button
                    type="button"
                    onClick={handleRunAiSuggestFlat}
                    disabled={!aiFlatPrompt.trim() || isAiGenerating}
                    className="btn-primary text-xs px-4 py-2 bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    <span>
                      {isAiGenerating
                        ? "Gemini đang suy luận..."
                        : "Tự động điền dữ liệu"}
                    </span>
                  </button>
                )}

                {creationMode === "editor" && (
                  <>
                    {!isFormDisabled && (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                          isCreatingJd || isUpdatingJd || isFormDisabled
                        }
                        className="btn-primary text-xs h-8 w-[140px] justify-center flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 shrink-0 select-none"
                      >
                        {isCreatingJd || isUpdatingJd ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Save size={13} />
                        )}
                        <span>
                          {isCreatingJd || isUpdatingJd
                            ? "Đang lưu..."
                            : "Lưu JD"}
                        </span>
                      </button>
                    )}

                    {jobPost &&
                      (req.status === RecruitmentRequestStatus.DRAFTED ||
                        jobPost.status === JobPostStatus.DRAFT) &&
                      !isApprovedOrReady &&
                      !isPendingApproval && (
                        <DropdownActionButton
                          label="Trình duyệt JD"
                          icon={<Send size={13} />}
                          variant="primary"
                          disabled={
                            isRequestingApproval ||
                            isReviewingReq ||
                            isReviewingJobByHead ||
                            isFormDisabled
                          }
                          isLoading={
                            isRequestingApproval ||
                            isReviewingJobByHead ||
                            isReviewingReq
                          }
                          className="!bg-purple-600 hover:!bg-purple-700 !text-white shadow-sm"
                          menuClassName="!w-64"
                          align="end"
                          actions={[
                            {
                              key: "send-head-approval",
                              icon: (
                                <UserCheck
                                  size={15}
                                  className="text-primary mt-0.5 shrink-0 self-start"
                                />
                              ),
                              label: (
                                <div className="flex flex-col text-left py-0.5">
                                  <span className="font-semibold text-foreground text-xs leading-tight">
                                    Gửi Trưởng ban duyệt
                                  </span>
                                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                                    Theo quy trình thẩm định nội bộ
                                  </span>
                                </div>
                              ),
                              onAction: handleSendForApproval,
                            },
                            {
                              key: "bypass-head-approval",
                              icon: (
                                <FastForward
                                  size={15}
                                  className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0 self-start"
                                />
                              ),
                              label: (
                                <div className="flex flex-col text-left py-0.5 text-amber-600 dark:text-amber-400">
                                  <span className="font-semibold text-xs leading-tight">
                                    Bỏ qua duyệt (Bypass)
                                  </span>
                                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                                    Phê duyệt ngay, sẵn sàng đăng
                                  </span>
                                </div>
                              ),
                              onAction: handleBypassApproval,
                            },
                          ]}
                        />
                      )}

                    {isPendingApproval && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-lg">
                          <Clock
                            size={12}
                            className="animate-spin text-amber-500"
                          />
                          <span>Đang chờ Trưởng ban thẩm định</span>
                        </div>

                        {canApprove && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowRejectModal(true)}
                              disabled={isReviewingReq || isReviewingJobByHead}
                              className="btn-secondary text-xs px-3 py-1.5 !h-8 text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                            >
                              <XCircle size={13} className="mr-1 inline" /> Từ
                              chối
                            </button>
                            <ActionButton
                              variant="primary"
                              className="text-xs px-4 py-1.5 !h-8 bg-emerald-600 hover:bg-emerald-700"
                              isLoading={isReviewingReq || isReviewingJobByHead}
                              onClick={handleApproveRequisition}
                            >
                              <CheckCircle2 size={13} className="mr-1.5" /> Phê
                              duyệt JD
                            </ActionButton>
                          </>
                        )}
                      </div>
                    )}

                    {(isApprovedOrReady ||
                      req.status === RecruitmentRequestStatus.APPROVED) &&
                      jobPost?.status !== JobPostStatus.PUBLISHED && (
                        <button
                          type="button"
                          onClick={() => setShowPublishModal(true)}
                          className="btn-primary text-xs px-4 py-2 !h-8 bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Globe size={13} /> Đăng tuyển đa kênh
                        </button>
                      )}

                    {jobPost?.status === JobPostStatus.PUBLISHED && (
                      <ActionButton
                        variant="destructive"
                        className="text-xs px-4 py-2 !h-8"
                        requireConfirm={true}
                        confirmTitle="Đóng tin tuyển dụng"
                        confirmMessage="Bạn có chắc chắn muốn đóng tin tuyển dụng này? Ứng viên sẽ không thể tiếp tục nộp hồ sơ qua các kênh."
                        confirmLabel="Đóng tin"
                        cancelLabel="Hủy"
                        isLoading={isClosingJob}
                        onAction={handleCloseJobPost}
                      >
                        <Ban size={13} className="mr-1.5" /> Đóng tin tuyển dụng
                      </ActionButton>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
        {/* ==================================================================== */}
        {/* GIAO DIỆN 1: PENDING FOR FILL-IN (DÀNH CHO TRƯỞNG PHÒNG KHI CHƯA CÓ JD) */}
        {/* ==================================================================== */}
        {showPendingFillin && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 py-8 text-center space-y-5 fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-xs">
              <Inbox size={32} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Clock size={12} className="animate-spin text-amber-600" />
                PENDING_FOR_FILLIN
              </span>
              <h3 className="text-base md:text-lg font-bold text-foreground">
                Yêu cầu đang chờ Nhân sự tiếp nhận & soạn thảo JD
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Yêu cầu bổ sung nhân sự của phòng{" "}
                <strong className="text-foreground">{deptName}</strong> đã được
                chuyển đến bộ phận Nhân sự (HR). Khi HR hoàn thiện bản thảo JD
                và gửi trình duyệt, bạn sẽ có quyền xem xét, thẩm định và phê
                duyệt ngay tại trang này.
              </p>
            </div>

            <div className="w-full bg-card border border-border/80 rounded-2xl p-4 text-left space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-border text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5 text-primary">
                  <FileText size={14} /> Nội dung nhu cầu đã gửi
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Mã: {requestCode}
                </span>
              </div>

              <div className="text-xs text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/50 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {rawNote || "Không có ghi chú bổ sung"}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>
                  Số lượng đề xuất:{" "}
                  <strong className="text-foreground">
                    {jobPost?.headcount || 1} nhân sự
                  </strong>
                </span>
                <span>
                  Trạng thái:{" "}
                  <span className="badge badge-neutral text-[10px]">
                    {req.status}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-xl border border-border">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <span>
                Bạn chỉ có thể xem và thực hiện duyệt sau khi bản thảo JD được
                HR chuyển sang trạng thái <strong>PENDING_HEAD_APPROVAL</strong>
                .
              </span>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* GIAO DIỆN 2: CHỌN CƠ CHẾ SOẠN THẢO (DÀNH CHO HR / ADMIN) */}
        {/* ==================================================================== */}
        {!showPendingFillin && canManageJd && creationMode === "choose" && (
          <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-4 space-y-6 fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {requestCode}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-foreground">
                    Khởi tạo nội dung bản tin tuyển dụng
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chọn 1 trong 3 cơ chế biên soạn để chuẩn hóa dữ liệu 24 tiêu
                  chí tuyển dụng doanh nghiệp
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto">
                <Building2 size={13} className="text-muted-foreground/60" />
                <span className="font-medium text-foreground">{deptName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  setCreationMode("editor");
                  setActiveSection("general");
                }}
                className="group relative p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                      <Edit3 size={18} />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                      Thủ công
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Tạo tin thủ công
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Chủ động thiết lập toàn bộ 4 nhóm tiêu chí tuyển dụng qua
                      hệ thống Horizontal Accordions.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                      4 Modules
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                      Định biên tự do
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Mở bảng soạn thảo</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>

              <div
                onClick={() => setCreationMode("template_flat")}
                className="group relative p-5 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center font-bold border border-blue-200/50 dark:border-blue-900/60 group-hover:scale-105 transition-transform">
                      <FileCheck2 size={18} />
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/60">
                      Mẫu chuẩn
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      Nạp từ JD có sẵn
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Tái sử dụng các bản mô tả công việc đã được Ban Giám đốc
                      phê duyệt cho các vị trí tương đồng.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                      {templatesRes?.data?.length || 0} bản mẫu
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                      Đã thẩm định
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Khám phá thư viện</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>

              <div
                onClick={() => setCreationMode("ai_flat")}
                className="group relative p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/15 dark:bg-purple-950/10 hover:border-purple-500/60 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 flex items-center justify-center font-bold border border-purple-200 dark:border-purple-800 group-hover:scale-105 transition-transform">
                      <Wand2 size={18} />
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      Gemini 3.6
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-purple-600 transition-colors">
                      AI gợi ý JD
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Chuyển hóa ghi chú thô thành bản thảo hoàn chỉnh với đầy
                      đủ kỹ năng, tiêu chí và khung lương.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100/50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                      Tự động 100%
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100/50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                      Phân tích ngữ cảnh
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <span>Kích hoạt AI Assistant</span>
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* GIAO DIỆN 3: NẠP TỪ TEMPLATE CHO HR */}
        {/* ==================================================================== */}
        {!showPendingFillin &&
          canManageJd &&
          creationMode === "template_flat" && (
            <div className="flex-1 flex flex-col min-h-0 max-w-5xl mx-auto w-full py-3 space-y-4 fade-in overflow-hidden">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/80 shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <FileCheck2 size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Thư viện bản mẫu JD chuẩn hóa
                    </h3>
                    <span className="text-[10px] font-mono font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {templatesRes?.data?.length || 0} bản ghi
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nhấn vào mẫu phù hợp để nạp tự động toàn bộ 24 trường vào
                    bảng soạn thảo
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCreationMode("choose")}
                  className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ChevronLeft size={13} /> Quay lại phương thức
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {!templatesRes?.data?.length ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-center rounded-xl border border-dashed border-border bg-muted/10">
                    <FileText size={28} className="text-muted-foreground/40" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Chưa có bản mẫu JD nào được lưu trữ trong hệ thống
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                    {templatesRes.data.map((tmpl: any) => (
                      <div
                        key={tmpl.id}
                        onClick={() => handleSelectTemplate(tmpl)}
                        className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {tmpl.publicTitle}
                            </h4>
                            <span className="font-mono text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">
                              {tmpl.jobCode}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {tmpl.jobDescription}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {tmpl.level}
                            </span>
                            ·<span>{tmpl.experienceYears} năm KN</span>·
                            <span>{tmpl.workingModel}</span>
                          </div>

                          <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Áp dụng mẫu <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* ==================================================================== */}
        {/* GIAO DIỆN 4: GEMINI AI GỢI Ý CHO HR */}
        {/* ==================================================================== */}
        {!showPendingFillin && canManageJd && creationMode === "ai_flat" && (
          <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-3 space-y-4 fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Trợ lý Gemini AI soạn thảo JD
                  </h3>
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                    Flash 3.6
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI tự động phân tích ngữ cảnh để cấu trúc hóa tiêu chuẩn năng
                  lực, chế độ và yêu cầu tuyển dụng
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCreationMode("choose")}
                disabled={isAiGenerating}
                className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <ChevronLeft size={13} /> Quay lại
              </button>
            </div>

            <div className="space-y-3 bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText size={13} className="text-muted-foreground" />
                  Mô tả tóm tắt nhu cầu bổ sung nhân sự
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {aiFlatPrompt.length} ký tự
                </span>
              </div>

              <textarea
                rows={7}
                value={aiFlatPrompt}
                disabled={isAiGenerating}
                onChange={(e) => setAiFlatPrompt(e.target.value)}
                placeholder="VD: Cần tuyển 2 Kỹ sư MEP giám sát hiện trường tại dự án nhà xưởng Đồng Nai..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2.5 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 leading-relaxed custom-scrollbar"
              />

              <div className="pt-2 flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-muted-foreground">Gợi ý mẫu:</span>
                {[
                  "Kỹ sư MEP hiện trường (Đồng Nai)",
                  "Chỉ huy trưởng công trình Dân dụng",
                  "Chuyên viên Dự toán & BOQ",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    disabled={isAiGenerating}
                    onClick={() =>
                      setAiFlatPrompt(
                        `Tuyển dụng vị trí: ${sample}. Yêu cầu ứng viên có năng lực chuyên môn phù hợp, kinh nghiệm thực tế tại các công trình tương tự, lương thỏa thuận theo năng lực.`,
                      )
                    }
                    className="px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors text-[10px] disabled:opacity-50 cursor-pointer"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-start gap-2.5 text-xs text-muted-foreground">
              <CheckCircle2
                size={15}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="leading-relaxed text-[11px]">
                Sau khi phân tích, hệ thống sẽ tự động trích xuất và điền đầy đủ
                dữ liệu vào cả 4 mục:{" "}
                <strong className="text-foreground">Thông tin chung</strong>,{" "}
                <strong className="text-foreground">Mô tả & Phúc lợi</strong>,{" "}
                <strong className="text-foreground">Kỹ năng kỳ vọng</strong> và{" "}
                <strong className="text-foreground">Đầu mối nhận hồ sơ</strong>.
                Bạn có thể tự do hiệu chỉnh trước khi lưu.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* GIAO DIỆN 5: BIÊN TẬP (HR) HOẶC XEM THẨM ĐỊNH (HEAD DEPT READ-ONLY) */}
        {/* ==================================================================== */}
        {!showPendingFillin && (creationMode === "editor" || !canManageJd) && (
          <div
            onInputCapture={() => {
              if (canManageJd) hasUserActionRef.current = true;
            }}
            onChangeCapture={() => {
              if (canManageJd) hasUserActionRef.current = true;
            }}
            className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden fade-in"
          >
            {isFormDisabled && (
              <div className="shrink-0 flex items-center justify-between px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="shrink-0" />
                  <span className="font-semibold">
                    Chế độ xem (Biểu mẫu đã khóa chỉnh sửa):
                  </span>
                  <span className="text-[11px] opacity-90">
                    {!canManageJd
                      ? isPendingApproval
                        ? "Bản tin đang chờ bạn thẩm định và phê duyệt (Chế độ chỉ đọc)."
                        : "Bản tin đang trong tiến trình tuyển dụng (Chế độ chỉ đọc)."
                      : isAiGenerating
                        ? "Gemini AI đang sinh dữ liệu và tự động điền form..."
                        : isPendingApproval
                          ? "Bản tin đang chờ Trưởng ban phê duyệt."
                          : isApprovedOrReady
                            ? "Bản tin đã được phê duyệt, sẵn sàng để đăng tuyển."
                            : "Bản tin đã xuất bản hoặc đã kết thúc tuyển dụng."}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px] bg-amber-500/15 px-2 py-0.5 rounded font-bold">
                  <Lock size={10} /> READ-ONLY
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full w-full items-stretch overflow-hidden">
              {/* PROGRESS TRACKER DỌC BÊN CẠNH */}
              <div className="w-full lg:w-60 shrink-0 bg-card px-3.5 py-2.5 flex flex-col gap-3 shadow-sm h-full overflow-y-auto custom-scrollbar">
                <div className="space-y-1.5 pb-2.5 border-b border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">
                      Tiến độ JD
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {overallPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2.5 flex-1">
                  {trackerSections.map((sec) => {
                    const isActive = sec.key === activeSection;
                    const completedCount = sec.subItems.filter(
                      (i) => i.isCompleted,
                    ).length;
                    const isAllDone = completedCount === sec.subItems.length;

                    return (
                      <div key={sec.key} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setActiveSection(sec.key)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/10 text-primary font-bold"
                              : "hover:bg-muted/50 text-foreground"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 transition-all ${
                              isActive
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                                : isAllDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {isAllDone ? <Check size={11} /> : sec.num}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{sec.title}</p>
                          </div>

                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                            {completedCount}/{sec.subItems.length}
                          </span>
                        </button>

                        {isActive && (
                          <div className="ml-4 pl-2.5 border-l-2 border-primary/30 space-y-1 py-1 fade-in">
                            {sec.subItems.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center justify-between text-[11px] py-0.5"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      sub.isCompleted
                                        ? "bg-emerald-500"
                                        : "bg-muted-foreground/40"
                                    }`}
                                  />
                                  <span
                                    className={`truncate ${
                                      sub.isCompleted
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {sub.label}
                                  </span>
                                </div>
                                {sub.isCompleted && (
                                  <Check
                                    size={11}
                                    className="text-emerald-500 shrink-0 ml-1"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CỤM 4 HORIZONTAL DETAIL ACCORDIONS */}
              <div className="flex-1 flex flex-row min-w-0 bg-card overflow-hidden shadow-sm h-full w-full">
                {/* SECTION 1 */}
                <HorizontalDetailAccordion
                  title="1. Thông tin chung"
                  icon={<Briefcase size={14} />}
                  badge={
                    trackerSections[0].subItems.every((i) => i.isCompleted) ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : undefined
                  }
                  isExpanded={activeSection === "general"}
                  onToggle={() => setActiveSection("general")}
                  expandedWidth="lg:flex-1 lg:min-w-[520px]"
                  collapsedWidth="lg:w-12"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Tiêu đề tin tuyển dụng{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.publicTitle}
                        disabled={isFormDisabled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publicTitle: e.target.value,
                          })
                        }
                        placeholder="VD: Kỹ Sư Kết Cấu - Dự Án Nhà Xưởng Cao Tầng"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Vị trí chuyên môn (Specialization)
                        </label>
                        <input
                          type="text"
                          value={formData.specialization}
                          disabled={isFormDisabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specialization: e.target.value,
                            })
                          }
                          placeholder="VD: Kỹ thuật kết cấu, MEP..."
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Kiến thức ngành (Domain Knowledge)
                        </label>
                        <input
                          type="text"
                          value={formData.domainKnowledge}
                          disabled={isFormDisabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              domainKnowledge: e.target.value,
                            })
                          }
                          placeholder="VD: Xây dựng dân dụng, Eurocode..."
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Cấp bậc
                        </label>
                        <SearchableSelect
                          options={levelOptions}
                          value={formData.level}
                          disabled={isFormDisabled}
                          onChange={(val) => {
                            if (val && canManageJd) {
                              hasUserActionRef.current = true;
                              setFormData({
                                ...formData,
                                level: val as JobLevel,
                              });
                            }
                          }}
                          placeholder="Chọn cấp bậc..."
                          searchPlaceholder="Tìm cấp bậc..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Loại công việc
                        </label>
                        <SearchableSelect
                          options={jobTypeOptions}
                          value={formData.jobType}
                          disabled={isFormDisabled}
                          onChange={(val) => {
                            if (val && canManageJd) {
                              hasUserActionRef.current = true;
                              setFormData({
                                ...formData,
                                jobType: val as JobType,
                              });
                            }
                          }}
                          placeholder="Chọn loại công việc..."
                          searchPlaceholder="Tìm loại công việc..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Hình thức làm việc
                        </label>
                        <SearchableSelect
                          options={workingModelOptions}
                          value={formData.workingModel}
                          disabled={isFormDisabled}
                          onChange={(val) => {
                            if (val && canManageJd) {
                              hasUserActionRef.current = true;
                              setFormData({
                                ...formData,
                                workingModel: val as WorkingModel,
                              });
                            }
                          }}
                          placeholder="Chọn hình thức..."
                          searchPlaceholder="Tìm hình thức..."
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-foreground">
                          Mức lương định biên (VND)
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isFormDisabled}
                            checked={formData.isSalaryNegotiable}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isSalaryNegotiable: e.target.checked,
                              })
                            }
                            className="rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed"
                          />
                          <span>Thỏa thuận</span>
                        </label>
                      </div>

                      {!formData.isSalaryNegotiable && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] text-muted-foreground mb-1 block">
                              Tối thiểu (Min)
                            </span>
                            <input
                              type="number"
                              step={1000000}
                              disabled={isFormDisabled}
                              value={formData.salaryMin}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  salaryMin: Number(e.target.value),
                                })
                              }
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground mb-1 block">
                              Tối đa (Max)
                            </span>
                            <input
                              type="number"
                              step={1000000}
                              disabled={isFormDisabled}
                              value={formData.salaryMax}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  salaryMax: Number(e.target.value),
                                })
                              }
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </HorizontalDetailAccordion>

                {/* SECTION 2 */}
                <HorizontalDetailAccordion
                  title="2. Mô tả công việc"
                  icon={<FileText size={14} />}
                  badge={
                    trackerSections[1].subItems.every((i) => i.isCompleted) ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : undefined
                  }
                  isExpanded={activeSection === "description"}
                  onToggle={() => setActiveSection("description")}
                  expandedWidth="lg:flex-1 lg:min-w-[520px]"
                  collapsedWidth="lg:w-12"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Mô tả công việc chi tiết{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        disabled={isFormDisabled}
                        value={formData.jobDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jobDescription: e.target.value,
                          })
                        }
                        placeholder="Mô tả các nhiệm vụ và trách nhiệm chính..."
                        className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Yêu cầu ứng viên <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        disabled={isFormDisabled}
                        value={formData.requirements}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requirements: e.target.value,
                          })
                        }
                        placeholder="Kinh nghiệm, kỹ năng và tiêu chuẩn năng lực cần thiết..."
                        className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Quyền lợi ứng viên{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        disabled={isFormDisabled}
                        value={formData.benefits}
                        onChange={(e) =>
                          setFormData({ ...formData, benefits: e.target.value })
                        }
                        placeholder="Lương thưởng, phúc lợi, bảo hiểm..."
                        className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Quyền lợi bổ sung
                      </label>
                      <input
                        type="text"
                        disabled={isFormDisabled}
                        value={formData.extraBenefits}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            extraBenefits: e.target.value,
                          })
                        }
                        placeholder="VD: Xe đưa đón hiện trường, phụ cấp dự án..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <label className="text-xs font-semibold text-foreground mb-2 block">
                        Địa điểm làm việc
                      </label>
                      <div className="space-y-2">
                        {formData.workLocations.map((loc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60 text-xs"
                          >
                            <span className="truncate">
                              <strong className="mr-1">{loc.label}:</strong>
                              {loc.address}
                            </span>
                            {!isFormDisabled && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    workLocations:
                                      formData.workLocations.filter(
                                        (_, i) => i !== idx,
                                      ),
                                  })
                                }
                                className="text-muted-foreground hover:text-red-500 p-0.5 cursor-pointer"
                              >
                                <CloseIcon size={13} />
                              </button>
                            )}
                          </div>
                        ))}

                        {!isFormDisabled && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Khu vực (vd: Đồng Nai)"
                              value={newLocation.label}
                              onChange={(e) =>
                                setNewLocation({
                                  ...newLocation,
                                  label: e.target.value,
                                })
                              }
                              className="flex h-9 w-1/3 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                            />
                            <input
                              type="text"
                              placeholder="Địa chỉ chi tiết"
                              value={newLocation.address}
                              onChange={(e) =>
                                setNewLocation({
                                  ...newLocation,
                                  address: e.target.value,
                                })
                              }
                              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newLocation.label && newLocation.address) {
                                  setFormData({
                                    ...formData,
                                    workLocations: [
                                      ...formData.workLocations,
                                      newLocation,
                                    ],
                                  });
                                  setNewLocation({
                                    label: "",
                                    address: "",
                                  });
                                }
                              }}
                              className="btn-secondary text-xs px-3 cursor-pointer"
                            >
                              Thêm
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Thời gian chuẩn
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          value={formData.workingHoursStandard}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              workingHoursStandard: e.target.value,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Chi tiết ca / Nghỉ trưa
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          value={formData.workingHoursDetail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              workingHoursDetail: e.target.value,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </HorizontalDetailAccordion>

                {/* SECTION 3 */}
                <HorizontalDetailAccordion
                  title="3. Kỳ vọng ứng viên"
                  icon={<GraduationCap size={14} />}
                  badge={
                    trackerSections[2].subItems.every((i) => i.isCompleted) ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : undefined
                  }
                  isExpanded={activeSection === "expectations"}
                  onToggle={() => setActiveSection("expectations")}
                  expandedWidth="lg:flex-1 lg:min-w-[520px]"
                  collapsedWidth="lg:w-12"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Học vấn tối thiểu
                        </label>
                        <SearchableSelect
                          options={minEducationOptions}
                          value={formData.minEducation}
                          disabled={isFormDisabled}
                          onChange={(val) => {
                            if (val && canManageJd) {
                              hasUserActionRef.current = true;
                              setFormData({
                                ...formData,
                                minEducation: val as EducationLevel,
                              });
                            }
                          }}
                          placeholder="Chọn học vấn..."
                          searchPlaceholder="Tìm học vấn..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Số năm kinh nghiệm
                        </label>
                        <input
                          type="number"
                          min={0}
                          disabled={isFormDisabled}
                          value={formData.experienceYears}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experienceYears: Number(e.target.value),
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Giới tính
                        </label>
                        <SearchableSelect
                          options={genderOptions}
                          value={formData.gender}
                          disabled={isFormDisabled}
                          onChange={(val) => {
                            if (val && canManageJd) {
                              hasUserActionRef.current = true;
                              setFormData({
                                ...formData,
                                gender: val as CandidateGender,
                              });
                            }
                          }}
                          placeholder="Chọn giới tính..."
                          searchPlaceholder="Tìm giới tính..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Độ tuổi
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="VD: 24"
                          disabled={isFormDisabled}
                          value={formData.ageMin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ageMin: Number(e.target.value),
                            })
                          }
                          className="flex h-9 w-28 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <span className="text-xs text-muted-foreground">
                          đến
                        </span>
                        <input
                          type="number"
                          placeholder="VD: 35"
                          disabled={isFormDisabled}
                          value={formData.ageMax}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ageMax: Number(e.target.value),
                            })
                          }
                          className="flex h-9 w-28 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Kỹ năng cần có (Must-Have)
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formData.mustHaveSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-primary/10 text-primary border border-primary/20"
                          >
                            {sk}
                            {!isFormDisabled && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    mustHaveSkills:
                                      formData.mustHaveSkills.filter(
                                        (_, i) => i !== idx,
                                      ),
                                  })
                                }
                              >
                                <CloseIcon size={12} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {!isFormDisabled && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nhập kỹ năng và nhấn Enter..."
                            value={mustHaveInput}
                            onChange={(e) => setMustHaveInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && mustHaveInput.trim()) {
                                e.preventDefault();
                                setFormData({
                                  ...formData,
                                  mustHaveSkills: [
                                    ...formData.mustHaveSkills,
                                    mustHaveInput.trim(),
                                  ],
                                });
                                setMustHaveInput("");
                              }
                            }}
                            className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (mustHaveInput.trim()) {
                                setFormData({
                                  ...formData,
                                  mustHaveSkills: [
                                    ...formData.mustHaveSkills,
                                    mustHaveInput.trim(),
                                  ],
                                });
                                setMustHaveInput("");
                              }
                            }}
                            className="btn-secondary text-xs px-3 cursor-pointer"
                          >
                            Thêm
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Kỹ năng nên có (Nice-to-Have)
                        </label>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {formData.niceToHaveSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-muted text-foreground border border-border"
                            >
                              {sk}
                              {!isFormDisabled && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      niceToHaveSkills:
                                        formData.niceToHaveSkills.filter(
                                          (_, i) => i !== idx,
                                        ),
                                    })
                                  }
                                >
                                  <CloseIcon size={11} />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {!isFormDisabled && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Thêm kỹ năng..."
                              value={niceToHaveInput}
                              onChange={(e) =>
                                setNiceToHaveInput(e.target.value)
                              }
                              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (niceToHaveInput.trim()) {
                                  setFormData({
                                    ...formData,
                                    niceToHaveSkills: [
                                      ...formData.niceToHaveSkills,
                                      niceToHaveInput.trim(),
                                    ],
                                  });
                                  setNiceToHaveInput("");
                                }
                              }}
                              className="btn-secondary text-xs px-2.5 cursor-pointer"
                            >
                              Thêm
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Ngoại ngữ
                        </label>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {formData.languages.map((l, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-muted text-foreground border border-border"
                            >
                              {l}
                              {!isFormDisabled && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      languages: formData.languages.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    })
                                  }
                                >
                                  <CloseIcon size={11} />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {!isFormDisabled && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="VD: Tiếng Anh..."
                              value={languageInput}
                              onChange={(e) => setLanguageInput(e.target.value)}
                              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (languageInput.trim()) {
                                  setFormData({
                                    ...formData,
                                    languages: [
                                      ...formData.languages,
                                      languageInput.trim(),
                                    ],
                                  });
                                  setLanguageInput("");
                                }
                              }}
                              className="btn-secondary text-xs px-2.5 cursor-pointer"
                            >
                              Thêm
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </HorizontalDetailAccordion>

                {/* SECTION 4 */}
                <HorizontalDetailAccordion
                  title="4. Thông tin nhận hồ sơ"
                  icon={<Users size={14} />}
                  badge={
                    trackerSections[3].subItems.every((i) => i.isCompleted) ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : undefined
                  }
                  isExpanded={activeSection === "contact"}
                  onToggle={() => setActiveSection("contact")}
                  expandedWidth="lg:flex-1 lg:min-w-[520px]"
                  collapsedWidth="lg:w-12"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Hạn nhận hồ sơ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          disabled={isFormDisabled}
                          value={formData.applicationDeadline}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              applicationDeadline: e.target.value,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Số lượng tuyển <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          disabled={isFormDisabled}
                          value={formData.headcount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headcount: Number(e.target.value),
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Họ và tên người nhận{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          value={formData.hrRecipientName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hrRecipientName: e.target.value,
                            })
                          }
                          placeholder="VD: TD Chính Nam"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          disabled={isFormDisabled}
                          value={formData.hrRecipientPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hrRecipientPhone: e.target.value,
                            })
                          }
                          placeholder="0937546739"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">
                          Email nhận hồ sơ{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          disabled={isFormDisabled}
                          value={formData.hrRecipientEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hrRecipientEmail: e.target.value,
                            })
                          }
                          placeholder="talent@chinhnambkd.vn"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Chiến dịch tuyển dụng
                      </label>
                      <input
                        type="text"
                        disabled={isFormDisabled}
                        value={formData.campaignName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            campaignName: e.target.value,
                          })
                        }
                        placeholder="VD: Đợt tuyển Kỹ sư MEP Quý 3/2026"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                </HorizontalDetailAccordion>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CẤU HÌNH ĐĂNG TUYỂN ĐA KÊNH */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div
            className={`w-full rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 transition-all duration-300 ease-in-out ${
              isAutomationPanelExpanded ? "max-w-2xl" : "max-w-sm"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" /> Cấu hình đăng
                  tuyển đa kênh
                </h3>
                <p className="text-xs text-muted-foreground">
                  Chọn kênh phân phối bài đăng tuyển dụng
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <AutomationChannelsPanel
              ref={automationPanelRef}
              atsJobId={jobPost?.id || ""}
              jobTitle={jobPost?.publicTitle || formData.publicTitle || ""}
              jobDescription={jobPost?.jobDescription || formData.jobDescription || ""}
              jobType={jobPost?.jobType || formData.jobType}
              requiredSkills={jobPost?.mustHaveSkills || formData.mustHaveSkills || []}
              onSelectionCountChange={setAutomationChannelsCount}
              onExpandedChange={setIsAutomationPanelExpanded}
              leadingRail={
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedChannels.includes(PlatformSource.LINKEDIN)) {
                        setSelectedChannels(
                          selectedChannels.filter(
                            (c) => c !== PlatformSource.LINKEDIN,
                          ),
                        );
                      } else {
                        setSelectedChannels([
                          ...selectedChannels,
                          PlatformSource.LINKEDIN,
                        ]);
                      }
                    }}
                    className={`w-full p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 text-left ${
                      selectedChannels.includes(PlatformSource.LINKEDIN)
                        ? "border-primary bg-primary/[0.03] shadow-xs"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        in
                      </div>
                      <p className="text-[11px] font-bold text-foreground truncate">
                        LinkedIn Page
                      </p>
                    </div>
                    {selectedChannels.includes(PlatformSource.LINKEDIN) ? (
                      <CheckSquare size={15} className="text-primary shrink-0" />
                    ) : (
                      <Square
                        size={15}
                        className="text-muted-foreground/40 shrink-0"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedChannels.includes(PlatformSource.FACEBOOK)) {
                        setSelectedChannels(
                          selectedChannels.filter(
                            (c) => c !== PlatformSource.FACEBOOK,
                          ),
                        );
                      } else {
                        setSelectedChannels([
                          ...selectedChannels,
                          PlatformSource.FACEBOOK,
                        ]);
                      }
                    }}
                    className={`w-full p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 text-left ${
                      selectedChannels.includes(PlatformSource.FACEBOOK)
                        ? "border-primary bg-primary/[0.03] shadow-xs"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        f
                      </div>
                      <p className="text-[11px] font-bold text-foreground truncate">
                        Facebook Page
                      </p>
                    </div>
                    {selectedChannels.includes(PlatformSource.FACEBOOK) ? (
                      <CheckSquare size={15} className="text-primary shrink-0" />
                    ) : (
                      <Square
                        size={15}
                        className="text-muted-foreground/40 shrink-0"
                      />
                    )}
                  </button>
                </>
              }
            />

            {selectedChannels.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border">
                <label className="text-xs font-semibold text-foreground block">
                  Thời gian phát hành (LinkedIn &amp; Facebook Page):
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("immediate")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      scheduleMode === "immediate"
                        ? "border-primary bg-primary/[0.03] text-foreground font-semibold"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Globe size={15} className="text-primary" />
                    <span className="text-xs">Đăng ngay lập tức</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleMode("scheduled")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                      scheduleMode === "scheduled"
                        ? "border-primary bg-primary/[0.03] text-foreground font-semibold"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Calendar size={15} className="text-primary" />
                    <span className="text-xs">Lên lịch đăng</span>
                  </button>
                </div>

                {scheduleMode === "scheduled" && (
                  <div className="pt-2 fade-in">
                    <label className="text-[11px] text-muted-foreground mb-1 block">
                      Chọn ngày và giờ phát hành tự động:
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledPublishAt}
                      onChange={(e) => setScheduledPublishAt(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <ActionButton
                variant="primary"
                className="text-xs px-5 py-2 bg-blue-600 hover:bg-blue-700"
                onAction={handleUnifiedPublish}
                loadingMessage="Đang xử lý xuất bản..."
                successMessage="Đã xử lý yêu cầu đăng tuyển!"
                errorMessage={(err: any) =>
                  err?.message || "Có lỗi khi xuất bản."
                }
              >
                <Share2 size={13} className="mr-1.5" />
                {scheduleMode === "scheduled" && selectedChannels.length > 0
                  ? "Xác nhận lên lịch"
                  : "Phát hành"}
                {totalPublishChannelsCount > 0
                  ? ` (${totalPublishChannelsCount})`
                  : ""}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM TRƯỚC */}
      <JobPostPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        formData={formData}
        departmentName={deptName}
        jobPost={jobPost}
        req={req}
      />

      {/* MODAL TỪ CHỐI DUYỆT */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-card border border-border p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle size={16} /> Từ chối bản thảo tuyển dụng
            </h3>
            <p className="text-xs text-muted-foreground">
              Vui lòng nêu rõ lý do từ chối để chuyên viên nhân sự điều chỉnh
              tiêu chuẩn tuyển dụng:
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Vd: Ngân sách vượt định biên hoặc tiêu chuẩn kinh nghiệm chưa phù hợp..."
              className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRejectRequisition}
                disabled={
                  !rejectionReason.trim() ||
                  isReviewingReq ||
                  isReviewingJobByHead
                }
                className="btn-primary text-xs px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isReviewingReq || isReviewingJobByHead
                  ? "Đang xử lý..."
                  : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </HorizontalDetailLayout>
  );
}

// ─── MAIN EXPORTED WRAPPER ──────────────────────────────────────────────────
export default function RecruitmentRequestDetail({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();

  useSyncAtsEventsQuery();

  const {
    data: reqRes,
    isLoading: isReqLoading,
    refetch: refetchReq,
  } = useGetRecruitmentRequestByIdQuery(id);
  const req = reqRes?.data as any;
  const jobPost = req?.jobPost;

  if (isReqLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw size={24} className="animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">
            Đang nạp dữ liệu tuyển dụng...
          </p>
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
        <AlertTriangle size={32} className="text-amber-500" />
        <p className="text-sm font-semibold text-foreground">
          Không tìm thấy yêu cầu tuyển dụng với mã: {id}
        </p>
        <button
          onClick={() => router.push(`/${locale}/ats/request-management`)}
          className="btn-secondary text-xs px-4 py-2 cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <RecruitmentRequestDetailInner
      key={jobPost?.id || req?.id}
      req={req}
      jobPost={jobPost}
      id={id}
      locale={locale}
      refetchReq={refetchReq}
    />
  );
}
