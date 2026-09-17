// app/[locale]/(auth)/verify-prompt/page.tsx
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useResendVerifyEmailMutation } from "@/lib/store/authApiSlice";
import { gooeyToast } from "@/components/ui/goey-toaster";

function VerifyPromptContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "email của bạn";
  const userId = searchParams.get("userId");
  console.log("email: ", email);

  const [resendApi, { isLoading }] = useResendVerifyEmailMutation();
  const [cooldown, setCooldown] = useState(0);

  // Guard to prevent double-firing in React Strict Mode
  const hasAutoSent = useRef(false);

  // 1. AUTO-SEND EFFECT
  useEffect(() => {
    if (!userId || hasAutoSent.current) return;

    // Mark as attempted immediately so it doesn't run twice
    hasAutoSent.current = true;

    const autoSendEmail = async () => {
      try {
        await resendApi({ userId }).unwrap();
        gooeyToast.success("Đã gửi liên kết xác thực mới đến email của bạn!");
        setCooldown(60); // Start 60s countdown immediately
      } catch (error) {
        // If it fails (e.g. rate limit), don't start cooldown so they can try manually
        gooeyToast.error(
          "Không thể tự động gửi email. Vui lòng thử nhấn nút gửi lại.",
        );
      }
    };

    autoSendEmail();
  }, [userId, resendApi]);

  // 2. COOLDOWN TIMER EFFECT
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // 3. MANUAL RESEND HANDLER
  const handleResend = async () => {
    if (!userId) {
      gooeyToast.error(
        "Không tìm thấy mã người dùng (User ID) để gửi lại email.",
      );
      return;
    }

    try {
      await resendApi({ userId }).unwrap();
      gooeyToast.success("Email xác thực đã được gửi lại!");
      setCooldown(60);
    } catch (error) {
      gooeyToast.error("Gửi lại email thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="w-full max-w-md h-full mx-auto flex flex-col items-center justify-center min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Mail size={36} />
      </div>

      <h1 className="text-3xl font-black text-foreground tracking-tight mb-3">
        Kiểm tra hộp thư
      </h1>

      <p className="text-muted-foreground text-sm leading-relaxed mb-8 px-4">
        Tài khoản của bạn chưa được xác thực. Chúng tôi đã gửi một liên kết xác
        thực tới <br />
        <strong className="text-foreground">{email}</strong>. <br />
        Vui lòng kiểm tra email (bao gồm cả thư mục Spam) và làm theo hướng dẫn.
      </p>

      <button
        onClick={handleResend}
        disabled={isLoading || cooldown > 0}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
      >
        {isLoading ? (
          "ĐANG GỬI..."
        ) : cooldown > 0 ? (
          `GỬI LẠI SAU ${cooldown}S`
        ) : (
          <>
            GỬI LẠI EMAIL XÁC THỰC <Send size={16} />
          </>
        )}
      </button>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </Link>
    </div>
  );
}

export default function VerifyPromptPage() {
  // Suspense is required by Next.js when using useSearchParams() in a Client Component
  return (
    <Suspense fallback={<div className="text-center mt-20">Đang tải...</div>}>
      <VerifyPromptContent />
    </Suspense>
  );
}
