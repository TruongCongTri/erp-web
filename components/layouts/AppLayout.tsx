"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AuthUser } from "@/types/modelsver2";
import {
  useGetMeQuery,
  useRefreshTokenMutation,
} from "@/lib/store/authApiSlice";
import { RootState } from "@/lib/store/store";
import { useSelector, useDispatch } from "react-redux";
import { getCookie, setCookie, deleteCookie } from "@/lib/store/baseQuery";
import {
  setCredentials,
  logout as clearAuthCredentials,
} from "@/lib/store/authSlice";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  user?: AuthUser;
}

// Giải mã JWT an toàn phía client để lấy thời hạn exp
function parseJwt(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function AppLayout({ children, user: initialServerUser }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const locale = pathname.split("/")[1] || "vi";

  // 1. Quản lý trạng thái Auth tập trung duy nhất tại AppLayout
  const {
    data: meRes,
    isSuccess,
    isError,
    isLoading,
    refetch: refetchMe,
  } = useGetMeQuery();

  const { isAuthenticated, user: reduxUser } = useSelector(
    (state: RootState) => state.auth,
  );
  const [refreshTokenMutation] = useRefreshTokenMutation();

  // Khởi tạo user từ Server Component vào Redux nếu Store chưa có
  useEffect(() => {
    if (initialServerUser && !reduxUser) {
      dispatch(setCredentials({ user: initialServerUser }));
    }
  }, [initialServerUser, reduxUser, dispatch]);

  const currentUser = meRes?.data || reduxUser || initialServerUser || null;
  const hasFinishedCheck = isSuccess || isError;

  // 2. Cơ chế Silent Refresh: Tự động gia hạn Token khi đứng yên hoặc mở lại Tab
  const checkAndRefreshToken = useCallback(async () => {
    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");

    if (!refreshToken) return;

    if (accessToken) {
      const payload = parseJwt(accessToken);
      if (payload?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = payload.exp - currentTime;

        // Nếu token còn hạn nhiều hơn 60 giây thì chưa cần refresh
        if (timeUntilExpiry > 60) return;
      }
    }

    // Token đã hết hạn hoặc sắp hết hạn trong 60s -> Refresh ngay trong nền
    try {
      const res = await refreshTokenMutation({ refreshToken }).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any)?.data || res;

      if (data?.accessToken) {
        setCookie("accessToken", data.accessToken, 7);
        if (data.refreshToken) {
          setCookie("refreshToken", data.refreshToken, 7);
        }
        // Nếu backend trả về user đầy đủ thông tin quyền thì dispatch
        if (data.user?.role || data.user?.permissions) {
          dispatch(setCredentials({ user: data.user }));
        }

        // Bắt buộc refetch lại getMe với Access Token mới để cập nhật lại danh sách quyền
        await refetchMe();
      }
    } catch {
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
      dispatch(clearAuthCredentials());
      router.replace(`/${locale}/login`);
    }
  }, [refreshTokenMutation, dispatch, refetchMe, router, locale]);

  useEffect(() => {
    checkAndRefreshToken();

    // Quét định kỳ mỗi 30 giây để xử lý trường hợp người dùng để tab không thao tác
    const interval = setInterval(checkAndRefreshToken, 30000);

    // Kích hoạt refresh tức thì khi người dùng quay lại tab sau một thời gian dài (tránh browser sleep throttle)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAndRefreshToken]);

  // 3. Route Guard: Chỉ điều hướng về Login khi không còn Refresh Token hợp lệ
  useEffect(() => {
    const refreshToken = getCookie("refreshToken");
    if (hasFinishedCheck && (isError || !isAuthenticated) && !refreshToken) {
      router.replace(`/${locale}/login`);
    }
  }, [hasFinishedCheck, isError, isAuthenticated, router, locale]);

  // Chặn render giao diện nếu chưa xác thực xong hoặc mất phiên đăng nhập hoàn toàn
  if (isLoading && !currentUser) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* Structural Spacer (Desktop Only) */}
      <div className="hidden md:block w-16 h-full flex-shrink-0 border-r border-border bg-card z-0" />

      {/* Sidebar nhận user từ Props, không tự fetch lại */}
      <Sidebar
        user={currentUser}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Khung nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        {/* Topbar nhận user từ Props */}
        <Topbar
          user={currentUser}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-hidden flex flex-col min-h-0 pb-0 md:pb-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 pb-[56px] md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
