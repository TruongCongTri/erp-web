"use client";

import EmployeeDetailsContent from "@/components/employee/EmployeeDetailsContent";
import { useParams, useRouter } from "next/navigation";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  return (
    <EmployeeDetailsContent employeeId={id} onBack={() => router.back()} />
  );
}
