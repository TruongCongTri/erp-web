import AuditLogsContent from "@/components/audit-log/AuditLogsContent";
import React from "react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AuditLogPage({ params }: PageProps) {
  const { locale } = await params;
  return <AuditLogsContent />;
}
