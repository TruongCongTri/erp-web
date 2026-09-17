import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { PaginatedResponse, SingleResponse } from "@/types/modelsver2";

// ============================================================================
// 1. ENUMS & SHARED TYPES
// ============================================================================

export enum TicketCategory {
  COORDINATION = "COORDINATION",
  CONFLICT = "CONFLICT",
  HANDOFF = "HANDOFF",
  SERVICE_REQUEST = "SERVICE_REQUEST",
  // Aliases tương thích định dạng hiển thị UI
  CROSS_DEPT_COORDINATION = "CROSS_DEPT_COORDINATION",
  CONFLICT_DISCREPANCY = "CONFLICT_DISCREPANCY",
  HANDOFF_SIGNOFF = "HANDOFF_SIGNOFF",
  SERVICE_ACCESS_REQUEST = "SERVICE_ACCESS_REQUEST",
}

export enum TicketPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  BLOCKER = "BLOCKER",
  URGENT = "URGENT",
}

export enum TicketStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING_INFO = "PENDING_INFO",
  MEETING_SCHEDULED = "MEETING_SCHEDULED",
  RESOLVED = "RESOLVED",
  REOPENED = "REOPENED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export const TICKET_SORT_FIELDS = [
  "createdAt",
  "priority",
  "ticketCode",
  "status",
  "responseDueAt",
  "resolutionDueAt",
] as const;

export type TicketSortField = (typeof TICKET_SORT_FIELDS)[number];

// ============================================================================
// 2. ENTITIES INTERFACES
// ============================================================================

export interface TicketActionItem {
  task: string;
  assigneeId: string;
  dueDate: string;
}

export interface TicketMeeting {
  id: string;
  ticketId: string;
  meetingId?: string | null;
  agenda: string;
  scheduledStart: string;
  scheduledEnd: string;
  meetingUrl?: string | null;
  actionItems?: TicketActionItem[] | null;
  outcomesSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  ticketCode: string;
  title: string;
  description: string;

  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;

  requesterId: string;
  requesterDepartmentId: string;
  targetDepartmentId: string;
  assigneeId: string | null;

  targetEntityType?: string | null;
  targetEntityId?: string | null;
  targetProjectId?: string | null;

  responseDueAt?: string | null;
  resolutionDueAt?: string | null;
  isSlaBreached: boolean;

  resolutionNote?: string | null;
  rejectionReason?: string | null;

  meetings?: TicketMeeting[];

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 3. REQUEST DTOS
// ============================================================================

export interface CreateTicketDto {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  targetDepartmentId: string;
  assigneeId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  targetProjectId?: string;
  isDraft?: boolean;
}

export interface AssignTicketDto {
  assigneeId: string;
  internalHandoverNote?: string;
}

export interface ResolveTicketDto {
  resolutionNote: string;
}

export interface RejectTicketDto {
  rejectionReason: string;
}

export interface ScheduleTicketMeetingDto {
  agenda: string;
  scheduledStart: string;
  scheduledEnd: string;
  meetingUrl?: string;
  meetingId?: string;
  attendeeIds?: string[];
}

export interface RecordMeetingOutcomesDto {
  outcomesSummary: string;
  actionItems: TicketActionItem[];
}

export interface QueryTicketDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: TicketSortField;
  sortOrder?: "ASC" | "DESC";

  category?: TicketCategory | TicketCategory[] | string;
  priority?: TicketPriority | TicketPriority[] | string;
  status?: TicketStatus | TicketStatus[] | string;

  targetDepartmentId?: string | string[];
  requesterDepartmentId?: string | string[];

  requesterId?: string;
  assigneeId?: string;
  isUnassigned?: boolean;

  targetProjectId?: string;
  targetEntityType?: string;
  targetEntityId?: string;

  isSlaBreached?: boolean;
  fromDate?: string;
  toDate?: string;
}

// ============================================================================
// 4. API SLICE DEFINITION
// ============================================================================

export const ticketApiSlice = createApi({
  reducerPath: "ticketApi",
  baseQuery: baseQuery,
  tagTypes: ["Ticket", "TicketMeeting"],
  endpoints: (builder) => ({
    // ─── 1. QUERY ALL TICKETS ───
    getTickets: builder.query<PaginatedResponse<Ticket>, QueryTicketDto | void>(
      {
        query: (params) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const queryParams: Record<string, any> = {
            page: params?.page || 1,
            limit: params?.limit || 20,
          };

          if (params?.search) queryParams.search = params.search;
          if (params?.sortBy) queryParams.sortBy = params.sortBy;
          if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

          if (params?.category) {
            queryParams.category = Array.isArray(params.category)
              ? params.category.join(",")
              : params.category;
          }
          if (params?.priority) {
            queryParams.priority = Array.isArray(params.priority)
              ? params.priority.join(",")
              : params.priority;
          }
          if (params?.status) {
            queryParams.status = Array.isArray(params.status)
              ? params.status.join(",")
              : params.status;
          }

          if (params?.targetDepartmentId) {
            queryParams.targetDepartmentId = Array.isArray(
              params.targetDepartmentId,
            )
              ? params.targetDepartmentId.join(",")
              : params.targetDepartmentId;
          }
          if (params?.requesterDepartmentId) {
            queryParams.requesterDepartmentId = Array.isArray(
              params.requesterDepartmentId,
            )
              ? params.requesterDepartmentId.join(",")
              : params.requesterDepartmentId;
          }

          if (params?.requesterId) queryParams.requesterId = params.requesterId;
          if (params?.assigneeId) queryParams.assigneeId = params.assigneeId;
          if (params?.isUnassigned !== undefined)
            queryParams.isUnassigned = params.isUnassigned;

          if (params?.targetProjectId)
            queryParams.targetProjectId = params.targetProjectId;
          if (params?.targetEntityType)
            queryParams.targetEntityType = params.targetEntityType;
          if (params?.targetEntityId)
            queryParams.targetEntityId = params.targetEntityId;

          if (params?.isSlaBreached !== undefined)
            queryParams.isSlaBreached = params.isSlaBreached;
          if (params?.fromDate) queryParams.fromDate = params.fromDate;
          if (params?.toDate) queryParams.toDate = params.toDate;

          return {
            url: "/tickets",
            method: "GET",
            params: queryParams,
          };
        },
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ id }) => ({
                  type: "Ticket" as const,
                  id,
                })),
                { type: "Ticket", id: "LIST" },
              ]
            : [{ type: "Ticket", id: "LIST" }],
      },
    ),

    // ─── 2. GET TICKET DETAILS ───
    getTicketById: builder.query<SingleResponse<Ticket>, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (result, error, id) => [{ type: "Ticket", id }],
    }),

    // ─── 3. CREATE TICKET ───
    createTicket: builder.mutation<SingleResponse<Ticket>, CreateTicketDto>({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Ticket", id: "LIST" }],
    }),

    // ─── 4. ASSIGN TICKET ───
    assignTicket: builder.mutation<
      SingleResponse<Ticket>,
      { id: string; body: AssignTicketDto }
    >({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/assign`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    // ─── 5. SCHEDULE TICKET MEETING ───
    scheduleTicketMeeting: builder.mutation<
      SingleResponse<TicketMeeting>,
      { id: string; body: ScheduleTicketMeetingDto }
    >({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/meetings`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    // ─── 6. RECORD MEETING OUTCOMES ───
    recordMeetingOutcomes: builder.mutation<
      SingleResponse<TicketMeeting>,
      { id: string; meetingId: string; body: RecordMeetingOutcomesDto }
    >({
      query: ({ id, meetingId, body }) => ({
        url: `/tickets/${id}/meetings/${meetingId}/outcomes`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    // ─── 7. RESOLVE TICKET ───
    resolveTicket: builder.mutation<
      SingleResponse<Ticket>,
      { id: string; body: ResolveTicketDto }
    >({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/resolve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    // ─── 8. REJECT TICKET ───
    rejectTicket: builder.mutation<
      SingleResponse<Ticket>,
      { id: string; body: RejectTicketDto }
    >({
      query: ({ id, body }) => ({
        url: `/tickets/${id}/reject`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    // ─── 9. CLOSE TICKET ───
    closeTicket: builder.mutation<SingleResponse<Ticket>, string>({
      query: (id) => ({
        url: `/tickets/${id}/close`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),

    // ─── 10. REOPEN TICKET ───
    reopenTicket: builder.mutation<
      SingleResponse<Ticket>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/tickets/${id}/reopen`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Ticket", id },
        { type: "Ticket", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useAssignTicketMutation,
  useScheduleTicketMeetingMutation,
  useRecordMeetingOutcomesMutation,
  useResolveTicketMutation,
  useRejectTicketMutation,
  useCloseTicketMutation,
  useReopenTicketMutation,
} = ticketApiSlice;
