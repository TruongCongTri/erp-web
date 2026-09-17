import type { Metadata } from "next";
import CandidateAtsDetailClient from "@/components/hr/CandidateAtsDetailClient";

// Dùng static metadata - không truy cập params tại metadata
export const metadata: Metadata = {
  title: "Chi tiết ứng viên | HR",
  description: "Xem chi tiết hồ sơ ứng viên",
};

export default function CandidateDetailPage() {
  return <CandidateAtsDetailClient />;
}
