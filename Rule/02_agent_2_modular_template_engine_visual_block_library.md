# AGENT 2: MODULAR TEMPLATE ENGINE & ASSIGNMENT SHOWCASE BLOCKS

## 1. Vai trò (Role)
Bạn là **Principal Frontend UI/UX & Creative Technologist**. Nhiệm vụ của bạn là xây dựng bộ máy hiển thị (Rendering Engine) biến dữ liệu `PortfolioDocument` (chứa các bài tập đã tóm tắt từ `.docx` và ảnh trích xuất/ảnh AI) thành giao diện Portfolio đẹp mắt như Canva Website `https://tntlab.my.canva.site/tuthivananhportfolio/`.

---

## 2. Phạm vi file được phép thao tác (Allowed File Scope)
Bạn **CHỈ ĐƯỢC PHÉP** tạo và chỉnh sửa các file trong:
- `src/engine/**/*`
- `src/templates/**/*`
- `src/components/visual-primitives/**/*`

**NGHIÊM CẤM**: Không sửa Schema của Agent 1 hay giao diện Studio/Backend của Agent 3, 4, 5.

---

## 3. Chi tiết công việc cần thực hiện (Detailed Tasks)

### Task 3.1: Xây dựng Visual Primitives chuẩn phong cách Canva (`src/components/visual-primitives/`)
1. **`<AvatarFrame />` & `<MediaFrame />`**:
   - Đóng khung ảnh đại diện và ảnh minh họa bài tập theo các kiểu: `arch-window` (khung vòm Canva), `cutout-blob`, `polaroid` (khung ảnh kèm băng dính dán góc), `macbook-mockup` (lồng ảnh bài tập vào màn hình laptop/browser tinh tế), `rounded-card`.
2. **`<ImageSourceBadge />`**:
   - Khi ở chế độ chỉnh sửa (`editable={true}`), hiển thị nhãn nhỏ gọn ở góc ảnh để người dùng biết ảnh này là: `📄 Ảnh từ file DOCX` hay `✨ Ảnh tạo bởi AI` kèm nút bấm nhanh: **"🎨 Tạo ảnh AI mới theo chủ đề"** hoặc **"🔄 Đổi ảnh khác trong DOCX"**.
3. **`<DecorationLayer />`**: Render các nhãn dán trang trí (Stickers, Sparkles, Floating Tags) giống mẫu `tuthivananhportfolio`.

### Task 3.2: Thiết kế `<ProjectsShowcaseBlock />` chuyên biệt cho Bài tập từ `.docx`
Trong các Portfolio khóa học / thực chiến (như TNT Lab), phần Dự án chính là nơi trưng bày **các Bài tập đã được AI tóm tắt**. Component `src/templates/blocks/ProjectsShowcaseBlock.tsx` phải hỗ trợ:
1. **Hiển thị trực quan bản tóm tắt Bài tập**:
   - **Header**: Nhãn chủ đề (`category`), Tên dự án/bài tập (`title`), và tên file `.docx` gốc (nếu người dùng muốn hiển thị).
   - **Khối nội dung cô đọng 3 lớp**:
     - 🎯 **Đề bài / Mục tiêu (`assignmentBrief`)**: Hiển thị trong hộp highlight ngắn gọn.
     - 💡 **Giải pháp & Thực hiện (`summary`)**: Văn bản tóm tắt súc tích.
     - ✅ **Kết quả / Điểm nhấn (`keyTakeaways` & `metrics`)**: Hiển thị dạng bullet tags hoặc con số nổi bật.
2. **Trình bày Hình ảnh thông minh (Adaptive Media Layout)**:
   - Nếu bài tập có **1 ảnh** (từ `.docx` hoặc AI gen): Hiển thị dạng Split-Slide 50/50 kiểu Canva (một bên là nội dung tóm tắt, một bên là ảnh kích thước lớn đặt trong khung nghệ thuật).
   - Nếu bài tập có **2 - 4 ảnh** (trích xuất từ `.docx`): Tự động xếp dạng lưới Collage / Bento hoặc Carousel trượt mượt mà.
3. **Modal Xem Chi Tiết Bài Tập (`<AssignmentDetailModal />`)**:
   - Khi người xem bấm vào *"Xem chi tiết bài làm"*, mở ra một Drawer/Modal đẹp mắt hiển thị đầy đủ phần trích dẫn chi tiết từ file `.docx` (`fullRawExcerpt`) và bộ sưu tập toàn bộ hình ảnh kích thước lớn (Lightbox).

### Task 3.3: Hoàn thiện 6 Archetype Templates (`src/templates/archetypes/`)
Đảm bảo cả 6 mẫu (`canva-editorial`, `bento-grid`, `framer-minimal`, `creative-showcase`, `growth-marketer`, `tech-developer`) đều hiển thị mượt mà cấu trúc bài tập tóm tắt và tự động đồng bộ bảng màu với hình ảnh.

### Task 3.4: Xây dựng `<PortfolioRenderer />` (`src/engine/PortfolioRenderer.tsx`)
~~~tsx
export interface PortfolioRendererProps {
  document: PortfolioDocument;
  editable?: boolean;
  activeSectionIndex?: number | null;
  onSelectSection?: (index: number) => void;
  onRegenerateProjectImage?: (projectId: string, customPrompt?: string) => Promise<void>;
  onSwitchProjectImageSource?: (projectId: string, mode: 'docx' | 'ai') => void;
}
~~~

---

## 4. Tiêu chuẩn nghiệm thu (Definition of Done)
- [ ] Bài tập có 1 ảnh, nhiều ảnh (từ `.docx`), hoặc ảnh AI đều tự động căn chỉnh khung hình đẹp mắt, không bị méo tỷ lệ (`object-cover` / `aspect-ratio` chuẩn).
- [ ] Khi `editable={true}`, trên mỗi thẻ bài tập có nút bấm gọi trực tiếp callback `onRegenerateProjectImage` để tạo ảnh AI mới ngay trên Canvas.