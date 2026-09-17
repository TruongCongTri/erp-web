// lib/store/atsApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, getCookie } from "./baseQuery";
import { SingleResponse, AuthUser } from "@/types/modelsver2";
import { io, Socket } from "socket.io-client";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ==========================================
// 1. CORE DATA STRUCTURES & ENUMS
// ==========================================
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  pagination?: {
    total: number;
    total_page: number;
    current_page: number;
    per_page: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export enum RecruitmentRequestStatus {
  PENDING_HR = "PENDING_HR",
  DRAFTED = "DRAFTED",
  PENDING_HEAD_APPROVAL = "PENDING_HEAD_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum JobPostStatus {
  DRAFT = "DRAFT",
  PENDING_HEAD_APPROVAL = "PENDING_HEAD_APPROVAL",
  PUBLISHED = "PUBLISHED",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED",
}

export enum JobPostCreationMethod {
  MANUAL = "MANUAL",
  FROM_TEMPLATE = "FROM_TEMPLATE",
  AI_SUGGESTION = "AI_SUGGESTION",
}

export enum JobLevel {
  INTERN = "INTERN",
  FRESHER = "FRESHER",
  JUNIOR = "JUNIOR",
  MIDDLE = "MIDDLE",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
  MANAGER = "MANAGER",
  DIRECTOR = "DIRECTOR",
}

export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  SEASONAL = "SEASONAL",
}

export enum WorkingModel {
  ON_SITE = "ON_SITE",
  HYBRID = "HYBRID",
  REMOTE = "REMOTE",
}

export enum EducationLevel {
  HIGH_SCHOOL = "HIGH_SCHOOL",
  VOCATIONAL = "VOCATIONAL",
  COLLEGE = "COLLEGE",
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
  DOCTORATE = "DOCTORATE",
  NOT_REQUIRED = "NOT_REQUIRED",
}

export enum CandidateGender {
  ANY = "ANY",
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum PlatformSource {
  COMPANY_WEBSITE = "COMPANY_WEBSITE",
  LINKEDIN = "LINKEDIN",
  TOPCV = "TOPCV",
  VIETNAMWORKS = "VIETNAMWORKS",
  CAREERVIET = "CAREERVIET",
  FACEBOOK = "FACEBOOK",
  ZALO = "ZALO",
  REFERRAL = "REFERRAL",
  MANUAL_ENTRY = "MANUAL_ENTRY",
}

export enum ApplicationPhase {
  APPLIED = "APPLIED",
  AI_SCREENING = "AI_SCREENING",
  SCREENING_FAILED = "SCREENING_FAILED", // Technical failure during screening (not an AI rejection)
  SHORTLISTED = "SHORTLISTED", // High Tier (score >= 80)
  SAVED_POOL = "SAVED_POOL", // Middle Tier (score 50 - 79)
  SCREENING_REJECTED = "SCREENING_REJECTED", // Low Tier (score < 50)
  INTERVIEWING = "INTERVIEWING",
  OFFERED = "OFFERED",
  HIRED = "HIRED",
  WITHDRAWN = "WITHDRAWN",
}

export const ApplicationStatus = ApplicationPhase;
export type ApplicationStatus = ApplicationPhase;

export enum AiScreeningTier {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

// Valid PATCH /ats/applications/:id/phase targets per current phase.
// SCREENING_FAILED -> AI_SCREENING is intentionally excluded here since that
// transition only happens via POST /ats/applications/:id/rescreen.
export const APPLICATION_PHASE_TRANSITIONS: Record<
  ApplicationPhase,
  ApplicationPhase[]
> = {
  [ApplicationPhase.APPLIED]: [
    ApplicationPhase.AI_SCREENING,
    ApplicationPhase.SHORTLISTED,
    ApplicationPhase.SAVED_POOL,
    ApplicationPhase.SCREENING_REJECTED,
    ApplicationPhase.WITHDRAWN,
  ],
  [ApplicationPhase.AI_SCREENING]: [
    ApplicationPhase.SHORTLISTED,
    ApplicationPhase.SAVED_POOL,
    ApplicationPhase.SCREENING_REJECTED,
    ApplicationPhase.WITHDRAWN,
  ],
  [ApplicationPhase.SCREENING_FAILED]: [
    ApplicationPhase.SAVED_POOL,
    ApplicationPhase.SCREENING_REJECTED,
    ApplicationPhase.WITHDRAWN,
  ],
  [ApplicationPhase.SHORTLISTED]: [
    ApplicationPhase.INTERVIEWING,
    ApplicationPhase.SAVED_POOL,
    ApplicationPhase.WITHDRAWN,
  ],
  [ApplicationPhase.SAVED_POOL]: [
    ApplicationPhase.SHORTLISTED,
    ApplicationPhase.INTERVIEWING,
    ApplicationPhase.SCREENING_REJECTED,
  ],
  [ApplicationPhase.SCREENING_REJECTED]: [ApplicationPhase.SAVED_POOL],
  [ApplicationPhase.INTERVIEWING]: [
    ApplicationPhase.OFFERED,
    ApplicationPhase.SAVED_POOL,
    ApplicationPhase.SCREENING_REJECTED,
    ApplicationPhase.WITHDRAWN,
  ],
  [ApplicationPhase.OFFERED]: [
    ApplicationPhase.HIRED,
    ApplicationPhase.WITHDRAWN,
  ],
  [ApplicationPhase.HIRED]: [],
  [ApplicationPhase.WITHDRAWN]: [],
};

// ========================================================
// 2. DOMAIN ENTITY INTERFACES
// ========================================================
export interface WorkLocation {
  label: string;
  address: string;
}

export function getDeptName(
  department: string | { id?: string; name: string } | null | undefined,
  fallback = "Chưa gán ban",
): string {
  if (!department) return fallback;
  return typeof department === "string" ? department : department.name;
}

export interface RecruitmentRequest {
  id: string;
  requestCode?: string;

  // Nội bộ
  jobTitle?: string;
  department?: string | { id?: string; name: string };
  reasonForHiring?: string;
  targetSalaryMin?: number;
  targetSalaryMax?: number;

  // Dữ liệu thô và AI
  rawRequestNote?: string;
  rawRequirements?: string;
  companyBenefits?: string;
  aiDraftedDescription?: string;

  // Dữ liệu cấu trúc
  headcount?: number;
  deadline?: string; // ISO String
  level?: string;
  jobType?: string;
  workingModel?: string;
  location?: string;
  workingHours?: string;
  experienceYears?: number;
  educationLevel?: string;
  gender?: string;
  ageRange?: string;
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
  languages?: string;

  status: RecruitmentRequestStatus;
  rejectionReason?: string;
  requester: AuthUser;
  jobPost?: JobPost;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPost {
  id: string;
  jobCode: string;
  isTemplate: boolean;
  creationMethod: JobPostCreationMethod;
  status: JobPostStatus;

  // 1. Thông tin chung
  publicTitle: string;
  specialization: string;
  domainKnowledge: string;
  level: JobLevel;
  jobType: JobType;
  workingModel: WorkingModel;
  salaryMin: number;
  salaryMax: number;
  isSalaryNegotiable: boolean;

  // 2. Mô tả công việc
  jobDescription: string;
  requirements: string;
  benefits: string;
  extraBenefits?: string | null;
  workLocations: WorkLocation[];
  workingHoursStandard: string;
  workingHoursDetail: string;

  // 3. Kỳ vọng ứng viên
  minEducation: EducationLevel;
  experienceYears: number;
  gender: CandidateGender;
  ageMin?: number | null;
  ageMax?: number | null;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  languages: string[];

  // 4. Thông tin nhận hồ sơ
  applicationDeadline: string;
  headcount: number;
  hrRecipientName: string;
  hrRecipientPhone: string;
  hrRecipientEmail: string;
  campaignName?: string | null;

  // 5. Đa kênh & Scheduling
  targetPlatforms: PlatformSource[];
  scheduledPublishAt?: string | null;
  publishedAt?: string | null;
  externalMapping: Record<string, string>;

  // Quan hệ
  recruitmentRequestId?: string | null;
  recruitmentRequest?: RecruitmentRequest | null;
  applications?: JobApplication[];
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationSubmission {
  id: string;
  applicationId: string;
  platformSource: PlatformSource;
  externalApplicationId?: string | null;
  coverLetter?: string | null;
  cvUrl: string;
  cvFileKey?: string | null;
  isCvPurged?: boolean;
  cvPurgeAt?: string | null;
  cvStorageLocation?: "S3" | "LOCAL_PENDING";
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  candidateId: string;
  jobPostId: string;
  status: ApplicationPhase;
  aiScore?: number | null;
  aiReasoning?: string | null;
  aiTier?: AiScreeningTier | null;
  internalHrNotes?: string | null;
  candidate: CandidateProfile;
  jobPost: JobPost;
  submissions: ApplicationSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  phone?: string;
  headline?: string | null;
  location?: string | null;
  bio?: string | null;
  experienceYears?: number | null;
  skills?: string[];
  linkedInUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  experiences?: any[];
  workExperiences?: any[];
  workExperience?: any[];
  educations?: any[];
  education?: any[];
  certificates?: any[];
  certifications?: any[];
  applications?: JobApplication[];
  createdAt: string;
  updatedAt: string;
}

export type Candidate = CandidateProfile;

export interface AiGeneratedJdSchema {
  publicTitle: string;
  specialization: string;
  domainKnowledge: string;
  level: JobLevel;
  jobType: JobType;
  workingModel: WorkingModel;
  salaryMin: number;
  salaryMax: number;
  isSalaryNegotiable: boolean;
  jobDescription: string;
  requirements: string;
  benefits: string;
  extraBenefits?: string;
  workLocations: WorkLocation[];
  workingHoursStandard: string;
  workingHoursDetail: string;
  minEducation: EducationLevel;
  experienceYears: number;
  gender: CandidateGender;
  ageMin?: number;
  ageMax?: number;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  languages: string[];
  headcount: number;
  suggestedDeadlineDays: number;
}

// ==========================================
// 2. REQUEST PAYLOADS (DTOs)
// ==========================================

// ── Requisitions ──
export interface CreateRecruitmentRequestDto {
  rawRequestNote: string;
  departmentId?: string;
}

export interface UpdateRecruitmentRequestDto {
  rawRequestNote: string;
}

export interface ReviewRecruitmentRequestDto {
  status: RecruitmentRequestStatus.APPROVED | RecruitmentRequestStatus.REJECTED;
  rejectionReason?: string;
}

export interface QueryRecruitmentRequestDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: RecruitmentRequestStatus;
  departmentId?: string;
  requesterId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ── Job Posts ──
export interface AiSuggestJdDto {
  rawPrompt: string;
  recruitmentRequestId?: string;
}

export interface CreateJobPostDto {
  creationMethod: JobPostCreationMethod;
  recruitmentRequestId?: string;
  templateSourceId?: string;
  publicTitle: string;
  specialization: string;
  domainKnowledge: string;
  level: JobLevel;
  jobType: JobType;
  workingModel: WorkingModel;
  salaryMin: number;
  salaryMax: number;
  isSalaryNegotiable: boolean;
  jobDescription: string;
  requirements: string;
  benefits: string;
  extraBenefits?: string;
  workLocations: WorkLocation[];
  workingHoursStandard: string;
  workingHoursDetail: string;
  minEducation: EducationLevel;
  experienceYears: number;
  gender: CandidateGender;
  ageMin?: number;
  ageMax?: number;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  languages: string[];
  applicationDeadline: string;
  headcount: number;
  hrRecipientName: string;
  hrRecipientPhone: string;
  hrRecipientEmail: string;
  campaignName?: string;
  targetPlatforms: PlatformSource[];
  scheduledPublishAt?: string;
  requireHeadApproval?: boolean;
}

export type UpdateJobPostDto = Partial<CreateJobPostDto>;

export interface ReviewJobPostDto {
  isApproved: boolean;
  reviewNotes?: string;
}

export interface PublishJobPostDto {
  targetPlatforms: PlatformSource[];
  scheduledPublishAt?: string;
  bypassHeadApproval?: boolean;
}

export interface QueryJobPostDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: JobPostStatus | JobPostStatus[];
  level?: JobLevel;
  platform?: PlatformSource | PlatformSource[];
  isTemplate?: boolean;
}

// ── Candidate Ingestion & Applications ──
export interface PortalCandidateSubmissionDto {
  jobPostId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  cvUrl: string;
  cvFileKey?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
}

export interface ManualCandidateSubmissionDto extends PortalCandidateSubmissionDto {
  platformSource:
    | PlatformSource.ZALO
    | PlatformSource.FACEBOOK
    | PlatformSource.REFERRAL
    | PlatformSource.MANUAL_ENTRY;
  internalHrNotes?: string;
}

export interface QueryJobApplicationsDto {
  page?: number;
  limit?: number;
  phase?: ApplicationPhase;
  aiTier?: AiScreeningTier;
  minScore?: number;
  search?: string;
}

export interface QueryCandidatesDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: ApplicationPhase;
  platform?: PlatformSource;
  jobPostId?: string;
}

export interface UpdateApplicationPhaseDto {
  phase: ApplicationPhase;
  internalHrNotes?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationPhase;
  note?: string;
}

export interface PromoteCandidateDto {
  targetPhase?: ApplicationPhase.SHORTLISTED | ApplicationPhase.INTERVIEWING;
  note?: string;
}

// ========================================================
// 4. REDUX TOOLKIT QUERY API SLICE
// ========================================================

export const atsApiSlice = createApi({
  reducerPath: "atsApi",
  baseQuery: baseQuery,
  tagTypes: [
    "RecruitmentRequest",
    "JobPost",
    "JobApplication",
    "JobTemplate",
    "Candidate",
  ],
  endpoints: (builder) => ({
    // =====================================================
    // LAYER 1: RECRUITMENT REQUISITION (Dept Head <-> HR)
    // =====================================================
    getRecruitmentRequests: builder.query<
      PaginatedResponse<RecruitmentRequest>,
      QueryRecruitmentRequestDto | void
    >({
      query: (params) => ({
        url: "/ats/requests",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "RecruitmentRequest" as const,
                id,
              })),
              { type: "RecruitmentRequest", id: "LIST" },
            ]
          : [{ type: "RecruitmentRequest", id: "LIST" }],
    }),

    getRecruitmentRequestById: builder.query<
      SingleResponse<RecruitmentRequest>,
      string
    >({
      query: (id) => `/ats/requests/${id}`,
      providesTags: (result, error, id) => [{ type: "RecruitmentRequest", id }],
    }),

    createRecruitmentRequest: builder.mutation<
      SingleResponse<RecruitmentRequest>,
      CreateRecruitmentRequestDto
    >({
      query: (body) => ({
        url: "/ats/requests",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RecruitmentRequest", id: "LIST" }],
    }),

    updateRecruitmentRequest: builder.mutation<
      SingleResponse<RecruitmentRequest>,
      { id: string; body: UpdateRecruitmentRequestDto }
    >({
      query: ({ id, body }) => ({
        url: `/ats/requests/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RecruitmentRequest", id },
        { type: "RecruitmentRequest", id: "LIST" },
      ],
    }),

    reviewRecruitmentRequest: builder.mutation<
      SingleResponse<RecruitmentRequest>,
      { id: string; body: ReviewRecruitmentRequestDto }
    >({
      query: ({ id, body }) => ({
        url: `/ats/requests/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RecruitmentRequest", id },
        { type: "RecruitmentRequest", id: "LIST" },
      ],
    }),

    cancelRecruitmentRequest: builder.mutation<
      SingleResponse<RecruitmentRequest>,
      string
    >({
      query: (id) => ({
        url: `/ats/requests/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "RecruitmentRequest", id },
        { type: "RecruitmentRequest", id: "LIST" },
      ],
    }),

    // =====================================================
    // LAYER 2: JOB AUTHORING, AI DRAFTING & PUBLISHING
    // =====================================================

    aiSuggestJd: builder.mutation<
      SingleResponse<AiGeneratedJdSchema>,
      AiSuggestJdDto
    >({
      query: (body) => ({
        url: "/job-posts/ai-suggest",
        method: "POST",
        body,
      }),
    }),

    getJobTemplates: builder.query<SingleResponse<JobPost[]>, void>({
      query: () => "/job-posts/templates",
      providesTags: [{ type: "JobTemplate", id: "LIST" }],
    }),

    getJobPosts: builder.query<
      PaginatedResponse<JobPost>,
      QueryJobPostDto | void
    >({
      query: (params) => {
        if (!params) {
          return {
            url: "/job-posts",
            method: "GET",
          };
        }

        // Làm sạch params: loại bỏ undefined, null, chuỗi rỗng và mảng rỗng
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanParams: Record<string, any> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                cleanParams[key] = value;
              }
            } else {
              cleanParams[key] = value;
            }
          }
        });

        return {
          url: "/job-posts",
          method: "GET",
          params: cleanParams,
        };
      },
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({
                type: "JobPost" as const,
                id,
              })),
              { type: "JobPost" as const, id: "LIST" },
            ]
          : [{ type: "JobPost" as const, id: "LIST" }],
    }),

    getJobPostById: builder.query<SingleResponse<JobPost>, string>({
      query: (id) => `/job-posts/${id}`,
      providesTags: (result, error, id) => [{ type: "JobPost", id }],
    }),

    createJobPost: builder.mutation<SingleResponse<JobPost>, CreateJobPostDto>({
      query: (body) => ({
        url: "/job-posts",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "JobPost", id: "LIST" },
        { type: "RecruitmentRequest", id: "LIST" },
      ],
    }),

    updateJobPost: builder.mutation<
      SingleResponse<JobPost>,
      { id: string; body: UpdateJobPostDto }
    >({
      query: ({ id, body }) => ({
        url: `/job-posts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobPost", id },
        { type: "JobPost", id: "LIST" },
      ],
    }),

    requestJobApproval: builder.mutation<SingleResponse<JobPost>, string>({
      query: (id) => ({
        url: `/job-posts/${id}/request-approval`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "JobPost", id },
        { type: "JobPost", id: "LIST" },
      ],
    }),

    reviewJobByHead: builder.mutation<
      SingleResponse<JobPost>,
      { id: string; body: ReviewJobPostDto }
    >({
      query: ({ id, body }) => ({
        url: `/job-posts/${id}/head-review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobPost", id },
        { type: "JobPost", id: "LIST" },
        { type: "RecruitmentRequest", id: "LIST" },
      ],
    }),

    publishJobPost: builder.mutation<
      SingleResponse<JobPost>,
      { id: string; body: PublishJobPostDto }
    >({
      query: ({ id, body }) => ({
        url: `/job-posts/${id}/publish`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        // { type: "JobPost", id },
        { type: "JobPost", id: "LIST" },
        { type: "JobTemplate", id: "LIST" },
      ],
    }),

    closeJobPost: builder.mutation<SingleResponse<JobPost>, string>({
      query: (id) => ({
        url: `/job-posts/${id}/close`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "JobPost", id },
        { type: "JobPost", id: "LIST" },
      ],
    }),

    // =====================================================
    // LAYER 3 & 4: INGESTION, PIPELINE KANBAN & SCREENING
    // =====================================================
    getCandidates: builder.query<
      PaginatedResponse<CandidateProfile>,
      QueryCandidatesDto | void
    >({
      query: (params) => {
        if (!params) {
          return {
            url: "/ats/candidates",
            method: "GET",
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanParams: Record<string, any> = {};
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            cleanParams[key] = value;
          }
        });

        return {
          url: "/ats/candidates",
          method: "GET",
          params: cleanParams,
        };
      },
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({
                type: "Candidate" as const,
                id,
              })),
              { type: "Candidate" as const, id: "LIST" },
            ]
          : [{ type: "Candidate" as const, id: "LIST" }],
    }),

    getCandidateById: builder.query<SingleResponse<CandidateProfile>, string>({
      query: (id) => `/ats/candidates/${id}`,
      providesTags: (result, error, id) => [{ type: "Candidate", id }],
    }),

    submitCandidatePortal: builder.mutation<
      SingleResponse<{ applicationId: string; submissionId: string }>,
      PortalCandidateSubmissionDto
    >({
      query: (body) => ({
        url: "/ats/submissions/portal",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "JobApplication", id: "LIST" },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    // Thêm endpoint upload CV cho ATS Submissions
    uploadSubmissionCv: builder.mutation<
      SingleResponse<{ url: string; fileKey: string; key?: string }>,
      FormData
    >({
      query: (formData) => ({
        url: "/ats/submissions/upload",
        method: "POST",
        body: formData,
      }),
    }),

    // Gửi kèm FormData (bao gồm file cvFile thật) - backend tự upload S3 và trả về
    // fileKey/cvUrl THẬT trong cùng 1 lượt gọi, tránh race condition giữa upload và submit.
    submitCandidateManual: builder.mutation<
      SingleResponse<{ applicationId: string; submissionId: string }>,
      FormData
    >({
      query: (formData) => ({
        url: "/ats/submissions/manual",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        { type: "JobApplication", id: "LIST" },
        { type: "JobPost", id: "LIST" },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    getJobApplications: builder.query<
      PaginatedResponse<JobApplication>,
      { jobPostId: string; params?: QueryJobApplicationsDto }
    >({
      query: ({ jobPostId, params }) => ({
        url: `/ats/jobs/${jobPostId}/applications`,
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "JobApplication" as const,
                id,
              })),
              { type: "JobApplication", id: "LIST" },
            ]
          : [{ type: "JobApplication", id: "LIST" }],
    }),

    getApplicationById: builder.query<SingleResponse<JobApplication>, string>({
      query: (id) => `/ats/applications/${id}`,
      providesTags: (result, error, id) => [{ type: "JobApplication", id }],
    }),

    getApplicationSubmissions: builder.query<
      SingleResponse<ApplicationSubmission[]>,
      string
    >({
      query: (applicationId) =>
        `/ats/applications/${applicationId}/submissions`,
      providesTags: (result, error, id) => [{ type: "JobApplication", id }],
    }),

    updateApplicationPhase: builder.mutation<
      SingleResponse<JobApplication>,
      { id: string; body: UpdateApplicationPhaseDto }
    >({
      query: ({ id, body }) => ({
        url: `/ats/applications/${id}/phase`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobApplication", id },
        { type: "JobApplication", id: "LIST" },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    updateApplicationStatus: builder.mutation<
      SingleResponse<JobApplication>,
      { applicationId: string; body: UpdateApplicationStatusDto }
    >({
      query: ({ applicationId, body }) => ({
        url: `/ats/applications/${applicationId}/phase`,
        method: "PATCH",
        body: {
          phase: body.status,
          internalHrNotes: body.note,
        },
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        { type: "JobApplication", id: applicationId },
        { type: "JobApplication", id: "LIST" },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    promoteCandidateFromPool: builder.mutation<
      SingleResponse<JobApplication>,
      { id: string; body: PromoteCandidateDto }
    >({
      query: ({ id, body }) => ({
        url: `/ats/applications/${id}/promote`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "JobApplication", id },
        { type: "JobApplication", id: "LIST" },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    rescreenApplication: builder.mutation<SingleResponse<JobApplication>, string>({
      query: (id) => ({
        url: `/ats/applications/${id}/rescreen`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "JobApplication", id },
        { type: "JobApplication", id: "LIST" },
        { type: "Candidate", id: "LIST" },
      ],
    }),

    deleteSubmissionCv: builder.mutation<
      SingleResponse<Partial<ApplicationSubmission>>,
      { applicationId: string; submissionId: string }
    >({
      query: ({ applicationId, submissionId }) => ({
        url: `/ats/applications/${applicationId}/submissions/${submissionId}/cv`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        { type: "JobApplication", id: applicationId },
      ],
    }),

    // =====================================================
    // LAYER 5: WEBSOCKET SYNC VIRTUAL QUERY
    // =====================================================
    syncAtsEvents: builder.query<boolean, void>({
      queryFn: () => ({ data: true }),
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const token = getCookie("accessToken");
        if (!token) return;

        const socket: Socket = io(
          process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000",
          {
            auth: { token },
            transports: ["websocket"],
          },
        );

        try {
          await cacheDataLoaded;
          // 1. Phê duyệt JD từ Trưởng phòng
          socket.on(
            "job_post.approval_requested",
            (data: {
              jobCode: string;
              publicTitle: string;
              jobPostId: string;
            }) => {
              gooeyToast.info(
                `Yêu cầu xét duyệt JD: [${data.jobCode}] - ${data.publicTitle}`,
              );
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobPost", id: data.jobPostId },
                  { type: "JobPost", id: "LIST" },
                ]),
              );
            },
          );
          // 2. AI Sàng lọc CV hoàn tất (3-Tier)
          socket.on(
            "ats.cv_screened",
            (data: {
              applicationId: string;
              jobPostId: string;
              aiScore: number;
              aiTier: AiScreeningTier;
            }) => {
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobApplication", id: data.applicationId },
                  { type: "JobApplication", id: "LIST" },
                  { type: "JobPost", id: data.jobPostId },
                  { type: "Candidate", id: "LIST" },
                ]),
              );
            },
          );

          // 3. Ứng viên High Tier (>= 80) được tuyển thẳng vào phỏng vấn
          socket.on(
            "ats.candidate_shortlisted",
            (data: {
              candidateName: string;
              jobTitle: string;
              aiScore: number;
              applicationId: string;
            }) => {
              gooeyToast.success(
                `Ứng viên xuất sắc (${data.aiScore}/100đ): ${data.candidateName} - Vị trí: ${data.jobTitle}`,
              );
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobApplication", id: data.applicationId },
                  { type: "JobApplication", id: "LIST" },
                  { type: "Candidate", id: "LIST" },
                ]),
              );
            },
          );

          // 4. Ứng viên Low Tier (< 50đ) bị từ chối tự động
          socket.on(
            "ats.candidate_rejected",
            (data: {
              candidateName: string;
              aiScore: number;
              applicationId: string;
            }) => {
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobApplication", id: data.applicationId },
                  { type: "JobApplication", id: "LIST" },
                  { type: "Candidate", id: "LIST" },
                ]),
              );
            },
          );

          // 5. Ứng viên được vớt từ Saved Pool
          socket.on(
            "ats.candidate_promoted",
            (data: { applicationId: string; candidateName?: string }) => {
              gooeyToast.success(
                `Hồ sơ ${data.candidateName || ""} đã được đưa vào vòng phỏng vấn`,
              );
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobApplication", id: data.applicationId },
                  { type: "JobApplication", id: "LIST" },
                  { type: "Candidate", id: "LIST" },
                ]),
              );
            },
          );

          // 6. Ứng viên nộp hồ sơ mới
          socket.on(
            "ats.cv_submitted",
            (data: { jobPostId: string; candidateName?: string }) => {
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "Candidate", id: "LIST" },
                  { type: "JobApplication", id: "LIST" },
                  { type: "JobPost", id: data.jobPostId },
                ]),
              );
            },
          );

          // 7. Chuyển trạng thái tuyển dụng thủ công
          socket.on(
            "application.phase_changed",
            (data: { applicationId: string }) => {
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobApplication", id: data.applicationId },
                  { type: "JobApplication", id: "LIST" },
                  { type: "Candidate", id: "LIST" },
                ]),
              );
            },
          );

          // 8. Requisition được tạo hoặc đổi trạng thái
          socket.on(
            "recruitment.request.created",
            (data: { requestCode: string; requesterName: string }) => {
              gooeyToast.info(
                `Yêu cầu tuyển dụng mới [${data.requestCode}] từ ${data.requesterName}`,
              );
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "RecruitmentRequest", id: "LIST" },
                ]),
              );
            },
          );

          // 9. Tin tuyển dụng chính thức xuất bản đa kênh
          socket.on(
            "job_post.published",
            (data: {
              jobCode: string;
              publicTitle: string;
              jobPostId: string;
            }) => {
              gooeyToast.success(
                `Tin tuyển dụng [${data.jobCode}] đã xuất bản thành công!`,
              );
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "JobPost", id: data.jobPostId },
                  { type: "JobPost", id: "LIST" },
                ]),
              );
            },
          );

          // 10. Listen for JD Draft Completion
          socket.on(
            "jd_draft_ready",
            (data: { requestId: string; jobTitle: string }) => {
              gooeyToast.success(
                `Bản nháp JD cho vị trí "${data.jobTitle || "đang tạo"}" đã hoàn tất!`,
              );
              // Force refetch the specific RecruitmentRequest to show the AI output
              dispatch(
                atsApiSlice.util.invalidateTags([
                  { type: "RecruitmentRequest", id: data.requestId },
                ]),
              );
            },
          );
        } catch {
          // no-op
        }

        await cacheEntryRemoved;
        socket.off("job_post.approval_requested");
        socket.off("ats.cv_screened");
        socket.off("ats.candidate_shortlisted");
        socket.off("ats.candidate_rejected");
        socket.off("candidate_promoted");
        socket.off("ats.cv_submitted");
        socket.off("application.phase_changed");
        socket.off("recruitment.request.created");
        socket.off("job_post.published");
        socket.off("jd_draft_ready");
        socket.disconnect();
      },
    }),
  }),
});

export const {
  // Layer 1: Requisitions
  useGetRecruitmentRequestsQuery,
  useGetRecruitmentRequestByIdQuery,
  useCreateRecruitmentRequestMutation,
  useUpdateRecruitmentRequestMutation,
  useReviewRecruitmentRequestMutation,
  useCancelRecruitmentRequestMutation,

  // Layer 2: Job Posts & AI
  useAiSuggestJdMutation,
  useGetJobTemplatesQuery,

  useGetJobPostsQuery,
  useGetJobPostByIdQuery,
  useCreateJobPostMutation,
  useUpdateJobPostMutation,
  useRequestJobApprovalMutation,
  useReviewJobByHeadMutation,
  usePublishJobPostMutation,
  useCloseJobPostMutation,

  // Layer 3 & 4: Ingestion, Pipeline Kanban & Screening
  useGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useSubmitCandidatePortalMutation,
  useUploadSubmissionCvMutation,
  useSubmitCandidateManualMutation,
  useGetJobApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetApplicationSubmissionsQuery,
  useUpdateApplicationPhaseMutation,
  useUpdateApplicationStatusMutation,
  usePromoteCandidateFromPoolMutation,
  useRescreenApplicationMutation,
  useDeleteSubmissionCvMutation,

  // Layer 5: Realtime WebSocket Sync
  useSyncAtsEventsQuery,
} = atsApiSlice;
