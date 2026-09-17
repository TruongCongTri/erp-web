import React from "react";

export default function AdminRolePermissionLoading() {
  return (
    <div className="h-full flex flex-col overflow-hidden p-4 gap-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-48 bg-muted animate-pulse rounded" />
        <div className="h-7 w-24 bg-muted animate-pulse rounded" />
      </div>
      {/* Split pane skeleton */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: roles list */}
        <div className="w-56 flex flex-col gap-2 shrink-0">
          {Array.from({ length: 9 })?.map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
        {/* Right: permissions grid */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-10 bg-muted animate-pulse rounded" />
          {Array.from({ length: 8 })?.map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
