import React from "react";

export default function ATSLoading() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="h-8 w-56 bg-muted animate-pulse rounded" />
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="ml-auto h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
      {/* Table header skeleton */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30">
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        {["w-36", "w-28", "w-24", "w-20", "w-24", "w-20"]?.map((w, i) => (
          <div key={i} className={`h-4 ${w} bg-muted animate-pulse rounded`} />
        ))}
      </div>
      {/* Table rows skeleton */}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: 10 })?.map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border"
          >
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-5 w-14 bg-muted animate-pulse rounded-full" />
            <div className="ml-auto h-7 w-7 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
