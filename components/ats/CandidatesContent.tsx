/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type {
  ColumnDef,
  StockFeatures,
  PaginationState,
} from "@tanstack/react-table";
import {
  Download,
  RefreshCw,
  Eye,
  Search,
  ExternalLink,
  Plus,
  X,
  Send,
  Upload,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Clock,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  FileX,
  BrainCircuit,
  Briefcase,
} from "lucide-react";

import {
  DataTable,
  SortHeader,
  FacetFilter,
  MobileFilterSheet,
  TriStateCheckbox,
} from "@/components/ui/DataTable";
import ActionButton from "@/components/buttons/ActionButton";
import { gooeyToast } from "@/components/ui/goey-toaster";
import {
  SearchableSelect,
  SelectOption,
} from "@/components/buttons/SearchableSelect";

import {
  useGetCandidatesQuery,
  useGetJobPostsQuery,
  useSubmitCandidateManualMutation,
  useSyncAtsEventsQuery,
  ApplicationStatus,
  PlatformSource,
  AiScreeningTier,
  Candidate,
  JobPost,
} from "@/lib/store/atsApiSlice";
import CandidateDrawer from "./CandidateDrawerV2";

const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  [ApplicationStatus.APPLIED]: {
    label: "Mới nộp CV",
    className: "bg-slate-100 text-slate-700 border-slate-200 ",
  },
  [ApplicationStatus.AI_SCREENING]: {
    label: "Đang sàng lọc AI",
    className: "bg-amber-100 text-amber-700 border-amber-200 ",
  },
  [ApplicationStatus.SCREENING_FAILED]: {
    label: "Lỗi sàng lọc",
    className: "bg-orange-100 text-orange-800 border-orange-300 font-semibold ",
  },
  [ApplicationStatus.SHORTLISTED]: {
    label: "Xuất sắc (Tier 1)",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold ",
  },
  [ApplicationStatus.SAVED_POOL]: {
    label: "Kho tiềm năng (Tier 2)",
    className: "bg-blue-100 text-blue-700 border-blue-200 ",
  },
  [ApplicationStatus.SCREENING_REJECTED]: {
    label: "Không đạt (Tier 3)",
    className: "bg-rose-100 text-rose-700 border-rose-200 ",
  },
  [ApplicationStatus.INTERVIEWING]: {
    label: "Phỏng vấn",
    className: "bg-purple-100 text-purple-700 border-purple-200 font-semibold ",
  },
  [ApplicationStatus.OFFERED]: {
    label: "Đề nghị tuyển dụng",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200 ",
  },
  [ApplicationStatus.HIRED]: {
    label: "Đã tuyển dụng",
    className: "bg-teal-100 text-teal-800 border-teal-300 font-semibold ",
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: "Rút hồ sơ",
    className: "bg-gray-100 text-gray-500 border-gray-200 italic ",
  },
};

const PLATFORM_CONFIG: Record<
  PlatformSource,
  { label: string; bg: string; text: string }
> = {
  [PlatformSource.LINKEDIN]: {
    label: "LinkedIn",
    bg: "bg-[#0a66c2]/10",
    text: "text-[#0a66c2]",
  },
  [PlatformSource.TOPCV]: {
    label: "TopCV",
    bg: "bg-[#00b14f]/10",
    text: "text-[#00b14f]",
  },
  [PlatformSource.VIETNAMWORKS]: {
    label: "VietnamWorks",
    bg: "bg-orange-500/10",
    text: "text-orange-600",
  },
  [PlatformSource.CAREERVIET]: {
    label: "CareerViet",
    bg: "bg-red-500/10",
    text: "text-red-600",
  },
  [PlatformSource.FACEBOOK]: {
    label: "Facebook",
    bg: "bg-[#1877f2]/10",
    text: "text-[#1877f2]",
  },
  [PlatformSource.ZALO]: {
    label: "Zalo",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
  },
  [PlatformSource.COMPANY_WEBSITE]: {
    label: "Website",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  [PlatformSource.REFERRAL]: {
    label: "Giới thiệu nội bộ",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
  },
  [PlatformSource.MANUAL_ENTRY]: {
    label: "Nhập thủ công",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
};

const MANUAL_PLATFORM_OPTIONS: SelectOption<PlatformSource>[] = [
  { value: PlatformSource.MANUAL_ENTRY, label: "Thủ công / Khác" },
  { value: PlatformSource.REFERRAL, label: "Giới thiệu nội bộ" },
  { value: PlatformSource.ZALO, label: "Zalo" },
  { value: PlatformSource.FACEBOOK, label: "Facebook" },
];

function AddManualCandidateModal({
  jobPosts,
  onClose,
  onSuccess,
}: {
  jobPosts: JobPost[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [jobPostId, setJobPostId] = useState<string>("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [internalHrNotes, setInternalHrNotes] = useState("");
  const [platformSource, setPlatformSource] = useState<
    | PlatformSource.ZALO
    | PlatformSource.FACEBOOK
    | PlatformSource.REFERRAL
    | PlatformSource.MANUAL_ENTRY
  >(PlatformSource.MANUAL_ENTRY);

  const [submitManual, { isLoading: isSubmitting }] =
    useSubmitCandidateManualMutation();

  const isProcessing = isSubmitting;

  const jobOptions = useMemo<SelectOption<string>[]>(
    () =>
      jobPosts.map((j) => ({
        value: j.id,
        label: `[${j.jobCode}] ${j.publicTitle}`,
        description: `${j.level} · ${j.specialization || "Chuyên môn"}`,
      })),
    [jobPosts],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        gooeyToast.error("Dung lượng file CV tối đa là 15MB.");
        return;
      }
      setCvFile(file);
    }
  };

  const normalizeUrl = (url: string): string | undefined => {
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim().replace(/[\s.-]/g, "");

    if (!cleanFullName || !cleanEmail || !cleanPhone || !jobPostId || !cvFile) {
      gooeyToast.error("Vui lòng điền đủ các trường bắt buộc và chọn file CV.");
      return;
    }

    try {
      const cleanProfile = normalizeUrl(profileUrl);
      const isLinkedIn = cleanProfile?.toLowerCase().includes("linkedin.com");

      // Gửi file CV thật kèm theo trong CÙNG 1 request multipart - backend tự upload lên S3
      // và trả về fileKey/cvUrl thật. Không tự đoán/tạo fileKey ở FE để tránh submit CV "ma"
      // (chưa từng tồn tại trên storage) khi có lỗi mạng.
      const formData = new FormData();
      formData.append("cvFile", cvFile);
      formData.append("jobPostId", jobPostId);
      formData.append("fullName", cleanFullName);
      formData.append("email", cleanEmail);
      formData.append("phoneNumber", cleanPhone);
      formData.append("platformSource", platformSource);
      if (isLinkedIn && cleanProfile) {
        formData.append("linkedInUrl", cleanProfile);
      } else if (cleanProfile) {
        formData.append("portfolioUrl", cleanProfile);
      }
      if (internalHrNotes.trim()) {
        formData.append("internalHrNotes", internalHrNotes.trim());
      }

      await submitManual(formData).unwrap();

      gooeyToast.success(
        "Đã ghi nhận ứng viên và chuyển tiếp vào AI Screening!",
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const rawMsg = err?.data?.message || err?.message;
      const displayMsg = Array.isArray(rawMsg)
        ? rawMsg.join(", ")
        : typeof rawMsg === "string"
          ? rawMsg
          : "Lỗi khi nhập hồ sơ ứng viên.";
      gooeyToast.error(displayMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/30 transition-opacity p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Thêm Ứng Viên Thủ Công
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tải lên CV và kết nối trực tiếp vào tin tuyển dụng đang mở
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Vị trí tuyển dụng <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={jobOptions}
              value={jobPostId}
              onChange={(val) => setJobPostId(val || "")}
              placeholder="Chọn vị trí đang tuyển..."
              searchPlaceholder="Tìm mã tin, tên vị trí..."
              disabled={isProcessing}
              isClearable
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Họ và tên ứng viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="input-base w-full text-xs"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912345678"
                className="input-base w-full text-xs font-mono"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ungvien@gmail.com"
              className="input-base w-full text-xs font-mono"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Upload size={13} className="text-primary" /> Đính kèm file CV{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-input rounded-md bg-background hover:bg-muted/30 transition-colors cursor-pointer text-xs text-muted-foreground">
                <Upload size={14} className="text-primary" />
                <span className="truncate">
                  {cvFile ? cvFile.name : "Chọn file CV (PDF, DOCX, DOC)..."}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
              {cvFile && (
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="text-xs text-red-600 hover:underline px-2 cursor-pointer"
                  disabled={isProcessing}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <LinkIcon size={13} className="text-primary" /> Link hồ sơ cá nhân
              (LinkedIn, Portfolio, GitHub)
            </label>
            <input
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://linkedin.com/in/... hoặc portfolio.dev"
              className="input-base w-full text-xs font-mono"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Nguồn tiếp nhận
              </label>
              <SearchableSelect
                options={MANUAL_PLATFORM_OPTIONS}
                value={platformSource}
                onChange={(val) =>
                  setPlatformSource(
                    (val as
                      | PlatformSource.ZALO
                      | PlatformSource.FACEBOOK
                      | PlatformSource.REFERRAL
                      | PlatformSource.MANUAL_ENTRY) ||
                      PlatformSource.MANUAL_ENTRY,
                  )
                }
                placeholder="Chọn nguồn..."
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Ghi chú nội bộ
              </label>
              <input
                type="text"
                value={internalHrNotes}
                onChange={(e) => setInternalHrNotes(e.target.value)}
                placeholder="Đánh giá sơ bộ..."
                className="input-base w-full text-xs"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="btn-secondary flex-1 text-xs h-9 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                !fullName.trim() ||
                !email.trim() ||
                !phoneNumber.trim() ||
                !jobPostId ||
                !cvFile ||
                isProcessing
              }
              className="btn-primary flex-1 text-xs h-9 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {isProcessing ? "Đang gửi hồ sơ..." : "Xác nhận thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CandidatesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useMemo(() => pathname.split("/")[1] || "vi", [pathname]);

  useSyncAtsEventsQuery();

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const [globalFilter, setGlobalFilter] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get("status")?.split(",").filter(Boolean) || [],
  );
  const [platformFilter, setPlatformFilter] = useState<string[]>(
    searchParams.get("platform")?.split(",").filter(Boolean) || [],
  );
  const [jobPostFilter, setJobPostFilter] = useState<string[]>(
    searchParams.get("job")?.split(",").filter(Boolean) || [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: Math.max(0, parseInt(searchParams.get("page") || "1", 10) - 1),
    pageSize: parseInt(searchParams.get("limit") || "10", 10),
  });

  const { data: jobPostsRes } = useGetJobPostsQuery({ limit: 100 });
  const rawJobPosts: JobPost[] = jobPostsRes?.data || [];

  const jobPostOptions = useMemo(
    () =>
      rawJobPosts.map((j) => ({
        value: j.id,
        label: `[${j.jobCode}] ${j.publicTitle}`,
        count: 0,
      })),
    [rawJobPosts],
  );

  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: globalFilter.trim() || undefined,
      status:
        statusFilter.length === 1
          ? (statusFilter[0] as ApplicationStatus)
          : undefined,
      platform:
        platformFilter.length === 1
          ? (platformFilter[0] as PlatformSource)
          : undefined,
      jobPostId: jobPostFilter.length === 1 ? jobPostFilter[0] : undefined,
    };
  }, [pagination, globalFilter, statusFilter, platformFilter, jobPostFilter]);

  const {
    data: listRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetCandidatesQuery(queryParams);

  const isDataLoading = isLoading || isFetching;
  const candidatesData: Candidate[] = listRes?.data || [];
  const totalRows =
    listRes?.meta?.total || listRes?.meta?.pagination?.total || 0;
  const pageCount =
    listRes?.meta?.totalPages || listRes?.meta?.pagination?.total_page || 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (globalFilter.trim()) params.set("q", globalFilter.trim());
      if (statusFilter.length) params.set("status", statusFilter.join(","));
      if (platformFilter.length)
        params.set("platform", platformFilter.join(","));
      if (jobPostFilter.length) params.set("job", jobPostFilter.join(","));

      if (pagination.pageIndex > 0) {
        params.set("page", (pagination.pageIndex + 1).toString());
      }
      if (pagination.pageSize !== 10) {
        params.set("limit", pagination.pageSize.toString());
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(targetUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    globalFilter,
    statusFilter,
    platformFilter,
    jobPostFilter,
    pagination,
    pathname,
    router,
  ]);

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const columns = useMemo<ColumnDef<StockFeatures, Candidate, any>[]>(
    () => [
      {
        id: "select",
        size: 40,
        meta: { title: "Chọn" },
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
        accessorKey: "fullName",
        size: 240,
        meta: { title: "Họ và tên ứng viên" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Ứng viên</SortHeader>
        ),
        cell: ({ row }: any) => {
          const c: Candidate = row.original;
          return (
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                {c.fullName ? c.fullName.slice(0, 2).toUpperCase() : "UV"}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs text-foreground truncate">
                  {c.fullName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 truncate">
                  {c.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail size={10} /> {c.email}
                    </span>
                  )}
                  {c.phoneNumber && (
                    <span className="font-mono flex items-center gap-0.5 shrink-0">
                      <Phone size={9} /> {c.phoneNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "activeJob",
        size: 210,
        meta: { title: "Vị trí ứng tuyển gần nhất" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Vị trí ứng tuyển
          </span>
        ),
        cell: ({ row }: any) => {
          const apps = row.original.applications || [];
          const latestApp = apps[0];
          if (!latestApp)
            return (
              <span className="text-xs text-muted-foreground italic">
                Chưa nộp đơn
              </span>
            );

          return (
            <div className="min-w-0">
              <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                {latestApp.jobPost?.jobCode || "JOB"}
              </span>
              <p
                className="font-medium text-xs text-foreground truncate mt-0.5"
                title={latestApp.jobPost?.publicTitle}
              >
                {latestApp.jobPost?.publicTitle || "Bản tin tuyển dụng"}
              </p>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "submissionInfo",
        size: 210,
        meta: { title: "Nguồn & Thời gian nộp" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Nguồn &amp; Thời gian nộp
          </span>
        ),
        cell: ({ row }: any) => {
          const apps = row.original.applications || [];
          const latestApp = apps[0];
          const latestSub = latestApp?.submissions?.[0];
          const submissionDate = latestSub?.createdAt || latestApp?.createdAt;
          const isPurged = Boolean(latestSub?.isCvPurged);

          const latestSource: PlatformSource =
            latestSub?.platformSource || PlatformSource.MANUAL_ENTRY;
          const cfg =
            PLATFORM_CONFIG[latestSource] ||
            PLATFORM_CONFIG[PlatformSource.MANUAL_ENTRY];

          return (
            <div className="flex flex-col gap-1 items-start min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.text}`}
                >
                  {cfg.label}
                </span>
                {isPurged && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 ">
                    <FileX size={9} /> Đã xóa S3
                  </span>
                )}
                {!isPurged && latestSub?.cvPurgeAt && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 "
                    title={`CV sẽ tự động bị xóa vào ${new Date(
                      latestSub.cvPurgeAt,
                    ).toLocaleDateString("vi-VN")}`}
                  >
                    <Clock size={9} /> Sắp xóa
                  </span>
                )}
              </div>

              {submissionDate && (
                <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <Clock size={10} className="shrink-0" />
                  <span>
                    {new Date(submissionDate).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "status",
        size: 190,
        meta: { title: "Trạng thái & Đánh giá AI" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">
            Tiến trình &amp; AI Sàng lọc
          </span>
        ),
        cell: ({ row }: any) => {
          const apps = row.original.applications || [];
          const latestApp = apps[0];
          const latestStatus: ApplicationStatus =
            latestApp?.status || ApplicationStatus.APPLIED;
          const cfg =
            APPLICATION_STATUS_CONFIG[latestStatus] ||
            APPLICATION_STATUS_CONFIG[ApplicationStatus.APPLIED];

          const hasAiScore =
            typeof latestApp?.aiScore === "number" && latestApp.aiScore >= 0;
          const score = hasAiScore ? latestApp.aiScore : null;

          const tierBg =
            latestApp?.aiTier === AiScreeningTier.HIGH || (score && score >= 80)
              ? "bg-emerald-500 text-white"
              : latestApp?.aiTier === AiScreeningTier.MEDIUM ||
                  (score && score >= 50)
                ? "bg-amber-500 text-white"
                : "bg-rose-500 text-white";

          return (
            <div className="flex flex-col gap-1 items-start">
              <span
                className={`px-2 py-0.5 rounded text-[10px] border ${cfg.className}`}
              >
                {cfg.label}
              </span>

              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                    hasAiScore ? tierBg : "bg-muted text-muted-foreground"
                  }`}
                >
                  {hasAiScore ? `${score}%` : "N/A"}
                </span>
                <span className="text-muted-foreground text-[9px] flex items-center gap-0.5">
                  <BrainCircuit size={10} className="text-primary" /> AI Match
                </span>
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "experienceYears",
        size: 90,
        meta: { title: "Kinh nghiệm" },
        header: ({ column }: any) => (
          <SortHeader column={column}>Kinh nghiệm</SortHeader>
        ),
        cell: ({ getValue }: any) => (
          <span className="text-xs text-foreground font-medium">
            {getValue() ?? 0} năm
          </span>
        ),
      },
      {
        id: "totalApps",
        size: 80,
        meta: { title: "Số tin đã nộp" },
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground text-center block w-full">
            Đã nộp
          </span>
        ),
        cell: ({ row }: any) => {
          const count = row.original.applications?.length || 0;
          return (
            <div className="text-center">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {count} tin
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        size: 110,
        meta: { title: "Thao tác" },
        header: () => null,
        cell: ({ row }: any) => {
          const c: Candidate = row.original;
          const apps = c.applications || [];
          const latestApp = apps[0];
          const latestSub = latestApp?.submissions?.[0];

          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedCandidateId(c.id)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border cursor-pointer"
                title="Xem nhanh Drawer"
              >
                <Eye size={13} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (latestApp?.id) params.set("appId", latestApp.id);
                  if (latestSub?.id) params.set("submissionId", latestSub.id);
                  const q = params.toString() ? `?${params.toString()}` : "";
                  router.push(
                    `/${locale}/ats/candidate-management/${c.id}/cv${q}`,
                  );
                }}
                className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors border border-transparent hover:border-primary/20 cursor-pointer"
                title="Thẩm định CV & Đánh giá AI"
              >
                <FileText size={13} />
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/${locale}/ats/candidate-management/${c.id}`)
                }
                className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors border border-transparent hover:border-primary/20 cursor-pointer"
                title="Chi tiết hồ sơ ứng viên"
              >
                <ExternalLink size={13} />
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [locale, router],
  );

  const statusOptions = useMemo(
    () =>
      Object.entries(APPLICATION_STATUS_CONFIG).map(([val, cfg]) => ({
        value: val,
        label: cfg.label,
        count: 0,
      })),
    [],
  );

  const platformOptions = useMemo(
    () =>
      Object.entries(PLATFORM_CONFIG).map(([val, cfg]) => ({
        value: val,
        label: cfg.label,
        count: 0,
      })),
    [],
  );

  const activeFilterCount =
    statusFilter.length + platformFilter.length + jobPostFilter.length;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter([]);
    setPlatformFilter([]);
    setJobPostFilter([]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const facetFiltersNode = (
    <div className="flex items-center gap-2 flex-wrap">
      <FacetFilter
        label="Vị trí tuyển"
        options={jobPostOptions}
        selected={jobPostFilter}
        onChange={(v) => handleFilterChange(setJobPostFilter, v)}
      />
      <FacetFilter
        label="Nguồn ứng tuyển"
        options={platformOptions}
        selected={platformFilter}
        onChange={(v) => handleFilterChange(setPlatformFilter, v)}
      />
      <FacetFilter
        label="Vòng tuyển dụng"
        options={statusOptions}
        selected={statusFilter}
        onChange={(v) => handleFilterChange(setStatusFilter, v)}
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
      <div className="flex-shrink-0 px-4 md:px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-base md:text-lg font-bold text-foreground">
              Quản Lý Ứng Viên
            </h1>
            <p className="text-xs text-muted-foreground">
              {totalRows} ứng viên · Theo dõi hồ sơ, nguồn nộp &amp; quy trình
              phỏng vấn
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await new Promise((r) => setTimeout(r, 1000));
                return "Danh_sach_ung_vien_2026.xlsx";
              }}
              loadingMessage="Đang xuất file..."
              successMessage={(f) => `Đã xuất ${f}`}
            >
              <Download size={14} /> Xuất Excel
            </ActionButton>

            <ActionButton
              variant="ghost"
              className="hidden sm:flex !h-8 !px-3 !text-xs !font-medium"
              isLoading={isDataLoading}
              onAction={async () => {
                await refetch();
              }}
              loadingMessage="Đang làm mới..."
              successMessage="Dữ liệu đã cập nhật"
            >
              <RefreshCw size={14} /> Làm mới
            </ActionButton>

            <ActionButton
              variant="primary"
              className="!h-8 !px-3 !py-0 !text-xs"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Thêm ứng viên</span>
              <span className="sm:hidden">Thêm</span>
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto md:hidden px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {totalRows} ứng viên
          </span>
          {mobileFacetFiltersNode}
        </div>
        <div className="relative mb-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) =>
              handleFilterChange(setGlobalFilter, e.target.value)
            }
            placeholder="Tìm theo tên, email, kỹ năng..."
            className="input-base pl-9 py-1.5 text-xs w-full"
          />
        </div>
        {candidatesData.length === 0 && !isDataLoading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Search size={32} className="text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Không tìm thấy ứng viên
            </p>
          </div>
        ) : (
          candidatesData.map((c: Candidate) => {
            const latestApp = c.applications?.[0];
            const latestSub = latestApp?.submissions?.[0];
            const submissionDate = latestSub?.createdAt || latestApp?.createdAt;
            const isPurged = Boolean(latestSub?.isCvPurged);

            const statusInfo =
              APPLICATION_STATUS_CONFIG[
                (latestApp?.status as ApplicationStatus) ||
                  ApplicationStatus.APPLIED
              ];

            const pCfg =
              PLATFORM_CONFIG[latestSub?.platformSource as PlatformSource] ||
              PLATFORM_CONFIG[PlatformSource.MANUAL_ENTRY];

            const score = latestApp?.aiScore;
            const hasAiScore = typeof score === "number" && score >= 0;

            const tierBg =
              latestApp?.aiTier === AiScreeningTier.HIGH ||
              (score && score >= 80)
                ? "bg-emerald-500 text-white"
                : latestApp?.aiTier === AiScreeningTier.MEDIUM ||
                    (score && score >= 50)
                  ? "bg-amber-500 text-white"
                  : "bg-rose-500 text-white";

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCandidateId(c.id)}
                className="bg-card border border-border/70 rounded-xl p-3.5 space-y-3 cursor-pointer hover:border-primary/40 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                      {c.fullName ? c.fullName.slice(0, 2).toUpperCase() : "UV"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">
                        {c.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                        {c.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail size={10} /> {c.email}
                          </span>
                        )}
                        {c.phoneNumber && (
                          <span className="font-mono flex items-center gap-0.5 shrink-0">
                            <Phone size={9} /> {c.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${statusInfo.className} text-[10px] shrink-0 border`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {latestApp && (
                  <div className="space-y-1.5 pt-2 border-t border-border/40 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <Briefcase
                          size={11}
                          className="text-muted-foreground shrink-0"
                        />
                        <span className="font-medium text-foreground truncate">
                          {latestApp.jobPost?.publicTitle ||
                            "Bản tin tuyển dụng"}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20 shrink-0">
                        {latestApp.jobPost?.jobCode || "JOB"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold ${pCfg.bg} ${pCfg.text}`}
                        >
                          {pCfg.label}
                        </span>
                        {isPurged && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-rose-600 bg-rose-50  px-1.5 py-0.2 rounded border border-rose-200">
                            <FileX size={9} /> Đã xóa S3
                          </span>
                        )}
                        {!isPurged && latestSub?.cvPurgeAt && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200"
                            title={`CV sẽ tự động bị xóa vào ${new Date(
                              latestSub.cvPurgeAt,
                            ).toLocaleDateString("vi-VN")}`}
                          >
                            <Clock size={9} /> Sắp xóa
                          </span>
                        )}
                      </div>

                      {submissionDate && (
                        <span className="font-mono flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(submissionDate).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                        hasAiScore ? tierBg : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {hasAiScore ? `${score}%` : "N/A"}
                    </span>
                    <span className="text-muted-foreground">
                      {c.applications?.length || 0} lượt nộp
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const params = new URLSearchParams();
                        if (latestApp?.id) params.set("appId", latestApp.id);
                        if (latestSub?.id)
                          params.set("submissionId", latestSub.id);
                        const q = params.toString()
                          ? `?${params.toString()}`
                          : "";
                        router.push(
                          `/${locale}/ats/candidate-management/${c.id}/cv${q}`,
                        );
                      }}
                      className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20"
                      title="Thẩm định CV & Đánh giá AI"
                    >
                      <FileText size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/${locale}/ats/candidate-management/${c.id}`,
                        );
                      }}
                      className="p-1.5 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                      title="Chi tiết hồ sơ"
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex-col hidden md:flex">
        <DataTable
          columns={columns}
          data={candidatesData}
          pageCount={pageCount}
          totalRows={totalRows}
          globalFilter={globalFilter}
          onGlobalFilterChange={(v) => handleFilterChange(setGlobalFilter, v)}
          pagination={pagination}
          onPaginationChange={setPagination}
          facetFilters={facetFiltersNode}
          mobileFacetFilters={mobileFacetFiltersNode}
          isLoading={isDataLoading}
          skeletonRowCount={8}
          enableMultiRowSelection={true}
          onRowClick={(row) => setSelectedCandidateId(row.original.id)}
        />
      </div>

      <CandidateDrawer
        candidateId={selectedCandidateId}
        isOpen={Boolean(selectedCandidateId)}
        onClose={() => setSelectedCandidateId(null)}
        locale={locale}
      />

      {showAddModal && (
        <AddManualCandidateModal
          jobPosts={rawJobPosts}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
