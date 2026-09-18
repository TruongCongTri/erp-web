"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  ActivitySquare,
  Shield,
} from "lucide-react";

// ─── Shared Accordion Component ──────────────────────────────────────────────
export interface DetailAccordionProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DetailAccordion({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  className = "",
}: DetailAccordionProps) {
  return (
    <div
      className={`flex flex-col border-b border-border transition-all duration-200 bg-card ${
        isExpanded ? "lg:flex-1 lg:min-h-0 h-auto" : "shrink-0"
      } ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3.5 sm:py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors shrink-0 w-full text-left cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 text-muted-foreground min-w-0 pr-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="text-[11px] font-bold uppercase tracking-widest truncate text-foreground/80">
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={15} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="lg:flex-1 lg:overflow-y-auto scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 bg-background/50 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Configuration Interface ─────────────────────────────────────────
export interface SidebarConfig {
  label?: string;
  icon?: React.ReactNode;
  content: (collapsed: boolean) => React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  width?: string; // Tùy chọn độ rộng tùy biến (VD: "lg:w-[360px]")
}

// ─── Main Layout Component ───────────────────────────────────────────────────
export interface DetailLayoutProps {
  // Header
  title?: React.ReactNode;
  onBack?: () => void;
  headerActions?: React.ReactNode;

  // Mobile Mode Configuration
  mobileMode?: "tabs" | "stack";
  defaultMobileTab?: "left" | "center" | "right";
  centerTabLabel?: string;
  centerTabIcon?: React.ReactNode;

  // Overlay
  overlay?: React.ReactNode;

  // Sidebar Width Sync (Cố định chiều rộng 2 bên ở chế độ desktop)
  sidebarWidth?: string; // Mặc định là "lg:w-[320px]"

  // Left Sidebar
  leftSidebar?: SidebarConfig;

  // Center Main Content
  children: React.ReactNode;

  // Right Sidebar
  rightSidebar?: SidebarConfig;

  // Footer Actions
  footer?: React.ReactNode;
}

export function DetailLayout({
  title,
  onBack,
  headerActions,
  mobileMode = "tabs",
  defaultMobileTab,
  centerTabLabel = "Nội dung",
  centerTabIcon,
  overlay,
  sidebarWidth = "lg:w-[320px]",
  leftSidebar,
  rightSidebar,
  children,
  footer,
}: DetailLayoutProps) {
  // ─── DESKTOP VIEWPORT DETECTION ───
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(min-width: 1024px)").matches;
    }
    return true;
  });

  // ─── MOBILE TAB STATE ───
  const [mobileTab, setMobileTab] = useState<"left" | "center" | "right">(
    defaultMobileTab || (leftSidebar ? "left" : "center"),
  );

  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) {
        setMobileTab("center"); // Reset tab state to avoid leaking flex-1 when resizing to desktop
      }
    };

    setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // ─── LEFT SIDEBAR LOGIC ───
  const [internalLeft, setInternalLeft] = useState(
    leftSidebar?.defaultCollapsed ?? false,
  );

  const isLeftCollapsed =
    leftSidebar?.collapsed !== undefined ? leftSidebar.collapsed : internalLeft;

  const toggleLeft = () => {
    const nextState = !isLeftCollapsed;
    if (leftSidebar?.collapsed === undefined) {
      setInternalLeft(nextState);
    }
    leftSidebar?.onCollapseChange?.(nextState);
  };

  // ─── RIGHT SIDEBAR LOGIC ───
  const [internalRight, setInternalRight] = useState(
    rightSidebar?.defaultCollapsed ?? false,
  );

  const isRightCollapsed =
    rightSidebar?.collapsed !== undefined
      ? rightSidebar.collapsed
      : internalRight;

  const toggleRight = () => {
    const nextState = !isRightCollapsed;
    if (rightSidebar?.collapsed === undefined) {
      setInternalRight(nextState);
    }
    rightSidebar?.onCollapseChange?.(nextState);
  };

  // Chỉ kích hoạt thu gọn dạng icon trên màn hình Desktop (>= 1024px)
  const effectiveLeftCollapsed = isDesktop && isLeftCollapsed;
  const effectiveRightCollapsed = isDesktop && isRightCollapsed;

  const hasMultiplePanels = Boolean(leftSidebar || rightSidebar);

  const leftExpandedWidth = leftSidebar?.width || sidebarWidth;
  const rightExpandedWidth = rightSidebar?.width || sidebarWidth;

  return (
    <div className="flex flex-col h-[100dvh] lg:h-full max-h-[100dvh] overflow-hidden bg-background relative overscroll-contain">
      {/* ── HEADER ── */}
      {(title || onBack || headerActions) && (
        <header className="flex items-center justify-between px-4 sm:px-5 min-h-[var(--topbar-height,56px)] border-b border-border bg-card shrink-0 z-30 select-none">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            {onBack && (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-muted active:scale-95 text-foreground transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại</span>
                </button>
                <div className="w-px h-4 bg-border mx-1 shrink-0" />
              </>
            )}
            {title && (
              <h1 className="text-sm font-bold text-foreground truncate">
                {title}
              </h1>
            )}
          </div>
          {headerActions && (
            <div className="shrink-0 ml-3 flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </header>
      )}

      {/* ── MOBILE FLAT TABS ── */}
      {hasMultiplePanels && mobileMode === "tabs" && (
        <nav
          aria-label="Chuyển phân vùng chi tiết"
          className="lg:hidden flex w-full border-b border-border bg-card shrink-0 z-20"
        >
          <div className="flex w-full divide-x divide-border">
            {leftSidebar && (
              <button
                type="button"
                onClick={() => setMobileTab("left")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 transition-colors select-none cursor-pointer border-b-2 ${
                  mobileTab === "left"
                    ? "border-primary text-primary bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                {leftSidebar.icon || <User size={13} className="shrink-0" />}
                <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                  {leftSidebar.label || "Hồ sơ"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileTab("center")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 transition-colors select-none cursor-pointer border-b-2 ${
                mobileTab === "center"
                  ? "border-primary text-primary bg-muted/30"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
              }`}
            >
              {centerTabIcon || (
                <ActivitySquare size={13} className="shrink-0" />
              )}
              <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                {centerTabLabel}
              </span>
            </button>

            {rightSidebar && (
              <button
                type="button"
                onClick={() => setMobileTab("right")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 transition-colors select-none cursor-pointer border-b-2 ${
                  mobileTab === "right"
                    ? "border-primary text-primary bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                {rightSidebar.icon || <Shield size={13} className="shrink-0" />}
                <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                  {rightSidebar.label || "Hệ thống"}
                </span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* ── BODY VIEWPORT ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {overlay}

        {/* ── CỘT TRÁI (LEFT SIDEBAR) ── */}
        {leftSidebar && (
          <aside
            className={`relative flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-card transition-all duration-300 z-10 lg:shrink-0 ${
              effectiveLeftCollapsed ? "lg:w-[72px]" : leftExpandedWidth
            } ${
              mobileMode === "tabs"
                ? mobileTab === "left"
                  ? "flex max-lg:flex-1 max-lg:w-full max-lg:h-full lg:flex-none"
                  : "hidden lg:flex"
                : "flex w-full shrink-0 lg:flex-none"
            }`}
          >
            <button
              type="button"
              onClick={toggleLeft}
              aria-label={
                effectiveLeftCollapsed ? "Mở rộng cột trái" : "Thu gọn cột trái"
              }
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30 cursor-pointer"
            >
              {effectiveLeftCollapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronLeft size={12} />
              )}
            </button>

            <div className="flex-1 overflow-y-auto scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {leftSidebar.content(effectiveLeftCollapsed)}
            </div>
          </aside>
        )}

        {/* ── CỘT GIỮA (CENTER MAIN CONTENT) ── */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-background lg:overflow-hidden relative ${
            mobileMode === "tabs"
              ? mobileTab === "center"
                ? "flex w-full h-full"
                : "hidden lg:flex"
              : "flex w-full"
          }`}
        >
          {children}
        </main>

        {/* ── CỘT PHẢI (RIGHT SIDEBAR) ── */}
        {rightSidebar && (
          <aside
            className={`relative flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-card transition-all duration-300 z-10 lg:shrink-0 ${
              effectiveRightCollapsed ? "lg:w-[72px]" : rightExpandedWidth
            } ${
              mobileMode === "tabs"
                ? mobileTab === "right"
                  ? "flex max-lg:flex-1 max-lg:w-full max-lg:h-full lg:flex-none"
                  : "hidden lg:flex"
                : "flex w-full shrink-0 lg:flex-none"
            }`}
          >
            <button
              type="button"
              onClick={toggleRight}
              aria-label={
                effectiveRightCollapsed
                  ? "Mở rộng cột phải"
                  : "Thu gọn cột phải"
              }
              className="hidden lg:flex absolute -left-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30 cursor-pointer"
            >
              {effectiveRightCollapsed ? (
                <ChevronLeft size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>

            <div className="flex-1 overflow-y-auto scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {rightSidebar.content(effectiveRightCollapsed)}
            </div>
          </aside>
        )}
      </div>

      {/* ── FOOTER ACTIONS ── */}
      {footer && (
        <footer className="shrink-0 min-h-[56px] px-4 lg:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border bg-card flex items-center justify-stretch sm:justify-end gap-2 flex-wrap sm:flex-nowrap z-20">
          {footer}
        </footer>
      )}
    </div>
  );
}
