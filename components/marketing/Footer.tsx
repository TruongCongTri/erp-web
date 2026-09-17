import React from "react";
import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import CurrentYear from "@/components/ui/CurrentYear";

export default function Footer({ locale }: { locale: string }) {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                ConstructERP
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nền tảng quản lý và vận hành nội bộ toàn diện chuyên biệt dành cho
              doanh nghiệp Thiết kế & Xây dựng.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} /> contact@constructerp.vn
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} /> 1900 8888
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>Tòa nhà Innovation, Khu Công nghệ cao, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">
              Giải pháp
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quản lý Dự án (EPC)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Nhân sự & Tính lương (HRIS)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Tuyển dụng (ATS)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Quản lý Tài liệu (EDMS)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Phân quyền Bảo mật (RBAC)
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">
              Tài nguyên
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}/docs`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Trung tâm Hướng dẫn
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Tài liệu API
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cập nhật hệ thống (Changelog)
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Hỗ trợ kỹ thuật 24/7
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">
              Công ty & Pháp lý
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách Cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © <CurrentYear /> ConstructERP. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span>Tiếng Việt</span>
            <span className="w-1 h-1 bg-border rounded-full"></span>
            <Link href="#" className="hover:text-foreground transition-colors">
              English
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
