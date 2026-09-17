// lib/utils/permissionCheck.ts

export function checkPermission(
  userPerms: string[] = [],
  requiredPerms?: string[],
  requireAll = false,
): boolean {
  if (!requiredPerms || requiredPerms.length === 0) return true;
  if (userPerms.includes("*:*:any")) return true; // Super Admin / Tổng Giám đốc

  const matchSingle = (req: string) => {
    if (userPerms.includes(req)) return true;
    const [resource, action] = req.split(":");
    // Kiểm tra wildcard theo tài nguyên: ví dụ ats_job_post:*:any
    return userPerms.some((userP) => {
      const [uRes, uAct] = userP.split(":");
      return (
        (uRes === "*" || uRes === resource) && (uAct === "*" || uAct === action)
      );
    });
  };

  return requireAll
    ? requiredPerms.every(matchSingle)
    : requiredPerms.some(matchSingle);
}
