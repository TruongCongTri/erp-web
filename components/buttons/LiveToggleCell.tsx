// components/ui/buttons/LiveToggleCell.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
// Import your specific mutation hook
// import { useToggleRoleStatusMutation } from "@/lib/store/adminApiSlice";

interface LiveToggleCellProps {
  roleId: string;
  initialIsLive: boolean;
  roleName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customMutation: any;
}

export function LiveToggleCell({
  roleId,
  initialIsLive,
  roleName,
  customMutation,
}: LiveToggleCellProps) {
  const [isLive, setIsLive] = useState(initialIsLive);
  const [toggleStatus, { isLoading: isToggling }] = customMutation();

  // Sync state if backend data updates from pagination or refetch
  useEffect(() => {
    setIsLive(initialIsLive);
  }, [initialIsLive]);

  return (
    <div className="flex justify-center items-center">
      <button
        type="button"
        role="switch"
        aria-checked={isLive}
        disabled={isToggling}
        onClick={async (e) => {
          e.stopPropagation(); // Prevents row selection when toggling
          try {
            // Optimistic update locally
            setIsLive(!isLive);
            await toggleStatus({ id: roleId, isLive: !isLive }).unwrap();
            toast.success(
              `Đã ${!isLive ? "kích hoạt" : "vô hiệu hóa"} vai trò ${roleName}`,
            );
          } catch (error) {
            // Revert on failure
            setIsLive(isLive);
            toast.error("Lỗi khi thay đổi trạng thái");
          }
        }}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 ${
          isLive ? "bg-emerald-500" : "bg-muted-foreground/30"
        } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
            isLive ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
