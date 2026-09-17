export type EmployeeStatus = 'active' | 'on-leave' | 'suspended' | 'terminated' | 'inactive';

export interface CCCDData {
  number: string;
  fullName: string;
  dob: string;
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
  issueDate: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  joinDate: string;
  manager: string;
  location: string;
  contractType: 'full-time' | 'part-time' | 'contractor';
  salary?: string;
  cccd?: string;
  cccdData?: CCCDData;
  taxNumber?: string;
  // Profile fields
  dob?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  bankAccount?: string;
  bankName?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  // Metadata
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  viewedAt?: string;
  viewedBy?: string;
}

export const employees: Employee[] = [
  {
    id: 'emp-001', code: 'NV-2024-001', name: 'Nguyễn Kim Duyên', initials: 'ND',
    email: 'kim.duyen@constructerp.vn', phone: '0901 234 567',
    department: 'Phòng Nhân lực', role: 'Nhân viên lập trình', status: 'active',
    joinDate: '15/03/2024', manager: 'Trần Quốc Bảo', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫22,000,000', cccd: '079204012345', taxNumber: 'MST-0234567',
    dob: '12/05/1998', gender: 'Nữ', nationality: 'Việt Nam',
    address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
    bankAccount: '0123456789', bankName: 'Vietcombank',
    emergencyContact: 'Nguyễn Văn A', emergencyPhone: '0901 111 222',
    cccdData: {
      number: '079204012345', fullName: 'NGUYỄN KIM DUYÊN', dob: '12/05/1998',
      gender: 'Nữ', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '123 Nguyễn Trãi, Quận 1, TP.HCM',
      expiryDate: '12/05/2033', issueDate: '15/06/2021',
    },
    createdAt: '15/03/2024 08:30', createdBy: 'Trần Quốc Bảo',
    updatedAt: '10/08/2025 14:22', updatedBy: 'Phạm Ngọc Hà',
    viewedAt: '31/08/2026 09:10', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-002', code: 'NV-2023-047', name: 'Lê Thị Mai', initials: 'LM',
    email: 'thi.mai@constructerp.vn', phone: '0912 345 678',
    department: 'Phòng Kế toán', role: 'Kế toán viên', status: 'active',
    joinDate: '01/07/2023', manager: 'Phạm Ngọc Hà', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫18,500,000', cccd: '079204023456', taxNumber: 'MST-0345678',
    dob: '22/09/1995', gender: 'Nữ', nationality: 'Việt Nam',
    address: '45 Lê Lợi, Quận 3, TP.HCM',
    bankAccount: '9876543210', bankName: 'Techcombank',
    emergencyContact: 'Lê Văn B', emergencyPhone: '0912 333 444',
    cccdData: {
      number: '079204023456', fullName: 'LÊ THỊ MAI', dob: '22/09/1995',
      gender: 'Nữ', nationality: 'Việt Nam', placeOfOrigin: 'Hà Nội',
      placeOfResidence: '45 Lê Lợi, Quận 3, TP.HCM',
      expiryDate: '22/09/2030', issueDate: '10/10/2020',
    },
    createdAt: '01/07/2023 09:00', createdBy: 'Phạm Ngọc Hà',
    updatedAt: '05/05/2025 11:15', updatedBy: 'Phạm Ngọc Hà',
    viewedAt: '30/08/2026 16:45', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-003', code: 'NV-2022-019', name: 'Hoàng Long Phước', initials: 'HP',
    email: 'long.phuoc@constructerp.vn', phone: '0933 456 789',
    department: 'Xây dựng', role: 'Kỹ sư kết cấu', status: 'active',
    joinDate: '22/11/2022', manager: 'Đỗ Minh Tuấn', location: 'Bình Dương',
    contractType: 'full-time', salary: '₫28,000,000', cccd: '079204034567', taxNumber: 'MST-0456789',
    dob: '05/03/1990', gender: 'Nam', nationality: 'Việt Nam',
    address: '78 Bình Dương, Thủ Dầu Một, Bình Dương',
    bankAccount: '1122334455', bankName: 'BIDV',
    emergencyContact: 'Hoàng Văn C', emergencyPhone: '0933 555 666',
    cccdData: {
      number: '079204034567', fullName: 'HOÀNG LONG PHƯỚC', dob: '05/03/1990',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'Bình Dương',
      placeOfResidence: '78 Bình Dương, Thủ Dầu Một, Bình Dương',
      expiryDate: '05/03/2025', issueDate: '20/04/2015',
    },
    createdAt: '22/11/2022 10:00', createdBy: 'Đỗ Minh Tuấn',
    updatedAt: '12/01/2026 09:30', updatedBy: 'HR Admin',
    viewedAt: '29/08/2026 10:00', viewedBy: 'Đỗ Minh Tuấn',
  },
  {
    id: 'emp-004', code: 'NV-2024-038', name: 'Nguyễn Phương Thảo', initials: 'PT',
    email: 'phuong.thao@constructerp.vn', phone: '0944 567 890',
    department: 'Khối Thiết kế', role: 'Kiến trúc sư', status: 'on-leave',
    joinDate: '10/01/2024', manager: 'Vũ Thanh Liêm', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫32,000,000', cccd: '079204045678', taxNumber: 'MST-0567890',
    dob: '18/07/1993', gender: 'Nữ', nationality: 'Việt Nam',
    address: '200 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    bankAccount: '5544332211', bankName: 'ACB',
    emergencyContact: 'Nguyễn Văn D', emergencyPhone: '0944 777 888',
    cccdData: {
      number: '079204045678', fullName: 'NGUYỄN PHƯƠNG THẢO', dob: '18/07/1993',
      gender: 'Nữ', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '200 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      expiryDate: '18/07/2028', issueDate: '25/08/2018',
    },
    createdAt: '10/01/2024 08:00', createdBy: 'Vũ Thanh Liêm',
    updatedAt: '20/06/2026 13:00', updatedBy: 'HR Admin',
    viewedAt: '31/08/2026 08:55', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-005', code: 'NV-2023-012', name: 'Nguyễn Quang Tú', initials: 'QT',
    email: 'quang.tu@constructerp.vn', phone: '0955 678 901',
    department: 'Phòng Kinh doanh', role: 'Chuyên viên kinh doanh', status: 'active',
    joinDate: '05/02/2023', manager: 'Bùi Thị Lan', location: 'Hà Nội',
    contractType: 'full-time', salary: '₫20,000,000', cccd: '079204056789', taxNumber: 'MST-0678901',
    dob: '30/11/1991', gender: 'Nam', nationality: 'Việt Nam',
    address: '55 Hoàn Kiếm, Hà Nội',
    bankAccount: '6677889900', bankName: 'MB Bank',
    emergencyContact: 'Nguyễn Thị E', emergencyPhone: '0955 999 000',
    cccdData: {
      number: '079204056789', fullName: 'NGUYỄN QUANG TÚ', dob: '30/11/1991',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'Hà Nội',
      placeOfResidence: '55 Hoàn Kiếm, Hà Nội',
      expiryDate: '30/11/2026', issueDate: '05/12/2016',
    },
    createdAt: '05/02/2023 09:30', createdBy: 'Bùi Thị Lan',
    updatedAt: '15/03/2025 10:00', updatedBy: 'Bùi Thị Lan',
    viewedAt: '28/08/2026 14:20', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-006', code: 'NV-2021-005', name: 'Hứa Văn Lợi', initials: 'VL',
    email: 'van.loi@constructerp.vn', phone: '0966 789 012',
    department: 'Phòng Vật lực', role: 'Quản lý kho', status: 'active',
    joinDate: '18/06/2021', manager: 'Ngô Đức Thắng', location: 'Đồng Nai',
    contractType: 'full-time', salary: '₫17,000,000', cccd: '079204067890', taxNumber: 'MST-0789012',
    dob: '14/04/1988', gender: 'Nam', nationality: 'Việt Nam',
    address: '10 Long Thành, Đồng Nai',
    bankAccount: '1029384756', bankName: 'Agribank',
    emergencyContact: 'Hứa Thị F', emergencyPhone: '0966 111 222',
    cccdData: {
      number: '079204067890', fullName: 'HỨA VĂN LỢI', dob: '14/04/1988',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'Đồng Nai',
      placeOfResidence: '10 Long Thành, Đồng Nai',
      expiryDate: '14/04/2023', issueDate: '20/05/2013',
    },
    createdAt: '18/06/2021 07:45', createdBy: 'Ngô Đức Thắng',
    updatedAt: '01/01/2026 08:00', updatedBy: 'HR Admin',
    viewedAt: '27/08/2026 11:30', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-007', code: 'NV-2025-003', name: 'Đặng Tiến Trung', initials: 'TT',
    email: 'tien.trung@constructerp.vn', phone: '0977 890 123',
    department: 'Xây dựng', role: 'Giám sát thi công', status: 'active',
    joinDate: '12/02/2025', manager: 'Đỗ Minh Tuấn', location: 'Long An',
    contractType: 'full-time', salary: '₫25,000,000', cccd: '079204078901', taxNumber: 'MST-0890123',
    dob: '08/08/1992', gender: 'Nam', nationality: 'Việt Nam',
    address: '33 Tân An, Long An',
    bankAccount: '9988776655', bankName: 'VPBank',
    emergencyContact: 'Đặng Thị G', emergencyPhone: '0977 333 444',
    cccdData: {
      number: '079204078901', fullName: 'ĐẶNG TIẾN TRUNG', dob: '08/08/1992',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'Long An',
      placeOfResidence: '33 Tân An, Long An',
      expiryDate: '08/08/2027', issueDate: '15/09/2017',
    },
    createdAt: '12/02/2025 08:15', createdBy: 'Đỗ Minh Tuấn',
    updatedAt: '12/02/2025 08:15', updatedBy: 'Đỗ Minh Tuấn',
    viewedAt: '31/08/2026 09:00', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-008', code: 'NV-2022-033', name: 'Hà Văn Thao', initials: 'VT',
    email: 'van.thao@constructerp.vn', phone: '0988 901 234',
    department: 'An toàn & QLCL', role: 'Chuyên viên an toàn', status: 'active',
    joinDate: '30/08/2022', manager: 'Lý Thanh Tùng', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫19,500,000', cccd: '079204089012', taxNumber: 'MST-0901234',
    dob: '25/12/1994', gender: 'Nam', nationality: 'Việt Nam',
    address: '88 Bình Thạnh, TP.HCM',
    bankAccount: '1122334466', bankName: 'Sacombank',
    emergencyContact: 'Hà Thị H', emergencyPhone: '0988 555 666',
    cccdData: {
      number: '079204089012', fullName: 'HÀ VĂN THAO', dob: '25/12/1994',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '88 Bình Thạnh, TP.HCM',
      expiryDate: '25/12/2029', issueDate: '30/01/2020',
    },
    createdAt: '30/08/2022 09:00', createdBy: 'Lý Thanh Tùng',
    updatedAt: '10/10/2025 15:00', updatedBy: 'HR Admin',
    viewedAt: '30/08/2026 12:00', viewedBy: 'Lý Thanh Tùng',
  },
  {
    id: 'emp-009', code: 'NV-2023-058', name: 'Vỹ Mạnh Hùng', initials: 'MH',
    email: 'manh.hung@constructerp.vn', phone: '0999 012 345',
    department: 'Phòng Dự toán', role: 'Kỹ sư dự toán', status: 'suspended',
    joinDate: '22/09/2023', manager: 'Cao Thị Bích', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫23,000,000', cccd: '079204090123', taxNumber: 'MST-1012345',
    dob: '17/06/1996', gender: 'Nam', nationality: 'Việt Nam',
    address: '15 Gò Vấp, TP.HCM',
    bankAccount: '3344556677', bankName: 'HDBank',
    emergencyContact: 'Vỹ Thị I', emergencyPhone: '0999 777 888',
    cccdData: {
      number: '079204090123', fullName: 'VỸ MẠNH HÙNG', dob: '17/06/1996',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '15 Gò Vấp, TP.HCM',
      expiryDate: '17/06/2031', issueDate: '22/07/2021',
    },
    createdAt: '22/09/2023 10:30', createdBy: 'Cao Thị Bích',
    updatedAt: '05/07/2026 09:00', updatedBy: 'HR Admin',
    viewedAt: '31/08/2026 08:00', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-010', code: 'NV-2024-055', name: 'Trần Thị Bích Ngọc', initials: 'BN',
    email: 'bich.ngoc@constructerp.vn', phone: '0901 123 456',
    department: 'Phòng Cung ứng', role: 'Chuyên viên mua hàng', status: 'active',
    joinDate: '03/06/2024', manager: 'Đinh Văn Phúc', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫16,000,000', cccd: '079204001234', taxNumber: 'MST-1123456',
    dob: '09/02/2000', gender: 'Nữ', nationality: 'Việt Nam',
    address: '22 Tân Bình, TP.HCM',
    bankAccount: '7788990011', bankName: 'OCB',
    emergencyContact: 'Trần Văn J', emergencyPhone: '0901 999 000',
    cccdData: {
      number: '079204001234', fullName: 'TRẦN THỊ BÍCH NGỌC', dob: '09/02/2000',
      gender: 'Nữ', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '22 Tân Bình, TP.HCM',
      expiryDate: '09/02/2035', issueDate: '15/03/2020',
    },
    createdAt: '03/06/2024 08:00', createdBy: 'Đinh Văn Phúc',
    updatedAt: '03/06/2024 08:00', updatedBy: 'Đinh Văn Phúc',
    viewedAt: '31/08/2026 09:17', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-011', code: 'NV-2020-002', name: 'Phạm Ngọc Hà', initials: 'NH',
    email: 'ngoc.ha@constructerp.vn', phone: '0912 234 567',
    department: 'Phòng Kế toán', role: 'Trưởng phòng Kế toán', status: 'active',
    joinDate: '01/01/2020', manager: 'Ban Giám đốc', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫45,000,000', cccd: '079204012233', taxNumber: 'MST-1234567',
    dob: '03/03/1985', gender: 'Nữ', nationality: 'Việt Nam',
    address: '100 Phú Nhuận, TP.HCM',
    bankAccount: '1234567890', bankName: 'Vietinbank',
    emergencyContact: 'Phạm Văn K', emergencyPhone: '0912 111 333',
    cccdData: {
      number: '079204012233', fullName: 'PHẠM NGỌC HÀ', dob: '03/03/1985',
      gender: 'Nữ', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '100 Phú Nhuận, TP.HCM',
      expiryDate: '03/03/2020', issueDate: '10/04/2010',
    },
    createdAt: '01/01/2020 07:00', createdBy: 'Ban Giám đốc',
    updatedAt: '01/01/2026 07:00', updatedBy: 'HR Admin',
    viewedAt: '31/08/2026 09:15', viewedBy: 'HR Admin',
  },
  {
    id: 'emp-012', code: 'NV-2019-001', name: 'Trần Quốc Bảo', initials: 'QB',
    email: 'quoc.bao@constructerp.vn', phone: '0923 345 678',
    department: 'Phòng Nhân lực', role: 'Giám đốc Nhân sự', status: 'active',
    joinDate: '15/05/2019', manager: 'Ban Giám đốc', location: 'TP.HCM',
    contractType: 'full-time', salary: '₫60,000,000', cccd: '079204023344', taxNumber: 'MST-1345678',
    dob: '20/10/1980', gender: 'Nam', nationality: 'Việt Nam',
    address: '5 Quận 7, TP.HCM',
    bankAccount: '0987654321', bankName: 'Vietcombank',
    emergencyContact: 'Trần Thị L', emergencyPhone: '0923 222 444',
    cccdData: {
      number: '079204023344', fullName: 'TRẦN QUỐC BẢO', dob: '20/10/1980',
      gender: 'Nam', nationality: 'Việt Nam', placeOfOrigin: 'TP.HCM',
      placeOfResidence: '5 Quận 7, TP.HCM',
      expiryDate: '20/10/2015', issueDate: '25/11/2005',
    },
    createdAt: '15/05/2019 08:00', createdBy: 'Ban Giám đốc',
    updatedAt: '15/05/2025 08:00', updatedBy: 'HR Admin',
    viewedAt: '31/08/2026 09:17', viewedBy: 'HR Admin',
  },
];

export const departments = [
  'Tất cả', 'Xây dựng', 'Khối Thiết kế', 'Phòng Kế toán',
  'Phòng Nhân lực', 'Phòng Kinh doanh', 'Phòng Vật lực',
  'An toàn & QLCL', 'Phòng Dự toán', 'Phòng Cung ứng', 'Hành chính NS',
];

export const statusLabels: Record<EmployeeStatus, string> = {
  active: 'Đang làm việc',
  'on-leave': 'Nghỉ phép',
  suspended: 'Tạm đình chỉ',
  terminated: 'Đã nghỉ việc',
  inactive: 'Ngừng hoạt động',
};

export const statusClasses: Record<EmployeeStatus, string> = {
  active: 'badge badge-active',
  'on-leave': 'badge badge-pending',
  suspended: 'badge bg-orange-100 text-orange-700',
  terminated: 'badge badge-terminated',
  inactive: 'badge bg-slate-100 text-slate-600',
};