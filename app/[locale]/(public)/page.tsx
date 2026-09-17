import React from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  BarChart3,
  Search,
  BookOpen,
  FileText,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import HealthCheckButton from "@/components/buttons/HealthCheckButton";
import ActionButton from "@/components/buttons/ActionButton";

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // ─── ARTIFICIAL DELAY ───
  // This forces Next.js to wait 2 seconds before rendering this page.
  // While it waits, it will display your app/[locale]/loading.tsx file!
  // (Remember to remove or comment this out before deploying to production)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <main className="w-full">
      {/* ── HERO SECTION ── */}
      <section className="relative w-full px-4 pt-24 pb-16 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2 border border-primary/20">
            <SparklesIcon size={12} /> Nền tảng quản lý vận hành nội bộ
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.15]">
            Kiến tạo tương lai với <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
              quy trình tối ưu
            </span>
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Hệ thống ERP chuyên biệt dành cho các doanh nghiệp thiết kế và xây
            dựng. Tối ưu hóa nguồn lực, bảo mật dữ liệu và tự động hóa quy trình
            tuyển dụng trên một nền tảng duy nhất.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={`/${locale}/login`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25"
            >
              Đăng nhập hệ thống
            </Link>
            <Link
              href={`/${locale}/docs`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3.5 rounded-lg font-bold hover:bg-muted transition-all active:scale-95"
            >
              <BookOpen size={18} /> Xem tài liệu hướng dẫn
            </Link>
            <Link
              href={`/${locale}/demo-btn`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3.5 rounded-lg font-bold hover:bg-muted transition-all active:scale-95"
            >
              <BookOpen size={18} /> Demo Action btns
            </Link>
            <HealthCheckButton />
            <ActionButton />
          </div>
        </div>
      </section>

      {/* ── SYSTEM OVERVIEW (FEATURES) ── */}
      <section className="w-full bg-muted/20 border-y border-border/50 py-20 px-4 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Giải pháp toàn diện cho doanh nghiệp
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Mọi công cụ bạn cần để quản lý đội ngũ và vận hành nội bộ đều được
              tích hợp sẵn, đảm bảo tính thống nhất và luồng dữ liệu thông suốt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            {[
              {
                icon: <Users size={24} className="text-blue-600" />,
                title: "Quản lý nhân sự (HRIS)",
                desc: "Quản lý hồ sơ nhân viên, hợp đồng, trạng thái làm việc và thông tin liên hệ tập trung.",
                bg: "bg-blue-600/10",
                border: "border-blue-600/20",
              },
              {
                icon: <ShieldCheck size={24} className="text-emerald-600" />,
                title: "Bảo mật & Phân quyền",
                desc: "Ma trận phân quyền chi tiết (RBAC), kiểm soát truy cập và ghi log toàn bộ thao tác hệ thống.",
                bg: "bg-emerald-600/10",
                border: "border-emerald-600/20",
              },
              {
                icon: <BarChart3 size={24} className="text-purple-600" />,
                title: "Tuyển dụng (ATS)",
                desc: "Kiểm soát vòng đời ứng viên, tạo JD tự động qua AI và lưu trữ lịch sử CV đa nền tảng.",
                bg: "bg-purple-600/10",
                border: "border-purple-600/20",
              },
              {
                icon: <Briefcase size={24} className="text-amber-600" />,
                title: "Quản lý Dự án & Task",
                desc: "Theo dõi tiến độ, phân bổ nguồn lực và đánh giá hiệu suất nhân sự theo thời gian thực.",
                bg: "bg-amber-600/10",
                border: "border-amber-600/20",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.bg} ${feature.border} border`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW-TO / KNOWLEDGE BASE ── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <BookOpen size={48} className="mx-auto text-primary/80 mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Trung tâm Hỗ trợ & Hướng dẫn sử dụng
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-8">
              Tìm kiếm quy trình chuẩn, tài liệu nghiệp vụ và các hướng dẫn thao
              tác hệ thống dành cho nhân viên và quản lý.
            </p>

            <form
              action={`/${locale}/docs`}
              method="GET"
              className="relative max-w-2xl mx-auto mb-10 shadow-sm"
            >
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                name="q"
                placeholder="Bạn cần tìm hướng dẫn gì? (VD: Xin nghỉ phép, Tạo yêu cầu tuyển dụng...)"
                className="w-full pl-12 pr-32 py-4 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-4 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Tìm kiếm
              </button>
            </form>

            <div className="text-left max-w-2xl mx-auto">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Các tài liệu phổ biến
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Quy trình xin nghỉ phép & Phê duyệt",
                  "Hướng dẫn tạo yêu cầu tuyển dụng (JD)",
                  "Cách thiết lập phân quyền (RBAC)",
                  "Quy trình Onboarding nhân viên mới",
                ].map((doc, idx) => (
                  <Link
                    key={idx}
                    href={`/${locale}/docs`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                  >
                    <FileText
                      size={16}
                      className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                    />
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {doc}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href={`/${locale}/docs`}
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Xem toàn bộ thư viện tài liệu <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
