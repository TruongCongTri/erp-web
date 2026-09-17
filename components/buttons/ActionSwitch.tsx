/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionSwitchProps {
  /** Current checked state of the switch */
  checked: boolean;
  disabled?: boolean;
  isLoading?: boolean;

  /** If true, clicking instantly shows an "Under Development" toast and stops. */
  isUnderDevelopment?: boolean;

  /** If true, shows a confirmation popup before executing the action. */
  requireConfirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;

  /** The actual action to perform. Receives the NEW checked state. */
  onAction?: (newChecked: boolean) => Promise<any> | any;

  loadingMessage?: string;
  successMessage?: string | ((data: any) => string);
  errorMessage?: string | ((error: any) => string);

  toastOptions?: any;
  tooltip?: string;
  className?: string;
  id?: string;
}

export default function ActionSwitch({
  checked,
  disabled = false,
  isLoading = false,
  isUnderDevelopment = false,
  requireConfirm = false,
  confirmTitle = "Xác nhận",
  confirmMessage = "Bạn có chắc chắn muốn thay đổi trạng thái này không?",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onAction,
  loadingMessage = "Đang xử lý...",
  successMessage = "Thao tác thành công!",
  errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
  toastOptions,
  tooltip,
  className = "",
  id,
}: ActionSwitchProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetState, setTargetState] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckedChange = (newChecked: boolean) => {
    if (isUnderDevelopment) {
      gooeyToast.info("Tính năng đang phát triển!", {
        description:
          "Chúng tôi sẽ sớm ra mắt tính năng này trong bản cập nhật tới.",
        ...toastOptions,
      } as any);
      return;
    }

    if (requireConfirm) {
      setShowConfirm(true);
    } else {
      executeAction();
    }
  };

  const executeAction = async () => {
    if (!onAction) return;

    setShowConfirm(false);
    setIsPending(true);

    // Guaranteed Boolean: The new state is ALWAYS the exact opposite of current state
    const nextState = !checked;

    const actionPromise = (async () => {
      return await onAction(nextState);
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
      ...toastOptions,
    } as any);

    try {
      await actionPromise;
    } catch (error) {
      // Suppressed since goeyToast.promise handles visual feedback
    } finally {
      setIsPending(false);
    }
  };

  const isSwitchDisabled = disabled || isPending || isLoading;

  const switchElement = (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={isSwitchDisabled}
      />
      {/* Show a subtle spinner overlay when processing */}
      {(isPending || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full pointer-events-none">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className={
                  isSwitchDisabled
                    ? "cursor-not-allowed inline-flex"
                    : "inline-flex"
                }
              />
            }
          >
            {switchElement}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        switchElement
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
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={16} className="text-amber-700" />
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
