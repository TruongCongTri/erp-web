"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Users,
  Sparkles,
  FileText,
  ChevronRight,
  Briefcase,
  Clock,
  CheckCircle,
  DollarSign,
  User,
  Zap,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Hash,
  Layers,
} from "lucide-react";
import {
  RecruitmentRequest,
  RecruitmentRequestStatus,
  JobPostStatus,
  getDeptName,
} from "@/lib/store/atsApiSlice";

import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";

// ─── STATUS CONFIG (ĐỒNG BỘ 100% VỚI BACKEND & SLICE) ────────────────────────
const REQ_STATUS_CONFIG: Record<
  RecruitmentRequestStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  [RecruitmentRequestStatus.PENDING_HR]: {
    label: "HR tiếp nhận",
    className: "badge-warning",
    icon: Clock,
  },
  [RecruitmentRequestStatus.DRAFTED]: {
    label: "Đã soạn thảo",
    className: "badge-neutral",
    icon: FileText,
  },
  [RecruitmentRequestStatus.PENDING_HEAD_APPROVAL]: {
    label: "Chờ duyệt JD",
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    icon: ShieldCheck,
  },
  [RecruitmentRequestStatus.APPROVED]: {
    label: "Sẵn sàng đăng",
    className: "badge-success",
    icon: CheckCircle,
  },
  [RecruitmentRequestStatus.REJECTED]: {
    label: "Bị từ chối",
    className: "badge-danger",
    icon: XCircle,
  },
  [RecruitmentRequestStatus.COMPLETED]: {
    label: "Hoàn thành",
    className: "bg-emerald-600 text-white border-emerald-600",
    icon: CheckCircle,
  },
  [RecruitmentRequestStatus.CANCELLED]: {
    label: "Đã hủy",
    className:
      "bg-slate-200 text-slate-600 border-slate-300 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
    icon: XCircle,
  },
};

interface RecruitmentRequestDrawerProps {
  req: RecruitmentRequest | null;
  onClose: () => void;
  locale?: string;
  onNavigateDetail: () => void;
}

export default function RecruitmentRequestDrawer({
  req,
  onClose,
  onNavigateDetail,
}: RecruitmentRequestDrawerProps) {
  const [openSections, setOpenSections] = useState({
    overview: true,
    details: true,
    jdActions: true,
  });

  if (!req) return null;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const statusCfg =
    REQ_STATUS_CONFIG[req.status] ||
    REQ_STATUS_CONFIG[RecruitmentRequestStatus.PENDING_HR];

  const StatusIcon = statusCfg.icon;

  const title =
    req.jobPost?.publicTitle ||
    req.rawRequestNote ||
    `Yêu cầu tuyển dụng [${req.requestCode}]`;

  const deptName = getDeptName(req.department);

  const avatarText = req.requestCode
    ? req.requestCode.slice(-3)
    : title.slice(0, 2).toUpperCase();

  const headcount = req.jobPost?.headcount;

  return (
    <DetailDrawer
      isOpen={!!req}
      onClose={onClose}
      title={title}
      subtitle={`[${req.requestCode}] · ${deptName}`}
      headerClassName="bg-primary text-primary-foreground border-b border-border"
      icon={
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-mono font-bold text-xs">
          {avatarText}
        </div>
      }
      footer={
        <button
          onClick={() => {
            onClose();
            onNavigateDetail();
          }}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          Xem chi tiết & Soạn JD
          <ChevronRight size={15} />
        </button>
      }
    >
      {/* ─── SECTION 1: OVERVIEW ─── */}
      <DrawerSection
        title="Tổng quan yêu cầu"
        icon={<Briefcase size={14} />}
        isExpanded={openSections.overview}
        onToggle={() => toggleSection("overview")}
      >
        <div className="space-y-4">
          {/* Status badge & Headcount */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}
            >
              <StatusIcon size={12} />
              {statusCfg.label}
            </span>

            {typeof headcount === "number" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                <Users size={11} /> {headcount} nhân sự
              </span>
            )}

            {req.jobPost?.status === JobPostStatus.PUBLISHED && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                Đang tuyển đa kênh
              </span>
            )}
          </div>

          {/* Lý do từ chối nếu có */}
          {req.status === RecruitmentRequestStatus.REJECTED &&
            req.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 dark:bg-red-950/30 dark:border-red-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                  <AlertTriangle size={13} /> Lý do từ chối duyệt:
                </div>
                <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                  {req.rejectionReason}
                </p>
              </div>
            )}

          {/* Grid thông tin chung */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                icon: <Hash size={12} />,
                label: "Mã yêu cầu",
                value: req.requestCode || "—",
              },
              {
                icon: <Building2 size={12} />,
                label: "Phòng ban",
                value: deptName,
              },
              {
                icon: <User size={12} />,
                label: "Người yêu cầu",
                value: req.requester?.fullName || "Trưởng bộ phận",
              },
              {
                icon: <Calendar size={12} />,
                label: "Ngày gửi",
                value: req.createdAt
                  ? new Date(req.createdAt).toLocaleDateString("vi-VN")
                  : "—",
              },
              {
                icon: <Clock size={12} />,
                label: "Cập nhật lần cuối",
                value: req.updatedAt
                  ? new Date(req.updatedAt).toLocaleDateString("vi-VN")
                  : "—",
              },
              {
                icon: <Layers size={12} />,
                label: "Bản tin JD",
                value: req.jobPost ? req.jobPost.jobCode : "Chưa lập",
              },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  {item.icon}
                  <span className="text-[10px]">{item.label}</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Khung Ngân sách dự kiến */}
          {req.jobPost && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 dark:bg-emerald-950/20 dark:border-emerald-900/40">
              <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign size={13} /> Mức lương theo JD
              </p>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {req.jobPost.isSalaryNegotiable ? (
                  <span>Thỏa thuận</span>
                ) : (
                  <span>
                    {(req.jobPost.salaryMin / 1_000_000).toFixed(0)}M -{" "}
                    {(req.jobPost.salaryMax / 1_000_000).toFixed(0)}M VNĐ
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerSection>

      {/* ─── SECTION 2: DETAILS ─── */}
      <DrawerSection
        title="Nội dung tóm tắt ban đầu"
        icon={<FileText size={14} />}
        isExpanded={openSections.details}
        onToggle={() => toggleSection("details")}
      >
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Ghi chú nhu cầu từ Bộ phận
          </p>
          <div className="text-xs text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 whitespace-pre-wrap">
            {req.rawRequestNote || (
              <span className="italic text-muted-foreground">
                Không có ghi chú yêu cầu thô
              </span>
            )}
          </div>
        </div>
      </DrawerSection>

      {/* ─── SECTION 3: JD & ACTIONS ─── */}
      <DrawerSection
        title="Tiến độ JD & AI"
        icon={<Zap size={14} />}
        isExpanded={openSections.jdActions}
        onToggle={() => toggleSection("jdActions")}
      >
        <div className="space-y-3">
          {req.jobPost ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 dark:bg-purple-950/30 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Bản thảo JD: {req.jobPost.publicTitle}
                </p>
                <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {req.jobPost.jobCode}
                </span>
              </div>
              <div className="text-xs text-purple-900 dark:text-purple-200 line-clamp-4 leading-relaxed whitespace-pre-wrap mb-3 bg-purple-100/50 dark:bg-purple-900/30 p-2.5 rounded-md">
                {req.jobPost.jobDescription ||
                  "Đã tạo cấu trúc JD nhưng chưa nhập mô tả chi tiết."}
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateDetail();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors shadow-sm"
              >
                <FileText size={13} /> Xem & Duyệt JD hoàn chỉnh
              </button>
            </div>
          ) : (
            <div className="bg-muted/20 border border-border rounded-xl p-4 text-center">
              <Sparkles
                size={22}
                className="text-muted-foreground mx-auto mb-2 opacity-50"
              />
              <p className="text-xs font-medium text-foreground mb-1">
                Chưa có bản thảo JD
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Chuyên viên Nhân sự có thể sử dụng AI để tự động chuyển đổi
                yêu cầu này thành bản mô tả JD chuyên nghiệp.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNavigateDetail();
                }}
                className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
              >
                <Sparkles size={14} /> Mở giao diện AI JD Builder
              </button>
            </div>
          )}
        </div>
      </DrawerSection>
    </DetailDrawer>
  );
}
