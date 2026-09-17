/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Sparkles,
  Globe,
  CheckCircle,
  Clock,
  Trash2,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  Calendar,
  Layers,
  Send,
  ExternalLink,
  Activity,
  CheckCircle2,
  Briefcase,
  Share2,
  Copy,
  ChevronRight,
  Mail,
  Phone,
  Tag,
} from "lucide-react";
import {
  jobRequisitions,
  JobRequisition,
  RequisitionStatus,
  getApplicationsForJobPost,
} from "./candidateData";
import {
  HorizontalDetailLayout,
  HorizontalDetailAccordion,
} from "@/components/layouts/HorizontalDetailLayout";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ─── STATUS BADGE CONFIG ──────────────────────────────────────────────────────
const REQ_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending_hr: {
    label: "Chờ HR tiếp nhận",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  jd_generated: {
    label: "JD sẵn sàng",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  pending_review: {
    label: "Chờ duyệt",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotClass: "bg-purple-500",
  },
  published: {
    label: "Đang đăng tuyển",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  closed: {
    label: "Đã đóng",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = REQ_STATUS_CONFIG[status] || REQ_STATUS_CONFIG.closed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function JobRecruitmentDetailContent({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const router = useRouter();
  const initial =
    jobRequisitions.find((r) => r.id === id) ?? jobRequisitions[0];
  const [req, setReq] = useState<JobRequisition>(initial);

  // Canvas Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "jd" | "publish" | "applications"
  >("overview");

  // Docked Horizontal Accordions state (exclusive toggle for optimal horizontal spacing)
  const [activePanel, setActivePanel] = useState<
    "workflow" | "metadata" | null
  >("workflow");

  const togglePanel = (panel: "workflow" | "metadata") => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const applications =
    req.status === "published" ? getApplicationsForJobPost(req.id) : [];

  const tabs: {
    id: "overview" | "jd" | "publish" | "applications";
    label: string;
  }[] = [
    { id: "overview", label: "Tổng quan vị trí" },
    { id: "jd", label: "Mô tả công việc (JD)" },
    { id: "publish", label: "Kênh đăng tuyển" },
    ...(req.status === "published"
      ? [
          {
            id: "applications" as const,
            label: `Ứng viên (${applications.length})`,
          },
        ]
      : []),
  ];

  // Actions
  const handleGenerateAI = () => {
    setReq((prev) => ({
      ...prev,
      status: "jd_generated" as RequisitionStatus,
    }));
    gooeyToast.success("AI đã soạn thảo JD thành công!");
    setActiveTab("jd");
  };

  const handlePublishJob = () => {
    setReq((prev) => ({
      ...prev,
      status: "published" as RequisitionStatus,
    }));
    gooeyToast.success(
      "Tin tuyển dụng đã được xuất bản trên các kênh đã chọn!",
    );
  };

  const handleCloseRequisition = () => {
    setReq((prev) => ({
      ...prev,
      status: "closed" as RequisitionStatus,
    }));
    gooeyToast.info("Đã đóng yêu cầu tuyển dụng này.");
  };

  return (
    <HorizontalDetailLayout
      title={
        <div className="flex items-center gap-2">
          <span>Tuyển dụng</span>
          <ChevronRight size={13} className="text-muted-foreground" />
          <span className="text-foreground">{req.position}</span>
        </div>
      }
      onBack={() => router.push(`/${locale}/hr/recruitment`)}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusBadge status={req.status} />
        </div>
      }
      /* ─── CỘT 1: THÔNG TIN CƠ BẢN BÊN TRÁI (CONTEXT SIDEBAR) ─── */
      sidebar={{
        defaultCollapsed: false,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center py-5 gap-4">
              <div
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-sm cursor-help"
                title={`${req.position} - ${req.department}`}
              >
                {req.position.charAt(0).toUpperCase()}
              </div>
              <div className="w-8 h-px bg-border my-1" />
              <div
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground cursor-help"
                title={`Phòng ban: ${req.department}`}
              >
                <Building2 size={16} />
              </div>
              <div
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground cursor-help"
                title={`Số lượng: ${req.headcount} người`}
              >
                <Users size={16} />
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-6 fade-in">
              {/* Profile Card */}
              <div className="flex flex-col items-center text-center pb-5 border-b border-border/60">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-3 border border-primary/20 shadow-sm">
                  {req.position.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {req.position}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  {req.department}
                </p>
                <StatusBadge status={req.status} />
              </div>

              {/* Thông số nhanh */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Chỉ tiêu tuyển dụng
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users size={13} /> Số lượng tuyển
                    </span>
                    <span className="font-bold text-foreground">
                      {req.headcount} nhân sự
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Building2 size={13} /> Khối / Ban
                    </span>
                    <span className="font-medium text-foreground text-right truncate max-w-[150px]">
                      {req.department}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <DollarSign size={13} /> Ngân sách định biên
                    </span>
                    <span className="font-semibold text-emerald-600">
                      18M - 25M VNĐ
                    </span>
                  </div>
                </div>
              </div>

              {/* Người yêu cầu */}
              <div className="pt-2 border-t border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Người đề xuất
                </p>
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                  <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground font-semibold text-xs shrink-0">
                    <User size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {req.requestedBy}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Trưởng phòng ban
                    </p>
                  </div>
                </div>
              </div>

              {/* Lý do tuyển */}
              <div className="pt-2 border-t border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Lý do bổ sung nhân sự
                </p>
                <p className="text-xs text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                  Phục vụ kế hoạch mở rộng tiến độ dự án EPC giai đoạn quý 3 và
                  bù đắp định biên nhân sự kỹ thuật hiện trường.
                </p>
              </div>
            </div>
          ),
      }}
      /* ─── SIDE PANEL: DOCKED HORIZONTAL ACCORDIONS ─── */
      sidePanel={
        <>
          {/* Panel 1: Tiến trình quy trình (Horizontal Accordion) */}
          <HorizontalDetailAccordion
            title="Quy trình tuyển dụng"
            icon={<Activity size={14} />}
            badge={
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Step
              </span>
            }
            isExpanded={activePanel === "workflow"}
            onToggle={() => togglePanel("workflow")}
          >
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chuỗi trạng thái xét duyệt và phân phối phiếu tuyển dụng trên
                toàn hệ thống ATS.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    status: "pending_hr",
                    label: "Tiếp nhận yêu cầu",
                    desc: "HR rà soát ngân sách và mô tả sơ bộ",
                  },
                  {
                    status: "jd_generated",
                    label: "Soạn thảo JD chuẩn",
                    desc: "Tạo bản thảo JD chi tiết với AI",
                  },
                  {
                    status: "pending_review",
                    label: "Phê duyệt lãnh đạo",
                    desc: "Trưởng phòng/Giám đốc khối xác nhận",
                  },
                  {
                    status: "published",
                    label: "Đăng tuyển đa kênh",
                    desc: "Phát hành trên Website, LinkedIn, TopCV",
                  },
                ].map((step, idx) => {
                  const statuses = [
                    "pending_hr",
                    "jd_generated",
                    "pending_review",
                    "published",
                  ];
                  const currentIdx = statuses.indexOf(req.status);
                  const stepIdx = statuses.indexOf(step.status);
                  const isDone = stepIdx < currentIdx;
                  const isCurrent = stepIdx === currentIdx;

                  return (
                    <div
                      key={step.status}
                      className="flex items-start gap-3 relative"
                    >
                      {idx !== 3 && (
                        <div
                          className={`absolute left-3 top-6 w-0.5 h-10 -ml-px ${
                            isDone ? "bg-emerald-500" : "bg-border"
                          }`}
                        />
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-primary text-white ring-4 ring-primary/20"
                              : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {isDone ? <CheckCircle size={13} /> : idx + 1}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p
                          className={`text-xs ${
                            isCurrent
                              ? "font-bold text-foreground"
                              : isDone
                                ? "font-medium text-foreground/90"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </HorizontalDetailAccordion>

          {/* Panel 2: Metadata & Audit Logs (Horizontal Accordion) */}
          <HorizontalDetailAccordion
            title="Metadata & Lịch sử"
            icon={<Clock size={14} />}
            isExpanded={activePanel === "metadata"}
            onToggle={() => togglePanel("metadata")}
          >
            <div className="space-y-4 text-xs">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thông số kiểm soát và lịch sử khởi tạo dữ liệu của vị trí tuyển
                dụng.
              </p>

              <div className="bg-card rounded-xl border border-border/60 p-4 space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-[11px]">
                    Mã yêu cầu
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {req.id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-[11px]">
                    Ngày khởi tạo
                  </span>
                  <span className="font-medium text-foreground">
                    {req.requestedDate}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-[11px]">
                    Người tạo
                  </span>
                  <span className="font-medium text-foreground">
                    {req.requestedBy}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground text-[11px]">
                    Cấp bậc áp dụng
                  </span>
                  <span className="font-medium text-foreground">
                    Senior Specialist
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-muted-foreground text-[11px]">
                    Hạn tuyển kỳ vọng
                  </span>
                  <span className="font-medium text-foreground">
                    30 ngày kể từ ngày đăng
                  </span>
                </div>
              </div>
            </div>
          </HorizontalDetailAccordion>
        </>
      }
      /* ─── FOOTER ACTIONS ─── */
      footer={
        <>
          <button
            onClick={handleCloseRequisition}
            disabled={req.status === "closed"}
            className="btn-ghost flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
          >
            <Trash2 size={13} /> Đóng yêu cầu
          </button>

          <div className="flex items-center gap-2">
            {req.status === "pending_hr" && (
              <ActionButton
                variant="primary"
                className="text-xs px-4 py-2"
                onClick={handleGenerateAI}
              >
                <Sparkles size={13} className="mr-1.5" /> Tạo JD với AI
              </ActionButton>
            )}

            {req.status === "jd_generated" && (
              <ActionButton
                variant="primary"
                className="text-xs px-4 py-2 bg-purple-600 hover:bg-purple-700"
                onClick={() =>
                  setReq((p) => ({
                    ...p,
                    status: "pending_review" as RequisitionStatus,
                  }))
                }
              >
                <Send size={13} className="mr-1.5" /> Trình duyệt JD
              </ActionButton>
            )}

            {req.status === "pending_review" && (
              <ActionButton
                variant="primary"
                className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePublishJob}
              >
                <CheckCircle2 size={13} className="mr-1.5" /> Phê duyệt & Đăng
                tuyển
              </ActionButton>
            )}
          </div>
        </>
      }
    >
      {/* ─── CỘT 2: CANVAS CHÍNH (EXPANDED FORM & AUTHORING CANVAS) ─── */}
      <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-1 border-b border-border bg-muted/20 rounded-xl p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: TỔNG QUAN VỊ TRÍ */}
        {activeTab === "overview" && (
          <div className="space-y-6 fade-in">
            {/* Tiêu chí cơ bản */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Briefcase size={14} className="text-primary" /> Tiêu chuẩn ứng
                viên cần tuyển
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Cấp bậc
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Senior / Lead
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Kinh nghiệm yêu cầu
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Tối thiểu 3 - 5 năm
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                    Hình thức làm việc
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Toàn thời gian (Onsite)
                  </p>
                </div>
              </div>
            </div>

            {/* Kỹ năng chuyên môn */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Tag size={14} className="text-primary" /> Kỹ năng trọng tâm
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Revit MEP",
                  "Autodesk BIM 360",
                  "Quản lý thi công",
                  "AutoCAD",
                  "Bóc tách khối lượng",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-muted rounded-lg text-xs font-medium text-foreground border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MÔ TẢ CÔNG VIỆC (JD PREVIEW / EDITOR) */}
        {activeTab === "jd" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5 fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Bản thảo JD chuẩn hóa
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Được đồng bộ tự động theo khung năng lực vị trí {req.position}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "Bản thảo JD đã được sao chép.",
                  );
                  gooeyToast.success("Đã copy toàn bộ nội dung JD!");
                }}
                className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg"
              >
                <Copy size={13} /> Sao chép
              </button>
            </div>

            <div className="prose prose-sm max-w-none text-xs text-foreground/90 leading-relaxed space-y-4">
              <div>
                <h4 className="font-bold text-sm text-foreground mb-2">
                  1. Trách nhiệm công việc
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>
                    Chủ trì thiết lập và kiểm soát mô hình BIM chuyên ngành cho
                    toàn bộ dự án.
                  </li>
                  <li>
                    Phát hiện và phối hợp giải quyết các xung đột kỹ thuật
                    (Clash Detection) giữa các hệ thống MEP và Kết cấu.
                  </li>
                  <li>
                    Xuất bản vẽ Shop Drawing và trích xuất khối lượng trực tiếp
                    từ mô hình 3D.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground mb-2">
                  2. Yêu cầu chuyên môn
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>
                    Tốt nghiệp Đại học chuyên ngành Cơ điện, Xây dựng, hoặc Kiến
                    trúc.
                  </li>
                  <li>
                    Tối thiểu 3 năm kinh nghiệm làm việc thực tế với Revit và
                    các phần mềm điều phối BIM.
                  </li>
                  <li>
                    Kỹ năng giao tiếp và phối hợp nhóm tốt trong môi trường công
                    trường dự án lớn.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground mb-2">
                  3. Chế độ đãi ngộ & Quyền lợi
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>
                    Thu nhập cạnh tranh theo năng lực, thưởng hiệu quả dự án
                    hàng quý.
                  </li>
                  <li>
                    Bảo hiểm sức khỏe cao cấp và kiểm tra y tế định kỳ hàng năm.
                  </li>
                  <li>
                    Môi trường ứng dụng công nghệ chuyển đổi số hàng đầu trong
                    ngành xây dựng.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KÊNH ĐĂNG TUYỂN */}
        {activeTab === "publish" && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5 fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Các nền tảng phân phối tin tuyển dụng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  name: "Cổng tuyển dụng nội bộ (Website)",
                  desc: "Tự động kích hoạt trên career portal",
                  active: true,
                },
                {
                  name: "LinkedIn Jobs",
                  desc: "Đồng bộ qua API Talent Solutions",
                  active: true,
                },
                {
                  name: "TopCV",
                  desc: "Đăng tin qua gói tuyển dụng doanh nghiệp",
                  active: req.status === "published",
                },
                {
                  name: "VietnamWorks",
                  desc: "Tiếp cận cộng đồng kỹ sư cao cấp",
                  active: req.status === "published",
                },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {platform.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {platform.desc}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      platform.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {platform.active ? "Sẵn sàng" : "Chờ xuất bản"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DANH SÁCH ỨNG VIÊN */}
        {activeTab === "applications" && (
          <div className="space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Hồ sơ tiếp nhận ({applications.length} ứng viên)
              </h3>
            </div>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground text-xs">
                  Chưa có hồ sơ ứng viên nào nộp cho vị trí này.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.candidate.id}
                    className="p-4 bg-card border border-border rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {app.candidate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {app.candidate.name}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {app.candidate.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={11} /> {app.candidate.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {app.application.appliedDate}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </HorizontalDetailLayout>
  );
}
