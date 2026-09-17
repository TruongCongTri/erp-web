// components/admin/AuditHistoryTable.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

// Match the interfaces from your backend
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  ipAddress: string;
  userAgent: string;
  category: string;
  action: string;
  resource: string;
  status: string;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_page: number;
}

export default function AuditHistoryTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query string
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (category) query.append("category", category);
      if (status) query.append("status", status);

      // Extract token (Assuming standard cookie storage. Use your Axios instance if you have one)
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audit?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
        setMeta(json.meta || null);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, category, status]);

  // Refetch when filters or page change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Utility to format dates nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-emerald-700 bg-emerald-500/10 border-emerald-500/20";
      case "UNAUTHORIZED":
        return "text-rose-700 bg-rose-500/10 border-rose-500/20";
      case "FAILURE":
        return "text-orange-700 bg-orange-500/10 border-orange-500/20";
      default:
        return "text-slate-700 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header & Filters */}
      <div className="px-5 py-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Audit History
          </h2>
          <p className="text-xs text-muted-foreground">
            Historical records of system activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="AUTH">Auth</option>
            <option value="CRUD">CRUD</option>
            <option value="NAVIGATION">Navigation</option>
            <option value="SYSTEM">System</option>
          </select>

          <select
            className="text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
            <option value="UNAUTHORIZED">Unauthorized</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0">
            <tr>
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Resource</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  No logs found matching your criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-3 text-muted-foreground tabular-nums text-xs">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">
                      {log.userName || "Anonymous"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {log.ipAddress}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">
                      {log.action}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {log.category}
                    </div>
                  </td>
                  <td
                    className="px-5 py-3 text-xs text-muted-foreground truncate max-w-[200px]"
                    title={log.resource}
                  >
                    {log.resource}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(log.status)}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta && meta.total_page > 1 && (
        <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing page{" "}
            <span className="font-medium text-foreground">
              {meta.current_page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {meta.total_page}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.current_page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={meta.current_page === meta.total_page}
              onClick={() => setPage((p) => Math.min(meta.total_page, p + 1))}
              className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
