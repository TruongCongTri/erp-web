// Example of hiding an action button inside a page
import { usePermissions } from "@/hooks/usePermissions";

function AddEmployeeButton() {
  const { userPerms } = usePermissions();

  // Check if they have specific action permission
  const canCreateHR =
    userPerms.includes("hr:create:any") || userPerms.includes("*:*:any");

  if (!canCreateHR) return null; // Button is invisible to SYSTEM_ADMIN

  return <button>Thêm nhân viên</button>;
}
