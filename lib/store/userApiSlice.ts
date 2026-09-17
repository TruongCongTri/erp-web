import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { baseQueryWithReauth } from './baseQuery'; // 🚨 Import the Reauth Interceptor

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type AuthProvider = 'LOCAL' | 'GOOGLE';

// --- Exact Database Types ---
export interface UserProfile {
  userId: string;
  slug: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  // Metrics
  totalStudents: number;
  averageRating: number;
  totalCourses: number;
}

export interface AuthUser {
  id: string;
  email: string;
  accountStatus: AccountStatus;
  phone: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  isActive: boolean;
  roleId: string;
  profile: UserProfile | null;
  createdAt: string;
}

export interface UserSession {
  id: string;
  deviceId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActive: string;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
}

// --- Request Types ---
export interface UpdateMeRequest {
  fullName?: string;
  bio?: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// --- Response Envelopes ---
export interface MetaResponse {
  meta: {
    success: boolean;
    message: string;
  };
}

export interface GetProfileResponse {
  data: UserProfile;
  meta: MetaResponse['meta'];
}

export interface GetSessionsResponse {
  data: UserSession[];
  meta: MetaResponse['meta'];
}

export interface RequestEmailChangeRequest {
  newEmail: string;
}

export const userApiSlice = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserProfile', 'UserSessions'],
  endpoints: (builder) => ({
    // ==========================================
    // 👤 USER PROFILE ENDPOINTS
    // ==========================================

    getMe: builder.query<UserProfile, void>({
      // Giả định API_ENDPOINTS.USERS.ME = '/users/me'
      query: () => API_ENDPOINTS.USERS.ME,
      transformResponse: (response: GetProfileResponse) => response.data,
      providesTags: ['UserProfile'],
      keepUnusedDataFor: 3600,
    }),

    updateMe: builder.mutation<GetProfileResponse, UpdateMeRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.USERS.ME,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Upload Avatar yêu cầu FormData để truyền file ảnh (multipart/form-data)
    updateAvatar: builder.mutation<GetProfileResponse, FormData>({
      query: (formData) => ({
        url: API_ENDPOINTS.USERS.AVATAR, // Giả định = '/users/me/avatar'
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    updatePassword: builder.mutation<MetaResponse, UpdatePasswordRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.USERS.PASSWORD, // Giả định = '/users/me/password'
        method: 'PUT',
        body,
      }),
    }),

    requestEmailChange: builder.mutation<MetaResponse, RequestEmailChangeRequest>({
      query: (body) => ({
        url: '/users/me/request-email-change',
        method: 'POST',
        body,
      }),
    }),

    deleteAccount: builder.mutation<MetaResponse, { passwordConfirmation: string }>({
      query: (body) => ({
        url: '/users/me',
        method: 'DELETE',
        body,
      }),
      // Xóa xong thì dispatch logic logout ở Client
    }),
    
    // ==========================================
    // 🔐 DEVICE & SESSION MANAGEMENT
    // ==========================================

    getMySessions: builder.query<UserSession[], void>({
      query: () => API_ENDPOINTS.USERS.SESSIONS, // Giả định = '/users/me/sessions'
      transformResponse: (response: GetSessionsResponse) => response.data,
      providesTags: ['UserSessions'],
    }),

    deleteSession: builder.mutation<MetaResponse, string>({
      query: (sessionId) => ({
        url: API_ENDPOINTS.USERS.SESSION_DETAIL(sessionId), // Giả định = `/users/me/sessions/${sessionId}`
        method: 'DELETE',
      }),
      invalidatesTags: ['UserSessions'],
    }),

    deleteAllOtherSessions: builder.mutation<MetaResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.USERS.SESSIONS,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserSessions'], // Gọi xong sẽ auto fetch lại list session
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateAvatarMutation,
  useUpdatePasswordMutation,
  useGetMySessionsQuery,
  useDeleteSessionMutation,
  useDeleteAllOtherSessionsMutation,
} = userApiSlice;