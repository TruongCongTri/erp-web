// lib/notificationLinks.ts
// Tập trung mọi logic build link cho Thông báo (chuông ở Topbar, Sidebar,
// trang /notifications và Drawer chi tiết) để tránh mỗi nơi tự ghép URL một kiểu.

const LOCALES = ["vi", "en"] as const;
const DEFAULT_LOCALE = "vi";

/** Lấy locale hiện tại từ pathname (vd: "/vi/ats/..." -> "vi"), fallback về "vi". */
export function getLocaleFromPathname(pathname?: string | null): string {
  const first = pathname?.split("/").filter(Boolean)[0];
  return first && (LOCALES as readonly string[]).includes(first)
    ? first
    : DEFAULT_LOCALE;
}

/** Trang Thông báo, mở sẵn Drawer chi tiết của 1 thông báo. */
export function notificationDetailHref(
  id: string,
  locale: string = DEFAULT_LOCALE,
): string {
  return `/${locale}/notifications?id=${encodeURIComponent(id)}`;
}

/** Trang danh sách Thông báo. */
export function notificationsHref(locale: string = DEFAULT_LOCALE): string {
  return `/${locale}/notifications`;
}

/**
 * Chuẩn hoá `actionUrl` do Backend gửi kèm thông báo:
 * - Thông báo "Yêu cầu tuyển dụng mới" vẫn trỏ về route cũ `/requests/:id`;
 *   route thật của FE là `/ats/request-management/:id`.
 * - Bổ sung prefix locale nếu Backend trả về đường dẫn không có locale.
 * - Giữ nguyên link tuyệt đối (http/https).
 */
export function resolveNotificationActionHref(
  actionUrl?: string | null,
  locale: string = DEFAULT_LOCALE,
): string | undefined {
  if (!actionUrl) return undefined;
  if (/^https?:\/\//i.test(actionUrl)) return actionUrl;

  const [rawPath, query] = actionUrl.split("?");
  const segments = rawPath.split("/").filter(Boolean);

  // Tách locale nếu BE đã kèm sẵn
  let targetLocale = locale;
  if ((LOCALES as readonly string[]).includes(segments[0])) {
    targetLocale = segments.shift() as string;
  }

  // Route "Yêu cầu tuyển dụng" đã đổi: /requests -> /ats/request-management
  const reqIdx = segments.indexOf("requests");
  if (reqIdx !== -1) {
    segments[reqIdx] = "request-management";
    if (segments[reqIdx - 1] !== "ats") segments.splice(reqIdx, 0, "ats");
  }

  return `/${targetLocale}/${segments.join("/")}${query ? `?${query}` : ""}`;
}
