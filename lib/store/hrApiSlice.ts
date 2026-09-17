// lib/store/hrApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, getCookie } from "./baseQuery";
import {
  PaginatedResponse,
  SingleResponse,
  AuthUser,
} from "@/types/modelsver2";
import { io, Socket } from "socket.io-client";

// Define strict typing for the step-up authentication responses based on your backend logic
interface IdentityData {
  cccdNumber: string;
  cccdDate: string;
  cccdPlace: string;
  taxCode: string;
}

interface FinancialData {
  bankAccount: string;
  bankName: string;
  bankBranch: string;
}

export const hrApiSlice = createApi({
  reducerPath: "hrApi",
  baseQuery: baseQuery,
  tagTypes: [
    "AuthUser",
    "AuthUserRecycleBin",
    "AuthUserAccess",
    "AuthUserProfile",
    "PendingClaim",
  ],
  endpoints: (builder) => ({
    // ==========================================
    // GET / QUERY ENDPOINTS (STATIC & DYNAMIC)
    // ==========================================

    // GET /api/v1/users
    getAuthUsers: builder.query<
      PaginatedResponse<AuthUser>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        refresh?: boolean;
        department?: string;
        status?: string;
        contractType?: string;
      } | void
    >({
      query: (params) => {
        if (!params) return "/users";

        const queryParams: Record<string, string | number | boolean> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
        if (params.refresh) queryParams.refresh = "true";
        if (params.department) queryParams.department = params.department;
        if (params.status) queryParams.status = params.status;
        if (params.contractType) queryParams.contractType = params.contractType;

        return {
          url: "/users",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["AuthUser"],
    }),

    // GET /api/v1/users/available
    getAvailableAuthUsers: builder.query<
      SingleResponse<AuthUser[]>,
      { refresh?: boolean } | void
    >({
      query: (params) => ({
        url: "/users/available",
        method: "GET",
        params: params?.refresh ? { refresh: "true" } : undefined,
      }),
      providesTags: ["AuthUser"],
    }),

    // GET /api/v1/users/recycle-bin
    getRecycledAuthUsers: builder.query<SingleResponse<AuthUser[]>, void>({
      query: () => "/users/recycle-bin",
      providesTags: ["AuthUserRecycleBin"],
    }),

    // GET /api/v1/users/access
    getAllAuthUsersAccess: builder.query<
      PaginatedResponse<any>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      } | void
    >({
      query: (params) => {
        if (!params) return "/users/access";
        const queryParams: Record<string, string | number> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

        return {
          url: "/users/access",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["AuthUserAccess"],
    }),

    // GET /api/v1/users/:id/access
    getAuthUserAccessDetails: builder.query<SingleResponse<any>, string>({
      query: (id) => `/users/${id}/access`,
      providesTags: (result, error, id) => [
        { type: "AuthUserAccess", id },
        "AuthUserAccess",
      ],
    }),

    // GET /api/v1/users/:id/quick-profile
    getQuickProfile: builder.query<
      SingleResponse<any>,
      { id: string; refresh?: boolean }
    >({
      query: ({ id, refresh }) => ({
        url: `/users/${id}/quick-profile`,
        method: "GET",
        params: refresh ? { refresh: "true" } : undefined,
      }),
      providesTags: (result, error, { id }) => [
        { type: "AuthUserProfile", id },
        "AuthUserProfile",
      ],
    }),

    // GET /api/v1/users/:id/full-profile
    getFullProfile: builder.query<
      SingleResponse<any>,
      { id: string; refresh?: boolean }
    >({
      query: ({ id, refresh }) => ({
        url: `/users/${id}/full-profile`,
        method: "GET",
        params: refresh ? { refresh: "true" } : undefined,
      }),
      providesTags: (result, error, { id }) => [
        { type: "AuthUserProfile", id },
        "AuthUserProfile",
      ],
    }),

    // GET /api/v1/users/:id (Standard detail fallback)
    getAuthUserDetails: builder.query<
      SingleResponse<AuthUser>,
      { id: string; refresh?: boolean }
    >({
      query: ({ id, refresh }) => ({
        url: `/users/${id}`,
        method: "GET",
        params: refresh ? { refresh: "true" } : undefined,
      }),
      providesTags: (result, error, { id }) => [
        { type: "AuthUser", id },
        "AuthUser",
      ],
    }),

    // ==========================================
    // MUTATION ENDPOINTS (CREATE / UPDATE / SECURE UNLOCK)
    // ==========================================

    // POST /api/v1/users
    createAuthUser: builder.mutation<
      SingleResponse<AuthUser>,
      Partial<AuthUser>
    >({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AuthUser", "AuthUserAccess"],
    }),

    // PATCH /api/v1/users/:id
    updateAuthUser: builder.mutation<
      SingleResponse<AuthUser>,
      { id: string; body: Partial<AuthUser> }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AuthUser", id },
        "AuthUser",
        { type: "AuthUserProfile", id },
      ],
    }),

    // PATCH /api/v1/users/access/:id
    // Adjusted URL to match backend @Patch('access/:id')
    updateAuthUserAccess: builder.mutation<
      SingleResponse<void>,
      {
        id: string; // AuthUser ID
        roleId: string;
        bonusPermissionIds: string[];
      }
    >({
      query: ({ id, roleId, bonusPermissionIds }) => ({
        url: `/users/access/${id}`,
        method: "PATCH",
        body: { roleId, bonusPermissionIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AuthUserAccess", id },
        "AuthUserAccess",
        { type: "AuthUser", id },
      ],
    }),

    // POST /api/v1/users/:id/unlock/identity
    // Step-up authentication - does not cache because it's highly sensitive and short-lived
    unlockIdentityData: builder.mutation<
      SingleResponse<IdentityData>,
      { id: string; passwordDto: { password: string } }
    >({
      query: ({ id, passwordDto }) => ({
        url: `/users/${id}/unlock/identity`,
        method: "POST",
        body: passwordDto,
      }),
    }),

    // POST /api/v1/users/:id/unlock/financial
    unlockFinancialData: builder.mutation<
      SingleResponse<FinancialData>,
      { id: string; passwordDto: { password: string } }
    >({
      query: ({ id, passwordDto }) => ({
        url: `/users/${id}/unlock/financial`,
        method: "POST",
        body: passwordDto,
      }),
    }),

    // DELETE /api/v1/user/:id (Soft Delete)
    deleteAuthUser: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "AuthUser",
        "AuthUserAccess",
        "AuthUserRecycleBin",
        "AuthUserProfile",
      ],
    }),

    // PATCH /api/v1/users/:id/restore
    restoreAuthUser: builder.mutation<SingleResponse<AuthUser>, string>({
      query: (id) => ({
        url: `/users/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: [
        "AuthUser",
        "AuthUserAccess",
        "AuthUserRecycleBin",
        "AuthUserProfile",
      ],
    }),

    // ==========================================
    // CLAIM PROFILE WORKFLOW
    // ==========================================

    // 1. Worker initiates claim
    submitProfileClaim: builder.mutation<
      SingleResponse<any>,
      { employeeCode: string; [key: string]: any } // Adjust typing based on your ClaimProfileDto
    >({
      query: (body) => ({
        url: "/users/claim-profile",
        method: "POST",
        body,
      }),
      // Assuming the user's local profile now shows as "pending", we invalidate it
      invalidatesTags: ["AuthUserProfile", "PendingClaim", "AuthUser"],
    }),

    // 2. HR fetches the pending list
    getPendingClaims: builder.query<
      PaginatedResponse<AuthUser>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        refresh?: boolean;
      } | void
    >({
      query: (params) => {
        if (!params) return "/users/claims/pending";
        const queryParams: Record<string, string | number | boolean> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
        if (params.refresh) queryParams.refresh = "true";

        return {
          url: "/users/claims/pending",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["PendingClaim"],
    }),

    getNewPendingClaimsCount: builder.query<number, void>({
      queryFn: () => ({ data: 0 }), // Initial state is 0
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const token = getCookie("accessToken");
        if (!token) return;

        // Connect to WebSocket
        const socket: Socket = io(
          process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000",
          {
            auth: { token },
            transports: ["websocket"],
          },
        );

        try {
          await cacheDataLoaded;

          // Listen for the specific invalidation event
          socket.on("invalidate_pending_claims", () => {
            // Increment the counter in the Redux cache!
            updateCachedData((currentCount) => currentCount + 1);
          });
        } catch {
          // no-op
        }

        await cacheEntryRemoved;
        socket.off("invalidate_pending_claims");
        socket.disconnect();
      },
    }),

    // 3. HR Approves the claim and assigns the role
    approveProfileClaim: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/users/claims/${id}/approve`,
        method: "POST",
      }),
      // If approved, they are removed from the pending list and their main User/Access details change
      invalidatesTags: [
        "PendingClaim",
        "AuthUser",
        "AuthUserAccess",
        "AuthUserProfile",
      ],
    }),

    // 4. HR Rejects the claim
    rejectProfileClaim: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/users/claims/${id}/reject`,
        method: "POST",
      }),
      // If rejected, they are removed from the pending list and their main User details change
      invalidatesTags: ["PendingClaim", "AuthUser", "AuthUserProfile"],
    }),

    // ==========================================
    // PROFILES ENTITY ENDPOINTS
    // ==========================================

    // GET /api/v1/profiles
    getAllProfiles: builder.query<
      PaginatedResponse<any>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
        refresh?: boolean;
        department?: string;
        status?: string;
        contractType?: string;
      } | void
    >({
      query: (params) => {
        if (!params) return "/profiles";

        const queryParams: Record<string, string | number | boolean> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
        if (params.refresh) queryParams.refresh = "true";
        if (params.department) queryParams.department = params.department;
        if (params.status) queryParams.status = params.status;
        if (params.contractType) queryParams.contractType = params.contractType;

        return {
          url: "/profiles",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["AuthUserProfile"],
    }),

    // GET /api/v1/profiles/code/:employeeCode
    getProfileByCode: builder.query<SingleResponse<any>, string>({
      query: (employeeCode) => `/profiles/code/${employeeCode}`,
      // Tagging with the general tag since it's fetched by code, not ID
      providesTags: ["AuthUserProfile"],
    }),

    // PATCH /api/v1/profiles/:profileId
    updateEmployeeProfile: builder.mutation<
      SingleResponse<any>,
      { profileId: string; body: any } // Replace 'any' with UpdateEmployeeProfileDto type when you have it
    >({
      query: ({ profileId, body }) => ({
        url: `/profiles/${profileId}`,
        method: "PATCH",
        body,
      }),
      // Invalidates both standalone profile and related User views to keep sync
      invalidatesTags: (result, error, { profileId }) => [
        { type: "AuthUserProfile", id: profileId },
        "AuthUserProfile",
        "AuthUser",
      ],
    }),

    // POST /api/v1/profiles/code/:employeeCode/secure
    getProfileSecurely: builder.mutation<
      SingleResponse<any>,
      { employeeCode: string; passwordDto: { password: string } }
    >({
      query: ({ employeeCode, passwordDto }) => ({
        url: `/profiles/code/${employeeCode}/secure`,
        method: "POST",
        body: passwordDto,
      }),
      // Secure read operations don't typically invalidate caches
    }),
  }),
});

export const {
  // Users Queries
  useGetAuthUsersQuery,
  useGetAvailableAuthUsersQuery,
  useGetRecycledAuthUsersQuery,
  useGetAuthUserDetailsQuery,
  useGetAllAuthUsersAccessQuery,
  useGetAuthUserAccessDetailsQuery,
  useGetQuickProfileQuery,
  useGetFullProfileQuery,

  // Users Mutations
  useCreateAuthUserMutation,
  useUpdateAuthUserMutation,
  useUpdateAuthUserAccessMutation,
  useUnlockIdentityDataMutation,
  useUnlockFinancialDataMutation,
  useDeleteAuthUserMutation,
  useRestoreAuthUserMutation,

  // Claim Workflow
  useGetPendingClaimsQuery,
  useGetNewPendingClaimsCountQuery,
  useSubmitProfileClaimMutation,
  useApproveProfileClaimMutation,
  useRejectProfileClaimMutation,

  // Profiles
  useGetAllProfilesQuery,
  useGetProfileByCodeQuery,
  useUpdateEmployeeProfileMutation,
  useGetProfileSecurelyMutation,
} = hrApiSlice;
