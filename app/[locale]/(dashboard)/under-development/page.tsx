"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HardHat, Settings, ArrowLeft, Home, Wrench } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UnderDevelopmentPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "vi";

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[80vh] p-6 text-center overflow-hidden">
      {/* ─── BACKGROUND PATTERN (Blueprint Style) ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─── ANIMATION CONTAINER ─── */}
      <div className="relative w-56 h-56 mb-8 flex items-center justify-center z-10">
        {/* Bánh răng lớn xoay chậm */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute -top-4 -left-4 text-muted-foreground/20"
        >
          <Settings size={100} />
        </motion.div>

        {/* Bánh răng nhỏ xoay ngược chiều */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute bottom-2 right-2 text-primary/30"
        >
          <Settings size={64} />
        </motion.div>

        {/* Bánh răng mờ xoay ẩn phía sau */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-1/2 -right-8 -translate-y-1/2 text-muted-foreground/10"
        >
          <Settings size={80} />
        </motion.div>

        {/* Khung trung tâm nảy lên xuống (Mũ bảo hộ & Cờ lê) */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className="relative w-32 h-32 bg-background/80 rounded-full flex flex-col items-center justify-center backdrop-blur-sm border-4 border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.15)]">
            <HardHat size={48} className="text-primary mb-1" />
            <motion.div
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -bottom-3 -right-3 bg-card rounded-full p-2 border border-border shadow-sm"
            >
              <Wrench size={20} className="text-amber-500" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ─── TYPOGRAPHY ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="z-10"
      >
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">
          Tính năng đang được thi công
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-[460px] mx-auto mb-8 leading-relaxed">
          Đội ngũ kỹ sư của{" "}
          <span className="font-bold text-foreground">Chính Nam</span> đang nỗ
          lực lập trình và hoàn thiện phân hệ này. Rất xin lỗi vì sự bất tiện,
          vui lòng quay lại sau!
        </p>
      </motion.div>

      {/* ─── ACTION BUTTONS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-3 z-10"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
        >
          <Home size={16} /> Về Trang chủ
        </Link>
      </motion.div>
    </div>
  );
}
