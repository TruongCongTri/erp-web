"use client";
import React, { useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ─── 1. REUSABLE DRAWER COMPONENTS (Mobile & Desktop Responsive) ─────────────
// ─────────────────────────────────────────────────────────────────────────────

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  headerClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function DetailDrawer({
  isOpen,
  onClose,
  icon,
  title,
  subtitle,
  headerClassName = "bg-card text-foreground border-b border-border",
  footer,
  children,
}: DetailDrawerProps) {
  // Khóa cuộn trang nền khi mở Drawer trên thiết bị di động
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP: Làm mờ nhẹ nền, hỗ trợ bấm ra ngoài để đóng trên mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* DRAWER CONTAINER: h-[100dvh] đảm bảo không bị thanh URL di động che khuất */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed right-0 top-0 h-[100dvh] w-full sm:max-w-sm md:max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col overscroll-contain animate-in slide-in-from-right duration-300 ease-out"
      >
        {/* HEADER: Chiều cao chuẩn, nút chạm lớn dễ bấm */}
        <div
          className={`flex items-center justify-between px-4 sm:px-5 h-[var(--topbar-height,56px)] shrink-0 select-none ${headerClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] opacity-75 truncate leading-tight mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng chi tiết"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY: Cuộn mượt mà trên mobile touch (-webkit-overflow-scrolling: touch) */}
        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-6">
          {children}
        </div>

        {/* FOOTER: Bổ sung khoảng đệm đáy cho thanh Home Bar của iPhone / Android */}
        {footer && (
          <div className="shrink-0 flex items-center justify-center px-4 sm:px-5 min-h-[56px] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 border-t border-border bg-card">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── 2. DRAWER SECTION COMPONENT ─────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

interface DrawerSectionProps {
  title: string;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  collapsedSummary?: React.ReactNode;
  children: React.ReactNode;
}

export function DrawerSection({
  title,
  icon,
  isExpanded,
  onToggle,
  collapsedSummary,
  children,
}: DrawerSectionProps) {
  return (
    <div className="border-b border-border/80 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-muted/50 active:bg-muted/70 transition-colors text-left select-none cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {!isExpanded && collapsedSummary ? (
            collapsedSummary
          ) : (
            <div className="flex items-center gap-2 truncate">
              {icon && (
                <span className="shrink-0 text-muted-foreground">{icon}</span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {title}
              </span>
            </div>
          )}
        </div>

        <ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform duration-200 shrink-0 ml-1 ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 pt-1 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
}
