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
  { id: "onboarding", name: "Onboarding", icon: "BookOpen", colorClass: "text-slate-600 bg-slate-600/10 border-slate-600/20", desc: "Đăng ký, xác thực email và liên kết hồ sơ nhân viên." },
  { id: "rbac", name: "Phân quyền (RBAC + ABAC)", icon: "ShieldCheck", colorClass: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20", desc: "Vai trò, quyền theo hành động và phạm vi dữ liệu." },
  { id: "hris", name: "Nhân sự (HRIS)", icon: "Users", colorClass: "text-blue-600 bg-blue-600/10 border-blue-600/20", desc: "Quản lý nhân viên, hồ sơ và dữ liệu bảo mật." },
  { id: "ats", name: "Tuyển dụng (ATS)", icon: "Briefcase", colorClass: "text-purple-600 bg-purple-600/10 border-purple-600/20", desc: "Quy trình yêu cầu tuyển dụng, JD, đăng tin và ứng viên." },
];

export const docArticles: DocArticle[] = [
  // ==========================================
  // 1. BẮT ĐẦU
  // ==========================================
  {
    slug: "dang-ky-xac-thuc-va-lien-ket-ho-so",
    title: "Người dùng mới: Đăng ký, xác thực email & liên kết hồ sơ",
    categoryId: "onboarding",
    excerpt: "Ba bước để có tài khoản làm việc đầy đủ: tạo tài khoản, xác thực qua email, và liên kết tài khoản với hồ sơ nhân viên bằng mã nhân viên.",
    readTime: "6 phút",
    updatedAt: "18/09/2026",
    author: "IT Admin",
    content: `
      <h2>1. Tổng quan quy trình</h2>
      <p>Một tài khoản mới đi qua ba bước trước khi sử dụng được các phân hệ nghiệp vụ. Bỏ qua bất kỳ bước nào thì tài khoản vẫn đăng nhập được, nhưng chỉ ở mức khách (<code>GUEST</code>) và không thấy module nào trên thanh điều hướng.</p>
      <ul>
        <li><strong>Bước 1 — Đăng ký:</strong> tự tạo tài khoản bằng email công việc.</li>
        <li><strong>Bước 2 — Xác thực email:</strong> mở liên kết trong hộp thư để kích hoạt tài khoản.</li>
        <li><strong>Bước 3 — Liên kết hồ sơ:</strong> gửi mã nhân viên để nhận đúng vai trò và quyền hạn.</li>
      </ul>

      <h2>2. Bước 1: Đăng ký tài khoản</h2>
      <ul>
        <li>Truy cập trang <strong>Đăng ký</strong> (<code>/register</code>) từ liên kết <em>"Đăng ký"</em> ở trang Đăng nhập.</li>
        <li>Điền <strong>Họ và tên</strong> (tối thiểu 2 ký tự), <strong>Email</strong>, <strong>Mật khẩu</strong> (tối thiểu 6 ký tự) và <strong>Xác nhận mật khẩu</strong>.</li>
        <li>Tích chọn đồng ý <em>Điều khoản dịch vụ</em> và <em>Chính sách bảo mật</em> — hệ thống không cho gửi form nếu chưa tích.</li>
        <li>Nhấn <strong>ĐĂNG KÝ TÀI KHOẢN</strong>. Khi thành công, hệ thống hiển thị thông báo và tự chuyển về trang Đăng nhập.</li>
      </ul>
      <p><em>Lưu ý: tại thời điểm này tài khoản đã tồn tại nhưng <strong>chưa được xác thực</strong> và chưa có vai trò nghiệp vụ.</em></p>
      <p>Trang Đăng nhập cũng hỗ trợ <strong>đăng nhập bằng Google</strong> và liên kết <em>Quên mật khẩu</em> nếu bạn cần đặt lại mật khẩu.</p>

      <h2>3. Bước 2: Xác thực qua email</h2>
      <p>Hệ thống gửi liên kết xác thực ngay khi bạn đăng nhập lần đầu bằng tài khoản chưa xác thực.</p>
      <ul>
        <li><strong>Bước 1:</strong> Đăng nhập tại <code>/login</code> bằng email và mật khẩu vừa tạo.</li>
        <li><strong>Bước 2:</strong> Vì tài khoản chưa xác thực, hệ thống tự chuyển bạn sang màn hình <strong>"Kiểm tra hộp thư"</strong> và <strong>gửi liên kết xác thực ngay lập tức</strong> tới email của bạn.</li>
        <li><strong>Bước 3:</strong> Mở email (kiểm tra cả thư mục <em>Spam</em>) và nhấn vào liên kết xác thực.</li>
        <li><strong>Bước 4:</strong> Trang <em>"Đang xác thực..."</em> xử lý liên kết. Khi thành công, bạn thấy <strong>"Xác thực thành công!"</strong>, hệ thống tự đăng nhập cho bạn và chuyển vào Dashboard sau 5 giây (có thể nhấn <em>"Chuyển hướng ngay"</em>).</li>
      </ul>
      <p><strong>Chưa nhận được email?</strong> Ở màn hình "Kiểm tra hộp thư", nhấn <strong>GỬI LẠI EMAIL XÁC THỰC</strong>. Nút này có thời gian chờ 60 giây giữa hai lần gửi (hiển thị <em>"GỬI LẠI SAU 60S"</em>).</p>
      <p><strong>Liên kết hết hạn?</strong> Trang xác thực báo <em>"Xác thực thất bại"</em>. Hãy quay lại đăng nhập — hệ thống sẽ đưa bạn về màn hình "Kiểm tra hộp thư" và phát liên kết mới.</p>

      <h2>4. Bước 3: Liên kết hồ sơ bằng mã nhân viên</h2>
      <p>Sau khi xác thực, tài khoản vẫn ở vai trò <code>GUEST</code>. Để nhận quyền theo đúng vị trí công tác, bạn cần liên kết tài khoản với hồ sơ nhân viên do bộ phận Nhân sự quản lý.</p>
      <ul>
        <li><strong>Bước 1:</strong> Mở trang <strong>Liên kết hồ sơ</strong> (<code>/claim-profile</code>). Bạn cũng có thể vào từ menu ảnh đại diện ở góc trên phải &gt; <em>Yêu cầu cấp quyền</em>, hoặc từ <em>Hồ sơ cá nhân &gt; Quyền hạn truy cập</em>.</li>
        <li><strong>Bước 2:</strong> Nhập <strong>mã nhân viên</strong> vào hai ô: <em>Mã phòng ban</em> (VD: <code>IT</code>) và <em>Mã số</em> (VD: <code>1024</code>).</li>
        <li><strong>Bước 3:</strong> Nhấn <strong>GỬI YÊU CẦU LIÊN KẾT</strong>. Hệ thống hiển thị <em>"Gửi yêu cầu thành công!"</em> và tự chuyển về Dashboard sau 5 giây.</li>
      </ul>
      <p><strong>Mẹo nhập nhanh:</strong> bạn có thể dán hoặc gõ nguyên mã đầy đủ vào ô đầu tiên — hệ thống tự tách thành mã phòng ban và mã số. Dấu phân tách hỗ trợ <code>-</code>, <code>_</code>, <code>.</code> và khoảng trắng; mã phòng ban có dấu gạch vẫn được nhận đúng (VD: <code>HC-NS-1024</code> → <code>HC-NS</code> + <code>1024</code>, <code>CN-FQ.2603</code> → <code>CN-FQ</code> + <code>2603</code>).</p>
      <p><strong>Chưa có mã nhân viên?</strong> Nhấn <em>"Bỏ qua bước này"</em> để vào hệ thống ở chế độ khách, và liên hệ Nhân sự để được cấp mã. Bạn có thể quay lại trang này bất cứ lúc nào.</p>

      <h2>5. Điều gì xảy ra sau khi bạn gửi yêu cầu</h2>
      <ul>
        <li>Yêu cầu của bạn xuất hiện tại <em>Hệ thống IT &gt; Quản lý Yêu cầu truy cập</em> (màn hình <strong>"Kiểm duyệt Yêu cầu nhận hồ sơ"</strong>), và người phụ trách nhận được thông báo ngay.</li>
        <li>Người kiểm duyệt đối chiếu thông tin bạn khai với dữ liệu gốc trong hệ thống, sau đó chọn <strong>Phê duyệt</strong> hoặc <strong>Từ chối</strong>.</li>
        <li>Khi được phê duyệt, tài khoản của bạn được liên kết với hồ sơ nhân viên và <strong>kế thừa vai trò cùng toàn bộ quyền hạn</strong> của hồ sơ đó.</li>
      </ul>
      <p><em>Sau khi được phê duyệt, hãy tải lại trang (hoặc đăng xuất rồi đăng nhập lại) để hệ thống nạp quyền mới. Các module bạn được phép truy cập sẽ xuất hiện trên thanh điều hướng bên trái.</em></p>

      <h2>6. Xử lý sự cố thường gặp</h2>
      <ul>
        <li><strong>Đăng nhập báo tài khoản bị khóa:</strong> tài khoản đang ở trạng thái ngừng hoạt động — liên hệ IT Admin.</li>
        <li><strong>Gửi yêu cầu liên kết bị lỗi:</strong> mã nhân viên không tồn tại hoặc đã được tài khoản khác liên kết. Kiểm tra lại mã với Nhân sự.</li>
        <li><strong>Đã được phê duyệt nhưng menu vẫn trống:</strong> đăng xuất và đăng nhập lại để làm mới phiên và danh sách quyền.</li>
      </ul>
    `
  },

  // ==========================================
  // 2. PHÂN QUYỀN (RBAC + ABAC)
  // ==========================================
  {
    slug: "phan-quyen-rbac-abac",
    title: "Phân quyền hệ thống: RBAC kết hợp ABAC",
    categoryId: "rbac",
    excerpt: "Cách hệ thống kết hợp vai trò (RBAC) với phạm vi dữ liệu theo thuộc tính (ABAC), và cách cấu hình ma trận quyền, quyền mở rộng cho từng người dùng.",
    readTime: "9 phút",
    updatedAt: "18/09/2026",
    author: "IT Admin",
    content: `
      <h2>1. Hai lớp kiểm soát truy cập</h2>
      <p>Hệ thống không chỉ hỏi <em>"bạn được làm gì?"</em> mà còn hỏi <em>"bạn được làm điều đó trên dữ liệu của ai?"</em>.</p>
      <ul>
        <li><strong>RBAC (theo vai trò):</strong> quyền không gán trực tiếp cho người. Bạn gán quyền cho <strong>Vai trò</strong>, rồi gán người dùng vào Vai trò đó.</li>
        <li><strong>ABAC (theo thuộc tính):</strong> mỗi quyền còn mang một <strong>phạm vi dữ liệu</strong> dựa trên thuộc tính của bản ghi so với người thao tác — của chính mình, của phòng ban mình, hay của toàn hệ thống.</li>
      </ul>

      <h2>2. Cấu trúc một quyền</h2>
      <p>Mỗi quyền là một chuỗi ba phần: <code>phân_hệ:hành_động:phạm_vi</code>. Ví dụ <code>ats_job_post:create:any</code> hoặc <code>ats_requisition:approve:dept</code>.</p>
      <p><strong>Hành động (action)</strong> hiện có trong hệ thống:</p>
      <ul>
        <li><code>read</code> — Xem (Read)</li>
        <li><code>create</code> — Tạo (Create)</li>
        <li><code>update</code> — Sửa (Update)</li>
        <li><code>delete</code> — Xóa (Delete)</li>
        <li><code>manage</code> — Quản lý (Manage)</li>
        <li><code>approve</code> — Duyệt (Approve)</li>
        <li><code>audit</code> — Kiểm toán (Audit)</li>
        <li><code>process</code> — Xử lý (Process)</li>
      </ul>
      <p><strong>Phạm vi (scope)</strong> — đây chính là lớp ABAC:</p>
      <ul>
        <li><code>own</code> — <strong>Cá nhân (Own):</strong> chỉ tác động lên bản ghi do chính mình tạo hoặc thuộc về mình.</li>
        <li><code>dept</code> — <strong>Phòng ban (Dept):</strong> tác động lên bản ghi thuộc phòng ban của mình.</li>
        <li><code>any</code> — <strong>Tất cả (Any):</strong> không giới hạn phạm vi.</li>
      </ul>
      <p><em>Cùng một hành động, khác phạm vi là hai quyền khác nhau. Trưởng bộ phận thường có <code>...:approve:dept</code>, trong khi Ban Giám đốc hoặc HR tổng hợp có <code>...:approve:any</code>.</em></p>

      <h2>3. Cách hệ thống đối chiếu quyền</h2>
      <p>Khi một thao tác yêu cầu quyền <code>R:A:S</code>, hệ thống duyệt danh sách quyền của người dùng và chấp nhận nếu tìm được một quyền thỏa cả ba điều kiện:</p>
      <ul>
        <li><strong>Phân hệ</strong> khớp, hoặc quyền của người dùng dùng ký tự đại diện <code>*</code>.</li>
        <li><strong>Hành động</strong> khớp, hoặc là <code>*</code>.</li>
        <li><strong>Phạm vi</strong> của người dùng là <code>any</code>, hoặc bằng đúng phạm vi được yêu cầu. Nói cách khác, <code>any</code> bao trùm <code>dept</code> và <code>own</code>.</li>
      </ul>
      <p>Quyền <code>*:*:any</code> là quyền tối cao — vượt qua mọi kiểm tra. Vai trò <code>SUPER_ADMIN</code> cũng được bỏ qua kiểm tra quyền.</p>

      <h2>4. Nơi phân quyền phát huy tác dụng trên giao diện</h2>
      <ul>
        <li><strong>Thanh điều hướng:</strong> chỉ hiển thị những module mà bạn có ít nhất một quyền trên phân hệ tương ứng. Tài khoản <code>GUEST</code> vì vậy thấy menu gần như trống.</li>
        <li><strong>Nút thao tác:</strong> các nút nghiệp vụ được gắn danh sách quyền cho phép. Nếu không đủ quyền, nút sẽ bị <strong>ẩn</strong> hoặc <strong>vô hiệu hóa</strong> tùy cấu hình của từng nút.</li>
        <li><strong>Trang:</strong> một số trang được bọc bởi lớp kiểm tra quyền và sẽ chuyển hướng sang trang <em>Không có quyền truy cập</em>.</li>
      </ul>
      <p><em>Quyền được nạp cùng phiên đăng nhập. Sau khi thay đổi phân quyền, người dùng cần tải lại trang hoặc đăng nhập lại để nhận quyền mới.</em></p>

      <h2>5. Quản lý Vai trò và Ma trận phân quyền</h2>
      <p>Truy cập <em>Hệ thống IT &gt; Phân quyền (Roles)</em> — màn hình <strong>"Quản lý Vai trò hệ thống"</strong>.</p>
      <ul>
        <li>Danh sách vai trò hiển thị số <strong>người dùng</strong> và số <strong>quyền</strong> của từng vai trò, cùng trạng thái hoạt động. Vai trò <strong>Mặc định</strong> là vai trò hệ thống; vai trò <strong>Tùy chỉnh</strong> do tổ chức tự tạo.</li>
        <li>Chọn một vai trò để mở <strong>Ma trận phân quyền</strong> ở cột giữa. Quyền được nhóm theo từng phân hệ, mỗi nhóm cho biết <em>"N quyền / N đã chọn"</em>.</li>
        <li>Ma trận ở chế độ <strong>chỉ xem</strong> cho đến khi bạn bật chỉnh sửa. Khi đã bật: tích từng quyền, hoặc dùng ô tích ở đầu nhóm để bật/tắt toàn bộ quyền của phân hệ đó.</li>
        <li>Mỗi dòng quyền hiển thị tên và <strong>slug</strong> đầy đủ (VD: <code>ats_job_post:update:dept</code>) — hãy đọc slug để biết chính xác phạm vi bạn đang cấp.</li>
        <li>Nhấn <strong>Lưu thay đổi</strong> ở cuối màn hình để áp dụng.</li>
        <li>Tab <strong>Người dùng được gán</strong> ở cột phải cho phép tìm kiếm và bỏ gán người dùng khỏi vai trò hiện tại.</li>
      </ul>
      <p><em>Lưu ý: chức năng <strong>tạo vai trò mới</strong> và <strong>nhân bản vai trò</strong> đang trong quá trình phát triển. Hiện tại bạn chỉnh sửa quyền trên các vai trò có sẵn.</em></p>

      <h2>6. Quyền mở rộng cho từng người dùng</h2>
      <p>Truy cập <em>Hệ thống IT &gt; Quyền truy cập của người dùng</em>. Với mỗi nhân sự, bạn thiết lập:</p>
      <ul>
        <li><strong>Vai trò Chính (Primary Role)</strong> — nền tảng quyền của người đó.</li>
        <li><strong>Quyền Mở Rộng</strong> — các quyền cấp thêm ngoài vai trò, dùng cho trường hợp ngoại lệ (VD: một chuyên viên được duyệt thay trong thời gian trưởng bộ phận đi công tác).</li>
      </ul>
      <p>Những quyền đã có sẵn từ vai trò chính sẽ được đánh dấu để bạn không cấp trùng. Cột <em>"+ N mở rộng"</em> trong danh sách giúp nhận ra ngay ai đang được cấp quyền ngoại lệ.</p>

      <h2>7. Quản lý Tài nguyên và sinh quyền</h2>
      <p>Truy cập <em>Hệ thống IT &gt; Tài nguyên (Resources)</em> để khai báo các phân hệ được bảo vệ.</p>
      <ul>
        <li>Khi tạo một phân hệ mới, bạn chọn tập <strong>hành động</strong> và tập <strong>phạm vi</strong> cần dùng; hệ thống tự sinh toàn bộ tổ hợp quyền tương ứng.</li>
        <li>Mỗi phân hệ và mỗi quyền có công tắc <strong>trạng thái hoạt động</strong> — tắt phân hệ sẽ vô hiệu hóa nhóm quyền đó mà không cần xóa.</li>
      </ul>

      <h2>8. Truy vết</h2>
      <p>Mọi thay đổi phân quyền và các thao tác trên dữ liệu bảo mật đều được ghi lại. Xem tại <em>Nhật ký hệ thống &gt; Truy vết bảo mật</em>.</p>
    `
  },

  // ==========================================
  // 3. NHÂN SỰ (HRIS)
  // ==========================================
  {
    slug: "quan-ly-nhan-su-hris",
    title: "Quản lý nhân viên & hồ sơ nhân sự (HRIS)",
    categoryId: "hris",
    excerpt: "Tra cứu danh sách nhân viên, xem hồ sơ theo mã nhân viên, và quy tắc mở khóa dữ liệu định danh / tài chính được che mờ.",
    readTime: "7 phút",
    updatedAt: "18/09/2026",
    author: "HR Dept",
    content: `
      <h2>1. Hai màn hình chính</h2>
      <p>Phân hệ Nhân sự tách dữ liệu thành hai lớp, truy cập từ <em>Hành chính Nhân sự</em> trên thanh điều hướng:</p>
      <ul>
        <li><strong>Quản lý nhân viên</strong> — danh sách <em>tài khoản</em> đang hoạt động trong hệ thống, kèm vai trò và quyền truy cập.</li>
        <li><strong>Quản lý hồ sơ</strong> — danh sách <em>hồ sơ nhân sự</em>, định danh bằng <strong>mã nhân viên</strong>. Đây là nguồn dữ liệu mà người dùng mới liên kết tới khi gửi yêu cầu cấp quyền.</li>
      </ul>
      <p><em>Mã nhân viên là cầu nối giữa hai lớp: một tài khoản chỉ nhận được vai trò nghiệp vụ sau khi yêu cầu liên kết hồ sơ của họ được phê duyệt.</em></p>

      <h2>2. Tra cứu và lọc danh sách</h2>
      <ul>
        <li>Ô tìm kiếm hoạt động trên tên, email và mã nhân viên.</li>
        <li>Bộ lọc gồm <strong>Phòng ban</strong>, <strong>Trạng thái</strong> và <strong>Hợp đồng</strong>; có thể kết hợp nhiều bộ lọc và xóa nhanh toàn bộ.</li>
        <li>Điều kiện lọc, trang và số dòng được ghi vào địa chỉ URL — bạn có thể lưu hoặc chia sẻ đúng khung dữ liệu đang xem.</li>
        <li>Nhấn <strong>Xem nhanh</strong> để mở bảng chi tiết bên cạnh, hoặc <strong>Xem trang chi tiết</strong> để mở toàn trang.</li>
        <li>Nút <strong>Làm mới</strong> tải lại dữ liệu mới nhất từ máy chủ.</li>
      </ul>

      <h2>3. Dữ liệu bảo mật và cơ chế mở khóa</h2>
      <p>Hồ sơ nhân sự chứa hai nhóm dữ liệu không hiển thị mặc định — chúng được <strong>che mờ</strong> ngay cả với người có quyền xem hồ sơ:</p>
      <ul>
        <li><strong>Dữ liệu định danh:</strong> thông tin căn cước công dân — số CCCD, ngày sinh, nguyên quán, nơi thường trú, ngày cấp / hết hạn, nơi cấp.</li>
        <li><strong>Dữ liệu tài chính:</strong> mã số thuế, số sổ bảo hiểm xã hội và các thông tin liên quan.</li>
      </ul>
      <p><strong>Cách mở khóa:</strong></p>
      <ul>
        <li><strong>Bước 1:</strong> Mở hồ sơ cần xem, nhấn vào vùng dữ liệu đang bị che.</li>
        <li><strong>Bước 2:</strong> Hộp thoại <strong>"Xác thực bảo mật"</strong> yêu cầu bạn nhập lại <strong>mật khẩu của chính mình</strong> — không phải mật khẩu của nhân viên được xem.</li>
        <li><strong>Bước 3:</strong> Xác nhận. Hệ thống trả về dữ liệu đầy đủ cho nhóm bạn vừa yêu cầu và hiển thị thông báo <em>"Mở khóa dữ liệu thành công"</em>.</li>
      </ul>
      <p><em>Việc mở khóa chỉ có hiệu lực trong phiên xem hiện tại: khi bạn đóng hồ sơ hoặc chuyển sang hồ sơ khác, dữ liệu được che lại. Mỗi lần mở khóa đều được ghi vào nhật ký hệ thống và có thể truy vết tại <strong>Nhật ký hệ thống &gt; Truy vết bảo mật</strong>.</em></p>

      <h2>4. Kiểm duyệt yêu cầu liên kết hồ sơ</h2>
      <p>Khi một tài khoản mới gửi mã nhân viên, yêu cầu đó về hàng đợi tại <em>Hệ thống IT &gt; Quản lý Yêu cầu truy cập</em> — màn hình <strong>"Kiểm duyệt Yêu cầu nhận hồ sơ"</strong>. Người kiểm duyệt nhận được thông báo ngay khi có yêu cầu mới.</p>
      <ul>
        <li>Danh sách hiển thị trạng thái từng yêu cầu: <strong>Chờ duyệt</strong>, <strong>Đã phê duyệt</strong>, <strong>Đã từ chối</strong>; tài khoản chưa gắn hồ sơ được đánh dấu <em>"Chưa liên kết hồ sơ"</em>.</li>
        <li>Mở một yêu cầu để xem song song: thông tin người gửi, mã hồ sơ họ khai, khối <strong>"Đối chiếu Dữ liệu gốc (Hệ thống)"</strong>, bằng chứng đính kèm và lịch sử yêu cầu trước đó của tài khoản.</li>
        <li><strong>Phê duyệt</strong> — tài khoản được liên kết và <em>kế thừa mọi dữ liệu cùng vai trò của hồ sơ hệ thống</em>. Hãy đối chiếu kỹ trước khi xác nhận.</li>
        <li><strong>Từ chối</strong> — yêu cầu bị đóng, tài khoản vẫn ở mức khách và có thể gửi lại yêu cầu khác.</li>
      </ul>
      <p>Bạn có thể từ chối trực tiếp từ danh sách, hoặc mở chi tiết để phê duyệt sau khi đã đối chiếu.</p>

      <h2>5. Giới hạn hiện tại</h2>
      <p>Để tránh thao tác sai, đây là những phần chưa mở trong phân hệ HRIS:</p>
      <ul>
        <li><strong>Thêm nhân viên</strong> trực tiếp từ giao diện đang phát triển. Hiện tại, tài khoản hình thành qua luồng tự đăng ký và liên kết hồ sơ.</li>
        <li><strong>Chấm công &amp; Lương</strong> và <strong>Duyệt nghỉ phép</strong> chưa được mở; các mục này hiện dẫn tới trang thông báo đang phát triển.</li>
      </ul>
      <p><em>Thay đổi vai trò và quyền của một nhân sự được thực hiện ở phân hệ Phân quyền, không phải ở màn hình hồ sơ.</em></p>
    `
  },

  // ==========================================
  // 4. TUYỂN DỤNG (ATS)
  // ==========================================
  {
    slug: "tuyen-dung-danh-cho-truong-bo-phan",
    title: "Tuyển dụng — Dành cho Trưởng bộ phận: Gửi yêu cầu & duyệt JD",
    categoryId: "ats",
    excerpt: "Hai việc của Trưởng bộ phận trong quy trình tuyển dụng: gửi yêu cầu tuyển dụng tới HR và thẩm định bản thảo JD do HR soạn.",
    readTime: "6 phút",
    updatedAt: "18/09/2026",
    author: "Tuyển dụng",
    content: `
      <h2>1. Vai trò của bạn trong quy trình</h2>
      <p>Quy trình tuyển dụng chạy qua bốn trạng thái. Trưởng bộ phận mở đầu và chốt duyệt; HR làm phần soạn thảo và đăng tin ở giữa.</p>
      <ul>
        <li><strong>HR tiếp nhận</strong> — bạn gửi yêu cầu, HR nhận.</li>
        <li><strong>Đã soạn thảo</strong> — HR chuẩn hóa yêu cầu thô thành JD.</li>
        <li><strong>Chờ duyệt JD</strong> — <em>đến lượt bạn thẩm định.</em></li>
        <li><strong>Sẵn sàng đăng</strong> — bạn đã duyệt, HR kích hoạt đăng tin.</li>
      </ul>
      <p><em>Bạn không chỉnh sửa nội dung JD. Việc của bạn là nêu đúng nhu cầu ở đầu vào và thẩm định bản thảo ở đầu ra.</em></p>

      <h2>2. Gửi yêu cầu tuyển dụng</h2>
      <ul>
        <li><strong>Bước 1:</strong> Truy cập <em>Tuyển dụng &gt; Quản lý yêu cầu tuyển dụng</em>.</li>
        <li><strong>Bước 2:</strong> Nhấn nút tạo mới để mở hộp thoại <strong>"Gửi Yêu cầu Tuyển dụng"</strong> — mô tả rõ <em>"Dành cho Trưởng bộ phận (Gửi yêu cầu thô tới HR)"</em>.</li>
        <li><strong>Bước 3:</strong> Chọn <strong>Phòng ban đề xuất</strong> (bắt buộc) — có thể tìm theo tên hoặc mã phòng ban.</li>
        <li><strong>Bước 4:</strong> Nhập <strong>Mô tả yêu cầu tuyển dụng</strong> (bắt buộc). Đây là ghi chú thô, viết tự do. Ví dụ: <em>"Cần tuyển gấp 2 Kỹ sư MEP hiện trường dự án Đồng Nai. Ưu tiên có kinh nghiệm shop drawing và giám sát thi công thực tế."</em></li>
        <li><strong>Bước 5:</strong> Nhấn <strong>Gửi tới HR</strong>. Yêu cầu chuyển sang trạng thái <strong>HR tiếp nhận</strong>.</li>
      </ul>
      <p><em>Không cần viết JD hoàn chỉnh. HR sẽ tiếp nhận, dùng AI hỗ trợ chuẩn hóa thành JD đầy đủ và gửi lại cho bạn duyệt. Càng nêu rõ số lượng, cấp độ, dự án và kinh nghiệm bắt buộc thì bản thảo về càng sát nhu cầu.</em></p>
      <p>Trong lúc chờ, mở chi tiết yêu cầu sẽ thấy trạng thái <strong>"Đang chờ Nhân sự (HR) soạn thảo JD"</strong>. Cột <em>Quy trình luân chuyển</em> ở chi tiết yêu cầu luôn cho biết bước hiện tại.</p>

      <h2>3. Thẩm định và phê duyệt bản thảo JD</h2>
      <p>Khi HR gửi duyệt, bạn nhận được thông báo dạng <em>"Yêu cầu xét duyệt JD: [mã tin] - tên vị trí"</em> và yêu cầu chuyển sang trạng thái <strong>Chờ duyệt JD</strong>.</p>
      <ul>
        <li><strong>Bước 1:</strong> Mở yêu cầu tương ứng. Chi tiết hiển thị nhãn <strong>"Chờ bạn thẩm định &amp; duyệt"</strong>.</li>
        <li><strong>Bước 2:</strong> Đọc toàn bộ bản thảo. Dùng <strong>Xem trước</strong> để xem tin ở dạng ứng viên sẽ thấy, hoặc <strong>Copy Markdown</strong> để lấy nội dung ra ngoài đối chiếu, chia sẻ.</li>
        <li><strong>Bước 3a — Đồng ý:</strong> nhấn <strong>Phê duyệt JD</strong>. Yêu cầu chuyển sang <strong>Sẵn sàng đăng</strong> và HR có thể đăng tuyển.</li>
        <li><strong>Bước 3b — Cần sửa:</strong> nhấn <strong>Từ chối</strong> và <strong>nhập lý do</strong> (bắt buộc). Lý do của bạn được gửi kèm về HR để họ điều chỉnh, yêu cầu chuyển sang trạng thái <strong>Bị từ chối</strong>.</li>
      </ul>
      <p><em>Hãy viết lý do từ chối theo hướng chỉ rõ điều cần sửa — đó là thông tin duy nhất HR nhận được để làm lại bản thảo.</em></p>

      <h2>4. Hủy yêu cầu</h2>
      <p>Nếu nhu cầu tuyển dụng không còn, mở chi tiết yêu cầu và nhấn <strong>Hủy yêu cầu</strong>. Hệ thống yêu cầu xác nhận vì <strong>toàn bộ quy trình sẽ dừng lại</strong>. Không thể hủy yêu cầu đã <em>Hoàn thành</em> hoặc <em>Đã hủy</em> trước đó.</p>

      <h2>5. Quyền cần có</h2>
      <ul>
        <li><code>ats_requisition:approve</code> hoặc <code>ats_job_post:approve</code> — để phê duyệt / từ chối bản thảo JD.</li>
        <li><code>ats_requisition:update</code> hoặc <code>ats_requisition:delete</code> — để hủy yêu cầu.</li>
      </ul>
      <p>Phạm vi của quyền quyết định bạn duyệt được yêu cầu của phòng ban mình (<code>dept</code>) hay của toàn công ty (<code>any</code>). Nếu nút phê duyệt không xuất hiện, tài khoản của bạn chưa có quyền duyệt — xem thêm bài <em>Phân quyền hệ thống: RBAC kết hợp ABAC</em>.</p>
    `
  },
  {
    slug: "tuyen-dung-danh-cho-hr",
    title: "Tuyển dụng — Dành cho HR: Soạn JD, đăng tin & xử lý ứng viên",
    categoryId: "ats",
    excerpt: "Từ yêu cầu thô của Trưởng bộ phận đến JD hoàn chỉnh, đăng tin đa kênh và điều phối ứng viên qua các vòng sàng lọc AI.",
    readTime: "12 phút",
    updatedAt: "18/09/2026",
    author: "Tuyển dụng",
    content: `
      <h2>1. Bốn lớp công việc của HR</h2>
      <ul>
        <li><strong>Lớp 1 — Yêu cầu tuyển dụng:</strong> tiếp nhận yêu cầu thô từ Trưởng bộ phận.</li>
        <li><strong>Lớp 2 — Biên soạn &amp; đăng tin:</strong> soạn JD, trình duyệt, xuất bản.</li>
        <li><strong>Lớp 3 — Thu nhận ứng viên:</strong> tiếp nhận CV từ cổng ứng tuyển hoặc nhập thủ công.</li>
        <li><strong>Lớp 4 — Điều phối tiến trình:</strong> sàng lọc AI và chuyển ứng viên qua các vòng.</li>
      </ul>

      <h2>2. Tiếp nhận yêu cầu tuyển dụng</h2>
      <p>Truy cập <em>Tuyển dụng &gt; Quản lý yêu cầu tuyển dụng</em>. Mỗi yêu cầu mang một trong các trạng thái:</p>
      <ul>
        <li><strong>HR tiếp nhận</strong> — yêu cầu mới, chờ bạn soạn thảo.</li>
        <li><strong>Đã soạn thảo</strong> — đã có bản thảo JD, chưa trình duyệt.</li>
        <li><strong>Chờ duyệt JD</strong> — đang chờ Trưởng bộ phận thẩm định.</li>
        <li><strong>Sẵn sàng đăng</strong> — đã được duyệt, chờ bạn xuất bản.</li>
        <li><strong>Bị từ chối</strong> — Trưởng bộ phận trả lại kèm lý do; đọc lý do rồi chỉnh bản thảo.</li>
        <li><strong>Hoàn thành</strong> / <strong>Đã hủy</strong> — đã kết thúc.</li>
      </ul>
      <p>Mở chi tiết một yêu cầu để đọc ghi chú thô của Trưởng bộ phận. Bạn có thể bổ sung, làm rõ ghi chú này và nhấn <strong>Lưu ghi chú</strong> trước khi soạn JD.</p>

      <h2>3. Soạn thảo JD — ba cơ chế</h2>
      <p>Ở màn hình <strong>"Khởi tạo nội dung bản tin tuyển dụng"</strong>, chọn một trong ba cách:</p>
      <ul>
        <li><strong>AI gợi ý JD</strong> — chuyển hóa ghi chú thô thành bản thảo hoàn chỉnh với kỹ năng, tiêu chí và khung lương. Nhanh nhất khi ghi chú của Trưởng bộ phận đã đủ chi tiết.</li>
        <li><strong>Nạp từ JD có sẵn</strong> — tái sử dụng các bản mô tả công việc đã được thẩm định trong thư viện mẫu.</li>
        <li><strong>Tạo tin thủ công</strong> — tự thiết lập toàn bộ các nhóm tiêu chí trong bảng soạn thảo.</li>
      </ul>
      <p>Dù chọn cách nào, kết quả đều mở ra trong bảng soạn thảo để bạn tinh chỉnh. Các tiêu chí chuẩn hóa gồm cấp độ (Intern → Director), loại hình (Full-time, Part-time, Hợp đồng, Theo mùa), hình thức làm việc (Tại chỗ, Hybrid, Remote), trình độ học vấn và khung lương.</p>
      <p><em>Bản thảo được <strong>tự động lưu</strong> sau khoảng 5 giây kể từ lần chỉnh sửa cuối. Bạn cũng có thể lưu thủ công bất cứ lúc nào.</em></p>

      <h2>4. Trình duyệt bản thảo</h2>
      <p>Khi bản thảo đã sẵn sàng, dùng nút <strong>Trình duyệt JD</strong> với hai lựa chọn:</p>
      <ul>
        <li><strong>Gửi Trưởng ban duyệt</strong> — theo quy trình thẩm định nội bộ. Hệ thống lưu bản thảo, gửi thông báo cho Trưởng bộ phận, và trạng thái chuyển sang <em>Chờ duyệt JD</em>. Chi tiết yêu cầu hiển thị <strong>"Đang chờ Trưởng ban thẩm định"</strong> và bản thảo bị khóa chỉnh sửa.</li>
        <li><strong>Bỏ qua duyệt (Bypass)</strong> — phê duyệt ngay, chuyển thẳng sang <em>Sẵn sàng đăng</em>. Chỉ dùng cho trường hợp đã có chỉ đạo trực tiếp từ lãnh đạo; hệ thống ghi nhận đây là phê duyệt bỏ qua quy trình.</li>
      </ul>
      <p>Nếu bạn đồng thời có quyền duyệt, nút <strong>Phê duyệt JD</strong> và <strong>Từ chối</strong> cũng xuất hiện khi bản thảo đang ở trạng thái chờ duyệt.</p>

      <h2>5. Đăng tuyển</h2>
      <p>Khi yêu cầu ở trạng thái <strong>Sẵn sàng đăng</strong>, nhấn <strong>Đăng tuyển đa kênh</strong>:</p>
      <ul>
        <li><strong>Chọn kênh phân phối.</strong> Kênh <strong>Website công ty</strong> đang hoạt động. Các kênh LinkedIn Page, Facebook Page, TopCV và CareerViet đang phát triển và tạm thời chưa chọn được.</li>
        <li><strong>Chọn thời điểm:</strong> <em>Đăng ngay lập tức</em>, hoặc <em>Lên lịch đăng</em> và chọn ngày giờ cụ thể.</li>
        <li>Xác nhận để xuất bản. Tin chuyển sang trạng thái đã đăng và bắt đầu nhận hồ sơ.</li>
      </ul>
      <p>Quản lý các tin đã đăng tại <em>Tuyển dụng &gt; Quản lý tin tuyển dụng</em>. Khi tuyển đủ hoặc dừng tuyển, dùng <strong>Đóng tin tuyển dụng</strong> — hệ thống sẽ yêu cầu xác nhận.</p>

      <h2>6. Thu nhận ứng viên</h2>
      <p>Truy cập <em>Tuyển dụng &gt; Quản lý ứng viên</em>. Hồ sơ vào hệ thống theo hai đường:</p>
      <ul>
        <li><strong>Tự động:</strong> ứng viên nộp qua cổng ứng tuyển trên website — CV được tiếp nhận và đưa vào sàng lọc.</li>
        <li><strong>Thủ công:</strong> nhấn <strong>Thêm ứng viên</strong> để nhập hồ sơ nhận qua email, giới thiệu nội bộ, Zalo, Facebook hoặc nguồn khác. Chọn tin tuyển dụng tương ứng, điền thông tin ứng viên và tải lên tệp CV.</li>
      </ul>
      <p>Danh sách ghi rõ <strong>nguồn</strong> của từng hồ sơ (Website, LinkedIn, TopCV, VietnamWorks, CareerViet, Facebook, Zalo, Giới thiệu nội bộ, Nhập thủ công) — dữ liệu này dùng để đánh giá hiệu quả từng kênh.</p>

      <h2>7. Sàng lọc AI ba tầng</h2>
      <p>Sau khi tiếp nhận, CV được AI chấm điểm và phân vào ba tầng. Bạn nhận cập nhật ngay trên danh sách khi sàng lọc hoàn tất, không cần tải lại trang.</p>
      <ul>
        <li><strong>Xuất sắc (Tier 1)</strong> — điểm từ 80 trở lên. Ưu tiên xử lý trước.</li>
        <li><strong>Kho tiềm năng (Tier 2)</strong> — điểm 50 đến 79. Giữ lại cho vị trí này hoặc vị trí khác.</li>
        <li><strong>Không đạt (Tier 3)</strong> — điểm dưới 50.</li>
      </ul>
      <p><strong>Lỗi sàng lọc</strong> là trạng thái kỹ thuật, không phải kết quả đánh giá — thường do tệp CV không đọc được. Dùng chức năng <strong>sàng lọc lại</strong> trên hồ sơ đó để chạy lại; nếu vẫn lỗi, hãy tải lên tệp CV khác.</p>
      <p><em>Điểm AI là gợi ý ưu tiên, không phải quyết định. Bạn luôn có thể chuyển một hồ sơ ra khỏi tầng mà AI đã xếp.</em></p>

      <h2>8. Điều phối tiến trình ứng viên</h2>
      <p>Mỗi hồ sơ đi qua các bước: <strong>Mới nộp CV</strong> → <strong>Đang sàng lọc AI</strong> → phân tầng (<em>Xuất sắc</em> / <em>Kho tiềm năng</em> / <em>Không đạt</em>) → <strong>Phỏng vấn</strong> → <strong>Đề nghị tuyển dụng</strong> → <strong>Đã tuyển dụng</strong>.</p>
      <p>Mở chi tiết ứng viên và dùng menu <em>"Chuyển đến..."</em> để đổi bước. Hệ thống <strong>chỉ liệt kê những bước chuyển hợp lệ</strong> từ trạng thái hiện tại, nên bạn không thể bỏ qua vòng theo cách sai quy trình. Một số lối đi đáng chú ý:</p>
      <ul>
        <li>Từ <strong>Xuất sắc</strong>: vào <em>Phỏng vấn</em>, hoặc hạ về <em>Kho tiềm năng</em>.</li>
        <li>Từ <strong>Kho tiềm năng</strong>: nâng lên <em>Xuất sắc</em> hoặc gọi thẳng vào <em>Phỏng vấn</em> khi có nhu cầu mới.</li>
        <li>Từ <strong>Không đạt</strong>: chỉ có thể đưa trở lại <em>Kho tiềm năng</em>.</li>
        <li><strong>Rút hồ sơ</strong> áp dụng khi ứng viên tự dừng, có ở phần lớn các bước.</li>
      </ul>

      <h2>9. Quyền cần có</h2>
      <ul>
        <li><code>ats_job_post:create</code> và <code>ats_job_post:update</code> — soạn thảo, trình duyệt, xuất bản và đóng tin.</li>
        <li><code>ats_requisition:update</code> — chỉnh ghi chú yêu cầu và hủy yêu cầu.</li>
        <li><code>ats_job_post:approve</code> hoặc <code>ats_requisition:approve</code> — phê duyệt hoặc bỏ qua duyệt.</li>
      </ul>
      <p>Nếu thiếu quyền soạn thảo, giao diện chuyển sang chế độ chỉ xem. Phạm vi quyền (<code>dept</code> hoặc <code>any</code>) quyết định bạn xử lý được yêu cầu của phòng ban mình hay của toàn công ty — xem bài <em>Phân quyền hệ thống: RBAC kết hợp ABAC</em>.</p>
    `
  }
];
