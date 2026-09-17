"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-9xl font-black text-primary/10 tracking-tighter mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Không tìm thấy trang
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Đường dẫn bạn truy cập không tồn tại, đã bị gỡ bỏ, hoặc bạn không có
        quyền truy cập.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-muted transition-colors shadow-sm"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Home size={16} /> Về trang chủ
        </button>
      </div>
    </div>
  );
}
