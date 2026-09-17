import React from "react";
import Link from "next/link";
import { Search, Building2, ChevronRight, FileText, Clock, User, Users, Briefcase, ShieldCheck, BookOpen } from "lucide-react";
import { docCategories, docArticles } from "./docsData";

// Helper to render Lucide icons dynamically from strings
const IconMap: Record<string, React.ElementType> = {
  Users, Briefcase, ShieldCheck, BookOpen
};

export default async function DocsListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  
  const searchQuery = q?.toLowerCase() || "";

  // Filter articles based on search query
  const filteredArticles = docArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery) ||
    article.excerpt.toLowerCase().includes(searchQuery)
  );

  return (
    // Note: h-screen overflow-y-auto to fix the scrolling issue!
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-background font-sans scroll-smooth flex flex-col">
      
      {/* ── Navbar ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
              <Building2 size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              ConstructERP
            </span>
          </Link>
          <div className="w-px h-5 bg-border mx-2" />
          <span className="text-sm font-semibold text-muted-foreground">Trung tâm hỗ trợ</span>
        </div>
        <div>
          <Link href={`/${locale}/dashboard`} className="btn-secondary text-xs px-4 py-2">
            Về Dashboard
          </Link>
        </div>
      </header>

      {/* ── Search Hero ── */}
      <section className="bg-primary/5 border-b border-border py-16 px-4 relative flex-shrink-0">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Tìm kiếm quy trình, hướng dẫn sử dụng và tài liệu nghiệp vụ
          </p>

          <form action={`/${locale}/docs`} method="GET" className="relative max-w-2xl mx-auto shadow-md rounded-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Nhập từ khóa... (VD: nghỉ phép, JD, phân quyền)" 
              className="w-full pl-12 pr-32 py-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 flex flex-col gap-12">
        
        {/* If searching, only show results. Otherwise show categories + all docs */}
        {searchQuery ? (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              Kết quả tìm kiếm cho "{q}" <span className="badge badge-neutral">{filteredArticles.length}</span>
            </h2>
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-foreground">Không tìm thấy tài liệu phù hợp</p>
                <p className="text-xs text-muted-foreground mt-1">Vui lòng thử lại với từ khóa khác.</p>
                <Link href={`/${locale}/docs`} className="btn-ghost mt-4 inline-block">Xóa tìm kiếm</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map(article => (
                  <ArticleCard key={article.slug} article={article} locale={locale} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Categories */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-6">Chủ đề tài liệu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {docCategories.map(cat => {
                  const Icon = IconMap[cat.icon] || BookOpen;
                  return (
                    <div key={cat.id} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.colorClass}`}>
                        <Icon size={18} />
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">{cat.name}</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All Articles */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-6">Tài liệu phổ biến</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docArticles.map(article => (
                  <ArticleCard key={article.slug} article={article} locale={locale} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="py-6 border-t border-border text-center flex-shrink-0 bg-card">
        <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} ConstructERP Support Center.</p>
      </footer>
    </div>
  );
}

// ─── Shared Card Component ───
function ArticleCard({ article, locale }: { article: any, locale: string }) {
  const category = docCategories.find(c => c.id === article.categoryId);
  return (
    <Link href={`/${locale}/docs/${article.slug}`} className="flex flex-col p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group">
      <div className="flex items-center gap-2 mb-3">
        {category && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${category.colorClass}`}>
            {category.name.split(" ")[0]}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10}/> {article.readTime}</span>
      </div>
      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
        {article.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
        {article.excerpt}
      </p>
      <div className="flex items-center text-[10px] text-muted-foreground justify-between mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5"><User size={12}/> {article.author}</div>
        <div className="flex items-center gap-1 font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          Đọc tiếp <ChevronRight size={12} />
        </div>
      </div>
    </Link>
  );
}