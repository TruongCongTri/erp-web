// app/[locale]/(dashboard)/ats/request-management/[id]/page.tsx
import React from "react";
import type { Metadata } from "next";
import RecruitmentRequestDetail from "@/components/ats/RecruitmentRequestDetail";

// ✅ 1. Dùng static metadata - Không truy cập params tại metadata
export const metadata: Metadata = {
  title: "Chi tiết Yêu cầu tuyển dụng | ATS",
  description: "Quản lý yêu cầu tuyển dụng và tự động sinh JD đa kênh",
};

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function RecruitmentRequestDetailPage({
  params,
}: PageProps) {
  const { id, locale } = await params;

  return <RecruitmentRequestDetail id={id} locale={locale} />;
}
