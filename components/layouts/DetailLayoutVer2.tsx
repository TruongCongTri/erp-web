"use client";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// ─── Shared Accordion Component ──────────────────────────────────────────────
export interface DetailAccordionPropsVer2 {
  title: React.ReactNode;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DetailAccordionVer2({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  className = "",
}: DetailAccordionPropsVer2) {
  return (
    <div
      className={`flex flex-col border-b border-border transition-all duration-300 bg-card ${
        isExpanded ? "lg:flex-1 lg:min-h-0 h-auto" : "flex-shrink-0"
      } ${className}`}
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

// ─── Main 2-Column Layout Component ──────────────────────────────────────────
export interface DetailColumnVer2 {
  content: React.ReactNode;
  footer?: React.ReactNode;
  className?: string; // Optional override for the column container
}

export interface DetailLayoutPropsVer2 {
  // Overlay (e.g., Disabled/Deleted state)
  overlay?: React.ReactNode;

  // 1/3 Left Column (Typically Lists, Tables, or Context)
  left: DetailColumnVer2;

  // 2/3 Right Column (Typically Details, Forms, or Matrix)
  right: DetailColumnVer2;
}

export function DetailLayoutVer2({ overlay, left, right }: DetailLayoutPropsVer2) {
  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-background relative">
      {/* ── Absolute Overlay Layer ── */}
      {overlay}

      {/* ── LEFT COLUMN (1/3 Width) ── */}
      <div
        className={`w-full lg:w-1/3 lg:max-w-[33.333333%] flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-card z-20 ${
          left.className || ""
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
          {left.content}
        </div>

        {/* Left Column Footer */}
        {left.footer && (
          <div className="flex-shrink-0 min-h-[var(--topbar-height,56px)] px-4 py-3 border-t border-border bg-card flex items-center justify-between z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            {left.footer}
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN (2/3 Width) ── */}
      <div
        className={`w-full lg:flex-1 flex flex-col min-w-0 bg-background relative z-10 ${
          right.className || ""
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
          {right.content}
        </div>

        {/* Right Column Footer */}
        {right.footer && (
          <div className="flex-shrink-0 min-h-[var(--topbar-height,56px)] px-4 lg:px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            {right.footer}
          </div>
        )}
      </div>
    </div>
  );
}
