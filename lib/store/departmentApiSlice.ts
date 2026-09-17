// lib/store/departmentApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import {
  PaginatedResponse,
  SingleResponse,
  AuthUser,
} from "@/types/modelsver2";

// ========================================================
// 1. DATA STRUCTURES & INTERFACES
// ========================================================

export interface Department {
  id: string;
  slug: string;
  code: string;
  name: string;
  description?: string | null;
  organizationId?: string | null;
  headUserId?: string | null;
  headUser?: AuthUser | null;
  parentId?: string | null;
  parent?: Department | null;
  children?: Department[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTreeNode extends Department {
  children?: DepartmentTreeNode[];
}

// ── Query DTO ──
export interface QueryDepartmentDto {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
  parentId?: string;
  isActive?: boolean;
  isRootOnly?: boolean;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "ASC" | "DESC";
}

// ── Mutation Payloads ──
export interface CreateDepartmentDto {
  slug: string;
  code: string;
  name: string;
  description?: string;
  organizationId?: string;
  headUserId?: string;
  parentId?: string;
  isActive?: boolean;
}

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;

export interface AssignHeadDto {
  headUserId: string;
}

// ========================================================
// 2. API SLICE DEFINITION
// ========================================================

export const departmentApiSlice = createApi({
  reducerPath: "departmentApi",
  baseQuery: baseQuery,
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    // GET /departments
    getDepartments: builder.query<
      PaginatedResponse<Department>,
      QueryDepartmentDto | void
    >({
      query: (params) => ({
        url: "/departments",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Department" as const,
                id,
              })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),

    // GET /departments/tree
    getDepartmentTree: builder.query<
      SingleResponse<DepartmentTreeNode[]>,
      { organizationId?: string } | void
    >({
      query: (params) => ({
        url: "/departments/tree",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Department", id: "TREE" }],
    }),

    // GET /departments/:idOrSlug
    getDepartmentByIdOrSlug: builder.query<SingleResponse<Department>, string>({
      query: (idOrSlug) => `/departments/${idOrSlug}`,
      providesTags: (result, error, idOrSlug) => [
        { type: "Department", id: idOrSlug },
      ],
    }),

    // POST /departments
    createDepartment: builder.mutation<
      SingleResponse<Department>,
      CreateDepartmentDto
    >({
      query: (body) => ({
        url: "/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Department", id: "LIST" },
        { type: "Department", id: "TREE" },
      ],
    }),

    // PATCH /departments/:id
    updateDepartment: builder.mutation<
      SingleResponse<Department>,
      { id: string; body: UpdateDepartmentDto }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
        { type: "Department", id: "TREE" },
      ],
    }),

    // PATCH /departments/:id/assign-head
    assignDepartmentHead: builder.mutation<
      SingleResponse<Department>,
      { id: string; body: AssignHeadDto }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${id}/assign-head`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),

    // DELETE /departments/:id
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Department", id: "LIST" },
        { type: "Department", id: "TREE" },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentTreeQuery,
  useGetDepartmentByIdOrSlugQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useAssignDepartmentHeadMutation,
  useDeleteDepartmentMutation,
} = departmentApiSlice;
