"use client";
import ProfileDetailsContent from "@/components/hr/ProfileDetailsContent";
import { useParams, useRouter } from "next/navigation";

export default function ProfileDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // Tham số này lấy từ tên thư mục [code]
  const code = params?.code as string;

  return (
    <ProfileDetailsContent employeeCode={code} onBack={() => router.back()} />
  );
}
