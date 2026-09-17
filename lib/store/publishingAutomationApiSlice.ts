// lib/store/publishingAutomationApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

// ==========================================
// 1. CORE DATA STRUCTURES & ENUMS
// ==========================================
export interface SingleResponse<T> {
  data: T;
}

export enum AutomationPlatform {
  FACEBOOK_GROUP = "FACEBOOK_GROUP",
  TOPCV = "TOPCV",
  CAREERVIET = "CAREERVIET",
}

export enum AutomationJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CHECKPOINT_BLOCKED = "CHECKPOINT_BLOCKED",
}

export interface FacebookGroup {
  id: string;
  name: string;
  url?: string;
  memberCount?: number;
  membershipStatus?: FacebookGroupMembershipStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Best-guess values — the spec doesn't enumerate these; treat as illustrative
 * autocomplete only. Confirm the real set with backend before relying on it
 * for anything stricter than "pass through whatever the API returns".
 */
export type FacebookGroupMembershipStatus =
  | "ACTIVE"
  | "PENDING"
  | "COOLDOWN"
  | "BLOCKED"
  | "REMOVED"
  | (string & {});

/**
 * Same caveat as above: the account lifecycle values aren't documented beyond
 * "HEALTHY" (the explicit status the PATCH endpoint sets).
 */
export type FacebookAccountStatus =
  | "HEALTHY"
  | "CHECKPOINT_BLOCKED"
  | "DISABLED"
  | (string & {});

export interface FacebookAccount {
  id: string;
  label: string;
  email?: string;
  status: FacebookAccountStatus;
  lastCheckpointAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GroupRecommendation {
  group: FacebookGroup;
  isDirectMatch: boolean;
  keywordScore: number;
  totalScore: number;
}

export interface ScheduledAutomationJob {
  id: string;
  atsJobPostingId: string;
  platform: AutomationPlatform;
  targetDestination: string;
  group?: FacebookGroup | null;
  status: AutomationJobStatus;
  scheduledAt: string;
  publishedPostUrl?: string | null;
  screenshotErrorPath?: string | null;
  lastErrorMessage?: string | null;
  retryCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// 2. REQUEST DTOs
// ==========================================
export interface GetGroupRecommendationsDto {
  jobTitle: string;
  jobType: string;
  requiredSkills: string[];
  filterOnlyActiveMembers?: boolean;
}

export interface DistributeGroupsDto {
  atsJobId: string;
  jobTitle: string;
  jobDescription: string;
  selectedGroupIds: string[];
  targetDate: string;
  windowStartTime: string;
  windowEndTime: string;
  minBufferMinutes: number;
}

export interface CreateAutomationJobDto {
  atsJobId: string;
  platform: AutomationPlatform.TOPCV | AutomationPlatform.CAREERVIET;
  targetDestination: string;
  jobTitle: string;
  jobDescription: string;
  scheduledAt?: string;
}

export interface QueryAutomationJobsDto {
  atsJobPostingId: string;
}

/**
 * The spec's endpoint table doesn't give example bodies for the ops-facing
 * account/group management endpoints below (unlike the recruiter-facing ones
 * above, which mirror the documented request shapes exactly). These DTOs are
 * a reasonable-conventions best guess — confirm the real shape with backend
 * before building anything beyond the "add a group" flow against them.
 */
export interface RegisterFacebookAccountDto {
  label: string;
  email?: string;
  cookies: string;
  proxy?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface UpdateFacebookAccountStatusDto {
  status: FacebookAccountStatus;
}

export interface GetFacebookGroupsQuery {
  search?: string;
  membershipStatus?: FacebookGroupMembershipStatus;
}

export interface CreateFacebookGroupDto {
  name: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface BulkImportFacebookGroupsDto {
  groups: CreateFacebookGroupDto[];
}

export interface UpdateFacebookGroupMembershipDto {
  membershipStatus: FacebookGroupMembershipStatus;
}

// ==========================================
// 3. API SLICE
// ==========================================
export const publishingAutomationApiSlice = createApi({
  reducerPath: "publishingAutomationApi",
  baseQuery,
  tagTypes: ["AutomationJob", "FacebookAccount", "FacebookGroup"],
  endpoints: (builder) => ({
    // ── FACEBOOK ACCOUNTS (ops/admin only — no per-job UI consumes these) ──
    getFacebookAccounts: builder.query<SingleResponse<FacebookAccount[]>, void>({
      query: () => "/facebook/accounts",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "FacebookAccount" as const,
                id,
              })),
              { type: "FacebookAccount" as const, id: "LIST" },
            ]
          : [{ type: "FacebookAccount" as const, id: "LIST" }],
    }),

    registerFacebookAccount: builder.mutation<
      SingleResponse<FacebookAccount>,
      RegisterFacebookAccountDto
    >({
      query: (body) => ({
        url: "/facebook/accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "FacebookAccount", id: "LIST" }],
    }),

    updateFacebookAccountStatus: builder.mutation<
      SingleResponse<FacebookAccount>,
      { id: string; body: UpdateFacebookAccountStatusDto }
    >({
      query: ({ id, body }) => ({
        url: `/facebook/accounts/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FacebookAccount", id },
        { type: "FacebookAccount", id: "LIST" },
      ],
    }),

    // ── FACEBOOK GROUPS ──
    getFacebookGroups: builder.query<
      SingleResponse<FacebookGroup[]>,
      GetFacebookGroupsQuery | void
    >({
      query: (params) => ({
        url: "/facebook/groups",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "FacebookGroup" as const,
                id,
              })),
              { type: "FacebookGroup" as const, id: "LIST" },
            ]
          : [{ type: "FacebookGroup" as const, id: "LIST" }],
    }),

    createFacebookGroup: builder.mutation<
      SingleResponse<FacebookGroup>,
      CreateFacebookGroupDto
    >({
      query: (body) => ({
        url: "/facebook/groups",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "FacebookGroup", id: "LIST" }],
    }),

    bulkImportFacebookGroups: builder.mutation<
      SingleResponse<FacebookGroup[]>,
      BulkImportFacebookGroupsDto
    >({
      query: (body) => ({
        url: "/facebook/groups/bulk-import",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "FacebookGroup", id: "LIST" }],
    }),

    updateFacebookGroupMembership: builder.mutation<
      SingleResponse<FacebookGroup>,
      { id: string; body: UpdateFacebookGroupMembershipDto }
    >({
      query: ({ id, body }) => ({
        url: `/facebook/groups/${id}/membership`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FacebookGroup", id },
        { type: "FacebookGroup", id: "LIST" },
      ],
    }),

    // ── FACEBOOK GROUP RECOMMENDATIONS & SCHEDULING ──
    getFacebookGroupRecommendations: builder.mutation<
      SingleResponse<GroupRecommendation[]>,
      GetGroupRecommendationsDto
    >({
      query: (body) => ({
        url: "/facebook/groups/recommendations",
        method: "POST",
        body,
      }),
    }),

    distributeFacebookGroups: builder.mutation<
      SingleResponse<ScheduledAutomationJob[]>,
      DistributeGroupsDto
    >({
      query: (body) => ({
        url: "/facebook/schedule/distribute-groups",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AutomationJob", id: "LIST" }],
    }),

    createAutomationJob: builder.mutation<
      SingleResponse<ScheduledAutomationJob>,
      CreateAutomationJobDto
    >({
      query: (body) => ({
        url: "/automation/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AutomationJob", id: "LIST" }],
    }),

    getAutomationJobs: builder.query<
      SingleResponse<ScheduledAutomationJob[]>,
      QueryAutomationJobsDto
    >({
      query: (params) => ({
        url: "/automation/jobs",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({
                type: "AutomationJob" as const,
                id,
              })),
              { type: "AutomationJob" as const, id: "LIST" },
            ]
          : [{ type: "AutomationJob" as const, id: "LIST" }],
    }),

    getAutomationJobById: builder.query<
      SingleResponse<ScheduledAutomationJob>,
      string
    >({
      query: (id) => `/automation/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: "AutomationJob", id }],
    }),

    retryAutomationJob: builder.mutation<
      SingleResponse<ScheduledAutomationJob>,
      string
    >({
      query: (id) => ({
        url: `/automation/jobs/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AutomationJob", id },
        { type: "AutomationJob", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetFacebookAccountsQuery,
  useRegisterFacebookAccountMutation,
  useUpdateFacebookAccountStatusMutation,
  useGetFacebookGroupsQuery,
  useCreateFacebookGroupMutation,
  useBulkImportFacebookGroupsMutation,
  useUpdateFacebookGroupMembershipMutation,
  useGetFacebookGroupRecommendationsMutation,
  useDistributeFacebookGroupsMutation,
  useCreateAutomationJobMutation,
  useGetAutomationJobsQuery,
  useGetAutomationJobByIdQuery,
  useRetryAutomationJobMutation,
} = publishingAutomationApiSlice;
