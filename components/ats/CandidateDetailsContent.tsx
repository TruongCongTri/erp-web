/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Clock,
  Users,
  Send,
  TrendingUp,
  Shield,
  FileText,
  Download,
  Eye,
  CheckCircle,
  GraduationCap,
  X,
  AlertTriangle,
  Globe,
  MapPin,
  ChevronRight,
  BrainCircuit,
  CheckSquare,
  MinusSquare,
  Building2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Candidate, ReferenceInfo } from "./candidateData";
import {
  DetailLayout,
  DetailAccordion,
} from "@/components/layouts/DetailLayout";

// ─── Neutral Badge Component ───────────────────────────────────────────────────
function DataBadge({
  label,
  colorHint,
}: {
  label: string;
  colorHint: "emerald" | "amber" | "red" | "blue" | "purple" | "gray";
}) {
  const dotColors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    gray: "bg-gray-400",
  };
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/70 bg-card text-[11px] font-medium text-foreground whitespace-nowrap shadow-sm">
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[colorHint]}`}
      />
      {label}
    </span>
  );
}

const statusBadgeConfig: Record<
  string,
  { label: string; colorHint: any; borderClass: string }
> = {
  new: {
    label: "Mới ứng tuyển",
    colorHint: "blue",
    borderClass: "border-blue-500 bg-blue-50",
  },
  screening: {
    label: "Sàng lọc CV",
    colorHint: "amber",
    borderClass: "border-amber-500 bg-amber-50",
  },
  interview: {
    label: "Phỏng vấn",
    colorHint: "purple",
    borderClass: "border-purple-500 bg-purple-50",
  },
  offer: {
    label: "Đề nghị (Offer)",
    colorHint: "gray",
    borderClass: "border-gray-500 bg-gray-50",
  },
  hired: {
    label: "Đã tuyển",
    colorHint: "emerald",
    borderClass: "border-emerald-500 bg-emerald-50",
  },
  rejected: {
    label: "Từ chối",
    colorHint: "red",
    borderClass: "border-red-500 bg-red-50",
  },
};

const priorityBadgeConfig: Record<string, { label: string; colorHint: any }> = {
  high: { label: "Ưu tiên cao", colorHint: "red" },
  medium: { label: "Bình thường", colorHint: "blue" },
  low: { label: "Thấp", colorHint: "gray" },
};

// ─── Progress Tracker Component ────────────────────────────────────────────────
const STATUS_FLOW = [
  {
    id: "new",
    label: "Mới ứng tuyển",
    index: 0,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "screening",
    label: "Sàng lọc CV",
    index: 1,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "interview",
    label: "Phỏng vấn",
    index: 2,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: "offer",
    label: "Đề nghị",
    index: 3,
    color: "text-gray-700 bg-gray-50 border-gray-200",
  },
  {
    id: "hired",
    label: "Đã tuyển",
    index: 4,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "rejected",
    label: "Từ chối",
    index: -1,
    color: "text-red-600 bg-red-50 border-red-200",
  },
];

function ProgressTrackerLine({ currentStage }: { currentStage: string }) {
  const isRejected = currentStage === "rejected";
  const currentIndex = isRejected
    ? -1
    : (STATUS_FLOW.find((s) => s.id === currentStage)?.index ?? 0);
  const standardFlow = STATUS_FLOW.filter((s) => s.index >= 0);

  return (
    <div className="relative w-full py-6">
      <div className="absolute top-1/2 left-6 right-6 h-1 bg-muted -translate-y-1/2 rounded-full z-0" />

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
                {isCompleted && !isCurrent ? (
                  <CheckCircle size={10} className="text-white" />
                ) : null}
                {isRejected && i === 0 ? (
                  <X size={10} className="text-red-500" />
                ) : null}
              </div>
              <span
                className={`absolute top-full mt-2 text-[10px] font-medium whitespace-nowrap ${isCurrent ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {isRejected && i === 0 ? "Đã từ chối" : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Update Modal (Application-Specific) ───────────────────────────────
function UpdateProgressModal({
  candidate,
  atsApplications,
  onConfirm,
  onClose,
}: any) {
  const [selectedAppId, setSelectedAppId] = useState(
    atsApplications[0]?.id || "",
  );
  const [notes, setNotes] = useState("");

  const selectedApp = atsApplications.find((a: any) => a.id === selectedAppId);
  const currentStatusObj = STATUS_FLOW.find(
    (s) => s.id === (selectedApp?.currentStage || "new"),
  );
  const currentIndex = currentStatusObj?.index ?? 0;

  const [newStatusId, setNewStatusId] = useState<string>(
    selectedApp?.currentStage || "new",
  );

  const handleSave = () => {
    if (newStatusId === selectedApp?.currentStage) {
      toast.error("Vui lòng chọn một trạng thái mới để chuyển tiếp.");
      return;
    }
    onConfirm(selectedAppId, newStatusId, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg fade-in flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5 rounded-t-xl">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp size={16} />
            <h3 className="text-sm font-bold">
              Cập nhật tiến trình tuyển dụng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Áp dụng cho vị trí ứng tuyển
            </label>
            <select
              className="input-base w-full text-xs cursor-pointer font-medium"
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                const app = atsApplications.find(
                  (a: any) => a.id === e.target.value,
                );
                setNewStatusId(app?.currentStage || "new");
              }}
            >
              {atsApplications.map((app: any) => (
                <option key={app.id} value={app.id}>
                  {app.position} - Hiện tại:{" "}
                  {statusBadgeConfig[app.currentStage]?.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <AlertTriangle
                size={10}
                className="text-amber-500 flex-shrink-0"
              />
              Tiến trình đánh giá độc lập cho từng vị trí.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Trạng thái chuyển tiếp
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_FLOW.map((s) => {
                let isDisabled = false;
                if (currentIndex === -1 || currentIndex === 4)
                  isDisabled = true;
                else if (s.index !== -1 && s.index < currentIndex)
                  isDisabled = true;

                const isSelected = newStatusId === s.id;

                return (
                  <button
                    key={s.id}
                    disabled={isDisabled}
                    onClick={() => setNewStatusId(s.id)}
                    className={`px-3 py-2.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                      isSelected
                        ? `border-primary bg-primary text-primary-foreground shadow-md`
                        : isDisabled
                          ? "border-border bg-muted/30 text-muted-foreground/30 cursor-not-allowed"
                          : `border-transparent hover:border-border ${s.color}`
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Ghi chú (Bắt buộc khi từ chối)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú phỏng vấn, mức lương deal, hoặc lý do từ chối..."
              className="input-base w-full text-xs min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 text-xs py-2"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1 text-xs py-2"
          >
            Lưu tiến trình
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible Application Card Sub-Component ────────────────────────────────
function ApplicationPipelineCard({
  app,
  defaultExpanded = false,
  onSelectApp,
}: {
  app: any;
  defaultExpanded?: boolean;
  onSelectApp: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-border/50 pb-6 mb-4 last:border-0 last:pb-0 last:mb-0">
      {/* Header (Clickable Toggle) */}
      <div
        className="flex justify-between items-start mb-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
            {app.position}
          </h4>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap mt-1">
            <span className="flex items-center gap-1">
              <Building2 size={10} /> {app.department}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={10} /> Đăng: {app.postedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> Hạn: {app.endDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DataBadge
            label={
              statusBadgeConfig[app.currentStage]?.label || app.currentStage
            }
            colorHint={statusBadgeConfig[app.currentStage]?.colorHint || "gray"}
          />
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted text-muted-foreground transition-colors">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Content (Progress, Table, Footer) */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Middle: Progress Tracker */}
          <div className="px-3 my-2">
            <ProgressTrackerLine currentStage={app.currentStage} />
          </div>

          {/* Submissions List Table */}
          <div className="bg-muted/10 border border-border rounded-lg overflow-hidden mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border text-[10px] uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-3 py-2 font-semibold">Nguồn & Thời gian</th>
                  <th className="px-3 py-2 font-semibold">Hồ sơ đính kèm</th>
                  <th className="px-3 py-2 font-semibold text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {app.submissions.map((sub: any) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Globe size={11} className="text-muted-foreground" />{" "}
                        {sub.source}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {sub.submittedAt}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center gap-1.5 font-semibold text-primary hover:underline cursor-pointer">
                        <FileText size={13} />
                        {sub.cvFileName}
                        <span className="text-muted-foreground text-[9px] font-medium px-1 border border-border rounded-sm">
                          v{sub.cvVersion}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {sub.cvFileSize}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle text-right">
                      <button
                        className="p-1.5 hover:text-primary text-muted-foreground transition-colors"
                        title="Xem trước"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1.5 hover:text-primary text-muted-foreground transition-colors"
                        title="Tải xuống"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-muted-foreground">
              Hệ thống đã nhận {app.submissions.length} phiên bản CV cho vị trí
              này.
            </p>
            <button
              onClick={() => onSelectApp(app.id)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
            >
              <BrainCircuit size={13} />
              Xem chi tiết đánh giá
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mock Work History Data ────────────────────────────────────────────────────
// Represents parsed work history from the CV
const MOCK_WORK_HISTORY = [
  {
    company: "Tech Solutions VN",
    role: "Senior Backend Engineer",
    duration: "Tháng 03/2023 - Hiện tại",
    desc: "Xây dựng hệ thống microservices dùng NestJS và Node.js. Tối ưu hóa database PostgreSQL giảm 40% query time.",
  },
  {
    company: "Global SoftCorp",
    role: "Fullstack Developer",
    duration: "Tháng 06/2020 - Tháng 02/2023",
    desc: "Phát triển web app quản lý nhân sự với React và Express. Triển khai CI/CD pipeline cơ bản.",
  },
];

// ─── Main Wrapper ──────────────────────────────────────────────────────────────
export default function CandidateDetailsContent({
  candidate,
  onBack,
}: {
  candidate: Candidate;
  onBack: () => void;
}) {
  
  // ─── Normalizing Data for the ATS Pipeline ───
  const atsApplications = [
    {
      id: "app-main",
      position: candidate.position,
      department: candidate.department,
      currentStage: candidate.status,
      postedDate: "10/08/2026",
      endDate: "10/09/2026",
      matchScore: 88,
      missingSkills: ["Docker", "Kubernetes"],
      matchedSkills: ["TypeScript", "NestJS", "React", "PostgreSQL"],
      assessment:
        "Ứng viên có nền tảng vững chắc về hệ sinh thái JS/TS, đáp ứng hoàn hảo yêu cầu backend và frontend. Điểm yếu duy nhất là chưa có nhiều kinh nghiệm tự triển khai qua Docker/K8s như JD yêu cầu, có thể đào tạo thêm.",
      submissions: candidate.cvVersions.map((cv) => ({
        id: cv.id,
        source: cv.source,
        submittedAt: cv.uploadedDate,
        cvFileName: cv.fileName,
        cvVersion: cv.version,
        cvFileSize: cv.fileSize,
      })),
    },
    ...candidate.applicationHistory
      .filter((h) => h.position !== candidate.position)
      .map((h) => ({
        id: h.id,
        position: h.position,
        department: h.department,
        currentStage: h.status,
        postedDate: "15/07/2026",
        endDate: "15/08/2026",
        matchScore: 65,
        missingSkills: ["Python", "Golang"],
        matchedSkills: ["PostgreSQL"],
        assessment:
          "Ứng viên chủ yếu mạnh về TS/Node, không hoàn toàn khớp với stack Python yêu cầu cho vị trí này. Đã đánh trượt ở vòng CV.",
        submissions: [
          {
            id: `sub-${h.id}`,
            source: h.source,
            submittedAt: h.appliedDate,
            cvFileName: `CV_${h.position.replace(/\s/g, "")}.pdf`,
            cvVersion: 1,
            cvFileSize: "1.2 MB",
          },
        ],
      })),
  ];

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  if (selectedAppId) {
    const app = atsApplications.find((a) => a.id === selectedAppId);
    return (
      <ApplicationAssessmentView
        candidate={candidate}
        app={app}
        onBack={() => setSelectedAppId(null)}
      />
    );
  }

  return (
    <CandidateProfileView
      candidate={candidate}
      atsApplications={atsApplications}
      onBack={onBack}
      onSelectApp={setSelectedAppId}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── VIEW 1: CANDIDATE PROFILE VIEW ──────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CandidateProfileView({
  candidate,
  atsApplications,
  onBack,
  onSelectApp,
}: any) {
  const [centerSections, setCenterSections] = useState({
    applications: true,
    skills: true,
  });
  const [rightSections, setRightSections] = useState({
    info: true,
    references: true,
    progress: true,
  });
  const [showProgressModal, setShowProgressModal] = useState(false);

  const statusCfg = statusBadgeConfig[candidate.status];
  const priorityCfg = priorityBadgeConfig[candidate.priority];

  const handleUpdateProgress = (
    appId: string,
    newStatus: string,
    notes: string,
  ) => {
    toast.success(`Đã cập nhật tiến trình thành công!`);
    setShowProgressModal(false);
  };

  return (
    <DetailLayout
      title={candidate.name}
      onBack={onBack}
      // ─── LEFT SIDEBAR: CANDIDATE INFO ───
      leftSidebar={{
        defaultCollapsed: false,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center gap-4 py-6 fade-in h-full overflow-y-auto scrollbar-hide">
              <div
                className="relative cursor-help"
                title={`${candidate.name}\n${candidate.position}\nTrạng thái: ${statusCfg.label}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shadow-sm">
                  {candidate.initials}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full bg-${statusCfg.colorHint}-500`}
                />
              </div>
              <div className="w-8 h-px bg-border my-2" />
              <button
                onClick={() => window.open(`tel:${candidate.phone}`)}
                title="Gọi điện"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Phone size={14} />
              </button>
              <button
                onClick={() => window.open(`mailto:${candidate.email}`)}
                title="Gửi Email"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Mail size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full fade-in">
              <div className="p-5 space-y-6 flex-shrink-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
                    {candidate.initials}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    {candidate.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    {candidate.position}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap justify-center mb-5">
                    <DataBadge
                      label={statusCfg.label}
                      colorHint={statusCfg.colorHint}
                    />
                    <DataBadge
                      label={priorityCfg.label}
                      colorHint={priorityCfg.colorHint}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 w-full">
                    <button
                      onClick={() => window.open(`tel:${candidate.phone}`)}
                      title="Gọi điện"
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Phone size={15} />
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${candidate.email}`)}
                      title="Gửi Email"
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Mail size={15} />
                    </button>
                    <div className="w-px h-5 bg-border mx-2 sm:mx-1" />
                    <button
                      title="Tải hồ sơ PDF"
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-5 space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3">
                    Thông tin liên lạc
                  </h3>
                  <div className="space-y-3.5">
                    {[
                      {
                        icon: <Mail size={13} />,
                        label: "Email",
                        value: candidate.email,
                      },
                      {
                        icon: <Phone size={13} />,
                        label: "Điện thoại",
                        value: candidate.phone,
                      },
                      {
                        icon: <Calendar size={13} />,
                        label: "Ngày sinh",
                        value: candidate.dob || "—",
                      },
                      {
                        icon: <MapPin size={13} />,
                        label: "Địa chỉ",
                        value: candidate.address || "—",
                      },
                      {
                        icon: <GraduationCap size={13} />,
                        label: "Học vấn",
                        value: candidate.education,
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <label className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mb-1">
                          {item.icon} {item.label}
                        </label>
                        <p className="text-xs font-semibold text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">
                    Lịch sử làm việc
                  </h3>
                  <div className="relative">
                    <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border z-0" />
                    <div className="space-y-5 relative z-10">
                      {MOCK_WORK_HISTORY.map((work, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-3 h-3 rounded-full bg-background border-2 border-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">
                              {work.role}
                            </h4>
                            <p className="text-[11px] font-medium text-muted-foreground mb-1">
                              {work.company}
                            </p>
                            <p className="text-[10px] text-muted-foreground mb-1.5">
                              {work.duration}
                            </p>
                            <p className="text-[10px] text-foreground italic border-l-2 border-border/50 pl-2 bg-muted/20 py-1 rounded-r">
                              {work.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
      }}
      // ─── RIGHT SIDEBAR: METADATA & PROGRESS ───
      rightSidebar={{
        defaultCollapsed: false,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center gap-6 mt-14 fade-in text-muted-foreground">
              <div
                className="relative group cursor-help"
                title="Thông tin ứng tuyển"
              >
                <Briefcase size={16} />
              </div>
              <div className="relative group cursor-help" title="Tham chiếu">
                <Users size={16} />
              </div>
              <div className="relative group cursor-help" title="Tiến trình">
                <Clock size={16} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full fade-in">
              <DetailAccordion
                title="Vị trí quan tâm nhất"
                icon={<Briefcase size={14} />}
                isExpanded={rightSections.info}
                onToggle={() =>
                  setRightSections((p) => ({ ...p, info: !p.info }))
                }
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-[10px] text-muted-foreground">
                      Vị trí
                    </span>
                    <span className="text-xs font-bold text-foreground text-right">
                      {candidate.position}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-[10px] text-muted-foreground">
                      Lần nộp gần nhất
                    </span>
                    <span className="text-xs font-medium text-right">
                      {candidate.appliedDate}
                    </span>
                  </div>
                </div>
              </DetailAccordion>

              <DetailAccordion
                title={`Người tham chiếu (${candidate.references.length})`}
                icon={<Users size={14} />}
                isExpanded={rightSections.references}
                onToggle={() =>
                  setRightSections((p) => ({ ...p, references: !p.references }))
                }
              >
                <div className="space-y-3">
                  {candidate.references.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic text-center py-2">
                      Không có người tham chiếu.
                    </p>
                  ) : (
                    candidate.references.map((ref: ReferenceInfo) => (
                      <div
                        key={ref.id}
                        className="border-b border-border/50 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-foreground">
                            {ref.name}
                          </span>
                          {ref.isCurrentEmployee && (
                            <Shield size={10} className="text-emerald-500" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          {ref.position} · {ref.company}
                        </p>
                        <div className="flex flex-col gap-1 text-[10px]">
                          <a
                            href={`tel:${ref.phone}`}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                          >
                            <Phone size={10} /> {ref.phone}
                          </a>
                          <a
                            href={`mailto:${ref.email}`}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                          >
                            <Mail size={10} /> {ref.email}
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DetailAccordion>

              <DetailAccordion
                title="Lịch sử hệ thống"
                icon={<Clock size={14} />}
                isExpanded={rightSections.progress}
                onToggle={() =>
                  setRightSections((p) => ({ ...p, progress: !p.progress }))
                }
                className="border-b-0 lg:border-b"
              >
                <div className="space-y-4 pt-1">
                  {candidate.progressHistory.map((p: any, i: number) => (
                    <div key={p.id} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${i === 0 ? "bg-primary shadow-[0_0_0_2px_rgba(var(--primary),0.2)]" : "bg-muted-foreground/30"}`}
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground leading-tight">
                          {statusBadgeConfig[p.fromStatus]?.label} →{" "}
                          {statusBadgeConfig[p.toStatus]?.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.date} · bởi {p.updatedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailAccordion>
            </div>
          ),
      }}
      // ─── FOOTER ACTIONS ───
      footer={
        <>
          <button
            onClick={() => setShowProgressModal(true)}
            className="btn-secondary flex items-center gap-1.5 text-xs px-4 py-2"
          >
            <TrendingUp size={13} /> Cập nhật tiến trình
          </button>
          <button className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
            <Send size={13} /> Gửi Trưởng phòng duyệt
          </button>
        </>
      }
    >
      {/* ─── CENTER COLUMN: ATS DATA (Collapsible Accordions) ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background lg:overflow-hidden relative">
        <div className="flex-1 flex flex-col lg:overflow-y-auto scrollbar-hide fade-in">
          <DetailAccordion
            title="Chi tiết ứng tuyển & Hồ sơ nộp (Submissions)"
            icon={<Briefcase size={14} />}
            isExpanded={centerSections.applications}
            onToggle={() =>
              setCenterSections((p) => ({
                ...p,
                applications: !p.applications,
              }))
            }
          >
            <div className="space-y-6">
              {atsApplications.map((app: any, index: number) => (
                <ApplicationPipelineCard
                  key={app.id}
                  app={app}
                  defaultExpanded={index === 0}
                  onSelectApp={onSelectApp}
                />
              ))}
            </div>
          </DetailAccordion>

          <DetailAccordion
            title="Kỹ năng phân tích từ các phiên bản CV"
            icon={<CheckCircle size={14} />}
            isExpanded={centerSections.skills}
            onToggle={() =>
              setCenterSections((p) => ({ ...p, skills: !p.skills }))
            }
            className="border-b-0 lg:border-b"
          >
            <div className="space-y-4 max-w-3xl">
              <p className="text-[10px] text-muted-foreground mb-1">
                Hệ thống AI tự động trích xuất và tổng hợp kỹ năng từ mọi phiên
                bản CV ứng viên đã nộp.
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-primary/5 border border-primary/20 text-primary text-[11px] rounded-md font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </DetailAccordion>
        </div>
      </div>

      {showProgressModal && (
        <UpdateProgressModal
          candidate={candidate}
          atsApplications={atsApplications}
          onConfirm={handleUpdateProgress}
          onClose={() => setShowProgressModal(false)}
        />
      )}
    </DetailLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── VIEW 2: APPLICATION ASSESSMENT VIEW (Nested 3-col View) ─────────────────
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationAssessmentView({ candidate, app, onBack }: any) {
  const [rightSections, setRightSections] = useState({
    progress: true,
    actions: true,
  });
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleUpdateProgress = (
    appId: string,
    newStatus: string,
    notes: string,
  ) => {
    toast.success(`Đã cập nhật tiến trình thành công!`);
    setShowProgressModal(false);
  };

  const appStatus =
    statusBadgeConfig[app.currentStage] || statusBadgeConfig["new"];

  return (
    <DetailLayout
      title={
        <span className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-primary" /> Đánh giá mức độ
          phù hợp: {candidate.name}
        </span>
      }
      onBack={onBack}
      // LEFT SIDEBAR: Context Info
      leftSidebar={{
        defaultCollapsed: false,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center gap-4 py-6 fade-in h-full overflow-y-auto scrollbar-hide">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {candidate.initials}
              </div>
              <div className="w-8 h-px bg-border my-2" />
              <Briefcase size={16} className="text-muted-foreground" />
            </div>
          ) : (
            <div className="p-5 space-y-6 fade-in">
              <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                  {candidate.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {candidate.name}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <a
                      href={`tel:${candidate.phone}`}
                      className="text-[10px] text-muted-foreground hover:text-primary"
                    >
                      <Phone size={10} className="inline mr-0.5" />
                      Gọi
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3">
                  Thông tin vị trí
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                      Vị trí ứng tuyển
                    </label>
                    <p className="text-xs font-bold text-foreground">
                      {app.position}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                      Phòng ban
                    </label>
                    <p className="text-xs font-semibold text-foreground">
                      {app.department}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                      Thời gian đăng tuyển
                    </label>
                    <p className="text-[11px] text-foreground">
                      {app.postedDate} - {app.endDate}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3">
                  Bản CV sử dụng (Gần nhất)
                </h3>
                <div className="p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-primary" />
                    <span className="text-xs font-bold text-primary truncate">
                      {app.submissions[0].cvFileName}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Nguồn: {app.submissions[0].source}</span>
                    <span>{app.submissions[0].submittedAt}</span>
                  </p>
                </div>
              </div>
            </div>
          ),
      }}
      // RIGHT SIDEBAR: Progress & Actions
      rightSidebar={{
        defaultCollapsed: false,
        content: (collapsed) =>
          collapsed ? (
            <div className="flex flex-col items-center gap-6 mt-14 fade-in text-muted-foreground">
              <div className="relative group cursor-help" title="Tiến trình">
                <Clock size={16} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full fade-in">
              <DetailAccordion
                title="Trạng thái hiện tại"
                icon={<Briefcase size={14} />}
                isExpanded={rightSections.actions}
                onToggle={() =>
                  setRightSections((p) => ({ ...p, actions: !p.actions }))
                }
              >
                <div className="space-y-4">
                  <DataBadge
                    label={appStatus.label}
                    colorHint={appStatus.colorHint}
                  />
                  <button
                    onClick={() => setShowProgressModal(true)}
                    className="w-full btn-primary flex items-center justify-center gap-1.5 text-xs py-2"
                  >
                    <TrendingUp size={13} /> Cập nhật tiến trình
                  </button>
                </div>
              </DetailAccordion>
              <DetailAccordion
                title="Tiến trình cụ thể"
                icon={<Clock size={14} />}
                isExpanded={rightSections.progress}
                onToggle={() =>
                  setRightSections((p) => ({ ...p, progress: !p.progress }))
                }
                className="border-b-0 lg:border-b"
              >
                <div className="py-2">
                  <ProgressTrackerLine currentStage={app.currentStage} />
                </div>
              </DetailAccordion>
            </div>
          ),
      }}
    >
      {/* CENTER: AI MATCHING ANALYSIS */}
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-card flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              AI Phân tích mức độ phù hợp (Match Score)
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
          <div className="max-w-4xl mx-auto space-y-6 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted/30"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${app.matchScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-emerald-600">
                      {app.matchScore}%
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">
                  Độ phù hợp tổng thể
                </p>
              </div>

              <div className="sm:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-center">
                <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" /> Đánh giá tổng
                  quan từ AI
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-3">
                  "{app.assessment}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-emerald-600 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckSquare size={14} /> Kỹ năng đáp ứng (
                  {app.matchedSkills.length})
                </h3>
                <div className="space-y-2">
                  {app.matchedSkills.map((s: string) => (
                    <div
                      key={s}
                      className="flex items-center gap-2 text-xs text-foreground bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg"
                    >
                      <CheckCircle
                        size={13}
                        className="text-emerald-500 flex-shrink-0"
                      />{" "}
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-red-600 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                  <MinusSquare size={14} /> Kỹ năng còn thiếu (
                  {app.missingSkills.length})
                </h3>
                <div className="space-y-2">
                  {app.missingSkills.map((s: string) => (
                    <div
                      key={s}
                      className="flex items-center gap-2 text-xs text-foreground bg-red-50/50 border border-red-100 p-2 rounded-lg"
                    >
                      <AlertTriangle
                        size={13}
                        className="text-red-500 flex-shrink-0"
                      />{" "}
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProgressModal && (
        <UpdateProgressModal
          candidate={candidate}
          atsApplications={[app]}
          onConfirm={handleUpdateProgress}
          onClose={() => setShowProgressModal(false)}
        />
      )}
    </DetailLayout>
  );
}
