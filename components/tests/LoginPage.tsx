"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle, PlayCircle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";

// Navigation and RTK Query
import { Link, useRouter } from "@/utils/navigation";
import { useLoginMutation } from "@/lib/store/authApiSlice";
import PasswordInput from "@/components/input/PasswordInput";
import TourTooltip from "@/components/ui/TourTooltip";

import { gooeyToast } from "@/components/ui/goey-toaster"

import { ApiErrorResponse } from "@/types/modelsver2";
import GoogleLoginButton from "@/components/buttons/GoogleLoginButton";

// ─── TOUR TOOLTIP COMPONENT ───

export default function LoginPage() {
  const t = useTranslations("Auth.Login");
  const router = useRouter();

  // ─── TOUR STATE ───
  // 0 = inactive, 1 = email, 2 = password, 3 = remember me, 4 = submit
  const [tourStep, setTourStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  const [loginApi] = useLoginMutation();

  const loginSchema = z.object({
    email: z
      .string()
      .email(t("validation_email", { fallback: "Email không hợp lệ" })),
    password: z
      .string()
      .min(
        6,
        t("validation_password", { fallback: "Mật khẩu tối thiểu 6 ký tự" }),
      ),
    rememberMe: z.boolean().optional(),
  });

  type LoginInputs = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInputs) => {
    try {
      // 1. Execute login. The interceptor in authApiSlice sets the Cookie automatically.
      await loginApi({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      }).unwrap();

      // 2. CRITICAL FIX: Tell Next.js Server Components that cookies have changed!
      reset();
      router.refresh();
      gooeyToast.success("Đăng nhập thành công");

      // 3. HARD REDIRECT to guarantee navigation
      // Using window.location guarantees we leave the page, bypassing Next.js cache quirks
      // setTimeout(() => {
      //   window.location.href = "/dashboard";
      // }, 800); // Small delay so they can see the success gooeyToast

      router.push("/vi/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      // 1. Cast the error data to our strict type
      const errorData = err?.data as ApiErrorResponse | undefined;
      const errorCode = errorData?.meta?.error_code;
      const errorMessage =
        errorData?.meta?.message || "Email hoặc mật khẩu không chính xác.";

      console.log("Error code: ", errorCode);

      // 2. Check the strictly typed error_code
      if (errorCode === "PENDING_VERIFICATION") {
        // Safe fallback in case `data` isn't attached
        const email = errorData?.data?.email || data.email;
        const userId = errorData?.data?.userId || "";

        router.push(
          `/verify-prompt?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}`,
        );
        return;
      }

      if (errorCode === "ACCOUNT_SUSPENDED") {
        setError("root", {
          type: "server",
          message: "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.",
        });
        return;
      }

      // 3. General error fallback
      setError("root", { type: "server", message: errorMessage });
    }
  };

  const onError = (errors: any) => {
    const firstError = Object.keys(errors)[0];
    if (firstError) setFocus(firstError as keyof LoginInputs);
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
            <Lock size={12} /> {t("badge", { fallback: "ĐĂNG NHẬP" })}
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
          {t("title_1", { fallback: "CHÀO MỪNG" })}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
            {t("title_2", { fallback: "TRỞ LẠI" })}
          </span>
        </h1>
        <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
          {t("description", {
            fallback: "Đăng nhập để truy cập vào hệ thống quản trị của bạn.",
          })}
        </p>
      </header>

      {/* ── SCROLLABLE FORM AREA ── */}
      {/* THE FIX: REMOVED `relative z-10` from here so children are free to be placed above the overlay! */}
      <div
        className={`shrink min-h-0 ${tourStep > 0 ? "overflow-visible" : "overflow-y-auto"} scrollbar-hide pb-4 pr-1`}
      >
        {errors.root && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 relative z-10">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-700 leading-tight">
              {errors.root.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          {/* ── STEP 1: EMAIL INPUT ── */}
          <div
            className={`space-y-1 transition-all duration-300 ${
              tourStep === 1
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <label
              htmlFor="signin-email"
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
                id="signin-email"
                type="email"
                tabIndex={1}
                autoComplete="email"
                aria-invalid={!!errors.email}
                placeholder={t("email_placeholder", {
                  fallback: "name@company.com",
                })}
                className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500/20 pr-32"
                    : "border-border focus:border-primary focus:ring-primary/20 pr-4"
                }`}
              />
              {errors.email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 bg-background/90 pl-2 truncate max-w-[40%] text-right">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Tooltip for Step 1 */}
            {tourStep === 1 && (
              <TourTooltip
                title="Bước 1: Nhập Email"
                description="Bắt đầu bằng cách nhập địa chỉ email công việc đã được cấp phát cho bạn. Đảm bảo đúng định dạng @company.com."
                onNext={() => {
                  setTourStep(2);
                  setFocus("password");
                }}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>

          {/* ── STEP 2: PASSWORD INPUT ── */}
          <div
            className={`transition-all duration-300 ${
              tourStep === 2
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <PasswordInput
              id="signin-password"
              label={t("password_label", { fallback: "Mật khẩu" })}
              placeholder={t("password_placeholder", {
                fallback: "Tối thiểu 6 ký tự",
              })}
              tabIndex={2}
              error={errors.password?.message}
              registration={register("password")}
            />

            {/* Tooltip for Step 2 */}
            {tourStep === 2 && (
              <TourTooltip
                title="Bước 2: Mật khẩu bảo mật"
                description="Nhập mật khẩu của bạn. Bạn có thể nhấn vào biểu tượng con mắt ở góc phải để xem lại mật khẩu vừa nhập."
                onNext={() => setTourStep(3)}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>

          {/* ── STEP 3: REMEMBER ME & FORGOT PASSWORD ── */}
          <div
            className={`flex items-center justify-between py-1 transition-all duration-300 ${
              tourStep === 3
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register("rememberMe")} // Hook it into React Hook Form!
                tabIndex={3}
                id="remember-me"
                className="w-4 h-4 rounded border-border accent-primary focus:ring-primary/50 cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {t("remember", { fallback: "Ghi nhớ đăng nhập" })}
              </span>
            </label>
            <Link
              href="/forgot-password"
              tabIndex={6}
              className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              {t("reset_access", { fallback: "Quên mật khẩu?" })}
            </Link>

            {tourStep === 3 && (
              <TourTooltip
                title="Bước 3: Ghi nhớ đăng nhập (Tuỳ chọn)"
                description="Nếu đánh dấu vào ô này, hệ thống sẽ lưu phiên đăng nhập, giúp bạn không cần nhập lại mật khẩu cho những lần truy cập sau."
                onNext={() => setTourStep(4)}
                onSkip={() => setTourStep(0)}
                position="top"
              />
            )}
          </div>

          {/* ── STEP 4: SUBMIT BUTTON ── */}
          <div
            className={`pt-1 transition-all duration-300 ${
              tourStep === 4
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <button
              type="submit"
              tabIndex={4}
              disabled={isSubmitting}
              className="group relative w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting
                  ? t("btn_submitting", { fallback: "ĐANG XỬ LÝ..." })
                  : t("btn_submit", { fallback: "ĐĂNG NHẬP" })}
                <LogIn
                  className={`w-4 h-4 ${isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"} transition-transform`}
                />
              </span>
            </button>

            {/* Tooltip for Step 3 */}
            {tourStep === 4 && (
              <TourTooltip
                title="Bước 4: Hoàn tất"
                description="Chỉ cần nhấn nút Đăng nhập để truy cập vào hệ thống. Nếu thông tin không chính xác, hệ thống sẽ báo lỗi."
                onNext={() => setTourStep(0)}
                onSkip={() => setTourStep(0)}
                isLast={true}
                position="top"
              />
            )}
          </div>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3 relative z-10">
            <div className="h-px flex-1 bg-border/80"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("or_auth", { fallback: "HOẶC" })}
            </span>
            <div className="h-px flex-1 bg-border/80"></div>
          </div>

          {/* Social Logins */}
          <div className="mt-3 relative z-10">
            {/* <button
              type="button"
              tabIndex={5}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-semibold text-foreground">
                Đăng nhập bằng Google
              </span>
            </button> */}
            <GoogleLoginButton />
          </div>

          {/* Navigate to Register */}
          <div className="pt-4 text-center relative z-10">
            <p className="text-xs lg:text-sm font-medium text-muted-foreground">
              {t("no_account", { fallback: "Chưa có tài khoản?" })}
              <Link
                href="/register"
                tabIndex={7}
                className="font-bold text-primary hover:underline hover:text-primary/80 ml-1.5 transition-colors"
              >
                {t("register_link", { fallback: "Đăng ký ngay" })}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
