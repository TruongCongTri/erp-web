"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  /** Array of resource slugs (e.g., ['it_system', 'hr']). Good for Layouts. */
  allowedResources?: string[];

  /** Array of exact permission slugs (e.g., ['hr:read:any', 'hr:read:dept']). Good for Pages & Buttons. */
  allowedPermissions?: string[];

  /** If true, user must have ALL listed permissions/resources. Default is false (OR logic). */
  requireAll?: boolean;

  /**
   * "redirect": Shows countdown and kicks user out (Best for Layouts/Pages).
   * "hide": Silently returns null (Best for Action Buttons).
   * "fallback": Shows the custom fallback UI.
   */
  behavior?: "redirect" | "hide" | "fallback";

  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function PermissionGuard({
  allowedResources,
  allowedPermissions,
  requireAll = false,
  behavior = "redirect",
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { userPerms: permissions = [], isLoading, roleSlug } = usePermissions();
  const router = useRouter();

  const [countdown, setCountdown] = useState(5);

  // ==========================================
  // SYNCHRONOUS DERIVED STATE (No useEffect needed!)
  // ==========================================
  let isAuthorized = false;

  if (isLoading) {
    // Treat as authorized while loading so we can show the spinner
    isAuthorized = true;
  } else if (
    roleSlug === "GUEST" &&
    (allowedResources?.length || allowedPermissions?.length)
  ) {
    isAuthorized = false;
  } else if (allowedPermissions && allowedPermissions.length > 0) {
    isAuthorized = requireAll
      ? allowedPermissions.every((p) => permissions.includes(p))
      : allowedPermissions.some((p) => permissions.includes(p));
  } else if (allowedResources && allowedResources.length > 0) {
    const userResources = permissions.map((p) => p.split(":")[0]);
    isAuthorized = requireAll
      ? allowedResources.every((r) => userResources.includes(r))
      : allowedResources.some((r) => userResources.includes(r));
  } else {
    isAuthorized = true; // Unprotected route
  }

  const isDenied = !isLoading && !isAuthorized;

  // ==========================================
  // SIDE EFFECT: Handle Redirect Countdown
  // ==========================================
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isDenied && behavior === "redirect" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isDenied && behavior === "redirect" && countdown === 0) {
      router.push("/vi/dashboard");
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDenied, countdown, behavior, router]);

  // ==========================================
  // RENDER UI
  // ==========================================

  // 1. Loading State
  if (isLoading) {
    if (behavior === "hide" || behavior === "fallback") return null;
    return (
      <div className="flex-1 w-full h-full min-h-[400px] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Denied State
  if (isDenied) {
    if (behavior === "hide") return null; // Silently hide buttons!
    if (behavior === "fallback") return <>{fallback}</>; // Show custom block UI

    // Default "redirect" UI
    return (
      <div className="flex-1 w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-muted/10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm dark:bg-red-900/30">
          <Lock size={40} />
        </div>

        <h1 className="text-3xl font-black text-foreground mb-2 text-center">
          Truy cập bị từ chối
        </h1>

        <p className="text-muted-foreground text-sm text-center max-w-md mb-6 leading-relaxed">
          Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ Quản trị
          hệ thống (IT) nếu bạn cần được cấp quyền.
        </p>

        <div className="bg-muted px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground border border-border shadow-inner">
          Tự động quay lại Dashboard trong{" "}
          <span className="text-red-500">{countdown}s</span>...
        </div>

        <button
          onClick={() => router.push("/vi/dashboard")}
          className="mt-8 text-sm font-bold text-primary hover:underline transition-colors"
        >
          Quay lại ngay
        </button>
      </div>
    );
  }

  // 3. Authorized State
  return <>{children}</>;
}
