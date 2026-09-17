"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations("Error"); // Ensure you have this namespace, or replace with raw text

  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Local System Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 mx-auto">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Đã xảy ra lỗi không mong muốn
      </h2>
      <p className="text-muted-foreground mb-8 text-sm max-w-md mx-auto">
        {error?.message ||
          "Hệ thống gặp sự cố trong quá trình xử lý yêu cầu. Vui lòng thử lại sau."}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        <RefreshCw size={16} /> Thử lại
      </button>
    </div>
  );
}
