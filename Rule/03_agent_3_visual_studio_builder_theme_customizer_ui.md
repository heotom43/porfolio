# AGENT 3: VISUAL STUDIO EDITOR, DOCX UPLOAD WIZARD & AI IMAGE CONTROLS

## 1. Vai trò (Role)
Bạn là **Senior Product Engineer (Design Tools & Interactive Studio)**. Nhiệm vụ của bạn là xây dựng giao diện **Portfolio Studio (`/studio`)** giúp người dùng:
1. Ném các file `.docx` bài tập vào ứng dụng -> Xem bản tóm tắt từng bài tập -> Chọn dùng ảnh có sẵn trong file `.docx` hoặc bấm nút cho AI tự vẽ ảnh minh họa theo chủ đề.
2. Chỉnh sửa trực quan bố cục, màu sắc, kiểu mẫu (Template) và nội dung trên màn hình Split-Screen Canvas.

---

## 2. Phạm vi file được phép thao tác (Allowed File Scope)
Bạn **CHỈ ĐƯỢC PHÉP** tạo và chỉnh sửa các file trong:
- `src/app/studio/**/*`
- `src/store/usePortfolioStore.ts`
- `src/components/studio/**/*`

**NGHIÊM CẤM**: Không sửa `src/schema/`, `src/templates/`, hay `src/services/`.

---

## 3. Chi tiết công việc cần thực hiện (Detailed Tasks)

### Task 3.1: Xây dựng "DOCX Assignment-to-Portfolio Wizard Modal" (`src/components/studio/DocxImportWizard.tsx`)
Đây là cửa ngõ trải nghiệm quan trọng nhất khi người dùng muốn tạo Portfolio từ các file `.docx` bài tập:
1. **Bước 1 - Kéo thả file `.docx` bài tập & Thông tin cá nhân**:
   - Cho phép kéo thả **1 hoặc nhiều file `.docx`** (VD: `Bai_tap_1_Content.docx`, `Bai_tap_2_Research.docx`, hoặc 1 file tổng hợp `Tong_hop_bai_tap_khoa_hoc.docx`).
   - Ô nhập nhanh: Họ tên, Chức danh/Ngành học, Ảnh đại diện (hoặc chọn lấy ảnh chân dung từ file `.docx`).
2. **Bước 2 - Chọn Chế độ Hình ảnh & Phong cách Tóm tắt**:
   - Radio chọn cách xử lý ảnh cho các bài tập:
     - 🔘 **Tự động kết hợp (Khuyên dùng)**: Ưu tiên lấy ảnh có sẵn trong file `.docx`. Bài tập nào không có ảnh sẽ tự động dùng AI vẽ ảnh minh họa theo chủ đề.
     - 🔘 **Chỉ dùng ảnh gốc trong file `.docx`**: Giữ nguyên các ảnh chụp màn hình/biểu đồ trong Word.
     - 🔘 **Tạo mới toàn bộ ảnh bằng AI theo chủ đề**: AI tự đọc chủ đề từng bài tập và sinh bộ ảnh minh họa đồng bộ 100% với màu sắc Portfolio.
   - Chọn phong cách ảnh AI (nếu dùng): `Canva Pastel Graphic`, `Editorial Flat Illustration`, `3D Isometric Render`, `Minimalist Realistic Photo`.
3. **Bước 3 - Xem trước & Duyệt các Bài tập đã Tóm tắt (Review Cards)**:
   - Hiển thị danh sách các bài tập AI vừa bóc tách từ file `.docx`: Tiêu đề tóm tắt, Đề bài, Kết quả chính, và các ảnh đi kèm -> Bấm **"Đổ vào Portfolio Canvas"** để dựng thành trang web hoàn chỉnh.

### Task 3.2: Bảng điều khiển Hình ảnh thông minh cho từng Bài tập (`src/components/studio/ProjectImageManager.tsx`)
Ở cột Inspector bên phải (khi người dùng click vào một bài tập/dự án trên Canvas), cung cấp công cụ kiểm soát hình ảnh cực kỳ linh hoạt:
- **Tab 1 - Ảnh trích xuất từ file `.docx`**: Hiển thị toàn bộ các ảnh đã bóc ra từ file Word của bài tập đó để người dùng tick chọn/bỏ chọn hoặc sắp xếp thứ tự.
- **Tab 2 - Tạo ảnh AI theo chủ đề bài tập (`AI Image Studio`)**:
  - Tự động điền sẵn câu lệnh gợi ý (`suggestedAiImagePrompt`) dựa trên nội dung bài tập vừa tóm tắt.
  - Người dùng có thể sửa câu lệnh tiếng Việt/tiếng Anh (VD: *"Vẽ minh họa chiến dịch truyền thông mạng xã hội tông màu hồng kem pastel"*) và bấm **"✨ Tạo ảnh AI ngay"**.
  - Hiển thị hiệu ứng Skeleton Loading ngay trên khung ảnh của bài tập và tự động thay ảnh mới vào khi hoàn tất.

### Task 3.3: Hoàn thiện Không gian làm việc Studio 3 Cột (`src/app/studio/page.tsx`)
- **Topbar**: Nút `📄 Nhập file .docx bài tập`, chọn nhanh 6 bộ Template (`Canva Editorial`, `Bento Grid`, `Framer Minimal`...), chuyển đổi Desktop/Tablet/Mobile, `Undo/Redo`, và nút `Xuất bản`.
- **Left Sidebar**: Quản lý thứ tự các Section bằng kéo-thả (`@dnd-kit`), chỉnh bảng màu Theme & Font chữ tiếng Việt; cho phép kéo-thả và xóa từng kỹ năng/công cụ trong Section Skills.
- **Center Canvas**: Nhúng `<PortfolioRenderer editable={true} />` phản hồi tức thì mọi thao tác chỉnh sửa.
- **Right Inspector**: Biểu mẫu chỉnh sửa chi tiết nội dung văn bản tóm tắt, kỹ năng, thông tin cá nhân và trình quản lý ảnh.

---

## 4. Tiêu chuẩn nghiệm thu (Definition of Done)
- [ ] Kéo thả file `.docx` vào Studio -> Hiển thị rõ số lượng bài tập phát hiện được và số lượng ảnh bóc tách được từ trong file `.docx`.
- [ ] Người dùng có thể bấm nút **"Tạo ảnh AI theo chủ đề"** ở bất kỳ bài tập nào và thấy ảnh mới cập nhật trực tiếp lên giao diện Portfolio.