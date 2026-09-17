// ─── JOB POST AUTHORING ENGINE (4 ACCORDIONS & 3 CREATION MODES) ─────────────
import {
  ChevronDown,
  Wand2,
  FileCheck2,
  Edit3,
  PlusCircle,
  X as CloseIcon,
  Save,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  CandidateGender,
  EducationLevel,
  JobLevel,
  JobPost,
  JobPostCreationMethod,
  JobType,
  PlatformSource,
  RecruitmentRequest,
  useAiSuggestJdMutation,
  useCreateJobPostMutation,
  useGetJobTemplatesQuery,
  useUpdateJobPostMutation,
  WorkingModel,
} from "@/lib/store/atsApiSlice";
import { useMemo, useState } from "react";
import { gooeyToast } from "goey-toast";

interface JobPostEditorCanvasProps {
  req: RecruitmentRequest;
  jobPost?: JobPost | null;
  onSuccess: () => void;
  canEdit: boolean;
}

export function JobPostEditorCanvas({
  req,
  jobPost,
  onSuccess,
  canEdit,
}: JobPostEditorCanvasProps) {
  // Trạng thái chọn phương thức: nếu đã có jobPost thì vào thẳng 'manual' (editor mode)
  const [creationMode, setCreationMode] = useState<"choose" | "manual">(
    jobPost ? "manual" : "choose",
  );

  // Accordion Expand/Collapse States
  const [accordions, setAccordions] = useState({
    general: true,
    description: true,
    expectations: false,
    contact: false,
  });

  const toggleAccordion = (key: keyof typeof accordions) => {
    setAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── FORM STATE ───
  const [formData, setFormData] = useState({
    // 1. Thông tin chung
    publicTitle: jobPost?.publicTitle || "",
    specialization: jobPost?.specialization || "Kỹ thuật Xây dựng / EPC",
    domainKnowledge: jobPost?.domainKnowledge || "Dân dụng & Công nghiệp",
    level: jobPost?.level || JobLevel.SENIOR,
    jobType: jobPost?.jobType || JobType.FULL_TIME,
    workingModel: jobPost?.workingModel || WorkingModel.ON_SITE,
    salaryMin: jobPost?.salaryMin ?? 15000000,
    salaryMax: jobPost?.salaryMax ?? 25000000,
    isSalaryNegotiable: jobPost?.isSalaryNegotiable ?? false,

    // 2. Mô tả công việc
    jobDescription: jobPost?.jobDescription || "",
    requirements: jobPost?.requirements || "",
    benefits: jobPost?.benefits || "",
    extraBenefits: jobPost?.extraBenefits || "",
    workLocations: jobPost?.workLocations || [
      {
        label: "Trụ sở chính",
        address: "Khu Công nghệ cao, TP. Thủ Đức, TP.HCM",
      },
    ],
    workingHoursStandard:
      jobPost?.workingHoursStandard || "Thứ 2 – Thứ 6: 08:00 – 17:00",
    workingHoursDetail:
      jobPost?.workingHoursDetail ||
      "Thứ 2 – Thứ 6: 7h30 – 17h00 (Nghỉ trưa 11h30 – 13h00)\nThứ 7: 7h30 – 11h30",

    // 3. Kỳ vọng ứng viên
    minEducation: jobPost?.minEducation || EducationLevel.BACHELOR,
    experienceYears: jobPost?.experienceYears ?? 3,
    gender: jobPost?.gender || CandidateGender.ANY,
    ageMin: jobPost?.ageMin ?? 24,
    ageMax: jobPost?.ageMax ?? 35,
    mustHaveSkills: jobPost?.mustHaveSkills || ["Revit", "AutoCAD", "BIM 360"],
    niceToHaveSkills: jobPost?.niceToHaveSkills || [
      "Tiếng Anh giao tiếp",
      "Navisworks",
    ],
    languages: jobPost?.languages || ["Tiếng Việt", "Tiếng Anh"],

    // 4. Thông tin nhận hồ sơ
    applicationDeadline:
      jobPost?.applicationDeadline ||
      new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    headcount: jobPost?.headcount ?? 1,
    hrRecipientName: jobPost?.hrRecipientName || "TD Chính Nam",
    hrRecipientPhone: jobPost?.hrRecipientPhone || "0937546739",
    hrRecipientEmail: jobPost?.hrRecipientEmail || "talent@chinhnambkd.vn",
    campaignName: jobPost?.campaignName || "Chiến dịch tuyển dụng Kỹ sư 2026",
  });

  // Tag Inputs
  const [mustHaveInput, setMustHaveInput] = useState("");
  const [niceToHaveInput, setNiceToHaveInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [newLocation, setNewLocation] = useState({ label: "", address: "" });

  // Dialogs
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState(
    req.rawRequestNote || "",
  );

  // API Mutations
  const { data: templatesRes } = useGetJobTemplatesQuery();
  const [aiSuggestJd, { isLoading: isAiRunning }] = useAiSuggestJdMutation();
  const [createJobPost, { isLoading: isCreating }] = useCreateJobPostMutation();
  const [updateJobPost, { isLoading: isUpdating }] = useUpdateJobPostMutation();

  // ─── PROGRESS TRACKER TÍNH TOÁN ───
  const progress = useMemo(() => {
    let completedSteps = 0;
    // Section 1
    if (formData.publicTitle.trim() && formData.specialization.trim())
      completedSteps += 1;
    // Section 2
    if (
      formData.jobDescription.trim() &&
      formData.requirements.trim() &&
      formData.benefits.trim()
    )
      completedSteps += 1;
    // Section 3
    if (formData.mustHaveSkills.length > 0 && formData.experienceYears >= 0)
      completedSteps += 1;
    // Section 4
    if (
      formData.applicationDeadline &&
      formData.headcount > 0 &&
      formData.hrRecipientEmail.trim()
    )
      completedSteps += 1;

    return {
      percentage: (completedSteps / 4) * 100,
      completedSteps,
    };
  }, [formData]);

  // ─── ACTIONS ───
  const handleSaveForm = async () => {
    if (!formData.publicTitle.trim()) {
      gooeyToast.error("Vui lòng nhập tiêu đề tin tuyển dụng.");
      return;
    }

    try {
      if (jobPost?.id) {
        await updateJobPost({
          id: jobPost.id,
          body: formData as any,
        }).unwrap();
        gooeyToast.success("Đã cập nhật bản thảo tin tuyển dụng thành công!");
      } else {
        await createJobPost({
          recruitmentRequestId: req.id,
          creationMethod: JobPostCreationMethod.MANUAL,
          targetPlatforms: [
            PlatformSource.COMPANY_WEBSITE,
            PlatformSource.LINKEDIN,
          ],
          ...formData,
        } as any).unwrap();
        gooeyToast.success("Đã khởi tạo bản tin tuyển dụng mới!");
      }
      onSuccess();
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi lưu thông tin JD.");
    }
  };

  // AI Generation Trigger
  const handleExecuteAiSuggest = async () => {
    try {
      gooeyToast.info(
        "AI đang phân tích và chuẩn hóa tiêu chuẩn công việc...",
      );
      const res = await aiSuggestJd({
        rawPrompt: aiCustomPrompt,
        recruitmentRequestId: req.id,
      }).unwrap();

      const aiData = res.data;
      setFormData((prev) => ({
        ...prev,
        publicTitle: aiData.publicTitle || prev.publicTitle,
        specialization: aiData.specialization || prev.specialization,
        domainKnowledge: aiData.domainKnowledge || prev.domainKnowledge,
        level: aiData.level || prev.level,
        jobType: aiData.jobType || prev.jobType,
        workingModel: aiData.workingModel || prev.workingModel,
        salaryMin: aiData.salaryMin || prev.salaryMin,
        salaryMax: aiData.salaryMax || prev.salaryMax,
        isSalaryNegotiable:
          aiData.isSalaryNegotiable ?? prev.isSalaryNegotiable,
        jobDescription: aiData.jobDescription || prev.jobDescription,
        requirements: aiData.requirements || prev.requirements,
        benefits: aiData.benefits || prev.benefits,
        extraBenefits: aiData.extraBenefits || prev.extraBenefits,
        workLocations: aiData.workLocations?.length
          ? aiData.workLocations
          : prev.workLocations,
        workingHoursStandard:
          aiData.workingHoursStandard || prev.workingHoursStandard,
        workingHoursDetail:
          aiData.workingHoursDetail || prev.workingHoursDetail,
        minEducation: aiData.minEducation || prev.minEducation,
        experienceYears: aiData.experienceYears ?? prev.experienceYears,
        gender: aiData.gender || prev.gender,
        ageMin: aiData.ageMin ?? prev.ageMin,
        ageMax: aiData.ageMax ?? prev.ageMax,
        mustHaveSkills: aiData.mustHaveSkills?.length
          ? aiData.mustHaveSkills
          : prev.mustHaveSkills,
        niceToHaveSkills: aiData.niceToHaveSkills?.length
          ? aiData.niceToHaveSkills
          : prev.niceToHaveSkills,
        languages: aiData.languages?.length ? aiData.languages : prev.languages,
        headcount: aiData.headcount ?? prev.headcount,
      }));

      setShowAiPromptModal(false);
      setCreationMode("manual");
      setAccordions({
        general: true,
        description: true,
        expectations: true,
        contact: true,
      });
      gooeyToast.success(
        "AI đã điền tự động dữ liệu vào 4 phần của tin tuyển dụng!",
      );
    } catch (err: any) {
      gooeyToast.error(err?.data?.message || "Lỗi khi sinh gợi ý JD.");
    }
  };

  // Chọn từ JD Template có sẵn
  const handleSelectTemplate = (template: any) => {
    setFormData((prev) => ({
      ...prev,
      publicTitle: template.publicTitle,
      specialization: template.specialization,
      domainKnowledge: template.domainKnowledge,
      level: template.level,
      jobType: template.jobType,
      workingModel: template.workingModel,
      salaryMin: template.salaryMin,
      salaryMax: template.salaryMax,
      isSalaryNegotiable: template.isSalaryNegotiable,
      jobDescription: template.jobDescription,
      requirements: template.requirements,
      benefits: template.benefits,
      extraBenefits: template.extraBenefits,
      workLocations: template.workLocations || prev.workLocations,
      workingHoursStandard: template.workingHoursStandard,
      workingHoursDetail: template.workingHoursDetail,
      minEducation: template.minEducation,
      experienceYears: template.experienceYears,
      mustHaveSkills: template.mustHaveSkills || [],
      niceToHaveSkills: template.niceToHaveSkills || [],
      languages: template.languages || [],
    }));

    setShowTemplateModal(false);
    setCreationMode("manual");
    gooeyToast.success(
      `Đã nạp thành công bản mẫu JD: "${template.publicTitle}"`,
    );
  };

  return (
    <div className="space-y-6 fade-in">
      {/* ─── 1. BỘ 3 PHƯƠNG THỨC KHỞI TẠO (NẾU CHƯA CHỌN HOẶC MUỐN CHUYỂN ĐỔI) ─── */}
      {creationMode === "choose" ? (
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h3 className="text-base md:text-lg font-bold text-foreground">
              Lựa chọn phương thức soạn thảo bản tin tuyển dụng
            </h3>
            <p className="text-xs text-muted-foreground">
              Bạn có thể tự nhập từng thông số, nạp từ thư viện JD mẫu doanh
              nghiệp, hoặc để AI tự động chuyển hóa yêu cầu thành JD
              chuẩn hóa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Tùy chọn 1: Thủ công */}
            <div
              onClick={() => setCreationMode("manual")}
              className="p-5 rounded-xl border border-border bg-card hover:border-primary/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Tạo tin thủ công
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tự điền từng thông số chi tiết qua 4 biểu mẫu cấu trúc doanh
                    nghiệp.
                  </p>
                </div>
              </div>
              <button className="mt-4 text-xs font-semibold text-primary inline-flex items-center gap-1">
                Bắt đầu nhập liệu <ChevronRight size={13} />
              </button>
            </div>

            {/* Tùy chọn 2: Điền từ JD có sẵn */}
            <div
              onClick={() => setShowTemplateModal(true)}
              className="p-5 rounded-xl border border-border bg-card hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <FileCheck2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Tự động điền từ JD có sẵn
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Hệ thống gợi ý các bản mẫu JD đã chuẩn hóa theo chức danh và
                    phòng ban.
                  </p>
                </div>
              </div>
              <button className="mt-4 text-xs font-semibold text-blue-600 inline-flex items-center gap-1">
                Chọn mẫu có sẵn <ChevronRight size={13} />
              </button>
            </div>

            {/* Tùy chọn 3: AI gợi ý JD */}
            <div
              onClick={() => setShowAiPromptModal(true)}
              className="p-5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/10 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Wand2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    AI gợi ý JD
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Nhập tóm tắt mô tả công việc, AI sẽ tự động điền toàn bộ
                    4 biểu mẫu.
                  </p>
                </div>
              </div>
              <button className="mt-4 text-xs font-semibold text-purple-600 inline-flex items-center gap-1">
                Kích hoạt AI Builder <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ─── 2. FORM BIÊN TẬP VỚI PROGRESS TRACKER VÀ 4 ACCORDION ─── */
        <div className="space-y-6">
          {/* Header Switcher & Progress Tracker */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Tiến độ soạn thảo tin tuyển dụng
                </span>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Hoàn thành {progress.completedSteps}/4 mục (
                  {progress.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiPromptModal(true)}
                  className="btn-secondary text-xs h-8 px-2.5 flex items-center gap-1.5 text-purple-600 border-purple-200 dark:border-purple-900 hover:bg-purple-50"
                >
                  <Sparkles size={13} /> AI điền lại
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="btn-secondary text-xs h-8 px-2.5 flex items-center gap-1.5"
                >
                  <FileCheck2 size={13} /> Đổi mẫu JD
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    disabled={isCreating || isUpdating}
                    className="btn-primary text-xs h-8 px-3.5 flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={13} />{" "}
                    {isCreating || isUpdating ? "Đang lưu..." : "Lưu bản thảo"}
                  </button>
                )}
              </div>
            </div>

            {/* Thanh Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ACCORDION 1: THÔNG TIN CHUNG                                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div
              onClick={() => toggleAccordion("general")}
              className="p-4 md:p-5 flex items-center justify-between cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors border-b border-border/50"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Thông tin chung
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Tiêu đề, phân loại chuyên môn, cấp bậc và khung định biên
                    lương
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${
                  accordions.general ? "rotate-180" : ""
                }`}
              />
            </div>

            {accordions.general && (
              <div className="p-5 md:p-6 space-y-4 fade-in">
                {/* Tiêu đề tin */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Tiêu đề tin tuyển dụng{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.publicTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, publicTitle: e.target.value })
                    }
                    placeholder="Vd: Kỹ Sư Kết Cấu - Dự Án Nhà Xưởng Cao Tầng"
                    className="input-base w-full text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Vị trí chuyên môn (Specialization)
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                      placeholder="Vd: Thiết kế kết cấu thép, MEP, BIM Coordinator"
                      className="input-base w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Kiến thức ngành (Domain Knowledge)
                    </label>
                    <input
                      type="text"
                      value={formData.domainKnowledge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          domainKnowledge: e.target.value,
                        })
                      }
                      placeholder="Vd: Tiêu chuẩn TCVN, Eurocode, Xây dựng dân dụng & công nghiệp"
                      className="input-base w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Cấp bậc
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: e.target.value as any,
                        })
                      }
                      className="input-base w-full text-xs bg-background"
                    >
                      {Object.values(JobLevel).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Loại công việc
                    </label>
                    <select
                      value={formData.jobType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jobType: e.target.value as any,
                        })
                      }
                      className="input-base w-full text-xs bg-background"
                    >
                      {Object.values(JobType).map((jt) => (
                        <option key={jt} value={jt}>
                          {jt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Hình thức làm việc
                    </label>
                    <select
                      value={formData.workingModel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workingModel: e.target.value as any,
                        })
                      }
                      className="input-base w-full text-xs bg-background"
                    >
                      {Object.values(WorkingModel).map((wm) => (
                        <option key={wm} value={wm}>
                          {wm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mức lương */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground">
                      Mức lương định biên (VND)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isSalaryNegotiable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isSalaryNegotiable: e.target.checked,
                          })
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Thỏa thuận khi phỏng vấn</span>
                    </label>
                  </div>

                  {!formData.isSalaryNegotiable && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-muted-foreground mb-1 block">
                          Tối thiểu (Min)
                        </span>
                        <input
                          type="number"
                          step={1000000}
                          value={formData.salaryMin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryMin: Number(e.target.value),
                            })
                          }
                          className="input-base w-full text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground mb-1 block">
                          Tối đa (Max)
                        </span>
                        <input
                          type="number"
                          step={1000000}
                          value={formData.salaryMax}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryMax: Number(e.target.value),
                            })
                          }
                          className="input-base w-full text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ACCORDION 2: MÔ TẢ CÔNG VIỆC                                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div
              onClick={() => toggleAccordion("description")}
              className="p-4 md:p-5 flex items-center justify-between cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors border-b border-border/50"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Mô tả công việc & Đãi ngộ
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Trách nhiệm, tiêu chuẩn tuyển, quyền lợi, địa điểm và thời
                    gian làm việc
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${
                  accordions.description ? "rotate-180" : ""
                }`}
              />
            </div>

            {accordions.description && (
              <div className="p-5 md:p-6 space-y-4 fade-in">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Mô tả công việc (Job Description){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.jobDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jobDescription: e.target.value,
                      })
                    }
                    placeholder="Mô tả các đầu việc chính ứng viên phải đảm nhiệm hàng ngày..."
                    className="input-base w-full text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Yêu cầu ứng viên (Requirements){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    placeholder="Các năng lực, kinh nghiệm thực tế, văn bằng chuyên ngành cần có..."
                    className="input-base w-full text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Quyền lợi ứng viên (Benefits){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    placeholder="Lương tháng 13, thưởng theo công trình, bảo hiểm sức khỏe cao cấp..."
                    className="input-base w-full text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Quyền lợi bổ sung (Tăng tính cạnh tranh tuyển dụng)
                  </label>
                  <input
                    type="text"
                    value={formData.extraBenefits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extraBenefits: e.target.value,
                      })
                    }
                    placeholder="Vd: Phụ cấp công tác xa nhà, cấp xe đưa đón hiện trường, laptop cấu hình cao..."
                    className="input-base w-full text-xs"
                  />
                </div>

                {/* Địa điểm làm việc */}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-foreground">
                      Địa điểm làm việc
                    </label>
                  </div>
                  <div className="space-y-2">
                    {formData.workLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/60 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground mr-1.5">
                            {loc.label}:
                          </span>
                          <span className="text-muted-foreground truncate">
                            {loc.address}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = formData.workLocations.filter(
                              (_, i) => i !== idx,
                            );
                            setFormData({
                              ...formData,
                              workLocations: filtered,
                            });
                          }}
                          className="p-1 hover:bg-muted text-muted-foreground hover:text-red-500 rounded"
                        >
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Tên khu vực (vd: Công trường Đồng Nai)"
                        value={newLocation.label}
                        onChange={(e) =>
                          setNewLocation({
                            ...newLocation,
                            label: e.target.value,
                          })
                        }
                        className="input-base text-xs w-1/3"
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ cụ thể"
                        value={newLocation.address}
                        onChange={(e) =>
                          setNewLocation({
                            ...newLocation,
                            address: e.target.value,
                          })
                        }
                        className="input-base text-xs flex-1"
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
                            setNewLocation({ label: "", address: "" });
                          }
                        }}
                        className="btn-secondary text-xs px-3"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thời gian làm việc */}
                <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Thời gian làm việc tiêu chuẩn
                    </label>
                    <input
                      type="text"
                      value={formData.workingHoursStandard}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workingHoursStandard: e.target.value,
                        })
                      }
                      placeholder="Thứ 2 – Thứ 6: 08:00 – 17:00"
                      className="input-base w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Chi tiết ca / Nghỉ trưa
                    </label>
                    <input
                      type="text"
                      value={formData.workingHoursDetail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workingHoursDetail: e.target.value,
                        })
                      }
                      placeholder="Nghỉ trưa 11h30 – 13h00; Thứ 7 làm buổi sáng"
                      className="input-base w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ACCORDION 3: KỲ VỌNG VỀ ỨNG VIÊN                             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div
              onClick={() => toggleAccordion("expectations")}
              className="p-4 md:p-5 flex items-center justify-between cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors border-b border-border/50"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Kỳ vọng về ứng viên
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Học vấn, kinh nghiệm, độ tuổi, kỹ năng trọng tâm và ngoại
                    ngữ
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${
                  accordions.expectations ? "rotate-180" : ""
                }`}
              />
            </div>

            {accordions.expectations && (
              <div className="p-5 md:p-6 space-y-4 fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Học vấn tối thiểu
                    </label>
                    <select
                      value={formData.minEducation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minEducation: e.target.value as any,
                        })
                      }
                      className="input-base w-full text-xs bg-background"
                    >
                      {Object.values(EducationLevel).map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Số năm kinh nghiệm
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.experienceYears}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experienceYears: Number(e.target.value),
                        })
                      }
                      className="input-base w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Giới tính
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as any,
                        })
                      }
                      className="input-base w-full text-xs bg-background"
                    >
                      {Object.values(CandidateGender).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Độ tuổi */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Độ tuổi kỳ vọng
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="VD: 24"
                      value={formData.ageMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ageMin: Number(e.target.value),
                        })
                      }
                      className="input-base w-32 text-xs font-mono"
                    />
                    <span className="text-muted-foreground text-xs">đến</span>
                    <input
                      type="number"
                      placeholder="VD: 35"
                      value={formData.ageMax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ageMax: Number(e.target.value),
                        })
                      }
                      className="input-base w-32 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Kỹ năng cần có */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Kỹ năng cần có (Must-Have Skills)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.mustHaveSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              mustHaveSkills: formData.mustHaveSkills.filter(
                                (_, i) => i !== index,
                              ),
                            });
                          }}
                          className="hover:text-red-500"
                        >
                          <CloseIcon size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Thêm kỹ năng bắt buộc (nhấn Enter)"
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
                      className="input-base text-xs flex-1"
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
                      className="btn-secondary text-xs px-3"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Kỹ năng nên có & Ngoại ngữ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Kỹ năng nên có (Nice-to-Have)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.niceToHaveSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-foreground border border-border"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                niceToHaveSkills:
                                  formData.niceToHaveSkills.filter(
                                    (_, i) => i !== index,
                                  ),
                              });
                            }}
                          >
                            <CloseIcon size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Thêm kỹ năng..."
                        value={niceToHaveInput}
                        onChange={(e) => setNiceToHaveInput(e.target.value)}
                        className="input-base text-xs flex-1"
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
                        className="btn-secondary text-xs px-2.5"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Ngoại ngữ
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-foreground border border-border"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                languages: formData.languages.filter(
                                  (_, i) => i !== index,
                                ),
                              });
                            }}
                          >
                            <CloseIcon size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="VD: Tiếng Anh, Tiếng Nhật..."
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        className="input-base text-xs flex-1"
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
                        className="btn-secondary text-xs px-2.5"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ACCORDION 4: THÔNG TIN NHẬN HỒ SƠ                             */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div
              onClick={() => toggleAccordion("contact")}
              className="p-4 md:p-5 flex items-center justify-between cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors border-b border-border/50"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Thông tin nhận hồ sơ & Chiến dịch
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Hạn nộp hồ sơ, số lượng tuyển dụng, chuyên viên phụ trách và
                    chiến dịch
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${
                  accordions.contact ? "rotate-180" : ""
                }`}
              />
            </div>

            {accordions.contact && (
              <div className="p-5 md:p-6 space-y-4 fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Hạn nhận hồ sơ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicationDeadline: e.target.value,
                        })
                      }
                      className="input-base w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Số lượng cần tuyển (Headcount){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.headcount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          headcount: Number(e.target.value),
                        })
                      }
                      className="input-base w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Họ và tên người nhận hồ sơ{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.hrRecipientName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hrRecipientName: e.target.value,
                        })
                      }
                      placeholder="VD: TD Chính Nam"
                      className="input-base w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="text"
                      value={formData.hrRecipientPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hrRecipientPhone: e.target.value,
                        })
                      }
                      placeholder="0937546739"
                      className="input-base w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Email nhận hồ sơ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.hrRecipientEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hrRecipientEmail: e.target.value,
                        })
                      }
                      placeholder="talent@chinhnambkd.vn"
                      className="input-base w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Chiến dịch tuyển dụng
                  </label>
                  <input
                    type="text"
                    value={formData.campaignName}
                    onChange={(e) =>
                      setFormData({ ...formData, campaignName: e.target.value })
                    }
                    placeholder="VD: Đợt tuyển dụng Kỹ sư MEP Quý 3/2026"
                    className="input-base w-full text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 1: CHỌN BẢN MẪU JD CÓ SẴN ─── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck2 size={16} className="text-blue-600" /> Chọn JD có
                sẵn trong Thư viện
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!templatesRes?.data?.length ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Chưa có bản mẫu JD nào được lưu trong hệ thống.
                </p>
              ) : (
                templatesRes.data.map((tmpl: any) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">
                        {tmpl.publicTitle}
                      </h4>
                      <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {tmpl.jobCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {tmpl.jobDescription}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Cấp bậc: {tmpl.level}</span>·
                      <span>Kinh nghiệm: {tmpl.experienceYears} năm</span>·
                      <span>Hình thức: {tmpl.workingModel}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: GỢI Ý BẢN THẢO BẰNG AI ─── */}
      {showAiPromptModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 text-purple-600">
                <Wand2 size={16} /> Soạn thảo tự động bằng AI
              </h3>
              <button
                onClick={() => setShowAiPromptModal(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Nhập mô tả tóm tắt nhu cầu bổ sung nhân sự, AI sẽ suy luận kỹ
              năng, định biên lương và điền hoàn chỉnh 4 phần của tin tuyển
              dụng:
            </p>

            <textarea
              rows={5}
              value={aiCustomPrompt}
              onChange={(e) => setAiCustomPrompt(e.target.value)}
              placeholder="Vd: Tuyển 2 Kỹ sư MEP hiện trường dự án tại Đồng Nai. Cần kinh nghiệm giám sát thi công thực tế và bóc tách khối lượng Revit, lương thỏa thuận..."
              className="input-base w-full text-xs leading-relaxed"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowAiPromptModal(false)}
                disabled={isAiRunning}
                className="btn-secondary text-xs px-3 py-2"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteAiSuggest}
                disabled={!aiCustomPrompt.trim() || isAiRunning}
                className="btn-primary text-xs px-4 py-2 bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Sparkles size={13} />{" "}
                {isAiRunning
                  ? "Đang suy luận & điền mẫu..."
                  : "Tự động sinh JD"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
