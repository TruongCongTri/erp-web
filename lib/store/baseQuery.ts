import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/endpoints";
import { ApiErrorResponse } from "@/types/modelsver2";
import { setCredentials, logout as clearAuthCredentials } from "./authSlice";

// Mutex prevents multiple concurrent refresh attempts
const mutex = new Mutex();

// --- Utility: Cookie Management ---
export const setCookie = (name: string, value: string, days?: number) => {
  if (typeof window !== "undefined") {
    let expires = "";
    if (days) {
      const date = new Date(Date.now() + days * 864e5);
      expires = `; expires=${date.toUTCString()}`;
    }

    const isProduction = process.env.NODE_ENV === "production";
    const secureFlag = isProduction ? "Secure;" : "";

    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax; ${secureFlag}`;
  }
};

export const getCookie = (name: string): string | null => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    if (match) return decodeURIComponent(match[2]);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;`;
  }
};

// --- Standard Base Query ---
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    // Nếu request yêu cầu bỏ qua Auth (như khi refresh token), không đính kèm Bearer token cũ đã hết hạn
    if (headers.get("x-skip-auth") === "true") {
      headers.delete("x-skip-auth");
      headers.delete("authorization");
      return headers;
    }

    const token = getCookie("accessToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

interface RefreshResponse {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
  };
  accessToken?: string;
  refreshToken?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

// Helper to safely redirect to login without kicking users off public routes
const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;

    const isPublicPath =
      currentPath === "/" ||
      currentPath.match(/^\/[a-z]{2}$/) ||
      currentPath.includes("/login") ||
      currentPath.includes("/register") ||
      currentPath.includes("/verify");

    if (!isPublicPath) {
      const localeMatch = currentPath.match(/^\/([a-z]{2})/);
      const locale = localeMatch ? localeMatch[1] : "vi";
      window.location.href = `/${locale}/login`;
    }
  }
};

// --- Interceptor for Silent Refresh & Auto-Retry ---
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 1. Wait until mutex is free before making the request
  await mutex.waitForUnlock();

  // 2. Perform initial request
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const errorData = result.error.data as ApiErrorResponse | undefined;
    const errorCode = errorData?.meta?.error_code;

    const refreshUrl = API_ENDPOINTS?.AUTH?.REFRESH || "/auth/refresh";
    const loginUrl = API_ENDPOINTS?.AUTH?.LOGIN || "/auth/login";

    const requestUrl = typeof args === "string" ? args : args.url;
    const isAuthEndpoint =
      requestUrl.includes(loginUrl) ||
      requestUrl.includes(refreshUrl) ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh");

    // --- Handle Pending Verification (403) ---
    if (result.error.status === 403 && errorCode === "PENDING_VERIFICATION") {
      const email = errorData?.data?.email || "";
      const userId = errorData?.data?.userId || "";

      if (typeof window !== "undefined") {
        window.location.href = `/vi/verify-prompt?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`;
      }
      return result;
    }

    // --- Handle Suspended Accounts (401) ---
    if (result.error.status === 401 && errorCode === "ACCOUNT_SUSPENDED") {
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
      api.dispatch(clearAuthCredentials());

      if (typeof window !== "undefined") {
        window.location.href = "/vi/login?error=suspended";
      }
      return result;
    }

    // --- Standard 401: Silent Refresh Token Logic ---
    if (result.error.status === 401 && !isAuthEndpoint) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const refreshToken = getCookie("refreshToken");

          if (refreshToken) {
            // 3. Request new token - Dùng x-skip-auth để baseQuery KHÔNG gửi kèm accessToken cũ bị chết
            const refreshResult = await baseQuery(
              {
                url: refreshUrl,
                method: "POST",
                body: { refreshToken },
                headers: { "x-skip-auth": "true" },
              },
              api,
              extraOptions,
            );

            if (refreshResult.data) {
              const responseData = refreshResult.data as RefreshResponse;
              const newAccessToken =
                responseData?.data?.accessToken || responseData?.accessToken;
              const newRefreshToken =
                responseData?.data?.refreshToken || responseData?.refreshToken;
              const user = responseData?.data?.user || responseData?.user;

              if (newAccessToken) {
                // Lưu token mới vào Cookie
                setCookie("accessToken", newAccessToken, 7);
                if (newRefreshToken) {
                  setCookie("refreshToken", newRefreshToken, 7);
                }

                // Cập nhật Redux Store ngay lập tức
                if (user) {
                  api.dispatch(setCredentials({ user }));
                }

                // 4. Retry lại request ban đầu đã bị lỗi 401 với Access Token mới
                result = await baseQuery(args, api, extraOptions);
              }
            } else {
              // Refresh token không hợp lệ hoặc đã hết hạn
              deleteCookie("accessToken");
              deleteCookie("refreshToken");
              api.dispatch(clearAuthCredentials());
              redirectToLogin();
            }
          } else {
            // Không có refresh token trong Cookie
            deleteCookie("accessToken");
            api.dispatch(clearAuthCredentials());
            redirectToLogin();
          }
        } finally {
          release();
        }
      } else {
        // Nếu mutex đang bị lock bởi request khác, đợi hoàn tất rồi thử lại request này
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};
