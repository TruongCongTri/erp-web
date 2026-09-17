// hooks/useSilentRefresh.ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { getCookie, setCookie, deleteCookie } from "@/lib/store/baseQuery";
import { useRefreshTokenMutation } from "@/lib/store/authApiSlice";
import type { AppDispatch } from "@/lib/store/store";
import { setCredentials, logout } from "@/lib/store/authSlice";
import { useDispatch } from "react-redux";

// Hàm giải mã JWT an toàn phía client
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
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
};

export function useSilentRefresh() {
  const [triggerRefresh] = useRefreshTokenMutation();
  const dispatch = useDispatch<AppDispatch>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleNextRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");

    if (!accessToken || !refreshToken) return;

    const payload = parseJwt(accessToken);
    if (!payload?.exp) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresInSeconds = payload.exp - currentTime;

    // Refresh trước khi token hết hạn 60 giây (tối thiểu sau 5 giây nếu token sắp chết)
    const refreshDelayMs = Math.max((expiresInSeconds - 60) * 1000, 5000);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await triggerRefresh({ refreshToken }).unwrap();
        const data = (res as any)?.data || res;

        if (data?.accessToken) {
          setCookie("accessToken", data.accessToken, 7);
          if (data.refreshToken) {
            setCookie("refreshToken", data.refreshToken, 7);
          }
          if (data.user) {
            dispatch(setCredentials({ user: data.user }));
          }
          // Tiếp tục lên lịch cho chu kỳ kế tiếp
          scheduleNextRefresh();
        }
      } catch (error) {
        console.warn("Silent refresh failed:", error);
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
        dispatch(logout());
      }
    }, refreshDelayMs);
  }, [triggerRefresh, dispatch]);

  useEffect(() => {
    scheduleNextRefresh();

    // Tự động kiểm tra và gia hạn ngay khi người dùng active lại tab (tránh trình duyệt sleep throttle timer)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleNextRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scheduleNextRefresh]);
}
