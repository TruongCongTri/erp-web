// app/dashboard/admin/audit/page.tsx

import AuditHistoryTable from "@/components/audit-log/AuditHistoryTable";
import AuditLiveStream from "@/components/audit-log/AuditLiveStream";

export default function AuditDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          System Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and monitor all system actions in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Historical Data Table (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <AuditHistoryTable />
        </div>

        {/* Right Side: The Real-Time Feed */}
        <div className="lg:col-span-1">
          <AuditLiveStream />
        </div>
      </div>
    </div>
  );
}
