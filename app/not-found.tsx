"use client";
import { routing } from "@/i18n/routing";
import Link from "next/link";

// This file catches 404s at the absolute root (e.g., localhost:3000/unknown-locale)
// Because it sits outside [locale]/layout.tsx, it MUST include <html> and <body>.
export default function GlobalNotFound() {
  // (Global 404 - Fixes the missing tags error)
  return (
    <html lang={routing.defaultLocale} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
            <h2 className="text-2xl font-bold mb-2 mt-4">
              Không tìm thấy trang
            </h2>
            <p className="text-muted-foreground mb-8">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <Link
              href={`/${routing.defaultLocale}`}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
