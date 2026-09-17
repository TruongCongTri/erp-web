// lib/store/notificationsApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, getCookie } from "./baseQuery";
import { PaginatedResponse, SingleResponse } from "@/types/modelsver2";
import { io, Socket } from "socket.io-client";
import { gooeyToast } from "@/components/ui/goey-toaster";

// ==========================================
// TYPES & INTERFACES
// ==========================================
export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export interface NotificationEnums {
  categories: string[];
  priorities: string[];
  actorTypes: string[];
  actionStates: string[];
  deliveryChannels: string[];
}

export interface ActorSnapshot {
  name?: string;
  avatar?: string;
  email?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface InlineActionItem {
  actionId: string;
  label: string;
  url?: string;
  method?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  organizationId: string;
  departmentId: string;

  category: string; // Enum NotificationCategory
  taskType: string;
  priority: string; // Enum NotificationPriority
  taskStatus: string | null;

  actorType: string; // Enum ActorType
  actorId: string | null;
  actorSnapshot: ActorSnapshot | null;

  title: string;
  body: string; // Trùng khớp với column 'body' ở BE
  i18nKey: string | null;
  i18nParams: Record<string, unknown> | null;
  iconSlug: string | null;

  targetEntityType: string;
  targetEntityId: string;
  actionUrl: string;

  isRead: boolean;
  readAt: string | null;
  isActionable: boolean;
  actionState: string; // Enum ActionState
  actionPayload: InlineActionItem[] | null;

  deliveryChannels: string[];
  isArchived: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsQuery {
  // Base Pagination
  page?: number;
  limit?: number;

  // Base Search & Sort
  search?: string;
  sortBy?: "createdAt" | "priority" | "expiresAt" | "isRead";
  sortOrder?: SortDirection;

  // Notification Inbox Filters
  isRead?: boolean | string;
  isArchived?: boolean;
  includeExpired?: boolean;

  // Taxonomy & Multi-Dept Slicing (Sẽ parse thành chuỗi cách bằng dấu phẩy)
  departmentId?: string;
  category?: string;
  taskType?: string;
  priority?: string;

  // Interactive Action Workflow
  isActionable?: boolean;
  actionState?: string;

  // Time Range
  fromDate?: string; // ISO8601
  toDate?: string; // ISO8601
}

//
export interface NotificationCursorQueryDto {
  limit?: number;
  cursor?: string;
  search?: string;
  sortDirection?: SortDirection;
  startDate?: string;
  endDate?: string;
}

// Backend response structure for the new paginated endpoint
export interface CursorPaginationResponse<T> {
  success: boolean;
  data: T;
  meta: {
    nextCursor: string | null;
  };
  message: string;
}
// ==========================================
// OPTIMISTIC CACHE HELPER
// ==========================================
// Mọi endpoint list đều giữ một bản sao của notification, nên khi đánh dấu đã đọc
// phải vá TẤT CẢ cache đang sống (chuông Topbar + badge Sidebar dùng
// `getNotifications`, trang Thông báo dùng `getNotificationsList`,
// feed cuộn vô hạn dùng `getNotificationsPage`) — nếu không, badge sẽ không đổi.
const PATCHABLE_ENDPOINTS = [
  "getNotifications",
  "getNotificationsList",
  "getNotificationsPage",
] as const;

function patchNotificationCaches(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getState: any,
  mutate: (draft: { data?: AppNotification[] }) => void,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries = (getState() as any).notificationsApi?.queries ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patches: any[] = [];

  for (const key of Object.keys(queries)) {
    // Cache key có dạng `endpointName(args)` hoặc `endpointName-args`
    // (getNotificationsPage tự custom `serializeQueryArgs`).
    const endpoint = PATCHABLE_ENDPOINTS.find(
      (name) => key.startsWith(name) && !/[A-Za-z]/.test(key.charAt(name.length)),
    );
    if (!endpoint) continue;

    patches.push(
      dispatch(
        notificationsApiSlice.util.updateQueryData(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          endpoint as any,
          queries[key].originalArgs,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mutate as any,
        ),
      ),
    );
  }

  return patches;
}

export const notificationsApiSlice = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQuery,
  tagTypes: ["Notification", "NotificationEnums"],
  endpoints: (builder) => ({
    // ==========================================
    // 0. GET ENUMS (Cached)
    // ==========================================
    getNotificationEnums: builder.query<
      SingleResponse<NotificationEnums>,
      { refresh?: boolean } | void
    >({
      query: (params) => ({
        url: "/notifications/enums", // Endpoint BE
        method: "GET",
        params: params?.refresh ? { refresh: "true" } : undefined,
      }),
      providesTags: ["NotificationEnums"],
      // Cache vĩnh viễn (hoặc rất lâu) vì Enums hiếm khi thay đổi
      keepUnusedDataFor: 86400,
    }),

    // ==========================================
    // 1. GET ALL & LISTEN TO WEBSOCKET
    // ==========================================
    getNotifications: builder.query<SingleResponse<AppNotification[]>, void>({
      query: () => "/notifications",
      providesTags: ["Notification"],

      // The Magic RTK Query WebSocket Integration
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const token = getCookie("accessToken");
        if (!token) return;

        // Initialize Socket connection
        const socket: Socket = io(
          process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000",
          {
            auth: { token },
            transports: ["websocket"],
          },
        );

        try {
          // Wait for the initial REST query to resolve before starting the socket listener
          await cacheDataLoaded;

          // Listen for the 'notification' event emitted by the NestJS Gateway
          socket.on("notification", (newNotif: AppNotification) => {
            // 1. Instantly update the Redux cache (pushes it to the top of the list)
            updateCachedData((draft) => {
              if (draft.data) {
                draft.data.unshift(newNotif);
              }
            });

            // 2. Show a toast popup
            // (Bỏ qua toast ở đây nếu là event tạo JD để tránh bị hiện toast 2 lần)
            if (!newNotif.title.includes("AI đã soạn xong JD")) {
              gooeyToast.info(newNotif.title, {
                description: newNotif.body,
              });
            }
          });

          // ─── LẮNG NGHE SỰ KIỆN AI TẠO JD THÀNH CÔNG ───
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          socket.on(
            "jd_draft_ready",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload: { requestId: string; data: any }) => {
              gooeyToast.success("AI đã soạn xong JD 🤖", {
                description: "Dữ liệu đang được tự động điền vào Form.",
              });

              // Bắn Custom Event ra toàn bộ Window để trang Detail (Client Component) bắt được
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("JD_DRAFT_READY", { detail: payload }),
                );
              }
            },
          );

          // ─── LẮNG NGHE SỰ KIỆN LỖI AI ───
          socket.on(
            "jd_draft_failed",
            (payload: { requestId: string; message: string }) => {
              gooeyToast.error("Xử lý AI thất bại", {
                description: payload.message,
              });

              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("JD_DRAFT_FAILED", { detail: payload }),
                );
              }
            },
          );
        } catch {
          // no-op if cacheDataLoaded throws
        }

        // Cleanup the socket connection when the component unmounts or cache expires
        await cacheEntryRemoved;
        socket.off("notification");
        socket.off("jd_draft_ready");
        socket.off("jd_draft_failed");
        socket.disconnect();
      },
    }),

    // ==========================================
    // 2. GET PAGINATED NOTIFICATIONS (For Full Page)
    // ==========================================
    getNotificationsPage: builder.query<
      CursorPaginationResponse<AppNotification[]>,
      NotificationCursorQueryDto
    >({
      query: (params) => ({
        url: "/notifications/page",
        params, // Tự động convert object thành query string (?limit=20&search=...)
      }),
      // Chỉ định key lưu cache: Gom chung một danh sách nếu các bộ lọc giống nhau, bỏ qua cursor
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { cursor, ...filters } = queryArgs;
        return `${endpointName}-${JSON.stringify(filters)}`;
      },
      // Hợp nhất dữ liệu (Merge) khi Load More
      merge: (currentCache, newItems, { arg }) => {
        if (arg.cursor) {
          // Nếu có cursor (Load more) -> Nối thêm dữ liệu vào danh sách cũ
          currentCache.data.push(...newItems.data);
          currentCache.meta = newItems.meta; // Cập nhật nextCursor mới
        } else {
          // Nếu không có cursor (Lần tải đầu hoặc đổi Filter) -> Ghi đè bằng dữ liệu mới
          return newItems;
        }
      },
      // Buộc fetch lại nếu cursor thay đổi
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.cursor !== previousArg?.cursor;
      },
    }),

    getNotificationsList: builder.query<
      PaginatedResponse<AppNotification>,
      GetNotificationsQuery
    >({
      query: (params) => {
        // Lọc sạch các Params null/undefined trước khi đẩy lên Backend
        const queryParams: Record<string, string | number | boolean> = {
          page: params.page || 1,
          limit: params.limit || 10,
        };

        if (params.search) queryParams.search = params.search;
        if (params.sortBy) queryParams.sortBy = params.sortBy;
        if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

        if (params.isRead !== undefined) queryParams.isRead = params.isRead;
        if (params.isArchived !== undefined)
          queryParams.isArchived = params.isArchived;
        if (params.includeExpired !== undefined)
          queryParams.includeExpired = params.includeExpired;

        if (params.departmentId) queryParams.departmentId = params.departmentId;
        if (params.category) queryParams.category = params.category;
        if (params.taskType) queryParams.taskType = params.taskType;
        if (params.priority) queryParams.priority = params.priority;

        if (params.isActionable !== undefined)
          queryParams.isActionable = params.isActionable;
        if (params.actionState) queryParams.actionState = params.actionState;

        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;

        return {
          url: "/notifications/list",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Notification"],

      // Tích hợp WebSocket ngay trên hook fetch (Chỉ kích hoạt trang 1)
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        // Tối ưu hóa: Chỉ khởi tạo / lắng nghe Socket khi đang xem trang đầu tiên
        // Điều này ngăn việc trang 2, trang 3 tự dưng có 1 mẩu notification lạ xuất hiện làm lệch offset
        if (arg.page && arg.page > 1) return;

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

          socket.on("notification", (newNotif: AppNotification) => {
            updateCachedData((draft) => {
              if (draft.data) {
                // Đẩy thông báo mới lên đầu list cache của trang 1
                draft.data.unshift(newNotif);

                // Giữ size không phình to quá giới hạn limit (nếu muốn UI ổn định)
                if (arg.limit && draft.data.length > arg.limit) {
                  draft.data.pop();
                }
              }
            });

            // Gửi Toast ngoại trừ các event hệ thống chạy ngầm
            if (!newNotif.title.includes("AI đã soạn xong")) {
              gooeyToast.info(newNotif.title, {
                description: newNotif.body,
              });
            }
          });
        } catch {
          // no-op
        }

        await cacheEntryRemoved;
        socket.off("notification");
        socket.disconnect();
      },
    }),
    // ==========================================
    // 2. MARK ONE AS READ
    // ==========================================
    markAsRead: builder.mutation<SingleResponse<void>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      // Optimistic Update
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patches = patchNotificationCaches(dispatch, getState, (draft) => {
          const notif = draft.data?.find((n) => n.id === id);
          if (notif && !notif.isRead) {
            notif.isRead = true;
            notif.readAt = new Date().toISOString();
          }
        });

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    // ==========================================
    // 3. MARK ALL AS READ
    // ==========================================
    markAllAsRead: builder.mutation<SingleResponse<void>, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const readAt = new Date().toISOString();
        const patches = patchNotificationCaches(dispatch, getState, (draft) => {
          draft.data?.forEach((notif) => {
            if (!notif.isRead) {
              notif.isRead = true;
              notif.readAt = readAt;
            }
          });
        });

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
});

export const {
  useGetNotificationEnumsQuery,
  useGetNotificationsQuery,
  useGetNotificationsPageQuery,
  useGetNotificationsListQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApiSlice;
