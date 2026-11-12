# AGENT 4: DOCX PARSER, ASSIGNMENT SUMMARIZER, AI IMAGE GENERATOR & MASS FACTORY

## 1. Vai trò (Role)
Bạn là **Lead AI, Document Parsing & Automation Pipeline Engineer**. Bạn chịu trách nhiệm xây dựng toàn bộ "bộ não" xử lý ở tầng Backend & Services cho 3 luồng cốt lõi:
1. **DOCX Deep Parser (`src/services/docx/`)**: Giải nén file `.docx` để lấy cả văn bản có cấu trúc lẫn toàn bộ hình ảnh nhúng bên trong (`word/media/*`).
2. **AI Assignment Summarizer (`src/services/ai/summarize-assignments.ts`)**: Đọc nội dung các bài tập trong file `.docx`, tóm tắt súc tích từng bài tập thành các Case Study / Project cho Portfolio, đồng thời tự động tổng hợp phần Giới thiệu bản thân (About) và Kỹ năng (Skills) từ chính các bài tập đó.
3. **Topic-Aware AI Image Generator (`src/services/ai/image-generator.ts`)**: Sinh hình ảnh minh họa theo đúng chủ đề bài tập và màu sắc chủ đạo của Portfolio khi bài tập không có ảnh hoặc khi người dùng yêu cầu.
4. **Mass-Production Factory (`/batch`)**: Xử lý hàng loạt file `.docx` bài tập để xuất bản hàng loạt Portfolio cùng lúc.

---

## 2. Phạm vi file được phép thao tác (Allowed File Scope)
Bạn **CHỈ ĐƯỢC PHÉP** tạo và chỉnh sửa các file trong:
- `src/services/docx/**/*`
- `src/services/ai/**/*`
- `src/app/api/docx-ingest/**/*`
- `src/app/api/ai/**/*`
- `src/app/api/batch/**/*`
- `src/app/batch/**/*`

**NGHIÊM CẤM**: Không sửa code trong `src/templates/` hay `src/app/studio/`.

---

## 3. Chi tiết công việc cần thực hiện (Detailed Tasks)

### Task 4.1: Xây dựng Bộ Bóc Tách File `.docx` Lấy Chữ + Ảnh Nhúng (`src/services/docx/docx-parser.ts`)
Một file `.docx` thực chất là một file nén ZIP. Bạn cần kết hợp thư viện `jszip` và `mammoth` để bóc tách chính xác:
1. **Trích xuất HTML & Ảnh đúng vị trí**:
   - Dùng `mammoth.convertToHtml({ buffer }, { convertImage: mammoth.images.imgElement(...) })`.
   - Trong hàm callback `convertImage` của `mammoth`, mỗi khi gặp một bức ảnh nhúng trong file `.docx`:
     - Đọc buffer của ảnh và lưu thành file thật vào `public/uploads/docx-media/{timestamp}-{index}.{ext}` (hoặc chuyển sang Data URL nếu chạy môi trường serverless).
     - Ghi nhận lại đường dẫn URL của ảnh và đoạn văn bản tiêu đề/nội dung nằm ngay trước/sau bức ảnh đó để **gắn đúng bức ảnh vào đúng bài tập tương ứng** (không bị râu ông nọ cắm cằm bà kia khi 1 file `.docx` có nhiều bài tập).
2. **Phân tách tự động nhiều Bài tập trong 1 file `.docx` (Multi-Assignment Splitter)**:
   - Nhận diện các mốc phân tách bài tập dựa trên thẻ Heading (`<h1>`, `<h2>`) hoặc các mẫu từ khóa tiếng Việt/tiếng Anh như: `Bài tập 1`, `Bài 1`, `Assignment 1`, `Project 1`, `Phần I`, `Đề bài:`, `Chủ đề:`.
   - Nếu người dùng tải lên **nhiều file `.docx` rời nhau**, mỗi file `.docx` sẽ mặc định tương ứng với 1 (hoặc nhiều) dự án trong Portfolio.

### Task 4.2: Xây dựng AI Tóm Tắt Bài Tập -> Cấu trúc Portfolio (`src/services/ai/summarize-assignments.ts`)
Khi nhận văn bản thô của các bài tập từ file `.docx`, AI Summarizer phải thực hiện:
1. **Tóm tắt từng bài tập thành một thẻ `Project` chuyên nghiệp**:
   - `title`: Đặt lại tiêu đề dự án ngắn gọn, cuốn hút như trên Portfolio thực tế (không để nguyên tên thô kiểu *"Bài tập về nhà tuần 3"* mà chuyển thành *"Chiến dịch Content Marketing & Phân tích Khách hàng Mục tiêu"*).
   - `category`: Phân loại lĩnh vực của bài tập.
   - `assignmentBrief`: Tóm tắt đề bài / yêu cầu trong 1-2 câu.
   - `summary`: Tóm tắt cách giải quyết, phương pháp thực hiện và nội dung chính trong 2-3 câu súc tích.
   - `keyTakeaways`: 3-4 gạch đầu dòng nêu bật kết quả hoặc kiến thức cốt lõi đã thể hiện trong bài tập.
   - `metrics`: Bóc tách các con số nổi bật có trong bài làm (VD: `Điểm số: 9.5/10`, `Quy mô: 500 mẫu khảo sát`, `Tăng trưởng: +120%`...).
   - `suggestedAiImagePrompt`: Tự động viết sẵn 1 câu prompt tiếng Anh mô tả hình ảnh minh họa bám sát chủ đề bài tập đó (VD: *"Modern pastel editorial illustration of social media content strategy, analytics charts, creative workspace, clean minimalist vector style"*).
2. **Tự động suy luận Kỹ năng (`Skills`) & Giới thiệu (`About`) từ tập hợp bài tập**:
   - Từ toàn bộ các bài tập người dùng đã làm, AI tự động liệt kê các kỹ năng chuyên môn và công cụ mà người đó đã sử dụng để điền vào `SkillsSection` và viết đoạn `shortBio` / `biography` ấn tượng cho `HeroSection` & `AboutSection`.

### Task 4.3: Xây dựng Dịch vụ Tạo Ảnh AI Theo Chủ Đề (`src/services/ai/image-generator.ts`)
Xây dựng API `POST /api/ai/generate-image` nhận vào:
~~~typescript
interface GenerateTopicImageRequest {
  topicTitle: string;
  assignmentSummary: string;
  customPrompt?: string;
  visualStyle: 'editorial-illustration' | '3d-render' | 'minimal-photo' | 'canva-pastel-graphic';
  themeColors?: { primaryColor: string; backgroundColor: string };
  aspectRatio?: '16:9' | '4:3' | '1:1';
}
~~~
**Cơ chế Multi-Provider (Đảm bảo 100% luôn tạo được ảnh thật)**:
1. **Provider 1 (Nếu có `GEMINI_API_KEY` hoặc `OPENAI_API_KEY`)**: Gọi Gemini Imagen 3 / OpenAI `dall-e-3` để sinh ảnh chất lượng cao và lưu vào `public/uploads/ai-generated/`.
2. **Provider 2 (Chế độ Mặc định / Không cần API Key - Pollinations Flux AI)**:
   - Kết hợp `topicTitle` + `visualStyle` + màu chủ đạo thành prompt hoàn chỉnh, tạo URL ảnh AI thực tế qua `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=900&seed=${seed}&nologo=true&model=flux` và tải buffer về lưu vào `public/uploads/ai-generated/` để trang web sở hữu file ảnh thật phục vụ xuất file `.zip` offline.

### Task 4.4: Giao diện & Luồng Sản Xuất Hàng Loạt từ Nhiều File `.docx` (`src/app/batch/page.tsx`)
Cho phép một giáo viên / quản lý Lab (như TNT Lab) tạo hàng loạt Portfolio cho cả lớp:
- Kéo thả hàng loạt file `.docx` (ví dụ: mỗi file mang tên `Ho_Ten_Hoc_Vien_BaiTap.docx` hoặc thư mục bài tập của từng học viên + file CSV thông tin).
- Chọn chế độ ảnh cho toàn bộ lô: `Ưu tiên ảnh trong DOCX + Tự bù bằng ảnh AI nếu thiếu`.
- Chạy hàng đợi tự động -> Xuất ra danh sách đường dẫn Portfolio của từng học viên (`/tuthivananhportfolio`, `/nguyenvananportfolio`...).

---

## 4. Tiêu chuẩn nghiệm thu (Definition of Done)
- [ ] Nạp file `references/sample-assignments.docx` vào API `/api/docx-ingest`: Trích xuất chính xác toàn bộ văn bản, tách đúng 3 bài tập, lấy được 2 ảnh có sẵn trong file `.docx`, và tự động tạo ảnh AI theo chủ đề cho bài tập thứ 3 (bài tập không có ảnh).
- [ ] Kể cả khi chạy ở môi trường local chưa điền API Key trả phí, bộ tóm tắt thông minh và bộ tạo ảnh AI theo chủ đề vẫn hoạt động 100% không báo lỗi.