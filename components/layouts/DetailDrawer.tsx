"use client";
import React from "react";
import { X, ChevronDown } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ─── 1. REUSABLE DRAWER COMPONENTS (Can be moved to a shared layout file) ────
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
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-screen w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col slide-in-right">
        {/* HEADER */}
        <div
          className={`flex items-center justify-between px-5 h-[var(--topbar-height,56px)] flex-shrink-0 ${headerClassName}`}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{title}</h3>
              {subtitle && (
                <p className="text-[11px] opacity-70 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="flex-shrink-0 flex items-center justify-center px-5 h-[var(--topbar-height,56px)] border-t border-border bg-card">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

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
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {!isExpanded && collapsedSummary ? (
            collapsedSummary
          ) : (
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {title}
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform flex-shrink-0 ml-2 ${isExpanded ? "" : "-rotate-90"}`}
        />
      </button>

      {isExpanded && (
        <div className="px-5 pb-4 pt-1 animate-in fade-in slide-in-from-top-1">
          {children}
        </div>
      )}
    </div>
  );
}
