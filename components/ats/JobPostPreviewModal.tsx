/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Copy,
  X as CloseIcon,
  MapPin,
  Clock,
  Send,
  Heart,
  Bell,
  Award,
  Lightbulb,
  Puzzle,
  Sparkles,
  Banknote,
  ThumbsUp,
  MessageSquare,
  Share2,
  Check,
  MoreHorizontal,
  Plus,
  HelpCircle,
  ArrowRight,
  Globe,
  Bookmark,
  Building2,
} from "lucide-react";
import { gooeyToast } from "@/components/ui/goey-toaster";

type PreviewPlatform = "topcv" | "linkedin" | "facebook";

interface JobPostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  departmentName?: string;
  jobPost?: any;
  req?: any;
}

export default function JobPostPreviewModal({
  isOpen,
  onClose,
  formData,
  departmentName = "Kỹ thuật Xây dựng / EPC",
  jobPost,
  req,
}: JobPostPreviewModalProps) {
  const [platform, setPlatform] = useState<PreviewPlatform>("topcv");

  if (!isOpen || !formData) return null;

  const title = formData.publicTitle || "Bản thảo tin tuyển dụng";
  const dept = departmentName;

  const salaryDisplay = formData.isSalaryNegotiable
    ? "Thoả thuận"
    : formData.salaryMin
      ? `${(formData.salaryMin / 1000000).toFixed(0)} - ${(formData.salaryMax / 1000000).toFixed(0)} triệu`
      : "Thoả thuận";

  const locations =
    formData.workLocations && formData.workLocations.length > 0
      ? formData.workLocations
      : [{ label: "Hồ Chí Minh", address: "Khu Công nghệ cao, TP. Thủ Đức, TP.HCM" }];

  const primaryLocation = locations[0]?.label || "Hồ Chí Minh";

  const formattedDeadline = formData.applicationDeadline
    ? new Date(formData.applicationDeadline).toLocaleDateString("vi-VN")
    : "04/10/2026";

  const workingModelLabel =
    formData.workingModel === "ON_SITE"
      ? "On-site"
      : formData.workingModel === "HYBRID"
        ? "Hybrid"
        : "Remote";

  const jobTypeLabel =
    formData.jobType === "FULL_TIME"
      ? "Full-time"
      : formData.jobType === "PART_TIME"
        ? "Part-time"
        : "Contract";

  // ─── TỔNG HỢP TOÀN BỘ DỮ LIỆU TỪ FORMDATA SANG ĐỊNH DẠNG MARKDOWN ─────────
  const generateMarkdownContent = () => {
    const locationsStr = locations.map((l: any) => `${l.label}: ${l.address}`).join(" | ");
    const educationStr =
      formData.minEducation === "BACHELOR"
        ? "Đại học trở lên"
        : formData.minEducation || "Đại học";

    return `# 📢 THÔNG BÁO TUYỂN DỤNG: ${title.toUpperCase()}

**Mã tin:** ${jobPost?.jobCode || req?.requestCode || "JOB-2026-ATS"}
**Công ty:** Công ty Cổ phần Thiết kế Xây dựng Chính Nam
**Khối / Phòng ban:** ${dept}
**Chuyên môn:** ${formData.specialization || "Kỹ thuật công trình"}
**Lĩnh vực / Kiến thức ngành:** ${formData.domainKnowledge || "EPC, Xây dựng dân dụng & công nghiệp"}
**Cấp bậc:** ${formData.level || "MIDDLE / SENIOR"}
**Hình thức làm việc:** ${jobTypeLabel} (${workingModelLabel})

---

### 💰 MỨC LƯƠNG & CHẾ ĐỘ ĐÃI NGỘ
* **Mức lương:** ${salaryDisplay}
${formData.benefits ? formData.benefits : "• Lương thưởng cạnh tranh theo năng lực và kết quả dự án."}
${formData.extraBenefits ? `* **Quyền lợi bổ sung:** ${formData.extraBenefits}` : ""}

---

### 📌 MÔ TẢ CÔNG VIỆC
${formData.jobDescription || "Đang cập nhật nội dung công việc..."}

---

### 🎯 YÊU CẦU ỨNG VIÊN
${formData.requirements || "Đang cập nhật yêu cầu năng lực..."}

* **Kinh nghiệm:** ${formData.experienceYears || 3} năm kinh nghiệm chuyên môn
* **Trình độ học vấn:** ${educationStr}
* **Độ tuổi / Giới tính:** ${formData.ageMin || 24} - ${formData.ageMax || 40} tuổi | ${
      formData.gender === "ANY" ? "Nam / Nữ" : formData.gender || "Không yêu cầu"
    }
* **Kỹ năng cốt lõi (Must-Have):** ${(formData.mustHaveSkills || []).join(", ") || "Theo mô tả"}
* **Kỹ năng ưu tiên (Nice-to-Have):** ${(formData.niceToHaveSkills || []).join(", ") || "Theo mô tả"}
* **Ngoại ngữ:** ${(formData.languages || []).join(", ") || "Tiếng Việt / Tiếng Anh"}

---

### 📍 ĐỊA ĐIỂM & THỜI GIAN LÀM VIỆC
* **Địa điểm:** ${locationsStr}
* **Thời gian làm việc:** ${formData.workingHoursStandard || "Thứ 2 – Thứ 6: 08:00 – 17:00"} (${
      formData.workingHoursDetail || "Nghỉ trưa 11h30 – 13h00"
    })

---

### 📬 CÁCH THỨC LIÊN HỆ & NỘP HỒ SƠ
* **Hạn nộp hồ sơ:** ${formattedDeadline}
* **Người liên hệ:** ${formData.hrRecipientName || "Bộ phận Tuyển dụng Chính Nam"}
* **Số điện thoại:** ${formData.hrRecipientPhone || "0937546739"}
* **Email tiếp nhận CV:** ${formData.hrRecipientEmail || "talent@chinhnambkd.vn"}
* **Chiến dịch tuyển dụng:** ${formData.campaignName || "Chiến dịch tuyển dụng 2026"}

*Ứng viên nộp hồ sơ bằng cách gửi CV về email với tiêu đề: [Họ và tên] - [${title}]*
#Tuyendung #ChinhNam #EPC #Kysuxaydung #Hiring2026`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdownContent();
      await navigator.clipboard.writeText(md);
      gooeyToast.success("Đã sao chép toàn bộ nội dung Markdown!");
    } catch {
      gooeyToast.error("Không thể sao chép văn bản.");
    }
  };

  // Helper render các dòng text theo chuẩn gạch đầu dòng TopCV
  const renderFormattedText = (text: string) => {
    if (!text) return <p className="text-slate-500 italic text-sm">Chưa có thông tin cập nhật.</p>;
    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-[14px] text-slate-700 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 shrink-0" />
                <span className="flex-1">{trimmed.replace(/^[-*•]\s*/, "")}</span>
              </div>
            );
          }
          if (/^\d+\.\s+/.test(trimmed)) {
            return (
              <p key={idx} className="font-bold text-slate-900 pt-2 text-[14.5px]">
                {trimmed}
              </p>
            );
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* ========================================================================= */}
        {/* HEADER MODAL: CHỨA CẢ PLATFORM SELECTOR TABS & ACTION BUTTONS             */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-card gap-3 flex-wrap">
          {/* Cụm Tabs Nền tảng */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/80">
            <button
              type="button"
              onClick={() => setPlatform("topcv")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                platform === "topcv"
                  ? "bg-[#00b14f] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black">
                CV
              </span>
              <span>TopCV</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform("linkedin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                platform === "linkedin"
                  ? "bg-[#0a66c2] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black">
                in
              </span>
              <span>LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform("facebook")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                platform === "facebook"
                  ? "bg-[#1877f2] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black">
                f
              </span>
              <span>Facebook</span>
            </button>
          </div>

          {/* Action buttons (Copy Markdown & Close) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Sao chép toàn bộ văn bản Markdown"
            >
              <Copy size={13} />
              <span className="hidden sm:inline">Copy Markdown</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CANVAS NỘI DUNG (KHÔNG CÓ FOOTER, TỰ ĐỘNG SCROLL HOÀN TOÀN)                */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f4f5f7] custom-scrollbar">
          {/* ========================================================================= */}
          {/* 1. TOPCV LAYOUT (THIẾT KẾ CHUẨN THEO CẢ 3 HÌNH ẢNH MẪU TOPCV)             */}
          {/* ========================================================================= */}
          {platform === "topcv" && (
            <div className="max-w-3xl mx-auto space-y-4 font-sans fade-in pb-2">
              {/* CARD 1: BANNER TIÊU ĐỀ & ACTIONS (ẢNH 1) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                    {title}
                  </h1>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-base md:text-lg font-bold text-[#00b14f]">
                      {salaryDisplay}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-500 hover:text-[#00b14f] cursor-pointer font-medium">
                      Xem mức lương thị trường cho vị trí này &gt;
                    </span>
                  </div>
                </div>

                {/* Grid 3 cột thông số có badge icon tròn xanh lá */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00b14f] flex items-center justify-center shrink-0 border border-emerald-100">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Địa điểm</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{primaryLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00b14f] flex items-center justify-center shrink-0 border border-emerald-100">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Kinh nghiệm</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {formData.experienceYears} năm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00b14f] flex items-center justify-center shrink-0 border border-emerald-100">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Hạn ứng tuyển</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{formattedDeadline}</p>
                    </div>
                  </div>
                </div>

                {/* Hàng nút bấm: Ứng tuyển ngay (Pill) & Lưu tin */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    className="flex-1 bg-[#00b14f] hover:bg-[#009643] text-white font-bold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send size={15} /> Ứng tuyển ngay
                  </button>

                  <button
                    type="button"
                    className="border border-[#00b14f] text-[#00b14f] hover:bg-emerald-50 font-semibold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Heart size={16} /> Lưu tin
                  </button>
                </div>
              </div>

              {/* CARD 2: CHI TIẾT JD (ẢNH 1, ẢNH 2 & ẢNH 3) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-8">
                {/* 1. KHỐI TỔNG QUAN (ẢNH 1) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-l-4 border-[#00b14f] pl-3 py-0.5">
                    <h3 className="text-lg font-bold text-slate-800">Tổng quan</h3>
                    <span className="text-xs font-semibold text-[#00b14f] hover:underline flex items-center gap-1 cursor-pointer">
                      <Bell size={13} /> Gửi tôi việc làm tương tự
                    </span>
                  </div>

                  <div className="space-y-3 pt-1 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                      <span className="sm:col-span-2 text-slate-600 font-medium pt-1">Yêu cầu:</span>
                      <div className="sm:col-span-10 flex flex-wrap gap-2">
                        <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium">
                          {formData.experienceYears} năm kinh nghiệm chuyên môn
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium">
                          {formData.minEducation === "BACHELOR"
                            ? "Đại Học trở lên"
                            : formData.minEducation || "Đại học"}
                        </span>
                        {(formData.languages || ["Tiếng Việt", "Tiếng Anh"]).map((lang: string) => (
                          <span
                            key={lang}
                            className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium"
                          >
                            {lang} Đọc hiểu
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                      <span className="sm:col-span-2 text-slate-600 font-medium pt-1">Quyền lợi:</span>
                      <div className="sm:col-span-10 flex flex-wrap gap-2">
                        <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium">
                          Phụ cấp: {formData.extraBenefits || "Ăn trưa, công tác phí"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                      <span className="sm:col-span-2 text-slate-600 font-medium pt-1">Chuyên môn:</span>
                      <div className="sm:col-span-10 flex flex-wrap gap-2">
                        <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium">
                          {formData.specialization || "Kỹ thuật Xây dựng"}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium">
                          {formData.domainKnowledge || "Tổng thầu EPC"}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-medium">
                          {dept}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KHỐI MÔ TẢ CÔNG VIỆC (ẢNH 1) */}
                <div className="space-y-3">
                  <div className="border-l-4 border-[#00b14f] pl-3 py-0.5">
                    <h3 className="text-lg font-bold text-slate-800">Mô tả công việc</h3>
                  </div>
                  <div>{renderFormattedText(formData.jobDescription)}</div>
                </div>

                {/* 3. KHỐI YÊU CẦU ỨNG VIÊN & BOX TIÊU CHUẨN NGÀNH (ẢNH 2) */}
                <div className="space-y-4">
                  <div className="border-l-4 border-[#00b14f] pl-3 py-0.5">
                    <h3 className="text-lg font-bold text-slate-800">Yêu cầu ứng viên</h3>
                  </div>
                  <div>{renderFormattedText(formData.requirements)}</div>

                  {/* Hộp bo góc hiển thị Kiến thức ngành, Kỹ năng cần có & Kỹ năng nên có */}
                  <div className="mt-4 border border-slate-200/80 bg-slate-50/50 rounded-2xl p-5 space-y-4.5">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
                        <Lightbulb size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Kiến thức ngành</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {formData.specialization || "Kỹ thuật Xây dựng"},{" "}
                          {formData.domainKnowledge || "EPC"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
                        <Puzzle size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Kỹ năng cần có</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {(formData.mustHaveSkills || []).join(", ") || "AutoCAD, BIM, Đọc bản vẽ"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Kỹ năng nên có</p>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {(formData.niceToHaveSkills || []).join(", ") ||
                            "Tiếng Anh chuyên ngành, Quản lý hợp đồng"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. KHỐI QUYỀN LỢI ỨNG VIÊN & QUYỀN LỢI BỔ SUNG (ẢNH 3) */}
                <div className="space-y-4">
                  <div className="border-l-4 border-[#00b14f] pl-3 py-0.5">
                    <h3 className="text-lg font-bold text-slate-800">Quyền lợi ứng viên</h3>
                  </div>
                  <div>{renderFormattedText(formData.benefits)}</div>

                  {/* Thẻ Quyền lợi bổ sung */}
                  <div className="mt-4 border border-slate-200/80 rounded-2xl p-5 bg-white space-y-3 shadow-2xs">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      QUYỀN LỢI BỔ SUNG
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Banknote size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Phụ cấp</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {formData.extraBenefits || "Ăn trưa, hỗ trợ chỗ ở công trường"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. KHỐI ĐỊA ĐIỂM VÀ THỜI GIAN & ACTION FOOTER (ẢNH 3) */}
                <div className="space-y-4 pt-2">
                  <div className="border-l-4 border-[#00b14f] pl-3 py-0.5">
                    <h3 className="text-lg font-bold text-slate-800">Địa điểm và thời gian</h3>
                  </div>

                  <div className="space-y-3 text-[14px] text-slate-700">
                    <div>
                      <p className="font-bold text-slate-800 mb-1">Địa điểm làm việc</p>
                      {locations.map((loc: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 shrink-0" />
                          <p>
                            <strong>{loc.label || "Hồ Chí Minh"}:</strong> {loc.address}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 mb-1">Thời gian làm việc</p>
                      <div className="flex items-start gap-2 pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 shrink-0" />
                        <p>
                          {formData.workingHoursStandard || "Thứ 2 – Thứ 6: 08:00 – 17:00"} (
                          {formData.workingHoursDetail || "Nghỉ trưa 11h30 – 13h00"})
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 mb-1">Cách thức ứng tuyển</p>
                      <div className="flex items-start gap-2 pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 shrink-0" />
                        <p>
                          Ứng viên nộp hồ sơ trực tuyến bằng cách bấm <strong>Ứng tuyển</strong> ngay
                          dưới đây.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cụm nút hành động lặp lại cuối trang */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      className="bg-[#00b14f] hover:bg-[#009643] text-white font-bold text-sm py-3 px-8 rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send size={15} /> Ứng tuyển ngay
                    </button>

                    <button
                      type="button"
                      className="border border-[#00b14f] text-[#00b14f] hover:bg-emerald-50 font-semibold text-sm py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Heart size={16} /> Lưu tin
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 pt-1">
                    Hạn ứng tuyển: <strong className="text-slate-800">{formattedDeadline}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. LINKEDIN JOB VIEW (CHUẨN THEO 3 ẢNH MẪU LINKEDIN CAREERS)               */}
          {/* ========================================================================= */}
          {platform === "linkedin" && (
            <div className="max-w-2xl mx-auto space-y-4 font-sans fade-in pb-2">
              {/* CARD 1: LINKEDIN HEADER (ẢNH 1 LINKEDIN) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xs">
                      CN
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      Chính Nam Careers
                    </span>
                  </div>
                  <button type="button" className="text-slate-500 hover:text-slate-800 p-1">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
                  <p className="text-xs text-slate-500">
                    {primaryLocation}, Vietnam · Vừa xong · 0 applicants
                  </p>
                  <p className="text-xs text-slate-600 pt-0.5">
                    Company review time is typically 1 week
                  </p>
                </div>

                {/* Pill Badges with checkmarks */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 text-xs font-medium text-slate-800 bg-white shadow-2xs">
                    <Check size={13} className="text-slate-700" /> {workingModelLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 text-xs font-medium text-slate-800 bg-white shadow-2xs">
                    <Check size={13} className="text-slate-700" /> {jobTypeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 text-xs font-medium text-slate-800 bg-white shadow-2xs">
                    <Check size={13} className="text-slate-700" /> {formData.level || "Senior"}
                  </span>
                </div>

                {/* Action CTA Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Easy Apply</span>
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark size={14} /> Lưu việc làm
                  </button>
                </div>
              </div>

              {/* CARD 2: ABOUT THE JOB (ẢNH 2 LINKEDIN) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-slate-900">About the job</h2>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900">Our Company</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Công ty Cổ phần Thiết kế Xây dựng Chính Nam là tổng thầu EPC chuyên nghiệp hàng
                    đầu, cung cấp giải pháp thiết kế - thi công đồng bộ cho các dự án công nghiệp,
                    nhà xưởng cao tầng và cơ sở hạ tầng kỹ thuật hiện đại.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900">Role Description</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {formData.jobDescription ||
                      "Vị trí này chịu trách nhiệm chủ chốt trong việc kiểm soát khối lượng, tiến độ và chất lượng kỹ thuật các công trình."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900">Requirements & Skills</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {formData.requirements || "Kinh nghiệm chuyên môn phù hợp với vị trí tuyển dụng."}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {(formData.mustHaveSkills || []).map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900">Compensation & Benefits</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {formData.benefits || `Mức lương: ${salaryDisplay}`}
                  </p>
                </div>
              </div>

              {/* CARD 3: ABOUT THE COMPANY (ẢNH 3 LINKEDIN) */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900">About the company</h2>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold text-base">
                      CN
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        Chính Nam Careers
                      </h3>
                      <p className="text-xs text-slate-500">1,774 followers</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Follow
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Civil & Industrial Engineering · 51-200 employees · Ho Chi Minh City
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Chính Nam là đơn vị tiên phong trong lĩnh vực kỹ thuật xây dựng và chuyển đổi số
                  quản lý công trình, kiến tạo môi trường làm việc cởi mở và khuyến khích phát triển
                  năng lực cho từng nhân sự...
                </p>

                {/* Commitments Box */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span>Commitments</span>
                    <HelpCircle size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">
                      Career growth and learning
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Driven by engineering excellence, our team is united by innovation and
                      professional development...
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Learn more
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <span className="text-xs font-bold text-slate-700 hover:text-[#0a66c2] inline-flex items-center gap-1 cursor-pointer">
                    Show more <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. FACEBOOK FEED POST (TRANSLATED MARKDOWN TEXT + RECRUITMENT BANNER)       */}
          {/* ========================================================================= */}
          {platform === "facebook" && (
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans text-slate-900 fade-in pb-2">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877f2] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    CN
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-xs text-slate-900 hover:underline cursor-pointer">
                        Chính Nam Construction & Engineering
                      </h4>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#1877f2] text-white text-[9px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Vừa xong</span>·<Globe size={11} />
                    </p>
                  </div>
                </div>

                <button type="button" className="text-slate-400 hover:text-slate-700 p-1">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Post Body: Translated version of markdown */}
              <div className="px-4 pb-3 space-y-3 text-xs leading-relaxed text-slate-800">
                <p className="font-bold text-sm text-[#1877f2]">
                  🚀 [CHÍNH NAM TUYỂN DỤNG] {title.toUpperCase()} 🌟
                </p>

                <p>
                  Đồng hành cùng đội ngũ kỹ sư Chính Nam triển khai các dự án tổng thầu EPC công
                  nghiệp quy mô lớn trong Quý 3/2026!
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <p>
                    💰 <strong>Mức lương định biên:</strong> {salaryDisplay}
                  </p>
                  <p>
                    🏢 <strong>Khối / Phòng ban:</strong> {dept}
                  </p>
                  <p>
                    📍 <strong>Địa điểm làm việc:</strong>{" "}
                    {locations.map((l: any) => `${l.label} (${l.address})`).join("; ")}
                  </p>
                  <p>
                    🎯 <strong>Kinh nghiệm yêu cầu:</strong> {formData.experienceYears} năm (
                    {formData.level})
                  </p>
                  <p>
                    ⏰ <strong>Giờ làm việc:</strong> {formData.workingHoursStandard || "08:00 – 17:00"}
                  </p>
                </div>

                {/* Yêu cầu trọng tâm */}
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-900">📌 Yêu cầu chuyên môn:</p>
                  <div className="pl-1">
                    {renderFormattedText(formData.requirements || "Theo thỏa thuận chi tiết")}
                  </div>
                </div>

                {/* Quyền lợi */}
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-900">✨ Quyền lợi & Phúc lợi:</p>
                  <div className="pl-1">
                    {renderFormattedText(formData.benefits || "Đầy đủ BHXH và thưởng dự án")}
                  </div>
                </div>

                {/* Hướng dẫn nộp */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1 text-xs">
                  <p className="font-bold text-[#1877f2]">📬 HÌNH THỨC ỨNG TUYỂN NHANH:</p>
                  <p>
                    • Liên hệ: <strong>{formData.hrRecipientName || "HR Chính Nam"}</strong> -{" "}
                    {formData.hrRecipientPhone || "0937546739"}
                  </p>
                  <p>
                    • Gửi CV trực tiếp về:{" "}
                    <strong className="text-[#1877f2]">
                      {formData.hrRecipientEmail || "talent@chinhnambkd.vn"}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tiêu đề: [Họ và tên] - Ứng tuyển {title}
                  </p>
                </div>

                <p className="text-xs text-[#1877f2] font-semibold pt-1">
                  #Tuyendung #ChinhNam #Kysuxaydung #EPC #Hiring2026 #CivilEngineering
                </p>
              </div>

              {/* Recruitment Banner Image at the end */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-t border-b border-slate-200 flex flex-col justify-between p-6 text-white overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Building2 size={120} />
                </div>

                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00b14f] text-white font-black flex items-center justify-center text-xs">
                      CN
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase text-slate-300">
                      CHÍNH NAM EPC
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-600/80 text-white font-bold text-[10px] uppercase tracking-wider">
                    WE ARE HIRING
                  </span>
                </div>

                <div className="space-y-1.5 z-10 my-auto py-2">
                  <span className="text-[11px] font-bold text-[#00b14f] uppercase tracking-widest">
                    Cơ hội nghề nghiệp 2026
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {dept} · {primaryLocation} · {salaryDisplay}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 z-10 text-[11px]">
                  <span className="text-slate-400">chinhnambkd.vn</span>
                  <span className="font-bold text-[#00b14f] flex items-center gap-1">
                    ỨNG TUYỂN NGAY <ArrowRight size={12} />
                  </span>
                </div>
              </div>

              {/* Engagement Stats Bar */}
              <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
                <span className="flex items-center gap-1 font-medium">👍 ❤️ 148</span>
                <span>24 bình luận · 16 lượt chia sẻ</span>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-1 grid grid-cols-3 text-center text-slate-600 text-xs font-semibold">
                <button
                  type="button"
                  className="py-2.5 rounded hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ThumbsUp size={15} /> Thích
                </button>
                <button
                  type="button"
                  className="py-2.5 rounded hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare size={15} /> Bình luận
                </button>
                <button
                  type="button"
                  className="py-2.5 rounded hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 size={15} /> Chia sẻ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}