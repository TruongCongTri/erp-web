/** 
 * * Uses RTK Query to manage API calls related to users and authentication. 
 * RTK Query acts as an advanced client-side cache. 
 * It automatically deduplicates requests 
(if two components ask for getMe, it only calls the API once) 
 * and caches the response in Redux.
 * 
 * */

import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { baseQueryWithReauth, setCookie, deleteCookie } from "./baseQuery";

import {
  GetMeResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  MetaResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  SingleResponse,
} from "@/types/apiver2";
import { AuthUser } from "@/types/modelsver2";
import { logout as clearAuthCredentials, setCredentials } from "./authSlice";
// import { GetMeResponse } from "@/types/api";

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getMe: builder.query<SingleResponse<AuthUser>, void>({
      query: () => ({
        url: API_ENDPOINTS.USERS.ME,
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // KHI THÀNH CÔNG: Cập nhật thông tin & isInitialized = true
          dispatch(setCredentials({ user: data.data }));
        } catch (error) {
          // KHI THẤT BẠI (401): Vẫn gọi hàm clear để cập nhật isInitialized = true
          dispatch(clearAuthCredentials());
        }
      },
      providesTags: ["User"],
    }),

    // getMe: builder.query<AuthUser, void>({
    //   query: () => ({
    //     url: API_ENDPOINTS.USERS.ME,
    //     // url: "http://localhost:5000/api/v1/auth/me",
    //     method: "GET",
    //   }),
    //   transformResponse: (response: GetMeResponse) => response.data,
    //   providesTags: ["User"],
    // }),

    login: builder.mutation<LoginResponse["data"], LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const expiryDays = arg.rememberMe ? 7 : undefined;

          setCookie("accessToken", data.accessToken, expiryDays);
          if (data.refreshToken) {
            setCookie("refreshToken", data.refreshToken, expiryDays);
          }

          // Cập nhật Redux ngay lập tức khi đăng nhập thành công
          if (data.user) {
            dispatch(setCredentials({ user: data.user }));
          }
        } catch (err) {}
      },
      transformResponse: (response: LoginResponse) => response.data,
      // Ép gọi lại getMe để làm mới quyền hạn
      invalidatesTags: ["User"],
    }),

    register: builder.mutation<SingleResponse<AuthUser>, RegisterRequest>({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: "POST",
        body: userData,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.warn("Backend logout failed, proceeding with local logout");
        } finally {
          deleteCookie("accessToken");
          deleteCookie("refreshToken");

          // 1. Kích hoạt Reset toàn bộ Store (Bao gồm cache cũ)
          dispatch({ type: "auth/logout" });

          // 2. Reset Redux authSlice về trạng thái rỗng nhưng ĐÃ KHỞI TẠO
          dispatch(clearAuthCredentials());
        }
      },
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation<MetaResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<MetaResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: "POST",
        body,
        responseHandler: "text",
      }),
    }),

    updateProfile: builder.mutation<GetMeResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.USERS.ME,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<MetaResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body,
      }),
    }),

    verifyEmail: builder.mutation<
      LoginResponse["data"],
      { userId: string; token: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          // Because of transformResponse below, 'data' here is ALREADY
          // the unwrapped { accessToken, refreshToken, user } object!
          const { data } = await queryFulfilled;

          if (data?.accessToken) {
            setCookie("accessToken", data.accessToken, 1);
            if (data?.refreshToken) {
              setCookie("refreshToken", data.refreshToken, 1);
            }
            console.log("Tokens successfully saved to cookies!");
          } else {
            console.error("No accessToken found in transformed data", data);
          }
        } catch (err) {
          console.error("Verification query failed:", err);
        }
      },
      // This automatically strips the outer { data, message } layer
      // before queryFulfilled resolves.
      transformResponse: (response: LoginResponse) => response.data,
      invalidatesTags: ["User"],
    }),

    resendVerifyEmail: builder.mutation<MetaResponse, { userId: string }>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.RESEND_VERIFY_EMAIL, // e.g., "/auth/send-verify-email"
        method: "POST",
        body,
      }),
    }),

    googleLogin: builder.mutation<
      LoginResponse["data"],
      { profile: { email: string; name: string; picture?: string } }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.GOOGLE,
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.accessToken) {
            setCookie("accessToken", data.accessToken, 7);
            if (data?.refreshToken) {
              setCookie("refreshToken", data.refreshToken, 7);
            }
            if (data.user) {
              dispatch(setCredentials({ user: data.user }));
            }
          }
        } catch (err) {
          console.error("Google login query failed:", err);
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation<
      LoginResponse["data"],
      { refreshToken: string }
    >({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.REFRESH, // e.g., '/auth/refresh'
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useVerifyEmailMutation,
  useResendVerifyEmailMutation,
  useGoogleLoginMutation,
  useRefreshTokenMutation,
} = authApiSlice;
