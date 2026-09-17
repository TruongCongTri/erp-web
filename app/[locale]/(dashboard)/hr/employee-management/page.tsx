import PermissionGuard from "@/components/auth/PermissionGuard";
import EmployeeManagementContent from "@/components/employee/EmployeeManagementContent";

export default function EmployeeManagementPage() {
  return (
    // <PermissionGuard resource="hr">
      <EmployeeManagementContent />
    // </PermissionGuard>
  );
}
