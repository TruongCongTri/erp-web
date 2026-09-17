"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Auth.AuthError");

  useEffect(() => {
    console.error("Authentication Error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card border border-border rounded-lg shadow-sm text-center">
      <h2 className="text-tech-subheader text-foreground mb-4">{t("heading")}</h2>
      <p className="text-body-inter text-muted-foreground mb-6">
        {error.message.includes("CORS") ? t("desc_cors") : t("desc_default")}
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => reset()}
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-normal font-semibold hover:bg-destructive transition-colors"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-normal font-semibold hover:bg-border transition-colors"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}