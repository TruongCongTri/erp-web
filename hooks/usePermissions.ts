// hooks/usePermissions.ts

import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";

export type DashboardType =
  | "GUEST"
  | "HR"
  | "SALES"
  | "FINANCE"
  | "PROCUREMENT"
  | "DESIGN"
  | "CONSTRUCTION"
  | "IT"
  | "RECRUITMENT"
  | "GENERAL";

export function usePermissions() {
  const { user, isInitialized } = useSelector((state: RootState) => state.auth);

  const userPerms: string[] = user?.permissions || [];
  const roleSlug: string = user?.role?.slug || "GUEST";

  // 1. DYNAMIC PERMISSION CHECKER (For Sidebar & Route Guards)
  const canAccessResource = (resourceSlug: string): boolean => {
    if (userPerms.includes("*:*:any")) return true; // Ultimate authority

    return userPerms.some((perm) => {
      const [res] = perm.split(":"); // Extracts 'hr' from 'hr:create:any'
      return res === resourceSlug || res === "*";
    });
  };

  // 2. DEPARTMENT IDENTIFIER (For the Main Dashboard View)
  const getPrimaryDashboard = (): DashboardType => {
    if (roleSlug === "GUEST") return "GUEST";
    if (roleSlug === "SYSTEM_ADMIN") return "IT";
    if (roleSlug.includes("HR")) return "HR";
    
    if (
      roleSlug.includes("SALES") ||
      roleSlug.includes("MEDIA") ||
      roleSlug.includes("CRM")
    )
      return "SALES";
    if (roleSlug.includes("ACCOUNTING")) return "FINANCE";
    if (roleSlug.includes("SUPPLY") || roleSlug.includes("ASSET"))
      return "PROCUREMENT";
    if (
      roleSlug.includes("DESIGN") ||
      roleSlug.includes("ARCHITECTURE") ||
      roleSlug.includes("STRUCTURE") ||
      roleSlug.includes("MEP") ||
      roleSlug.includes("ESTIMATION")
    )
      return "DESIGN";
    if (roleSlug.includes("CONSTRUCTION") || roleSlug.includes("SITE_ENGINEER"))
      return "CONSTRUCTION";

    // Fallback for Executive Directors or unmapped roles
    return "GENERAL";
  };

  return {
    userPerms,
    roleSlug,
    canAccessResource,
    primaryDashboard: getPrimaryDashboard(),
    isLoading: !isInitialized,
  };
}
