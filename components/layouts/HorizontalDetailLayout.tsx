"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Reusable Types ──────────────────────────────────────────────────────────
export interface SidebarConfig {
  content: (collapsed: boolean) => React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

// ─── 1. HORIZONTAL DETAIL ACCORDION (OPTIMIZED DOCKED ANIMATION) ─────────────
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
 * An accordion docked to the right edge that smoothly expands towards the left 
 * and collapses towards the right without shifting collapsed strips.
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
      className={`relative flex flex-col bg-card border-t lg:border-t-0 lg:border-l border-border overflow-hidden shrink-0 z-20 will-change-[width] ${
        isExpanded
          ? `w-full ${expandedWidth} shadow-xs`
          : `w-full ${collapsedWidth} lg:flex-none`
      } ${className}`}
    >
      {/* ── 1. DESKTOP COLLAPSED STRIP (Neo tuyệt đối vào cạnh phải, đứng yên không bị giật) ── */}
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

        {/* Chữ xoay dọc chuẩn, giữ vị trí cố định */}
        <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors [writing-mode:vertical-rl] rotate-180 truncate max-h-[260px]">
            {title}
          </span>
        </div>

        {badge && <div className="shrink-0">{badge}</div>}
      </button>

      {/* ── 2. DESKTOP EXPANDED CONTENT (Fade in/out tại chỗ, khóa min-width chống méo form) ── */}
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

      {/* ── 3. MOBILE FALLBACK (CSS Grid 0fr -> 1fr mượt mà trên điện thoại) ── */}
      <div className="lg:hidden flex flex-col w-full border-b border-border">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-between px-4 py-3 bg-card text-left w-full cursor-pointer hover:bg-muted/30"
        >
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
              {title}
            </span>
            {badge && <div className="ml-1">{badge}</div>}
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-250 ease-out ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-4 bg-background/50 border-t border-border max-h-[60vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
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
  /** Larger main column strictly optimized for form authoring */
  children: React.ReactNode;
  /** Docked side area designed for one or multiple HorizontalDetailAccordion panels */
  sidePanel?: React.ReactNode;
  /** Sticky Bottom Action Bar */
  footer?: React.ReactNode;
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
}: HorizontalDetailLayoutProps) {
  const activeSidebarConfig = sidebar || leftSidebar;

  const [internalLeft, setInternalLeft] = useState(
    activeSidebarConfig?.defaultCollapsed ?? false,
  );

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

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background relative">
      {/* ── TOP HEADER (Tự động ẩn hoàn toàn nếu không truyền props) ── */}
      {(title || onBack || headerActions) && (
        <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-card shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            {onBack && (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded hover:bg-muted transition-colors shrink-0 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Quay lại
                </button>
                <div className="w-px h-4 bg-border mx-1 sm:mx-2 shrink-0" />
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

      {/* ── WORKSPACE BODY ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden relative">
        {overlay}

        {/* ── COLUMN 1: LEFT CONTEXT SIDEBAR ── */}
        {activeSidebarConfig && (
          <aside
            className={`relative flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-card transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] will-change-[width] shrink-0 z-20 ${
              isLeftCollapsed ? "lg:w-[72px]" : "lg:w-[320px]"
            }`}
          >
            <button
              type="button"
              onClick={toggleLeft}
              title={
                isLeftCollapsed
                  ? "Mở rộng bảng điều khiển"
                  : "Thu gọn bảng điều khiển"
              }
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30 cursor-pointer"
            >
              {isLeftCollapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronLeft size={12} />
              )}
            </button>

            <div className="flex-1 lg:overflow-y-auto custom-scrollbar">
              {activeSidebarConfig.content(isLeftCollapsed)}
            </div>
          </aside>
        )}

        {/* ── COLUMN 2: CANVAS & DOCKED HORIZONTAL ACCORDIONS ── */}
        <main className="flex-1 flex flex-col lg:flex-row min-w-0 bg-background overflow-hidden relative">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative">
            {children}
          </div>
          {sidePanel}
        </main>
      </div>

      {/* ── STICKY FOOTER ── */}
      {footer && (
        <footer className="shrink-0 min-h-[56px] py-2.5 border-t border-border bg-card px-4 lg:px-6 flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          {footer}
        </footer>
      )}
    </div>
  );
}