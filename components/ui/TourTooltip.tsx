import { X } from "lucide-react";

interface TourTooltipProps {
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  isLast?: boolean;
  position?: "top" | "bottom";
}

export default function TourTooltip({
  title,
  description,
  onNext,
  onSkip,
  isLast,
  position = "bottom",
}: TourTooltipProps) {
  return (
    <div
      // Fixed width to w-full to guarantee it never chops off on small screens
      className={`absolute left-0 right-0 w-full bg-card border border-primary/20 shadow-2xl rounded-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-300 ${
        position === "bottom" ? "top-[calc(100%+12px)]" : "bottom-[calc(100%+12px)]"
      }`}
    >
      {/* Dynamic arrow pointing up or down depending on position */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-card border-primary/20 ${
          position === "bottom" ? "-top-2 border-l border-t" : "-bottom-2 border-r border-b"
        }`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-black text-sm text-foreground uppercase tracking-tight">
            {title}
          </h4>
          <button
            type="button"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors"
          >
            Bỏ qua hướng dẫn
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-lg font-bold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
          >
            {isLast ? "Hoàn thành" : "Đã hiểu, tiếp theo"}
          </button>
        </div>
      </div>
    </div>
  );
}