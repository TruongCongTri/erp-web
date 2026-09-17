/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Loader2, AlertTriangle, X, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createPortal } from "react-dom";

// ─── GOEY TOAST ───
import { gooeyToast } from "@/components/ui/goey-toaster";

// ─── PERMISSION HOOK ───
import { usePermissions } from "@/hooks/usePermissions";

// ─── HELPER SO KHỚP QUYỀN CHUẨN ENTERPRISE ───
function checkSinglePermission(
  userPerms: string[],
  requiredPerm: string,
): boolean {
  if (userPerms.includes("*:*:any")) return true;
  if (userPerms.includes(requiredPerm)) return true;

  const [reqRes, reqAct, reqScope] = requiredPerm.split(":");

  return userPerms.some((userP) => {
    if (userP === "*:*:any") return true;
    const [uRes, uAct, uScope] = userP.split(":");
    const matchRes = uRes === "*" || uRes === reqRes;
    const matchAct = uAct === "*" || uAct === reqAct;
    const matchScope =
      !reqScope || !uScope || uScope === "any" || uScope === reqScope;
    return matchRes && matchAct && matchScope;
  });
}

export interface ActionButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onError"
> {
  // ─── PHÂN QUYỀN TÍCH HỢP ───
  /** Danh sách quyền chi tiết (vd: ['ats_job_post:create:any', 'ats_job_post:create:dept']) */
  allowedPermissions?: string[];

  /** Danh sách tài nguyên (vd: ['ats_job_post', 'ats_requisition']) */
  allowedResources?: string[];

  /** Bắt buộc phải có TẤT CẢ các quyền trong danh sách (Mặc định: false - chỉ cần 1 quyền là đủ) */
  requireAllPermissions?: boolean;

  /**
   * Hành vi khi không có quyền:
   * - "hide": Ẩn hoàn toàn nút (return null)
   * - "disable": Vô hiệu hóa nút, thêm icon ổ khóa và hiển thị tooltip giải thích
   * Mặc định: "hide"
   */
  permissionBehavior?: "hide" | "disable";

  /** Nội dung tooltip hiển thị khi nút bị khóa do thiếu quyền */
  deniedTooltip?: string;

  /** Tự động hiển thị icon ổ khóa nhỏ khi nút bị disable do quyền */
  showLockIcon?: boolean;

  // ─── CÁC TÍNH NĂNG NGUYÊN BẢN ───
  /** If true, clicking instantly shows an "Under Development" toast and stops. */
  isUnderDevelopment?: boolean;

  /** If true, shows a confirmation popup before executing the action. */
  requireConfirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;

  /** The actual action to perform. Can be async and return data. */
  onAction?: () => Promise<any> | any;

  /** External loading state to force the button into a disabled/loading state */
  isLoading?: boolean;

  /** Loading message for toast.promise */
  loadingMessage?: string;
  /** Toast message upon success. Can be a string or a function that receives the resolved data. */
  successMessage?: string | ((data: any) => string);
  /** Toast message upon error. Can be a string or a function that receives the rejected error. */
  errorMessage?: string | ((error: any) => string);

  toastOptions?: {
    description?:
      | React.ReactNode
      | { success?: React.ReactNode; error?: React.ReactNode };
    action?:
      | {
          label: string;
          onClick: () => void;
          successLabel?: string;
        }
      | {
          success?: {
            label: string;
            onClick: () => void;
            successLabel?: string;
          };
          error?: { label: string; onClick: () => void; successLabel?: string };
        };
    spring?: boolean;
    showProgress?: boolean;
    duration?: number;
    onDismiss?: (id: string | number) => void;
    onAutoClose?: (id: string | number) => void;
    classNames?: any;
  };

  /** Set to true if the children is just an Icon, making the button square/circular. */
  iconOnly?: boolean;

  /** Name of the action, used to render the Tooltip */
  tooltip?: string;

  /** Custom variant styles */
  variant?: "primary" | "destructive" | "outline" | "ghost" | "secondary";
}

export default function ActionButton({
  // Phân quyền
  allowedPermissions,
  allowedResources,
  requireAllPermissions = false,
  permissionBehavior = "hide",
  deniedTooltip = "Bạn không có quyền thực hiện hành động này",
  showLockIcon = true,

  // Các props cơ bản
  onClick,
  isUnderDevelopment = false,
  requireConfirm = false,
  confirmTitle = "Xác nhận hành động",
  confirmMessage = "Bạn có chắc chắn muốn thực hiện hành động này không?",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onAction,
  isLoading = false,
  loadingMessage = "Đang xử lý...",
  successMessage = "Thao tác thành công!",
  errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
  toastOptions,
  iconOnly = false,
  tooltip,
  variant = "primary",
  className = "",
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Lấy danh sách quyền từ hệ thống
  const {
    userPerms = [],
    roleSlug,
    isLoading: isPermLoading,
  } = usePermissions();

  // Kiểm tra quyền hạn của người dùng hiện tại
  const isAuthorized = useMemo(() => {
    if (isPermLoading) return true; // Tránh flicker lúc đang nạp phiên đăng nhập
    if (!allowedPermissions?.length && !allowedResources?.length) return true; // Nút không yêu cầu quyền
    if (roleSlug === "SUPER_ADMIN" || userPerms.includes("*:*:any"))
      return true; // Toàn quyền tối cao

    let permPassed = true;
    if (allowedPermissions && allowedPermissions.length > 0) {
      permPassed = requireAllPermissions
        ? allowedPermissions.every((p) => checkSinglePermission(userPerms, p))
        : allowedPermissions.some((p) => checkSinglePermission(userPerms, p));
    }

    let resourcePassed = true;
    if (allowedResources && allowedResources.length > 0) {
      const userResources = userPerms.map((p) => p.split(":")[0]);
      resourcePassed = requireAllPermissions
        ? allowedResources.every(
            (r) => userResources.includes(r) || userResources.includes("*"),
          )
        : allowedResources.some(
            (r) => userResources.includes(r) || userResources.includes("*"),
          );
    }

    return permPassed && resourcePassed;
  }, [
    userPerms,
    roleSlug,
    isPermLoading,
    allowedPermissions,
    allowedResources,
    requireAllPermissions,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nếu không có quyền và chọn ẩn: không render DOM
  if (!isPermLoading && !isAuthorized && permissionBehavior === "hide") {
    return null;
  }

  const isDeniedByPermission = !isPermLoading && !isAuthorized;
  const isButtonDisabled =
    disabled || isPending || isLoading || isDeniedByPermission;
  const showSpinner = isPending || isLoading;

  // Xác định nội dung Tooltip: ưu tiên thông báo từ chối quyền nếu nút bị khóa
  const effectiveTooltip = isDeniedByPermission
    ? deniedTooltip
    : tooltip || props.title;

  const shouldRenderTooltip = !!effectiveTooltip;

  const buttonProps = { ...props };
  if (shouldRenderTooltip) {
    delete buttonProps.title;
  }

  // ─── STYLING ───
  const baseStyles =
    "relative inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const shapeStyles = iconOnly
    ? "w-9 h-9 rounded-lg"
    : "px-4 py-2 rounded-lg text-sm gap-2";

  const variantsStyles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50",
    outline:
      "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    ghost:
      "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
  };

  const executeAction = async () => {
    if (!onAction) return;

    setShowConfirm(false);
    setIsPending(true);

    const actionPromise = (async () => {
      return await onAction();
    })();

    gooeyToast.promise(actionPromise, {
      loading: loadingMessage,
      success: (data: any) =>
        typeof successMessage === "function"
          ? successMessage(data)
          : successMessage,
      error: (err: any) => {
        if (err?.type === "warning") {
          return err.message || "Cảnh báo: Hành động không hoàn tất.";
        }
        return typeof errorMessage === "function"
          ? errorMessage(err)
          : err?.message || errorMessage;
      },
      description: toastOptions?.description as any,
      action: toastOptions?.action as any,
      spring: toastOptions?.spring,
      showProgress: toastOptions?.showProgress,
      duration: toastOptions?.duration,
      onDismiss: toastOptions?.onDismiss,
      onAutoClose: toastOptions?.onAutoClose,
      classNames: toastOptions?.classNames,
    } as any);

    try {
      await actionPromise;
    } catch {
      // Đã được xử lý bởi gooeyToast.promise
    } finally {
      setIsPending(false);
    }
  };

  // ─── HANDLERS ───
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDeniedByPermission) {
      gooeyToast.error(deniedTooltip);
      return;
    }

    if (isUnderDevelopment) {
      gooeyToast.info("Tính năng đang phát triển!", {
        description:
          "Chúng tôi sẽ sớm ra mắt tính năng này trong bản cập nhật tới.",
        spring: toastOptions?.spring,
        showProgress: toastOptions?.showProgress,
      } as any);
      return;
    }

    if (onClick) {
      onClick(e);
    }

    if (requireConfirm) {
      setShowConfirm(true);
    } else {
      await executeAction();
    }
  };

  // ─── COMPONENT RENDERING ───
  const buttonElement = (
    <button
      type="button"
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`${baseStyles} ${shapeStyles} ${variantsStyles[variant]} ${
        isDeniedByPermission ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
      {...buttonProps}
    >
      {showSpinner ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {isDeniedByPermission && showLockIcon && (
            <Lock className="w-3.5 h-3.5 opacity-80 shrink-0" />
          )}
          {children}
        </>
      )}
    </button>
  );

  return (
    <>
      {shouldRenderTooltip ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className={
                  isButtonDisabled
                    ? "cursor-not-allowed inline-flex"
                    : "inline-flex"
                }
              />
            }
          >
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent>
            <p
              className={isDeniedByPermission ? "text-red-400 font-medium" : ""}
            >
              {effectiveTooltip}
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        buttonElement
      )}

      {/* ─── CONFIRMATION PORTAL ─── */}
      {showConfirm &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 animate-in fade-in">
            <div
              className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 dark:bg-amber-950/50">
                    <AlertTriangle
                      size={16}
                      className="text-amber-700 dark:text-amber-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {confirmTitle}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {confirmMessage}
                </p>
              </div>

              {/* Footer */}
              <div className="px-5 pb-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={executeAction}
                  className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
