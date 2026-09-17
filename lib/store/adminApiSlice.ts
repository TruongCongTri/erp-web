// lib/store/adminApiSlice.ts
import { baseQuery } from "./baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  Role,
  Permission,
  SystemResource,
  PaginatedResponse,
  SingleResponse,
} from "@/types/modelsver2";

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQuery,
  tagTypes: ["Role", "Permission", "Resource", "UserAccess"],
  endpoints: (builder) => ({
    // ==========================================
    // ROLES
    // ==========================================
    // GET
    getRoles: builder.query<
      PaginatedResponse<Role>,
      {
        page?: number;
        limit?: number;
        search?: string;
        isLive?: boolean;
        // type?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => {
        // Strip out the 'type' param if it's purely for frontend grouping,
        // or map it to 'isLive' if your backend expects it.
        // Assuming your backend expects exactly page, limit, search, sortBy, sortOrder
        const queryParams: Record<string, string | number | boolean> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.isLive !== undefined) queryParams.isLive = params.isLive;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

        return {
          url: "/roles",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Role"],
    }),
    getAvailableRoles: builder.query<SingleResponse<Role[]>, void>({
      query: () => "/roles/available",
      providesTags: ["Role"],
    }),
    getRoleDetails: builder.query<
      SingleResponse<
        Role & { permissionIds: string[]; permissionSlugs: string[] }
      >,
      string
    >({
      query: (id) => `/roles/${id}`,
      // Specifically tagging the individual role so we can invalidate it
      providesTags: (result, error, id) => [{ type: "Role", id }, "Role"],
    }),
    //  CREATE
    createRole: builder.mutation<SingleResponse<Role>, Partial<Role>>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Role"],
    }),
    // UPDATE
    updateRole: builder.mutation<
      SingleResponse<Role>,
      { id: string; body: Partial<Role> }
    >({
      query: ({ id, body }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body,
      }),
      // Updating a role might affect the list and the specific details view
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        "Role",
      ],
    }),
    updateRolePermissions: builder.mutation<
      SingleResponse<Role>,
      { id: string; permissionIds: string[] }
    >({
      query: ({ id, permissionIds }) => ({
        url: `/roles/${id}/permissions`,
        method: "PATCH",
        body: { permissionIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        "Role",
      ],
    }),
    // TOGGLE STATUS
    toggleRoleStatus: builder.mutation<
      SingleResponse<Role>,
      { id: string; isLive: boolean }
    >({
      query: ({ id, isLive }) => ({
        url: `/roles/${id}/toggle-status`,
        method: "PATCH",
        body: { isLive }, // Matches ToggleStatusDto
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        "Role",
      ],
    }),
    // DELETE
    deleteRole: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),

    // Assign user /
    assignSingleUser: builder.mutation<
      SingleResponse<any>,
      { roleId: string; userId: string }
    >({
      query: ({ roleId, userId }) => ({
        url: `/roles/${roleId}/users/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: "Role", id: roleId },
        "Role",
      ],
    }),
    // Unassign User
    unassignSingleUser: builder.mutation<
      SingleResponse<any>,
      { roleId: string; userId: string }
    >({
      query: ({ roleId, userId }) => ({
        url: `/roles/${roleId}/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: "Role", id: roleId },
        "Role",
      ],
    }),

    // ==========================================
    // PERMISSIONS
    // ==========================================
    // GET
    getPermissions: builder.query<PaginatedResponse<Permission>, void>({
      query: () => "/permissions",
      providesTags: ["Permission"],
    }),
    getPermissionsEnum: builder.query<
      SingleResponse<{ actions: string[]; scopes: string[] }>,
      void
    >({
      query: () => "/permissions/enums",
      // Very stable, can be cached long-term
    }),

    // CREATE
    // UPDATE
    // TOGGLE STATUS
    togglePermissionStatus: builder.mutation<
      SingleResponse<Permission>,
      { id: string; isLive: boolean }
    >({
      query: ({ id, isLive }) => ({
        url: `/permissions/${id}/toggle-status`,
        method: "PATCH",
        body: { isLive },
      }),
      // FIX: Ensure ALL related queries fetch fresh data when a permission is toggled!
      invalidatesTags: ["Permission", "Resource", "Role"],
    }),
    // DELETE
    deletePermission: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/permissions/${id}`,
        method: "DELETE",
      }),
      // FIX: Ensure ALL related queries fetch fresh data when a permission is deleted!
      // This solves the UI desync issue across all pages (Resources, Roles, Users-Access).
      invalidatesTags: ["Permission", "Resource", "Role"],
    }),

    // ==========================================
    // SYSTEM RESOURCES
    // ==========================================
    // GET
    getResources: builder.query<
      PaginatedResponse<SystemResource>,
      {
        page?: number;
        limit?: number;
        search?: string;
        isLive?: boolean;
        // type?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    >({
      query: (params) => {
        // Strip out the 'type' param if it's purely for frontend grouping,
        // or map it to 'isLive' if your backend expects it.
        // Assuming your backend expects exactly page, limit, search, sortBy, sortOrder
        const queryParams: Record<string, string | number | boolean> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };
        if (params.search) queryParams.search = params.search;
        if (params.isLive !== undefined) queryParams.isLive = params.isLive;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

        return {
          url: "/resources",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Resource"],
    }),
    getResourcesMatrix: builder.query<SingleResponse<SystemResource[]>, void>({
      query: () => "/resources/matrix",
      providesTags: ["Resource"],
    }),
    getResourceDetails: builder.query<SingleResponse<SystemResource>, string>({
      query: (id) => `/resources/${id}`,
      // Tag it so it specifically invalidates when this resource updates
      providesTags: (result, error, id) => [
        { type: "Resource", id },
        "Resource",
      ],
    }),
    // CREATE
    createResource: builder.mutation<
      SingleResponse<SystemResource>,
      {
        name: string;
        slug: string;
        description?: string;
        isLive?: boolean;
        permissions?: Array<{
          action: string;
          scope: string;
          name?: string;
          description?: string;
        }>;
      }
    >({
      query: (body) => ({
        url: "/resources",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Resource"],
    }),
    // UPDATE
    updateResource: builder.mutation<
      SingleResponse<SystemResource>,
      {
        id: string;
        name?: string;
        slug?: string;
        description?: string;
        isLive?: boolean;
        permissions?: string[];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/resources/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Resource", "Permission", "Role"],
    }),

    // TOGGLE STATUS
    toggleResourceStatus: builder.mutation<
      SingleResponse<SystemResource>,
      { id: string; isLive: boolean }
    >({
      query: ({ id, isLive }) => ({
        url: `/resources/${id}/toggle-status`,
        method: "PATCH",
        body: { isLive },
      }),
      invalidatesTags: ["Resource", "Permission", "Role"],
    }),
    // DELETE
    deleteResource: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resource", "Permission", "Role"],
    }),

    // ==========================================
    // USER ACCESS (IT / ADMIN OVERRIDES)
    // ==========================================

    // GET List of all users and their basic access summary
    // Note: Assuming `any` here for flexibility. You can type it strictly to `User` later.
    getAllUsersAccess: builder.query<
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
      providesTags: ["UserAccess"],
    }),

    // GET specific user's complete access matrix
    getUserAccessDetails: builder.query<SingleResponse<any>, string>({
      query: (id) => `/users/${id}/access`,
      providesTags: (result, error, id) => [
        { type: "UserAccess", id },
        "UserAccess",
      ],
    }),

    // UPDATE specific user's role and bonus permissions
    updateUserAccess: builder.mutation<
      SingleResponse<void>,
      {
        id: string; // the User ID
        roleId: string;
        bonusPermissionIds: string[];
      }
    >({
      query: ({ id, roleId, bonusPermissionIds }) => ({
        url: `/users/${id}/access`,
        method: "PATCH",
        body: { roleId, bonusPermissionIds },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "UserAccess", id },
        "UserAccess",
        "Role", // Because assigning a role to a user changes the `userCount` on that Role!
      ],
    }),
  }),
});

export const {
  // role-related hooks
  useGetRolesQuery,
  useGetAvailableRolesQuery,
  useGetRoleDetailsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useUpdateRolePermissionsMutation,
  useToggleRoleStatusMutation,
  useAssignSingleUserMutation,
  useUnassignSingleUserMutation,
  useDeleteRoleMutation,
  // permission-related hooks
  useGetPermissionsQuery,
  useGetPermissionsEnumQuery,
  useTogglePermissionStatusMutation,
  useDeletePermissionMutation,
  // resource-related hooks
  useGetResourcesQuery,
  useGetResourcesMatrixQuery,
  useGetResourceDetailsQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useToggleResourceStatusMutation,
  useDeleteResourceMutation,
  // users-related (IT / ADMIN OVERRIDES) hooks
  useGetAllUsersAccessQuery,
  useGetUserAccessDetailsQuery,
  useUpdateUserAccessMutation,
} = adminApiSlice;
