"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  AtSign,
  Pin,
  Star,
  UserPlus,
  Calendar,
  Clock,
  CheckSquare,
  XSquare,
  Search,
  FileText,
  DollarSign,
  ChevronRight,
  Cake,
  Award,
  AlertCircle,
  Wifi,
  WifiOff,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Bell,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ChevronLeft,
  Users,
  TrendingUp,
  ListTodo,
  Briefcase,
  Target,
  Lock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FeedPost {
  id: string;
  type: "announcement" | "milestone" | "new_hire" | "kudos" | "activity";
  author: string;
  authorRole: string;
  avatar: string;
  time: string;
  pinned?: boolean;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  tags?: string[];
  liked?: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface LeaveRequest {
  id: string;
  name: string;
  dept: string;
  type: string;
  dates: string;
  days: number;
  status: "pending";
}

interface Interview {
  id: string;
  candidate: string;
  position: string;
  time: string;
  interviewer: string;
}

interface Milestone {
  id: string;
  type: "birthday" | "anniversary" | "probation" | "training";
  name: string;
  detail: string;
  date: string;
  daysLeft: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_FEED: FeedPost[] = [
  {
    id: "f1",
    type: "announcement",
    author: "Ban Giám đốc",
    authorRole: "Thông báo chính thức",
    avatar: "BG",
    time: "08:00",
    pinned: true,
    image: "/image.jpg",
    content:
      "📢 Thông báo: Công ty sẽ nghỉ lễ Quốc khánh 2/9 từ ngày 01/09 đến 03/09/2026. Toàn bộ nhân viên vui lòng hoàn thành bàn giao công việc trước 17:00 ngày 31/08. Chúc toàn thể CBNV kỳ nghỉ lễ vui vẻ và an toàn!",
    likes: 47,
    comments: [
      {
        id: "c1",
        author: "Trần Minh Khoa",
        avatar: "TK",
        text: "Cảm ơn Ban Giám đốc! 🎉",
        time: "08:15",
      },
    ],
    tags: [],
    liked: false,
  },
  {
    id: "f2",
    type: "milestone",
    author: "Phòng Thiết kế",
    authorRole: "Khối Thiết kế",
    avatar: "TK",
    time: "09:30",
    content:
      "🏆 Chúc mừng đội Thiết kế đã hoàn thành bản vẽ kỹ thuật thi công Dự án Khu đô thị Vinhomes Grand Park Phase 3! Sau 4 tháng nỗ lực, toàn bộ 847 bản vẽ BIM đã được phê duyệt. Cảm ơn sự cống hiến của toàn đội!",
    likes: 83,
    comments: [],
    tags: ["@Phòng Thiết kế", "@Dự án VGP3"],
    liked: true,
  },
  {
    id: "f3",
    type: "new_hire",
    author: "Phòng Nhân sự",
    authorRole: "HR Management",
    avatar: "HR",
    time: "10:00",
    content:
      "👋 Chào mừng thành viên mới! Trân trọng giới thiệu Kỹ sư Phạm Thị Lan Anh (MSV: EMP-2026-089) gia nhập Phòng Kết cấu – Khối Thiết kế từ ngày 01/09/2026. Hãy cùng chào đón Lan Anh nhé! 🌟",
    likes: 31,
    comments: [],
    tags: ["@Phòng Kết cấu"],
    liked: false,
  },
];

const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "lr1",
    name: "Nguyễn Văn An",
    dept: "Xây dựng",
    type: "Nghỉ phép năm",
    dates: "02/09 – 04/09",
    days: 3,
    status: "pending",
  },
  {
    id: "lr2",
    name: "Trần Thị Bích",
    dept: "Kế toán",
    type: "Nghỉ ốm",
    dates: "01/09",
    days: 1,
    status: "pending",
  },
];

const INTERVIEWS: Interview[] = [
  {
    id: "i1",
    candidate: "Hoàng Văn Đức",
    position: "Kỹ sư Kết cấu Senior",
    time: "09:00",
    interviewer: "Nguyễn Trưởng phòng",
  },
  {
    id: "i2",
    candidate: "Vũ Thị Phương",
    position: "Chuyên viên Kế toán",
    time: "14:00",
    interviewer: "Lê Kế toán trưởng",
  },
];

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    type: "birthday",
    name: "Nguyễn Thị Hoa",
    detail: "Phòng Kế toán",
    date: "01/09",
    daysLeft: 1,
  },
  {
    id: "m2",
    type: "probation",
    name: "Phạm Lan Anh",
    detail: "Kết thúc thử việc – Cần đánh giá",
    date: "15/09",
    daysLeft: 15,
  },
];

const HEADCOUNT = { nhom1: 42, nhom2: 67, nhom3: 45, total: 154 };
const ATTENDANCE = { checkedIn: 138, absent: 16, rate: 89.6 };
const OPEN_REQS = 7;

// ─── Sub-components ───────────────────────────────────────────────────────────

function AttendanceRing({ rate }: { rate: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  return (
    <div className="flex items-center gap-3">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="var(--base-100)"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="butt"
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="700"
          fill="var(--foreground)"
        >
          {rate}%
        </text>
        <text
          x="44"
          y="58"
          textAnchor="middle"
          fontSize="8"
          fill="var(--muted-foreground)"
        >
          Có mặt
        </text>
      </svg>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 flex-shrink-0 rounded-sm"
            style={{ backgroundColor: "var(--primary)" }}
          />
          <span className="text-xs text-foreground">
            {ATTENDANCE.checkedIn} có mặt
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 flex-shrink-0 bg-red-400 rounded-sm" />
          <span className="text-xs text-foreground">
            {ATTENDANCE.absent} vắng mặt
          </span>
        </div>
      </div>
    </div>
  );
}

function HeadcountBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-14 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-4 bg-muted overflow-hidden rounded">
        <div
          className="h-full transition-all duration-500 rounded"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">
        {count}
      </span>
    </div>
  );
}

function MilestoneIcon({ type }: { type: Milestone["type"] }) {
  if (type === "birthday") return <Cake size={13} className="text-pink-500" />;
  if (type === "anniversary")
    return <Award size={13} className="text-amber-500" />;
  if (type === "probation")
    return <AlertCircle size={13} className="text-orange-500" />;
  return <Calendar size={13} className="text-blue-500" />;
}

function FeedTypeTag({ type }: { type: FeedPost["type"] }) {
  const map: Record<FeedPost["type"], { label: string; color: string }> = {
    announcement: { label: "Thông báo", color: "bg-blue-100 text-blue-700" },
    milestone: { label: "Cột mốc", color: "bg-amber-100 text-amber-700" },
    new_hire: { label: "Nhân viên mới", color: "bg-green-100 text-green-700" },
    kudos: { label: "Khen thưởng", color: "bg-purple-100 text-purple-700" },
    activity: { label: "Sự kiện", color: "bg-cyan-100 text-cyan-700" },
  };
  const { label, color } = map[type];
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}
    >
      {label}
    </span>
  );
}

// ─── Collapsed Icon Helper ───────────────────────────────────────────────────
function CollapsedIconButton({
  icon,
  badge,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  badge?: number;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="relative p-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground group"
    >
      {icon}
      {!!badge && badge > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border-2 border-card group-hover:border-muted transition-colors">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

// ─── Shared Accordion Component ──────────────────────────────────────────────
export interface DetailAccordionProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DetailAccordion({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  className = "",
}: DetailAccordionProps) {
  return (
    <div
      className={`flex flex-col border-b border-border transition-all duration-300 bg-card ${isExpanded ? "lg:flex-1 lg:min-h-0 h-auto" : "flex-shrink-0"} ${className}`}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors flex-shrink-0 w-full text-left"
      >
        <div className="flex items-center gap-2 text-muted-foreground w-full min-w-0 pr-4">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-widest truncate">
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp
            size={14}
            className="text-muted-foreground flex-shrink-0"
          />
        ) : (
          <ChevronDown
            size={14}
            className="text-muted-foreground flex-shrink-0"
          />
        )}
      </button>
      {isExpanded && (
        <div className="lg:flex-1 lg:overflow-y-auto scrollbar-hide p-4 bg-background/50 fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Layout Component ───────────────────────────────────────────────────
export interface DetailLayoutProps {
  title: React.ReactNode;
  onBack?: () => void;
  headerActions?: React.ReactNode;
  overlay?: React.ReactNode;
  leftSidebar?: {
    content: (
      collapsed: boolean,
      setCollapsed: (val: boolean) => void,
    ) => React.ReactNode;
    defaultCollapsed?: boolean;
  };
  children: React.ReactNode;
  rightSidebar?: {
    content: (
      collapsed: boolean,
      setCollapsed: (val: boolean) => void,
    ) => React.ReactNode;
    defaultCollapsed?: boolean;
  };
  footer?: React.ReactNode;
}

export function DetailLayout({
  title,
  onBack,
  headerActions,
  overlay,
  leftSidebar,
  rightSidebar,
  children,
  footer,
}: DetailLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(
    leftSidebar?.defaultCollapsed ?? false,
  );
  const [rightCollapsed, setRightCollapsed] = useState(
    rightSidebar?.defaultCollapsed ?? false,
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background relative">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 h-[var(--topbar-height,56px)] border-b border-border bg-card flex-shrink-0 z-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="btn-ghost flex items-center gap-1.5 text-xs px-2 py-1.5 flex-shrink-0"
              >
                <ArrowLeft size={13} /> Quay lại
              </button>
              <div className="w-px h-4 bg-border mx-1 sm:mx-3 flex-shrink-0" />
            </>
          )}
          <div className="text-sm font-bold text-foreground truncate">
            {title}
          </div>
        </div>
        {headerActions && (
          <div className="flex-shrink-0 ml-4">{headerActions}</div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden relative">
        {overlay}

        {/* LEFT COLUMN */}
        {leftSidebar && (
          <div
            className={`relative flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-card transition-all duration-300 z-20 ${leftCollapsed ? "lg:w-[72px]" : "lg:w-[320px]"}`}
          >
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30"
            >
              {leftCollapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronLeft size={12} />
              )}
            </button>
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {leftSidebar.content(leftCollapsed, setLeftCollapsed)}
            </div>
          </div>
        )}

        {/* CENTER COLUMN */}
        <div className="flex-1 flex flex-col min-w-0 bg-background lg:overflow-hidden relative">
          {children}
        </div>

        {/* RIGHT COLUMN */}
        {rightSidebar && (
          <div
            className={`relative flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-card transition-all duration-300 z-20 ${rightCollapsed ? "lg:w-[72px]" : "lg:w-[320px]"}`}
          >
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="hidden lg:flex absolute -left-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30"
            >
              {rightCollapsed ? (
                <ChevronLeft size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {rightSidebar.content(rightCollapsed, setRightCollapsed)}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      {footer && (
        <div className="flex-shrink-0 min-h-[var(--topbar-height,56px)] py-3 border-t border-border bg-card px-4 lg:px-5 flex items-center justify-center sm:justify-end gap-2 flex-wrap sm:flex-nowrap z-10">
          {footer}
        </div>
      )}
    </div>
  );
}

// ─── Custom UI Helpers (Ring & Bar) ──────────────────────────────────────────
function CircularProgress({
  rate,
  label,
  color = "var(--primary)",
}: {
  rate: number;
  label: string;
  color?: string;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  return (
    <div className="flex items-center gap-3">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="var(--base-100)"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="butt"
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="700"
          fill="var(--foreground)"
        >
          {rate}%
        </text>
        <text
          x="44"
          y="58"
          textAnchor="middle"
          fontSize="8"
          fill="var(--muted-foreground)"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

function ProgressIndicator({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-14 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-4 bg-muted overflow-hidden rounded">
        <div
          className="h-full transition-all duration-500 rounded"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">
        {count}/{total}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Department = "HR" | "SALES" | "GENERAL" | "GUEST";
// ─── Main Component ───────────────────────────────────────────────────────────

export default function HRDashboard() {
  // ─── STATE ───
  // simulate the current user's department/role
  const [department, setDepartment] = useState<Department>("GENERAL");

  const [feed, setFeed] = useState<FeedPost[]>(INITIAL_FEED);
  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [wsConnected, setWsConnected] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [processedLeaves, setProcessedLeaves] = useState<
    Record<string, "approved" | "denied">
  >({});
  const wsRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [col1Expanded, setCol1Expanded] = useState<"top" | "middle" | "bottom">(
    "top",
  );
  const [col3Expanded, setCol3Expanded] = useState<"top" | "middle" | "bottom">(
    "top",
  );

  useEffect(() => {
    setWsConnected(true);
    const pushLiveUpdate = () => {
      const livePost: FeedPost = {
        id: `live-${Date.now()}`,
        type: "kudos",
        author: "Hệ thống HR",
        authorRole: "Live Update",
        avatar: "WS",
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: `🔔 Cập nhật trực tiếp: Đơn xin nghỉ phép mới từ Nguyễn Văn Bảo đang chờ phê duyệt.`,
        likes: 0,
        comments: [],
        tags: [],
        liked: false,
      };
      setFeed((prev) => [livePost, ...prev.slice(0, 9)]);
      setLeaveRequests((prev) => [
        {
          id: `lr-live-${Date.now()}`,
          name: "Nguyễn Văn Bảo",
          dept: "Xây dựng",
          type: "Nghỉ phép năm",
          dates: "04/09 – 05/09",
          days: 2,
          status: "pending",
        },
        ...prev,
      ]);
    };
    wsRef.current = setTimeout(pushLiveUpdate, 8000);
    return () => {
      if (wsRef.current) clearTimeout(wsRef.current);
      setWsConnected(false);
    };
  }, []);

  const toggleLike = useCallback((postId: string) => {
    setFeed((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
  }, []);

  const toggleComments = useCallback((postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  const submitComment = useCallback(
    (postId: string) => {
      const text = commentInputs[postId]?.trim();
      if (!text) return;
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        author: "Sơn Lêu",
        avatar: "SL",
        text,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setFeed((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
        ),
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    },
    [commentInputs],
  );

  const handleLeave = useCallback(
    (id: string, action: "approved" | "denied") => {
      setProcessedLeaves((prev) => ({ ...prev, [id]: action }));
    },
    [],
  );

  const pendingLeaveCount = leaveRequests.filter(
    (r) => !processedLeaves[r.id],
  ).length;

  // ─── RENDER LEFT SIDEBAR (Tailored by Dept) ───
  const renderLeftSidebar = (
    collapsed: boolean,
    setCollapsed: (val: boolean) => void,
  ) => {
    switch (department) {
      case "HR":
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {collapsed ? (
              <div className="flex flex-col items-center gap-4 py-4 w-full h-full">
                <CollapsedIconButton
                  icon={<FileText size={20} />}
                  badge={pendingLeaveCount}
                  title="Đơn xin nghỉ phép"
                  onClick={() => {
                    setCollapsed(false);
                    setCol1Expanded("top");
                  }}
                />
                <CollapsedIconButton
                  icon={<UserPlus size={20} />}
                  badge={INTERVIEWS.length}
                  title="Phỏng vấn hôm nay"
                  onClick={() => {
                    setCollapsed(false);
                    setCol1Expanded("middle");
                  }}
                />
                <CollapsedIconButton
                  icon={<Search size={20} />}
                  title="Truy cập nhanh"
                  onClick={() => {
                    setCollapsed(false);
                    setCol1Expanded("bottom");
                  }}
                />
              </div>
            ) : (
              <>
                <DetailAccordion
                  title={
                    <>
                      Đơn xin nghỉ phép
                      {pendingLeaveCount > 0 && (
                        <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded normal-case tracking-normal">
                          {pendingLeaveCount} chờ
                        </span>
                      )}
                    </>
                  }
                  isExpanded={col1Expanded === "top"}
                  onToggle={() =>
                    setCol1Expanded(col1Expanded === "top" ? "middle" : "top")
                  }
                >
                  <div className="-m-4">
                    {leaveRequests.map((req, idx) => {
                      const processed = processedLeaves[req.id];
                      return (
                        <div
                          key={req.id}
                          className={`px-4 py-3 ${idx < leaveRequests.length - 1 ? "border-b border-border" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {req.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {req.dept} · {req.type}
                              </p>
                              <p className="text-[10px] text-foreground mt-0.5">
                                {req.dates} ({req.days} ngày)
                              </p>
                            </div>
                            {processed ? (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 flex-shrink-0 rounded ${processed === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                              >
                                {processed === "approved"
                                  ? "Đã duyệt"
                                  : "Từ chối"}
                              </span>
                            ) : (
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() =>
                                    handleLeave(req.id, "approved")
                                  }
                                  className="p-1 hover:bg-green-50 text-green-600 transition-colors rounded"
                                  title="Phê duyệt"
                                >
                                  <CheckSquare size={15} />
                                </button>
                                <button
                                  onClick={() => handleLeave(req.id, "denied")}
                                  className="p-1 hover:bg-red-50 text-red-500 transition-colors rounded"
                                  title="Từ chối"
                                >
                                  <XSquare size={15} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DetailAccordion>

                <DetailAccordion
                  title={
                    <>
                      Phỏng vấn hôm nay
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded normal-case tracking-normal">
                        {INTERVIEWS.length}
                      </span>
                    </>
                  }
                  isExpanded={col1Expanded === "middle"}
                  onToggle={() =>
                    setCol1Expanded(
                      col1Expanded === "middle" ? "bottom" : "middle",
                    )
                  }
                >
                  <div className="-m-4">
                    {INTERVIEWS.map((iv, idx) => (
                      <div
                        key={iv.id}
                        className={`px-4 py-3 ${idx < INTERVIEWS.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white rounded"
                            style={{ backgroundColor: "var(--primary)" }}
                          >
                            {iv.time.split(":")[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {iv.candidate}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {iv.position}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {iv.time} · {iv.interviewer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailAccordion>

                <DetailAccordion
                  title="Truy cập nhanh"
                  isExpanded={col1Expanded === "bottom"}
                  onToggle={() =>
                    setCol1Expanded(
                      col1Expanded === "bottom" ? "top" : "bottom",
                    )
                  }
                  className="border-b-0"
                >
                  <div className="-m-4">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2 border border-border bg-background px-2 py-1.5 rounded">
                        <Search
                          size={13}
                          className="text-muted-foreground flex-shrink-0"
                        />
                        <input
                          className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                          placeholder="Tìm nhân viên..."
                        />
                      </div>
                    </div>
                    {[
                      {
                        icon: <DollarSign size={13} />,
                        label: "Đồng bộ bảng lương",
                        sub: "Kết nối Phòng Kế toán",
                      },
                      {
                        icon: <Clock size={13} />,
                        label: "Chấm công tháng 8",
                        sub: "Xuất báo cáo",
                      },
                      {
                        icon: <FileText size={13} />,
                        label: "Mẫu hợp đồng lao động",
                        sub: "Template chuẩn",
                      },
                      {
                        icon: <FileText size={13} />,
                        label: "Thư mời nhận việc",
                        sub: "Offer Letter",
                      },
                    ].map((item, idx, arr) => (
                      <button
                        key={item.label}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left rounded-none ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <span className="text-muted-foreground flex-shrink-0">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.sub}
                          </p>
                        </div>
                        <ChevronRight
                          size={12}
                          className="text-muted-foreground ml-auto flex-shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                </DetailAccordion>
              </>
            )}
          </div>
        );

      case "SALES":
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {collapsed ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CollapsedIconButton
                  icon={<Briefcase size={20} />}
                  badge={3}
                  title="Lịch hẹn khách hàng"
                  onClick={() => {
                    setCollapsed(false);
                    setCol1Expanded("top");
                  }}
                />
                <CollapsedIconButton
                  icon={<Target size={20} />}
                  title="Leads cần chốt"
                  onClick={() => {
                    setCollapsed(false);
                    setCol1Expanded("middle");
                  }}
                />
              </div>
            ) : (
              <>
                <DetailAccordion
                  title={
                    <>
                      Lịch hẹn khách hàng{" "}
                      <span className="ml-2 text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        3 lịch
                      </span>
                    </>
                  }
                  isExpanded={col1Expanded === "top"}
                  onToggle={() => setCol1Expanded("top")}
                >
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold">Tập đoàn Hòa Phát</p>
                    <p className="text-[10px] text-muted-foreground">
                      10:00 · Pitching phần mềm
                    </p>
                  </div>
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold">
                      Công ty Xây dựng ABC
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      14:30 · Ký hợp đồng
                    </p>
                  </div>
                </DetailAccordion>
                <DetailAccordion
                  title="Leads nóng cần gọi"
                  isExpanded={col1Expanded === "middle"}
                  onToggle={() => setCol1Expanded("middle")}
                >
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold">
                      Nguyễn Văn A - 098xxxxxxx
                    </p>
                    <p className="text-[10px] text-red-500">Đã trễ 2 giờ</p>
                  </div>
                </DetailAccordion>
              </>
            )}
          </div>
        );

      case "GENERAL":
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {collapsed ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CollapsedIconButton
                  icon={<ListTodo size={20} />}
                  badge={4}
                  title="Công việc của tôi"
                  onClick={() => {
                    setCollapsed(false);
                    setCol1Expanded("top");
                  }}
                />
              </div>
            ) : (
              <>
                <DetailAccordion
                  title={
                    <>
                      Công việc của tôi{" "}
                      <span className="ml-2 text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        4 task
                      </span>
                    </>
                  }
                  isExpanded={col1Expanded === "top"}
                  onToggle={() => setCol1Expanded("top")}
                >
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold">
                      Báo cáo hiệu suất tháng 8
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Hạn: 17:00 Hôm nay
                    </p>
                  </div>
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold">
                      Cập nhật thiết kế v2.1
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Hạn: Ngày mai
                    </p>
                  </div>
                </DetailAccordion>
              </>
            )}
          </div>
        );
      case "GUEST":
        return (
          <div className="flex flex-col items-center py-6 h-full gap-8 bg-muted/10">
            <CollapsedIconButton
              icon={<Lock size={20} />}
              title="Tính năng khóa"
            />
            <span
              className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase whitespace-nowrap rotate-180"
              style={{ writingMode: "vertical-rl" }}
            >
              Chưa phân quyền
            </span>
          </div>
        );
    }
  };

  // ─── RENDER RIGHT SIDEBAR (Tailored by Dept) ───
  const renderRightSidebar = (
    collapsed: boolean,
    setCollapsed: (val: boolean) => void,
  ) => {
    switch (department) {
      case "HR":
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {collapsed ? (
              <div className="flex flex-col items-center gap-4 py-4 w-full h-full">
                <CollapsedIconButton
                  icon={<CheckSquare size={20} />}
                  title="Chấm công hôm nay"
                  onClick={() => {
                    setCollapsed(false);
                    setCol3Expanded("top");
                  }}
                />
                <CollapsedIconButton
                  icon={<Users size={20} />}
                  badge={OPEN_REQS} // Alerting HR they have open reqs to fill
                  title="Nhân sự theo nhóm"
                  onClick={() => {
                    setCollapsed(false);
                    setCol3Expanded("middle");
                  }}
                />
                <CollapsedIconButton
                  icon={<Calendar size={20} />}
                  badge={MILESTONES.length}
                  title="Sự kiện sắp tới"
                  onClick={() => {
                    setCollapsed(false);
                    setCol3Expanded("bottom");
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
                <DetailAccordion
                  title="Chấm công hôm nay"
                  isExpanded={col3Expanded === "top"}
                  onToggle={() =>
                    setCol3Expanded(col3Expanded === "top" ? "middle" : "top")
                  }
                >
                  <div className="flex items-center justify-center">
                    <AttendanceRing rate={ATTENDANCE.rate} />
                  </div>
                </DetailAccordion>

                <DetailAccordion
                  title={
                    <>
                      Nhân sự theo nhóm
                      <span className="ml-2 text-xs font-bold text-foreground normal-case tracking-normal">
                        {HEADCOUNT.total}
                      </span>
                    </>
                  }
                  isExpanded={col3Expanded === "middle"}
                  onToggle={() =>
                    setCol3Expanded(
                      col3Expanded === "middle" ? "bottom" : "middle",
                    )
                  }
                >
                  <div className="space-y-2.5">
                    <HeadcountBar
                      label="Nhóm 1"
                      count={HEADCOUNT.nhom1}
                      total={HEADCOUNT.total}
                      color="var(--primary)"
                    />
                    <HeadcountBar
                      label="Nhóm 2"
                      count={HEADCOUNT.nhom2}
                      total={HEADCOUNT.total}
                      color="var(--accent)"
                    />
                    <HeadcountBar
                      label="Nhóm 3"
                      count={HEADCOUNT.nhom3}
                      total={HEADCOUNT.total}
                      color="var(--base-250)"
                    />
                  </div>
                  <div className="pt-4 flex items-center gap-3">
                    <div className="flex-1 border border-border bg-background p-2 text-center rounded">
                      <p className="text-lg font-bold text-foreground">
                        {OPEN_REQS}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Vị trí tuyển dụng
                      </p>
                    </div>
                    <div className="flex-1 border border-border bg-background p-2 text-center rounded">
                      <p className="text-lg font-bold text-foreground">3</p>
                      <p className="text-[10px] text-muted-foreground">
                        Ứng viên chờ
                      </p>
                    </div>
                  </div>
                </DetailAccordion>

                <DetailAccordion
                  title="Sự kiện sắp tới"
                  isExpanded={col3Expanded === "bottom"}
                  onToggle={() =>
                    setCol3Expanded(
                      col3Expanded === "bottom" ? "top" : "bottom",
                    )
                  }
                  className="border-b-0"
                >
                  <div className="-m-4">
                    {MILESTONES.map((m, idx) => (
                      <div
                        key={m.id}
                        className={`flex items-start gap-3 px-4 py-3 ${idx < MILESTONES.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center border border-border bg-background rounded">
                          <MilestoneIcon type={m.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {m.detail}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-[10px] font-semibold text-foreground">
                            {m.date}
                          </p>
                          <p
                            className={`text-[10px] ${m.daysLeft <= 3 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}
                          >
                            {m.daysLeft === 0
                              ? "Hôm nay"
                              : `${m.daysLeft} ngày`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailAccordion>
              </div>
            )}
          </div>
        );

      case "SALES":
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {collapsed ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CollapsedIconButton
                  icon={<TrendingUp size={20} />}
                  title="Doanh số"
                  onClick={() => {
                    setCollapsed(false);
                    setCol3Expanded("top");
                  }}
                />
                <CollapsedIconButton
                  icon={<Award size={20} />}
                  title="Bảng vàng"
                  onClick={() => {
                    setCollapsed(false);
                    setCol3Expanded("middle");
                  }}
                />
              </div>
            ) : (
              <>
                <DetailAccordion
                  title="Tiến độ KPI Quý 3"
                  isExpanded={col3Expanded === "top"}
                  onToggle={() => setCol3Expanded("top")}
                >
                  <div className="flex justify-center">
                    <CircularProgress
                      rate={75}
                      label="Hoàn thành"
                      color="#10b981"
                    />
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-xs font-bold text-foreground">
                      1.5T / 2.0T
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Doanh thu cá nhân
                    </p>
                  </div>
                </DetailAccordion>
                <DetailAccordion
                  title="Top Sale Tháng"
                  isExpanded={col3Expanded === "middle"}
                  onToggle={() => setCol3Expanded("middle")}
                >
                  <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-500">
                        🥇 Lê Văn B.
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        12 Hợp đồng
                      </p>
                    </div>
                    <span className="text-xs font-bold">1.2T</span>
                  </div>
                </DetailAccordion>
              </>
            )}
          </div>
        );

      case "GENERAL":
        return (
          <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
            {collapsed ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CollapsedIconButton
                  icon={<Clock size={20} />}
                  title="Chấm công cá nhân"
                  onClick={() => {
                    setCollapsed(false);
                    setCol3Expanded("top");
                  }}
                />
              </div>
            ) : (
              <>
                <DetailAccordion
                  title="Chấm công cá nhân (Tháng 8)"
                  isExpanded={col3Expanded === "top"}
                  onToggle={() => setCol3Expanded("top")}
                >
                  <div className="flex justify-center">
                    <CircularProgress
                      rate={100}
                      label="Đúng giờ"
                      color="var(--primary)"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="border border-border rounded p-2">
                      <p className="text-lg font-bold">22</p>
                      <p className="text-[10px] text-muted-foreground">
                        Ngày công
                      </p>
                    </div>
                    <div className="border border-border rounded p-2">
                      <p className="text-lg font-bold">0</p>
                      <p className="text-[10px] text-muted-foreground">
                        Đi muộn
                      </p>
                    </div>
                  </div>
                </DetailAccordion>
              </>
            )}
          </div>
        );

      case "GUEST":
        return (
          <div className="flex flex-col items-center py-6 h-full gap-8 bg-muted/10">
            <CollapsedIconButton
              icon={<Lock size={20} />}
              title="Tính năng khóa"
            />
            <span
              className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase whitespace-nowrap rotate-180"
              style={{ writingMode: "vertical-rl" }}
            >
              Chưa phân quyền
            </span>
          </div>
        );
    }
  };

  return (
    <DetailLayout
      title={
        // <div className="flex flex-col">
        //   <span className="text-base font-bold text-foreground">
        //     Phòng Quản lý Nhân lực
        //   </span>
        //   <span className="text-[11px] font-normal text-muted-foreground mt-0.5">
        //     Chủ nhật, 31 tháng 8 năm 2026 · Cập nhật lúc 06:32
        //   </span>
        // </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-foreground">
            Bảng tin Nội bộ
          </span>
          <span className="text-[11px] font-normal text-muted-foreground mt-0.5">
            Cập nhật thời gian thực toàn công ty
          </span>
        </div>
      }
      headerActions={
        // <div className="flex items-center gap-2">
        //   <div
        //     className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded border ${
        //       wsConnected
        //         ? "border-green-300 text-green-700 bg-green-50"
        //         : "border-red-300 text-red-600 bg-red-50"
        //     }`}
        //   >
        //     {wsConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
        //     <span className="hidden sm:inline">
        //       {wsConnected ? "Live" : "Offline"}
        //     </span>
        //   </div>
        //   <button className="btn-primary text-xs py-1.5 px-3 rounded flex items-center">
        //     <UserPlus size={13} className="inline mr-1" />
        //     Thêm nhân viên
        //   </button>
        // </div>
        <div className="flex items-center gap-2">
          {/* ── DEPARTMENT SIMULATOR DROPDOWN ── */}
          <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md border border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              Góc nhìn:
            </span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="text-xs font-bold bg-transparent outline-none cursor-pointer text-primary"
            >
              
              <option value="GUEST">Guest</option>
              <option value="HR">HR / Nhân sự</option>
              <option value="SALES">Kinh doanh</option>
              <option value="GENERAL">Nhân viên thường</option>
            </select>
          </div>
        </div>
      }
      // leftSidebar={{
      //   defaultCollapsed: false,
      //   content: (collapsed, setCollapsed) => {
      //     if (collapsed) {
      //       return (
      //         <div className="flex flex-col items-center gap-4 py-4 w-full h-full">
      //           <CollapsedIconButton
      //             icon={<FileText size={20} />}
      //             badge={pendingLeaveCount}
      //             title="Đơn xin nghỉ phép"
      //             onClick={() => {
      //               setCollapsed(false);
      //               setCol1Expanded("top");
      //             }}
      //           />
      //           <CollapsedIconButton
      //             icon={<UserPlus size={20} />}
      //             badge={INTERVIEWS.length}
      //             title="Phỏng vấn hôm nay"
      //             onClick={() => {
      //               setCollapsed(false);
      //               setCol1Expanded("middle");
      //             }}
      //           />
      //           <CollapsedIconButton
      //             icon={<Search size={20} />}
      //             title="Truy cập nhanh"
      //             onClick={() => {
      //               setCollapsed(false);
      //               setCol1Expanded("bottom");
      //             }}
      //           />
      //         </div>
      //       );
      //     }

      //     return (
      //       <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      //         <DetailAccordion
      //           title={
      //             <>
      //               Đơn xin nghỉ phép
      //               {pendingLeaveCount > 0 && (
      //                 <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded normal-case tracking-normal">
      //                   {pendingLeaveCount} chờ
      //                 </span>
      //               )}
      //             </>
      //           }
      //           isExpanded={col1Expanded === "top"}
      //           onToggle={() =>
      //             setCol1Expanded(col1Expanded === "top" ? "middle" : "top")
      //           }
      //         >
      //           <div className="-m-4">
      //             {leaveRequests.map((req, idx) => {
      //               const processed = processedLeaves[req.id];
      //               return (
      //                 <div
      //                   key={req.id}
      //                   className={`px-4 py-3 ${idx < leaveRequests.length - 1 ? "border-b border-border" : ""}`}
      //                 >
      //                   <div className="flex items-start justify-between gap-2">
      //                     <div className="min-w-0">
      //                       <p className="text-xs font-semibold text-foreground truncate">
      //                         {req.name}
      //                       </p>
      //                       <p className="text-[10px] text-muted-foreground">
      //                         {req.dept} · {req.type}
      //                       </p>
      //                       <p className="text-[10px] text-foreground mt-0.5">
      //                         {req.dates} ({req.days} ngày)
      //                       </p>
      //                     </div>
      //                     {processed ? (
      //                       <span
      //                         className={`text-[10px] font-semibold px-1.5 py-0.5 flex-shrink-0 rounded ${processed === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
      //                       >
      //                         {processed === "approved"
      //                           ? "Đã duyệt"
      //                           : "Từ chối"}
      //                       </span>
      //                     ) : (
      //                       <div className="flex gap-1 flex-shrink-0">
      //                         <button
      //                           onClick={() => handleLeave(req.id, "approved")}
      //                           className="p-1 hover:bg-green-50 text-green-600 transition-colors rounded"
      //                           title="Phê duyệt"
      //                         >
      //                           <CheckSquare size={15} />
      //                         </button>
      //                         <button
      //                           onClick={() => handleLeave(req.id, "denied")}
      //                           className="p-1 hover:bg-red-50 text-red-500 transition-colors rounded"
      //                           title="Từ chối"
      //                         >
      //                           <XSquare size={15} />
      //                         </button>
      //                       </div>
      //                     )}
      //                   </div>
      //                 </div>
      //               );
      //             })}
      //           </div>
      //         </DetailAccordion>

      //         <DetailAccordion
      //           title={
      //             <>
      //               Phỏng vấn hôm nay
      //               <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded normal-case tracking-normal">
      //                 {INTERVIEWS.length}
      //               </span>
      //             </>
      //           }
      //           isExpanded={col1Expanded === "middle"}
      //           onToggle={() =>
      //             setCol1Expanded(
      //               col1Expanded === "middle" ? "bottom" : "middle",
      //             )
      //           }
      //         >
      //           <div className="-m-4">
      //             {INTERVIEWS.map((iv, idx) => (
      //               <div
      //                 key={iv.id}
      //                 className={`px-4 py-3 ${idx < INTERVIEWS.length - 1 ? "border-b border-border" : ""}`}
      //               >
      //                 <div className="flex items-center gap-2">
      //                   <div
      //                     className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white rounded"
      //                     style={{ backgroundColor: "var(--primary)" }}
      //                   >
      //                     {iv.time.split(":")[0]}
      //                   </div>
      //                   <div className="min-w-0">
      //                     <p className="text-xs font-semibold text-foreground truncate">
      //                       {iv.candidate}
      //                     </p>
      //                     <p className="text-[10px] text-muted-foreground truncate">
      //                       {iv.position}
      //                     </p>
      //                     <p className="text-[10px] text-muted-foreground">
      //                       {iv.time} · {iv.interviewer}
      //                     </p>
      //                   </div>
      //                 </div>
      //               </div>
      //             ))}
      //           </div>
      //         </DetailAccordion>

      //         <DetailAccordion
      //           title="Truy cập nhanh"
      //           isExpanded={col1Expanded === "bottom"}
      //           onToggle={() =>
      //             setCol1Expanded(col1Expanded === "bottom" ? "top" : "bottom")
      //           }
      //           className="border-b-0"
      //         >
      //           <div className="-m-4">
      //             <div className="px-4 py-3 border-b border-border">
      //               <div className="flex items-center gap-2 border border-border bg-background px-2 py-1.5 rounded">
      //                 <Search
      //                   size={13}
      //                   className="text-muted-foreground flex-shrink-0"
      //                 />
      //                 <input
      //                   className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
      //                   placeholder="Tìm nhân viên..."
      //                 />
      //               </div>
      //             </div>
      //             {[
      //               {
      //                 icon: <DollarSign size={13} />,
      //                 label: "Đồng bộ bảng lương",
      //                 sub: "Kết nối Phòng Kế toán",
      //               },
      //               {
      //                 icon: <Clock size={13} />,
      //                 label: "Chấm công tháng 8",
      //                 sub: "Xuất báo cáo",
      //               },
      //               {
      //                 icon: <FileText size={13} />,
      //                 label: "Mẫu hợp đồng lao động",
      //                 sub: "Template chuẩn",
      //               },
      //               {
      //                 icon: <FileText size={13} />,
      //                 label: "Thư mời nhận việc",
      //                 sub: "Offer Letter",
      //               },
      //             ].map((item, idx, arr) => (
      //               <button
      //                 key={item.label}
      //                 className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left rounded-none ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
      //               >
      //                 <span className="text-muted-foreground flex-shrink-0">
      //                   {item.icon}
      //                 </span>
      //                 <div className="min-w-0">
      //                   <p className="text-xs font-medium text-foreground">
      //                     {item.label}
      //                   </p>
      //                   <p className="text-[10px] text-muted-foreground">
      //                     {item.sub}
      //                   </p>
      //                 </div>
      //                 <ChevronRight
      //                   size={12}
      //                   className="text-muted-foreground ml-auto flex-shrink-0"
      //                 />
      //               </button>
      //             ))}
      //           </div>
      //         </DetailAccordion>
      //       </div>
      //     );
      //   },
      // }}
      // rightSidebar={{
      //   defaultCollapsed: false,
      //   content: (collapsed, setCollapsed) => {
      //     if (collapsed) {
      //       return (
      //         <div className="flex flex-col items-center gap-4 py-4 w-full h-full">
      //           <CollapsedIconButton
      //             icon={<CheckSquare size={20} />}
      //             title="Chấm công hôm nay"
      //             onClick={() => {
      //               setCollapsed(false);
      //               setCol3Expanded("top");
      //             }}
      //           />
      //           <CollapsedIconButton
      //             icon={<Users size={20} />}
      //             badge={OPEN_REQS} // Alerting HR they have open reqs to fill
      //             title="Nhân sự theo nhóm"
      //             onClick={() => {
      //               setCollapsed(false);
      //               setCol3Expanded("middle");
      //             }}
      //           />
      //           <CollapsedIconButton
      //             icon={<Calendar size={20} />}
      //             badge={MILESTONES.length}
      //             title="Sự kiện sắp tới"
      //             onClick={() => {
      //               setCollapsed(false);
      //               setCol3Expanded("bottom");
      //             }}
      //           />
      //         </div>
      //       );
      //     }

      //     return (
      //       <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      //         <DetailAccordion
      //           title="Chấm công hôm nay"
      //           isExpanded={col3Expanded === "top"}
      //           onToggle={() =>
      //             setCol3Expanded(col3Expanded === "top" ? "middle" : "top")
      //           }
      //         >
      //           <div className="flex items-center justify-center">
      //             <AttendanceRing rate={ATTENDANCE.rate} />
      //           </div>
      //         </DetailAccordion>

      //         <DetailAccordion
      //           title={
      //             <>
      //               Nhân sự theo nhóm
      //               <span className="ml-2 text-xs font-bold text-foreground normal-case tracking-normal">
      //                 {HEADCOUNT.total}
      //               </span>
      //             </>
      //           }
      //           isExpanded={col3Expanded === "middle"}
      //           onToggle={() =>
      //             setCol3Expanded(
      //               col3Expanded === "middle" ? "bottom" : "middle",
      //             )
      //           }
      //         >
      //           <div className="space-y-2.5">
      //             <HeadcountBar
      //               label="Nhóm 1"
      //               count={HEADCOUNT.nhom1}
      //               total={HEADCOUNT.total}
      //               color="var(--primary)"
      //             />
      //             <HeadcountBar
      //               label="Nhóm 2"
      //               count={HEADCOUNT.nhom2}
      //               total={HEADCOUNT.total}
      //               color="var(--accent)"
      //             />
      //             <HeadcountBar
      //               label="Nhóm 3"
      //               count={HEADCOUNT.nhom3}
      //               total={HEADCOUNT.total}
      //               color="var(--base-250)"
      //             />
      //           </div>
      //           <div className="pt-4 flex items-center gap-3">
      //             <div className="flex-1 border border-border bg-background p-2 text-center rounded">
      //               <p className="text-lg font-bold text-foreground">
      //                 {OPEN_REQS}
      //               </p>
      //               <p className="text-[10px] text-muted-foreground">
      //                 Vị trí tuyển dụng
      //               </p>
      //             </div>
      //             <div className="flex-1 border border-border bg-background p-2 text-center rounded">
      //               <p className="text-lg font-bold text-foreground">3</p>
      //               <p className="text-[10px] text-muted-foreground">
      //                 Ứng viên chờ
      //               </p>
      //             </div>
      //           </div>
      //         </DetailAccordion>

      //         <DetailAccordion
      //           title="Sự kiện sắp tới"
      //           isExpanded={col3Expanded === "bottom"}
      //           onToggle={() =>
      //             setCol3Expanded(col3Expanded === "bottom" ? "top" : "bottom")
      //           }
      //           className="border-b-0"
      //         >
      //           <div className="-m-4">
      //             {MILESTONES.map((m, idx) => (
      //               <div
      //                 key={m.id}
      //                 className={`flex items-start gap-3 px-4 py-3 ${idx < MILESTONES.length - 1 ? "border-b border-border" : ""}`}
      //               >
      //                 <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center border border-border bg-background rounded">
      //                   <MilestoneIcon type={m.type} />
      //                 </div>
      //                 <div className="flex-1 min-w-0">
      //                   <p className="text-xs font-semibold text-foreground truncate">
      //                     {m.name}
      //                   </p>
      //                   <p className="text-[10px] text-muted-foreground truncate">
      //                     {m.detail}
      //                   </p>
      //                 </div>
      //                 <div className="flex-shrink-0 text-right">
      //                   <p className="text-[10px] font-semibold text-foreground">
      //                     {m.date}
      //                   </p>
      //                   <p
      //                     className={`text-[10px] ${m.daysLeft <= 3 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}
      //                   >
      //                     {m.daysLeft === 0 ? "Hôm nay" : `${m.daysLeft} ngày`}
      //                   </p>
      //                 </div>
      //               </div>
      //             ))}
      //           </div>
      //         </DetailAccordion>
      //       </div>
      //     );
      //   },
      // }}
      leftSidebar={{
        defaultCollapsed: false,
        content: renderLeftSidebar,
      }}
      rightSidebar={{
        defaultCollapsed: false,
        content: renderRightSidebar,
      }}
    >
      {/* ── CENTER: SOCIAL FEED ── */}
      <div className="flex flex-col h-full bg-background relative overflow-hidden border-r border-border">
        {/* Sticky Feed Header */}
        <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <span className="text-xs font-bold text-foreground">
            Bảng tin công ty
          </span>
          <Bell size={14} className="text-muted-foreground" />
        </div>

        {/* Scrollable Feed List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-border">
          {feed.map((post) => (
            <article key={post.id} className="bg-card">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white rounded"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground">
                        {post.author}
                      </span>
                      <FeedTypeTag type={post.type} />
                      {post.pinned && (
                        <Pin size={11} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {post.authorRole}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ·
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {post.time}
                      </span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground flex-shrink-0 rounded">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-3">
                <p className="text-xs text-foreground leading-relaxed">
                  {post.content}
                </p>
                {post.image && (
                  <img
                    src={post.image}
                    className="mt-2 rounded"
                    alt="Post attachment"
                  />
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-1.5 py-0.5 bg-muted text-primary flex items-center gap-0.5 rounded"
                      >
                        <AtSign size={9} />
                        {tag.replace("@", "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-border flex items-center gap-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors rounded ${
                    post.liked
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ThumbsUp
                    size={13}
                    className={post.liked ? "fill-current" : ""}
                  />
                  {post.likes}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded"
                >
                  <MessageSquare size={13} />
                  {post.comments.length}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto rounded">
                  <Star size={13} /> Lưu
                </button>
              </div>

              {expandedComments.has(post.id) && (
                <div className="border-t border-border bg-muted/30">
                  {post.comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex gap-2 px-4 py-2.5 border-b border-border/50"
                    >
                      <div
                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white rounded"
                        style={{ backgroundColor: "var(--accent)" }}
                      >
                        {c.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] font-semibold text-foreground">
                            {c.author}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {c.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground mt-0.5">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 px-4 py-2.5">
                    <div
                      className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white rounded"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      SL
                    </div>
                    <div className="flex-1 flex items-center gap-2 border border-border bg-card px-2 py-1 rounded">
                      <input
                        className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                        placeholder="Viết bình luận..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && submitComment(post.id)
                        }
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        className="text-primary hover:opacity-70 transition-opacity rounded"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </DetailLayout>
  );
}
