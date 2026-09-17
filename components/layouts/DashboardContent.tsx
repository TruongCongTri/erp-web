"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import MainDashboard from "../home/MainDashboard";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardContent() {
  const { isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // The MainDashboard will handle its own sidebar logic based on the user's permissions!
  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative h-full">
      <MainDashboard />
    </div>
  );
}
