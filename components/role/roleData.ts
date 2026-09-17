export interface Permission {
  id: string;
  label: string;
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  userCount: number;
  permissionCount: number;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface RoleUser {
  id: string;
  name: string;
  initials: string;
  position: string;
}

export const roles: Role[] = [
  {
    id: 'role-gd', code: 'GD', name: 'Giao dịch', isDefault: true,
    userCount: 18, permissionCount: 41,
    description: 'Nhân viên xử lý giao dịch hàng ngày',
    updatedAt: '09:55 26/02/2026', updatedBy: 'Nông Quốc Đạt',
  },
  {
    id: 'role-dg', code: 'ĐG', name: 'Điều phối cơ giới', isDefault: true,
    userCount: 7, permissionCount: 28,
    description: 'Điều phối máy móc và thiết bị cơ giới',
    updatedAt: '14:22 20/02/2026', updatedBy: 'Trần Quốc Bảo',
  },
  {
    id: 'role-dc', code: 'ĐC', name: 'Điều phối thủ công', isDefault: true,
    userCount: 12, permissionCount: 24,
    description: 'Điều phối nhân công thủ công trên công trình',
    updatedAt: '10:05 18/02/2026', updatedBy: 'Nguyễn Kim Duyên',
  },
  {
    id: 'role-tg', code: 'TG', name: 'Tổ trưởng cơ giới', isDefault: true,
    userCount: 5, permissionCount: 35,
    description: 'Quản lý tổ cơ giới và báo cáo tiến độ',
    updatedAt: '08:30 15/02/2026', updatedBy: 'Trần Quốc Bảo',
  },
  {
    id: 'role-tc', code: 'TC', name: 'Tổ trưởng thủ công', isDefault: true,
    userCount: 8, permissionCount: 30,
    description: 'Quản lý tổ thủ công và phân công công việc',
    updatedAt: '16:45 12/02/2026', updatedBy: 'Phạm Ngọc Hà',
  },
  {
    id: 'role-kt', code: 'KT', name: 'Kế toán', isDefault: true,
    userCount: 11, permissionCount: 38,
    description: 'Quyền truy cập tài chính và kế toán nội bộ',
    updatedAt: '11:20 10/02/2026', updatedBy: 'Nông Quốc Đạt',
  },
  {
    id: 'role-admin', code: 'A', name: 'Admin', isDefault: true,
    userCount: 3, permissionCount: 65,
    description: 'Quản trị viên hệ thống — toàn quyền',
    updatedAt: '09:00 01/01/2026', updatedBy: 'System',
  },
  {
    id: 'role-gv', code: 'GV', name: 'Giao dịch viên', isDefault: false,
    userCount: 22, permissionCount: 19,
    description: 'Nhân viên giao dịch cấp cơ sở',
    updatedAt: '13:10 08/02/2026', updatedBy: 'Trần Quốc Bảo',
  },
  {
    id: 'role-gt', code: 'GT', name: 'Giao dịch viên trưởng', isDefault: false,
    userCount: 9, permissionCount: 27,
    description: 'Giao dịch viên cấp cao, có quyền xét duyệt',
    updatedAt: '15:35 05/02/2026', updatedBy: 'Nông Quốc Đạt',
  },
  {
    id: 'role-ks', code: 'KS', name: 'Kỹ sư', isDefault: false,
    userCount: 31, permissionCount: 22,
    description: 'Kỹ sư thiết kế và thi công',
    updatedAt: '10:50 02/02/2026', updatedBy: 'Phạm Ngọc Hà',
  },
  {
    id: 'role-tp', code: 'TP', name: 'Trưởng phòng', isDefault: false,
    userCount: 12, permissionCount: 48,
    description: 'Trưởng phòng ban — quyền quản lý phòng',
    updatedAt: '09:15 28/01/2026', updatedBy: 'System',
  },
];

export const permissionGroups: PermissionGroup[] = [
  {
    id: 'pg-hoadon', label: 'Hoá đơn',
    permissions: [
      { id: 'hd-view', label: 'Quyền xem hoá đơn' },
      { id: 'hd-delete', label: 'Quyền xoá hoá đơn' },
      { id: 'hd-debt', label: 'Ghi nhận nợ' },
      { id: 'hd-create', label: 'Quyền tạo/chỉnh sửa hoá đơn' },
    ],
  },
  {
    id: 'pg-chuyenkhoan', label: 'Chuyển khoản',
    permissions: [
      { id: 'ck-view', label: 'Quyền xem chuyển khoản' },
      { id: 'ck-refund', label: 'Quyền hoàn tiền chuyển khoản' },
      { id: 'ck-edit', label: 'Quyền chỉnh sửa hoàn tiền chuyển khoản' },
    ],
  },
  {
    id: 'pg-dichvu', label: 'Dịch vụ',
    permissions: [
      { id: 'dv-view', label: 'Quyền xem dịch vụ' },
      { id: 'dv-complete', label: 'Quyền hoàn thành dịch vụ' },
      { id: 'dv-addon', label: 'Quyền tạo dịch vụ bổ sung' },
      { id: 'dv-verify', label: 'Quyền xác nhận đủ điều kiện thanh toán' },
      { id: 'dv-delete', label: 'Quyền xoá dịch vụ' },
      { id: 'dv-oto', label: 'Quyền đẩy sang Ô tô đỏ' },
    ],
  },
  {
    id: 'pg-nhomhang', label: 'Nhóm hàng',
    permissions: [
      { id: 'nh-view', label: 'Quyền xem nhóm hàng' },
      { id: 'nh-create', label: 'Quyền tạo nhóm hàng' },
      { id: 'nh-edit', label: 'Quyền sửa nhóm hàng' },
      { id: 'nh-delete', label: 'Quyền xóa nhóm hàng' },
    ],
  },
  {
    id: 'pg-capxe', label: 'Cấp xe',
    permissions: [
      { id: 'cx-view', label: 'Quyền xem cấp xe' },
      { id: 'cx-assign', label: 'Quyền được phân tổ' },
      { id: 'cx-price', label: 'Quyền được vào giá' },
    ],
  },
  {
    id: 'pg-nhanvien', label: 'Nhân viên',
    permissions: [
      { id: 'nv-view', label: 'Quyền xem nhân viên' },
      { id: 'nv-create', label: 'Quyền tạo nhân viên' },
      { id: 'nv-edit', label: 'Quyền chỉnh sửa hồ sơ' },
      { id: 'nv-sensitive', label: 'Quyền xem thông tin nhạy cảm' },
      { id: 'nv-role', label: 'Quyền phân quyền vai trò' },
    ],
  },
  {
    id: 'pg-baocao', label: 'Báo cáo',
    permissions: [
      { id: 'bc-view', label: 'Quyền xem báo cáo' },
      { id: 'bc-export', label: 'Quyền xuất báo cáo' },
      { id: 'bc-finance', label: 'Quyền xem báo cáo tài chính' },
    ],
  },
];

export const roleUsers: Record<string, RoleUser[]> = {
  'role-gd': [
    { id: 'ru-1', name: 'Nguyễn Kim Duyên (TEST)', initials: 'ND', position: 'Nhân viên lập trình' },
    { id: 'ru-2', name: 'Lê Thị Mai (TEST)', initials: 'LM', position: '—' },
    { id: 'ru-3', name: 'Hoàng Long Phước (TEST)', initials: 'HP', position: '—' },
    { id: 'ru-4', name: 'Nguyễn Phương Thảo (TEST)', initials: 'PT', position: '—' },
    { id: 'ru-5', name: 'Nguyễn Quang Tú (TEST)', initials: 'QT', position: '—' },
    { id: 'ru-6', name: 'Hứa Văn Lợi (TEST)', initials: 'VL', position: '—' },
    { id: 'ru-7', name: 'Đặng Tiến Trung (TEST)', initials: 'TT', position: '—' },
    { id: 'ru-8', name: 'Hà Văn Thao (TEST)', initials: 'VT', position: '—' },
    { id: 'ru-9', name: 'Vỹ Mạnh Hùng (TEST)', initials: 'MH', position: '—' },
  ],
  'role-kt': [
    { id: 'ru-kt-1', name: 'Phạm Ngọc Hà (TEST)', initials: 'NH', position: 'Trưởng phòng Kế toán' },
    { id: 'ru-kt-2', name: 'Lê Thị Mai (TEST)', initials: 'LM', position: 'Kế toán viên' },
    { id: 'ru-kt-3', name: 'Trần Thị Bích Ngọc (TEST)', initials: 'BN', position: 'Kế toán viên' },
  ],
};

// Default permissions per role (permission IDs that are checked)
export const defaultRolePermissions: Record<string, Set<string>> = {
  'role-gd': new Set(['hd-view', 'hd-debt', 'dv-view', 'dv-addon', 'dv-oto', 'nh-view', 'cx-view', 'cx-assign', 'cx-price', 'bc-view']),
  'role-kt': new Set(['hd-view', 'hd-create', 'hd-debt', 'ck-view', 'ck-refund', 'ck-edit', 'dv-view', 'dv-complete', 'dv-verify', 'nh-view', 'nv-view', 'bc-view', 'bc-export', 'bc-finance']),
  'role-admin': new Set(permissionGroups.flatMap(g => g.permissions.map(p => p.id))),
  'role-tp': new Set(['hd-view', 'hd-create', 'hd-delete', 'hd-debt', 'ck-view', 'dv-view', 'dv-complete', 'dv-addon', 'dv-verify', 'nh-view', 'nh-create', 'nh-edit', 'cx-view', 'nv-view', 'nv-edit', 'bc-view', 'bc-export']),
};