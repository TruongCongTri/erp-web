/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import type { ColumnDef, StockFeatures } from "@tanstack/react-table";
import {
  Plus,
  Download,
  RefreshCw,
  Eye,
  Sparkles,
  Globe,
  CheckCircle,
  Building2,
  Users,
  X,
  Send,
  FileText,
  Briefcase,
  Search,
} from "lucide-react";
import {
  jobRequisitions,
  JobRequisition,
  RequisitionStatus,
  requisitionStatusConfig,
  GeneratedJD,
} from "./candidateData";
import {
  DataTable,
  SortHeader,
  FacetFilter,
  DataBadge,
  MobileFilterSheet,
} from "@/components/ui/DataTable";
import JobRecruitmentDrawer from "./JobRecruitmentDrawer";
import { useParams } from "next/navigation";

// ─── Hire Request Form Modal ────────────────────────────────────────────────────
function HireRequestModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [form, setForm] = useState({
    position: "",
    department: "",
    headcount: "1",
    reason: "",
    requirements: "",
    preferredStartDate: "",
    budgetRange: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const depts = [
    "Xây dựng",
    "Khối Thiết kế",
    "Phòng Kế toán",
    "Phòng Kinh doanh",
    "An toàn & QLCL",
    "Phòng Dự toán",
    "Phòng Cung ứng",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Tin Tuyển Dụng
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Vị trí cần tuyển *
              </label>
              <input
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="Kỹ sư kết cấu cấp cao"
                className="input-base w-full text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Phòng ban *
              </label>
              <select
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className="input-base w-full text-xs"
              >
                <option value="">Chọn phòng ban</option>
                {depts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Số lượng cần tuyển
              </label>
              <input
                type="number"
                min="1"
                value={form.headcount}
                onChange={(e) => set("headcount", e.target.value)}
                className="input-base w-full text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Lý do tuyển dụng *
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
                placeholder="Mở rộng dự án, thay thế nhân viên nghỉ việc..."
                rows={2}
                className="input-base w-full text-xs resize-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Yêu cầu cơ bản
              </label>
              <textarea
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder="Kinh nghiệm, kỹ năng, chứng chỉ cần thiết..."
                rows={2}
                className="input-base w-full text-xs resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Ngày bắt đầu mong muốn
              </label>
              <input
                type="date"
                value={form.preferredStartDate}
                onChange={(e) => set("preferredStartDate", e.target.value)}
                className="input-base w-full text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Ngân sách lương
              </label>
              <input
                value={form.budgetRange}
                onChange={(e) => set("budgetRange", e.target.value)}
                placeholder="15,000,000 - 25,000,000 VND"
                className="input-base w-full text-xs"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4 pt-3 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="btn-secondary flex-1 text-xs">
            Hủy
          </button>
          <button
            onClick={() => {
              onSubmit(form);
              onClose();
            }}
            disabled={!form.position || !form.department || !form.reason}
            className="btn-primary flex-1 text-xs disabled:opacity-50"
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── JD View Modal ──────────────────────────────────────────────────────────────
function JDViewModal({
  jd,
  req,
  onClose,
  onRequestReview,
  onPublish,
}: {
  jd: GeneratedJD;
  req: JobRequisition;
  onClose: () => void;
  onRequestReview: () => void;
  onPublish: () => void;
}) {
  const publishTargets = [
    "Website công ty",
    "LinkedIn",
    "TopCV",
    "JobStreet",
    "VietnamWorks",
  ];
  const [selectedTargets, setSelectedTargets] = useState<string[]>([
    "Website công ty",
    "LinkedIn",
    "TopCV",
  ]);
  const toggleTarget = (t: string) =>
    setSelectedTargets((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {jd.title}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Tạo bởi {jd.generatedBy} · {jd.generatedAt}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Tổng quan vị trí
            </p>
            <p className="text-xs text-foreground leading-relaxed">
              {jd.overview}
            </p>
          </div>
          {[
            { title: "Trách nhiệm công việc", items: jd.responsibilities },
            { title: "Yêu cầu bắt buộc", items: jd.requirements },
            { title: "Yêu cầu ưu tiên", items: jd.preferredQualifications },
            { title: "Quyền lợi", items: jd.benefits },
          ].map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground"
                  >
                    <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground mb-1">
                Điều kiện làm việc
              </p>
              <p className="text-xs text-foreground">{jd.workingConditions}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-[10px] text-emerald-600 mb-1 font-semibold">
                Mức lương
              </p>
              <p className="text-xs font-bold text-emerald-800">
                {jd.salaryRange}
              </p>
            </div>
          </div>
          {req.status !== "published" && (
            <div className="border border-border rounded-xl p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Đăng tuyển lên
              </p>
              <div className="flex flex-wrap gap-2">
                {publishTargets.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTarget(t)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedTargets.includes(t)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Globe size={11} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {req.status !== "published" ? (
          <div className="flex gap-2 px-5 pb-4 pt-3 border-t border-border flex-shrink-0">
            <button onClick={onClose} className="btn-secondary text-xs px-3">
              Đóng
            </button>
            <button
              onClick={() => {
                onRequestReview();
                onClose();
              }}
              className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5"
            >
              <Send size={13} /> Yêu cầu xác nhận
            </button>
            <button
              onClick={() => {
                onPublish();
                onClose();
              }}
              className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5"
            >
              <Globe size={13} /> Đăng tuyển ngay
            </button>
          </div>
        ) : (
          <div className="px-5 pb-4 pt-3 border-t border-border flex-shrink-0">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle size={14} />
              <p className="text-xs font-medium">
                Đã đăng tuyển lên: {req.publishedTo?.join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Gen Loading ─────────────────────────────────────────────────────────────
function AIGenLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border border-border shadow-2xl p-8 text-center max-w-xs w-full mx-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={24} className="text-primary animate-pulse" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          AI đang tạo JD...
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Đang phân tích yêu cầu và tạo mô tả công việc chuẩn doanh nghiệp
        </p>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full animate-pulse"
            style={{ width: "70%" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Card ────────────────────────────────────────────────────────────────
function RequisitionCard({
  req,
  onView,
}: {
  req: JobRequisition;
  onView: (r: JobRequisition) => void;
}) {
  const statusCfg = requisitionStatusConfig[req.status];
  return (
    <div
      onClick={() => onView(req)}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:bg-muted/50 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
        {req.position.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">
            {req.position}
          </p>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.className}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {req.department}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {req.requestedBy}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {req.requestedDate}
          </span>
        </div>
      </div>
      <Eye size={16} className="text-muted-foreground flex-shrink-0" />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function JobRecruitmentContent() {
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  const [reqs, setReqs] = useState<JobRequisition[]>(jobRequisitions);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [drawerReq, setDrawerReq] = useState<JobRequisition | null>(null);
  const [showHireForm, setShowHireForm] = useState(false);
  const [aiGenId, setAiGenId] = useState<string | null>(null);
  const [viewJDReq, setViewJDReq] = useState<JobRequisition | null>(null);

  const departments = useMemo(
    () => [...new Set(reqs.map((r) => r.department))],
    [reqs],
  );

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    reqs.forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return map;
  }, [reqs]);

  const filteredData = useMemo(() => {
    let result = reqs;
    if (statusFilter.length > 0)
      result = result.filter((r) => statusFilter.includes(r.status));
    if (deptFilter.length > 0)
      result = result.filter((r) => deptFilter.includes(r.department));
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter(
        (r) =>
          r.position.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.requestedBy.toLowerCase().includes(q),
      );
    }
    return result;
  }, [reqs, statusFilter, deptFilter, globalFilter]);

  const handleAIGen = async (id: string) => {
    setAiGenId(id);
    await new Promise((r) => setTimeout(r, 2000));
    setAiGenId(null);
    setReqs((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "jd_generated" as RequisitionStatus } : r,
      ),
    );
    // Update drawer if open
    setDrawerReq((prev) =>
      prev?.id === id
        ? { ...prev, status: "jd_generated" as RequisitionStatus }
        : prev,
    );
  };

  const handleRequestReview = (id: string) => {
    setReqs((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "pending_review" as RequisitionStatus,
              reviewRequestedAt: new Date().toLocaleDateString("vi-VN"),
            }
          : r,
      ),
    );
  };

  const handlePublish = (id: string) => {
    setReqs((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "published" as RequisitionStatus,
              publishedAt: new Date().toLocaleDateString("vi-VN"),
              publishedTo: ["Website công ty", "LinkedIn", "TopCV"],
            }
          : r,
      ),
    );
  };

  const columns = useMemo<ColumnDef<StockFeatures, JobRequisition, any>[]>(
    () => [
      {
        id: "select",
        size: 40,
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el: any) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="accent-primary w-4 h-4 cursor-pointer"
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e: any) => e.stopPropagation()}
            className="accent-primary w-4 h-4 cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "position",
        header: ({ column }: any) => (
          <SortHeader column={column}>Vị trí tuyển dụng</SortHeader>
        ),
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
              {row.original.position.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {row.original.position}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Yêu cầu bởi: {row.original.requestedBy}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: ({ column }: any) => (
          <SortHeader column={column}>Phòng ban</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 size={11} className="text-muted-foreground/60" />
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "headcount",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Số lượng
          </span>
        ),
        cell: ({ getValue }: any) => (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users size={11} className="text-muted-foreground/60" />
            {getValue()} người
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }: any) => (
          <SortHeader column={column}>Trạng thái</SortHeader>
        ),
        cell: ({ getValue }: any) => {
          const val = getValue() as RequisitionStatus;
          const cfg = requisitionStatusConfig[val];
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}
            >
              {cfg.label}
            </span>
          );
        },
      },
      {
        accessorKey: "budgetRange",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Ngân sách
          </span>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {getValue() || "—"}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "requestedDate",
        header: ({ column }: any) => (
          <SortHeader column={column}>Ngày yêu cầu</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "hrAssignee",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            HR phụ trách
          </span>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-muted-foreground">{getValue()}</span>
        ),
        enableSorting: false,
      },
      {
        id: "actions",
        size: 110,
        header: () => null,
        cell: ({ row }: any) => {
          const req: JobRequisition = row.original;
          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e: any) => e.stopPropagation()}
            >
              <button
                onClick={() => setDrawerReq(req)}
                className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-colors"
                title="Xem nhanh"
              >
                <Eye size={13} />
              </button>
              {(req.status === "pending_hr" ||
                req.status === "jd_generated") && (
                <button
                  onClick={() => handleAIGen(req.id)}
                  className="p-1.5 rounded hover:bg-purple-50 text-muted-foreground hover:text-purple-600 transition-colors"
                  title="AI Gen JD"
                >
                  <Sparkles size={13} />
                </button>
              )}
              {req.generatedJD && (
                <button
                  onClick={() => setViewJDReq(req)}
                  className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                  title="Xem JD"
                >
                  <FileText size={13} />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [reqs],
  );

  const hasFilters =
    statusFilter.length > 0 || deptFilter.length > 0 || globalFilter;
  const activeFilterCount = statusFilter.length + deptFilter.length;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter([]);
    setDeptFilter([]);
  };

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <FacetFilter
        label="Trạng thái"
        options={Object.entries(requisitionStatusConfig).map(([val, cfg]) => ({
          value: val,
          label: cfg.label,
          count: statusCounts[val] ?? 0,
        }))}
        selected={statusFilter}
        onChange={setStatusFilter}
      />
      <FacetFilter
        label="Phòng ban"
        options={departments.map((d) => ({ value: d, label: d }))}
        selected={deptFilter}
        onChange={setDeptFilter}
      />
    </div>
  );

  const mobileFacetFiltersNode = (
    <MobileFilterSheet
      activeCount={activeFilterCount}
      onClearAll={clearAllFilters}
    >
      {facetFiltersNode}
    </MobileFilterSheet>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Tuyển dụng
            </h1>
            <p className="text-xs text-muted-foreground">
              {filteredData.length} yêu cầu · Cập nhật 30/08/2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost hidden sm:flex items-center gap-1.5 text-xs">
              <Download size={13} /> Xuất Excel
            </button>
            <button className="btn-ghost hidden sm:flex items-center gap-1.5 text-xs">
              <RefreshCw size={13} /> Làm mới
            </button>
            <button
              onClick={() => setShowHireForm(true)}
              className="btn-primary flex items-center gap-1.5 text-xs py-1.5"
            >
              <Plus size={14} />{" "}
              <span className="hidden sm:inline">Yêu cầu tuyển dụng</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Tìm vị trí, phòng ban..."
              className="input-base pl-9 py-1.5 text-xs w-full"
            />
          </div>
          <div className="hidden md:flex items-center gap-2">
            {facetFiltersNode}
          </div>
          <div className="md:hidden">{mobileFacetFiltersNode}</div>
          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X size={12} /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          onRowClick={(row) => setDrawerReq(row)}
          emptyMessage="Không có yêu cầu tuyển dụng"
          emptyIcon={
            <FileText size={32} className="text-muted-foreground/30" />
          }
          // isFetching={}
          // isLoading={}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <FileText size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không có yêu cầu tuyển dụng
            </p>
          </div>
        ) : (
          filteredData.map((req) => (
            <RequisitionCard key={req.id} req={req} onView={setDrawerReq} />
          ))
        )}
      </div>

      {/* Quick View Drawer */}
      <JobRecruitmentDrawer
        req={drawerReq}
        onClose={() => setDrawerReq(null)}
        locale={locale}
        onAIGen={handleAIGen}
        onViewJD={(req: any) => {
          setViewJDReq(req);
          setDrawerReq(null);
        }}
        onRequestReview={handleRequestReview}
        onPublish={handlePublish}
      />

      {/* Modals */}
      {showHireForm && (
        <HireRequestModal
          onClose={() => setShowHireForm(false)}
          onSubmit={(data) => {
            const newReq: JobRequisition = {
              id: `req-${Date.now()}`,
              requestedBy: "Người dùng hiện tại",
              requestedByDept: data.department,
              requestedDate: new Date().toLocaleDateString("vi-VN"),
              position: data.position,
              department: data.department,
              headcount: parseInt(data.headcount) || 1,
              reason: data.reason,
              requirements: data.requirements,
              preferredStartDate: data.preferredStartDate,
              budgetRange: data.budgetRange,
              status: "pending_hr",
              hrAssignee: "Phạm Ngọc Hà",
            };
            setReqs((prev) => [newReq, ...prev]);
          }}
        />
      )}

      {aiGenId && <AIGenLoading />}

      {viewJDReq?.generatedJD && (
        <JDViewModal
          jd={viewJDReq.generatedJD}
          req={viewJDReq}
          onClose={() => setViewJDReq(null)}
          onRequestReview={() => handleRequestReview(viewJDReq.id)}
          onPublish={() => handlePublish(viewJDReq.id)}
        />
      )}
    </div>
  );
}
