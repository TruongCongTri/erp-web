"use client";

import React from "react";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminRolePermissionError({
  error,
  reset,
}: AdminErrorProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-destructive text-xl font-bold">!</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Lỗi tải phân quyền
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {error?.message ||
            "Không thể tải ma trận phân quyền. Vui lòng thử lại."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2 rounded font-medium hover:bg-primary/90 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
