import PermissionGuard from "@/components/auth/PermissionGuard";
import React from "react";

export default function UsersAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Check multiple specific permissions
    <PermissionGuard
      allowedPermissions={["hr:read:any", "hr:read:dept", "it_system:read:any"]}
    >
      {children}
    </PermissionGuard>
  );
}
