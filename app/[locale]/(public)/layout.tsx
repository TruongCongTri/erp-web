import React from "react";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden flex flex-col bg-background selection:bg-primary/20 font-sans scroll-smooth">
      <Header locale={locale} />
      <div className="flex-1 w-full">{children}</div>
      <Footer locale={locale} />
    </div>
  );
}
