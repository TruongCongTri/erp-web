/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type {
  ColumnDef,
  StockFeatures,
  PaginationState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import {
  X,
  Calendar as CalendarIcon,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Activity,
  ArrowRight,
  RefreshCw,
  Plus,
  Ticket as TicketIcon,
  Clock,
  Video,
  ExternalLink,
  Check,
  AlertCircle,
  FolderGit2,
  Users,
  Timer,
  Send,
  Boxes,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";

// Shadcn UI Imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import { DetailLayout } from "@/components/layouts/DetailLayout";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { DetailDrawer } from "@/components/layouts/DetailDrawer";

// ─── RTK QUERY HOOKS ────────────────────────────────────────────────────────
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useAssignTicketMutation,
  useScheduleTicketMeetingMutation,
  useResolveTicketMutation,
  useRejectTicketMutation,
  useCloseTicketMutation,
  useReopenTicketMutation,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  CreateTicketDto,
} from "@/lib/store/ticketApiSlice";

// ─── DYNAMIC UI CONFIGS ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  [TicketStatus.DRAFT]: {
    label: "Bản nháp",
    className: "badge-neutral",
    icon: Clock,
  },
  [TicketStatus.SUBMITTED]: {
    label: "Chờ tiếp nhận",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertCircle,
  },
  [TicketStatus.IN_PROGRESS]: {
    label: "Đang xử lý",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Activity,
  },
  [TicketStatus.PENDING_INFO]: {
    label: "Chờ bổ sung TT",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: AlertTriangle,
  },
  [TicketStatus.MEETING_SCHEDULED]: {
    label: "Đã xếp lịch họp",
    className: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Video,
  },
  [TicketStatus.RESOLVED]: {
    label: "Đã giải quyết",
    className: "badge-success",
    icon: CheckCircle2,
  },
  [TicketStatus.REOPENED]: {
    label: "Mở lại",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: RefreshCw,
  },
  [TicketStatus.CLOSED]: {
    label: "Đóng",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Check,
  },
  [TicketStatus.REJECTED]: {
    label: "Từ chối",
    className: "badge-danger",
    icon: XCircle,
  },
};

const CATEGORY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  [TicketCategory.COORDINATION]: {
    label: "Phối hợp liên phòng",
    className: "badge-info",
    icon: Users,
  },
  [TicketCategory.CONFLICT]: {
    label: "Xung đột & Bất đồng bộ",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: AlertTriangle,
  },
  [TicketCategory.HANDOFF]: {
    label: "Bàn giao & Nghiệm thu",
    className: "badge-success",
    icon: CheckCircle2,
  },
  [TicketCategory.SERVICE_REQUEST]: {
    label: "Yêu cầu Dịch vụ/Quyền",
    className: "badge-warning",
    icon: ShieldAlert,
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  [TicketPriority.LOW]: {
    label: "Thấp",
    className: "text-gray-500 bg-gray-100 border-gray-200",
    icon: Clock,
  },
  [TicketPriority.NORMAL]: {
    label: "Bình thường",
    className: "text-blue-600 bg-blue-50 border-blue-200",
    icon: Clock,
  },
  [TicketPriority.HIGH]: {
    label: "Cao",
    className: "text-orange-600 bg-orange-50 border-orange-200",
    icon: AlertTriangle,
  },
  [TicketPriority.BLOCKER]: {
    label: "Blocker",
    className: "text-red-600 bg-red-50 border-red-200",
    icon: ShieldAlert,
  },
};

const DEPARTMENTS = [
  { id: "MEP", name: "Cơ điện (MEP)" },
  { id: "STRUCTURAL", name: "Kết cấu (Structure)" },
  { id: "ARCHITECTURE", name: "Kiến trúc (Architectural)" },
  { id: "CONSTRUCTION_SITE", name: "Ban Chỉ huy Công trường" },
  { id: "PROCUREMENT", name: "Cung ứng & Mua sắm (PO)" },
  { id: "QA_QC", name: "Kiểm định & Chất lượng (QA/QC)" },
  { id: "HR_ADMIN", name: "Nhân sự & Hành chính" },
  { id: "IT_SYS", name: "CNTT & Hệ thống" },
];

function Badge({
  config,
  label,
}: {
  config?: { label: string; className: string; icon?: React.ElementType };
  label?: string;
}) {
  if (!config) return <span className="badge badge-neutral">{label}</span>;
  const Icon = config.icon;
  return (
    <span
      className={`badge ${config.className} inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5`}
    >
      {Icon && <Icon size={11} />}
      {config.label || label}
    </span>
  );
}

// ─── ACTION MODALS ──────────────────────────────────────────────────────────

// 1. Schedule Meeting Modal
function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    agenda: string;
    scheduledStart: string;
    scheduledEnd: string;
    meetingUrl?: string;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  const [agenda, setAgenda] = useState(
    "Họp đồng bộ xử lý kỹ thuật liên phòng ban",
  );
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Lên lịch họp giải quyết Ticket
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit({
              agenda,
              scheduledStart: new Date(scheduledStart).toISOString(),
              scheduledEnd: new Date(scheduledEnd).toISOString(),
              meetingUrl: meetingUrl || undefined,
            });
            onClose();
          }}
          className="p-5 space-y-4 text-xs"
        >
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              Chương trình / Nội dung họp (Agenda) *
            </label>
            <input
              required
              type="text"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="input-base w-full text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                Bắt đầu *
              </label>
              <input
                required
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="input-base w-full text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                Kết thúc *
              </label>
              <input
                required
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="input-base w-full text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              Link phòng họp trực tuyến (Tùy chọn)
            </label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="input-base w-full text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </ActionButton>
            <ActionButton variant="primary" type="submit" isLoading={isLoading}>
              Xác nhận xếp lịch
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. Resolve Ticket Modal
function ResolveTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resolutionNote: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [resolutionNote, setResolutionNote] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-emerald-500/10">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={16} />
            <h3 className="text-sm font-bold">Xác nhận giải quyết Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (resolutionNote.trim().length < 10) {
              gooeyToast.error("Ghi chú giải quyết phải có ít nhất 10 ký tự");
              return;
            }
            await onSubmit(resolutionNote);
            onClose();
          }}
          className="p-5 space-y-4 text-xs"
        >
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              Ghi chú giải quyết (Tối thiểu 10 ký tự) *
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Mô tả cụ thể phương án kỹ thuật đã khắc phục, quyết định nghiệm thu hoặc kết quả phối hợp..."
              className="input-base w-full text-xs resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </ActionButton>
            <ActionButton
              variant="primary"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              isLoading={isLoading}
            >
              Hoàn tất giải quyết
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. Reject Ticket Modal
function RejectTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rejectionReason: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-red-500/10">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle size={16} />
            <h3 className="text-sm font-bold">Từ chối tiếp nhận Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (rejectionReason.trim().length < 10) {
              gooeyToast.error("Lý do từ chối phải có ít nhất 10 ký tự");
              return;
            }
            await onSubmit(rejectionReason);
            onClose();
          }}
          className="p-5 space-y-4 text-xs"
        >
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              Lý do từ chối (Tối thiểu 10 ký tự) *
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="VD: Sai phòng ban tiếp nhận, thông tin mô tả không thuộc phạm vi xử lý của ban..."
              className="input-base w-full text-xs resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </ActionButton>
            <ActionButton
              variant="primary"
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              isLoading={isLoading}
            >
              Xác nhận từ chối
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. Reopen Ticket Modal
function ReopenTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-rose-500/10">
          <div className="flex items-center gap-2 text-rose-700">
            <RefreshCw size={16} />
            <h3 className="text-sm font-bold">Khiếu nại & Mở lại Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!reason.trim()) {
              gooeyToast.error("Vui lòng nêu rõ lý do mở lại");
              return;
            }
            await onSubmit(reason);
            onClose();
          }}
          className="p-5 space-y-4 text-xs"
        >
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              Lý do khiếu nại / mở lại *
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Kiểm tra thực tế trên công trường vẫn phát sinh va chạm cốt thép..."
              className="input-base w-full text-xs resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </ActionButton>
            <ActionButton
              variant="primary"
              type="submit"
              className="bg-rose-600 hover:bg-rose-700"
              isLoading={isLoading}
            >
              Mở lại phiếu
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. Assign Ticket Modal
function AssignTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    assigneeId: string;
    internalHandoverNote?: string;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  const [assigneeId, setAssigneeId] = useState("");
  const [internalHandoverNote, setInternalHandoverNote] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-primary">
            <User size={16} />
            <h3 className="text-sm font-bold text-foreground">
              Phân công / Tiếp nhận xử lý
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!assigneeId.trim()) {
              gooeyToast.error("Vui lòng nhập UUID nhân sự được phân công");
              return;
            }
            await onSubmit({
              assigneeId,
              internalHandoverNote: internalHandoverNote || undefined,
            });
            onClose();
          }}
          className="p-5 space-y-4 text-xs"
        >
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              UUID Nhân sự xử lý (Assignee ID) *
            </label>
            <input
              required
              type="text"
              placeholder="VD: 7b02a01d-e4e8-4139-bd8a-85a0d661c012..."
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="input-base w-full text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
              Ghi chú nội bộ bàn giao (Internal Handover Note)
            </label>
            <textarea
              rows={3}
              value={internalHandoverNote}
              onChange={(e) => setInternalHandoverNote(e.target.value)}
              placeholder="Chỉ hiển thị với nhân sự trong phòng ban..."
              className="input-base w-full text-xs resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </ActionButton>
            <ActionButton variant="primary" type="submit" isLoading={isLoading}>
              Xác nhận phân công
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// 6. Create Ticket Modal
function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketDto) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateTicketDto>({
    title: "",
    category: TicketCategory.COORDINATION,
    priority: TicketPriority.NORMAL,
    targetDepartmentId: "ARCHITECTURE",
    targetProjectId: "PRJ-METRO-01",
    targetEntityType: "bim_model",
    targetEntityId: "",
    description: "",
    isDraft: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      gooeyToast.error("Vui lòng điền đủ tiêu đề và nội dung chi tiết");
      return;
    }
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TicketIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Tạo Phiếu yêu cầu phối hợp (ESM Ticket)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Ký hợp đồng dịch vụ phối hợp làm việc giữa các phòng ban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1"
        >
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Tiêu đề yêu cầu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Tóm tắt ngắn gọn vấn đề hoặc đầu việc cần hỗ trợ..."
              className="input-base w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Phân loại nghiệp vụ
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as TicketCategory,
                  })
                }
                className="input-base w-full text-xs"
              >
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Độ khẩn cấp (SLA Priority)
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TicketPriority,
                  })
                }
                className="input-base w-full text-xs"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Phòng ban tiếp nhận (Target Queue)
              </label>
              <select
                value={formData.targetDepartmentId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetDepartmentId: e.target.value,
                  })
                }
                className="input-base w-full text-xs"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Mã Dự án EPC liên quan
              </label>
              <input
                type="text"
                value={formData.targetProjectId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, targetProjectId: e.target.value })
                }
                placeholder="VD: PRJ-METRO-01..."
                className="input-base w-full text-xs"
              />
            </div>
          </div>

          {/* Contextual Link */}
          <div className="bg-muted/10 p-3.5 rounded-xl border border-border/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Boxes size={13} /> Thực thể dữ liệu ERP tham chiếu (Polymorphic
              Binding)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase mb-1 block">
                  Loại đối tượng
                </label>
                <select
                  value={formData.targetEntityType || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetEntityType: e.target.value,
                    })
                  }
                  className="input-base w-full text-xs bg-background"
                >
                  <option value="bim_model">Mô hình BIM (3D IFC/Revit)</option>
                  <option value="purchase_order">Đơn đặt hàng (PO)</option>
                  <option value="project_task">
                    Hạng mục công việc (Task)
                  </option>
                  <option value="site_inspection">
                    Biên bản công trường (Checklist)
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase mb-1 block">
                  Mã thực thể (Entity ID)
                </label>
                <input
                  type="text"
                  value={formData.targetEntityId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, targetEntityId: e.target.value })
                  }
                  placeholder="VD: BIM-ZONE-A, PO-088..."
                  className="input-base w-full text-xs bg-background"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Nội dung mô tả & Kiến nghị giải quyết{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả kỹ hiện tượng va chạm, mốc nghiệm thu hoặc thông số cần bên tiếp nhận giải đáp..."
              className="input-base w-full text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <ActionButton
              variant="secondary"
              onClick={onClose}
              className="text-xs px-4 cursor-pointer"
              disabled={isLoading}
            >
              Hủy
            </ActionButton>
            <ActionButton
              variant="primary"
              type="submit"
              className="text-xs px-5 cursor-pointer"
              isLoading={isLoading}
            >
              <Send size={13} className="mr-1.5" /> Gửi phiếu vào Queue
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── REUSABLE DETAIL PANE (DESKTOP SIDEBAR & MOBILE DRAWER) ──────────────────
function TicketDetailPane({
  ticket,
  onAssign,
  onSchedule,
  onResolve,
  onReject,
  onCloseAction,
  onReopen,
  isAssigning,
  isScheduling,
  isResolving,
  isRejecting,
  isClosing,
  isReopening,
}: {
  ticket: Ticket;
  onAssign: () => void;
  onSchedule: () => void;
  onResolve: () => void;
  onReject: () => void;
  onCloseAction: () => void;
  onReopen: () => void;
  isAssigning: boolean;
  isScheduling: boolean;
  isResolving: boolean;
  isRejecting: boolean;
  isClosing: boolean;
  isReopening: boolean;
}) {
  const catCfg = CATEGORY_CONFIG[ticket.category];
  const prioCfg = PRIORITY_CONFIG[ticket.priority];
  const statusCfg = STATUS_CONFIG[ticket.status];
  const meetings = ticket.meetings || [];
  const latestMeeting =
    meetings.length > 0 ? meetings[meetings.length - 1] : null;

  return (
    <div className="flex flex-col h-full fade-in bg-card">
      {/* Header Pane */}
      <div className="p-5 border-b border-border/50 relative shrink-0 bg-muted/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge config={catCfg} label={ticket.category} />
            <Badge config={prioCfg} label={ticket.priority} />
            <Badge config={statusCfg} label={ticket.status} />
          </div>
          <span className="font-mono text-xs font-bold text-primary">
            {ticket.ticketCode}
          </span>
        </div>

        <h2 className="text-base font-bold text-foreground leading-snug mb-3">
          {ticket.title}
        </h2>

        {/* Routing Pipeline Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border/60 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Khởi tạo bởi
            </span>
            <span className="font-semibold text-foreground">
              {ticket.requesterDepartmentId}
            </span>
            <span className="text-[10px] text-muted-foreground block font-mono">
              ID: {ticket.requesterId.slice(0, 8)}
            </span>
          </div>
          <ArrowRight size={14} className="text-muted-foreground/60" />
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Đích tiếp nhận
            </span>
            <span className="font-semibold text-primary">
              {ticket.targetDepartmentId}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {ticket.assigneeId
                ? `Giao cho: ${ticket.assigneeId.slice(0, 8)}`
                : "Hàng đợi chung"}
            </span>
          </div>
        </div>
      </div>

      {/* Body Pane */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Contextual ERP Link */}
        {ticket.targetEntityType && (
          <div className="px-5 py-4 border-b border-border/50 bg-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <FolderGit2 size={12} /> Thực thể dữ liệu liên kết
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div>
                <p className="text-xs font-bold text-primary uppercase">
                  {ticket.targetEntityType} #{ticket.targetEntityId}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Dự án: {ticket.targetProjectId || "GLOBAL"}
                </p>
              </div>
              <Link href={`/vi/design/ds-bim?id=${ticket.targetEntityId}`}>
                <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer">
                  Mở xem <ExternalLink size={12} />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Discuss & Meeting Section */}
        {latestMeeting && (
          <div className="px-5 py-4 border-b border-border/50 bg-purple-50/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Video size={12} /> Cuộc họp đồng bộ liên phòng ban
              </p>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Đã xác nhận
              </span>
            </div>
            <p className="text-xs text-purple-900 font-medium mb-1">
              {latestMeeting.agenda}
            </p>
            <p className="text-[11px] text-purple-700 mb-2">
              Thời gian:{" "}
              {new Date(latestMeeting.scheduledStart).toLocaleString("vi-VN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
            {latestMeeting.meetingUrl && (
              <Link href={latestMeeting.meetingUrl} target="_blank">
                <button className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer">
                  Vào phòng họp trực tuyến <ExternalLink size={12} />
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Detailed Description */}
        <div className="px-5 py-5 border-b border-border/50 bg-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Mô tả &amp; Kiến nghị kỹ thuật
          </p>
          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Resolution Notes */}
        {ticket.resolutionNote && (
          <div className="px-5 py-4 border-b border-border/50 bg-emerald-50/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Kết quả giải quyết
            </p>
            <p className="text-xs text-emerald-900 leading-relaxed">
              {ticket.resolutionNote}
            </p>
          </div>
        )}

        {/* Rejection Notes */}
        {ticket.rejectionReason && (
          <div className="px-5 py-4 border-b border-border/50 bg-red-50/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-800 mb-1">
              Lý do từ chối
            </p>
            <p className="text-xs text-red-900 leading-relaxed">
              {ticket.rejectionReason}
            </p>
          </div>
        )}

        {/* SLA Metadata */}
        <div className="px-5 py-5 bg-muted/10 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Timer size={12} /> Chỉ số cam kết chất lượng dịch vụ (SLA)
          </p>

          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex justify-between items-start py-2 border-b border-border/40">
              <span className="text-muted-foreground">Thời điểm tạo</span>
              <span className="font-semibold text-foreground">
                {new Date(ticket.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-border/40">
              <span className="text-muted-foreground">
                Hạn phản hồi (Response SLA)
              </span>
              <span className="font-semibold text-foreground">
                {ticket.responseDueAt
                  ? new Date(ticket.responseDueAt).toLocaleString("vi-VN")
                  : "Chưa thiết lập"}
              </span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-border/40">
              <span className="text-muted-foreground">
                Hạn giải quyết (Resolution SLA)
              </span>
              <span className="font-semibold text-foreground">
                {ticket.resolutionDueAt
                  ? new Date(ticket.resolutionDueAt).toLocaleString("vi-VN")
                  : "Chưa thiết lập"}
              </span>
            </div>
            <div className="flex justify-between items-start py-2">
              <span className="text-muted-foreground">Trạng thái SLA</span>
              <span
                className={cn(
                  "font-semibold",
                  ticket.isSlaBreached ? "text-red-600" : "text-emerald-600",
                )}
              >
                {ticket.isSlaBreached
                  ? "Vi phạm thời gian cam kết"
                  : "Trong tầm kiểm soát"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 border-t border-border bg-card shrink-0 flex items-center justify-between gap-2">
        {ticket.status === TicketStatus.SUBMITTED && (
          <>
            <ActionButton
              variant="secondary"
              className="flex-1 text-xs cursor-pointer"
              onClick={onAssign}
              disabled={isAssigning}
            >
              <User size={13} className="mr-1.5" /> Phân công
            </ActionButton>
            <ActionButton
              variant="outline"
              className="text-xs border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
              onClick={onReject}
              disabled={isRejecting}
            >
              <XCircle size={13} className="mr-1.5" /> Từ chối
            </ActionButton>
          </>
        )}

        {ticket.status === TicketStatus.IN_PROGRESS && (
          <>
            <ActionButton
              variant="secondary"
              className="flex-1 text-xs cursor-pointer"
              onClick={onSchedule}
              disabled={isScheduling}
            >
              <Video size={13} className="mr-1.5" /> Lên lịch họp
            </ActionButton>
            <ActionButton
              variant="primary"
              className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              onClick={onResolve}
              disabled={isResolving}
            >
              <CheckCircle2 size={13} className="mr-1.5" /> Giải quyết
            </ActionButton>
          </>
        )}

        {ticket.status === TicketStatus.MEETING_SCHEDULED && (
          <ActionButton
            variant="primary"
            className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
            onClick={onResolve}
            disabled={isResolving}
          >
            <CheckCircle2 size={13} className="mr-1.5" /> Ghi biên bản &amp;
            Giải quyết
          </ActionButton>
        )}

        {ticket.status === TicketStatus.RESOLVED && (
          <>
            <ActionButton
              variant="outline"
              className="flex-1 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
              onClick={onReopen}
              disabled={isReopening}
            >
              <RefreshCw size={13} className="mr-1.5" /> Mở lại
            </ActionButton>
            <ActionButton
              variant="primary"
              className="flex-1 text-xs cursor-pointer"
              onClick={onCloseAction}
              isLoading={isClosing}
            >
              <Check size={13} className="mr-1.5" /> Đóng phiếu
            </ActionButton>
          </>
        )}

        {(ticket.status === TicketStatus.CLOSED ||
          ticket.status === TicketStatus.REJECTED) && (
          <ActionButton
            variant="outline"
            className="w-full text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
            onClick={onReopen}
            disabled={isReopening}
          >
            <RefreshCw size={13} className="mr-1.5" /> Khiếu nại / Mở lại ticket
          </ActionButton>
        )}
      </div>
    </div>
  );
}

// ─── Table-Row Item Component For Mobile ────────────────────────────────────
function MobileTicketRow({
  ticket,
  onSelect,
}: {
  ticket: Ticket;
  onSelect: (t: Ticket) => void;
}) {
  const prioCfg = PRIORITY_CONFIG[ticket.priority];
  const statusCfg = STATUS_CONFIG[ticket.status];
  const isOverdue =
    ticket.isSlaBreached ||
    (ticket.resolutionDueAt &&
      // eslint-disable-next-line react-hooks/purity
      new Date(ticket.resolutionDueAt).getTime() < Date.now() &&
      ticket.status !== TicketStatus.RESOLVED &&
      ticket.status !== TicketStatus.CLOSED);

  return (
    <div
      onClick={() => onSelect(ticket)}
      className="flex items-center justify-between py-2.5 px-3 border-b border-border/60 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer group text-xs select-none"
    >
      <div className="flex-1 min-w-0 pr-2.5">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="font-mono text-[10px] font-bold text-primary">
            {ticket.ticketCode}
          </span>
          <Badge config={statusCfg} label={ticket.status} />
          <Badge config={prioCfg} label={ticket.priority} />
        </div>

        <p className="font-semibold text-foreground text-xs truncate leading-snug">
          {ticket.title}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 truncate">
          <span className="truncate">{ticket.requesterDepartmentId}</span>
          <ArrowRight size={10} className="shrink-0" />
          <span className="font-medium text-foreground truncate">
            {ticket.targetDepartmentId}
          </span>
          <span>•</span>
          <span
            className={cn(
              "font-mono tabular-nums",
              isOverdue ? "text-red-600 font-bold" : "",
            )}
          >
            {ticket.resolutionDueAt
              ? new Date(ticket.resolutionDueAt).toLocaleDateString("vi-VN")
              : "Không SLA"}
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {ticket.targetEntityId && (
          <Link
            href={`/vi/design/ds-bim?id=${ticket.targetEntityId}`}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title="Đến thực thể ERP liên kết"
          >
            <ExternalLink size={14} />
          </Link>
        )}
        <button
          type="button"
          onClick={() => onSelect(ticket)}
          className="p-1.5 rounded-md text-muted-foreground/60 group-hover:text-primary transition-colors cursor-pointer"
          title="Xem chi tiết"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TicketsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL & Filter states
  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || [],
  );
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [priorityFilter, setPriorityFilter] = useState<string[]>(
    searchParams.get("priority")?.split(",").filter(Boolean) || [],
  );
  const [targetDeptFilter, setTargetDeptFilter] = useState<string[]>(
    searchParams.get("dept")?.split(",").filter(Boolean) || [],
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate")!)
      : undefined,
    to: searchParams.get("toDate")
      ? new Date(searchParams.get("toDate")!)
      : undefined,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
    pageSize: parseInt(searchParams.get("limit") || "20", 10),
  });

  // UI Interactive States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isRightCollapsed, setIsRightCollapsed] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Active Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // ─── RTK QUERY HOOKS ──────────────────────────────────────────────────────
  const {
    data: ticketsRes,
    isFetching,
    refetch,
  } = useGetTicketsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter || undefined,
    category: categoryFilter.length
      ? (categoryFilter as TicketCategory[])
      : undefined,
    status: statusFilter.length ? (statusFilter as TicketStatus[]) : undefined,
    priority: priorityFilter.length
      ? (priorityFilter as TicketPriority[])
      : undefined,
    targetDepartmentId: targetDeptFilter.length ? targetDeptFilter : undefined,
    fromDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    toDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const fetchedTickets = ticketsRes?.data || [];
  const totalRows = ticketsRes?.meta?.pagination?.total || 0;
  const pageCount = ticketsRes?.meta?.pagination?.total_page || 1;

  // Mutations
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const [scheduleMeeting, { isLoading: isScheduling }] =
    useScheduleTicketMeetingMutation();
  const [resolveTicket, { isLoading: isResolving }] =
    useResolveTicketMutation();
  const [rejectTicket, { isLoading: isRejecting }] = useRejectTicketMutation();
  const [closeTicket, { isLoading: isClosing }] = useCloseTicketMutation();
  const [reopenTicket, { isLoading: isReopening }] = useReopenTicketMutation();

  // Sync URL Params
  useEffect(() => {
    const params = new URLSearchParams();
    if (globalFilter) params.set("q", globalFilter);
    if (categoryFilter.length) params.set("category", categoryFilter.join(","));
    if (statusFilter.length) params.set("status", statusFilter.join(","));
    if (priorityFilter.length) params.set("priority", priorityFilter.join(","));
    if (targetDeptFilter.length) params.set("dept", targetDeptFilter.join(","));
    if (dateRange?.from) params.set("fromDate", dateRange.from.toISOString());
    if (dateRange?.to) params.set("toDate", dateRange.to.toISOString());

    if (pagination.pageIndex > 0)
      params.set("page", (pagination.pageIndex + 1).toString());
    if (pagination.pageSize !== 20)
      params.set("limit", pagination.pageSize.toString());

    if (selectedTicket && !isRightCollapsed)
      params.set("id", selectedTicket.id);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    globalFilter,
    categoryFilter,
    statusFilter,
    priorityFilter,
    targetDeptFilter,
    dateRange,
    pagination,
    selectedTicket,
    isRightCollapsed,
    pathname,
    router,
  ]);

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl && !selectedTicket && fetchedTickets.length > 0) {
      const found = fetchedTickets.find((t) => t.id === idFromUrl);
      if (found) {
        setSelectedTicket(found);
        setIsRightCollapsed(false);
      }
    }
  }, [fetchedTickets, selectedTicket, searchParams]);

  // Action Handlers
  const handleCreateTicketSubmit = async (dto: CreateTicketDto) => {
    try {
      const res = await createTicket(dto).unwrap();
      if (res.data) {
        setSelectedTicket(res.data);
        setIsRightCollapsed(false);
      }
      gooeyToast.success("Đã phát hành Ticket vào Queue", {
        description: `Mã phiếu: ${res.data?.ticketCode || "Đang xử lý"}`,
      });
    } catch (err: any) {
      const serverError =
        err?.data?.message || err?.error || "Không thể khởi tạo Ticket";
      gooeyToast.error(
        Array.isArray(serverError) ? serverError.join("; ") : serverError,
      );
    }
  };

  const handleAssignSubmit = async (data: {
    assigneeId: string;
    internalHandoverNote?: string;
  }) => {
    if (!selectedTicket) return;
    try {
      const res = await assignTicket({
        id: selectedTicket.id,
        body: data,
      }).unwrap();
      if (res.data) setSelectedTicket(res.data);
      gooeyToast.success("Đã phân công nhân sự thành công");
    } catch {
      gooeyToast.error("Không thể phân công phiếu");
    }
  };

  const handleScheduleMeetingSubmit = async (data: {
    agenda: string;
    scheduledStart: string;
    scheduledEnd: string;
    meetingUrl?: string;
  }) => {
    if (!selectedTicket) return;
    try {
      await scheduleMeeting({ id: selectedTicket.id, body: data }).unwrap();
      refetch();
      gooeyToast.success("Đã xếp lịch họp giải quyết ticket", {
        description: "Thông tin đã được đồng bộ sang module /vi/meetings",
      });
    } catch {
      gooeyToast.error("Không thể tạo cuộc họp giải quyết");
    }
  };

  const handleResolveSubmit = async (resolutionNote: string) => {
    if (!selectedTicket) return;
    try {
      const res = await resolveTicket({
        id: selectedTicket.id,
        body: { resolutionNote },
      }).unwrap();
      if (res.data) setSelectedTicket(res.data);
      gooeyToast.success("Đã xác nhận giải quyết ticket");
    } catch {
      gooeyToast.error("Lỗi cập nhật giải quyết");
    }
  };

  const handleRejectSubmit = async (rejectionReason: string) => {
    if (!selectedTicket) return;
    try {
      const res = await rejectTicket({
        id: selectedTicket.id,
        body: { rejectionReason },
      }).unwrap();
      if (res.data) setSelectedTicket(res.data);
      gooeyToast.warning("Đã từ chối tiếp nhận ticket");
    } catch {
      gooeyToast.error("Lỗi từ chối ticket");
    }
  };

  const handleCloseAction = async () => {
    if (!selectedTicket) return;
    try {
      const res = await closeTicket(selectedTicket.id).unwrap();
      if (res.data) setSelectedTicket(res.data);
      gooeyToast.success("Đã chính thức đóng ticket");
    } catch {
      gooeyToast.error("Lỗi đóng ticket");
    }
  };

  const handleReopenSubmit = async (reason: string) => {
    if (!selectedTicket) return;
    try {
      const res = await reopenTicket({
        id: selectedTicket.id,
        reason,
      }).unwrap();
      if (res.data) setSelectedTicket(res.data);
      gooeyToast.info("Đã mở lại ticket để tái thẩm định");
    } catch {
      gooeyToast.error("Lỗi mở lại ticket");
    }
  };

  const handleSearchChange = (val: string) => {
    setGlobalFilter(val);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setCategoryFilter([]);
    setStatusFilter([]);
    setPriorityFilter([]);
    setTargetDeptFilter([]);
    setDateRange(undefined);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // Columns definition
  const columns = useMemo<ColumnDef<StockFeatures, Ticket, any>[]>(
    () => [
      {
        id: "select",
        size: 40,
        header: ({ table }: any) => (
          <TriStateCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }: any) => (
          <div onClick={(e) => e.stopPropagation()}>
            <TriStateCheckbox
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "ticketCode",
        size: 140,
        meta: { title: "Mã Phiếu" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Mã Phiếu
          </span>
        ),
        cell: ({ row }: any) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.ticketCode}
          </span>
        ),
      },
      {
        accessorKey: "title",
        size: 380,
        meta: { title: "Nội dung yêu cầu" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Nội dung phối hợp</SortHeader>
        ),
        cell: ({ row }: any) => {
          const ticket = row.original as Ticket;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground line-clamp-1">
                {ticket.title}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{ticket.requesterDepartmentId}</span>
                <ArrowRight size={10} />
                <span className="font-semibold text-foreground">
                  {ticket.targetDepartmentId}
                </span>
                {ticket.targetProjectId && (
                  <>
                    <span className="opacity-50">•</span>
                    <span className="font-mono text-muted-foreground">
                      {ticket.targetProjectId}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        size: 180,
        meta: { title: "Phân loại" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Phân loại
          </span>
        ),
        cell: ({ row }: any) => (
          <Badge
            config={CATEGORY_CONFIG[row.original.category]}
            label={row.original.category}
          />
        ),
      },
      {
        accessorKey: "priority",
        size: 110,
        meta: { title: "Mức SLA" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Mức SLA
          </span>
        ),
        cell: ({ row }: any) => (
          <Badge
            config={PRIORITY_CONFIG[row.original.priority]}
            label={row.original.priority}
          />
        ),
      },
      {
        accessorKey: "status",
        size: 140,
        meta: { title: "Trạng thái" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Trạng thái
          </span>
        ),
        cell: ({ row }: any) => (
          <Badge
            config={STATUS_CONFIG[row.original.status]}
            label={row.original.status}
          />
        ),
      },
      {
        id: "slaCountdown",
        size: 130,
        meta: { title: "Hạn giải quyết" },
        header: () => (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Hạn xử lý
          </span>
        ),
        cell: ({ row }: any) => {
          const ticket = row.original as Ticket;
          const isOverdue =
            ticket.isSlaBreached ||
            (ticket.resolutionDueAt &&
              new Date(ticket.resolutionDueAt).getTime() < Date.now() &&
              ticket.status !== TicketStatus.RESOLVED &&
              ticket.status !== TicketStatus.CLOSED);
          return (
            <div
              className={cn(
                "text-xs font-mono tabular-nums flex items-center gap-1",
                isOverdue ? "text-red-600 font-bold" : "text-muted-foreground",
              )}
            >
              <Timer size={12} />
              {ticket.resolutionDueAt
                ? new Date(ticket.resolutionDueAt).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </div>
          );
        },
      },
    ],
    [],
  );

  const activeFilterCount =
    categoryFilter.length +
    statusFilter.length +
    priorityFilter.length +
    targetDeptFilter.length +
    (dateRange?.from ? 1 : 0);

  // ─── FACET FILTERS NODE (INLINE INSIDE DATATABLE TOOLBAR) ───
  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 h-auto min-h-[30px] text-xs font-medium border rounded transition-colors shadow-none cursor-pointer",
              dateRange?.from
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <CalendarIcon size={12} className="opacity-70" />
            <span className={dateRange?.from ? "font-semibold" : "font-medium"}>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM", { locale: vi })} -{" "}
                    {format(dateRange.to, "dd/MM", { locale: vi })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM", { locale: vi })
                )
              ) : (
                "Thời gian"
              )}
            </span>
            {dateRange?.from && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange(undefined);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="ml-1 hover:text-red-500"
              >
                <X size={11} />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            autoFocus
            mode="range"
            selected={dateRange}
            onSelect={(r) => {
              setDateRange(r);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            numberOfMonths={2}
            locale={vi}
          />
        </PopoverContent>
      </Popover>

      <FacetFilter
        label="Phân loại"
        options={Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({
          value: k,
          label: v.label,
        }))}
        selected={categoryFilter}
        onChange={(v) => handleFilterChange(setCategoryFilter, v)}
      />

      <FacetFilter
        label="Trạng thái"
        options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
          value: k,
          label: v.label,
        }))}
        selected={statusFilter}
        onChange={(v) => handleFilterChange(setStatusFilter, v)}
      />

      <FacetFilter
        label="Mức SLA"
        options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({
          value: k,
          label: v.label,
        }))}
        selected={priorityFilter}
        onChange={(v) => handleFilterChange(setPriorityFilter, v)}
      />

      <FacetFilter
        label="Phòng ban tiếp nhận"
        options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))}
        selected={targetDeptFilter}
        onChange={(v) => handleFilterChange(setTargetDeptFilter, v)}
      />

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="ml-2 text-xs text-red-600 hover:underline cursor-pointer"
        >
          Xóa {activeFilterCount} bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── HEADER ── */}
      <div className="shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <TicketIcon size={18} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-foreground">
                Điều phối &amp; Phối hợp Liên phòng ban (ESM)
              </h1>
              <p className="text-xs text-muted-foreground">
                Theo dõi hợp đồng cộng tác, xung đột kỹ thuật và kiểm soát SLA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ActionButton
              variant="primary"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-semibold cursor-pointer"
              onClick={() => setIsCreateModalOpen(true)}
              title="Tạo Phiếu yêu cầu"
            >
              <Plus size={14} className="shrink-0 sm:mr-1.5" />
              <span className="hidden sm:inline">Tạo Phiếu yêu cầu</span>
            </ActionButton>
            <ActionButton
              variant="ghost"
              className="!h-8 !px-2 sm:!px-3 !text-xs !font-medium cursor-pointer"
              onAction={async () => {
                refetch();
              }}
              isLoading={isFetching}
              title="Làm mới"
            >
              <RefreshCw
                size={14}
                className={`shrink-0 ${isFetching ? "animate-spin" : ""} sm:mr-1.5`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* ── MOBILE LIST VIEW (< md) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden">
        {/* Mobile Search & Drawer Trigger */}
        <div className="p-3 border-b border-border bg-card flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo Mã phiếu, Dự án, Nội dung..."
              className="input-base pl-9 pr-7 py-1 text-xs w-full h-8"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilter(true)}
            className={`h-8 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-xs transition-colors shrink-0 cursor-pointer ${
              activeFilterCount > 0
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
            title="Mở bộ lọc & Sắp xếp"
          >
            <SlidersHorizontal size={13} />
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white font-mono text-[9px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Table-Row List */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-border/40">
          {fetchedTickets.length === 0 && !isFetching ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <TicketIcon size={32} className="text-muted-foreground/30" />
              <p className="text-xs font-semibold text-muted-foreground">
                Không tìm thấy phiếu yêu cầu phối hợp nào
              </p>
            </div>
          ) : (
            fetchedTickets.map((t) => (
              <MobileTicketRow
                key={t.id}
                ticket={t}
                onSelect={(selected) => {
                  setSelectedTicket(selected);
                  setIsRightCollapsed(false);
                }}
              />
            ))
          )}
        </div>

        {/* ── DOCKED MOBILE BOTTOM PAGINATION ── */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            {pagination.pageIndex * pagination.pageSize + 1}-
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              totalRows,
            )}{" "}
            / {totalRows}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.pageIndex === 0 || isFetching}
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
              }
              className="p-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 cursor-pointer"
              title="Trang trước"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-[11px] px-1 font-semibold text-foreground">
              {pagination.pageIndex + 1}/{pageCount || 1}
            </span>
            <button
              type="button"
              disabled={pagination.pageIndex >= pageCount - 1 || isFetching}
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
              }
              className="p-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 cursor-pointer"
              title="Trang sau"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP INTERFACE (md:) ── */}
      <div className="flex-1 min-h-0 relative hidden md:block">
        <DetailLayout
          title="Chi tiết Phiếu"
          rightSidebar={{
            collapsed: isRightCollapsed || !selectedTicket,
            onCollapseChange: setIsRightCollapsed,
            defaultCollapsed: true,
            content: (collapsed) => {
              if (collapsed || !selectedTicket) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 fade-in p-6 text-center">
                    <TicketIcon size={48} className="mb-4 stroke-[1.5px]" />
                    <p className="text-sm font-medium">
                      Chọn một phiếu yêu cầu để xem tiến độ xử lý
                    </p>
                  </div>
                );
              }

              return (
                <TicketDetailPane
                  ticket={selectedTicket}
                  onAssign={() => setIsAssignModalOpen(true)}
                  onSchedule={() => setIsScheduleModalOpen(true)}
                  onResolve={() => setIsResolveModalOpen(true)}
                  onReject={() => setIsRejectModalOpen(true)}
                  onCloseAction={handleCloseAction}
                  onReopen={() => setIsReopenModalOpen(true)}
                  isAssigning={isAssigning}
                  isScheduling={isScheduling}
                  isResolving={isResolving}
                  isRejecting={isRejecting}
                  isClosing={isClosing}
                  isReopening={isReopening}
                />
              );
            },
          }}
        >
          {/* ── CENTER: DATA TABLE WITH INTEGRATED SEARCH & FILTERS ── */}
          <div className="flex-1 min-h-0 flex-col flex bg-background relative">
            <DataTable
              columns={columns}
              data={fetchedTickets}
              pageCount={pageCount}
              totalRows={totalRows}
              globalFilter={globalFilter}
              onGlobalFilterChange={handleSearchChange}
              searchPlaceholder="Tìm theo Mã phiếu, Dự án, Nội dung..."
              pagination={pagination}
              onPaginationChange={setPagination}
              facetFilters={facetFiltersNode}
              isLoading={isFetching}
              enableMultiRowSelection={true}
              onRowClick={(row) => {
                setSelectedTicket(row.original);
                setIsRightCollapsed(false);
              }}
              emptyMessage={
                isFetching
                  ? "Đang tải dữ liệu..."
                  : "Không có phiếu yêu cầu phối hợp nào"
              }
              emptyIcon={
                <TicketIcon size={32} className="text-muted-foreground/30" />
              }
            />
          </div>
        </DetailLayout>
      </div>

      {/* ── ACTION DIALOG MODALS ── */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicketSubmit}
        isLoading={isCreating}
      />

      <AssignTicketModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        isLoading={isAssigning}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleMeetingSubmit}
        isLoading={isScheduling}
      />

      <ResolveTicketModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onSubmit={handleResolveSubmit}
        isLoading={isResolving}
      />

      <RejectTicketModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
        isLoading={isRejecting}
      />

      <ReopenTicketModal
        isOpen={isReopenModalOpen}
        onClose={() => setIsReopenModalOpen(false)}
        onSubmit={handleReopenSubmit}
        isLoading={isReopening}
      />

      {/* ── MOBILE FULL-FEATURED DETAIL DRAWER ── */}
      <div className="md:hidden">
        <DetailDrawer
          isOpen={!!selectedTicket && !isRightCollapsed}
          onClose={() => setIsRightCollapsed(true)}
          title="Chi tiết Ticket"
          subtitle={selectedTicket?.ticketCode}
          icon={<TicketIcon size={16} className="text-primary" />}
        >
          {selectedTicket && (
            <TicketDetailPane
              ticket={selectedTicket}
              onAssign={() => setIsAssignModalOpen(true)}
              onSchedule={() => setIsScheduleModalOpen(true)}
              onResolve={() => setIsResolveModalOpen(true)}
              onReject={() => setIsRejectModalOpen(true)}
              onCloseAction={handleCloseAction}
              onReopen={() => setIsReopenModalOpen(true)}
              isAssigning={isAssigning}
              isScheduling={isScheduling}
              isResolving={isResolving}
              isRejecting={isRejecting}
              isClosing={isClosing}
              isReopening={isReopening}
            />
          )}
        </DetailDrawer>
      </div>

      {/* ── BOTTOM DRAWER FOR MOBILE FILTER ── */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-card rounded-t-2xl border-t border-border p-4 max-h-[82vh] flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  Lọc phiếu yêu cầu (ESM)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs custom-scrollbar">
              {/* Filter: Phân loại */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Phân loại nghiệp vụ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => {
                    const isSelected = categoryFilter.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? categoryFilter.filter((item) => item !== k)
                            : [...categoryFilter, k];
                          handleFilterChange(setCategoryFilter, next);
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Trạng thái */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Trạng thái xử lý
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => {
                    const isSelected = statusFilter.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? statusFilter.filter((item) => item !== k)
                            : [...statusFilter, k];
                          handleFilterChange(setStatusFilter, next);
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Mức SLA */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Mức độ SLA
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => {
                    const isSelected = priorityFilter.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? priorityFilter.filter((item) => item !== k)
                            : [...priorityFilter, k];
                          handleFilterChange(setPriorityFilter, next);
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Phòng ban tiếp nhận */}
              <div>
                <label className="font-semibold text-foreground mb-2 block">
                  Phòng ban tiếp nhận
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto border border-border/60 rounded-lg p-2 bg-muted/10">
                  {DEPARTMENTS.map((d) => {
                    const isSelected = targetDeptFilter.includes(d.id);
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          const next = isSelected
                            ? targetDeptFilter.filter((item) => item !== d.id)
                            : [...targetDeptFilter, d.id];
                          handleFilterChange(setTargetDeptFilter, next);
                        }}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <span className="truncate">{d.name}</span>
                        {isSelected && <Check size={13} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Sheet Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-secondary text-xs h-9 px-3 text-red-600 cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="btn-primary text-xs h-9 flex-1 cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
