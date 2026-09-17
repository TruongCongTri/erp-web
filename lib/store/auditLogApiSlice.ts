import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { PaginatedResponse, SingleResponse } from "@/types/modelsver2";

// ==========================================
// 1. ENUMS & TYPES (Extracted from Entity)
// ==========================================
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export enum ActorRoleLevel {
  STAFF = "STAFF",
  HEAD_DEPT = "HEAD_DEPT",
  HEAD_DIR = "HEAD_DIR",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  SYSTEM_SERVICE = "SYSTEM_SERVICE",
}

export enum AuditActionType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  REVOKE_ACCESS = "REVOKE_ACCESS",
  PERMISSION_CHANGE = "PERMISSION_CHANGE",
}

export enum AuditStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  WARNING = "WARNING",
  BLOCKED = "BLOCKED",
}

export enum AuditClientApp {
  WEB_PORTAL = "WEB_PORTAL",
  MOBILE_APP = "MOBILE_APP",
  API_GATEWAY = "API_GATEWAY",
  BACKGROUND_JOB = "BACKGROUND_JOB",
}

export enum DiffChangeType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  STATUS_TRANSITION = "STATUS_TRANSITION",
}

export interface AuditDiffField {
  field: string;
  label: string;
  oldValue: JsonValue;
  newValue: JsonValue;
  oldDisplay: string | null;
  newDisplay: string | null;
  isSensitive?: boolean;
}

export interface AuditDiffPayload {
  changeType: DiffChangeType;
  fields: AuditDiffField[];
}

export enum ExportJobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export enum RetentionAction {
  COLD_STORAGE_S3 = "COLD_STORAGE_S3",
  PURGE = "PURGE",
}

// ==========================================
// 2. DTO & INTERFACES (Entities)
// ==========================================

export interface AuditLog {
  id: string;
  trackingCode: string;
  correlationId: string;
  timestamp: string;

  actorId: string;
  actorName: string;
  actorInitials: string;
  actorAvatarUrl: string | null;
  actorDepartmentId: string;
  actorRoleLevel: ActorRoleLevel;
  actorTitle: string;
  impersonatedBy: string | null;

  targetDepartmentId: string;
  resourceSlug: string;
  resourceLabel: string;
  targetEntityId: string;
  targetProjectId: string | null;

  actionType: AuditActionType;
  actionLabel: string;
  status: AuditStatus;
  summary: string;
  failureReason: string | null;

  diffPayload: AuditDiffPayload;
  snapshotBefore: Record<string, unknown> | null;
  snapshotAfter: Record<string, unknown> | null;

  ipAddress: string;
  userAgent: string;
  clientApp: AuditClientApp;
  requestUrl: string;
}

export interface AuditExportJob {
  id: string;
  requestedById: string;
  requestedByName: string;
  filterParams: Record<string, unknown>;
  status: ExportJobStatus;
  totalRecords: number;
  fileUrl: string | null;
  fileChecksum: string | null;
  failureReason: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRetentionPolicy {
  id: string;
  departmentId: string;
  resourceSlug: string | null;
  retentionDays: number;
  retentionAction: RetentionAction;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Query Interface cho GET /audit-logs
export interface QueryAuditLogDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "timestamp" | "actorName" | "actionType";
  sortOrder?: "ASC" | "DESC";

  // Filter Arrays
  actorId?: string | string[];
  actorDepartmentId?: string | string[];
  targetDepartmentId?: string | string[];
  resourceSlug?: string | string[];
  actionType?: AuditActionType | AuditActionType[];
  status?: AuditStatus | AuditStatus[];

  // Time Range
  fromDate?: string; // ISO String
  toDate?: string; // ISO String
}

// ==========================================
// 3. API SLICE DEFINITION
// ==========================================

export const auditLogApiSlice = createApi({
  reducerPath: "auditLogApi",
  baseQuery: baseQuery,
  tagTypes: ["AuditLog", "AuditExportJob", "AuditRetention"],
  endpoints: (builder) => ({
    // ─── 1. AUDIT LOGS QUERY ───
    getAuditLogs: builder.query<PaginatedResponse<AuditLog>, QueryAuditLogDto>({
      query: (params) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: Record<string, any> = {
          page: params.page || 1,
          limit: params.limit || 20,
        };

        if (params.search) queryParams.search = params.search;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

        if (params.actorId)
          queryParams.actorId = Array.isArray(params.actorId)
            ? params.actorId.join(",")
            : params.actorId;
        if (params.actorDepartmentId)
          queryParams.actorDepartmentId = Array.isArray(
            params.actorDepartmentId,
          )
            ? params.actorDepartmentId.join(",")
            : params.actorDepartmentId;
        if (params.targetDepartmentId)
          queryParams.targetDepartmentId = Array.isArray(
            params.targetDepartmentId,
          )
            ? params.targetDepartmentId.join(",")
            : params.targetDepartmentId;
        if (params.resourceSlug)
          queryParams.resourceSlug = Array.isArray(params.resourceSlug)
            ? params.resourceSlug.join(",")
            : params.resourceSlug;
        if (params.actionType)
          queryParams.actionType = Array.isArray(params.actionType)
            ? params.actionType.join(",")
            : params.actionType;
        if (params.status)
          queryParams.status = Array.isArray(params.status)
            ? params.status.join(",")
            : params.status;

        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;

        return {
          url: "/audit-logs",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["AuditLog"],
    }),

    getAuditLogById: builder.query<SingleResponse<AuditLog>, string>({
      query: (id) => `/audit-logs/${id}`,
      providesTags: (result, error, id) => [{ type: "AuditLog", id }],
    }),

    // ─── 2. EXPORT JOBS ───
    requestExport: builder.mutation<
      SingleResponse<AuditExportJob>,
      QueryAuditLogDto
    >({
      query: (body) => ({
        url: "/audit-logs/export",
        method: "POST",
        body, // Gửi nguyên cục Query Params vào Body để BE snapshot filter lại
      }),
      invalidatesTags: ["AuditExportJob"],
    }),

    getExportJobs: builder.query<
      PaginatedResponse<AuditExportJob>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/audit-logs/export-jobs",
        method: "GET",
        params,
      }),
      providesTags: ["AuditExportJob"],
    }),

    // ─── 3. RETENTION POLICIES ───
    getRetentionPolicies: builder.query<
      PaginatedResponse<AuditRetentionPolicy>,
      void
    >({
      query: () => "/audit-logs/retention-policies",
      providesTags: ["AuditRetention"],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogByIdQuery,
  useRequestExportMutation,
  useGetExportJobsQuery,
  useGetRetentionPoliciesQuery,
} = auditLogApiSlice;
