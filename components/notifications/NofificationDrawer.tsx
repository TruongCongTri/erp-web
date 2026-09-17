"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Info,
  Clock,
  Briefcase,
  CheckSquare,
  ShieldAlert,
  Siren,
  Megaphone,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  XCircle,
  User,
  Bot,
  Activity,
  Webhook,
  ExternalLink,
  MailOpen,
  Calendar,
  Layers,
  ChevronRight,
  Target,
  Send,
  Users,
} from "lucide-react";

import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";
import { AppNotification } from "@/lib/store/notificationsApiSlice";

// ─── DYNAMIC UI CONFIGS (Có thể import từ file config chung nếu bạn đã tách ra) ───
const CATEGORY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  TASK: { label: "Công việc", className: "badge-success", icon: CheckSquare },
  APPROVAL: {
    label: "Phê duyệt",
    className: "badge-warning",
    icon: ShieldAlert,
  },
  SYSTEM: { label: "Hệ thống", className: "badge-info", icon: Info },
  ALERT: {
    label: "Cảnh báo",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: Siren,
  },
  ANNOUNCEMENT: {
    label: "Thông báo chung",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Megaphone,
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  LOW: {
    label: "Thấp",
    className: "text-gray-500 bg-gray-100 border-gray-200",
    icon: ArrowDown,
  },
  NORMAL: {
    label: "Bình thường",
    className: "text-blue-600 bg-blue-50 border-blue-200",
    icon: Minus,
  },
  HIGH: {
    label: "Cao",
    className: "text-orange-600 bg-orange-50 border-orange-200",
    icon: ArrowUp,
  },
  URGENT: {
    label: "Khẩn cấp",
    className: "text-red-600 bg-red-50 border-red-200",
    icon: AlertTriangle,
  },
};

const ACTION_STATE_CONFIG: Record<
  string,
  { label: string; className: string; icon?: React.ElementType }
> = {
  NONE: {
    label: "Chỉ đọc",
    className: "bg-gray-100 text-gray-500 border-gray-200",
    icon: Info,
  },
  PENDING: {
    label: "Chờ xử lý",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  RESOLVED: {
    label: "Đã giải quyết",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-200 text-slate-600 border-slate-300",
    icon: XCircle,
  },
};

const ACTOR_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  USER: { label: "Người dùng", icon: User },
  SYSTEM_CRON: { label: "Hệ thống tự động", icon: Bot },
  WORKFLOW_ENGINE: { label: "Quy trình (Workflow)", icon: Activity },
  THIRD_PARTY_WEBHOOK: { label: "Ứng dụng thứ 3", icon: Webhook },
};

// AI screening outcome notifications (ats module) share one visual
// treatment differentiated by tier: green/HIGH, amber/MEDIUM, red/LOW.
const CANDIDATE_SCREENING_TASK_TYPE_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  CANDIDATE_SHORTLISTED: {
    label: "Tiềm năng cao",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: Target,
  },
  CANDIDATE_POOLED: {
    label: "Kho dự trữ",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Users,
  },
  CANDIDATE_SCREENING_REJECTED: {
    label: "AI sơ loại",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

// ─── HELPER COMPONENT ───
function Badge({
  label,
  config,
}: {
  label?: string;
  config?: { label: string; className: string; icon?: React.ElementType };
}) {
  if (!config) return <span className="badge badge-neutral">{label}</span>;
  const Icon = config.icon;
  return (
    <span className={`badge ${config.className}`}>
      {Icon && <Icon size={12} />}
      {config.label || label}
    </span>
  );
}

// ─── MAIN COMPONENT ───
interface NotificationDrawerProps {
  noti: AppNotification | null;
  onClose: () => void;
}

export default function NotificationDrawer({
  noti,
  onClose,
}: NotificationDrawerProps) {
  const [openSections, setOpenSections] = useState({
    content: true,
    metadata: false, // Mặc định thu gọn Metadata để tập trung vào đọc tin nhắn
  });

  if (!noti) return null;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const catCfg = CATEGORY_CONFIG[noti.category] || CATEGORY_CONFIG.SYSTEM;
  const prioCfg = PRIORITY_CONFIG[noti.priority] || PRIORITY_CONFIG.NORMAL;
  const actorCfg =
    ACTOR_TYPE_CONFIG[noti.actorType] || ACTOR_TYPE_CONFIG.SYSTEM_CRON;
  const ActorIcon = actorCfg.icon;

  return (
    <DetailDrawer
      isOpen={!!noti}
      onClose={onClose}
      title="Chi tiết thông báo"
      subtitle={new Date(noti.createdAt).toLocaleString("vi-VN", {
        dateStyle: "full",
        timeStyle: "short",
      })}
      headerClassName="bg-card text-foreground border-b border-border relative overflow-hidden"
      // Tạo một dải màu nhỏ ở trên cùng Header Drawer dựa theo độ ưu tiên
      icon={
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border ${catCfg.className}`}
        >
          <catCfg.icon size={16} />
        </div>
      }
      footer={
        noti.actionUrl ? (
          <Link href={noti.actionUrl} onClick={onClose} className="w-full">
            <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm shadow-sm py-2.5 rounded-xl">
              Mở liên kết trên hệ thống
              <ExternalLink size={15} />
            </button>
          </Link>
        ) : undefined
      }
    >
      {/* ─── DẢI MÀU TRẠNG THÁI (Gắn sát Header) ─── */}
      <div
        className={`w-full h-1 ${prioCfg.className.split(" ")[1]} absolute top-0 left-0`}
      />

      {/* ─── SECTION 1: NỘI DUNG CHÍNH ─── */}
      <DrawerSection
        title="Nội dung thông báo"
        icon={<MailOpen size={14} />}
        isExpanded={openSections.content}
        onToggle={() => toggleSection("content")}
      >
        <div className="space-y-5">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge config={catCfg} />
            <Badge config={prioCfg} />
            {CANDIDATE_SCREENING_TASK_TYPE_CONFIG[noti.taskType] && (
              <Badge
                config={CANDIDATE_SCREENING_TASK_TYPE_CONFIG[noti.taskType]}
              />
            )}
            {noti.actionState !== "NONE" && (
              <Badge
                config={
                  ACTION_STATE_CONFIG[noti.actionState] ||
                  ACTION_STATE_CONFIG.PENDING
                }
              />
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground leading-snug mb-3">
              {noti.title}
            </h2>

            {/* Sender Info */}
            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 mb-4">
              <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground flex-shrink-0">
                <ActorIcon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {noti.actorSnapshot?.name || actorCfg.label}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  Gửi từ hệ thống
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap bg-muted/10 p-4 rounded-xl border border-border/50">
              {noti.body}
            </div>
          </div>
        </div>
      </DrawerSection>

      {/* ─── SECTION 2: METADATA & SYSTEM LOGS ─── */}
      <DrawerSection
        title="Thông tin hệ thống"
        icon={<Layers size={14} />}
        isExpanded={openSections.metadata}
        onToggle={() => toggleSection("metadata")}
      >
        <div className="space-y-3">
          <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Target size={12} /> Đối tượng tham chiếu
                </span>
                <span className="text-[11px] font-semibold text-foreground text-right">
                  {noti.targetEntityType} #{noti.targetEntityId}
                </span>
              </div>
              {noti.taskType && (
                <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Briefcase size={12} /> Loại tác vụ
                  </span>
                  <span className="text-[11px] font-semibold text-foreground text-right">
                    {noti.taskType}
                  </span>
                </div>
              )}
              {noti.departmentId && noti.departmentId !== "GLOBAL" && (
                <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Users size={12} /> Phân luồng phòng ban
                  </span>
                  <span className="text-[11px] font-semibold text-foreground text-right">
                    {noti.departmentId}
                  </span>
                </div>
              )}
              {noti.deliveryChannels && noti.deliveryChannels.length > 0 && (
                <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Send size={12} /> Kênh đã nhận
                  </span>
                  <span className="text-[11px] font-semibold text-foreground text-right">
                    {noti.deliveryChannels.join(", ")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start py-1.5 border-b border-border/40 last:border-0">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} /> Thời gian xem
                </span>
                <span className="text-[11px] font-semibold text-foreground text-right">
                  {noti.readAt
                    ? new Date(noti.readAt).toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "Chưa xem"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DrawerSection>
    </DetailDrawer>
  );
}
