"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AlertTriangle,
  Server,
  WifiOff,
  Activity,
  Shield,
  Laptop,
  Lock,
  Eye,
  RefreshCw,
  Terminal,
  Bell,
  Zap,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "critical" | "high" | "medium" | "low";

interface Ticket {
  id: string;
  title: string;
  requester: string;
  dept: string;
  severity: Severity;
  time: string;
  status: "open" | "in_progress" | "resolved";
  type: "network" | "hardware" | "software" | "access" | "security";
}

interface TelemetryPoint {
  value: number;
  time: string;
}

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: "ok" | "warn" | "critical";
  history: TelemetryPoint[];
}

interface AssetItem {
  id: string;
  name: string;
  total: number;
  deployed: number;
  available: number;
  alert?: string;
}

interface AuditLog {
  id: string;
  type: "failed_login" | "deploy" | "access_change" | "anomaly";
  message: string;
  user: string;
  time: string;
  severity: "info" | "warn" | "critical";
}

interface FeedPost {
  id: string;
  type: "maintenance" | "security" | "release" | "alert";
  title: string;
  content: string;
  author: string;
  time: string;
  priority: "high" | "medium" | "low";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "T-001",
    title: "Mất kết nối mạng tầng 5 – toàn bộ phòng Kinh doanh",
    requester: "Trần Đức Anh",
    dept: "Kinh doanh",
    severity: "critical",
    time: "06:15",
    status: "open",
    type: "network",
  },
  {
    id: "T-002",
    title: "Không đăng nhập được ERP – lỗi xác thực 401",
    requester: "Lê Thị Bích",
    dept: "Kế toán",
    severity: "high",
    time: "06:28",
    status: "in_progress",
    type: "access",
  },
  {
    id: "T-003",
    title: "Máy in tầng 3 kẹt giấy liên tục",
    requester: "Phạm Văn Cường",
    dept: "Hành chính",
    severity: "medium",
    time: "05:50",
    status: "open",
    type: "hardware",
  },
  {
    id: "T-004",
    title: "Yêu cầu cấp quyền truy cập module Dự toán",
    requester: "Hoàng Minh Tú",
    dept: "Dự toán",
    severity: "low",
    time: "05:30",
    status: "open",
    type: "access",
  },
  {
    id: "T-005",
    title: "Phát hiện đăng nhập bất thường từ IP nước ngoài",
    requester: "Hệ thống",
    dept: "Security",
    severity: "critical",
    time: "04:47",
    status: "in_progress",
    type: "security",
  },
  {
    id: "T-006",
    title: "Laptop EMP-045 không nhận sạc",
    requester: "Vũ Thị Lan",
    dept: "Thiết kế",
    severity: "medium",
    time: "04:20",
    status: "open",
    type: "hardware",
  },
];

function generateHistory(
  base: number,
  variance: number,
  count = 12,
): TelemetryPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    value: Math.max(
      0,
      Math.min(100, base + (Math.random() - 0.5) * variance * 2),
    ),
    time: `${String(i * 5).padStart(2, "0")}m`,
  }));
}

const INITIAL_METRICS: SystemMetric[] = [
  {
    id: "cpu",
    label: "CPU",
    value: 67,
    unit: "%",
    status: "warn",
    history: generateHistory(67, 15),
  },
  {
    id: "mem",
    label: "Memory",
    value: 74,
    unit: "%",
    status: "warn",
    history: generateHistory(74, 10),
  },
  {
    id: "net",
    label: "Network",
    value: 42,
    unit: "Mbps",
    status: "ok",
    history: generateHistory(42, 20),
  },
  {
    id: "db_conn",
    label: "DB Connections",
    value: 89,
    unit: "",
    status: "warn",
    history: generateHistory(89, 12),
  },
  {
    id: "slow_q",
    label: "Slow Queries",
    value: 3,
    unit: "/min",
    status: "ok",
    history: generateHistory(3, 2),
  },
  {
    id: "redis",
    label: "Redis Cache",
    value: 98,
    unit: "%",
    status: "ok",
    history: generateHistory(98, 2),
  },
  {
    id: "sessions",
    label: "Active Sessions",
    value: 47,
    unit: "",
    status: "ok",
    history: generateHistory(47, 8),
  },
  {
    id: "disk",
    label: "Disk I/O",
    value: 91,
    unit: "%",
    status: "critical",
    history: generateHistory(91, 5),
  },
];

const ASSETS: AssetItem[] = [
  { id: "a1", name: "Laptop Dell XPS", total: 80, deployed: 72, available: 8 },
  { id: "a2", name: 'Màn hình 27"', total: 95, deployed: 88, available: 7 },
  {
    id: "a3",
    name: "Máy in HP LaserJet",
    total: 12,
    deployed: 12,
    available: 0,
    alert: "Cần bảo trì 2 máy",
  },
  {
    id: "a4",
    name: "Switch mạng",
    total: 8,
    deployed: 8,
    available: 0,
    alert: "Switch tầng 5 lỗi",
  },
  {
    id: "a5",
    name: "UPS Server Room",
    total: 4,
    deployed: 4,
    available: 0,
    alert: "Kiểm tra HVAC",
  },
];

const AUDIT_LOGS: AuditLog[] = [
  {
    id: "al1",
    type: "failed_login",
    message: "14 lần đăng nhập thất bại từ IP 185.220.101.x",
    user: "admin@constructerp.vn",
    time: "04:47",
    severity: "critical",
  },
  {
    id: "al2",
    type: "deploy",
    message: "ERP v2.4.1 deployed thành công lên production",
    user: "devops-bot",
    time: "02:30",
    severity: "info",
  },
  {
    id: "al3",
    type: "access_change",
    message: "Thay đổi quyền module Kế toán cho role Trưởng phòng",
    user: "admin.son",
    time: "01:15",
    severity: "warn",
  },
  {
    id: "al4",
    type: "anomaly",
    message: "Truy vấn DB bất thường: 2.3GB data export lúc 00:47",
    user: "erp_service",
    time: "00:47",
    severity: "critical",
  },
  {
    id: "al5",
    type: "deploy",
    message: "Hotfix #HF-089 patch lỗi xác thực JWT",
    user: "devops-bot",
    time: "Hôm qua",
    severity: "info",
  },
];

const IT_FEED: FeedPost[] = [
  {
    id: "if1",
    type: "maintenance",
    priority: "high",
    title: "Bảo trì hệ thống ERP – Thứ Bảy 06/09/2026",
    content:
      "⚙️ Lịch bảo trì định kỳ: Hệ thống ERP sẽ tạm ngưng từ 23:00 Thứ Bảy 06/09 đến 02:00 Chủ nhật 07/09 để nâng cấp database PostgreSQL 15 → 16 và tối ưu index. Toàn bộ người dùng vui lòng lưu công việc trước 22:45.",
    author: "Phòng CNTT",
    time: "08:00",
  },
  {
    id: "if2",
    type: "security",
    priority: "high",
    title: "Cảnh báo Phishing – Đợt tấn công mới",
    content:
      "🔐 Cảnh báo bảo mật: Phát hiện chiến dịch phishing nhắm vào email công ty. Các email giả mạo HR yêu cầu cập nhật thông tin lương. TUYỆT ĐỐI không click link lạ. Báo cáo ngay cho IT nếu nhận được email đáng ngờ.",
    author: "Security Team",
    time: "07:30",
  },
  {
    id: "if3",
    type: "release",
    priority: "medium",
    title: "Release Notes: ERP v2.4.1",
    content:
      "🚀 Phiên bản mới ERP v2.4.1 đã live:\n• Fix lỗi xác thực JWT timeout sau 30 phút\n• Cải thiện tốc độ load bảng Nhân viên 40%\n• Thêm export Excel cho module Dự toán\n• Patch 3 lỗ hổng bảo mật CVE-2026-xxxx",
    author: "Dev Team",
    time: "02:30",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bg: string; dot: string }
> = {
  critical: {
    label: "Nghiêm trọng",
    color: "text-red-700",
    bg: "bg-red-100",
    dot: "bg-red-500",
  },
  high: {
    label: "Cao",
    color: "text-orange-700",
    bg: "bg-orange-100",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Trung bình",
    color: "text-amber-700",
    bg: "bg-amber-100",
    dot: "bg-amber-400",
  },
  low: {
    label: "Thấp",
    color: "text-blue-700",
    bg: "bg-blue-100",
    dot: "bg-blue-400",
  },
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Sparkline({
  history,
  color,
}: {
  history: TelemetryPoint[];
  color: string;
}) {
  const vals = history.map((h) => h.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const pts = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricGauge({ metric }: { metric: SystemMetric }) {
  const statusColor =
    metric.status === "critical"
      ? "#ef4444"
      : metric.status === "warn"
        ? "#f59e0b"
        : "var(--primary)";
  const pct =
    typeof metric.value === "number" && metric.unit === "%"
      ? metric.value
      : null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-foreground">
            {metric.label}
          </span>
          <span
            className="text-[11px] font-bold tabular-nums"
            style={{ color: statusColor }}
          >
            {metric.value}
            {metric.unit}
          </span>
        </div>
        {pct !== null && (
          <div className="w-full h-1.5 bg-muted overflow-hidden rounded-full">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{ width: `${pct}%`, backgroundColor: statusColor }}
            />
          </div>
        )}
      </div>
      <Sparkline history={metric.history} color={statusColor} />
    </div>
  );
}

function FeedTypeIcon({ type }: { type: FeedPost["type"] }) {
  if (type === "maintenance")
    return <Server size={14} className="text-blue-500" />;
  if (type === "security") return <Shield size={14} className="text-red-500" />;
  if (type === "release") return <Zap size={14} className="text-green-500" />;
  return <Bell size={14} className="text-amber-500" />;
}

function AuditIcon({ type }: { type: AuditLog["type"] }) {
  if (type === "failed_login")
    return <Lock size={12} className="text-red-500" />;
  if (type === "deploy")
    return <Terminal size={12} className="text-green-500" />;
  if (type === "access_change")
    return <Eye size={12} className="text-amber-500" />;
  return <AlertOctagon size={12} className="text-red-600" />;
}

// ─── Accordion Column Section ─────────────────────────────────────────────────

interface AccordionSectionProps {
  title: React.ReactNode;
  badge?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  position: "top" | "bottom";
}

function AccordionSection({
  title,
  badge,
  isExpanded,
  onToggle,
  children,
  position,
}: AccordionSectionProps) {
  return (
    <div
      className={`flex flex-col border-border ${isExpanded ? "flex-1 min-h-0" : "flex-shrink-0"} ${position === "bottom" ? "border-t" : "border-b"}`}
    >
      {/* Section header — always visible */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2.5 bg-card hover:bg-muted/50 transition-colors flex-shrink-0 w-full text-left"
      >
        <div className="flex items-center gap-2">
          {title}
          {badge}
        </div>
        {isExpanded ? (
          <ChevronUp
            size={13}
            className="text-muted-foreground flex-shrink-0"
          />
        ) : (
          <ChevronDown
            size={13}
            className="text-muted-foreground flex-shrink-0"
          />
        )}
      </button>
      {/* Scrollable content — only when expanded */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ITDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [resolvedTickets, setResolvedTickets] = useState<Set<string>>(
    new Set(),
  );
  const wsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ticketTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Column 1: top=Helpdesk(expanded), bottom=ERP Access(collapsed)
  const [col1Expanded, setCol1Expanded] = useState<"top" | "bottom">("top");
  // Column 2: top=System Notices(expanded), bottom=Assets(collapsed)
  const [col2Expanded, setCol2Expanded] = useState<"top" | "bottom">("top");
  // Column 3: top=Telemetry(expanded), bottom=Security(collapsed)
  const [col3Expanded, setCol3Expanded] = useState<"top" | "bottom">("top");

  // Simulate WebSocket: live telemetry updates every 3s
  useEffect(() => {
    setWsConnected(true);
    wsRef.current = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          value: Math.max(
            0,
            Math.min(
              m.unit === "%" ? 100 : m.value * 1.5,
              m.value +
                (Math.random() - 0.5) *
                  (m.id === "cpu" ? 8 : m.id === "mem" ? 4 : 6),
            ),
          ),
          history: [...m.history.slice(1), { value: m.value, time: "now" }],
          status: m.value > 90 ? "critical" : m.value > 75 ? "warn" : "ok",
        })),
      );
    }, 3000);

    ticketTimerRef.current = setTimeout(() => {
      const newTicket: Ticket = {
        id: `T-${String(Date.now()).slice(-3)}`,
        title: "🔴 LIVE: Server DB-01 disk usage vượt 95% – cần xử lý ngay",
        requester: "Monitoring System",
        dept: "Infrastructure",
        severity: "critical",
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "open",
        type: "network",
      };
      setTickets((prev) => [newTicket, ...prev]);
    }, 10000);

    return () => {
      if (wsRef.current) clearInterval(wsRef.current);
      if (ticketTimerRef.current) clearTimeout(ticketTimerRef.current);
      setWsConnected(false);
    };
  }, []);

  const resolveTicket = useCallback((id: string) => {
    setResolvedTickets((prev) => new Set([...prev, id]));
  }, []);

  const openCount = tickets.filter(
    (t) => !resolvedTickets.has(t.id) && t.status !== "resolved",
  ).length;
  const criticalCount = tickets.filter(
    (t) => !resolvedTickets.has(t.id) && t.severity === "critical",
  ).length;

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0 bg-card">
        <div>
          <h1 className="text-base font-bold text-foreground">
            Phòng Công nghệ / Hệ thống
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Command Center · Chủ nhật, 31 tháng 8 năm 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded border ${wsConnected ? "border-green-300 text-green-700 bg-green-50" : "border-red-300 text-red-600 bg-red-50"}`}
          >
            {wsConnected ? (
              <Activity size={11} className="animate-pulse" />
            ) : (
              <WifiOff size={11} />
            )}
            {wsConnected ? "Telemetry Live" : "Offline"}
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded border border-red-300 text-red-700 bg-red-50">
              <AlertOctagon size={11} />
              {criticalCount} Critical
            </div>
          )}
          <button className="btn-primary text-xs py-1.5 px-3 rounded">
            <Terminal size={13} className="inline mr-1" />
            Tạo ticket
          </button>
        </div>
      </div>

      {/* 3-column grid — fills remaining height */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] min-h-0">
        {/* ── COLUMN 1: Helpdesk / ERP Access ── */}
        <div className="hidden lg:flex flex-col overflow-hidden border-r border-border bg-card h-full">
          {/* Top: IT Helpdesk (default expanded) */}
          <AccordionSection
            position="top"
            isExpanded={col1Expanded === "top"}
            onToggle={() =>
              setCol1Expanded(col1Expanded === "top" ? "bottom" : "top")
            }
            title={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                IT Helpdesk
              </span>
            }
            badge={
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                {openCount} mở
              </span>
            }
          >
            {tickets.map((ticket) => {
              const resolved = resolvedTickets.has(ticket.id);
              const cfg = SEVERITY_CONFIG[ticket.severity];
              return (
                <div
                  key={ticket.id}
                  className={`px-4 py-3 border-b border-border transition-opacity ${resolved ? "opacity-40" : ""}`}
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <div
                      className={`w-2 h-2 mt-1 flex-shrink-0 rounded-full ${cfg.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold leading-snug ${resolved ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {ticket.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3.5 flex-wrap">
                    <SeverityBadge severity={ticket.severity} />
                    <span className="text-[10px] text-muted-foreground">
                      {ticket.dept}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {ticket.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-3.5">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        ticket.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "resolved" || resolved
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {resolved
                        ? "Đã xử lý"
                        : ticket.status === "in_progress"
                          ? "Đang xử lý"
                          : "Chờ xử lý"}
                    </span>
                    {!resolved && (
                      <button
                        onClick={() => resolveTicket(ticket.id)}
                        className="text-[10px] text-primary hover:underline ml-auto rounded"
                      >
                        Đánh dấu xong
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </AccordionSection>

          {/* Bottom: Cấp quyền ERP (default collapsed) */}
          <AccordionSection
            position="bottom"
            isExpanded={col1Expanded === "bottom"}
            onToggle={() =>
              setCol1Expanded(col1Expanded === "bottom" ? "top" : "bottom")
            }
            title={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Cấp quyền ERP
              </span>
            }
          >
            {[
              {
                name: "Hoàng Minh Tú",
                module: "Module Dự toán – Xem",
                dept: "Dự toán",
              },
              {
                name: "Nguyễn Lan Anh",
                module: "Module HR – Toàn quyền",
                dept: "Nhân sự",
              },
            ].map((req, idx, arr) => (
              <div
                key={req.name}
                className={`px-4 py-3 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
              >
                <p className="text-xs font-semibold text-foreground">
                  {req.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {req.module} · {req.dept}
                </p>
                <div className="flex gap-2 mt-1.5">
                  <button className="text-[10px] font-semibold px-2 py-0.5 bg-green-100 text-green-700 hover:bg-green-200 transition-colors rounded">
                    Cấp quyền
                  </button>
                  <button className="text-[10px] font-semibold px-2 py-0.5 bg-red-100 text-red-600 hover:bg-red-200 transition-colors rounded">
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </AccordionSection>
        </div>

        {/* ── COLUMN 2: System Notices / Assets ── */}
        <div className="flex flex-col overflow-hidden border-r border-border h-full">
          {/* Top: System Notices + Release Log (default expanded) */}
          <AccordionSection
            position="top"
            isExpanded={col2Expanded === "top"}
            onToggle={() =>
              setCol2Expanded(col2Expanded === "top" ? "bottom" : "top")
            }
            title={
              <span className="text-xs font-bold text-foreground">
                Thông báo hệ thống & Release Log
              </span>
            }
            badge={<RefreshCw size={12} className="text-muted-foreground" />}
          >
            {/* Summary stats row */}
            <div className="grid grid-cols-4 border-b border-border flex-shrink-0">
              {[
                {
                  label: "Tickets mở",
                  value: String(openCount),
                  color: "text-red-600",
                },
                {
                  label: "CPU trung bình",
                  value: `${Math.round(metrics.find((m) => m.id === "cpu")?.value ?? 0)}%`,
                  color: "text-amber-600",
                },
                {
                  label: "Active sessions",
                  value: String(
                    Math.round(
                      metrics.find((m) => m.id === "sessions")?.value ?? 0,
                    ),
                  ),
                  color: "text-foreground",
                },
                {
                  label: "ERP uptime",
                  value: "99.7%",
                  color: "text-green-600",
                },
              ].map((stat, idx, arr) => (
                <div
                  key={stat.label}
                  className={`px-4 py-3 text-center ${idx < arr.length - 1 ? "border-r border-border" : ""}`}
                >
                  <p className={`text-lg font-bold tabular-nums ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* IT Feed posts */}
            <div className="divide-y divide-border">
              {IT_FEED.map((post) => (
                <article key={post.id} className="px-4 py-4 bg-card">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-border rounded">
                      <FeedTypeIcon type={post.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-foreground">
                          {post.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            post.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : post.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {post.priority === "high"
                            ? "Ưu tiên cao"
                            : post.priority === "medium"
                              ? "Trung bình"
                              : "Thấp"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {post.author}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ·
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {post.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </AccordionSection>

          {/* Bottom: Tài sản & Thiết bị (default collapsed) */}
          <AccordionSection
            position="bottom"
            isExpanded={col2Expanded === "bottom"}
            onToggle={() =>
              setCol2Expanded(col2Expanded === "bottom" ? "top" : "bottom")
            }
            title={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Tài sản & Thiết bị
              </span>
            }
          >
            <div className="divide-y divide-border">
              {ASSETS.map((asset) => (
                <div key={asset.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      {asset.name}
                    </span>
                    {asset.alert && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-100 text-amber-700 flex items-center gap-1 rounded">
                        <AlertTriangle size={9} />
                        {asset.alert}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted overflow-hidden rounded-full">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${(asset.deployed / asset.total) * 100}%`,
                          backgroundColor: "var(--primary)",
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">
                      {asset.deployed}/{asset.total} triển khai ·{" "}
                      {asset.available} còn
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        </div>

        {/* ── COLUMN 3: Telemetry / Security & Audit ── */}
        <div className="hidden lg:flex flex-col overflow-hidden bg-card h-full">
          {/* Top: Telemetry Live (default expanded) */}
          <AccordionSection
            position="top"
            isExpanded={col3Expanded === "top"}
            onToggle={() =>
              setCol3Expanded(col3Expanded === "top" ? "bottom" : "top")
            }
            title={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Telemetry Live
              </span>
            }
            badge={
              <Activity size={12} className="text-green-500 animate-pulse" />
            }
          >
            {metrics.map((metric) => (
              <MetricGauge key={metric.id} metric={metric} />
            ))}
          </AccordionSection>

          {/* Bottom: Security & Audit (default collapsed) */}
          <AccordionSection
            position="bottom"
            isExpanded={col3Expanded === "bottom"}
            onToggle={() =>
              setCol3Expanded(col3Expanded === "bottom" ? "top" : "bottom")
            }
            title={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Security & Audit
              </span>
            }
            badge={<Shield size={12} className="text-red-500" />}
          >
            {AUDIT_LOGS.map((log, idx) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 px-4 py-3 ${idx < AUDIT_LOGS.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center border border-border rounded mt-0.5">
                  <AuditIcon type={log.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground leading-snug">
                    {log.message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-muted-foreground truncate">
                      {log.user}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {log.time}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-1 py-0.5 flex-shrink-0 rounded ${
                    log.severity === "critical"
                      ? "bg-red-100 text-red-700"
                      : log.severity === "warn"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {log.severity === "critical"
                    ? "!"
                    : log.severity === "warn"
                      ? "⚠"
                      : "✓"}
                </span>
              </div>
            ))}
          </AccordionSection>
        </div>
      </div>
    </div>
  );
}
