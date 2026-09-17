export type CandidateStatus =
  | "new"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";
export type ApplicationPriority = "high" | "medium" | "low";

export interface CVVersion {
  id: string;
  version: number;
  source: string;
  uploadedDate: string;
  uploadedBy: string;
  fileName: string;
  fileSize: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  highlights: string[];
}

export interface ReferenceInfo {
  id: string;
  name: string;
  relationship: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  isCurrentEmployee: boolean;
  employeeId?: string;
  department?: string;
  notes?: string;
}

export interface ApplicationHistory {
  id: string;
  appliedDate: string;
  position: string;
  department: string;
  source: string;
  status: CandidateStatus;
  cvVersionId: string;
  notes?: string;
  jobPostId?: string; // links to a JobRequisition id when sourced from a job post
}

export interface ProgressUpdate {
  id: string;
  date: string;
  fromStatus: CandidateStatus;
  toStatus: CandidateStatus;
  updatedBy: string;
  notes: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: CandidateStatus;
  priority: ApplicationPriority;
  source: string;
  appliedDate: string;
  experience: string;
  education: string;
  skills: string[];
  interviewer?: string;
  notes?: string;
  // Extended fields
  dob?: string;
  gender?: string;
  address?: string;
  nationality?: string;
  linkedIn?: string;
  portfolio?: string;
  expectedSalary?: string;
  currentSalary?: string;
  noticePeriod?: string;
  cvVersions: CVVersion[];
  references: ReferenceInfo[];
  applicationHistory: ApplicationHistory[];
  progressHistory: ProgressUpdate[];
  suggestedBy?: string;
  suggestedByEmployee?: boolean;
}

export const candidates: Candidate[] = [
  {
    id: "cand-001",
    name: "Nguyễn Văn An",
    initials: "VA",
    email: "van.an@gmail.com",
    phone: "0901 111 222",
    position: "Kỹ sư kết cấu",
    department: "Xây dựng",
    status: "interview",
    priority: "high",
    source: "LinkedIn",
    appliedDate: "15/08/2026",
    experience: "5 năm",
    education: "Đại học Bách Khoa",
    skills: ["AutoCAD", "ETABS", "SAP2000"],
    interviewer: "Đỗ Minh Tuấn",
    dob: "15/03/1991",
    gender: "Nam",
    address: "Quận 1, TP.HCM",
    nationality: "Việt Nam",
    linkedIn: "linkedin.com/in/vanan",
    expectedSalary: "25,000,000 VND",
    currentSalary: "20,000,000 VND",
    noticePeriod: "30 ngày",
    cvVersions: [
      {
        id: "cv-001-v2",
        version: 2,
        source: "LinkedIn",
        uploadedDate: "15/08/2026",
        uploadedBy: "Nguyễn Văn An",
        fileName: "NguyenVanAn_CV_2026.pdf",
        fileSize: "1.2 MB",
        summary:
          "Kỹ sư kết cấu 5 năm kinh nghiệm, chuyên về thiết kế nhà cao tầng và công trình dân dụng.",
        skills: ["AutoCAD", "ETABS", "SAP2000", "Revit Structure"],
        experience: "5 năm",
        education: "Đại học Bách Khoa TP.HCM",
        highlights: [
          "Thiết kế 15+ dự án nhà cao tầng",
          "Chứng chỉ PE (Professional Engineer)",
          "Thành thạo TCVN 5574:2018",
        ],
      },
      {
        id: "cv-001-v1",
        version: 1,
        source: "TopCV",
        uploadedDate: "10/03/2025",
        uploadedBy: "Nguyễn Văn An",
        fileName: "NguyenVanAn_CV_2025.pdf",
        fileSize: "980 KB",
        summary:
          "Kỹ sư kết cấu 4 năm kinh nghiệm, tập trung vào công trình dân dụng.",
        skills: ["AutoCAD", "ETABS", "SAP2000"],
        experience: "4 năm",
        education: "Đại học Bách Khoa TP.HCM",
        highlights: [
          "Tham gia 10+ dự án",
          "Kinh nghiệm làm việc với nhà thầu nước ngoài",
        ],
      },
    ],
    references: [
      {
        id: "ref-001-1",
        name: "Đỗ Minh Tuấn",
        relationship: "Quản lý trực tiếp cũ",
        company: "ConstructERP",
        position: "Trưởng phòng Kỹ thuật",
        phone: "0901 999 888",
        email: "minh.tuan@constructerp.vn",
        isCurrentEmployee: true,
        employeeId: "emp-015",
        department: "Xây dựng",
        notes: "Từng là quản lý trực tiếp tại dự án Landmark 81",
      },
      {
        id: "ref-001-2",
        name: "Trần Quốc Bảo",
        relationship: "Đồng nghiệp",
        company: "Coteccons",
        position: "Kỹ sư trưởng",
        phone: "0912 777 666",
        email: "quoc.bao@coteccons.vn",
        isCurrentEmployee: false,
        notes: "Cùng làm việc tại dự án Vinhomes Central Park",
      },
    ],
    applicationHistory: [
      {
        id: "app-001-2",
        appliedDate: "15/08/2026",
        position: "Kỹ sư kết cấu cấp cao",
        department: "Xây dựng",
        source: "LinkedIn",
        status: "interview",
        cvVersionId: "cv-001-v2",
        jobPostId: "req-001",
      },
      {
        id: "app-001-1",
        appliedDate: "10/03/2025",
        position: "Kỹ sư kết cấu cấp cao",
        department: "Xây dựng",
        source: "TopCV",
        status: "rejected",
        cvVersionId: "cv-001-v1",
        jobPostId: "req-001",
        notes: "Chưa đủ kinh nghiệm quản lý",
      },
    ],
    progressHistory: [
      {
        id: "prog-001-2",
        date: "20/08/2026",
        fromStatus: "screening",
        toStatus: "interview",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Vượt qua vòng sàng lọc hồ sơ",
      },
      {
        id: "prog-001-1",
        date: "16/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Tiếp nhận hồ sơ",
      },
    ],
  },
  {
    id: "cand-002",
    name: "Trần Thị Bảo",
    initials: "TB",
    email: "thi.bao@gmail.com",
    phone: "0912 222 333",
    position: "Kiến trúc sư",
    department: "Khối Thiết kế",
    status: "screening",
    priority: "high",
    source: "Website",
    appliedDate: "20/08/2026",
    experience: "3 năm",
    education: "Đại học Kiến trúc",
    skills: ["Revit", "SketchUp", "AutoCAD"],
    interviewer: "Vũ Thanh Liêm",
    dob: "22/07/1993",
    gender: "Nữ",
    address: "Quận 3, TP.HCM",
    expectedSalary: "18,000,000 VND",
    cvVersions: [
      {
        id: "cv-002-v1",
        version: 1,
        source: "Website",
        uploadedDate: "20/08/2026",
        uploadedBy: "Trần Thị Bảo",
        fileName: "TranThiBao_Portfolio_2026.pdf",
        fileSize: "3.5 MB",
        summary:
          "Kiến trúc sư 3 năm kinh nghiệm, chuyên về thiết kế nội thất và kiến trúc thương mại.",
        skills: ["Revit", "SketchUp", "AutoCAD", "3ds Max", "Lumion"],
        experience: "3 năm",
        education: "Đại học Kiến trúc TP.HCM",
        highlights: [
          "Portfolio 20+ dự án",
          "Giải thưởng thiết kế trẻ 2024",
          "Thành thạo BIM Level 2",
        ],
      },
    ],
    references: [
      {
        id: "ref-002-1",
        name: "Vũ Thanh Liêm",
        relationship: "Giảng viên hướng dẫn",
        company: "Đại học Kiến trúc TP.HCM",
        position: "Phó Giáo sư",
        phone: "0923 456 789",
        email: "thanh.liem@uah.edu.vn",
        isCurrentEmployee: false,
      },
    ],
    applicationHistory: [
      {
        id: "app-002-1",
        appliedDate: "20/08/2026",
        position: "Kiến trúc sư",
        department: "Khối Thiết kế",
        source: "Website",
        status: "screening",
        cvVersionId: "cv-002-v1",
      },
    ],
    progressHistory: [
      {
        id: "prog-002-1",
        date: "21/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Hồ sơ đạt yêu cầu cơ bản",
      },
    ],
  },
  {
    id: "cand-003",
    name: "Lê Minh Cường",
    initials: "MC",
    email: "minh.cuong@gmail.com",
    phone: "0933 333 444",
    position: "Kế toán viên",
    department: "Phòng Kế toán",
    status: "offer",
    priority: "medium",
    source: "TopCV",
    appliedDate: "10/08/2026",
    experience: "4 năm",
    education: "Đại học Kinh tế",
    skills: ["Excel", "MISA", "SAP"],
    interviewer: "Phạm Ngọc Hà",
    dob: "05/11/1990",
    gender: "Nam",
    address: "Bình Thạnh, TP.HCM",
    expectedSalary: "20,000,000 VND",
    suggestedBy: "Nguyễn Thị Lan (Nhân viên)",
    suggestedByEmployee: true,
    cvVersions: [
      {
        id: "cv-003-v1",
        version: 1,
        source: "TopCV",
        uploadedDate: "10/08/2026",
        uploadedBy: "Lê Minh Cường",
        fileName: "LeMinhCuong_CV.pdf",
        fileSize: "850 KB",
        summary:
          "Kế toán viên 4 năm kinh nghiệm, thành thạo MISA và SAP, có kinh nghiệm trong ngành xây dựng.",
        skills: ["Excel", "MISA", "SAP", "Kế toán xây dựng"],
        experience: "4 năm",
        education: "Đại học Kinh tế TP.HCM",
        highlights: [
          "Kinh nghiệm kế toán xây dựng 2 năm",
          "Chứng chỉ CPA",
          "Thành thạo quyết toán công trình",
        ],
      },
    ],
    references: [
      {
        id: "ref-003-1",
        name: "Nguyễn Thị Lan",
        relationship: "Người giới thiệu (Nhân viên công ty)",
        company: "ConstructERP",
        position: "Chuyên viên Kế toán",
        phone: "0934 567 890",
        email: "thi.lan@constructerp.vn",
        isCurrentEmployee: true,
        employeeId: "emp-023",
        department: "Phòng Kế toán",
        notes:
          "Bạn học cùng trường, đã làm việc cùng nhau 2 năm tại công ty cũ",
      },
    ],
    applicationHistory: [
      {
        id: "app-003-1",
        appliedDate: "10/08/2026",
        position: "Kế toán viên",
        department: "Phòng Kế toán",
        source: "TopCV",
        status: "offer",
        cvVersionId: "cv-003-v1",
      },
    ],
    progressHistory: [
      {
        id: "prog-003-3",
        date: "28/08/2026",
        fromStatus: "interview",
        toStatus: "offer",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Phỏng vấn xuất sắc, đề nghị mức lương 20tr",
      },
      {
        id: "prog-003-2",
        date: "18/08/2026",
        fromStatus: "screening",
        toStatus: "interview",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Hồ sơ tốt, mời phỏng vấn",
      },
      {
        id: "prog-003-1",
        date: "11/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Tiếp nhận từ giới thiệu nội bộ",
      },
    ],
  },
  {
    id: "cand-004",
    name: "Phạm Thị Dung",
    initials: "TD",
    email: "thi.dung@gmail.com",
    phone: "0944 444 555",
    position: "Chuyên viên an toàn",
    department: "An toàn & QLCL",
    status: "new",
    priority: "medium",
    source: "JobStreet",
    appliedDate: "28/08/2026",
    experience: "2 năm",
    education: "Đại học Tôn Đức Thắng",
    skills: ["ISO 45001", "Báo cáo ATVSLĐ"],
    cvVersions: [
      {
        id: "cv-004-v1",
        version: 1,
        source: "JobStreet",
        uploadedDate: "28/08/2026",
        uploadedBy: "Phạm Thị Dung",
        fileName: "PhamThiDung_CV.pdf",
        fileSize: "720 KB",
        summary:
          "Chuyên viên an toàn lao động 2 năm kinh nghiệm trong ngành xây dựng.",
        skills: ["ISO 45001", "Báo cáo ATVSLĐ", "Kiểm tra công trình"],
        experience: "2 năm",
        education: "Đại học Tôn Đức Thắng",
        highlights: [
          "Chứng chỉ ATVSLĐ hạng A",
          "Kinh nghiệm tại 5 công trình lớn",
        ],
      },
    ],
    references: [],
    applicationHistory: [
      {
        id: "app-004-1",
        appliedDate: "28/08/2026",
        position: "Chuyên viên an toàn lao động",
        department: "An toàn & QLCL",
        source: "JobStreet",
        status: "new",
        cvVersionId: "cv-004-v1",
        jobPostId: "req-004",
      },
    ],
    progressHistory: [],
  },
  {
    id: "cand-005",
    name: "Hoàng Văn Em",
    initials: "VE",
    email: "van.em@gmail.com",
    phone: "0955 555 666",
    position: "Chuyên viên kinh doanh",
    department: "Phòng Kinh doanh",
    status: "rejected",
    priority: "low",
    source: "LinkedIn",
    appliedDate: "05/08/2026",
    experience: "1 năm",
    education: "Đại học Ngoại thương",
    skills: ["CRM", "Excel", "Tiếng Anh B2"],
    cvVersions: [
      {
        id: "cv-005-v1",
        version: 1,
        source: "LinkedIn",
        uploadedDate: "05/08/2026",
        uploadedBy: "Hoàng Văn Em",
        fileName: "HoangVanEm_CV.pdf",
        fileSize: "650 KB",
        summary: "Chuyên viên kinh doanh 1 năm kinh nghiệm, tập trung vào B2B.",
        skills: ["CRM", "Excel", "Tiếng Anh B2"],
        experience: "1 năm",
        education: "Đại học Ngoại thương TP.HCM",
        highlights: ["Đạt 120% KPI quý 1/2026"],
      },
    ],
    references: [],
    applicationHistory: [
      {
        id: "app-005-1",
        appliedDate: "05/08/2026",
        position: "Chuyên viên kinh doanh",
        department: "Phòng Kinh doanh",
        source: "LinkedIn",
        status: "rejected",
        cvVersionId: "cv-005-v1",
        notes: "Chưa đủ kinh nghiệm ngành xây dựng",
      },
    ],
    progressHistory: [
      {
        id: "prog-005-2",
        date: "15/08/2026",
        fromStatus: "screening",
        toStatus: "rejected",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Không phù hợp yêu cầu ngành",
      },
      {
        id: "prog-005-1",
        date: "06/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Tiếp nhận hồ sơ",
      },
    ],
  },
  {
    id: "cand-006",
    name: "Vũ Thị Phương",
    initials: "TP",
    email: "thi.phuong@gmail.com",
    phone: "0966 666 777",
    position: "Kỹ sư dự toán",
    department: "Phòng Dự toán",
    status: "interview",
    priority: "high",
    source: "TopCV",
    appliedDate: "18/08/2026",
    experience: "6 năm",
    education: "Đại học Xây dựng",
    skills: ["Dự toán GXD", "Excel", "AutoCAD"],
    interviewer: "Cao Thị Bích",
    cvVersions: [
      {
        id: "cv-006-v1",
        version: 1,
        source: "TopCV",
        uploadedDate: "18/08/2026",
        uploadedBy: "Vũ Thị Phương",
        fileName: "VuThiPhuong_CV.pdf",
        fileSize: "1.1 MB",
        summary:
          "Kỹ sư dự toán 6 năm kinh nghiệm, chuyên về dự toán công trình dân dụng và công nghiệp.",
        skills: ["Dự toán GXD", "Excel", "AutoCAD", "MS Project"],
        experience: "6 năm",
        education: "Đại học Xây dựng Hà Nội",
        highlights: [
          "Dự toán 30+ công trình",
          "Chứng chỉ đấu thầu quốc gia",
          "Kinh nghiệm dự án ODA",
        ],
      },
    ],
    references: [],
    applicationHistory: [
      {
        id: "app-006-1",
        appliedDate: "18/08/2026",
        position: "Kỹ sư dự toán",
        department: "Phòng Dự toán",
        source: "TopCV",
        status: "interview",
        cvVersionId: "cv-006-v1",
        jobPostId: "req-002",
      },
    ],
    progressHistory: [
      {
        id: "prog-006-2",
        date: "22/08/2026",
        fromStatus: "screening",
        toStatus: "interview",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Hồ sơ xuất sắc",
      },
      {
        id: "prog-006-1",
        date: "19/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Tiếp nhận hồ sơ",
      },
    ],
  },
  {
    id: "cand-007",
    name: "Đặng Quốc Giang",
    initials: "QG",
    email: "quoc.giang@gmail.com",
    phone: "0977 777 888",
    position: "Giám sát thi công",
    department: "Xây dựng",
    status: "hired",
    priority: "high",
    source: "Referral",
    appliedDate: "01/08/2026",
    experience: "8 năm",
    education: "Đại học Bách Khoa",
    skills: ["Quản lý công trình", "MS Project", "AutoCAD"],
    interviewer: "Đỗ Minh Tuấn",
    cvVersions: [
      {
        id: "cv-007-v1",
        version: 1,
        source: "Referral",
        uploadedDate: "01/08/2026",
        uploadedBy: "Đặng Quốc Giang",
        fileName: "DangQuocGiang_CV.pdf",
        fileSize: "1.4 MB",
        summary:
          "Giám sát thi công 8 năm kinh nghiệm, chuyên về công trình cao tầng và hạ tầng.",
        skills: ["Quản lý công trình", "MS Project", "AutoCAD", "Primavera P6"],
        experience: "8 năm",
        education: "Đại học Bách Khoa TP.HCM",
        highlights: [
          "Giám sát 20+ công trình",
          "Chứng chỉ PMP",
          "Kinh nghiệm dự án quốc tế",
        ],
      },
    ],
    references: [],
    applicationHistory: [
      {
        id: "app-007-1",
        appliedDate: "01/08/2026",
        position: "Giám sát thi công",
        department: "Xây dựng",
        source: "Referral",
        status: "hired",
        cvVersionId: "cv-007-v1",
      },
    ],
    progressHistory: [
      {
        id: "prog-007-4",
        date: "25/08/2026",
        fromStatus: "offer",
        toStatus: "hired",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Ký hợp đồng thành công",
      },
      {
        id: "prog-007-3",
        date: "15/08/2026",
        fromStatus: "interview",
        toStatus: "offer",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Phỏng vấn xuất sắc",
      },
      {
        id: "prog-007-2",
        date: "05/08/2026",
        fromStatus: "screening",
        toStatus: "interview",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Hồ sơ tốt",
      },
      {
        id: "prog-007-1",
        date: "02/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Tiếp nhận từ giới thiệu",
      },
    ],
  },
  {
    id: "cand-008",
    name: "Ngô Thị Hương",
    initials: "TH",
    email: "thi.huong@gmail.com",
    phone: "0988 888 999",
    position: "Chuyên viên mua hàng",
    department: "Phòng Cung ứng",
    status: "screening",
    priority: "medium",
    source: "Website",
    appliedDate: "25/08/2026",
    experience: "3 năm",
    education: "Đại học Kinh tế",
    skills: ["Đàm phán", "Excel", "SAP MM"],
    cvVersions: [
      {
        id: "cv-008-v1",
        version: 1,
        source: "Website",
        uploadedDate: "25/08/2026",
        uploadedBy: "Ngô Thị Hương",
        fileName: "NgoThiHuong_CV.pdf",
        fileSize: "780 KB",
        summary:
          "Chuyên viên mua hàng 3 năm kinh nghiệm, thành thạo SAP MM và đàm phán nhà cung cấp.",
        skills: ["Đàm phán", "Excel", "SAP MM", "Quản lý nhà cung cấp"],
        experience: "3 năm",
        education: "Đại học Kinh tế TP.HCM",
        highlights: [
          "Tiết kiệm 15% chi phí mua hàng",
          "Quản lý 50+ nhà cung cấp",
        ],
      },
    ],
    references: [],
    applicationHistory: [
      {
        id: "app-008-1",
        appliedDate: "25/08/2026",
        position: "Chuyên viên mua hàng",
        department: "Phòng Cung ứng",
        source: "Website",
        status: "screening",
        cvVersionId: "cv-008-v1",
      },
    ],
    progressHistory: [
      {
        id: "prog-008-1",
        date: "26/08/2026",
        fromStatus: "new",
        toStatus: "screening",
        updatedBy: "Phạm Ngọc Hà",
        notes: "Tiếp nhận hồ sơ",
      },
    ],
  },
];

export const candidatePositions = [
  ...new Set(candidates.map((c) => c.position)),
];
export const candidateDepartments = [
  ...new Set(candidates.map((c) => c.department)),
];

export const statusBadgeConfig: Record<
  CandidateStatus,
  { label: string; className: string }
> = {
  new: { label: "Mới", className: "bg-blue-100 text-blue-700" },
  screening: { label: "Sàng lọc", className: "bg-purple-100 text-purple-700" },
  interview: { label: "Phỏng vấn", className: "bg-amber-100 text-amber-700" },
  offer: { label: "Đề nghị", className: "bg-cyan-100 text-cyan-700" },
  hired: { label: "Đã tuyển", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700" },
};

export const priorityBadgeConfig: Record<
  ApplicationPriority,
  { label: string; className: string }
> = {
  high: { label: "Cao", className: "bg-red-100 text-red-700" },
  medium: { label: "Trung bình", className: "bg-amber-100 text-amber-700" },
  low: { label: "Thấp", className: "bg-gray-100 text-gray-600" },
};

// ─── Job Requisition Types ─────────────────────────────────────────────────────
export type RequisitionStatus =
  | "draft"
  | "pending_hr"
  | "jd_generated"
  | "pending_review"
  | "approved"
  | "published"
  | "closed";

export interface JobRequisition {
  id: string;
  requestedBy: string;
  requestedByDept: string;
  requestedDate: string;
  position: string;
  department: string;
  headcount: number;
  reason: string;
  requirements: string;
  preferredStartDate: string;
  budgetRange: string;
  status: RequisitionStatus;
  hrAssignee?: string;
  generatedJD?: GeneratedJD;
  reviewRequestedAt?: string;
  publishedAt?: string;
  publishedTo?: string[];
  applications?: ApplicationHistory[]; // added to link candidates to job requisitions
}

export interface GeneratedJD {
  title: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  benefits: string[];
  workingConditions: string;
  salaryRange: string;
  generatedAt: string;
  generatedBy: string;
}

export const jobRequisitions: JobRequisition[] = [
  {
    id: "req-001",
    requestedBy: "Đỗ Minh Tuấn",
    requestedByDept: "Xây dựng",
    requestedDate: "20/08/2026",
    position: "Kỹ sư kết cấu cấp cao",
    department: "Xây dựng",
    headcount: 2,
    reason: "Mở rộng dự án Landmark 81 Phase 2, cần thêm nhân lực kỹ thuật",
    requirements:
      "Tối thiểu 5 năm kinh nghiệm, thành thạo ETABS và SAP2000, có chứng chỉ PE",
    preferredStartDate: "01/10/2026",
    budgetRange: "25,000,000 - 35,000,000 VND",
    status: "published",
    hrAssignee: "Phạm Ngọc Hà",
    generatedJD: {
      title: "Kỹ sư Kết cấu Cấp cao (Senior Structural Engineer)",
      overview:
        "Chúng tôi đang tìm kiếm Kỹ sư Kết cấu Cấp cao có kinh nghiệm để tham gia vào các dự án xây dựng quy mô lớn. Ứng viên sẽ chịu trách nhiệm thiết kế, phân tích và giám sát các công trình kết cấu phức tạp.",
      responsibilities: [
        "Thiết kế và phân tích kết cấu cho các công trình dân dụng và công nghiệp",
        "Lập và kiểm tra bản vẽ kỹ thuật theo tiêu chuẩn TCVN",
        "Phối hợp với các bộ phận thiết kế, thi công và giám sát",
        "Đảm bảo chất lượng và tiến độ công việc",
        "Hướng dẫn và đào tạo kỹ sư cấp dưới",
      ],
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành Kỹ thuật Xây dựng hoặc tương đương",
        "Tối thiểu 5 năm kinh nghiệm trong lĩnh vực kết cấu",
        "Thành thạo phần mềm ETABS, SAP2000, AutoCAD",
        "Có chứng chỉ hành nghề kỹ sư (PE) là lợi thế",
        "Kỹ năng giao tiếp và làm việc nhóm tốt",
      ],
      preferredQualifications: [
        "Kinh nghiệm với dự án nhà cao tầng trên 20 tầng",
        "Thành thạo Revit Structure và BIM",
        "Có kinh nghiệm làm việc với nhà thầu nước ngoài",
      ],
      benefits: [
        "Mức lương cạnh tranh: 25-35 triệu VND/tháng",
        "Thưởng hiệu suất hàng quý và cuối năm",
        "Bảo hiểm sức khỏe cao cấp cho cá nhân và gia đình",
        "Cơ hội đào tạo và phát triển chuyên môn",
        "Môi trường làm việc chuyên nghiệp, năng động",
      ],
      workingConditions:
        "Làm việc tại văn phòng và công trường. Giờ làm việc: 8:00 - 17:30, Thứ 2 - Thứ 6.",
      salaryRange: "25,000,000 - 35,000,000 VND/tháng",
      generatedAt: "22/08/2026",
      generatedBy: "AI (GPT-4o)",
    },
    publishedAt: "25/08/2026",
    publishedTo: ["Website công ty", "LinkedIn", "TopCV", "JobStreet"],
  },
  {
    id: "req-002",
    requestedBy: "Cao Thị Bích",
    requestedByDept: "Phòng Dự toán",
    requestedDate: "25/08/2026",
    position: "Kỹ sư dự toán",
    department: "Phòng Dự toán",
    headcount: 1,
    reason: "Nhân viên cũ nghỉ việc, cần tuyển thay thế gấp",
    requirements:
      "Tối thiểu 3 năm kinh nghiệm, thành thạo phần mềm dự toán GXD",
    preferredStartDate: "15/09/2026",
    budgetRange: "18,000,000 - 25,000,000 VND",
    status: "pending_review",
    hrAssignee: "Phạm Ngọc Hà",
    generatedJD: {
      title: "Kỹ sư Dự toán (Cost Estimator)",
      overview:
        "Tìm kiếm Kỹ sư Dự toán có kinh nghiệm để tham gia vào bộ phận dự toán, chịu trách nhiệm lập và kiểm tra dự toán cho các dự án xây dựng.",
      responsibilities: [
        "Lập dự toán chi phí xây dựng cho các dự án",
        "Phân tích và đánh giá hồ sơ thầu",
        "Theo dõi và cập nhật biến động giá vật liệu",
        "Phối hợp với bộ phận kỹ thuật và thi công",
      ],
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành Xây dựng hoặc Kinh tế Xây dựng",
        "Tối thiểu 3 năm kinh nghiệm dự toán",
        "Thành thạo phần mềm dự toán GXD, Excel",
        "Hiểu biết về định mức và đơn giá xây dựng",
      ],
      preferredQualifications: [
        "Có chứng chỉ đấu thầu quốc gia",
        "Kinh nghiệm dự án ODA hoặc FDI",
      ],
      benefits: [
        "Lương: 18-25 triệu VND/tháng",
        "Thưởng dự án",
        "Bảo hiểm đầy đủ theo quy định",
      ],
      workingConditions:
        "Làm việc tại văn phòng. Giờ làm việc: 8:00 - 17:30, Thứ 2 - Thứ 6.",
      salaryRange: "18,000,000 - 25,000,000 VND/tháng",
      generatedAt: "27/08/2026",
      generatedBy: "AI (GPT-4o)",
    },
    reviewRequestedAt: "27/08/2026",
  },
  {
    id: "req-003",
    requestedBy: "Nguyễn Thị Mai",
    requestedByDept: "Phòng Kinh doanh",
    requestedDate: "28/08/2026",
    position: "Chuyên viên kinh doanh B2B",
    department: "Phòng Kinh doanh",
    headcount: 2,
    reason: "Mở rộng thị trường miền Bắc, cần thêm nhân sự kinh doanh",
    requirements:
      "Có kinh nghiệm B2B trong ngành xây dựng hoặc vật liệu xây dựng",
    preferredStartDate: "01/10/2026",
    budgetRange: "15,000,000 - 22,000,000 VND",
    status: "jd_generated",
    hrAssignee: "Phạm Ngọc Hà",
    generatedJD: {
      title: "Chuyên viên Kinh doanh B2B (B2B Sales Executive)",
      overview:
        "Tìm kiếm Chuyên viên Kinh doanh B2B năng động để phát triển thị trường và xây dựng mối quan hệ với khách hàng doanh nghiệp trong lĩnh vực xây dựng.",
      responsibilities: [
        "Tìm kiếm và phát triển khách hàng doanh nghiệp mới",
        "Duy trì và phát triển mối quan hệ với khách hàng hiện tại",
        "Đạt và vượt chỉ tiêu doanh số hàng tháng/quý",
        "Báo cáo tình hình thị trường và đối thủ cạnh tranh",
      ],
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành Kinh tế, Kinh doanh hoặc tương đương",
        "Tối thiểu 2 năm kinh nghiệm bán hàng B2B",
        "Ưu tiên có kinh nghiệm ngành xây dựng hoặc vật liệu xây dựng",
        "Kỹ năng giao tiếp và đàm phán tốt",
      ],
      preferredQualifications: [
        "Có mạng lưới khách hàng sẵn có trong ngành",
        "Thành thạo CRM và công cụ bán hàng",
      ],
      benefits: [
        "Lương cơ bản: 15-22 triệu + hoa hồng không giới hạn",
        "Xe công tác và phụ cấp xăng xe",
        "Đào tạo kỹ năng bán hàng chuyên nghiệp",
      ],
      workingConditions: "Làm việc linh hoạt, kết hợp văn phòng và thực địa.",
      salaryRange: "15,000,000 - 22,000,000 VND + hoa hồng",
      generatedAt: "29/08/2026",
      generatedBy: "AI (GPT-4o)",
    },
  },
  {
    id: "req-004",
    requestedBy: "Trần Văn Hùng",
    requestedByDept: "An toàn & QLCL",
    requestedDate: "30/08/2026",
    position: "Chuyên viên an toàn lao động",
    department: "An toàn & QLCL",
    headcount: 1,
    reason: "Bổ sung nhân lực cho dự án mới tại Hà Nội",
    requirements: "Có chứng chỉ ATVSLĐ, kinh nghiệm ngành xây dựng",
    preferredStartDate: "15/10/2026",
    budgetRange: "12,000,000 - 18,000,000 VND",
    status: "pending_hr",
    hrAssignee: "Phạm Ngọc Hà",
  },
];

export const requisitionStatusConfig: Record<
  RequisitionStatus,
  { label: string; className: string }
> = {
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  pending_hr: { label: "Chờ HR xử lý", className: "bg-blue-100 text-blue-700" },
  jd_generated: {
    label: "JD đã tạo",
    className: "bg-purple-100 text-purple-700",
  },
  pending_review: {
    label: "Chờ xác nhận",
    className: "bg-amber-100 text-amber-700",
  },
  approved: { label: "Đã duyệt", className: "bg-cyan-100 text-cyan-700" },
  published: {
    label: "Đã đăng tuyển",
    className: "bg-emerald-100 text-emerald-700",
  },
  closed: { label: "Đã đóng", className: "bg-red-100 text-red-700" },
};

// Helper: get all applications (with candidate info) for a given job post id
export interface CandidateApplication {
  candidate: Candidate;
  application: ApplicationHistory;
}

export function getApplicationsForJobPost(
  jobPostId: string,
): CandidateApplication[] {
  const result: CandidateApplication[] = [];
  for (const candidate of candidates) {
    for (const application of candidate.applicationHistory) {
      if (application.jobPostId === jobPostId) {
        result.push({ candidate, application });
      }
    }
  }
  return result;
}

// Helper: get all job posts a candidate has applied to (with deduplication by jobPostId)
export function getJobPostsForCandidate(
  candidateId: string,
): { jobPostId: string; applications: ApplicationHistory[] }[] {
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) return [];
  const map = new Map<string, ApplicationHistory[]>();
  for (const app of candidate.applicationHistory) {
    if (app.jobPostId) {
      if (!map.has(app.jobPostId)) map.set(app.jobPostId, []);
      map.get(app.jobPostId)!.push(app);
    }
  }
  return Array.from(map.entries()).map(([jobPostId, applications]) => ({
    jobPostId,
    applications,
  }));
}
