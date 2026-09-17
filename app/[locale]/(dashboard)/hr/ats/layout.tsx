"use client";
import { useSyncAtsEventsQuery } from "@/lib/store/atsApiSlice";

export default function AtsLayout({ children }: { children: React.ReactNode }) {
  // This automatically binds the WebSocket listeners to Redux on load!
  useSyncAtsEventsQuery();

  return <>{children}</>;
}
