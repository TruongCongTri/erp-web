"use client";

import {
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  User as UserIcon,
  PlayCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";

// Navigation and RTK Query
import { Link, useRouter } from "@/utils/navigation";
import { useRegisterMutation } from "@/lib/store/authApiSlice";
import PasswordInput from "@/components/input/PasswordInput";
import TourTooltip from "@/components/ui/TourTooltip";
import { useState } from "react";
import { gooeyToast } from "@/components/ui/goey-toaster"

export default function RegisterPage() {
  const t = useTranslations("Auth.Register");
  const router = useRouter();

  // ─── TOUR STATE ───
  // 0 = inactive, 1 = Name, 2 = Email, 3 = Password, 4 = Confirm Password, 5 = Terms, 6 = Submit
  const [tourStep, setTourStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);

  const [registerApi] = useRegisterMutation();

  const registerSchema = z
    .object({
      fullName: z.string().min(2, t("validation_name", { fallback: "Tên phải có ít nhất 2 ký tự" })),
      email: z.string().email(t("validation_email", { fallback: "Email không hợp lệ" })),
      password: z.string().min(6, t("validation_password", { fallback: "Mật khẩu tối thiểu 6 ký tự" })),
      confirmPassword: z.string(),
      terms: z.literal(true, {
        error: t("validation_terms", { fallback: "Bạn phải đồng ý với điều khoản" }),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation_confirm_password", { fallback: "Mật khẩu xác nhận không khớp" }),
      path: ["confirmPassword"],
    });

  type RegisterInputs = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: RegisterInputs) => {
    try {
      // 1. Execute API call
      await registerApi({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }).unwrap(); // unwrap() throws an error if the API returns 4xx or 5xx

      // 2. Show success gooeyToast
      gooeyToast.success(t("success_message", { fallback: "Đăng ký thành công! Vui lòng đăng nhập." }));

      // 3. HARD REDIRECT to guarantee navigation
      // Using window.location guarantees we leave the page, bypassing Next.js cache quirks
      setTimeout(() => {
         window.location.href = '/login';
      }, 800); // Small delay so they can see the success gooeyToast
    } catch (err: any) {
      console.error("Registration failed:", err);

      const errorMessage =
        err?.data?.message ||
        err?.data?.error ||
        t("error_registration_failed", {
          fallback: "Đăng ký thất bại. Vui lòng thử lại sau.",
        });

      setError("root", {
        type: "server",
        message: errorMessage,
      });
    }
  };

  const onError = (errors: any) => {
    const firstError = Object.keys(errors)[0];
    if (firstError) setFocus(firstError as keyof RegisterInputs);
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
            <UserPlus size={12} /> {t("badge", { fallback: "ĐĂNG KÝ" })}
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
          {t("title_1", { fallback: "TẠO TÀI KHOẢN" })}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
            {t("title_2", { fallback: "MỚI" })}
          </span>
        </h1>
        <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
          {t("description", {
            fallback:
              "Tham gia nền tảng quản lý nội bộ toàn diện dành cho doanh nghiệp của bạn.",
          })}
        </p>
      </header>

      {/* ── SCROLLABLE FORM AREA ── */}
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
          {/* ── STEP 1: FULL NAME INPUT ── */}
          <div
            className={`space-y-1 transition-all duration-300 ${
              tourStep === 1
                ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                : "relative z-10"
            }`}
          >
            <label
              htmlFor="register-name"
              className="block text-xs font-bold text-foreground"
            >
              {t("name_label", { fallback: "Họ và tên" })}
            </label>
            <div className="relative group">
              <UserIcon
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.fullName ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("fullName")}
                id="register-name"
                type="text"
                tabIndex={1}
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                placeholder={t("name_placeholder", {
                  fallback: "Nhập họ và tên của bạn",
                })}
                className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "border-red-500 focus:ring-red-500/20 pr-32"
                    : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50 pr-4"
                }`}
              />
              {errors.fullName && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 pointer-events-none bg-background/90 backdrop-blur-sm pl-2 truncate max-w-[40%] text-right animate-in fade-in"
                  title={errors.fullName.message}
                >
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {tourStep === 1 && (
              <TourTooltip
                title="Bước 1: Họ và Tên"
                description="Nhập họ và tên đầy đủ của bạn để đồng nghiệp dễ dàng nhận diện trên hệ thống."
                onNext={() => {
                  setTourStep(2);
                  setFocus("email");
                }}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>

          {/* ── STEP 2: EMAIL INPUT ── */}
          <div className={`space-y-1 transition-all duration-300 ${
            tourStep === 2 ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg" : "relative z-10"
          }`}>
            <label
              htmlFor="register-email"
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
                id="register-email"
                type="email"
                tabIndex={2}
                autoComplete="email"
                aria-invalid={!!errors.email}
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

            {tourStep === 2 && (
              <TourTooltip
                title="Bước 2: Địa chỉ Email"
                description="Nhập email công ty cấp phát. Email này sẽ được dùng để đăng nhập và nhận thông báo."
                onNext={() => {
                  setTourStep(3);
                  setFocus("password");
                }}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>

          {/* Password Input */}
          {/* <div className="space-y-1">
            <label
              htmlFor="register-password"
              className="block text-xs font-bold text-foreground"
            >
              {t("password_label", { fallback: "Mật khẩu" })}
            </label>
            <div className="relative group">
              <Lock
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("password")}
                id="register-password"
                type="password"
                tabIndex={3}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                placeholder={t("password_placeholder", {
                  fallback: "Tối thiểu 6 ký tự",
                })}
                className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500/20 pr-32"
                    : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50 pr-4"
                }`}
              />
              {errors.password && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 pointer-events-none bg-background/90 backdrop-blur-sm pl-2 truncate max-w-[40%] text-right animate-in fade-in"
                  title={errors.password.message}
                >
                  {errors.password.message}
                </span>
              )}
            </div>
          </div> */}
          {/* ── STEP 3: PASSWORD INPUT ── */}
          <div className={`transition-all duration-300 ${
            tourStep === 3 ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg" : "relative z-10"
          }`}>
            <PasswordInput
              id="register-password"
              label={t("password_label", { fallback: "Mật khẩu" })}
              placeholder={t("password_placeholder", {
                fallback: "Tối thiểu 6 ký tự",
              })}
              tabIndex={3}
              error={errors.password?.message}
              registration={register("password")}
            />

            {tourStep === 3 && (
              <TourTooltip
                title="Bước 3: Đặt Mật khẩu"
                description="Tạo mật khẩu mạnh gồm ít nhất 6 ký tự. Bạn có thể nhấn vào biểu tượng con mắt để xem lại mật khẩu."
                onNext={() => {
                  setTourStep(4);
                  setFocus("confirmPassword");
                }}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>

          {/* ── STEP 4: CONFIRM PASSWORD INPUT ── */}
          <div className={`transition-all duration-300 ${
            tourStep === 4 ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg" : "relative z-10"
          }`}>
            <PasswordInput
              id="confirm-password"
              label={t("confirm_password_label", {
                fallback: "Xác nhận mật khẩu",
              })}
              placeholder={t("confirm_password_placeholder", {
                fallback: "Nhập lại mật khẩu",
              })}
              tabIndex={4}
              error={errors.confirmPassword?.message}
              registration={register("confirmPassword")}
            />

            {tourStep === 4 && (
              <TourTooltip
                title="Bước 4: Xác nhận Mật khẩu"
                description="Nhập lại mật khẩu vừa tạo để đảm bảo bạn không gõ nhầm."
                onNext={() => setTourStep(5)}
                onSkip={() => setTourStep(0)}
              />
            )}
          </div>
          {/* Confirm Password Input */}
          {/* <div className="space-y-1">
            <label
              htmlFor="register-confirm-password"
              className="block text-xs font-bold text-foreground"
            >
              {t("confirm_password_label", { fallback: "Xác nhận mật khẩu" })}
            </label>
            <div className="relative group">
              <Lock
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.confirmPassword ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("confirmPassword")}
                id="register-confirm-password"
                type="password"
                tabIndex={4}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                placeholder={t("confirm_password_placeholder", {
                  fallback: "Nhập lại mật khẩu",
                })}
                className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500/20 pr-32"
                    : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50 pr-4"
                }`}
              />
              {errors.confirmPassword && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 pointer-events-none bg-background/90 backdrop-blur-sm pl-2 truncate max-w-[45%] text-right animate-in fade-in"
                  title={errors.confirmPassword.message}
                >
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div> */}
          {/* <PasswordInput
            id="confirm-password"
            label={t("confirm_password_label", {
              fallback: "Xác nhận mật khẩu",
            })}
            placeholder={t("confirm_password_placeholder", {
              fallback: "Nhập lại mật khẩu",
            })}
            tabIndex={2}
            error={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
          /> */}
          {/* ── STEP 5: TERMS AGREEMENT ── */}
          <div className={`flex flex-col gap-1 py-1 transition-all duration-300 ${
            tourStep === 5 ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg" : "relative z-10"
          }`}>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                {...register("terms")}
                tabIndex={5}
                className={`mt-0.5 w-4 h-4 rounded border-border accent-primary focus:ring-primary/50 cursor-pointer ${
                  errors.terms ? "border-red-500" : ""
                }`}
              />
              <span className="text-xs font-semibold text-muted-foreground leading-relaxed">
                {t("terms_agreement", { fallback: "Tôi đồng ý với" })}
                <a href="#" tabIndex={-1} className="font-bold text-primary hover:underline hover:text-primary/80 transition-colors">
                  {t("terms_of_service", { fallback: "Điều khoản dịch vụ" })}
                </a>{" "}
                {t("terms_and", { fallback: "và" })}
                <a href="#" tabIndex={-1} className="font-bold text-primary hover:underline hover:text-primary/80 transition-colors">
                  {t("terms_privacy_policy", { fallback: "Chính sách bảo mật" })}
                </a>.
              </span>
            </div>
            {errors.terms && (
              <span className="text-[10px] font-bold text-red-500 ml-6 animate-in fade-in">
                {errors.terms.message}
              </span>
            )}

            {tourStep === 5 && (
              <TourTooltip
                title="Bước 5: Điều khoản & Bảo mật (Bắt buộc)"
                description="Vui lòng đọc kỹ và đánh dấu vào ô trống để xác nhận bạn đồng ý với các Điều khoản và Chính sách bảo mật của chúng tôi trước khi đăng ký."
                onNext={() => setTourStep(6)}
                onSkip={() => setTourStep(0)}
                position="top"
              />
            )}
          </div>

          {/* ── STEP 6: SUBMIT BUTTON ── */}
          <div className={`pt-1 transition-all duration-300 ${
            tourStep === 6 ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg" : "relative z-10"
          }`}>
            <button
              type="submit"
              tabIndex={6}
              disabled={isSubmitting}
              className="group relative w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting
                  ? t("btn_submitting", { fallback: "ĐANG XỬ LÝ..." })
                  : t("btn_submit", { fallback: "ĐĂNG KÝ TÀI KHOẢN" })}
                <UserPlus className={`w-4 h-4 ${isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"} transition-transform`} />
              </span>
            </button>

            {tourStep === 6 && (
              <TourTooltip
                title="Bước 6: Hoàn tất Đăng ký"
                description="Sau khi điền đủ thông tin và đồng ý điều khoản, nhấn nút này để tạo tài khoản. Hệ thống có thể sẽ yêu cầu xác thực email sau đó."
                onNext={() => setTourStep(0)}
                onSkip={() => setTourStep(0)}
                isLast={true}
                position="top"
              />
            )}
          </div>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/80"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("or_auth", { fallback: "HOẶC" })}
            </span>
            <div className="h-px flex-1 bg-border/80"></div>
          </div>

          {/* Social Logins */}
          <div className="mt-3">
            <button
              type="button"
              tabIndex={7}
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
                Đăng ký bằng Google
              </span>
            </button>
          </div>

          {/* Navigate to Login */}
          <div className="pt-4 text-center">
            <p className="text-xs lg:text-sm font-medium text-muted-foreground">
              {t("have_account", { fallback: "Đã có tài khoản?" })}
              <Link
                href="/login"
                tabIndex={8}
                className="font-bold text-primary hover:underline hover:text-primary/80 ml-1.5 transition-colors"
              >
                {t("login_link", { fallback: "Đăng nhập" })}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
