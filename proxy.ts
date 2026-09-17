import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "always",
});

// 1. Danh sách route công khai (không cần login)
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// 2. Danh sách các phân hệ nội bộ bắt buộc phải có accessToken
const protectedPrefixes = [
  "/dashboard",
  "/users",
  "/ats", // Bảo vệ toàn bộ phân hệ ATS & quản lý CV
  "/settings",
];

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Bóc tách locale động ('vi' hoặc 'en')
  const localeMatch = pathname.match(/^\/(vi|en)/);
  const currentLocale = localeMatch ? localeMatch[1] : "vi";
  const pathnameWithoutLocale = pathname.replace(/^\/(vi|en)/, "") || "/";

  // Lấy access token từ cookie
  const token = request.cookies.get("accessToken")?.value;

  // 3. Kiểm tra bảo vệ route nội bộ
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathnameWithoutLocale.startsWith(prefix),
  );

  if (isProtectedRoute && !token) {
    // Gửi Audit Log an toàn: dùng waitUntil để không drop request khi redirect
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

    const auditPromise = fetch(`${apiUrl}/audit/client-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "AUTH",
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resource: pathname,
        status: "UNAUTHORIZED",
        metadata: { reason: "Missing accessToken" },
      }),
    }).catch(() => {});

    event.waitUntil(auditPromise);

    // Redirect về trang login giữ đúng ngôn ngữ hiện tại
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Nếu đã đăng nhập, không cho vào lại các trang Login/Register
  const isAuthRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  if (isAuthRoute && token) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/dashboard`, request.url),
    );
  }

  // 5. Xử lý locale routing (next-intl) cho các route còn lại
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // 1. Match root
    "/",
    // 2. Match localized paths
    "/(vi|en)/:path*",
    // 3. Catch-all to enable redirects for routes without a locale
    //    (ignores API routes and static assets)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
