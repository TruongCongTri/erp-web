import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

// Initialize the plugin pointing to your updated i18n.ts
const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  // config-3 - Image Optimization (Whitelist domains)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "customer-*.cloudflarestream.com", // Avatar/Thumbnails từ Cloudflare
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com", // Nếu xài Vimeo
      },
      {
        protocol: "https",
        hostname: "vietdynamic.s3.ap-southeast-1.amazonaws.com", // AWS S3 cho Avatar User
      },
    ],
    qualities: [75, 85, 90, 100],
  },
  // config-5 - Security Headers
  async headers() {
    return [
      {
        // Áp dụng cho TOÀN BỘ trang
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Ngăn chặn Clickjacking (Không ai được nhúng web bạn vào iFrame)
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Chống lỗ hổng MIME type sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Bảo vệ thông tin URL khi user click link ra ngoài
          },
        ],
      },
    ];
  },
};

// Export the config wrapped with the next-intl plugin
export default withNextIntl(nextConfig);