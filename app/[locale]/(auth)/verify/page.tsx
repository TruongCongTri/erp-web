// app/[locale]/(auth)/verify/page.tsx
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyEmailMutation } from "@/lib/store/authApiSlice";
import { gooeyToast } from "@/components/ui/goey-toaster";

function VerifyProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  const [verifyEmailApi] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [countdown, setCountdown] = useState(5);

  // Use a ref to prevent strict-mode double firing
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const performVerification = async () => {
      try {
        await verifyEmailApi({ userId, token }).unwrap();
        setStatus("success");
      } catch (error) {
        setStatus("error");
        gooeyToast.error("Xác thực thất bại hoặc liên kết đã hết hạn.");
      }
    };

    performVerification();
  }, [userId, token, verifyEmailApi]);

  // 1. Handle ONLY the countdown interval
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === "success" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    // Cleanup interval
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, countdown]);

  // 2. Handle ONLY the side-effect (Redirect) when countdown hits 0
  useEffect(() => {
    if (status === "success" && countdown === 0) {
      // Tell Next.js Client Router to clear its cache
      router.refresh();

      // Do a HARD redirect to force the middleware to read the newly set cookies
      window.location.href = "/dashboard";
    }
  }, [status, countdown, router]);
  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col items-center justify-center min-h-0 animate-in fade-in zoom-in-95 duration-500 text-center">
      {status === "loading" && (
        <>
          <Loader2 size={48} className="text-primary animate-spin mb-6" />
          <h1 className="text-2xl font-black text-foreground mb-2">
            Đang xác thực...
          </h1>
          <p className="text-muted-foreground text-sm">
            Vui lòng đợi trong khi chúng tôi kiểm tra thông tin của bạn.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm dark:bg-green-900/30">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">
            Xác thực thành công!
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Tài khoản của bạn đã được kích hoạt. Bạn có thể sử dụng toàn bộ tính
            năng của hệ thống.
          </p>
          <div className="bg-muted px-4 py-2 rounded-lg text-sm font-semibold text-foreground">
            Chuyển hướng đến Dashboard trong{" "}
            <span className="text-primary">{countdown}s</span>...
          </div>
          <button
            onClick={() => {
              router.refresh();
              window.location.href = "/dashboard"; // Update the manual button too!
            }}
            className="mt-6 text-sm font-bold text-primary hover:underline"
          >
            Chuyển hướng ngay
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm dark:bg-red-900/30">
            <XCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">
            Xác thực thất bại
          </h1>
          <p className="text-muted-foreground text-sm mb-8 px-4">
            Liên kết xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập
            lại để nhận liên kết mới.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm shadow-md"
          >
            VỀ TRANG ĐĂNG NHẬP
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={<div className="text-center mt-20">Đang khởi tạo...</div>}
    >
      <VerifyProcessingContent />
    </Suspense>
  );
}
