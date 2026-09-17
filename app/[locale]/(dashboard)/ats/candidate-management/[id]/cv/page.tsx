import CandidateCvDetailView from "@/components/ats/CandidateCvDetailView";
import React from "react";
import type { Metadata } from "next";

// Dùng static metadata - Không truy cập params tại metadata
export const metadata: Metadata = {
  title: "Hồ sơ CV ứng viên | ATS",
  description: "Xem chi tiết hồ sơ CV ứng viên",
};

export default async function CandidateCvPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  return <CandidateCvDetailView id={id} locale={locale} />;
}
