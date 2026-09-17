"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Maximize,
  BrainCircuit,
  CheckCircle,
  XCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  FileCheck,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ActionButton from "@/components/buttons/ActionButton";
import { Document, Page, pdfjs } from "react-pdf";

// Import standard react-pdf layer styling
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type HighlightType = "skill" | "pro" | "con";

interface PdfHighlight {
  id: string;
  type: HighlightType;
  label: string;
  description: string;
  page: number;
  position: { top: string; left: string; width: string; height: string };
}

interface ResumeScannerPageProps {
  pdfUrl?: string;
}

const DEFAULT_PDF_URL = "/Truong_Cong_Tri-Software_Engineer-Chinh_Nam-vi.pdf"; // Replace with your static path or S3/Cloudinary URL

const MOCK_HIGHLIGHTS: PdfHighlight[] = [
  {
    id: "h1",
    type: "skill",
    page: 1,
    label: "NestJS & Next.js",
    description: "Kỹ năng khớp 100% với yêu cầu công việc cốt lõi.",
    position: { top: "33%", left: "12%", width: "45%", height: "4%" },
  },
  {
    id: "h2",
    type: "skill",
    page: 1,
    label: "PostgreSQL & Redis",
    description: "Kinh nghiệm database và caching rất tốt.",
    position: { top: "39%", left: "12%", width: "40%", height: "4%" },
  },
  {
    id: "h3",
    type: "pro",
    page: 1,
    label: "Kiến trúc hệ thống",
    description: "Sử dụng Controller-Service-Repository pattern chuẩn xác.",
    position: { top: "52%", left: "12%", width: "76%", height: "6%" },
  },
  {
    id: "h4",
    type: "con",
    page: 1,
    label: "Khoảng trống việc làm",
    description: "Gap 6 tháng vào năm 2025 không có mô tả rõ ràng.",
    position: { top: "70%", left: "12%", width: "76%", height: "7%" },
  },
];

export default function ResumeScannerPage({ pdfUrl = DEFAULT_PDF_URL }: ResumeScannerPageProps) {
  const router = useRouter();
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [pageWidth, setPageWidth] = useState<number>(780);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "raw">("analysis");

  const score = 88;

  // Toolbar Handlers
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "/public/Truong_Cong_Tri-Software_Engineer-Chinh_Nam-vi.pdf";
    link.target = "_blank";
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, "_blank");
    printWindow?.focus();
    printWindow?.print();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      pdfContainerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30 overflow-hidden">
      {/* ─── HEADER ─── */}
      <header className="flex-shrink-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground">Trương Công Trí - CV Phân tích</h1>
              <span className="badge badge-success !py-0.5 !px-2 !text-[10px]">Ứng viên tiềm năng</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Vị trí: Senior Full-stack Engineer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton
            variant="outline"
            className="text-xs px-4 h-9 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            requireConfirm
            confirmTitle="Từ chối ứng viên?"
            confirmLabel="Từ chối"
          >
            <XCircle size={14} className="mr-1.5" /> Từ chối
          </ActionButton>
          <ActionButton
            variant="primary"
            className="text-xs px-5 h-9"
            onAction={async () => {
              await new Promise((r) => setTimeout(r, 1000));
              return "Đã chuyển ứng viên sang vòng Phỏng vấn";
            }}
            loadingMessage="Đang xử lý..."
            successMessage={(msg) => msg}
          >
            <CheckCircle size={14} className="mr-1.5" /> Chuyển Phỏng vấn
          </ActionButton>
        </div>
      </header>

      {/* ─── MAIN SPLIT VIEW ─── */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* ─── LEFT: PDF VIEWER ─── */}
        <section
          ref={pdfContainerRef}
          className="flex-1 lg:flex-[6] bg-[#525659] relative flex flex-col overflow-hidden border-r border-border"
        >
          {/* PDF Toolbar */}
          <div className="h-12 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 z-10 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-foreground font-medium truncate max-w-[220px]">
              <FileCheck size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="truncate">CV_TruongCongTri_Fullstack.pdf</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeftIcon size={14} />
              </button>
              <span className="font-mono">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border/50">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-background text-muted-foreground shadow-sm transition-all"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[11px] font-mono w-10 text-center text-muted-foreground">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-background text-muted-foreground shadow-sm transition-all"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownload}
                title="Download PDF"
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <Download size={14} />
              </button>
              <button
                onClick={handlePrint}
                title="Print"
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <Printer size={14} />
              </button>
              <button
                onClick={handleToggleFullscreen}
                title="Fullscreen"
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <Maximize size={14} />
              </button>
            </div>
          </div>

          {/* Actual PDF Scroll Canvas */}
          <div className="flex-1 overflow-auto p-8 flex justify-center custom-scrollbar">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center h-96 gap-3 text-muted-foreground">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-xs">Đang tải tài liệu PDF...</span>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-96 text-red-400 text-xs">
                  Không thể tải file PDF. Vui lòng kiểm tra đường dẫn hoặc CORS header.
                </div>
              }
            >
              <div className="relative shadow-2xl transition-all duration-150 inline-block bg-white">
                {/* Rendered PDF Page */}
                <Page
                  pageNumber={pageNumber}
                  scale={zoom / 100}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                />

                {/* ── INTERACTIVE HIGHLIGHT OVERLAYS ── */}
                <div className="absolute inset-0 pointer-events-none">
                  {MOCK_HIGHLIGHTS.filter((hl) => hl.page === pageNumber).map((hl) => {
                    const isActive = activeHighlight === hl.id;
                    let colorClass = "";

                    if (hl.type === "skill" || hl.type === "pro") {
                      colorClass = isActive
                        ? "bg-emerald-400/30 border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.4)]"
                        : "bg-emerald-400/15 border-emerald-400/50 hover:bg-emerald-400/25";
                    } else {
                      colorClass = isActive
                        ? "bg-red-400/30 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.4)]"
                        : "bg-red-400/15 border-red-400/50 hover:bg-red-400/25";
                    }

                    return (
                      <div
                        key={hl.id}
                        onMouseEnter={() => setActiveHighlight(hl.id)}
                        onMouseLeave={() => setActiveHighlight(null)}
                        className={`absolute border rounded cursor-pointer pointer-events-auto transition-all duration-150 ${colorClass}`}
                        style={{
                          top: hl.position.top,
                          left: hl.position.left,
                          width: hl.position.width,
                          height: hl.position.height,
                        }}
                      >
                        {isActive && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                            {hl.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Document>
          </div>
        </section>

        {/* ─── RIGHT: AI ANALYSIS PANEL ─── */}
        <aside className="flex-[4] bg-card flex flex-col min-h-0 relative z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
          {/* Tabs */}
          <div className="flex items-center px-4 pt-3 border-b border-border gap-6">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === "analysis"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <BrainCircuit size={14} /> AI Phân tích
              </div>
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === "raw"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Trích xuất Text
            </button>
          </div>

          {activeTab === "analysis" ? (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
              {/* Score Section */}
              <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div>
                  <h2 className="text-sm font-bold text-foreground mb-1">Độ phù hợp công việc</h2>
                  <p className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed">
                    Dựa trên JD &ldquo;Senior Full-stack Engineer&rdquo; và dữ liệu trích xuất từ CV.
                  </p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-muted/30"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="175"
                      strokeDashoffset={175 - (175 * score) / 100}
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-lg font-bold text-emerald-600">{score}</span>
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b border-border pb-2">
                  Đánh giá chung
                </h3>
                <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                  Ứng viên sở hữu bộ kỹ năng công nghệ khớp <strong>95%</strong> với yêu cầu dự án. Tư duy thiết kế hệ
                  thống (Controller-Service-Repository) rất rõ ràng. Cần làm rõ khoảng trống việc làm 6 tháng trong quá
                  khứ.
                </p>
              </div>

              {/* Skills Match */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b border-border pb-2">
                  Kỹ năng (Hover để xem trên CV)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_HIGHLIGHTS.filter((h) => h.type === "skill").map((hl) => (
                    <div
                      key={hl.id}
                      onMouseEnter={() => {
                        setPageNumber(hl.page);
                        setActiveHighlight(hl.id);
                      }}
                      onMouseLeave={() => setActiveHighlight(null)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                        activeHighlight === hl.id
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                          : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <Sparkles
                        size={12}
                        className={activeHighlight === hl.id ? "text-primary-foreground" : "text-primary"}
                      />
                      {hl.label}
                    </div>
                  ))}
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-border bg-card text-[11px] font-medium text-muted-foreground opacity-50">
                    GraphQL (Missing)
                  </span>
                </div>
              </div>

              {/* Pros & Cons List */}
              <div className="grid grid-cols-1 gap-5">
                {/* PROS */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1.5">
                    <ThumbsUp size={12} /> Điểm mạnh
                  </h3>
                  {MOCK_HIGHLIGHTS.filter((h) => h.type === "pro").map((hl) => (
                    <div
                      key={hl.id}
                      onMouseEnter={() => {
                        setPageNumber(hl.page);
                        setActiveHighlight(hl.id);
                      }}
                      onMouseLeave={() => setActiveHighlight(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeHighlight === hl.id
                          ? "bg-emerald-50 border-emerald-300 shadow-sm"
                          : "bg-card border-border/60 hover:bg-muted/30 hover:border-border"
                      }`}
                    >
                      <p className="text-xs font-bold text-foreground mb-1">{hl.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{hl.description}</p>
                    </div>
                  ))}
                </div>

                {/* CONS / FLAGS */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2 flex items-center gap-1.5">
                    <ThumbsDown size={12} /> Điểm cần lưu ý (Red Flags)
                  </h3>
                  {MOCK_HIGHLIGHTS.filter((h) => h.type === "con").map((hl) => (
                    <div
                      key={hl.id}
                      onMouseEnter={() => {
                        setPageNumber(hl.page);
                        setActiveHighlight(hl.id);
                      }}
                      onMouseLeave={() => setActiveHighlight(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeHighlight === hl.id
                          ? "bg-red-50 border-red-300 shadow-sm"
                          : "bg-card border-border/60 hover:bg-muted/30 hover:border-border"
                      }`}
                    >
                      <p className="text-xs font-bold text-foreground mb-1">{hl.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{hl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="bg-muted/30 p-4 rounded-xl border border-border font-mono text-[10px] text-muted-foreground whitespace-pre-wrap leading-loose">
                {`TRƯƠNG CÔNG TRÍ
Senior Full-stack Engineer
Ho Chi Minh City, Vietnam
tri.tcong@gmail.com

SUMMARY
Passionate Full-stack Engineer with 5+ years of experience in building scalable web applications. Strong proficiency in TypeScript, NestJS, Next.js, and PostgreSQL.

EXPERIENCE
MakerPath - Full-stack Developer
(2023 - Present)
- Developed and maintained multiple enterprise applications using Next.js and NestJS.
- Designed 3D spatial map views and real-time telemetry overlays using WebSockets.
- Optimized database queries in PostgreSQL, reducing response time by 40%.`}
              </div>
            </div>
          )}
        </aside>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `,
        }}
      />
    </div>
  );
}