"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  ArrowLeft,
  Send,
  KeyRound,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import TourTooltip from "@/components/ui/TourTooltip";

// Navigation
import { Link, useRouter } from "@/i18n/routing";
import { useForgotPasswordMutation } from "@/lib/store/authApiSlice";
import { gooeyToast } from "@/components/ui/goey-toaster";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.ForgotPassword");
  const router = useRouter();
  // ─── TOUR STATE ───
  // 0 = inactive, 1 = Email, 2 = Submit
  const [tourStep, setTourStep] = useState<0 | 1 | 2>(0);

  const [forgotPasswordApi] = useForgotPasswordMutation();

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .email(t("validation_email", { fallback: "Email không hợp lệ" })),
  });

  type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const onSubmit = async (data: ForgotPasswordInputs) => {
    console.log("SUBMIT TRIGGERED", data);
    try {
      // Execute the API Call
      await forgotPasswordApi({ email: data.email, channel: "email" }).unwrap();

      gooeyToast.success(
        t("success_message", {
          fallback: "Nếu email tồn tại, mã xác nhận đã được gửi.",
        }),
      );

      // Redirect to Reset Password and pass the email so they don't have to type it again
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setError("root", {
        type: "server",
        message:
          err?.data?.message ||
          t("error_generic", { fallback: "Có lỗi xảy ra, vui lòng thử lại." }),
      });
    }
  };

  const onError = (errors: any) => {
    console.log("FORM VALIDATION FAILED", errors); // <--- Add this!
    setFocus("email");
  };

  return (
    // Base layout: Must be `relative` so the absolute overlay is anchored properly
    <div className="w-full h-full max-w-md mx-auto flex flex-col justify-center min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* ── BACKGROUND OVERLAY ── */}
      {/* MASSIVE box to cover the whole screen. It bypasses `max-w-md` but gets neatly clipped by AuthLayout's `overflow-hidden` */}
      {tourStep > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300vw] h-[300vh] z-40 bg-foreground/10 backdrop-blur-[2px] transition-all duration-500 pointer-events-auto" />
      )}

      {/* ── FIXED HEADER ── */}
      <header className="shrink-0 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            <KeyRound size={12} /> {t("badge", { fallback: "KHÔI PHỤC" })}
          </div>

          <button
            type="button"
            onClick={() => setTourStep(1)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20 hover:bg-accent hover:text-white transition-colors cursor-pointer"
          >
            <PlayCircle size={12} /> Hướng dẫn
          </button>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-2">
          {t("title_1", { fallback: "QUÊN" })}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
            {t("title_2", { fallback: "MẬT KHẨU" })}
          </span>
        </h1>
        <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
          {t("description", {
            fallback: "Nhập email của bạn và chúng tôi sẽ gửi mã khôi phục.",
          })}
        </p>
      </header>

      {/* ── SCROLLABLE FORM AREA ── */}
      {/* THE FIX: REMOVED `relative z-10` from here so children are free to be placed above the overlay! */}
      <div
        className={`shrink min-h-0 ${tourStep > 0 ? "overflow-visible" : "overflow-y-auto"} scrollbar-hide pb-4 pr-1`}
      >
        {/* Global API Error Alert */}
        {errors.root && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-700 leading-tight">
              {errors.root.message}
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-3.5"
        >
          {/* ── STEP 1: EMAIL INPUT ── */}
          <div
            className={`space-y-1 transition-all duration-300 ${
              tourStep === 1
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <label
              htmlFor="reset-email"
              className="block text-xs font-bold text-foreground"
            >
              {t("email_label", { fallback: "Email" })}
            </label>
            <div className="relative group">
              <Mail
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("email")}
                id="reset-email"
                type="email"
                tabIndex={1}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                placeholder={t("email_placeholder", {
                  fallback: "name@company.com",
                })}
                className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500/20 pr-32"
                    : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50 pr-4"
                }`}
              />
              {errors.email && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 pointer-events-none bg-background/90 backdrop-blur-sm pl-2 truncate max-w-[40%] text-right animate-in fade-in"
                  title={errors.email.message}
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            {tourStep === 1 && (
              <TourTooltip
                title="Bước 1: Nhập Email"
                description="Nhập địa chỉ email công ty mà bạn đã sử dụng để đăng ký tài khoản."
                onNext={() => {
                  setTourStep(2);
                }}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>

          {/* ── STEP 2: SUBMIT BUTTON ── */}
          <div
            className={`pt-2 transition-all duration-300 ${
              tourStep === 2
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <button
              type="submit"
              tabIndex={2}
              disabled={isSubmitting}
              className="group relative w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting
                  ? t("btn_submitting", { fallback: "ĐANG GỬI..." })
                  : t("btn_submit", { fallback: "GỬI YÊU CẦU" })}
                <Send
                  className={`w-4 h-4 ${isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"} transition-transform`}
                />
              </span>
            </button>

            {tourStep === 2 && (
              <TourTooltip
                title="Bước 2: Gửi yêu cầu"
                description="Nhấn nút này, hệ thống sẽ gửi một mã xác nhận gồm 6 chữ số vào hòm thư email của bạn."
                onNext={() => setTourStep(0)}
                onSkip={() => setTourStep(0)}
                isLast={true}
                position="top"
              />
            )}
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              tabIndex={3}
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("return_login", { fallback: "Quay lại đăng nhập" })}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
