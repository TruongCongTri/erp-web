"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

// Import your AppImage component and RTK Query hook
import AppImage from "@/components/ui/AppImage";
import { useGetMeQuery } from "@/lib/store/authApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Auth.AuthLayout");

  // Kích hoạt gọi API ngầm (RTK tự quản lý việc có cần gọi hay ko)
  useGetMeQuery();

  // ĐỌC THÔNG TIN TỪ NGUỒN SỰ THẬT DUY NHẤT: REDUX
  const { isInitialized, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const isClaimProfilePage = pathname.includes("/claim-profile");
  const locale = pathname.split("/")[1] || "vi";

  // ROUTE PROTECTION
  useEffect(() => {
    // Chỉ kích hoạt khi API ĐÃ TRẢ LỜI XONG (Bất kể Thành công hay Thất bại)
    if (isInitialized) {
      if (isAuthenticated && user) {
        if (isClaimProfilePage && (!user.role || user.role?.slug === "GUEST")) {
          return; // Cho phép Guest
        }
        // Đã đăng nhập -> Dashboard
        router.replace(`/${locale}/dashboard`);
      }
    }
  }, [
    isInitialized,
    isAuthenticated,
    user,
    router,
    locale,
    isClaimProfilePage,
  ]);

  // 3. CHẶN RENDER
  const isGuestClaiming =
    isClaimProfilePage && (!user?.role || user.role?.slug === "GUEST");

  // 1. Chưa check xong -> HIỆN LOADER
  // 2. Check xong, nhưng là user thật (đang bị đá đi) -> VẪN HIỆN LOADER TRÁNH NHÁY GIAO DIỆN
  if (
    !isInitialized ||
    (isInitialized && isAuthenticated && !isGuestClaiming)
  ) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // NẾU CHẠY XUỐNG ĐÂY TỨC LÀ BẠN LÀ KHÁCH HOẶC GUEST HỢP LỆ -> RENDER FORM
  const isReversed =
    pathname.includes("/login") || pathname.includes("/reset-password");
  const alignText = isReversed ? "text-right" : "text-left";
  const alignFlex = isReversed ? "items-end" : "items-start";
  const justifyFlex = isReversed ? "justify-end" : "justify-start";
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <main
        className={`flex h-[100dvh] w-full flex-col bg-background font-sans text-foreground antialiased overflow-hidden ${
          isReversed ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Sidebar: Fixed width, full height */}
        <motion.section
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`relative hidden md:flex w-1/3 h-full flex-col px-8 py-8 lg:px-12 lg:py-12 overflow-hidden shrink-0 z-20 ${
            isReversed ? "border-l border-border" : "border-r border-border"
          }`}
        >
          {/* ── BACKGROUND IMAGE W/ OVERLAY ── */}
          <div className="absolute inset-0 -z-20">
            <AppImage
              src="/image.jpg" // Background image path
              alt="Background"
              fill
              priority
              className="object-cover opacity-60"
            />
            {/* Overlay to ensure text contrast matches your 'bg-card' vibe */}
            <div className="absolute inset-0 bg-card/90 backdrop-blur-sm" />
          </div>

          <div
            className={`absolute top-0 w-full h-1 bg-primary ${
              isReversed ? "right-0" : "left-0"
            }`}
          ></div>
          <div
            className={`absolute -top-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none ${
              isReversed ? "-right-24" : "-left-24"
            }`}
          ></div>

          {/* ── DESKTOP LOGO WITH IMAGE ── */}
          <div className={`relative z-10 flex ${justifyFlex}`}>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <AppImage
                src="/icon.png" // Logo path
                alt="Logo"
                width={28}
                height={28}
                className="object-contain drop-shadow-sm"
              />
              <p className="text-xl lg:text-2xl font-headline font-black tracking-tighter text-primary">
                {t("logo")}
              </p>
            </Link>
          </div>

          {/* ── MIDDLE CONTENT (Vertically Centered & Dynamically Aligned) ── */}
          <div
            className={`relative z-10 my-auto space-y-6 lg:space-y-8 flex flex-col ${alignText} ${alignFlex}`}
          >
            <div
              className={`space-y-2 lg:space-y-4 flex flex-col ${alignFlex}`}
            >
              <h3 className="text-[10px] lg:text-xs font-bold tracking-[0.2em] text-primary uppercase font-sans">
                {t("mission")}
              </h3>
              <p className="text-2xl lg:text-3xl xl:text-4xl font-headline font-black tracking-tight text-foreground leading-none uppercase">
                {t("heading_line1")}
                <br />
                {t("heading_line2")}
                <br />
                {t("heading_line3")}
              </p>
            </div>
            <p
              className={`text-muted-foreground font-medium text-xs lg:text-sm leading-relaxed max-w-xs ${alignText}`}
            >
              {t("description")}
            </p>
          </div>

          {/* ── SIDEBAR FOOTER (Copyright + Server Status) ── */}
          <div className="relative z-10 w-full flex flex-col gap-6">
            <div className={alignText}>
              <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("copyright", { year: new Date().getFullYear() })}
              </span>
            </div>

            <div
              className={`shrink-0 pt-6 flex justify-between items-center gap-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-full border-t border-border/30 ${
                isReversed ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  isReversed ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-highlight-green animate-pulse shrink-0"></span>
                <span className="truncate">{t("server_status")}</span>
              </div>
              <div className={`truncate ${alignText}`}>{t("version")}</div>
            </div>
          </div>
        </motion.section>

        {/* Form Area */}
        <motion.section
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative flex flex-1 flex-col h-full mesh-bg robotics-overlay overflow-hidden z-10"
        >
          <div
            className={`absolute top-10 lg:top-20 w-48 h-48 lg:w-64 lg:h-64 border border-primary/10 rounded-full animate-pulse pointer-events-none ${
              isReversed ? "left-10 lg:left-20" : "right-10 lg:right-20"
            }`}
          ></div>
          <div
            className={`absolute bottom-20 lg:bottom-40 w-64 h-64 lg:w-80 lg:h-80 border-2 border-primary/5 pointer-events-none ${
              isReversed
                ? "-left-10 lg:-left-20 -rotate-45"
                : "-right-10 lg:-right-20 rotate-45"
            }`}
          ></div>

          <div className="flex flex-col h-full px-6 py-6 md:px-12 lg:px-24 xl:px-32 relative z-10">
            {/* ── MOBILE LOGO WITH IMAGE ── */}
            <div className="md:hidden shrink-0 mb-6 text-center flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <AppImage
                  src="/icon.png" // Đổi lại thành /icon.png cho đồng bộ với file gốc của bạn
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain drop-shadow-sm"
                />
                <p className="text-2xl font-headline font-black tracking-tighter text-primary">
                  {t("logo")}
                </p>
              </Link>
            </div>

            {/* Center Content: Bounded by min-h-0 to allow internal scrolling of children */}
            <div className="flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto py-2 min-h-0">
              <div className="w-full h-full min-h-0 flex flex-col">
                {children}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
          <div
            className={`absolute -top-[10%] w-[40%] aspect-square border border-primary/20 rounded-full ${
              isReversed ? "-left-[5%]" : "-right-[5%]"
            }`}
          ></div>
          <div
            className={`absolute top-[40%] w-[30%] aspect-square border-t border-primary/30 ${
              isReversed
                ? "-right-[10%] border-l -rotate-12"
                : "-left-[10%] border-r rotate-12"
            }`}
          ></div>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}
