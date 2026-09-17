import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 mx-auto">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Truy cập bị từ chối (403)
      </h2>
      <p className="text-muted-foreground mb-8 text-sm max-w-md mx-auto">
        Tài khoản của bạn không có đủ quyền hạn để xem trang này. Vui lòng liên
        hệ quản trị viên hệ thống nếu bạn nghĩ đây là sự nhầm lẫn.
      </p>
      <Link
        href={`/${locale}/dashboard`}
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        <ArrowLeft size={16} /> Về Dashboard
      </Link>
    </div>
  );
}
