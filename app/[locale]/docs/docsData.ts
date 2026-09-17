export interface DocCategory {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  desc: string;
}

export interface DocArticle {
  slug: string;
  title: string;
  categoryId: string;
  excerpt: string;
  content: string; // In a real app, this would be Markdown or HTML
  readTime: string;
  updatedAt: string;
  author: string;
}

export const docCategories: DocCategory[] = [
  { id: "hris", name: "Nhân sự (HRIS)", icon: "Users", colorClass: "text-blue-600 bg-blue-600/10 border-blue-600/20", desc: "Hướng dẫn về nghỉ phép, chấm công, hợp đồng." },
  { id: "ats", name: "Tuyển dụng (ATS)", icon: "Briefcase", colorClass: "text-purple-600 bg-purple-600/10 border-purple-600/20", desc: "Quy trình tạo JD, đánh giá và quản lý ứng viên." },
  { id: "rbac", name: "Phân quyền (RBAC)", icon: "ShieldCheck", colorClass: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20", desc: "Cách cấu hình vai trò và quản lý truy cập." },
  { id: "general", name: "Chung", icon: "BookOpen", colorClass: "text-slate-600 bg-slate-600/10 border-slate-600/20", desc: "Hướng dẫn đăng nhập, bảo mật tài khoản." },
];

export const docArticles: DocArticle[] = [
  {
    slug: "quy-trinh-xin-nghi-phep",
    title: "Quy trình xin nghỉ phép & Phê duyệt",
    categoryId: "hris",
    excerpt: "Hướng dẫn chi tiết các bước tạo đơn xin nghỉ phép trên hệ thống và quy trình phê duyệt dành cho Quản lý.",
    readTime: "4 phút",
    updatedAt: "10/09/2026",
    author: "HR Dept",
    content: `
      <h2>1. Giới thiệu</h2>
      <p>Hệ thống ConstructERP cung cấp quy trình tự động hóa cho việc xin và phê duyệt nghỉ phép. Nhân viên có thể theo dõi số ngày phép còn lại theo thời gian thực.</p>
      
      <h2>2. Dành cho Nhân viên: Cách tạo đơn xin nghỉ</h2>
      <ul>
        <li><strong>Bước 1:</strong> Truy cập vào module <em>Nhân sự &gt; Nghỉ phép của tôi</em>.</li>
        <li><strong>Bước 2:</strong> Nhấn nút <strong>+ Tạo đơn mới</strong> ở góc phải màn hình.</li>
        <li><strong>Bước 3:</strong> Chọn loại nghỉ phép (Nghỉ ốm, Nghỉ phép năm, Nghỉ không lương). Hệ thống sẽ tự động hiển thị số ngày còn lại.</li>
        <li><strong>Bước 4:</strong> Chọn thời gian bắt đầu và kết thúc. Điền lý do nghỉ.</li>
        <li><strong>Bước 5:</strong> Nhấn <strong>Gửi yêu cầu</strong>. Hệ thống sẽ gửi thông báo đến Quản lý trực tiếp của bạn.</li>
      </ul>

      <h2>3. Dành cho Quản lý: Cách phê duyệt</h2>
      <p>Khi có nhân viên nộp đơn, bạn sẽ nhận được thông báo qua chuông báo trên hệ thống và email nội bộ.</p>
      <ul>
        <li>Truy cập <em>Dashboard &gt; Việc cần xử lý</em>.</li>
        <li>Nhấn vào đơn xin nghỉ của nhân viên để xem chi tiết.</li>
        <li>Chọn <strong>Phê duyệt</strong> hoặc <strong>Từ chối</strong> (Cần nhập lý do nếu từ chối).</li>
      </ul>
      <p><em>Lưu ý: Các đơn được phê duyệt sẽ tự động đồng bộ vào bảng công cuối tháng.</em></p>
    `
  },
  {
    slug: "huong-dan-tao-jd",
    title: "Hướng dẫn tạo yêu cầu tuyển dụng (JD)",
    categoryId: "ats",
    excerpt: "Sử dụng tính năng AI để tự động tạo Mô tả công việc (JD) chuẩn hóa chỉ trong vài giây.",
    readTime: "6 phút",
    updatedAt: "12/09/2026",
    author: "Tuyển dụng",
    content: `
      <h2>1. Tổng quan về AI JD Generator</h2>
      <p>Thay vì phải viết JD thủ công, ConstructERP tích hợp công cụ AI cho phép tạo JD chuẩn hóa dựa trên các từ khóa và yêu cầu cơ bản.</p>

      <h2>2. Các bước thực hiện</h2>
      <ul>
        <li><strong>Bước 1:</strong> Truy cập <em>Tuyển dụng &gt; Yêu cầu tuyển dụng</em>.</li>
        <li><strong>Bước 2:</strong> Tạo một yêu cầu mới, nhập tên Vị trí và Phòng ban.</li>
        <li><strong>Bước 3:</strong> Ở mục "Mô tả công việc", nhấn vào biểu tượng <strong>✨ AI Gen JD</strong>.</li>
        <li><strong>Bước 4:</strong> Cung cấp một vài gạch đầu dòng về yêu cầu (VD: "3 năm kinh nghiệm React, biết tiếng Anh").</li>
        <li><strong>Bước 5:</strong> Nhấn <strong>Tạo</strong>. Hệ thống sẽ trả về một JD hoàn chỉnh bao gồm: Trách nhiệm, Yêu cầu, và Phúc lợi.</li>
      </ul>

      <h2>3. Chỉnh sửa và Đăng tuyển</h2>
      <p>Sau khi AI tạo xong, bạn hoàn toàn có thể chỉnh sửa lại nội dung trước khi lưu. Khi đã hoàn thiện, nhấn <strong>Yêu cầu xác nhận</strong> để gửi cho Trưởng bộ phận duyệt trước khi đăng tuyển công khai.</p>
    `
  },
  {
    slug: "thiet-lap-rbac",
    title: "Cách thiết lập ma trận phân quyền (RBAC)",
    categoryId: "rbac",
    excerpt: "Tài liệu kỹ thuật hướng dẫn Admin cách cấu hình vai trò và gán quyền cho người dùng.",
    readTime: "10 phút",
    updatedAt: "01/09/2026",
    author: "IT Admin",
    content: `
      <h2>1. Khái niệm RBAC trong ConstructERP</h2>
      <p>Hệ thống sử dụng cơ chế Role-Based Access Control (RBAC). Thay vì cấp quyền trực tiếp cho từng người, bạn sẽ tạo các <strong>Vai trò (Roles)</strong>, gán quyền cho Vai trò đó, và sau đó thêm người dùng vào Vai trò.</p>

      <h2>2. Quản lý Vai trò</h2>
      <p>Chỉ tài khoản có quyền <code>role:manage</code> mới có thể truy cập khu vực này.</p>
      <ul>
        <li>Truy cập <em>Hệ thống &gt; Phân quyền</em>.</li>
        <li>Cột bên trái hiển thị danh sách các vai trò. Có 2 loại: <strong>Mặc định</strong> (Không thể xóa) và <strong>Tùy chỉnh</strong> (Do bạn tự tạo).</li>
        <li>Để tạo mới, nhấn <strong>+ Thêm mới vai trò</strong>.</li>
      </ul>

      <h2>3. Ma trận phân quyền</h2>
      <p>Khi chọn một vai trò, cột ở giữa sẽ hiển thị Ma trận quyền hạn.</p>
      <p>Các quyền được nhóm theo từng module (VD: Quản lý Nhân sự, Quản lý Tuyển dụng). Bạn có thể check vào ô vuông để bật/tắt quyền. Đừng quên nhấn <strong>Lưu thay đổi</strong> ở góc phải bên dưới màn hình.</p>

      <h2>4. Gán người dùng</h2>
      <p>Chuyển sang tab <strong>Người dùng</strong> ở cột bên phải. Nhấn <strong>Thêm</strong> và tìm kiếm tên nhân viên để gán họ vào vai trò hiện tại.</p>
    `
  }
];