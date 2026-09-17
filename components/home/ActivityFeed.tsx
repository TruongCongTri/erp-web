import React from 'react';
import { UserPlus, Shield, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const activities = [
  { id: 'act-1', type: 'employee', icon: <UserPlus size={14} />, text: 'Trần Minh Khoa đã được thêm vào Phòng Xây dựng', time: '08:42', color: 'text-green-600 bg-green-50' },
  { id: 'act-2', type: 'permission', icon: <Shield size={14} />, text: 'Vai trò "Kỹ sư trưởng" đã được cập nhật quyền BOQ', time: '08:15', color: 'text-blue-600 bg-blue-50' },
  { id: 'act-3', type: 'request', icon: <Clock size={14} />, text: 'Nguyễn Thị Hoa nộp đơn xin nghỉ phép 3 ngày (02–04/09)', time: '07:58', color: 'text-amber-600 bg-amber-50' },
  { id: 'act-4', type: 'alert', icon: <AlertCircle size={14} />, text: 'Thiếu nhân lực Phòng Vật lực — 2 vị trí chưa tuyển', time: '07:30', color: 'text-red-600 bg-red-50' },
  { id: 'act-5', type: 'approval', icon: <CheckCircle size={14} />, text: 'PO #2026-091 đã được Phòng Cung ứng phê duyệt', time: 'Hôm qua', color: 'text-green-600 bg-green-50' },
  { id: 'act-6', type: 'document', icon: <FileText size={14} />, text: 'Báo cáo BOQ dự án Vinhomes Grand Park đã được xuất', time: 'Hôm qua', color: 'text-blue-600 bg-blue-50' },
];

export default function ActivityFeed() {
  return (
    <div className="card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Hoạt động gần đây</h3>
        <span className="text-xs text-primary cursor-pointer hover:underline">Xem tất cả</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activities?.map((act) => (
          <div key={act?.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${act?.color}`}>
              {act?.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground leading-snug">{act?.text}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{act?.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}