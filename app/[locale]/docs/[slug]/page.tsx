import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Calendar, Clock, User, ChevronRight, FileText } from "lucide-react";
import { docArticles, docCategories } from "../docsData";

export default async function DocDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  // Await the Promise to get parameters (Next.js 15 requirement)
  const { locale, slug } = await params;

  // Find the requested document
  const article = docArticles.find((doc) => doc.slug === slug);

  // If document doesn't exist, trigger the closest not-found.tsx
  if (!article) {
    notFound();
  }

  const category = docCategories.find((c) => c.id === article.categoryId);

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
        </div>
        <div>
          <Link href={`/${locale}/docs`} className="btn-ghost flex items-center gap-1.5 text-xs">
            <ArrowLeft size={14} /> Về trung tâm hỗ trợ
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col">
        
        {/* ── Breadcrumbs ── */}
        <nav className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-8">
          <Link href={`/${locale}/docs`} className="hover:text-primary transition-colors">Trang chủ Hỗ trợ</Link>
          <ChevronRight size={12} className="opacity-50" />
          {category && (
            <>
              <span className="text-foreground">{category.name}</span>
              <ChevronRight size={12} className="opacity-50" />
            </>
          )}
          <span className="truncate max-w-[200px] text-foreground opacity-50">Chi tiết</span>
        </nav>

        {/* ── Article Header ── */}
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              <User size={13} /> Tác giả: <span className="text-foreground">{article.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} /> Cập nhật: {article.updatedAt}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} /> Đọc trong {article.readTime}
            </div>
          </div>
        </header>

        {/* ── Article Content (Simulating Typography Prose) ── */}
        {/* We use a custom wrapper class to target HTML tags safely without requiring @tailwindcss/typography */}
        <article 
          className="rich-text-content pb-20"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Custom CSS specifically for this HTML content inject */}
        <style dangerouslySetInnerHTML={{__html: `
          .rich-text-content h2 {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--foreground);
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .rich-text-content p {
            font-size: 0.875rem;
            line-height: 1.7;
            color: var(--muted-foreground);
            margin-bottom: 1.25rem;
          }
          .rich-text-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            color: var(--muted-foreground);
            line-height: 1.7;
          }
          .rich-text-content li {
            margin-bottom: 0.5rem;
          }
          .rich-text-content strong {
            color: var(--foreground);
            font-weight: 700;
          }
          .rich-text-content em {
            font-style: italic;
          }
          .rich-text-content code {
            font-family: monospace;
            background-color: var(--muted);
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
          }
        `}} />
      </main>
    </div>
  );
}