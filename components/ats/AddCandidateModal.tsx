/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  FileText,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react";
import { candidateDepartments } from "./candidateData";

interface AddCandidateModalProps {
  onClose: () => void;
  onAdd: (data: any) => void;
}

export default function AddCandidateModal({
  onClose,
  onAdd,
}: AddCandidateModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    source: "Giới thiệu nội bộ",
    experience: "",
    education: "",
    skills: "",
    expectedSalary: "",
    linkedIn: "",
    notes: "",
    suggestedBy: "",
    isSuggestedByEmployee: false,
    // Reference
    refName: "",
    refRelationship: "",
    refCompany: "",
    refPosition: "",
    refPhone: "",
    refEmail: "",
    refIsEmployee: false,
  });

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      onAdd(form);
      onClose();
    }, 1500);
  };

  const sources = [
    "LinkedIn",
    "TopCV",
    "JobStreet",
    "Website",
    "Referral",
    "Giới thiệu nội bộ",
    "Khác",
  ];

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            Đã thêm ứng viên!
          </h3>
          <p className="text-xs text-muted-foreground">
            Hồ sơ đang được xử lý bởi HR.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Thêm ứng viên mới
              </h3>
              <p className="text-[10px] text-muted-foreground">Bước {step}/2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X size={15} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-5 pt-3 gap-2 flex-shrink-0">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${step >= s ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {step === 1 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Thông tin ứng viên
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <User
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="input-base pl-8 w-full text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="email@gmail.com"
                      className="input-base pl-8 w-full text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="0901 234 567"
                      className="input-base pl-8 w-full text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Vị trí ứng tuyển *
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      value={form.position}
                      onChange={(e) => set("position", e.target.value)}
                      placeholder="Kỹ sư kết cấu"
                      className="input-base pl-8 w-full text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Phòng ban
                  </label>
                  <div className="relative">
                    <Building2
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <select
                      value={form.department}
                      onChange={(e) => set("department", e.target.value)}
                      className="input-base pl-8 w-full text-xs"
                    >
                      <option value="">Chọn phòng ban</option>
                      {candidateDepartments.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Nguồn
                  </label>
                  <select
                    value={form.source}
                    onChange={(e) => set("source", e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    {sources.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Kinh nghiệm
                  </label>
                  <input
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    placeholder="3 năm"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Học vấn
                  </label>
                  <input
                    value={form.education}
                    onChange={(e) => set("education", e.target.value)}
                    placeholder="Đại học Bách Khoa"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Lương mong muốn
                  </label>
                  <input
                    value={form.expectedSalary}
                    onChange={(e) => set("expectedSalary", e.target.value)}
                    placeholder="20,000,000 VND"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Kỹ năng (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    value={form.skills}
                    onChange={(e) => set("skills", e.target.value)}
                    placeholder="AutoCAD, ETABS, SAP2000"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    LinkedIn
                  </label>
                  <input
                    value={form.linkedIn}
                    onChange={(e) => set("linkedIn", e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="input-base w-full text-xs"
                  />
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Đính kèm CV
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <Upload
                    size={20}
                    className="text-muted-foreground mx-auto mb-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Kéo thả hoặc{" "}
                    <span className="text-primary font-medium">chọn file</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    PDF, DOC, DOCX · Tối đa 10MB
                  </p>
                </div>
              </div>

              {/* Suggested by */}
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="suggestedByEmployee"
                    checked={form.isSuggestedByEmployee}
                    onChange={(e) =>
                      set("isSuggestedByEmployee", e.target.checked)
                    }
                    className="accent-primary"
                  />
                  <label
                    htmlFor="suggestedByEmployee"
                    className="text-xs font-medium text-violet-700 cursor-pointer"
                  >
                    <Users size={12} className="inline mr-1" />
                    Đây là ứng viên được giới thiệu bởi nhân viên công ty
                  </label>
                </div>
                {form.isSuggestedByEmployee && (
                  <input
                    value={form.suggestedBy}
                    onChange={(e) => set("suggestedBy", e.target.value)}
                    placeholder="Tên nhân viên giới thiệu"
                    className="input-base w-full text-xs"
                  />
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Ghi chú thêm
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Thông tin bổ sung về ứng viên..."
                  rows={2}
                  className="input-base w-full text-xs resize-none"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Người tham chiếu (tùy chọn)
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
                <p className="text-[11px] text-blue-700">
                  <AlertCircle size={12} className="inline mr-1" />
                  Thêm thông tin người tham chiếu giúp HR xác minh ứng viên
                  nhanh hơn.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Họ tên người tham chiếu
                  </label>
                  <input
                    value={form.refName}
                    onChange={(e) => set("refName", e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Mối quan hệ
                  </label>
                  <input
                    value={form.refRelationship}
                    onChange={(e) => set("refRelationship", e.target.value)}
                    placeholder="Quản lý trực tiếp cũ"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Công ty
                  </label>
                  <input
                    value={form.refCompany}
                    onChange={(e) => set("refCompany", e.target.value)}
                    placeholder="Tên công ty"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Chức vụ
                  </label>
                  <input
                    value={form.refPosition}
                    onChange={(e) => set("refPosition", e.target.value)}
                    placeholder="Trưởng phòng"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Điện thoại
                  </label>
                  <input
                    value={form.refPhone}
                    onChange={(e) => set("refPhone", e.target.value)}
                    placeholder="0901 234 567"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.refEmail}
                    onChange={(e) => set("refEmail", e.target.value)}
                    placeholder="email@company.vn"
                    className="input-base w-full text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="refIsEmployee"
                      checked={form.refIsEmployee}
                      onChange={(e) => set("refIsEmployee", e.target.checked)}
                      className="accent-primary"
                    />
                    <label
                      htmlFor="refIsEmployee"
                      className="text-xs text-foreground cursor-pointer"
                    >
                      Người này là nhân viên hiện tại của công ty
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-4 pt-3 border-t border-border flex-shrink-0">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="btn-secondary flex-1 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.email || !form.position}
                className="btn-primary flex-1 text-xs disabled:opacity-50"
              >
                Tiếp theo →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 text-xs"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FileText size={13} /> Thêm ứng viên
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
