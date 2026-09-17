"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
      className={`flex flex-col border-b border-border transition-all duration-300 bg-card ${isExpanded ? "lg:flex-1 lg:min-h-0 h-auto" : "flex-shrink-0"} ${className}`}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors flex-shrink-0 w-full text-left"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {title}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="lg:flex-1 lg:overflow-y-auto scrollbar-hide p-4 bg-background/50 fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Configuration Interface ─────────────────────────────────────────
export interface SidebarConfig {
  content: (collapsed: boolean) => React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

// ─── Main Layout Component ───────────────────────────────────────────────────
export interface DetailLayoutProps {
  // Header
  title?: React.ReactNode;
  onBack?: () => void;
  headerActions?: React.ReactNode;

  // Overlay (e.g., Disabled/Deleted state)
  overlay?: React.ReactNode;

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
  overlay,
  leftSidebar,
  rightSidebar,
  children,
  footer,
}: DetailLayoutProps) {
  // ─── LEFT SIDEBAR LOGIC (Controlled vs Uncontrolled) ───
  const [internalLeft, setInternalLeft] = useState(
    leftSidebar?.defaultCollapsed ?? false,
  );

  const isLeftCollapsed =
    leftSidebar?.collapsed !== undefined ? leftSidebar.collapsed : internalLeft;

  const toggleLeft = () => {
    const nextState = !isLeftCollapsed;
    if (leftSidebar?.collapsed === undefined) {
      setInternalLeft(nextState); // Only update internal state if uncontrolled
    }
    leftSidebar?.onCollapseChange?.(nextState); // Always notify parent if callback exists
  };

  // ─── RIGHT SIDEBAR LOGIC (Controlled vs Uncontrolled) ───
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
      setInternalRight(nextState); // Only update internal state if uncontrolled
    }
    rightSidebar?.onCollapseChange?.(nextState); // Always notify parent if callback exists
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background relative">
      {/* ── HEADER ── */}
      {/* <div className="flex items-center justify-between px-4 h-[var(--topbar-height,56px)] border-b border-border bg-card flex-shrink-0 z-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="btn-ghost flex items-center gap-1.5 text-xs px-2 py-1.5 flex-shrink-0"
              >
                <ArrowLeft size={13} /> Quay lại
              </button>
              <div className="w-px h-4 bg-border mx-1 sm:mx-3 flex-shrink-0" />
            </>
          )}
          <span className="text-sm font-bold text-foreground truncate">
            {title}
          </span>
        </div>
        {headerActions && (
          <div className="flex-shrink-0 ml-4">{headerActions}</div>
        )}
      </div> */}

      {/* ── BODY ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden relative">
        {/* Absolute Overlay Layer */}
        {overlay}

        {/* LEFT COLUMN */}
        {leftSidebar && (
          <div
            className={`relative flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-card transition-all duration-300 z-20 ${
              isLeftCollapsed ? "lg:w-[72px]" : "lg:w-[320px]"
            }`}
          >
            <button
              onClick={toggleLeft} // Updated to use smart toggle
              className="hidden lg:flex absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30"
            >
              {isLeftCollapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronLeft size={12} />
              )}
            </button>
            <div className="flex-1 lg:overflow-y-auto scrollbar-hide">
              {leftSidebar.content(isLeftCollapsed)}
            </div>
          </div>
        )}

        {/* CENTER COLUMN */}
        <div className="flex-1 flex flex-col min-w-0 bg-background lg:overflow-hidden relative">
          {children}
        </div>

        {/* RIGHT COLUMN */}
        {rightSidebar && (
          <div
            className={`relative flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-card transition-all duration-300 z-20 ${
              isRightCollapsed ? "lg:w-[72px]" : "lg:w-[320px]"
            }`}
          >
            <button
              onClick={toggleRight} // Updated to use smart toggle
              className="hidden lg:flex absolute -left-3 top-4 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted text-muted-foreground shadow-sm z-30"
            >
              {isRightCollapsed ? (
                <ChevronLeft size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
            <div className="flex-1 lg:overflow-y-auto scrollbar-hide">
              {rightSidebar.content(isRightCollapsed)}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      {footer && (
        <div className="flex-shrink-0 min-h-[var(--topbar-height,56px)] py-3 border-t border-border bg-card px-4 lg:px-5 flex items-center justify-center sm:justify-end gap-2 flex-wrap sm:flex-nowrap z-10">
          {footer}
        </div>
      )}
    </div>
  );
}
