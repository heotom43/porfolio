# AGENT 5: MULTI-FORMAT EXPORTER, PUBLIC HOSTING & AUTOMATED QA

## 1. Vai trò (Role)
Bạn là **Lead DevOps, Publishing Pipeline & QA Automation Engineer**. Nhiệm vụ của bạn là:
1. Xây dựng trang hiển thị Portfolio công khai (`/[portfolioSlug]`) chuẩn thẩm mỹ như `https://tntlab.my.canva.site/tuthivananhportfolio/`.
2. Xây dựng bộ xuất bản (Export): Đóng gói toàn bộ trang Portfolio **kèm tất cả hình ảnh trích xuất từ `.docx` và hình ảnh do AI tạo ra** thành gói `.zip` tĩnh độc lập, xuất PDF chuẩn slide, hoặc phát hành link trực tiếp.
3. Viết bộ kiểm thử tự động (Playwright E2E) kiểm tra trọn vẹn luồng: **Nạp file `.docx` bài tập -> Tóm tắt & Xử lý ảnh (DOCX + AI) -> Hiển thị Portfolio -> Xuất bản**.

---

## 2. Phạm vi file được phép thao tác (Allowed File Scope)
Bạn **CHỈ ĐƯỢC PHÉP** tạo và chỉnh sửa các file trong:
- `src/app/[portfolioSlug]/**/*`
- `src/services/export/**/*`
- `src/app/api/export/**/*`
- `src/app/api/portfolios/**/*`
- `tests/**/*`

---

## 3. Chi tiết công việc cần thực hiện (Detailed Tasks)

### Task 5.1: Xây dựng Trang Public Portfolio (`src/app/[portfolioSlug]/page.tsx`)
- Hiển thị trang Portfolio tại đường dẫn `/{portfolioSlug}` (mặc định có sẵn `/tuthivananhportfolio`).
- Hỗ trợ thanh điều hướng neo (Floating Navigation) chuyển nhanh giữa các phần: `Bìa mở đầu`, `Giới thiệu`, `Kỹ năng`, `Bài tập & Dự án tiêu biểu`, `Liên hệ`.
- Cho phép người xem click vào từng bài tập để mở Modal đọc chi tiết đề bài, phương pháp làm bài và phóng to các hình ảnh minh họa.

### Task 5.2: Bộ Xuất Bản Đóng Gói Kèm Tài Nguyên Ảnh `.docx` & AI (`src/services/export/`)
Điểm cực kỳ quan trọng khi người dùng tạo Portfolio từ file `.docx` có ảnh hoặc ảnh AI là **khi xuất file mang đi nơi khác, ảnh không được phép bị lỗi đường dẫn**:
1. **Standalone Static HTML/CSS + Assets Bundle (`.zip`)**:
   - Gom file `index.html`, file CSS và **toàn bộ file ảnh trong `public/uploads/docx-media/` cũng như `public/uploads/ai-generated/`** của Portfolio đó vào thư mục `./assets/images/` bên trong file `.zip`.
   - Tự động viết lại đường dẫn `<img src="./assets/images/..." />` tương đối trong file `index.html` để người dùng giải nén trên bất kỳ máy tính nào (ngay cả khi không có mạng Internet) hoặc đẩy lên GitHub Pages / Vercel / Netlify đều hiển thị đầy đủ hình ảnh.
2. **Bulk ZIP Export cho Chế độ Sản xuất hàng loạt (`/batch`)**:
   - Nén toàn bộ các Portfolio đã tạo từ lô file `.docx` thành 1 file `.zip` tổng, bên trong chia sẵn thư mục theo từng `slug` cá nhân.
3. **PDF Slide Deck Export**:
   - Hỗ trợ in/xuất trang Portfolio kèm bản tóm tắt các bài tập ra file PDF chất lượng cao.

### Task 5.3: Kiểm thử Tự động E2E Luồng `.docx` -> Portfolio (`tests/portfolio-factory.spec.ts`)
Viết bộ test Playwright kiểm tra tự động 4 kịch bản:
1. **Test 1 (Canva Reference Parity)**: Truy cập `/tuthivananhportfolio`, kiểm tra giao diện hiển thị đầy đủ các mục và hình ảnh không có lỗi.
2. **Test 2 (DOCX Assignment Ingestion + Dual Image Flow)**:
   - Tự động upload file `references/sample-assignments.docx` vào Studio.
   - Kiểm tra hệ thống tách đúng các bài tập, giữ nguyên ảnh nhúng từ `.docx` cho các bài có ảnh, và sinh ảnh AI theo chủ đề cho bài tập chưa có ảnh.
3. **Test 3 (On-Demand AI Image Regeneration)**:
   - Tại Studio, bấm nút *"Tạo ảnh AI mới theo chủ đề"* trên 1 bài tập -> Xác nhận URL ảnh mới được cập nhật lên giao diện.
4. **Test 4 (Batch DOCX Production & ZIP Export)**:
   - Thử nghiệm tạo hàng loạt tại `/batch` và kiểm tra API xuất file `.zip` trả về mã `200 OK` kèm đầy đủ thư mục `assets/images/`.

---

## 4. Tiêu chuẩn nghiệm thu toàn dự án (Final Definition of Done)
- [ ] `npm run build` hoàn tất 100% không lỗi TypeScript.
- [ ] Luồng ném file `.docx` bài tập -> tự động tóm tắt nội dung -> tự động bóc ảnh trong `.docx` kết hợp gen ảnh AI theo chủ đề hoạt động trơn tru từ đầu đến cuối.