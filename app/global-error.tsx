"use client";
import React from "react";

// This file catches fatal errors inside the RootLayout itself.
// It MUST include <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // (Global 500 - Catches fatal layout crashes)
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-9xl font-bold text-red-500 opacity-20">500</h1>
            <h2 className="text-2xl font-bold mb-2 mt-4">
              Lỗi hệ thống nghiêm trọng
            </h2>
            <p className="text-muted-foreground mb-8">
              Hệ thống gặp sự cố không thể phục hồi. Vui lòng tải lại trang.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
