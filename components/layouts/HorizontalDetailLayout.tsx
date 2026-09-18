"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  ActivitySquare,
  LayoutPanelLeft,
} from "lucide-react";

// ─── Reusable Types ──────────────────────────────────────────────────────────
export interface SidebarConfig {
  label?: string;
  icon?: React.ReactNode;
  content: (collapsed: boolean) => React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  width?: string;
}

// ─── 1. HORIZONTAL DETAIL ACCORDION (EXPANDS FULL PAGE ON MOBILE) ───────────
export interface HorizontalDetailAccordionProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** Width when expanded on desktop screens. Default: "lg:w-[420px]" */
  expandedWidth?: string;
  /** Width when collapsed on desktop screens. Default: "lg:w-11" */
  collapsedWidth?: string;
  /** Giữ ổn định layout bên trong trong suốt animation mở rộng. Default: "min-w-[380px] md:min-w-[420px]" */
  contentMinWidth?: string;
  className?: string;
}

/**
 * Accordion neo ngang trên Desktop và mở rộng toàn màn hình (Full Page) trên Mobile.
 */
export function HorizontalDetailAccordion({
  title,
  icon,
  badge,
  isExpanded,
  onToggle,
  children,
  expandedWidth = "lg:w-[420px]",
  collapsedWidth = "lg:w-11",
  contentMinWidth = "min-w-[380px] md:min-w-[420px]",
  className = "",
}: HorizontalDetailAccordionProps) {
  return (
    <aside
      aria-expanded={isExpanded}
      style={{
        transition:
          "width 300ms cubic-bezier(0.2, 0, 0, 1), flex-basis 300ms cubic-bezier(0.2, 0, 0, 1)",
      }}
      className={`relative flex flex-col bg-card border-b lg:border-b-0 lg:border-l border-border overflow-hidden z-20 will-change-[width] ${
        isExpanded
          ? `flex-1 min-h-0 h-full w-full lg:h-full lg:shrink-0 ${expandedWidth} shadow-xs`
          : `shrink-0 h-auto w-full lg:h-full lg:flex-none lg:shrink-0 ${collapsedWidth}`
      } ${className}`}
    >
      {/* ── 1. DESKTOP COLLAPSED STRIP (Neo tuyệt đối vào cạnh phải trên Desktop) ── */}
      <button
        type="button"
        onClick={onToggle}
        title={typeof title === "string" ? title : "Mở rộng"}
        aria-hidden={isExpanded}
        tabIndex={isExpanded ? -1 : 0}
        className={`hidden lg:flex flex-col items-center justify-between h-full py-4 px-1 select-none cursor-pointer group absolute right-0 top-0 bottom-0 z-10 transition-opacity duration-200 ${
          isExpanded
            ? "opacity-0 pointer-events-none"
            : "opacity-100 pointer-events-auto hover:bg-muted/40"
        }`}
        style={{ width: "44px" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-muted/70 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-muted transition-colors">
            <ChevronLeft size={15} />
          </div>
          {icon && (
            <span className="text-muted-foreground group-hover:text-primary transition-colors">
              {icon}
            </span>
          )}
        </div>

        {/* Chữ xoay dọc chuẩn desktop */}
        <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors [writing-mode:vertical-rl] rotate-180 truncate max-h-[260px]">
            {title}
          </span>
        </div>

        {badge && <div className="shrink-0">{badge}</div>}
      </button>

      {/* ── 2. DESKTOP EXPANDED CONTENT ── */}
      <div
        className={`hidden lg:flex flex-col h-full w-full ${contentMinWidth} transition-opacity duration-200 ease-out ${
          isExpanded
            ? "opacity-100 pointer-events-auto delay-75"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20 shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-primary shrink-0">{icon}</span>}
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
              {title}
            </h3>
            {badge && <div className="shrink-0 ml-1">{badge}</div>}
          </div>

          <button
            type="button"
            onClick={onToggle}
            title="Thu gọn"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-5 bg-background/50 custom-scrollbar">
          {children}
        </div>
      </div>

      {/* ── 3. MOBILE FULL-PAGE ACCORDION TAB ── */}
      <div
        className={`lg:hidden flex flex-col w-full ${
          isExpanded
            ? "flex-1 min-h-0 h-full overflow-hidden"
            : "shrink-0 h-auto"
        }`}
      >
        {/* Header Strip Toggle Button */}
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center justify-between px-4 py-3 bg-card text-left w-full cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-colors select-none border-b border-border ${
            isExpanded ? "bg-muted/20 border-b-2 border-b-primary" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {icon && (
              <span
                className={
                  isExpanded
                    ? "text-primary shrink-0"
                    : "text-muted-foreground shrink-0"
                }
              >
                {icon}
              </span>
            )}
            <span
              className={`text-[11px] font-bold uppercase tracking-widest truncate ${
                isExpanded ? "text-primary" : "text-foreground"
              }`}
            >
              {title}
            </span>
            {badge && <div className="ml-1 shrink-0">{badge}</div>}
          </div>
          {isExpanded ? (
            <ChevronUp size={15} className="text-primary shrink-0" />
          ) : (
            <ChevronDown size={15} className="text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Full-Page Content Viewport */}
        {isExpanded && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 bg-background/50 custom-scrollbar overscroll-contain animate-in fade-in duration-200">
            {children}
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── 2. MAIN HORIZONTAL DETAIL LAYOUT ────────────────────────────────────────
export interface HorizontalDetailLayoutProps {
  /** Page or modal title */
  title?: React.ReactNode;
  /** Back button handler */
  onBack?: () => void;
  /** Right aligned actions in the header bar */
  headerActions?: React.ReactNode;
  /** Optional overlay (e.g., Disabled/Deleted/Locked state banner) */
  overlay?: React.ReactNode;
  /** Left Sidebar config (Basic profile / Context information) */
  sidebar?: SidebarConfig;
  /** Alias for sidebar for backward compatibility */
  leftSidebar?: SidebarConfig;
  /** Main column accommodating any number of HorizontalDetailAccordions */
  children: React.ReactNode;
  /** Optional docked side area for backward compatibility */
  sidePanel?: React.ReactNode;
  /** Sticky Bottom Action Bar */
  footer?: React.ReactNode;

  // ─── Mobile View Enhancements ───
  mobileMode?: "tabs" | "stack";
  defaultMobileTab?: "left" | "center" | "right";
  centerTabLabel?: string;
  centerTabIcon?: React.ReactNode;
  sidePanelTabLabel?: string;
  sidePanelTabIcon?: React.ReactNode;
}

export function HorizontalDetailLayout({
  title,
  onBack,
  headerActions,
  overlay,
  sidebar,
  leftSidebar,
  children,
  sidePanel,
  footer,
  mobileMode = "tabs",
  defaultMobileTab,
  centerTabLabel = "Nội dung",
  centerTabIcon,
  sidePanelTabLabel = "Chi tiết",
  sidePanelTabIcon,
}: HorizontalDetailLayoutProps) {
  const activeSidebarConfig = sidebar || leftSidebar;

  // ─── MOBILE TAB SELECTION ───
  const [mobileTab, setMobileTab] = useState<"left" | "center" | "right">(
    defaultMobileTab || "center",
  );

  // ─── DESKTOP LEFT SIDEBAR STATE ───
  const [internalLeft, setInternalLeft] = useState(
    activeSidebarConfig?.defaultCollapsed ?? false,
  );

  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(min-width: 1024px)").matches;
    }
    return true;
  });

  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) {
        setMobileTab("center"); // Clean up mobile tab state on desktop return
      }
    };

    setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const isLeftCollapsed =
    activeSidebarConfig?.collapsed !== undefined
      ? activeSidebarConfig.collapsed
      : internalLeft;

  const toggleLeft = () => {
    const nextState = !isLeftCollapsed;
    if (activeSidebarConfig?.collapsed === undefined) {
      setInternalLeft(nextState);
    }
    activeSidebarConfig?.onCollapseChange?.(nextState);
  };

  const hasMultiplePanels = Boolean(activeSidebarConfig || sidePanel);
  const leftWidth = activeSidebarConfig?.width || "lg:w-[320px]";
  // Only allow collapsed state on desktop screens (lg and above)
  const effectiveCollapsed = isDesktop && isLeftCollapsed;
  return (
<div className="flex flex-col h-full w-full flex-1 min-h-0 overflow-hidden bg-background relative overscroll-contain">      {/* ── TOP HEADER ── */}
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
            <div className="shrink-0 ml-4 flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </header>
      )}

      {/* ── MOBILE FLAT TABS (NAVBAR ĐỒNG BỘ ACCORDION STYLE) ── */}
      {hasMultiplePanels && mobileMode === "tabs" && (
        <nav
          aria-label="Chuyển phân vùng chi tiết"
          className="lg:hidden flex w-full border-b border-border bg-card shrink-0 z-20"
        >
          <div className="flex w-full divide-x divide-border">
            {activeSidebarConfig && (
              <button
                type="button"
                onClick={() => setMobileTab("left")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 transition-colors select-none cursor-pointer border-b-2 ${
                  mobileTab === "left"
                    ? "border-primary text-primary bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                {activeSidebarConfig.icon || (
                  <User size={13} className="shrink-0" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                  {activeSidebarConfig.label || "Hồ sơ"}
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

            {sidePanel && (
              <button
                type="button"
                onClick={() => setMobileTab("right")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 transition-colors select-none cursor-pointer border-b-2 ${
                  mobileTab === "right"
                    ? "border-primary text-primary bg-muted/30"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                {sidePanelTabIcon || (
                  <LayoutPanelLeft size={13} className="shrink-0" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest truncate">
                  {sidePanelTabLabel}
                </span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* ── WORKSPACE BODY ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {overlay}

        {/* ── COLUMN 1: LEFT CONTEXT SIDEBAR ── */}
        {activeSidebarConfig && (
          <aside
            className={`relative flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-card transition-all duration-300 z-10 lg:shrink-0 ${
              effectiveCollapsed ? "lg:w-[72px]" : leftWidth
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
              title={
                effectiveCollapsed ? "Mở rộng cột trái" : "Thu gọn cột trái"
              }
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30 cursor-pointer"
            >
              {effectiveCollapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronLeft size={12} />
              )}
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeSidebarConfig.content(effectiveCollapsed)}
            </div>
          </aside>
        )}

        {/* ── COLUMN 2: CANVAS & DOCKED HORIZONTAL ACCORDIONS ── */}
        <main
          className={`flex-1 flex flex-col lg:flex-row min-w-0 bg-background overflow-hidden relative ${
            mobileMode === "tabs"
              ? mobileTab === "center" || mobileTab === "right"
                ? "flex w-full h-full"
                : "hidden lg:flex"
              : "flex w-full"
          }`}
        >
          {/* Vùng chứa Children - hỗ trợ bất kỳ số lượng Accordion nào */}
          <div
            className={`flex-1 flex flex-col lg:flex-row min-w-0 h-full w-full overflow-hidden relative ${
              mobileMode === "tabs" && mobileTab === "right"
                ? "hidden lg:flex"
                : "flex"
            }`}
          >
            {children}
          </div>

          {/* Vùng SidePanel tùy chọn (hỗ trợ tương thích ngược) */}
          {sidePanel && (
            <div
              className={`shrink-0 flex flex-col lg:flex-row ${
                mobileMode === "tabs"
                  ? mobileTab === "right"
                    ? "flex flex-1 w-full h-full overflow-y-auto"
                    : "hidden lg:flex"
                  : "flex w-full lg:w-auto"
              }`}
            >
              {sidePanel}
            </div>
          )}
        </main>
      </div>

      {/* ── STICKY FOOTER (AN TOÀN CHO IOS HOME BAR) ── */}
      {footer && (
        <footer className="shrink-0 min-h-[56px] px-4 lg:px-6 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border bg-card flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          {footer}
        </footer>
      )}
    </div>
  );
}
