/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import {
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  Building2,
  Search,
  Eye,
  X,
  Check,
  Star,
  Users,
  ClipboardList,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type InterviewStage =
  | "screening"
  | "technical"
  | "culture_fit"
  | "final"
  | "offer"
  | "hired"
  | "rejected";
type OnboardingStage =
  | "offer_accepted"
  | "paperwork"
  | "equipment_setup"
  | "orientation"
  | "probation"
  | "confirmed";

interface InterviewSchedule {
  id: string;
  round: number;
  type: string;
  scheduledAt: string;
  duration: string;
  interviewers: string[];
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  feedback?: string;
  score?: number;
}

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
  category: "hr" | "it" | "manager" | "employee";
}

interface TrackerEntry {
  id: string;
  candidateName: string;
  candidateInitials: string;
  position: string;
  department: string;
  currentStage: InterviewStage | OnboardingStage;
  stageType: "interview" | "onboarding";
  appliedDate: string;
  lastUpdated: string;
  assignedHR: string;
  assignedManager: string;
  interviews: InterviewSchedule[];
  onboardingTasks?: OnboardingTask[];
  notes?: string;
  expectedStartDate?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const trackerData: TrackerEntry[] = [
  {
    id: "track-001",
    candidateName: "Nguyễn Văn An",
    candidateInitials: "VA",
    position: "Kỹ sư kết cấu",
    department: "Xây dựng",
    currentStage: "technical",
    stageType: "interview",
    appliedDate: "15/08/2026",
    lastUpdated: "31/08/2026",
    assignedHR: "Sơn Lêu",
    assignedManager: "Đỗ Minh Tuấn",
    interviews: [
      {
        id: "int-001-1",
        round: 1,
        type: "Sàng lọc HR",
        scheduledAt: "20/08/2026 10:00",
        duration: "30 phút",
        interviewers: ["Sơn Lêu"],
        location: "Google Meet",
        status: "completed",
        feedback: "Ứng viên tốt, kỹ năng giao tiếp tốt",
        score: 4,
      },
      {
        id: "int-001-2",
        round: 2,
        type: "Phỏng vấn kỹ thuật",
        scheduledAt: "02/09/2026 14:00",
        duration: "60 phút",
        interviewers: ["Đỗ Minh Tuấn", "Hoàng Long Phước"],
        location: "Phòng họp A",
        status: "scheduled",
      },
    ],
  },
  {
    id: "track-002",
    candidateName: "Trần Thị Lan",
    candidateInitials: "TL",
    position: "Kiến trúc sư",
    department: "Khối Thiết kế",
    currentStage: "offer",
    stageType: "interview",
    appliedDate: "10/08/2026",
    lastUpdated: "30/08/2026",
    assignedHR: "Phạm Ngọc Hà",
    assignedManager: "Vũ Thanh Liêm",
    interviews: [
      {
        id: "int-002-1",
        round: 1,
        type: "Sàng lọc HR",
        scheduledAt: "15/08/2026 09:00",
        duration: "30 phút",
        interviewers: ["Phạm Ngọc Hà"],
        location: "Zoom",
        status: "completed",
        feedback: "Xuất sắc, portfolio ấn tượng",
        score: 5,
      },
      {
        id: "int-002-2",
        round: 2,
        type: "Phỏng vấn kỹ thuật",
        scheduledAt: "20/08/2026 14:00",
        duration: "90 phút",
        interviewers: ["Vũ Thanh Liêm"],
        location: "Phòng họp B",
        status: "completed",
        feedback: "Kiến thức BIM vững, sáng tạo",
        score: 5,
      },
      {
        id: "int-002-3",
        round: 3,
        type: "Phỏng vấn văn hóa",
        scheduledAt: "25/08/2026 10:00",
        duration: "45 phút",
        interviewers: ["Sơn Lêu", "Vũ Thanh Liêm"],
        location: "Phòng họp A",
        status: "completed",
        feedback: "Phù hợp văn hóa công ty",
        score: 4,
      },
    ],
    notes: "Đang chờ phê duyệt offer ₫32,000,000/tháng từ Trưởng phòng",
  },
  {
    id: "track-003",
    candidateName: "Lê Minh Khoa",
    candidateInitials: "MK",
    position: "Giám sát thi công",
    department: "Xây dựng",
    currentStage: "paperwork",
    stageType: "onboarding",
    appliedDate: "01/07/2026",
    lastUpdated: "28/08/2026",
    assignedHR: "Sơn Lêu",
    assignedManager: "Đỗ Minh Tuấn",
    expectedStartDate: "15/09/2026",
    interviews: [
      {
        id: "int-003-1",
        round: 1,
        type: "Sàng lọc HR",
        scheduledAt: "10/07/2026 10:00",
        duration: "30 phút",
        interviewers: ["Sơn Lêu"],
        location: "Google Meet",
        status: "completed",
        score: 4,
      },
      {
        id: "int-003-2",
        round: 2,
        type: "Phỏng vấn kỹ thuật",
        scheduledAt: "18/07/2026 14:00",
        duration: "60 phút",
        interviewers: ["Đỗ Minh Tuấn"],
        location: "Phòng họp A",
        status: "completed",
        score: 4,
      },
    ],
    onboardingTasks: [
      {
        id: "ob-001",
        title: "Ký hợp đồng lao động",
        description: "Ký hợp đồng và các phụ lục",
        assignedTo: "Sơn Lêu (HR)",
        dueDate: "05/09/2026",
        status: "completed",
        category: "hr",
      },
      {
        id: "ob-002",
        title: "Nộp hồ sơ gốc",
        description: "CCCD, bằng cấp, chứng chỉ",
        assignedTo: "Lê Minh Khoa",
        dueDate: "05/09/2026",
        status: "in_progress",
        category: "employee",
      },
      {
        id: "ob-003",
        title: "Cấp tài khoản hệ thống",
        description: "Email, ERP, Slack",
        assignedTo: "IT Admin",
        dueDate: "10/09/2026",
        status: "pending",
        category: "it",
      },
      {
        id: "ob-004",
        title: "Chuẩn bị thiết bị làm việc",
        description: "Laptop, PPE, thẻ nhân viên",
        assignedTo: "IT Admin",
        dueDate: "12/09/2026",
        status: "pending",
        category: "it",
      },
      {
        id: "ob-005",
        title: "Buổi định hướng nhân viên mới",
        description: "Giới thiệu công ty, quy trình",
        assignedTo: "Sơn Lêu (HR)",
        dueDate: "15/09/2026",
        status: "pending",
        category: "hr",
      },
      {
        id: "ob-006",
        title: "Gặp gỡ team và quản lý",
        description: "Giới thiệu với phòng Xây dựng",
        assignedTo: "Đỗ Minh Tuấn",
        dueDate: "15/09/2026",
        status: "pending",
        category: "manager",
      },
    ],
  },
  {
    id: "track-004",
    candidateName: "Phạm Thu Hương",
    candidateInitials: "TH",
    position: "Kế toán viên",
    department: "Phòng Kế toán",
    currentStage: "probation",
    stageType: "onboarding",
    appliedDate: "01/06/2026",
    lastUpdated: "01/08/2026",
    assignedHR: "Phạm Ngọc Hà",
    assignedManager: "Cao Thị Bích",
    expectedStartDate: "01/08/2026",
    interviews: [
      {
        id: "int-004-1",
        round: 1,
        type: "Sàng lọc HR",
        scheduledAt: "10/06/2026 09:00",
        duration: "30 phút",
        interviewers: ["Phạm Ngọc Hà"],
        location: "Zoom",
        status: "completed",
        score: 4,
      },
      {
        id: "int-004-2",
        round: 2,
        type: "Phỏng vấn chuyên môn",
        scheduledAt: "18/06/2026 14:00",
        duration: "60 phút",
        interviewers: ["Cao Thị Bích"],
        location: "Phòng họp C",
        status: "completed",
        score: 5,
      },
    ],
    onboardingTasks: [
      {
        id: "ob-010",
        title: "Ký hợp đồng lao động",
        description: "",
        assignedTo: "Phạm Ngọc Hà",
        dueDate: "25/07/2026",
        status: "completed",
        category: "hr",
      },
      {
        id: "ob-011",
        title: "Nộp hồ sơ gốc",
        description: "",
        assignedTo: "Phạm Thu Hương",
        dueDate: "25/07/2026",
        status: "completed",
        category: "employee",
      },
      {
        id: "ob-012",
        title: "Cấp tài khoản hệ thống",
        description: "",
        assignedTo: "IT Admin",
        dueDate: "28/07/2026",
        status: "completed",
        category: "it",
      },
      {
        id: "ob-013",
        title: "Buổi định hướng",
        description: "",
        assignedTo: "Phạm Ngọc Hà",
        dueDate: "01/08/2026",
        status: "completed",
        category: "hr",
      },
      {
        id: "ob-014",
        title: "Đánh giá thử việc 30 ngày",
        description: "Đánh giá hiệu suất sau 1 tháng",
        assignedTo: "Cao Thị Bích",
        dueDate: "01/09/2026",
        status: "in_progress",
        category: "manager",
      },
    ],
  },
];

// ─── Stage Configs ──────────────────────────────────────────────────────────────
const interviewStages: { id: InterviewStage; label: string }[] = [
  { id: "screening", label: "Sàng lọc" },
  { id: "technical", label: "Kỹ thuật" },
  { id: "culture_fit", label: "Văn hóa" },
  { id: "final", label: "Vòng cuối" },
  { id: "offer", label: "Offer" },
  { id: "hired", label: "Đã tuyển" },
  { id: "rejected", label: "Từ chối" },
];

const onboardingStages: { id: OnboardingStage; label: string }[] = [
  { id: "offer_accepted", label: "Nhận offer" },
  { id: "paperwork", label: "Hồ sơ" },
  { id: "equipment_setup", label: "Thiết bị" },
  { id: "orientation", label: "Định hướng" },
  { id: "probation", label: "Thử việc" },
  { id: "confirmed", label: "Chính thức" },
];

const stageColors: Record<string, string> = {
  screening: "bg-slate-100 text-slate-700",
  technical: "bg-blue-100 text-blue-700",
  culture_fit: "bg-indigo-100 text-indigo-700",
  final: "bg-purple-100 text-purple-700",
  offer: "bg-amber-100 text-amber-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  offer_accepted: "bg-amber-100 text-amber-700",
  paperwork: "bg-blue-100 text-blue-700",
  equipment_setup: "bg-indigo-100 text-indigo-700",
  orientation: "bg-purple-100 text-purple-700",
  probation: "bg-orange-100 text-orange-700",
  confirmed: "bg-green-100 text-green-700",
};

const stageLabels: Record<string, string> = {
  ...Object.fromEntries(interviewStages.map((s) => [s.id, s.label])),
  ...Object.fromEntries(onboardingStages.map((s) => [s.id, s.label])),
};

const taskCategoryColor: Record<string, string> = {
  hr: "bg-purple-100 text-purple-700",
  it: "bg-blue-100 text-blue-700",
  manager: "bg-amber-100 text-amber-700",
  employee: "bg-green-100 text-green-700",
};

const taskStatusIcon: Record<string, React.ReactNode> = {
  completed: <CheckCircle size={14} className="text-green-600" />,
  in_progress: <Clock size={14} className="text-amber-600" />,
  pending: (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/40" />
  ),
};

// ─── Detail Drawer ──────────────────────────────────────────────────────────────
function TrackerDetailDrawer({
  entry,
  onClose,
}: {
  entry: TrackerEntry;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"interviews" | "onboarding">(
    "interviews",
  );
  const stages =
    entry.stageType === "interview" ? interviewStages : onboardingStages;
  const currentIdx = stages.findIndex((s) => s.id === entry.currentStage);

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-card border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
            {entry.candidateInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">
              {entry.candidateName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {entry.position} · {entry.department}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stage Progress */}
        <div className="px-5 py-4 border-b border-border flex-shrink-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {entry.stageType === "interview"
              ? "Tiến trình phỏng vấn"
              : "Tiến trình onboarding"}
          </p>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
            {stages.map((stage, i) => {
              const isDone = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <React.Fragment key={stage.id}>
                  <div
                    className={`flex-shrink-0 flex flex-col items-center gap-1`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-primary text-white ring-2 ring-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check size={12} /> : i + 1}
                    </div>
                    <span
                      className={`text-[9px] font-medium whitespace-nowrap ${isCurrent ? "text-primary" : isDone ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 min-w-[12px] ${i < currentIdx ? "bg-green-400" : "bg-muted"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {[
            { id: "interviews", label: "Lịch phỏng vấn" },
            ...(entry.onboardingTasks
              ? [{ id: "onboarding", label: "Onboarding" }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "interviews" && (
            <div className="space-y-3">
              {entry.interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-muted/30 border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">
                      Vòng {interview.round}: {interview.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        interview.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : interview.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : interview.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {interview.status === "completed"
                        ? "Hoàn thành"
                        : interview.status === "scheduled"
                          ? "Đã lên lịch"
                          : interview.status === "cancelled"
                            ? "Hủy"
                            : "Đổi lịch"}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} /> {interview.scheduledAt} ·{" "}
                      {interview.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 size={11} /> {interview.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={11} /> {interview.interviewers.join(", ")}
                    </div>
                  </div>
                  {interview.score && (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i <= interview.score!
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30"
                          }
                        />
                      ))}
                    </div>
                  )}
                  {interview.feedback && (
                    <p className="text-[11px] text-muted-foreground mt-2 italic">
                      "{interview.feedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "onboarding" && entry.onboardingTasks && (
            <div className="space-y-2">
              {entry.onboardingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${task.status === "completed" ? "border-green-200 bg-green-50/50" : "border-border bg-card"}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {taskStatusIcon[task.status]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-xs font-medium ${task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${taskCategoryColor[task.category]}`}
                      >
                        {task.category === "hr"
                          ? "HR"
                          : task.category === "it"
                            ? "IT"
                            : task.category === "manager"
                              ? "Quản lý"
                              : "NV"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {task.assignedTo} · Hạn: {task.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border px-5 py-3 flex items-center gap-2">
          <div className="flex-1 text-xs text-muted-foreground">
            <span>HR: {entry.assignedHR}</span>
            <span className="mx-2">·</span>
            <span>QL: {entry.assignedManager}</span>
          </div>
          {entry.expectedStartDate && (
            <span className="text-xs text-primary font-medium">
              Bắt đầu: {entry.expectedStartDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function InterviewTrackerContent({
  locale,
}: {
  locale: string;
}) {
  const [activeView, setActiveView] = useState<
    "all" | "interview" | "onboarding"
  >("all");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null);

  const filtered = useMemo(() => {
    let result = trackerData;
    if (activeView !== "all")
      result = result.filter((e) => e.stageType === activeView);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.candidateName.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q),
      );
    }
    return result;
  }, [activeView, search]);

  const interviewCount = trackerData.filter(
    (e) => e.stageType === "interview",
  ).length;
  const onboardingCount = trackerData.filter(
    (e) => e.stageType === "onboarding",
  ).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-foreground">
              Theo dõi Phỏng vấn & Onboarding
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quản lý tiến trình từ phỏng vấn đến nhân viên chính thức
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {[
            {
              label: "Đang phỏng vấn",
              value: interviewCount,
              color: "text-blue-600",
              bg: "bg-blue-50 border-blue-200",
            },
            {
              label: "Đang onboarding",
              value: onboardingCount,
              color: "text-purple-600",
              bg: "bg-purple-50 border-purple-200",
            },
            {
              label: "Lịch PV hôm nay",
              value: 2,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Hoàn thành tháng này",
              value: 1,
              color: "text-green-600",
              bg: "bg-green-50 border-green-200",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`flex-shrink-0 rounded-xl border px-4 py-2.5 min-w-[120px] ${stat.bg}`}
            >
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {[
            { id: "all", label: "Tất cả", count: trackerData.length },
            { id: "interview", label: "Phỏng vấn", count: interviewCount },
            { id: "onboarding", label: "Onboarding", count: onboardingCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeView === tab.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeView === tab.id ? "bg-white/20 text-white" : "bg-background text-muted-foreground"}`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ứng viên, vị trí..."
            className="input-base pl-8 text-xs py-1.5 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-5xl space-y-3">
          {filtered.map((entry) => {
            const stages =
              entry.stageType === "interview"
                ? interviewStages
                : onboardingStages;
            const currentIdx = stages.findIndex(
              (s) => s.id === entry.currentStage,
            );
            const completedTasks =
              entry.onboardingTasks?.filter((t) => t.status === "completed")
                .length ?? 0;
            const totalTasks = entry.onboardingTasks?.length ?? 0;

            return (
              <div
                key={entry.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {entry.candidateInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {entry.candidateName}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stageColors[entry.currentStage]}`}
                      >
                        {stageLabels[entry.currentStage]}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${entry.stageType === "interview" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                      >
                        {entry.stageType === "interview"
                          ? "Phỏng vấn"
                          : "Onboarding"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {entry.position} · {entry.department}
                    </p>

                    {/* Mini progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-0.5">
                        {stages.map((stage, i) => (
                          <div
                            key={stage.id}
                            className={`flex-1 h-1.5 rounded-full transition-all ${
                              i < currentIdx
                                ? "bg-green-400"
                                : i === currentIdx
                                  ? "bg-primary"
                                  : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {currentIdx + 1}/{stages.length}
                      </span>
                    </div>

                    {totalTasks > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Onboarding: {completedTasks}/{totalTasks} nhiệm vụ hoàn
                        thành
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <UserCheck size={10} /> {entry.assignedHR}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar size={10} /> {entry.lastUpdated}
                    </div>
                    <Eye size={14} className="text-muted-foreground mt-1" />
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <ClipboardList size={24} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Không có dữ liệu
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <TrackerDetailDrawer
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
