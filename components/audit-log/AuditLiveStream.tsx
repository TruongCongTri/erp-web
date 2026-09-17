// components/admin/AuditLiveStream.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

// Match this to your Backend Interface
export interface AuditLogEvent {
  id?: string;
  timestamp?: string; // Appended by UI if missing
  userId: string | null;
  userName: string | null;
  ipAddress: string;
  category: "NAVIGATION" | "CRUD" | "AUTH" | "SYSTEM";
  action: string;
  resource: string;
  status: "SUCCESS" | "FAILURE" | "UNAUTHORIZED";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export default function AuditLiveStream() {
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Ref to handle aborting the stream when the component unmounts
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    const connectStream = async () => {
      try {
        await fetchEventSource(
          `${process.env.NEXT_PUBLIC_API_URL}/audit/stream`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Pass your JWT here
              Accept: "text/event-stream",
            },
            signal: abortControllerRef.current?.signal,
            onopen: async (res) => {
              if (res.ok && res.status === 200) {
                setIsConnected(true);
              }
            },
            onmessage: (event) => {
              // 1. Ignore empty pings completely
              if (!event.data || event.data.trim() === "") {
                return;
              }

              console.log("🔥 RAW SSE MESSAGE RECEIVED:", event.data);

              try {
                // 2. Safely parse the JSON string we sent from the backend
                // (Since we added JSON.stringify on the backend, we double-check parsing here)
                const parsedData = JSON.parse(event.data);

                // In case the backend stringified it twice (NestJS sometimes does this),
                // we parse it again if it's still a string.
                const newLog =
                  typeof parsedData === "string"
                    ? JSON.parse(parsedData)
                    : parsedData;

                if (!newLog.timestamp) {
                  newLog.timestamp = new Date().toISOString();
                }

                setLogs((prev) => [newLog, ...prev].slice(0, 100));
              } catch (err) {
                console.error(
                  "Failed to parse SSE JSON:",
                  err,
                  "Raw data:",
                  event.data,
                );
              }
            },
            onclose: () => {
              setIsConnected(false);
            },
            onerror: (err) => {
              console.error("SSE Connection Error", err);
              setIsConnected(false);
              // Throwing an error here tells fetchEventSource to attempt a reconnect
              throw err;
            },
          },
        );
      } catch (error) {
        console.error("Failed to connect to audit stream");
      }
    };

    connectStream();

    // Cleanup: close the connection when the admin leaves the page
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-emerald-600 bg-emerald-500/10";
      case "UNAUTHORIZED":
        return "text-rose-600 bg-rose-500/10";
      case "FAILURE":
        return "text-orange-600 bg-orange-500/10";
      default:
        return "text-slate-600 bg-slate-500/10";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20 rounded-t-xl shrink-0">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Live Audit Feed
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitoring system activity in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <div className="relative flex h-3 w-3">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`}
            ></span>
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Waiting for activity...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-background animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(log.status)}`}
                  >
                    {log.status}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {log.action}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {new Date(log.timestamp!).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium text-foreground">
                    {log.userName || "System / Anonymous"}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[10px]">{log.ipAddress}</span>
                </div>
                <span
                  className="text-[10px] text-muted-foreground truncate max-w-[150px]"
                  title={log.resource}
                >
                  {log.resource}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
