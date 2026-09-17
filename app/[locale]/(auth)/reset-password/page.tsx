"use client";

import { useEffect } from "react";
import { Mail, Key, ShieldCheck, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";

// Navigation
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { gooeyToast } from "@/components/ui/goey-toaster";

import PasswordInput from "@/components/input/PasswordInput";
import { useResetPasswordMutation } from "@/lib/store/authApiSlice";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth.ResetPassword");
  // const router = useRouter();
  const searchParams = useSearchParams();

  const [resetPasswordApi] = useResetPasswordMutation();

  const resetPasswordSchema = z.object({
    email: z
      .string()
      .email(t("validation_email", { fallback: "Email không hợp lệ" })),
    otp: z
      .string()
      .length(
        6,
        t("validation_code", { fallback: "Mã xác nhận phải có 6 ký tự" }),
      ),
    newPassword: z.string().min(
      6,
      t("validation_password", {
        fallback: "Mật khẩu phải có ít nhất 6 ký tự",
      }),
    ),
  });

  type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    // Automatically fill the email if it was passed in the URL
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setValue("email", emailParam);
      setFocus("otp"); // Focus on the code input next
    } else {
      setFocus("email");
    }
  }, [searchParams, setValue, setFocus]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    try {
      await resetPasswordApi({
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      }).unwrap();

      gooeyToast.success(
        t("success_message", {
          fallback: "Mật khẩu đã được cập nhật thành công!",
        }),
      );
      setTimeout(() => {
        window.location.href = "/vi/login";
      }, 1000);
    } catch (err: any) {
      setError("root", {
        type: "server",
        message:
          err?.data?.message ||
          t("error_generic", {
            fallback: "Mã xác nhận không hợp lệ hoặc đã hết hạn.",
          }),
      });
    }
  };

  const onError = () => {
    if (errors.email) setFocus("email");
    else if (errors.otp) setFocus("otp");
    else if (errors.newPassword) setFocus("newPassword");
  };

  return (
    <div className="w-full h-full max-w-md mx-auto flex flex-col justify-center min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── FIXED HEADER ── */}
      <header className="shrink-0 mb-5">
        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-2">
          {t("title_1", { fallback: "ĐẶT LẠI" })}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
            {t("title_2", { fallback: "MẬT KHẨU" })}
          </span>
        </h1>
        <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
          {t("description", {
            fallback: "Nhập mã xác nhận chúng tôi vừa gửi đến email của bạn.",
          })}
        </p>
      </header>

      {/* ── SCROLLABLE FORM AREA ── */}
      <div className="shrink min-h-0 overflow-y-auto scrollbar-hide pb-4 pr-1">
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-3.5"
        >
          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              {t("email_label", { fallback: "Email" })}
            </label>
            <div className="relative group">
              <Mail
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("email")}
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
          </div>

          {/* Verification Code Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              {t("code_label", { fallback: "Mã xác nhận (6 chữ số)" })}
            </label>
            <div className="relative group">
              <ShieldCheck
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.otp ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("otp")}
                type="text"
                tabIndex={2}
                maxLength={6}
                aria-invalid={!!errors.otp}
                aria-describedby={errors.otp ? "code-error" : undefined}
                placeholder={t("code_placeholder", { fallback: "------" })}
                className={`w-full pl-10 py-2.5 lg:py-3 bg-background border rounded-xl text-sm font-medium tracking-[0.5em] text-center placeholder:tracking-normal transition-all focus:outline-none focus:ring-2 ${
                  errors.otp
                    ? "border-red-500 focus:ring-red-500/20 pr-32"
                    : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50 pr-4"
                }`}
              />
              {errors.otp && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 pointer-events-none bg-background/90 backdrop-blur-sm pl-2 truncate max-w-[40%] text-right animate-in fade-in"
                  title={errors.otp.message}
                >
                  {errors.otp.message}
                </span>
              )}
            </div>
          </div>

          {/* New Password Input */}
          {/* <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              {t("password_label", { fallback: "Mật khẩu mới" })}
            </label>
            <div className="relative group">
              <Key
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
              />
              <input
                {...register("password")}
                type="password"
                tabIndex={3}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
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
          <PasswordInput
            id="confirm-password"
            label={t("password_label", {
              fallback: "Mật khẩu moiws",
            })}
            placeholder={t("password_placeholder", {
              fallback: "Nhập lại mật khẩu",
            })}
            tabIndex={2}
            error={errors.newPassword?.message}
            registration={register("newPassword")}
          />
          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              tabIndex={4}
              disabled={isSubmitting}
              className="group relative w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting
                  ? t("btn_submitting", { fallback: "ĐANG XỬ LÝ..." })
                  : t("btn_submit", { fallback: "CẬP NHẬT MẬT KHẨU" })}
                <RefreshCw
                  className={`w-4 h-4 ${isSubmitting ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`}
                />
              </span>
            </button>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              tabIndex={5}
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {t("abort", { fallback: "Hủy bỏ và quay lại" })}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
