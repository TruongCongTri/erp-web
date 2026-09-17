/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Eye,
  Copy,
  X as CloseIcon,
  Building2,
  DollarSign,
  MapPin,
  Briefcase,
  Clock,
  ShieldCheck,
  Send,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Share2,
  Heart,
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

  const salaryText = formData.isSalaryNegotiable
    ? "Thỏa thuận"
    : formData.salaryMin
      ? `${(formData.salaryMin / 1000000).toFixed(0)} - ${(formData.salaryMax / 1000000).toFixed(0)} triệu VNĐ`
      : "Thỏa thuận";

  const locationLabel = formData.workLocations?.[0]?.label || "Hồ Chí Minh";
  const locationAddress = formData.workLocations?.[0]?.address || "Khu Công nghệ cao, TP. Thủ Đức, TP.HCM";

  // ─── MARKDOWN CONTENT CHO LINKEDIN & FACEBOOK ───
  const generateMarkdownContent = () => {
    const locationsStr =
      formData.workLocations
        ?.map((l: any) => `${l.label}: ${l.address}`)
        .join(" | ") || locationAddress;

    return `# 📢 THÔNG BÁO TUYỂN DỤNG: ${title.toUpperCase()}
**Mã tin:** ${jobPost?.jobCode || req?.requestCode || "ATS-JOB"}
**Đơn vị:** Công ty Cổ phần Thiết kế Xây dựng Chính Nam
**Bộ phận / Chuyên môn:** ${formData.specialization || dept} (${formData.domainKnowledge || "Dân dụng & Công nghiệp"})
**Mức lương:** ${salaryText}
**Cấp bậc & Hình thức:** ${formData.level || "SENIOR"} | ${formData.jobType || "FULL_TIME"} | ${formData.workingModel || "ON_SITE"}
**Địa điểm làm việc:** ${locationsStr}
**Thời gian làm việc:** ${formData.workingHoursStandard || "Thứ 2 – Thứ 6: 08:00 – 17:00"} (${formData.workingHoursDetail || "Nghỉ trưa"})

---

### 1. MÔ TẢ CÔNG VIỆC
${formData.jobDescription || "Đang cập nhật..."}

### 2. YÊU CẦU ỨNG VIÊN
${formData.requirements || "Đang cập nhật..."}
* Học vấn tối thiểu: ${formData.minEducation || "BACHELOR"}
* Kinh nghiệm yêu cầu: ${formData.experienceYears || 3} năm
* Kỹ năng cốt lõi (Must-Have): ${(formData.mustHaveSkills || []).join(", ")}
* Kỹ năng ưu tiên (Nice-to-Have): ${(formData.niceToHaveSkills || []).join(", ")}
* Ngoại ngữ: ${(formData.languages || []).join(", ")}

### 3. QUYỀN LỢI & ĐÃI NGỘ
${formData.benefits || "Đang cập nhật..."}
${formData.extraBenefits ? `* Chế độ bổ sung: ${formData.extraBenefits}` : ""}

---

### 4. CÁCH THỨC ỨNG TUYỂN
* Hạn nộp hồ sơ: ${formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleDateString("vi-VN") : "30 ngày tới"}
* Đầu mối nhận hồ sơ: ${formData.hrRecipientName || "TD Chính Nam"}
* Số điện thoại liên hệ: ${formData.hrRecipientPhone || "0937546739"}
* Email nhận hồ sơ: ${formData.hrRecipientEmail || "talent@chinhnambkd.vn"}

*Ứng viên quan tâm vui lòng gửi CV theo tiêu đề: [Họ tên] - [Vị trí ứng tuyển] về email trên.*`;
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdownContent();
      await navigator.clipboard.writeText(md);
      gooeyToast.success("Đã sao chép toàn bộ thông tin JD sang định dạng Markdown!");
    } catch {
      gooeyToast.error("Không thể sao chép vào bộ nhớ tạm.");
    }
  };

  const FormattedText = ({ content }: { content: string }) => {
    if (!content)
      return <span className="text-muted-foreground italic">Chưa có thông tin cập nhật.</span>;
    return <div className="space-y-1.5 leading-relaxed whitespace-pre-wrap">{content}</div>;
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-card">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Xem trước định dạng hiển thị thực tế
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Mô phỏng giao diện chuẩn theo các nền tảng TopCV, LinkedIn và Facebook
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
              title="Sao chép toàn bộ văn bản Markdown"
            >
              <Copy size={13} /> Copy Markdown
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

        {/* Platform Selector Tabs */}
        <div className="flex px-6 pt-3 pb-2 border-b border-border/80 bg-muted/20 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPlatform("topcv")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              platform === "topcv"
                ? "bg-[#00b14f] text-white border-[#00b14f] shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black">CV</span>
            <span>TopCV Job Board</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform("linkedin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              platform === "linkedin"
                ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black">in</span>
            <span>LinkedIn Feed Post (Markdown)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform("facebook")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              platform === "facebook"
                ? "bg-[#1877f2] text-white border-[#1877f2] shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black">f</span>
            <span>Facebook Page Post (Markdown)</span>
          </button>
        </div>

        {/* Canvas Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100 dark:bg-neutral-950 custom-scrollbar">
          
          {/* 1. TOPCV LAYOUT CHUẨN XÁC THEO HÌNH ẢNH MẪU */}
          {platform === "topcv" && (
            <div className="max-w-3xl mx-auto space-y-4 fade-in font-sans">
              
              {/* TOP HEADER CARD (Giống ảnh 1) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                  <h1 className="text-lg md:text-xl font-extrabold text-foreground leading-snug">
                    {title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-[#00b14f]">{salaryText}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer">
                      Xem mức lương thị trường cho vị trí này &gt;
                    </span>
                  </div>
                </div>

                {/* 3 Thông số ngang: Địa điểm, Kinh nghiệm, Hạn ứng tuyển */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 border-t border-b border-border/60 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00b14f] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Địa điểm</p>
                      <p className="font-bold text-foreground">{locationLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00b14f] flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Kinh nghiệm</p>
                      <p className="font-bold text-foreground">{formData.experienceYears} năm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00b14f] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Hạn ứng tuyển</p>
                      <p className="font-bold text-foreground">
                        {formData.applicationDeadline
                          ? new Date(formData.applicationDeadline).toLocaleDateString("vi-VN")
                          : "30 ngày tới"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nút Ứng tuyển ngay & Lưu tin */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-xl bg-[#00b14f] text-white font-bold text-xs shadow-md hover:bg-[#009643] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={15} /> Ứng tuyển ngay
                  </button>
                  <button
                    type="button"
                    className="px-5 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Heart size={15} className="text-[#00b14f]" /> Lưu tin
                  </button>
                </div>
              </div>

              {/* SECTION: TỔNG QUAN (Giống ảnh 2) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-l-4 border-[#00b14f] pl-2.5">
                    Tổng quan
                  </h3>
                  <span className="text-[11px] text-[#00b14f] font-semibold hover:underline cursor-pointer">
                    🔔 Gửi tôi việc làm tương tự
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <span className="text-muted-foreground font-medium">Yêu cầu:</span>
                    <div className="sm:col-span-3 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                        {formData.experienceYears} năm kinh nghiệm chuyên môn
                      </span>
                      <span className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                        Học vấn: {formData.minEducation} trở lên
                      </span>
                      {formData.languages?.map((l: string) => (
                        <span key={l} className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <span className="text-muted-foreground font-medium">Quyền lợi:</span>
                    <div className="sm:col-span-3 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                        Phụ cấp: Ăn trưa
                      </span>
                      {formData.extraBenefits && (
                        <span className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                          {formData.extraBenefits}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <span className="text-muted-foreground font-medium">Chuyên môn:</span>
                    <div className="sm:col-span-3 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                        {formData.specialization}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                        {formData.domainKnowledge}
                      </span>
                      {formData.mustHaveSkills?.map((s: string) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-muted text-foreground text-[11px] border border-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: MÔ TẢ CÔNG VIỆC (Giống ảnh 2) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-l-4 border-[#00b14f] pl-2.5">
                  Mô tả công việc
                </h3>
                <div className="text-foreground/90 pl-3 leading-relaxed">
                  <FormattedText content={formData.jobDescription} />
                </div>
              </div>

              {/* SECTION: YÊU CẦU ỨNG VIÊN (Giống ảnh 3) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-l-4 border-[#00b14f] pl-2.5">
                  Yêu cầu ứng viên
                </h3>
                <div className="text-foreground/90 pl-3 space-y-3">
                  <FormattedText content={formData.requirements} />
                  
                  {/* Khung tags kỹ năng chuẩn TopCV (Giống ảnh 3) */}
                  <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">💡</span>
                      <span className="font-bold text-foreground">Hệ thống kỹ năng định lượng:</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Kiến thức ngành:</span>{" "}
                        <span className="font-semibold text-foreground">{formData.domainKnowledge}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kỹ năng cần có:</span>{" "}
                        <span className="font-semibold text-foreground">{(formData.mustHaveSkills || []).join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kỹ năng nên có:</span>{" "}
                        <span className="font-semibold text-foreground">{(formData.niceToHaveSkills || []).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: QUYỀN LỢI ỨNG VIÊN (Giống ảnh 4) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-l-4 border-[#00b14f] pl-2.5">
                  Quyền lợi ứng viên
                </h3>
                <div className="text-foreground/90 pl-3 space-y-3">
                  <FormattedText content={formData.benefits} />

                  <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Quyển lợi bổ sung
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00b14f] flex items-center justify-center shrink-0">
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Phụ cấp</p>
                        <p className="text-muted-foreground">Ăn trưa, Điện thoại & Chuyên cần</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: ĐỊA ĐIỂM VÀ THỜI GIAN (Giống ảnh 4) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-l-4 border-[#00b14f] pl-2.5">
                  Địa điểm và thời gian
                </h3>
                <div className="pl-3 space-y-3 text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Địa điểm làm việc</p>
                    <p className="flex items-start gap-1.5">
                      <MapPin size={13} className="text-[#00b14f] shrink-0 mt-0.5" />
                      <span><strong>{locationLabel}:</strong> {locationAddress}</span>
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground mb-1">Thời gian làm việc</p>
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#00b14f] shrink-0" />
                      <span>{formData.workingHoursStandard} ({formData.workingHoursDetail})</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <p className="font-semibold text-foreground mb-1">Cách thức ứng tuyển</p>
                    <p>Ứng viên nộp hồ sơ trực tuyến bằng cách bấm <strong>Ứng tuyển ngay</strong> ở trên.</p>
                  </div>

                  <div className="text-[11px] text-muted-foreground pt-1">
                    Hạn ứng tuyển: <strong className="text-foreground">{formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleDateString("vi-VN") : "N/A"}</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. LINKEDIN FEED POST */}
          {platform === "linkedin" && (
            <div className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-md overflow-hidden fade-in text-xs font-sans">
              <div className="p-4 flex items-center justify-between border-b border-border/40 bg-muted/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                  <span className="font-bold text-foreground">Định dạng bài đăng LinkedIn (Copy & Paste Markdown)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="btn-primary text-[11px] h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} /> Copy nội dung
                </button>
              </div>

              <div className="p-5 bg-background font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/90 border-b border-border">
                {generateMarkdownContent()}
              </div>

              <div className="p-4 bg-muted/20 text-[11px] text-muted-foreground">
                💡 <em>Mẹo:</em> Nhấn <strong>"Copy Markdown"</strong> để sao chép toàn bộ văn bản và dán trực tiếp lên LinkedIn.
              </div>
            </div>
          )}

          {/* 3. FACEBOOK PAGE POST */}
          {platform === "facebook" && (
            <div className="max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-md overflow-hidden fade-in text-xs font-sans">
              <div className="p-4 flex items-center justify-between border-b border-border/40 bg-muted/40 bg-muted/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <span className="font-bold text-foreground">Định dạng bài đăng Facebook Page (Copy & Paste Markdown)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="btn-primary text-[11px] h-7 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} /> Copy nội dung
                </button>
              </div>

              <div className="p-5 bg-background font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/90 border-b border-border">
                {generateMarkdownContent()}
              </div>

              <div className="p-4 bg-muted/20 text-[11px] text-muted-foreground">
                💡 <em>Mẹo:</em> Nội dung được định dạng chuẩn markdown, tối ưu cho việc truyền thông sự kiện tuyển dụng qua Facebook Fanpage.
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card shrink-0">
          <span className="text-xs text-muted-foreground">
            Bản xem trước trực quan khớp hoàn toàn với dữ liệu thời gian thực trong form biên tập.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs px-5 py-2 cursor-pointer"
          >
            Đóng xem trước
          </button>
        </div>
      </div>
    </div>
  );
}