import React from "react";
import JobPostDetailContent from "@/components/ats/JobPostDetailContent";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  return <JobPostDetailContent id={id} locale={locale} onBack={() => {}} />;
}
