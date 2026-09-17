"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Users,
  Sparkles,
  FileText,
  Globe,
  ChevronRight,
  Briefcase,
  Clock,
  CheckCircle,
  Send,
  DollarSign,
  User,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  JobRequisition,
  requisitionStatusConfig,
  getApplicationsForJobPost,
  statusBadgeConfig,
} from "./candidateData";
// Assuming you placed the generic drawer components in this path:
import { DetailDrawer, DrawerSection } from "@/components/layouts/DetailDrawer";

interface JobRecruitmentDrawerProps {
  req: JobRequisition | null;
  onClose: () => void;
  locale?: string;
  onAIGen: (id: string) => void;
  onViewJD: (req: JobRequisition) => void;
  onRequestReview: (id: string) => void;
  onPublish: (id: string) => void;
}

export default function JobRecruitmentDrawer({
  req,
  onClose,
  locale = "vi",
  onAIGen,
  onViewJD,
  onRequestReview,
  onPublish,
}: JobRecruitmentDrawerProps) {
  const [openSections, setOpenSections] = useState({
    overview: true,
    details: true,
    jdActions: true,
    candidates: true,
  });

  if (!req) return null;

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const statusCfg = requisitionStatusConfig[req.status];
  const canAIGen = req.status === "pending_hr" || req.status === "jd_generated";

  // Get applications for this job post when published
  const applications =
    req.status === "published" ? getApplicationsForJobPost(req.id) : [];

  return (
    <DetailDrawer
      isOpen={!!req}
      onClose={onClose}
      title={req.position}
      subtitle={req.department}
      headerClassName="bg-primary text-primary-foreground border-b border-border"
      icon={
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
          {req.position.charAt(0)}
        </div>
      }
      footer={
        <Link
          href={`/${locale}/hr/recruitment/${req.id}`}
          onClick={onClose}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          Xem chi tiết đầy đủ
          <ChevronRight size={15} />
        </Link>
      }
    >
      {/* ─── SECTION 1: OVERVIEW ─── */}
      <DrawerSection
        title="Tổng quan"
        icon={<Briefcase size={14} />}
        isExpanded={openSections.overview}
        onToggle={() => toggleSection("overview")}
      >
        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
            {req.headcount > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                <Users size={11} /> {req.headcount} người
              </span>
            )}
          </div>

          {/* Key info grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                icon: <Building2 size={12} />,
                label: "Phòng ban",
                value: req.department,
              },
              {
                icon: <User size={12} />,
                label: "Yêu cầu bởi",
                value: req.requestedBy,
              },
              {
                icon: <Calendar size={12} />,
                label: "Ngày yêu cầu",
                value: req.requestedDate,
              },
              {
                icon: <UserCheck size={12} />,
                label: "HR phụ trách",
                value: req.hrAssignee,
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

          {/* Budget & Start Date */}
          {(req.budgetRange || req.preferredStartDate) && (
            <div className="bg-muted/40 rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Chi tiết tuyển dụng
              </p>
              {req.budgetRange && (
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <DollarSign
                    size={13}
                    className="text-muted-foreground flex-shrink-0"
                  />
                  <span>{req.budgetRange}</span>
                </div>
              )}
              {req.preferredStartDate && (
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Calendar
                    size={13}
                    className="text-muted-foreground flex-shrink-0"
                  />
                  <span>Bắt đầu: {req.preferredStartDate}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerSection>

      {/* ─── SECTION 2: DETAILS ─── */}
      <DrawerSection
        title="Chi tiết yêu cầu"
        icon={<FileText size={14} />}
        isExpanded={openSections.details}
        onToggle={() => toggleSection("details")}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Lý do tuyển dụng
            </p>
            <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-2.5 rounded-md border border-border/50">
              {req.reason}
            </p>
          </div>

          {req.requirements && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Yêu cầu cơ bản
              </p>
              <p className="text-xs text-foreground leading-relaxed bg-muted/20 p-2.5 rounded-md border border-border/50">
                {req.requirements}
              </p>
            </div>
          )}
        </div>
      </DrawerSection>

      {/* ─── SECTION 3: JD & ACTIONS ─── */}
      <DrawerSection
        title="Tin tuyển dụng & Thao tác"
        icon={<Zap size={14} />}
        isExpanded={openSections.jdActions}
        onToggle={() => toggleSection("jdActions")}
      >
        <div className="space-y-4">
          {/* Status Displays */}
          <div className="space-y-2">
            {/* JD Status */}
            {req.generatedJD && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                    Mô tả công việc (JD)
                  </p>
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                    Đã tạo
                  </span>
                </div>
                <p className="text-xs font-medium text-purple-800">
                  {req.generatedJD.title}
                </p>
                <p className="text-[11px] text-purple-600 mt-1">
                  Tạo bởi {req.generatedJD.generatedBy} ·{" "}
                  {req.generatedJD.generatedAt}
                </p>
                <button
                  onClick={() => onViewJD(req)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  <FileText size={12} /> Xem JD đầy đủ
                </button>
              </div>
            )}

            {/* Published info */}
            {req.status === "published" && req.publishedAt && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">
                    Đã đăng tuyển
                  </p>
                </div>
                <p className="text-[11px] text-emerald-600">
                  {req.publishedAt} · {req.publishedTo?.join(", ")}
                </p>
              </div>
            )}

            {/* Pending review info */}
            {req.status === "pending_review" && req.reviewRequestedAt && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={13} className="text-amber-600" />
                  <p className="text-xs font-semibold text-amber-700">
                    Chờ xác nhận
                  </p>
                </div>
                <p className="text-[11px] text-amber-600">
                  Đã gửi {req.reviewRequestedAt} · Chờ {req.requestedBy} xác
                  nhận
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-border/50 space-y-2">
            {canAIGen && (
              <button
                onClick={() => {
                  onAIGen(req.id);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                <Sparkles size={15} /> AI Gen JD
              </button>
            )}

            {req.generatedJD && req.status !== "published" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onRequestReview(req.id);
                    onClose();
                  }}
                  className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5"
                >
                  <Send size={12} /> Yêu cầu xác nhận
                </button>
                <button
                  onClick={() => {
                    onPublish(req.id);
                    onClose();
                  }}
                  className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5"
                >
                  <Globe size={12} /> Đăng tuyển
                </button>
              </div>
            )}
          </div>
        </div>
      </DrawerSection>

      {/* ─── SECTION 4: CANDIDATES ─── */}
      {req.status === "published" && (
        <DrawerSection
          title={`Ứng viên đã nộp (${applications.length})`}
          icon={<Users size={14} />}
          isExpanded={openSections.candidates}
          onToggle={() => toggleSection("candidates")}
        >
          {applications.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Chưa có ứng viên nào nộp hồ sơ
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map(({ candidate, application }) => (
                <Link
                  key={application.id}
                  href={`/${locale}/hr/ats/${candidate.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 p-2.5 bg-muted/30 hover:bg-muted/60 rounded-xl transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {candidate.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {candidate.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {application.source} · {application.appliedDate}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeConfig[application.status]?.className || "bg-muted text-muted-foreground"}`}
                  >
                    {statusBadgeConfig[application.status]?.label ||
                      application.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}
