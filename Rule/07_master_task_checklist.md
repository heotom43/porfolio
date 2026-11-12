# BẢNG THEO DÕI TIẾN ĐỘ TỔNG THỂ (MASTER TASK CHECKLIST)

*Sử dụng file này để đánh dấu tiến độ `[x]` khi các Agent hoàn thành công việc. AI cũng có thể tự đọc file này để biết việc gì chưa làm.*

## 📌 Giai đoạn 1: Khởi tạo & Schema (Agent 1)
- [x] Khởi tạo dự án Next.js (App Router), Tailwind CSS, Zustand, Zod.
- [x] Cài đặt các thư viện: `mammoth`, `jszip`, `lucide-react`, `@dnd-kit/core`.
- [x] Hoàn thiện `src/schema/portfolio.schema.ts` (Định nghĩa dữ liệu Portfolio).
- [x] Hoàn thiện `src/schema/docx-ingestion.schema.ts` (Định nghĩa dữ liệu bóc tách Word).
- [x] Tạo file `references/sample-assignments.docx` chứa bài tập mẫu (có chữ + có ảnh).
- [x] Tạo file mock data `src/data/presets/tuthivananh-sample.json`.

## 🎨 Giai đoạn 2: UI Engine & Templates (Agent 2)
- [x] Xây dựng các Visual Primitives (`<AvatarFrame>`, `<MediaFrame>`, `<ImageSourceBadge>`).
- [x] Code block `<ProjectsShowcaseBlock>` chuyên hiển thị bài tập (hỗ trợ layout 1 ảnh, lưới nhiều ảnh).
- [x] Code `<AssignmentDetailModal>` để xem toàn bộ nội dung bài tập gốc.
- [x] Hoàn thiện 6 Archetype Templates (ưu tiên `canva-editorial`).
- [x] Code `<PortfolioRenderer>` (Hiển thị View Mode & Edit Mode).

## 🎛️ Giai đoạn 3: Studio Editor & DOCX Wizard (Agent 3)
- [x] Code giao diện Studio 3 cột (Sidebar, Canvas, Inspector) tại `/studio`.
- [x] Code Modal `DocxImportWizard`: Kéo thả file, chọn chế độ sinh ảnh AI.
- [x] Code component `ProjectImageManager`: Trình quản lý ảnh AI / ảnh gốc từ DOCX.
- [x] Tích hợp tính năng kéo thả thay đổi thứ tự Section (Dnd-kit).

## 🧠 Giai đoạn 4: AI & Backend Pipeline (Agent 4)
- [x] Code dịch vụ giải nén & đọc file DOCX `src/services/docx/docx-parser.ts` (lấy chữ + lưu ảnh ra `public/uploads/docx-media`).
- [x] Code API `POST /api/docx-ingest`: Nhận file, trả về cấu trúc đã parse.
- [x] Code AI Summarizer `src/services/ai/summarize-assignments.ts`: Tóm tắt bài tập, suy luận Kỹ năng.
- [x] Code AI Image Generator `src/services/ai/image-generator.ts` (Hỗ trợ API key trả phí hoặc Pollinations AI miễn phí).
- [x] Code giao diện sản xuất hàng loạt `/batch`.

## 🚀 Giai đoạn 5: Export & QA (Agent 5)
- [x] Code trang Public hiển thị tĩnh tại `/[portfolioSlug]`.
- [x] Code dịch vụ đóng gói ZIP (HTML tĩnh + thư mục ảnh nội bộ) `src/services/export/zip-exporter.ts`.
- [x] Code API xuất PDF.
- [x] Viết & chạy Playwright E2E Tests (5/5 pass).
- [x] Fix toàn bộ lỗi TypeScript (`tsc --noEmit` & `next build`).

## 🎨 Giai đoạn 6: Nâng cấp Canva Parity 1:1 & Fixed Layout - Creative Theme (`/teamwork` + Subagents)
- [x] Khóa khung bố cục Canva Editorial 1:1 (`#FFF3E6`, Cover SVG, `About me`, `project` TOC 6 chương `01`–`06`, `Conclusion`, `Thank You !`, dải chân trang đen) qua `HeroBlock`, `AboutBlock`, `SkillsBlock`, `EducationBlock`, `ProjectsShowcaseBlock`, `ContactBlock`, `CanvaOrnaments`.
- [x] Bảng quy tắc theme ngữ cảnh 7 lĩnh vực `AUTOMATED_THEME_RULE_TABLE` & `resolveThemeFromContext` tại `src/schema/theme.schema.ts` đồng bộ Studio, AI Summarizer, Batch (`/api/batch`), Public route & ZIP Export.
- [x] Hệ thống chuyển động mượt zero-dependency (`@keyframes fadeInUp`, `.reveal-on-scroll`, `.hover-lift`, `.glass-panel`) đồng nhất giữa Next.js client (`TemplateShell.tsx`) và gói ZIP tĩnh (`zip-exporter.ts`).
- [x] Chuẩn hóa toàn bộ token màu động (gỡ màu mocha cứng trong `zip-exporter.ts`, `ProjectsShowcaseBlock.tsx`, `ExperienceBlock.tsx`, `ArchetypeDivider.tsx`) & tối ưu `IntersectionObserver` (`threshold: 0.01`, kích hoạt phần tử trong viewport ngay khi tải).
- [x] Bổ sung Test 5 Playwright E2E kiểm chứng ZIP theme phi-Canva, motion/glass CSS, DOM background/reveal và `resolveThemeFromContext`.

## ✨ Giai đoạn 7: Mở rộng Đa Mẫu Canva, Studio Kéo thả/In-line, Chi tiết Dự án & Chuẩn Rubric INF2501 (`/teamwork`)
- [x] **UX/UI & Ảnh chân dung chủ nhân (`AvatarFrame.tsx`)**: 7 kiểu khung chân dung (`arch-window`, `polaroid`, `cutout-blob`, `circle`, `geometric-badge`, `clean-card`, `none`), tỉ lệ 3:4 / 1:1 / 4:5, monogram fallback, quản lý trong `SectionInspector.tsx`.
- [x] **Studio Nâng cao (`DraggableUnitList.tsx`, `InlineEditableText.tsx`, `VisualEffectsLayer.tsx`, `BackgroundIllustrationLayer.tsx`)**: Kéo thả đơn vị (`@dnd-kit`), sửa chữ trực tiếp trên canvas, đổi bố cục nhiều khung, hiệu ứng bật/tắt (float/glow/tilt/sparkles/parallax/reveal), kho 8 SVG nền (`background-presets.ts`) + upload ảnh nền tùy ý (opacity/blur).
- [x] **Chuyển động nội dung**: Mục Tools/Skills có hiệu ứng reveal và nâng nhẹ khi hover; nội dung highlight dài chạy qua lại, hỗ trợ giảm chuyển động theo cài đặt hệ điều hành.
- [x] **6 Mẫu Canva Sáng tạo Mới (`canva-creative-presets.ts`)**: `warm-editorial`, `creative-bold`, `minimal-chic`, `vibrant-student`, `artistic-organic`, `academic-presentation`.
- [x] **Chi tiết Dự án 2 Chế độ + Next/Prev (`/[portfolioSlug]/projects/[projectSlug]/page.tsx`, `ProjectDetailClientView.tsx`, `AssignmentDetailModal.tsx`, `zip-exporter.ts`)**: Mặc định mở trang Route riêng để cuộn toàn trang; Fullscreen Modal vẫn là lựa chọn tùy chỉnh. Hỗ trợ Next/Prev, Back to Projects, không hiển thị mục kê khai AI/liêm chính trong bài làm, đồng bộ HTML tĩnh `projects/*.html` trong ZIP.
- [x] **Chuẩn Rubric INF2501**: Mục tiêu học tập & Mục tiêu Portfolio, 6 chương bài tập riêng + bảng so sánh Prompt, Footer SV/MSSV/Lớp/Học phần. Danh sách công cụ trong Skills có thể kéo-thả/xóa; không hiển thị video giới thiệu hoặc bảng kê khai công cụ AI.
- [x] Mở rộng & chạy **10/10 Playwright E2E Tests** (Test 1–10 pass) + `tsc --noEmit` + `next build`.

---
**Trạng thái dự án hiện tại:** ✅ Hoàn tất 100% (7/7 Giai đoạn) & Đạt chuẩn QA (`tsc --noEmit` + `next build` + `10/10` Playwright E2E)