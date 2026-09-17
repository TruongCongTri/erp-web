"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";
import { useGetHealthCheckQuery } from "@/lib/store/publicApiSlice"; // Ensure this matches your slice name
import { gooeyToast } from "@/components/ui/goey-toaster"


export default function HealthCheckButton() {
  // 1. We don't fetch automatically on mount to save unnecessary API calls on the landing page
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // 2. The query is skipped until the user clicks the button
  const { data, isFetching, error, isSuccess } = useGetHealthCheckQuery(undefined, {
    skip: !shouldFetch,
  });

  const handlePing = () => {
    setShouldFetch(true);
    
    // If it was already fetched, we can show the toast immediately
    if (isSuccess && data) {
        gooeyToast.success(`Server Status: Online!`);
    } else if (error) {
        gooeyToast.error(`Server Status: Offline or unreachable.`);
    }
  };

  return (
    <button
      onClick={handlePing}
      disabled={isFetching}
      className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border border-border px-6 py-2.5 rounded-lg font-bold hover:bg-secondary/80 transition-all active:scale-95 shadow-sm text-sm"
    >
      <Activity size={16} className={isFetching ? "animate-pulse text-primary" : ""} />
      {isFetching ? "Pinging Server..." : "System Health Check"}
    </button>
  );
}