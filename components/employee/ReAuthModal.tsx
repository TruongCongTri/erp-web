"use client";
import React, { useState } from "react";
import { Lock, X, Eye, EyeOff } from "lucide-react";

interface ReAuthModalProps {
  onConfirm: (password: string) => Promise<void>;
  onClose: () => void;
  sectionLabel?: string;
}

export default function ReAuthModal({
  onConfirm,
  onClose,
  sectionLabel,
}: ReAuthModalProps) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Truyền password lên Parent để gọi API
      await onConfirm(password);
      // Ghi chú: Nếu thành công, Parent sẽ unmount component này nên không cần gọi onClose() ở đây
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Bắt lỗi từ API và hiển thị
      setError(
        err?.data?.message ||
          err?.message ||
          "Mật khẩu không đúng hoặc không có quyền truy cập.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-amber-500/10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock size={16} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Xác thực bảo mật
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {sectionLabel
                  ? `Để xem: ${sectionLabel}`
                  : "Để xem thông tin nhạy cảm"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-800 leading-relaxed">
                Bạn đang yêu cầu xem{" "}
                <strong>{sectionLabel || "dữ liệu nhạy cảm"}</strong>. Mọi thao
                tác truy cập sẽ được lưu lại trong nhật ký kiểm toán (Audit
                Log).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Mật khẩu xác thực
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-base pr-10 w-full ${error ? "border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder="Nhập mật khẩu của bạn..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {error && (
                <p className="text-[11px] text-red-600 mt-1.5 font-medium">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 px-5 py-4 border-t border-border bg-muted/10 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!password || loading}
              className="btn-primary min-w-[120px] flex items-center justify-center gap-2 text-xs py-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
