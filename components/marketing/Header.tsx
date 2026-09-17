"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ArrowRight, LayoutDashboard, Loader2 } from "lucide-react";
import { useGetMeQuery } from "@/lib/store/authApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import AppImage from "../ui/AppImage";

export default function Header({ locale }: { locale: string }) {
  // 1. Kích hoạt gọi API kiểm tra đăng nhập ngầm (RTK tự lo cache)
  useGetMeQuery();

  // 2. Lấy trạng thái từ nguồn sự thật duy nhất (Redux)
  const { isInitialized, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <Link href={`/${locale}`} className="flex items-center gap-2 group">
        <AppImage
            src="/icon.png"
            alt="Logo"
            width={28}
            height={28}
            className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          <span
            className={`font-bold text-lg ml-3 transition-opacity duration-300 opacity-100`}
          >
            Chính Nam
          </span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Chỉ hiện Loader khi chưa mount xong HOẶC API đang lấy dữ liệu lần đầu */}
        {!isInitialized ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : isAuthenticated ? (
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
          >
            Vào Dashboard <LayoutDashboard size={16} />
          </Link>
        ) : (
          <>
            <Link
              href={`/${locale}/login`}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Đăng nhập
            </Link>
            <Link
              href={`/${locale}/register`}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              Bắt đầu <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
// || !hasFinishedCheck
