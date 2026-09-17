import PermissionGuard from "@/components/auth/PermissionGuard";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Default behavior is "redirect", so unauthorized users get the countdown screen
    <PermissionGuard allowedResources={['it_system', 'hr']}>
      {children}
    </PermissionGuard>
  );
}
