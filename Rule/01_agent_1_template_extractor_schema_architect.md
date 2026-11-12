# AGENT 1: TEMPLATE EXTRACTOR, DOCX SCHEMA & DATA ARCHITECT

## 1. Vai trò (Role)
Bạn là **Lead Data & Visual Reverse-Engineering Architect**. Nhiệm vụ của bạn là:
1. Dùng Playwright truy cập trang mẫu `https://tntlab.my.canva.site/tuthivananhportfolio/` (và đọc ảnh giao diện trong `/references/` nếu có) để trích xuất hệ thống Design Tokens và bố cục chuẩn.
2. Thiết kế bộ **Universal Portfolio & DOCX Assignment Schema** (`Zod` + `TypeScript`) phục vụ cho luồng: **Nhận file `.docx` bài tập -> Bóc chữ & ảnh -> AI tóm tắt -> Tạo ảnh AI theo chủ đề -> Render Portfolio**.
3. Viết script tạo sẵn dữ liệu mẫu (`tuthivananh-sample.json`) và 1 file `.docx` bài tập mẫu (`references/sample-assignments.docx`) để các Agent sau có dữ liệu thật kiểm thử.

---

## 2. Phạm vi file được phép thao tác (Allowed File Scope)
Bạn **CHỈ ĐƯỢC PHÉP** tạo và chỉnh sửa các file trong phạm vi sau:
- `src/schema/portfolio.schema.ts`
- `src/schema/docx-ingestion.schema.ts`
- `src/schema/theme.schema.ts`
- `src/scripts/extract-canva-template.ts`
- `src/scripts/generate-sample-docx.ts`
- `src/data/presets/tuthivananh-sample.json`
- `references/canva-tuthivananh/*`
- `references/sample-assignments.docx`

**NGHIÊM CẤM**: Không chỉnh sửa các thư mục `src/app/`, `src/templates/`, hay `src/services/`.

---

## 3. Chi tiết công việc cần thực hiện (Detailed Tasks)

### Task 1.1: Trích xuất mẫu từ Canva SPA (`src/scripts/extract-canva-template.ts`)
Trang `https://tntlab.my.canva.site/tuthivananhportfolio/` là Canva SPA render bằng client-side JS. Hãy viết script Playwright:
1. Mở trang ở chế độ Desktop (`1440x900`) và Mobile (`390x844`), đợi `networkidle` và cuộn hết trang để tải toàn bộ hình ảnh.
2. Chụp ảnh màn hình toàn trang và từng slide lưu vào `references/canva-tuthivananh/`.
3. Trích xuất bảng màu, font chữ tiếng Việt, cấu trúc từng phần (Hero bìa tạp chí, Giới thiệu, Kỹ năng, Các bài tập/dự án thực hành, Liên hệ).

### Task 1.2: Định nghĩa Schema cho Portfolio & Bài tập `.docx` (`src/schema/portfolio.schema.ts`)
Thiết kế Schema bằng `zod` hỗ trợ lưu trữ bài tập đã tóm tắt và quản lý nguồn ảnh (ảnh trích từ `.docx` hoặc ảnh do AI sinh):

~~~typescript
import { z } from 'zod';

// Nguồn gốc hình ảnh trong từng bài tập/dự án
export const ProjectMediaItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
  sourceType: z.enum(['docx-extracted', 'ai-generated', 'user-uploaded']),
  aiPromptUsed: z.string().optional(), // Lưu lại prompt đã dùng nếu ảnh được gen bằng AI
  originalDocxMediaName: z.string().optional(), // VD: "word/media/image1.png"
});

export const VisualDecorationSchema = z.object({
  id: z.string(),
  type: z.enum(['badge', 'sticker', 'shape', 'frame', 'floating-tag', 'grid-pattern']),
  assetUrl: z.string().optional(),
  label: z.string().optional(),
  position: z.object({
    top: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    rotate: z.number().default(0),
    zIndex: z.number().default(1),
  }),
});

export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  variant: z.enum(['canva-cover', 'split-modern', 'bento-intro', 'minimal-center', 'editorial-magazine']),
  headline: z.string(), // VD: "PORTFOLIO"
  fullName: z.string(), // VD: "Từ Thị Vân Anh"
  roleTitle: z.string(),
  shortBio: z.string(),
  avatar: z.object({
    url: z.string(),
    sourceType: z.enum(['docx-extracted', 'ai-generated', 'user-uploaded']).default('user-uploaded'),
    frameStyle: z.enum(['cutout-blob', 'arch-window', 'polaroid', 'circle', 'rounded-rect', 'none']),
    aspectRatio: z.string().default('3/4'),
  }),
  quickTags: z.array(z.string()),
  ctaButtons: z.array(z.object({
    label: z.string(),
    href: z.string(),
    style: z.enum(['primary', 'secondary', 'outline']),
  })),
  decorations: z.array(VisualDecorationSchema).default([]),
});

export const AboutSectionSchema = z.object({
  type: z.literal('about'),
  variant: z.enum(['story-card', 'two-column-bio', 'bento-facts']),
  title: z.string(),
  biography: z.string(),
  highlights: z.array(z.object({ label: z.string(), value: z.string() })),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    socials: z.array(z.object({ platform: z.string(), url: z.string() })),
  }),
});

export const SkillsSectionSchema = z.object({
  type: z.literal('skills'),
  variant: z.enum(['icon-badges', 'progress-bars', 'category-cards', 'canva-visual-grid']),
  title: z.string(),
  categories: z.array(z.object({
    name: z.string(),
    skills: z.array(z.object({
      name: z.string(),
      level: z.number().min(0).max(100).optional(),
      iconUrl: z.string().optional(),
    })),
  })),
});

export const ExperienceTimelineSectionSchema = z.object({
  type: z.literal('experience'),
  variant: z.enum(['vertical-timeline', 'canva-cards', 'compact-list']),
  title: z.string(),
  items: z.array(z.object({
    id: z.string(),
    role: z.string(),
    organization: z.string(),
    period: z.string(),
    description: z.string(),
    achievements: z.array(z.string()),
  })),
});

export const EducationSectionSchema = z.object({
  type: z.literal('education'),
  title: z.string(),
  items: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    period: z.string(),
    gpaOrHonors: z.string().optional(),
    details: z.string().optional(),
  })),
});

// Section quan trọng nhất: Trưng bày các Bài tập / Dự án đã được AI tóm tắt từ file .docx
export const ProjectsSectionSchema = z.object({
  type: z.literal('projects'),
  variant: z.enum(['canva-slide-showcase', 'masonry-gallery', 'case-study-cards', 'bento-projects']),
  title: z.string(),
  subtitle: z.string().optional(),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string(),                     // Tiêu đề bài tập/dự án đã được AI đặt lại hấp dẫn
    category: z.string(),                  // Chủ đề / Môn học / Kỹ năng chính
    sourceDocxFileName: z.string().optional(), // Tên file .docx gốc
    assignmentBrief: z.string().optional(),// Tóm tắt Đề bài / Yêu cầu bài tập
    summary: z.string(),                   // Tóm tắt Giải pháp & Nội dung thực hiện
    keyTakeaways: z.array(z.string()).default([]), // Các điểm chính rút ra từ bài tập
    fullRawExcerpt: z.string().optional(), // Nội dung chi tiết để mở xem trong Modal nếu muốn
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    media: z.array(ProjectMediaItemSchema).default([]), // Danh sách ảnh (từ .docx hoặc AI gen)
    suggestedAiImagePrompt: z.string(),    // Prompt tiếng Anh chuẩn bị sẵn theo chủ đề bài tập để gen ảnh AI bất cứ lúc nào
    preferredImageStyle: z.enum(['editorial-illustration', '3d-render', 'minimal-photo', 'canva-pastel-graphic']).default('canva-pastel-graphic'),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    tags: z.array(z.string()),
  })),
});

export const ContactSectionSchema = z.object({
  type: z.literal('contact'),
  title: z.string(),
  subtitle: z.string(),
  thankYouMessage: z.string().default('THANK YOU FOR WATCHING!'),
  showContactForm: z.boolean().default(true),
});

export const PortfolioSectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  AboutSectionSchema,
  ExperienceTimelineSectionSchema,
  EducationSectionSchema,
  SkillsSectionSchema,
  ProjectsSectionSchema,
  ContactSectionSchema,
]);

export const PortfolioDocumentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  templateId: z.enum([
    'canva-editorial',
    'bento-grid',
    'framer-minimal',
    'creative-showcase',
    'growth-marketer',
    'tech-developer',
  ]),
  imageGenerationConfig: z.object({
    mode: z.enum(['docx-extract', 'hybrid-auto', 'ai-generate-all']).default('hybrid-auto'),
    visualStyle: z.enum(['editorial-illustration', '3d-render', 'minimal-photo', 'canva-pastel-graphic']).default('canva-pastel-graphic'),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    ogImage: z.string().optional(),
  }),
  theme: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    backgroundColor: z.string(),
    surfaceColor: z.string(),
    textColor: z.string(),
    headingFont: z.string(),
    bodyFont: z.string(),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    pageTransition: z.enum(['slide-deck', 'smooth-scroll', 'fade']),
  }),
  sections: z.array(PortfolioSectionSchema),
});

export type PortfolioDocument = z.infer<typeof PortfolioDocumentSchema>;
export type ProjectMediaItem = z.infer<typeof ProjectMediaItemSchema>;
~~~

### Task 1.3: Định nghĩa Schema Bóc tách `.docx` (`src/schema/docx-ingestion.schema.ts`)
Định nghĩa cấu trúc trung gian khi mới đọc file `.docx` xong (trước khi đưa qua AI tóm tắt):
- `RawDocxExtractionResultSchema`:
  - `fileName`: Tên file `.docx`
  - `rawText`: Toàn bộ văn bản
  - `htmlPreview`: HTML xuất từ `mammoth` (giữ được thẻ `<h1>`, `<h2>`, `<p>`, `<table>`, `<img>`)
  - `extractedImages`: Mảng các ảnh bóc được từ `word/media/*` (gồm `id`, `savedUrl`, `mimeType`, `surroundingTextContext` - đoạn văn bản nằm ngay gần bức ảnh đó trong file Word để biết ảnh thuộc bài tập nào).
  - `detectedAssignments`: Mảng các bài tập được tách sơ bộ.

### Task 1.4: Tạo File `.docx` Bài tập Mẫu (`src/scripts/generate-sample-docx.ts`)
Viết một script nhỏ tạo file `references/sample-assignments.docx` chứa 3 bài tập thực hành mẫu (trong đó 2 bài tập có nhúng sẵn hình ảnh và 1 bài tập chỉ có văn bản để test tính năng tự động tạo ảnh bằng AI theo chủ đề).

---

## 4. Tiêu chuẩn nghiệm thu (Definition of Done)
- [ ] `PortfolioDocumentSchema` và `DocxIngestionSchema` biên dịch hoàn hảo (`tsc --noEmit`).
- [ ] Có sẵn file `references/sample-assignments.docx` và `src/data/presets/tuthivananh-sample.json` hợp lệ.