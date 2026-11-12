# MASTER PLAN: HỆ THỐNG TẠO PORTFOLIO TỪ FILE DOCX BÀI TẬP & SẢN XUẤT HÀNG LOẠT (AI PORTFOLIO FACTORY)

## 1. Mục tiêu dự án (Product Vision)
Xây dựng nền tảng **DOCX Assignment-to-Portfolio & Mass-Production Builder** cho phép biến các **file `.docx` bài tập / đồ án / báo cáo thực hành** thành một trang Website Portfolio cá nhân hoàn chỉnh, giàu tính thẩm mỹ đồ họa như mẫu Canva `https://tntlab.my.canva.site/tuthivananhportfolio/` (hoặc các mẫu Bento, Framer, Behance).

Hệ thống giải quyết trọn vẹn bài toán thực tế của học viên và tổ chức đào tạo (như mô hình TNT Lab):
1. **Nạp file `.docx` bài tập (Single hoặc Multi-DOCX)**:
   - Người dùng kéo thả 1 hoặc nhiều file `.docx` chứa các bài tập đã làm vào phần mềm.
   - Hệ thống tự động đọc cấu trúc bài tập, **tóm tắt thành các Case Study / Dự án trưng bày (Featured Projects)** gồm: Tên dự án hấp dẫn, Mục tiêu/Đề bài, Giải pháp cốt lõi, Kết quả/Điểm nhấn, và tự động tổng hợp ra danh sách **Kỹ năng (Skills)** + **Giới thiệu bản thân (About Me)**.
2. **Cơ chế Hình ảnh Kép thông minh (Dual Image Pipeline: DOCX Media + AI Image Gen)**:
   - **Trích xuất ảnh gốc từ `.docx` (`word/media/*`)**: Tự động giải nén cấu trúc ZIP của file `.docx`, bóc toàn bộ ảnh chụp màn hình, biểu đồ, thiết kế có sẵn trong bài tập và gắn đúng vào dự án tương ứng trên Portfolio.
   - **Tạo ảnh minh họa bằng AI theo chủ đề (`AI Topic Image Generator`)**: Nếu file `.docx` chỉ có chữ (không có ảnh) HOẶC người dùng bật tuỳ chọn *"Tạo ảnh AI theo chủ đề"*, AI sẽ đọc nội dung tóm tắt của bài tập đó để tự sinh câu lệnh (Prompt) và tạo ra hình ảnh minh họa đồng bộ với tông màu (Theme) của trang Portfolio.
3. **Sản xuất hàng loạt (Batch Factory Mode)**:
   - Nạp cả một thư mục chứa các file `.docx` bài tập của nhiều học viên (hoặc kết hợp CSV danh sách học viên + file `.docx`) -> Hệ thống tự động tóm tắt, xử lý ảnh và xuất bản hàng loạt trang Portfolio (`domain.com/tuthivananhportfolio`, `domain.com/hocvien2portfolio`...).

---

## 2. Phân tích nguồn tham khảo & Luồng chuyển đổi `.docx` -> giao diện Canva
### 2.1. Tham chiếu mẫu `https://tntlab.my.canva.site/tuthivananhportfolio/`
Trên trang mẫu của TNT Lab, phần quan trọng nhất của Portfolio học viên chính là **trưng bày kết quả các bài tập thực hành / dự án trong khóa học** dưới dạng các slide trực quan:
- Thay vì hiển thị văn bản bài tập dài dòng như trong Word, mỗi bài tập cần được AI cô đọng thành:
  - **Tiêu đề dự án ngắn gọn, chuyên nghiệp** (Headline)
  - **Nhãn phân loại bài tập** (VD: *Bài tập Content Marketing*, *Bài tập Prompt AI*, *Thiết kế truyền thông*, *Phân tích dữ liệu*)
  - **Tóm tắt 3 phần (Đề bài - Cách làm - Kết quả)** dạng thẻ dễ đọc lướt (Scannable Cards/Bullets)
  - **Khung trưng bày hình ảnh (Mockup/Gallery)**: Hiển thị ảnh lấy từ file `.docx` hoặc ảnh do AI tạo ra, đặt trong khung bo góc, khung vòm (`arch-window`) hoặc khung Polaroid kiểu Canva.

### 2.2. 3 Chế độ Xử lý Ảnh cho Bài tập (`ImageMode`)
Khi người dùng tải file `.docx` lên, hệ thống cho phép chọn 1 trong 3 chế độ ở cấp độ toàn trang hoặc từng bài tập:
1. **`docx-extract` (Dùng ảnh trong file Word)**: Giữ nguyên 100% ảnh nhúng trong file `.docx`.
2. **`hybrid-auto` (Mặc định - Thông minh)**: Bài tập nào trong `.docx` có ảnh thì lấy ảnh đó; bài tập nào chỉ có chữ (hoặc ít hơn số lượng ảnh tối thiểu của khung hình) thì AI tự động vẽ thêm ảnh minh họa theo đúng chủ đề bài tập.
3. **`ai-generate-all` (Tạo mới bằng AI)**: Dùng AI sinh toàn bộ bộ ảnh minh họa theo phong cách thống nhất (VD: *3D Isometric*, *Editorial Flat Illustration*, *Minimalist Photography*, *Pastel Aesthetic* hợp với màu Canva).

---

## 3. Kiến trúc thư mục chuẩn (Next.js App Router)
Tất cả 5 AI Agents phải tuân thủ nghiêm ngặt cấu trúc thư mục sau để ghép nối code trơn tru:

~~~text
portfolio-factory/
├── references/                         # Chứa ảnh UI mẫu, kết quả scrape từ link Canva & file .docx mẫu
│   ├── ui-target.png                   # Ảnh giao diện mẫu
│   ├── sample-assignments.docx         # File .docx bài tập mẫu để test
│   └── canva-tuthivananh/              # Dữ liệu DOM, screenshots & styles trích xuất tự động
├── public/
│   └── uploads/                        # Lưu trữ ảnh bóc tách từ .docx & ảnh do AI generate
│       ├── docx-media/
│       └── ai-generated/
├── src/
│   ├── schema/                         # [AGENT 1] Zod Schema cho Portfolio, DOCX Ingestion & AI Image
│   ├── scripts/                        # [AGENT 1] Script Playwright trích xuất Canva & tạo DOCX mẫu
│   ├── engine/                         # [AGENT 2] Bộ máy render JSON -> React Components
│   ├── templates/                      # [AGENT 2] 6 bộ Template + Section Blocks hiển thị bài tập
│   ├── app/
│   │   ├── studio/                     # [AGENT 3] Giao diện chỉnh sửa, nạp DOCX & nút Gen ảnh AI
│   │   ├── batch/                      # [AGENT 4] Giao diện sản xuất hàng loạt từ nhiều file DOCX/CSV
│   │   ├── api/
│   │   │   ├── docx-ingest/            # [AGENT 4] API bóc tách file .docx (chữ + ảnh nhúng)
│   │   │   ├── ai/summarize/           # [AGENT 4] API tóm tắt bài tập -> cấu trúc Portfolio
│   │   │   ├── ai/generate-image/      # [AGENT 4] API sinh ảnh AI theo chủ đề bài tập
│   │   │   └── export/                 # [AGENT 5] API xuất ZIP HTML tĩnh, PDF, Public URL
│   │   └── [portfolioSlug]/            # [AGENT 5] Trang hiển thị Public Portfolio (VD: /tuthivananhportfolio)
│   ├── services/
│   │   ├── docx/                       # [AGENT 4] Bộ giải nén .docx (mammoth + jszip) lấy text & media
│   │   ├── ai/                         # [AGENT 4] LLM Summarizer + AI Image Generator Service
│   │   └── export/                     # [AGENT 5] Đóng gói toàn bộ HTML + ảnh DOCX/AI thành file .zip
│   └── store/                          # [AGENT 3] Zustand state quản lý Studio & trạng thái gen ảnh
└── tests/                              # [AGENT 5] Playwright E2E test luồng Nạp DOCX -> Tóm tắt -> Xuất bản
~~~

---

## 4. Quy trình phối hợp 5 AI Agents (Orchestration Workflow)
Khi ném vào **Antigravity** hoặc **CLI Code Agent**, hãy thực thi theo thứ tự:

1. **`01_AGENT_EXTRACTOR_AND_SCHEMA.md` (Chạy đầu tiên)**:
   - Trích xuất mẫu từ `https://tntlab.my.canva.site/tuthivananhportfolio/`.
   - Khởi tạo `PortfolioDocumentSchema` và `DocxIngestionSchema` (hỗ trợ lưu trữ cả thông tin bài tập gốc, bản tóm tắt AI, danh sách ảnh trích xuất từ `.docx` và câu lệnh prompt tạo ảnh AI).
2. **`02_AGENT_TEMPLATE_ENGINE_AND_BLOCKS.md`**:
   - Xây dựng 6 Archetype Templates (đặc biệt là `canva-editorial`) và các Section Blocks tối ưu cho việc trình bày **Bài tập đã tóm tắt (Summarized Assignments)** kèm Modal xem chi tiết bài tập.
3. **`03_AGENT_STUDIO_BUILDER_UI.md`**:
   - Xây dựng giao diện Studio có **Trình nạp file `.docx` bài tập (DOCX Dropzone Wizard)** và bảng điều khiển hình ảnh cho phép bấm 1 nút để chuyển đổi giữa *"Ảnh gốc trong file Word"* và *"Tạo ảnh AI mới theo chủ đề"*.
4. **`04_AGENT_AI_PIPELINE_AND_MASS_GEN.md`**:
   - Xây dựng lõi bóc tách file `.docx` (`jszip` + `mammoth`), AI tóm tắt nội dung bài tập thành Portfolio, dịch vụ tạo ảnh AI theo chủ đề, và chế độ sản xuất hàng loạt từ nhiều file `.docx`.
5. **`05_AGENT_EXPORT_DEPLOY_AND_QA.md`**:
   - Xây dựng trang Public `/[portfolioSlug]`, bộ xuất gói `.zip` tĩnh nhúng sẵn toàn bộ ảnh (cả ảnh lấy từ `.docx` lẫn ảnh AI), và bộ test tự động.

---

## 5. Luật Bất Khả Xâm Phạm cho mọi AI Agent (Global Guardrails)
1. **Single Source of Truth**: Mọi Agent bắt buộc import types từ `src/schema/portfolio.schema.ts`.
2. **Bảo toàn ảnh từ `.docx` và tính sẵn sàng của AI Image**:
   - Khi bóc ảnh từ `.docx`, phải chuyển thành file lưu trong `public/uploads/docx-media/` (hoặc Data URL chuẩn) để hiển thị ngay trên giao diện và xuất ra `.zip` không bị lỗi ảnh chết (broken image).
   - Tính năng **Gen ảnh bằng AI** phải hỗ trợ cả API có key (Gemini Imagen / OpenAI DALL-E) **VÀ tích hợp sẵn luồng tạo ảnh AI miễn phí không cần API Key** (qua Pollinations.ai Flux/Turbo endpoint kèm seed cố định theo chủ đề) để ứng dụng chạy ra ảnh AI thật 100% ngay lập tức khi test.
3. **Không làm mất ngữ cảnh bài tập**: Một file `.docx` có thể chứa **1 bài tập lớn** hoặc **nhiều bài tập nhỏ (Bài 1, Bài 2, Bài 3...)**. Bộ parser phải tự động tách từng bài tập thành từng thẻ Project riêng biệt trên Portfolio.