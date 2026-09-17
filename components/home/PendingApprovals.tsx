import React from 'react';
import { Check, X } from 'lucide-react';

const approvals = [
  { id: 'appr-1', type: 'Nghỉ phép', name: 'Nguyễn Thị Hoa', detail: '02–04/09/2026 (3 ngày)', dept: 'Phòng Thiết kế', priority: 'normal' },
  { id: 'appr-2', type: 'Tăng ca', name: 'Lê Văn Dũng', detail: '31/08/2026 — 4 giờ', dept: 'Xây dựng', priority: 'normal' },
  { id: 'appr-3', type: 'Chi phí', name: 'PO #2026-092', detail: '₫14,500,000 — Vật tư hàn', dept: 'Phòng Cung ứng', priority: 'high' },
  { id: 'appr-4', type: 'Tuyển dụng', name: 'Yêu cầu tuyển kỹ sư', detail: 'Vị trí: Kỹ sư kết cấu cấp cao', dept: 'Xây dựng', priority: 'high' },
];

const priorityBadge = {
  high: 'badge badge-pending',
  normal: 'badge badge-inactive',
};

export default function PendingApprovals() {
  return (
    <div className="card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Chờ phê duyệt</h3>
          <span className="badge badge-pending">{approvals.length}</span>
        </div>
        <span className="text-xs text-primary cursor-pointer hover:underline">Xem tất cả</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {approvals.map((item) => (
          <div key={item.id} className="px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={priorityBadge[item.priority as keyof typeof priorityBadge]}>
                    {item.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{item.dept}</span>
                </div>
                <p className="text-xs font-medium text-foreground">{item.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors" title="Phê duyệt">
                  <Check size={12} />
                </button>
                <button className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors" title="Từ chối">
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}