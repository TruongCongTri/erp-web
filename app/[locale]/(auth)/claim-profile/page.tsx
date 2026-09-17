"use client";

import { useState, ClipboardEvent, KeyboardEvent, useEffect } from "react";
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Send,
  LogIn,
  ChevronRight,
  PlayCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";

// Navigation
import { Link, useRouter } from "@/utils/navigation";
import TourTooltip from "@/components/ui/TourTooltip";

// API Hook
import { useSubmitProfileClaimMutation } from "@/lib/store/hrApiSlice";

export default function ClaimProfilePage() {
  const t = useTranslations("Auth.ClaimProfile");
  const router = useRouter();

  // Step 1: Input Code, Step 2: Success & Auto Redirect
  const [step, setStep] = useState<1 | 2>(1);
  const [countdown, setCountdown] = useState(5);

  // API Mutation
  const [submitClaim] = useSubmitProfileClaimMutation();

  // ─── TOUR STATE ───
  // 0 = inactive, 1 = Employee Code, 2 = Submit Button, 3 = Skip Option
  const [tourStep, setTourStep] = useState<0 | 1 | 2 | 3>(0);

  // Validation Schema (Removed OTP)
  const acquireSchema = z.object({
    departmentCode: z
      .string()
      .min(2, t("validation_dept", { fallback: "Mã PB trống" })),
    employeeNumber: z
      .string()
      .min(1, t("validation_num", { fallback: "Mã số trống" })),
  });

  type AcquireInputs = z.infer<typeof acquireSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AcquireInputs>({
    resolver: zodResolver(acquireSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // ─── AUTO REDIRECT LOGIC ───
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        router.push("/dashboard");
      }
    }
    return () => clearTimeout(timer);
  }, [step, countdown, router]);

  // ─── SMART CODE SPLITTING LOGIC ───
  // Department codes can themselves contain dashes/digits (e.g. "HC-NS-1024"
  // is department "HC-NS" + number "1024", "D12-004" is department "D12" +
  // number "004"), and the dept/number separator can be "-", "_", "." or
  // whitespace (e.g. "CN-FQ.2603" is department "CN-FQ" + number "2603").
  // So we split on the LAST run of separator characters that is immediately
  // followed by digits to the end, rather than on the first "-" found.
  const splitEmployeeCode = (
    value: string,
  ): { dept: string; num: string } | null => {
    const match = value.trim().match(/^(.+?)[-_.\s]+(\d+)$/);
    if (!match) return null;
    return { dept: match[1].toUpperCase(), num: match[2] };
  };

  const handleCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text/plain");
    const split = splitEmployeeCode(pastedData);

    if (split) {
      e.preventDefault();
      setValue("departmentCode", split.dept);
      setValue("employeeNumber", split.num);
      clearErrors(["departmentCode", "employeeNumber"]);
      document.getElementById("employeeNumber")?.focus();
    }
  };

  const { onChange: deptOnChange, ...deptRegister } =
    register("departmentCode");
  const { onChange: numOnChange, ...numRegister } = register("employeeNumber");

  const onDeptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    const split = splitEmployeeCode(val);
    if (split) {
      setValue("departmentCode", split.dept);
      setValue("employeeNumber", split.num);
      clearErrors(["departmentCode", "employeeNumber"]);
      document.getElementById("employeeNumber")?.focus();
    } else {
      e.target.value = val;
      deptOnChange(e);
    }
  };

  const onNumKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value) {
      document.getElementById("departmentCode")?.focus();
    }
  };

  // ─── SUBMIT HANDLER ───
  const onSubmitClaim = async (data: AcquireInputs) => {
    try {
      // Send the combined code to the backend
      await submitClaim({
        employeeCode: `${data.departmentCode}-${data.employeeNumber}`,
      }).unwrap();

      setStep(2);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError("root", {
        type: "server",
        message:
          error?.data?.message ||
          t("error_send_request", {
            fallback: "Không thể gửi yêu cầu. Vui lòng thử lại.",
          }),
      });
    }
  };

  return (
    <div className="w-full h-full max-w-md mx-auto flex flex-col justify-center min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* ── BACKGROUND OVERLAY ── */}
      {tourStep > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300vw] h-[300vh] z-40 bg-foreground/10 backdrop-blur-[2px] transition-all duration-500 pointer-events-auto" />
      )}

      {/* ── FIXED HEADER ── */}
      <header className="shrink-0 mb-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            <Briefcase size={12} /> {t("badge", { fallback: "LIÊN KẾT HỒ SƠ" })}
          </div>

          {step === 1 && (
            <button
              type="button"
              onClick={() => setTourStep(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20 hover:bg-accent hover:text-white transition-colors cursor-pointer"
            >
              <PlayCircle size={12} /> Hướng dẫn
            </button>
          )}
        </div>

        <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight mb-2">
          {t("title_1", { fallback: "XÁC THỰC" })}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
            {t("title_2", { fallback: "VAI TRÒ" })}
          </span>
        </h1>
        <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed">
          {t("description", {
            fallback:
              "Nhập mã nhân viên của bạn để yêu cầu quyền truy cập trên hệ thống.",
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

        {/* ── SUCCESS STATE (STEP 2) ── */}
        {step === 2 ? (
          <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("success_title", { fallback: "Gửi yêu cầu thành công!" })}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
              {t("success_desc", {
                fallback:
                  "Yêu cầu cấp quyền của bạn đã được gửi đến bộ phận Nhân sự. Vui lòng chờ phê duyệt.",
              })}
            </p>

            <p className="text-xs font-semibold text-muted-foreground mb-4">
              Tự động chuyển hướng sau
              <span className="text-primary">{countdown}s</span>
            </p>

            <Link
              href="/vi/dashboard"
              className="group relative w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              VỀ TRANG CHỦ NGAY
              <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          /* ── ACQUIRE FORM (STEP 1) ── */
          <form onSubmit={handleSubmit(onSubmitClaim)} className="space-y-4">
            {/* ── TOUR STEP 1: Split Employee Code Input ── */}
            <div
              className={`space-y-1 transition-all duration-300 ${
                tourStep === 1
                  ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                  : "relative z-10"
              }`}
            >
              <label className="block text-xs font-bold text-foreground">
                {t("code_label", { fallback: "Mã nhân viên" })}
              </label>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="relative group w-1/3 min-w-[100px]">
                  <Briefcase
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.departmentCode ? "text-red-500" : "text-muted-foreground group-focus-within:text-primary"}`}
                  />
                  <input
                    {...deptRegister}
                    id="departmentCode"
                    type="text"
                    tabIndex={1}
                    disabled={isSubmitting}
                    onPaste={handleCodePaste}
                    onChange={onDeptChange}
                    aria-invalid={!!errors.departmentCode}
                    placeholder={t("dept_placeholder", { fallback: "VD: IT" })}
                    className={`w-full pl-10 pr-3 py-2.5 lg:py-3 bg-background border rounded-xl text-sm font-bold uppercase transition-all focus:outline-none focus:ring-2 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed ${
                      errors.departmentCode
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50"
                    }`}
                  />
                </div>

                <span className="text-muted-foreground/50 font-black">-</span>

                <div className="relative group flex-1">
                  <input
                    {...numRegister}
                    id="employeeNumber"
                    type="text"
                    inputMode="numeric"
                    tabIndex={2}
                    disabled={isSubmitting}
                    onPaste={handleCodePaste}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                      numOnChange(e);
                    }}
                    onKeyDown={onNumKeyDown}
                    aria-invalid={!!errors.employeeNumber}
                    placeholder={t("num_placeholder", { fallback: "1024" })}
                    className={`w-full px-4 py-2.5 lg:py-3 bg-background border rounded-xl text-sm font-bold tracking-wider transition-all focus:outline-none focus:ring-2 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed ${
                      errors.employeeNumber
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-border focus:border-primary focus:ring-primary/20 hover:border-primary/50"
                    }`}
                  />
                </div>
              </div>

              <p className="text-[10px] font-bold text-red-600 ml-1 min-h-[18px]">
                {errors.departmentCode?.message ||
                  errors.employeeNumber?.message}
              </p>

              {tourStep === 1 && (
                <TourTooltip
                  title="Bước 1: Nhập Mã Nhân Viên"
                  description="Nhập mã nhân viên của bạn. Bạn có thể copy toàn bộ mã (ví dụ: IT-1024) và dán trực tiếp vào ô này, hệ thống sẽ tự động tách."
                  onNext={() => {
                    setTourStep(2);
                  }}
                  onSkip={() => setTourStep(0)}
                />
              )}
            </div>

            {/* ── TOUR STEP 2: SUBMIT BUTTON ── */}
            <div
              className={`pt-2 transition-all duration-300 ${
                tourStep === 2
                  ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                  : "relative z-10"
              }`}
            >
              <button
                type="submit"
                tabIndex={3}
                disabled={isSubmitting}
                className="group relative w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting
                    ? t("btn_processing", { fallback: "ĐANG XỬ LÝ..." })
                    : t("btn_verify", { fallback: "GỬI YÊU CẦU LIÊN KẾT" })}
                  <Send
                    className={`w-4 h-4 ${isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"} transition-transform`}
                  />
                </span>
              </button>

              {tourStep === 2 && (
                <TourTooltip
                  title="Bước 2: Gửi Yêu Cầu"
                  description="Sau khi nhập mã, nhấn vào đây. Hệ thống sẽ ghi nhận và thông báo cho Nhân sự cấp quyền."
                  onNext={() => {
                    setTourStep(3);
                  }}
                  onSkip={() => setTourStep(0)}
                  position="top"
                />
              )}
            </div>

            {/* ── TOUR STEP 3: SKIP OPTION ── */}
            <div
              className={`pt-4 text-center transition-all duration-300 ${
                tourStep === 3
                  ? "relative z-50 ring-4 ring-primary/20 rounded-xl bg-background p-1.5 -mx-1.5 shadow-lg"
                  : "relative z-10"
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {t("guest_hint", { fallback: "Chưa có mã nhân viên?" })}
                <Link
                  href="/dashboard"
                  tabIndex={4}
                  className="inline-flex items-center font-bold text-primary hover:underline hover:text-primary/80 ml-1.5 transition-colors"
                >
                  {t("skip_link", { fallback: "Bỏ qua bước này" })}
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </Link>
              </p>

              {tourStep === 3 && (
                <TourTooltip
                  title="Bước 3: Bỏ qua (Khách)"
                  description="Nếu bạn chưa được cấp mã nhân viên (như đối tác hoặc nhân sự mới), bạn có thể nhấn bỏ qua để sử dụng hệ thống với tư cách Khách."
                  onNext={() => setTourStep(0)}
                  onSkip={() => setTourStep(0)}
                  isLast={true}
                  position="top"
                />
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
