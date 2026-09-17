"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { candidates } from "@/components/ats/candidateData";
import CandidateDetailsContent from "@/components/ats/CandidateDetailsContent";

export default function CandidateAtsDetailClient() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "vi";
  const id = params?.id as string;

  const candidate = candidates.find((c) => c.id === id);

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Không tìm thấy ứng viên
        </p>
        <button
          onClick={() => router.push(`/${locale}/hr/ats`)}
          className="btn-primary text-xs"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <CandidateDetailsContent
      candidate={candidate}
      onBack={() => router.push(`/${locale}/hr/ats`)}
    />
  );
}
