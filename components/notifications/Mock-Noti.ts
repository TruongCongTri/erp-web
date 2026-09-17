type NotiType = "SYSTEM" | "HR" | "TASK" | "SECURITY";
type NotiStatus = "UNREAD" | "READ";
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotiType;
  status: NotiStatus;
  createdAt: string;
  sender: string;
  actionUrl?: string;
}
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "noti-1",
    title: "Cập nhật chính sách bảo mật hệ thống mới",
    message:
      "Hệ thống vừa cập nhật chính sách bảo mật mật khẩu. Vui lòng đổi mật khẩu định kỳ 90 ngày/lần để đảm bảo an toàn cho tài khoản của bạn.",
    type: "SECURITY",
    status: "UNREAD",
    createdAt: "2026-09-07T08:30:00Z",
    sender: "System Admin",
    actionUrl: "/vi/settings/security",
  },
  {
    id: "noti-2",
    title: "Phê duyệt đơn xin nghỉ phép",
    message:
      "Đơn xin nghỉ phép của bạn từ ngày 10/09/2026 đến 12/09/2026 đã được quản lý phê duyệt.",
    type: "HR",
    status: "UNREAD",
    createdAt: "2026-09-06T14:15:00Z",
    sender: "HR Department",
  },
  {
    id: "noti-3",
    title: "Bạn được giao một công việc mới: Rà soát khối lượng dự án A",
    message:
      "Quản lý vừa giao cho bạn một công việc mới thuộc dự án Alpha. Hạn chót hoàn thành là 15/09/2026. Vui lòng kiểm tra chi tiết trong phân hệ Công việc.",
    type: "TASK",
    status: "READ",
    createdAt: "2026-09-05T09:00:00Z",
    sender: "Phạm Văn Kháng",
    actionUrl: "/vi/tasks/detail/123",
  },
  {
    id: "noti-4",
    title: "Bảo trì hệ thống định kỳ",
    message:
      "Hệ thống sẽ tạm ngưng hoạt động để bảo trì từ 22:00 đến 23:00 ngày Chủ Nhật tuần này. Vui lòng lưu lại các công việc đang làm dở.",
    type: "SYSTEM",
    status: "READ",
    createdAt: "2026-09-01T10:00:00Z",
    sender: "IT Support",
  },
];
