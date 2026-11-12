# QUY TẮC TỐI ƯU HÓA NGỮ CẢNH & CHỈNH SỬA CHO AI (AI OPTIMIZATION RULES)

*Bắt buộc đọc file này trước khi thực thi để tiết kiệm Token, tránh làm rối code cũ và tối ưu tốc độ sinh code.*

## 1. Quy tắc "Chỉ sửa những gì cần sửa" (Targeted Edits)
- **KHÔNG BAO GIỜ** in (output) lại toàn bộ nội dung của một file lớn nếu chỉ cần sửa vài dòng.
- Hãy sử dụng công cụ thay thế / diff / patch (nếu có) của IDE (như Cursor/Windsurf) hoặc chỉ in ra đoạn code cần sửa kèm theo một chút context trước/sau đoạn đó.
- Ví dụ:
  ```typescript
  // ... (giữ nguyên các import)
  export function summarizeAssignment() {
    // Sửa logic ở đây
  }
  // ... (giữ nguyên phần còn lại)
  ```

## 2. Quy tắc Tìm kiếm thay vì Đọc toàn bộ (Search over Scan)
- Trước khi thêm một tính năng mới, hãy dùng công cụ tìm kiếm trong file (grep/search AST) để xem hàm/component đó đã tồn tại chưa.
- **KHÔNG đọc toàn bộ** dự án hoặc những file không liên quan. Ví dụ: Đang sửa UI của `Button`, đừng đọc code của `docx-parser.ts`.

## 3. Quy tắc "Đọc Schema trước tiên" (Schema-First Approach)
- Bất cứ khi nào cần tạo Component UI mới hoặc API mới, **PHẢI** đọc qua file `src/schema/portfolio.schema.ts` (hoặc các type interfaces) trước để chắc chắn prop types và data payload là chính xác.
- Tuyệt đối không tự bịa ra cấu trúc dữ liệu không khớp với Zod schema đã định nghĩa.

## 4. Quy tắc Từng Bước Nhỏ (Incremental Verification)
- Thay vì code liên tục 10 file rồi mới chạy thử, hãy:
  1. Code 1 logic hoặc 1 UI component.
  2. Dừng lại, yêu cầu tôi (người dùng) kiểm tra hoặc tự chạy script test.
  3. Nếu ổn định (không có lỗi đỏ / TS error), mới chuyển sang file tiếp theo.
- Hãy luôn check TypeScript sau khi lưu file.

## 5. Xử lý Lỗi (Bug Fixing Protocol)
- Khi gặp một lỗi do người dùng paste vào, **ĐỪNG VỘI VÀNG ĐOÁN**.
- Hãy xin phép dùng tool đọc chính xác file đang bị lỗi, check lại types, in log, sau đó đề xuất đoạn code sửa cực kỳ tập trung.