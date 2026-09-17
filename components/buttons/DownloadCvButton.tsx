"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { gooeyToast } from "@/components/ui/goey-toaster";

interface DownloadCvButtonProps {
  /** S3 file key (e.g., 'resumes/uuid.pdf') or raw storage URL */
  fileKey?: string | null;
  /** Fallback URL if fileKey is missing */
  fallbackUrl?: string | null;
  /** Custom filename when saved to disk */
  fileName?: string;
  /** Visual variant */
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

export function DownloadCvButton({
  fileKey,
  fallbackUrl,
  fileName = "candidate-cv.pdf",
  variant = "primary",
  className = "",
  showText = true,
  disabled = false,
}: DownloadCvButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!fileKey && !fallbackUrl) {
      gooeyToast.error("Không tìm thấy đường dẫn hoặc mã tệp để tải.");
      return;
    }

    setIsDownloading(true);

    try {
      let downloadUrl = fallbackUrl || "";

      // 1. If an S3 key is present, retrieve the pre-signed download URL from Next.js API
      if (fileKey) {
        const cleanKey = fileKey.startsWith("/") ? fileKey.slice(1) : fileKey;
        const res = await fetch(
          `/api/cv?key=${encodeURIComponent(cleanKey)}&action=download`,
        );

        if (!res.ok) {
          throw new Error("Không thể tạo liên kết tải an toàn từ S3.");
        }

        const data = await res.json();
        if (data.url) {
          downloadUrl = data.url;
        }
      }

      if (!downloadUrl) {
        throw new Error("Không lấy được đường dẫn tệp hợp lệ.");
      }

      // 2. Fetch the file blob and trigger instant download
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Tệp không tồn tại hoặc phiên truy cập đã hết hạn.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName.endsWith(".pdf")
        ? fileName
        : `${fileName}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();

      // Clean up memory
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(anchor);

      gooeyToast.success(`Đã tải xuống: ${fileName}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Download CV error:", err);
      gooeyToast.error(err?.message || "Lỗi khi tải CV xuống máy.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "btn-secondary text-foreground hover:text-primary";
      case "ghost":
        return "hover:bg-muted text-muted-foreground hover:text-foreground";
      case "outline":
        return "border border-border hover:bg-muted text-foreground";
      case "primary":
      default:
        return "btn-primary text-primary-foreground";
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      title={`Tải xuống: ${fileName}`}
      className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${getVariantStyles()} ${className}`}
    >
      {isDownloading ? (
        <Loader2 size={13} className="animate-spin shrink-0" />
      ) : (
        <Download size={13} className="shrink-0" />
      )}
      {showText && <span>{isDownloading ? "Đang tải..." : "Tải bản này"}</span>}
    </button>
  );
}
