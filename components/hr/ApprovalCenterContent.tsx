"use client";
import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  MessageSquare,
  UserCheck,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  X,
  Check,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type ApprovalType =
  | "candidate_advance"
  | "hire_request"
  | "leave_request"
  | "expense"
  | "jd_review";
type ApprovalStatus = "pending" | "approved" | "rejected" | "info_needed";

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: string;
  requestedByDept: string;
  requestedAt: string;
  dueDate?: string;
  status: ApprovalStatus;
  priority: "high" | "medium" | "low";
  attachments?: number;
  candidateId?: string;
  amount?: string;
  notes?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const approvalItems: ApprovalItem[] = [
  {
    id: "appr-001",
    type: "candidate_advance",
    priority: "high",
    status: "pending",
    title: "Chuyển ứng viên Nguyễn Văn An sang vòng phỏng vấn",
    description:
      "Ứng viên đã qua vòng sàng lọc CV. HR đề xuất chuyển sang vòng phỏng vấn kỹ thuật với Trưởng phòng Xây dựng.",
    requestedBy: "Sơn Lêu (HR)",
    requestedByDept: "Phòng Nhân lực",
    requestedAt: "31/08/2026 08:30",
    dueDate: "02/09/2026",
    attachments: 2,
    candidateId: "cand-001",
  },
  {
    id: "appr-002",
    type: "hire_request",
    priority: "high",
    status: "pending",
    title: "Xác nhận JD tuyển dụng: Kỹ sư kết cấu cao cấp",
    description:
      "HR đã tạo JD chuẩn doanh nghiệp cho vị trí Kỹ sư kết cấu cao cấp. Vui lòng xem xét và xác nhận trước khi đăng tuyển.",
    requestedBy: "Phạm Ngọc Hà (HR)",
    requestedByDept: "Phòng Nhân lực",
    requestedAt: "30/08/2026 14:00",
    dueDate: "01/09/2026",
    attachments: 1,
  },
  {
    id: "appr-003",
    type: "candidate_advance",
    priority: "medium",
    status: "pending",
    title: "Phê duyệt offer lương cho Trần Thị Lan",
    description:
      "Ứng viên đã vượt qua tất cả vòng phỏng vấn. HR đề xuất mức lương ₫28,000,000/tháng. Cần phê duyệt từ Trưởng phòng.",
    requestedBy: "Sơn Lêu (HR)",
    requestedByDept: "Phòng Nhân lực",
    requestedAt: "29/08/2026 10:15",
    dueDate: "31/08/2026",
    amount: "₫28,000,000/tháng",
    attachments: 3,
  },
  {
    id: "appr-004",
    type: "leave_request",
    priority: "low",
    status: "pending",
    title: "Đơn xin nghỉ phép: Hoàng Long Phước",
    description:
      "Nhân viên xin nghỉ phép 3 ngày (02/09 - 04/09/2026) để giải quyết việc gia đình.",
    requestedBy: "Hoàng Long Phước",
    requestedByDept: "Xây dựng",
    requestedAt: "31/08/2026 07:45",
    dueDate: "01/09/2026",
  },
  {
    id: "appr-005",
    type: "expense",
    priority: "medium",
    status: "pending",
    title: "Phê duyệt chi phí đào tạo Q3/2026",
    description:
      "Đề xuất chi phí đào tạo kỹ năng BIM cho 5 kỹ sư thiết kế. Tổng chi phí ₫45,000,000.",
    requestedBy: "Vũ Thanh Liêm",
    requestedByDept: "Khối Thiết kế",
    requestedAt: "28/08/2026 16:00",
    dueDate: "05/09/2026",
    amount: "₫45,000,000",
    attachments: 2,
  },
  {
    id: "appr-006",
    type: "candidate_advance",
    priority: "high",
    status: "approved",
    title: "Chuyển ứng viên Lê Minh Khoa sang vòng offer",
    description:
      "Ứng viên đã hoàn thành phỏng vấn kỹ thuật và phỏng vấn văn hóa. Đề xuất chuyển sang vòng offer.",
    requestedBy: "Sơn Lêu (HR)",
    requestedByDept: "Phòng Nhân lực",
    requestedAt: "25/08/2026 09:00",
    notes: "Đồng ý. Mức lương đề xuất hợp lý.",
  },
  {
    id: "appr-007",
    type: "hire_request",
    priority: "medium",
    status: "rejected",
    title: "Yêu cầu tuyển thêm 2 Giám sát thi công",
    description:
      "Đề xuất tuyển thêm 2 giám sát thi công cho dự án Long An giai đoạn 2.",
    requestedBy: "Đỗ Minh Tuấn",
    requestedByDept: "Xây dựng",
    requestedAt: "20/08/2026 11:30",
    notes: "Ngân sách Q3 đã hết. Xem xét lại vào Q4/2026.",
  },
];

const typeConfig: Record<
  ApprovalType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  candidate_advance: {
    label: "Ứng viên",
    color: "bg-blue-100 text-blue-700",
    icon: <UserCheck size={12} />,
  },
  hire_request: {
    label: "Tuyển dụng",
    color: "bg-purple-100 text-purple-700",
    icon: <Sparkles size={12} />,
  },
  leave_request: {
    label: "Nghỉ phép",
    color: "bg-green-100 text-green-700",
    icon: <Calendar size={12} />,
  },
  expense: {
    label: "Chi phí",
    color: "bg-amber-100 text-amber-700",
    icon: <FileText size={12} />,
  },
  jd_review: {
    label: "JD Review",
    color: "bg-indigo-100 text-indigo-700",
    icon: <FileText size={12} />,
  },
};

const statusConfig: Record<
  ApprovalStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={12} />,
  },
  approved: {
    label: "Đã duyệt",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={12} />,
  },
  rejected: {
    label: "Từ chối",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={12} />,
  },
  info_needed: {
    label: "Cần thêm TT",
    color: "bg-slate-100 text-slate-700",
    icon: <AlertTriangle size={12} />,
  },
};

const priorityConfig = {
  high: { label: "Cao", color: "bg-red-100 text-red-700" },
  medium: { label: "Trung bình", color: "bg-amber-100 text-amber-700" },
  low: { label: "Thấp", color: "bg-slate-100 text-slate-600" },
};

// ─── Action Modal ───────────────────────────────────────────────────────────────
function ActionModal({
  item,
  action,
  onConfirm,
  onClose,
}: {
  item: ApprovalItem;
  action: "approve" | "reject" | "info";
  onConfirm: (notes: string) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const isApprove = action === "approve";
  const isReject = action === "reject";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-md fade-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isApprove ? "bg-green-100" : isReject ? "bg-red-100" : "bg-amber-100"}`}
          >
            {isApprove ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : isReject ? (
              <XCircle size={16} className="text-red-600" />
            ) : (
              <MessageSquare size={16} className="text-amber-600" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {isApprove
                ? "Phê duyệt yêu cầu"
                : isReject
                  ? "Từ chối yêu cầu"
                  : "Yêu cầu thêm thông tin"}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate max-w-xs">
              {item.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {isApprove
                ? "Ghi chú (tùy chọn)"
                : isReject
                  ? "Lý do từ chối *"
                  : "Thông tin cần bổ sung *"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-base text-xs resize-none w-full"
              placeholder={
                isApprove
                  ? "Thêm ghi chú nếu cần..."
                  : isReject
                    ? "Nhập lý do từ chối..."
                    : "Mô tả thông tin cần bổ sung..."
              }
            />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4">
          <button onClick={onClose} className="btn-secondary flex-1 text-xs">
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm(notes);
              onClose();
            }}
            disabled={!isApprove && !notes.trim()}
            className={`flex-1 text-xs px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${isApprove ? "btn-primary" : isReject ? "bg-red-600 hover:bg-red-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}`}
          >
            {isApprove ? "Phê duyệt" : isReject ? "Từ chối" : "Gửi yêu cầu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Approval Card ──────────────────────────────────────────────────────────────
function ApprovalCard({
  item,
  onAction,
}: {
  item: ApprovalItem;
  onAction: (item: ApprovalItem, action: "approve" | "reject" | "info") => void;
}) {
  const typeCfg = typeConfig[item.type];
  const statusCfg = statusConfig[item.status];
  const priorityCfg = priorityConfig[item.priority];
  const isPending = item.status === "pending";

  return (
    <div
      className={`bg-card border rounded-xl p-4 transition-all ${isPending ? "border-border hover:border-primary/30 hover:shadow-sm" : "border-border opacity-75"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeCfg.color}`}
            >
              {typeCfg.icon} {typeCfg.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${priorityCfg.color}`}
            >
              {priorityCfg.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.color}`}
            >
              {statusCfg.icon} {statusCfg.label}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1 leading-snug">
            {item.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            {item.description}
          </p>
          {item.amount && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold mb-2">
              {item.amount}
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 size={10} /> {item.requestedByDept}
            </span>
            <span className="flex items-center gap-1">
              <UserCheck size={10} /> {item.requestedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={10} /> {item.requestedAt}
            </span>
            {item.dueDate && (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock size={10} /> Hạn: {item.dueDate}
              </span>
            )}
            {item.attachments && (
              <span className="flex items-center gap-1">
                <FileText size={10} /> {item.attachments} tệp đính kèm
              </span>
            )}
          </div>
          {item.notes && (
            <div className="mt-2 px-3 py-2 bg-muted/40 rounded-lg">
              <p className="text-[11px] text-muted-foreground italic">
                "{item.notes}"
              </p>
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => onAction(item, "approve")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            <Check size={12} /> Phê duyệt
          </button>
          <button
            onClick={() => onAction(item, "reject")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            <X size={12} /> Từ chối
          </button>
          <button
            onClick={() => onAction(item, "info")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            <MessageSquare size={12} /> Cần thêm TT
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ApprovalCenterContent({ locale }: { locale: string }) {
  const [items, setItems] = useState<ApprovalItem[]>(approvalItems);
  const [activeStatus, setActiveStatus] = useState<"all" | ApprovalStatus>(
    "pending",
  );
  const [activeType, setActiveType] = useState<"all" | ApprovalType>("all");
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState<{
    item: ApprovalItem;
    action: "approve" | "reject" | "info";
  } | null>(null);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const filtered = useMemo(() => {
    let result = items;
    if (activeStatus !== "all")
      result = result.filter((i) => i.status === activeStatus);
    if (activeType !== "all")
      result = result.filter((i) => i.type === activeType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.requestedBy.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, activeStatus, activeType, search]);

  const handleAction = (
    item: ApprovalItem,
    action: "approve" | "reject" | "info",
  ) => {
    setActionModal({ item, action });
  };

  const handleConfirm = (notes: string) => {
    if (!actionModal) return;
    const { item, action } = actionModal;
    const newStatus: ApprovalStatus =
      action === "approve"
        ? "approved"
        : action === "reject"
          ? "rejected"
          : "info_needed";
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: newStatus, notes: notes || i.notes }
          : i,
      ),
    );
  };

  const statusTabs: {
    id: "all" | ApprovalStatus;
    label: string;
    count?: number;
  }[] = [
    { id: "all", label: "Tất cả", count: items.length },
    { id: "pending", label: "Chờ duyệt", count: pendingCount },
    { id: "approved", label: "Đã duyệt" },
    { id: "rejected", label: "Từ chối" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-foreground">
              Trung tâm Phê duyệt
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Xem xét và phê duyệt các yêu cầu từ các phòng ban
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock size={14} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                {pendingCount} yêu cầu chờ duyệt
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {[
            {
              label: "Chờ duyệt",
              value: items.filter((i) => i.status === "pending").length,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Đã duyệt",
              value: items.filter((i) => i.status === "approved").length,
              color: "text-green-600",
              bg: "bg-green-50 border-green-200",
            },
            {
              label: "Từ chối",
              value: items.filter((i) => i.status === "rejected").length,
              color: "text-red-600",
              bg: "bg-red-50 border-red-200",
            },
            {
              label: "Tổng cộng",
              value: items.length,
              color: "text-foreground",
              bg: "bg-muted/40 border-border",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`flex-shrink-0 rounded-xl border px-4 py-2.5 min-w-[100px] ${stat.bg}`}
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
        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeStatus === tab.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeStatus === tab.id ? "bg-white/20 text-white" : "bg-background text-muted-foreground"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={activeType}
          onChange={(e) => setActiveType(e.target.value as any)}
          className="input-base text-xs py-1.5 w-auto min-w-[140px]"
        >
          <option value="all">Tất cả loại</option>
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm yêu cầu..."
            className="input-base pl-8 text-xs py-1.5 w-full"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle size={24} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Không có yêu cầu nào
            </p>
            <p className="text-xs text-muted-foreground">
              Thay đổi bộ lọc để xem thêm
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {filtered.map((item) => (
              <ApprovalCard key={item.id} item={item} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>

      {actionModal && (
        <ActionModal
          item={actionModal.item}
          action={actionModal.action}
          onConfirm={handleConfirm}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}
