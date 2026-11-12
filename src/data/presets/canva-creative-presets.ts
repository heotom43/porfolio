import type {
  PortfolioDocument,
  TemplateId,
} from '@/schema/portfolio.schema';

/**
 * Pre-configured Canva Creative Preset Documents matching the 6 empirical reference sites:
 * 1. Dương Thu Trang (Warm Editorial / Slate & Linen)
 * 2. Đinh Hồng Quyên (Bold Creative / Rosewater & Prussian Cocoa)
 * 3. Nguyễn Thị Ngọc Mai (Minimalist Chic / Marine & Buttercream)
 * 4. Lương Thị Bảo Châm (Vibrant Student / Indigo & Buttercream)
 * 5. Ngô Thị Huệ (Artistic Organic / Peach Glow & Burgundy)
 * 6. Võ Thị Hoài (Structured Academic / Brick Crimson & Chalk Stone)
 */

export const THU_TRANG_PORTFOLIO_DOC: PortfolioDocument = {
  id: 'canva-thu-trang-warm-editorial',
  slug: 'thu-trang',
  templateId: 'warm-editorial',
  imageGenerationConfig: {
    mode: 'hybrid-auto',
    visualStyle: 'editorial-illustration',
  },
  seo: {
    title: 'Dương Thu Trang | Digital Portfolio 2026',
    description:
      'Hồ sơ học tập và sản phẩm số của Dương Thu Trang - Sư phạm Ngữ văn & Giáo dục Khai phóng, môn INF2501.',
    ogImage: '/presets/avatar-thutrang.svg',
  },
  theme: {
    primaryColor: '#326586',
    secondaryColor: '#F4E9D4',
    backgroundColor: '#F0EFE2',
    surfaceColor: '#FFFFFF',
    textColor: '#1C1412',
    headingFont: 'Playfair Display',
    bodyFont: 'Be Vietnam Pro',
    borderRadius: 'lg',
    pageTransition: 'slide-deck',
    effects: {
      enableFloat: true,
      enableGlow: false,
      enableTilt: false,
      enableSparkles: true,
      revealVariant: 'fade-up',
      enableParallax: false,
    },
    backgroundIllustration: {
      mode: 'preset',
      presetId: 'canva-musical',
      opacity: 0.12,
      blur: 0,
      position: 'cover',
    },
  },
  profileOwner: {
    fullName: 'Dương Thu Trang',
    roleTitle: 'Sư phạm Ngữ văn & Giáo dục Khai phóng',
    avatarUrl: '/presets/avatar-thutrang.svg',
    avatarSourceType: 'user-uploaded',
    frameStyle: 'arch-window',
    aspectRatio: '3/4',
    bioSnippet:
      'Xin chào! Mình là Dương Thu Trang. Đam mê văn học, nghệ thuật sư phạm và ứng dụng công nghệ AI tạo sinh trong giáo dục hiện đại.',
    learningGoals:
      'Làm chủ công nghệ số, xây dựng hệ thống học liệu mở và vận dụng AI có trách nhiệm vào giảng dạy văn học.',
    portfolioObjective:
      'Hệ thống hóa toàn bộ các bài tập thực hành, minh chứng năng lực và tiến trình học phần INF2501 đạt chuẩn xuất sắc.',
    introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  sections: [
    {
      type: 'hero',
      variant: 'editorial-asymmetric',
      headline: 'Digital Portfolio',
      fullName: 'Dương Thu Trang',
      roleTitle: 'Sư phạm Ngữ văn & Giáo dục Khai phóng • ĐH Sư phạm Hà Nội',
      shortBio:
        'Xin chào! Mình là Dương Thu Trang. Mình yêu thích ngôn ngữ, giáo dục và mong muốn kết nối tri thức nhân loại thông qua công nghệ trí tuệ nhân tạo.',
      avatar: {
        url: '/presets/avatar-thutrang.svg',
        sourceType: 'user-uploaded',
        frameStyle: 'arch-window',
        aspectRatio: '3/4',
      },
      quickTags: ['Đi bộ', 'Nghe nhạc', 'Đọc sách', 'Viết prompt AI'],
      ctaButtons: [
        { label: 'Khám phá Dự án', href: '#projects', style: 'primary' },
        { label: 'Liên hệ', href: '#contact', style: 'outline' },
      ],
      decorations: [
        {
          id: 'dec-tt-1',
          type: 'floating-tag',
          label: 'LET’S WORK TOGETHER !',
          position: { top: '8%', right: '6%', rotate: 3, zIndex: 3 },
        },
        {
          id: 'dec-tt-2',
          type: 'badge',
          label: '✦ DUONG THU TRANG 2026',
          position: { bottom: '10%', left: '5%', rotate: -2, zIndex: 3 },
        },
      ],
    },
    {
      type: 'about',
      variant: 'cards',
      title: 'Về bản thân',
      biography:
        'Mình tin rằng việc kết hợp giữa vẻ đẹp sâu sắc của văn học truyền thống với sức mạnh tính toán của AI sẽ tạo ra một môi trường học tập gợi mở, giàu cảm xúc và truyền cảm hứng bất tận cho học sinh thế hệ mới.',
      learningGoals:
        'Hoàn thiện kỹ năng phân tích dữ liệu giáo dục và sử dụng thành thạo các mô hình ngôn ngữ lớn để hỗ trợ soạn giảng.',
      portfolioObjective:
        'Minh chứng rõ ràng cho tiến trình học tập liên tục, sáng tạo và tuân thủ liêm chính học thuật.',
      introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      highlights: [
        { label: 'Học phần', value: 'INF2501' },
        { label: 'Điểm chuyên cần', value: '10.0' },
        { label: 'Dự án hoàn thành', value: '6/6' },
        { label: 'Mức đánh giá', value: 'Xuất sắc' },
      ],
      contactInfo: {
        email: 'thutrang.duong@hnue.edu.vn',
        phone: '0988 123 456',
        location: 'Cầu Giấy, Hà Nội',
        website: 'https://lttm.my.canva.site/thu-trang',
        socials: [
          { platform: 'Canva', url: 'https://lttm.my.canva.site/thu-trang' },
          { platform: 'LinkedIn', url: 'https://linkedin.com' },
        ],
      },
    },
    {
      type: 'skills',
      variant: 'category-cards',
      title: 'Kỹ năng & Năng lực số',
      categories: [
        {
          name: 'Năng lực AI Sư phạm',
          skills: [
            { name: 'Prompt Engineering (C-R-E-A-T-E Framework)', level: 95 },
            { name: 'Khai thác LLM (ChatGPT-4o, Claude 3.5, Gemini)', level: 92 },
            { name: 'So sánh & Đánh giá Chất lượng Output AI', level: 90 },
          ],
        },
        {
          name: 'Công nghệ & Phương tiện Số',
          skills: [
            { name: 'Quản trị Tệp & Thư mục Chuẩn', level: 96 },
            { name: 'Tra cứu Học thuật Google Scholar & Trích dẫn APA', level: 94 },
            { name: 'Thiết kế Trực quan Canva Education', level: 98 },
          ],
        },
      ],
    },
    {
      type: 'projects',
      variant: 'grid',
      title: 'Dự án & Bài tập Thực hành',
      subtitle: 'Hệ thống bài tập môn INF2501 đạt chuẩn Rubric Xuất Sắc',
      detailViewMode: 'dedicated-route',
      navigationLoop: true,
      projects: [
        {
          id: 'tt-proj-1',
          slug: 'quan-tri-tep-hoc-thuat',
          title: '01. Làm chủ File Explorer & Tìm kiếm Học thuật',
          category: 'Quản trị Số & Học liệu',
          chapterTitle: 'Chương 1: Không gian Làm việc Số & Quản trị Tệp',
          exerciseNumber: 'Bài tập 1 (mục 1.2)',
          academicIntegrityNote:
            'Tự thực hiện cấu trúc cây thư mục 3 cấp, tra cứu 5 nguồn Google Scholar có trích dẫn APA chuẩn xác.',
          productType: 'folder-tree',
          assignmentBrief:
            'Tổ chức cây thư mục môn học, tìm kiếm tài liệu học thuật theo từ khóa khoanh vùng và lập ma trận trích dẫn APA.',
          summary:
            'Xây dựng hệ thống phân loại tệp khoa học 3 tầng, thu thập 5 bài báo khoa học giáo dục và chuẩn hóa danh mục tài liệu tham khảo.',
          keyTakeaways: [
            'Khoanh vùng từ khóa chính xác giúp tăng 70% độ chính xác kết quả',
            'Quy ước đặt tên tệp chuẩn [Nam_Mon_ChuDe_Ver] tránh thất lạc',
            'Trích dẫn APA tự động bằng Google Scholar tiết kiệm thời gian',
          ],
          metrics: [
            { label: 'Tài liệu chuẩn hóa', value: '5 bài báo' },
            { label: 'Cấp thư mục', value: '3 tầng' },
            { label: 'Độ chính xác APA', value: '100%' },
          ],
          media: [
            {
              id: 'tt-m-1',
              url: '/presets/assignment-research.svg',
              caption: 'Sơ đồ cây thư mục học phần và bảng trích dẫn học thuật APA',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Minimalist academic folder tree organization, warm linen paper aesthetic, pastel illustration',
          preferredImageStyle: 'editorial-illustration',
          links: [],
          tags: ['File Explorer', 'Google Scholar', 'APA Trích dẫn', 'INF2501'],
        },
        {
          id: 'tt-proj-2',
          slug: 'thiet-ke-prompt-ai-su-pham',
          title: '02. Kỹ thuật Viết Prompt AI Đa tầng cho Giảng dạy',
          category: 'Trí tuệ Nhân tạo',
          chapterTitle: 'Chương 3: Kỹ thuật Viết Prompt & Khai thác LLM',
          exerciseNumber: 'Bài tập 2 (mục 3.4)',
          academicIntegrityNote:
            'Thử nghiệm so sánh prompt trên cả 2 mô hình ChatGPT-4o và Claude 3.5 Sonnet, có bảng đối sánh rõ ràng.',
          productType: 'prompt-comparison',
          promptComparison: {
            initialPrompt: 'Hãy viết giáo án phân tích bài thơ Sóng của Xuân Quỳnh.',
            improvedPrompt:
              'Đóng vai trò là chuyên gia giáo dục Ngữ văn THPT, hãy thiết kế kế hoạch bài dạy 45 phút cho tác phẩm "Sóng" theo công văn 5512, tích hợp hoạt động ứng dụng AI hỗ trợ học sinh cảm thụ hình tượng sóng và em.',
            aiOutput:
              'Kế hoạch bài dạy chi tiết với mục tiêu năng lực, chuỗi hoạt động 4 bước và phiếu học tập tích hợp công nghệ.',
          },
          summary:
            'Áp dụng khung C-R-E-A-T-E để nâng cấp prompt thô thành prompt sư phạm chuyên sâu, kiểm chứng tính chính xác nội dung.',
          keyTakeaways: [
            'Cung cấp ngữ cảnh Role và Task cụ thể cải thiện rõ rệt chất lượng',
            'Kiểm tra chéo fact-checking với sách giáo khoa để tránh ảo giác AI',
          ],
          metrics: [
            { label: 'Mức tăng độ sâu', value: '+85%' },
            { label: 'Mô hình kiểm chứng', value: '2 LLMs' },
          ],
          media: [
            {
              id: 'tt-m-2',
              url: '/presets/assignment-prompt.svg',
              caption: 'Bảng đối sánh Prompt Thô vs Prompt Tối ưu hóa',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Editorial comparison chart between raw and enhanced prompts, slate blue and cream sand aesthetic',
          preferredImageStyle: 'editorial-illustration',
          links: [],
          tags: ['Prompt Engineering', 'Role-Task-Context', 'Claude 3.5', 'ChatGPT'],
        },
        {
          id: 'tt-proj-3',
          slug: 'quy-tac-ai-co-trach-nhiem',
          title: '03. Xây dựng Bản Quy tắc Ứng xử AI có Trách nhiệm',
          category: 'Đạo đức & Liêm chính',
          chapterTitle: 'Chương 2: Đạo đức AI & Trách nhiệm Số trong Giáo dục',
          exerciseNumber: 'Bài tập 3 (mục 2.3)',
          academicIntegrityNote:
            'Sản phẩm tự soạn thảo dựa trên khung UNESCO và hướng dẫn liêm chính học thuật ĐH Sư phạm.',
          productType: 'responsible-ai-rules',
          summary:
            'Xây dựng 5 nguyên tắc vàng khi ứng dụng AI trong học tập và nghiên cứu: Minh bạch, Tôn trọng bản quyền, Kiểm chứng đa nguồn.',
          keyTakeaways: [
            'Luôn khai báo công cụ AI đã sử dụng và mục đích hỗ trợ',
            'Không nộp trực tiếp nội dung do AI tạo ra mà thiếu sự biên tập',
          ],
          metrics: [
            { label: 'Nguyên tắc cốt lõi', value: '5 điều' },
            { label: 'Độ minh bạch', value: '100%' },
          ],
          media: [
            {
              id: 'tt-m-3',
              url: '/presets/assignment-ethics.svg',
              caption: 'Poster 5 nguyên tắc vàng liêm chính học thuật trong kỷ nguyên AI',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Academic integrity poster with parchment paper and slate accents, elegant typographic rules',
          preferredImageStyle: 'editorial-illustration',
          links: [],
          tags: ['Đạo đức AI', 'Liêm chính học thuật', 'UNESCO', 'INF2501'],
        },
      ],
    },
    {
      type: 'contact',
      variant: 'full-banner',
      title: 'Lời kết & Khai báo Liêm chính',
      subtitle: 'Cảm ơn Thầy Cô và các bạn đã dành thời gian theo dõi Digital Portfolio!',
      thankYouMessage: 'L E T ’ S   W O R K   T O G E T H E R   !',
      showContactForm: true,
      courseInfo: {
        courseCode: 'INF2501',
        courseName: 'Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo',
        institution: 'Trường ĐH Sư phạm Hà Nội (HNUE)',
        studentClass: 'K72A - Sư phạm Ngữ văn',
        studentId: '725102088',
        studentName: 'Dương Thu Trang',
      },
      aiToolsDeclaration: [
        {
          toolName: 'ChatGPT-4o',
          purpose: 'Gợi ý ý tưởng kế hoạch bài dạy và cấu trúc khung đề mục',
          academicIntegrityDeclaration:
            'Mọi nội dung đều được đối chiếu sách giáo khoa và viết lại hoàn toàn theo ngôn phong sư phạm.',
        },
        {
          toolName: 'Canva Pro',
          purpose: 'Thiết kế slide báo cáo và định dạng các infographic minh họa',
          academicIntegrityDeclaration:
            'Sử dụng tài nguyên đồ họa bản quyền giáo dục hợp pháp.',
        },
      ],
      personalReflection: {
        experienceAndFeeling:
          'Học phần INF2501 đã mở ra cho em một chân trời mới về việc làm chủ công nghệ thay vì e ngại bị AI thay thế.',
        knowledgeAndSkills:
          'Em đã nắm vững quy trình kiểm chứng thông tin, thiết kế prompt đa bước và xây dựng portfolio học tập số chuẩn hóa.',
        keyTakeawaysAndChallenges:
          'Thách thức lớn nhất là duy trì liêm chính học thuật và bảo tồn bản sắc cá nhân trong từng sản phẩm sáng tạo.',
      },
    },
  ],
};

export const HONG_QUYEN_PORTFOLIO_DOC: PortfolioDocument = {
  id: 'canva-hq-creative-bold',
  slug: 'hq',
  templateId: 'creative-bold',
  imageGenerationConfig: {
    mode: 'hybrid-auto',
    visualStyle: 'canva-pastel-graphic',
  },
  seo: {
    title: 'Đinh Hồng Quyên | Creative Educator Portfolio 2026',
    description:
      'Portfolio sáng tạo của Đinh Hồng Quyên - Khoa học Giáo dục & Đổi mới Đào tạo số, môn INF2501.',
    ogImage: '/presets/avatar-hongquyen.svg',
  },
  theme: {
    primaryColor: '#92736C',
    secondaryColor: '#304254',
    backgroundColor: '#FDF1F5',
    surfaceColor: '#FFFFFF',
    textColor: '#304254',
    headingFont: 'Playfair Display',
    bodyFont: 'Be Vietnam Pro',
    borderRadius: 'lg',
    pageTransition: 'slide-deck',
    effects: {
      enableFloat: true,
      enableGlow: true,
      enableTilt: true,
      enableSparkles: true,
      revealVariant: 'zoom-in',
      enableParallax: false,
    },
    backgroundIllustration: {
      mode: 'preset',
      presetId: 'abstract-blobs',
      opacity: 0.15,
      blur: 0,
      position: 'cover',
    },
  },
  profileOwner: {
    fullName: 'Đinh Hồng Quyên',
    roleTitle: 'Khoa học Giáo dục & Đổi mới Công nghệ',
    avatarUrl: '/presets/avatar-hongquyen.svg',
    avatarSourceType: 'user-uploaded',
    frameStyle: 'polaroid',
    aspectRatio: '3/4',
    bioSnippet:
      'Xin chào, tôi là Quyên – ngành Khoa học giáo dục. Đam mê thiết kế trải nghiệm học tập số năng động, kết hợp công cụ sáng tạo đa phương tiện.',
    learningGoals:
      'Nâng cao năng lực ứng dụng AI vào thiết kế đồ họa giáo dục và xây dựng bài giảng tương tác đa phương tiện.',
    portfolioObjective:
      'Lưu giữ và chia sẻ hành trình thực hành học phần INF2501 với các sản phẩm sáng tạo nổi bật.',
  },
  sections: [
    {
      type: 'hero',
      variant: 'split-left',
      headline: 'Creative Portfolio',
      fullName: 'Đinh Hồng Quyên',
      roleTitle: 'Educator & Creative Designer • Khoa học Giáo dục',
      shortBio:
        'Xin chào, tôi là Quyên – ngành Khoa học giáo dục. Ghi lại hành trình đổi mới công nghệ đào tạo và xây dựng sản phẩm học tập số mang đậm dấu ấn cá nhân.',
      avatar: {
        url: '/presets/avatar-hongquyen.svg',
        sourceType: 'user-uploaded',
        frameStyle: 'polaroid',
        aspectRatio: '3/4',
      },
      quickTags: ['Canva', 'AI Design', 'Khoa học GD', 'Đổi mới'],
      ctaButtons: [
        { label: 'Dự án Sáng tạo', href: '#projects', style: 'primary' },
        { label: 'Thông tin Liên hệ', href: '#contact', style: 'secondary' },
      ],
      decorations: [
        {
          id: 'dec-hq-1',
          type: 'sticker',
          label: '>>> QUYEN HERE !!! >>>',
          position: { top: '6%', left: '4%', rotate: -3, zIndex: 4 },
        },
        {
          id: 'dec-hq-2',
          type: 'badge',
          label: '2 0 2 6  EDUCATOR',
          position: { bottom: '12%', right: '5%', rotate: 2, zIndex: 3 },
        },
      ],
    },
    {
      type: 'about',
      variant: 'cards',
      title: 'About Me',
      biography:
        'Với nền tảng khoa học giáo dục vững chắc kết hợp cùng kỹ năng thiết kế trực quan, mình tin rằng mỗi sản phẩm học tập số phải là một tác phẩm nghệ thuật truyền cảm hứng.',
      learningGoals:
        'Thành thạo quy trình sáng tạo số từ lên ý tưởng, tinh chỉnh prompt đến sản xuất sản phẩm hoàn chỉnh.',
      portfolioObjective:
        'Trình bày minh chứng đánh giá học phần INF2501 theo thang điểm xuất sắc có thưởng.',
      highlights: [
        { label: 'Chuyên ngành', value: 'Khoa học GD' },
        { label: 'Sản phẩm đa phương tiện', value: '8 sản phẩm' },
        { label: 'Công cụ thành thạo', value: 'Canva, PPT, AI' },
      ],
      contactInfo: {
        email: 'quyen.dinh@education.edu.vn',
        phone: '0971 888 999',
        location: 'Hà Nội',
        socials: [{ platform: 'Canva', url: 'https://lttm.my.canva.site/hq' }],
      },
    },
    {
      type: 'skills',
      variant: 'icon-badges',
      title: 'Công cụ & Kỹ năng Nổi bật',
      categories: [
        {
          name: 'Bộ công cụ Sáng tạo',
          skills: [
            { name: 'Canva Pro & Magic Studio', level: 98 },
            { name: 'Microsoft PowerPoint & Word Nâng cao', level: 95 },
            { name: 'Midjourney & Stable Diffusion', level: 88 },
          ],
        },
        {
          name: 'Năng lực Sư phạm Số',
          skills: [
            { name: 'Thiết kế Trải nghiệm Học tập (LX Design)', level: 90 },
            { name: 'Soạn giảng Tương tác Số', level: 94 },
          ],
        },
      ],
    },
    {
      type: 'projects',
      variant: 'staggered-cards',
      title: 'Dự án Tiêu biểu',
      subtitle: 'Các bài tập ứng dụng AI và công nghệ giáo dục sáng tạo',
      detailViewMode: 'dedicated-route',
      navigationLoop: true,
      projects: [
        {
          id: 'hq-proj-1',
          slug: 'moi-truong-hoc-tap-so',
          title: '01. Xây dựng Môi trường Học tập Số Tương tác',
          category: 'Thiết kế Bài giảng',
          chapterTitle: 'Chương 4: Nền tảng Đào tạo Trực tuyến',
          exerciseNumber: 'Bài tập 1 (mục 4.2)',
          academicIntegrityNote:
            'Tự thiết kế toàn bộ đồ họa trên Canva, nội dung bài học tự biên soạn.',
          productType: 'image',
          summary:
            'Bộ slide bài giảng trực quan hóa kiến thức tâm lý học lứa tuổi với phong cách thiết kế màu pastel trang nhã.',
          keyTakeaways: [
            'Màu sắc và khoảng trắng quyết định khả năng ghi nhớ của người học',
            'Sử dụng sticker và ribbon tăng mức độ tập trung',
          ],
          metrics: [
            { label: 'Slide tương tác', value: '24 trang' },
            { label: 'Đánh giá người học', value: '98% hài lòng' },
          ],
          media: [
            {
              id: 'hq-m-1',
              url: '/presets/assignment-creative.svg',
              caption: 'Giao diện khóa học trực tuyến màu sắc ấm áp',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Creative bold education slide with dusty rose and Prussian blue accents, playful badges',
          preferredImageStyle: 'canva-pastel-graphic',
          links: [],
          tags: ['Canva', 'PowerPoint', 'LX Design', 'INF2501'],
        },
      ],
    },
    {
      type: 'contact',
      variant: 'split-form',
      title: 'Kết nối & Hợp tác',
      subtitle: 'Cảm ơn Thầy Cô và các bạn đã xem hồ sơ năng lực số!',
      thankYouMessage: 'LET’S WORK TOGETHER !',
      showContactForm: true,
      courseInfo: {
        courseCode: 'INF2501',
        courseName: 'Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo',
        institution: 'Trường ĐH Sư phạm Nghệ thuật TW',
        studentClass: 'K18 - Khoa học Giáo dục',
        studentId: '185102009',
        studentName: 'Đinh Hồng Quyên',
      },
    },
  ],
};

export const NGOC_MAI_PORTFOLIO_DOC: PortfolioDocument = {
  id: 'canva-ngoc-mai-minimal-chic',
  slug: 'ngocmai',
  templateId: 'minimal-chic',
  imageGenerationConfig: {
    mode: 'hybrid-auto',
    visualStyle: 'minimal-photo',
  },
  seo: {
    title: 'Nguyễn Thị Ngọc Mai | Minimalist Portfolio 2026',
    description:
      'Portfolio tối giản thanh lịch của Nguyễn Thị Ngọc Mai - Giáo dục Tiểu học, học phần INF2501.',
    ogImage: '/presets/avatar-ngocmai.svg',
  },
  theme: {
    primaryColor: '#326586',
    secondaryColor: '#FFFCE2',
    backgroundColor: '#FFFCE2',
    surfaceColor: '#FFFFFF',
    textColor: '#326586',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Be Vietnam Pro',
    borderRadius: 'md',
    pageTransition: 'smooth-scroll',
    effects: {
      enableFloat: false,
      enableGlow: false,
      enableTilt: false,
      enableSparkles: false,
      revealVariant: 'slide-left',
      enableParallax: false,
    },
    backgroundIllustration: {
      mode: 'preset',
      presetId: 'minimalist-contour',
      opacity: 0.1,
      blur: 0,
      position: 'cover',
    },
  },
  profileOwner: {
    fullName: 'Nguyễn Thị Ngọc Mai',
    roleTitle: 'Giáo dục Tiểu học & Sư phạm Số',
    avatarUrl: '/presets/avatar-ngocmai.svg',
    avatarSourceType: 'user-uploaded',
    frameStyle: 'rounded-rect',
    aspectRatio: '4/5',
    bioSnippet:
      'Giáo dục tiểu học – Nuôi dưỡng tiềm năng thế hệ mầm non bằng sự chuẩn mực, yêu thương và công nghệ hiện đại.',
    learningGoals:
      'Vận dụng công nghệ số và AI để đơn giản hóa tài liệu sư phạm, tăng tính trực quan cho học sinh nhỏ tuổi.',
    portfolioObjective:
      'Tổng kết toàn diện năng lực số và phương pháp làm việc có tổ chức môn INF2501.',
  },
  sections: [
    {
      type: 'hero',
      variant: 'centered',
      headline: 'PORTFOLIO 2026',
      fullName: 'NGUYỄN THỊ NGỌC MAI',
      roleTitle: 'EDUCATOR • GIÁO DỤC TIỂU HỌC',
      shortBio:
        'Chào mừng đến với không gian số của Ngọc Mai. Nơi lưu giữ những bước tiến vững chắc trong việc đưa công nghệ số vào giảng dạy bậc tiểu học.',
      avatar: {
        url: '/presets/avatar-ngocmai.svg',
        sourceType: 'user-uploaded',
        frameStyle: 'rounded-rect',
        aspectRatio: '4/5',
      },
      quickTags: ['Tiểu học', 'Canva Pro', 'Tối giản', 'Google Workspace'],
      ctaButtons: [
        { label: 'Xem Hồ sơ Dự án', href: '#projects', style: 'primary' },
        { label: 'Liên hệ Trực tiếp', href: '#contact', style: 'outline' },
      ],
      decorations: [],
    },
    {
      type: 'about',
      variant: 'two-column-bio',
      title: 'Giới thiệu bản thân',
      biography:
        'Theo đuổi triết lý tối giản trong thiết kế và giảng dạy: thông tin rõ ràng, bố cục cân đối, mang lại trải nghiệm tiếp thu nhẹ nhàng và hiệu quả nhất.',
      highlights: [
        { label: 'Chuyên ngành', value: 'GD Tiểu học' },
        { label: 'Khu vực', value: 'Hà Nội' },
        { label: 'Kỹ năng số', value: 'AI & Office 365' },
      ],
      contactInfo: {
        email: 'ngmaiii0402@gmail.com',
        phone: '0977 917 220',
        location: 'Hà Nội',
        socials: [
          { platform: 'Canva', url: 'https://tntdesignlab.my.canva.site/ngocmai' },
        ],
      },
    },
    {
      type: 'skills',
      variant: 'canva-visual-grid',
      title: 'Bộ Công cụ Sư phạm Số',
      categories: [
        {
          name: 'Nền tảng & Ứng dụng',
          skills: [
            { name: 'AI Generator & LLMs', level: 90 },
            { name: 'Canva Pro Giáo dục', level: 96 },
            { name: 'Microsoft 365 & Google Workspace', level: 95 },
          ],
        },
      ],
    },
    {
      type: 'projects',
      variant: 'case-study-cards',
      title: 'Dự án Sư phạm',
      subtitle: 'Các bài tập thực hành ứng dụng công nghệ môn INF2501',
      detailViewMode: 'dedicated-route',
      navigationLoop: true,
      projects: [
        {
          id: 'nm-proj-1',
          slug: 'ung-dung-ai-tieu-hoc',
          title: 'Học liệu Số Trực quan cho Học sinh Lớp 1-2',
          category: 'Học liệu Sư phạm',
          chapterTitle: 'Chương 3: Trí tuệ Nhân tạo trong Soạn giảng',
          exerciseNumber: 'Bài tập 2',
          productType: 'image',
          summary:
            'Thiết kế chuỗi thẻ từ vựng minh họa bằng hình ảnh sinh động giúp học sinh tiếp thu từ ngữ nhanh chóng.',
          keyTakeaways: [
            'Hình ảnh rõ ràng, màu sắc hài hòa kích thích trí tò mò của trẻ',
            'Đơn giản hóa câu chữ giúp tối ưu hiệu quả tiếp nhận',
          ],
          metrics: [
            { label: 'Bộ thẻ từ', value: '50 thẻ' },
            { label: 'Tỉ lệ hiểu bài', value: '95%' },
          ],
          media: [
            {
              id: 'nm-m-1',
              url: '/presets/assignment-cards.svg',
              caption: 'Bộ thẻ học số hóa tối giản với tông màu xanh marine',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Minimalist Swiss grid educational cards, deep marine blue and warm buttercream custard background',
          preferredImageStyle: 'minimal-photo',
          links: [],
          tags: ['Học liệu số', 'Tiểu học', 'Canva', 'INF2501'],
        },
      ],
    },
    {
      type: 'contact',
      title: 'Liên hệ',
      subtitle: '0977 917 220 • ngmaiii0402@gmail.com • Hà Nội',
      thankYouMessage: 'CẢM ƠN QUÝ THẦY CÔ ĐÃ THEO DÕI!',
      showContactForm: true,
      courseInfo: {
        courseCode: 'INF2501',
        courseName: 'Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo',
        institution: 'Trường ĐH Sư phạm Nghệ thuật TW',
        studentName: 'Nguyễn Thị Ngọc Mai',
      },
    },
  ],
};

export const BAO_CHAM_PORTFOLIO_DOC: PortfolioDocument = {
  id: 'canva-bt-vibrant-student',
  slug: 'bt',
  templateId: 'vibrant-student',
  imageGenerationConfig: {
    mode: 'hybrid-auto',
    visualStyle: 'canva-pastel-graphic',
  },
  seo: {
    title: 'Lương Thị Bảo Châm | Medical Student Portfolio 2026',
    description:
      'Hồ sơ năng lực số của Lương Thị Bảo Châm - Y Đa khoa, ĐH Y Dược ĐHQGHN, học phần INF2501.',
    ogImage: '/presets/avatar-baocham.svg',
  },
  theme: {
    primaryColor: '#566E99',
    secondaryColor: '#FFFFFF',
    backgroundColor: '#FFFCE2',
    surfaceColor: '#FFFFFF',
    textColor: '#304254',
    headingFont: 'Playfair Display',
    bodyFont: 'Be Vietnam Pro',
    borderRadius: 'lg',
    pageTransition: 'slide-deck',
    effects: {
      enableFloat: true,
      enableGlow: false,
      enableTilt: true,
      enableSparkles: true,
      revealVariant: 'fade-up',
      enableParallax: false,
    },
    backgroundIllustration: {
      mode: 'preset',
      presetId: 'geometric-dots',
      opacity: 0.15,
      blur: 0,
      position: 'pattern-repeat',
    },
  },
  profileOwner: {
    fullName: 'Lương Thị Bảo Châm',
    roleTitle: 'Sinh viên Y Đa khoa • MSV: 25100237',
    avatarUrl: '/presets/avatar-baocham.svg',
    avatarSourceType: 'user-uploaded',
    frameStyle: 'circle',
    aspectRatio: '1/1',
    bioSnippet:
      'Y học là khoa học điều trị, nhưng cũng là nghệ thuật của sự thấu cảm. Ứng dụng công nghệ số và AI hỗ trợ nghiên cứu y sinh.',
    learningGoals:
      'Sử dụng AI tra cứu tài liệu y khoa PubMed, quản lý dữ liệu lâm sàng và xây dựng infographic truyền thông sức khỏe.',
    portfolioObjective:
      'Hồ sơ minh chứng quá trình rèn luyện kỹ năng số môn INF2501.',
  },
  sections: [
    {
      type: 'hero',
      variant: 'canva-cover',
      headline: 'Creative PORTFOLIO 2026',
      fullName: 'LƯƠNG THỊ BẢO CHÂM',
      roleTitle: 'TRƯỜNG ĐẠI HỌC Y DƯỢC - ĐHQGHN | UMP • MSV: 25100237',
      shortBio:
        'Y học là khoa học điều trị, nhưng cũng là nghệ thuật của sự thấu cảm. Kết hợp nền tảng lâm sàng với công nghệ dữ liệu số trong chăm sóc sức khỏe.',
      avatar: {
        url: '/presets/avatar-baocham.svg',
        sourceType: 'user-uploaded',
        frameStyle: 'circle',
        aspectRatio: '1/1',
      },
      quickTags: ['Tự học', 'Phân tích', 'Lắng nghe', 'Dữ liệu Y khoa'],
      ctaButtons: [
        { label: 'Dự án Y khoa & AI', href: '#projects', style: 'primary' },
        { label: 'Liên hệ', href: '#contact', style: 'secondary' },
      ],
      decorations: [
        {
          id: 'dec-bt-1',
          type: 'badge',
          label: 'UMP • ĐHQGHN',
          position: { top: '8%', right: '5%', rotate: 0, zIndex: 3 },
        },
      ],
    },
    {
      type: 'about',
      variant: 'two-column-bio',
      title: 'Về tôi',
      biography:
        'Là sinh viên y khoa thế hệ mới, mình luôn nỗ lực trau dồi cả y đức lẫn năng lực công nghệ, đặc biệt là kỹ năng phân tích và tổng hợp thông tin y tế đáng tin cậy.',
      highlights: [
        { label: 'Trường', value: 'ĐH Y Dược - ĐHQGHN' },
        { label: 'Mã sinh viên', value: '25100237' },
        { label: 'Học phần', value: 'INF2501' },
      ],
      contactInfo: {
        email: 'cham.ltb@ump.vnu.edu.vn',
        phone: '0966 222 333',
        location: 'Hà Nội',
        socials: [{ platform: 'Canva', url: 'https://lttm.my.canva.site/bt' }],
      },
    },
    {
      type: 'skills',
      variant: 'category-cards',
      title: 'Kỹ năng Chuyên môn & Kỹ thuật số',
      categories: [
        {
          name: 'Nghiên cứu & Dữ liệu Y sinh',
          skills: [
            { name: 'Tra cứu PubMed & Cơ sở Dữ liệu Y khoa', level: 94 },
            { name: 'Phân tích Dữ liệu Y tế Cơ bản', level: 88 },
            { name: 'Đồ họa Hóa Thông tin Y khoa (Infographics)', level: 92 },
          ],
        },
      ],
    },
    {
      type: 'projects',
      variant: 'canva-slide-showcase',
      title: 'Project Highlights',
      subtitle: 'Danh mục bài tập thực hành INF2501 (Project 1 đến Project 6)',
      detailViewMode: 'dedicated-route',
      navigationLoop: true,
      projects: [
        {
          id: 'bt-proj-1',
          slug: 'tra-cuu-tai-lieu-y-khoa',
          title: 'Project 1: Tra cứu & Quản lý Dữ liệu Y học Thực chứng',
          category: 'Nghiên cứu Y khoa',
          chapterTitle: 'Chương 1: Tìm kiếm & Thẩm định Nguồn Số',
          exerciseNumber: 'Bài tập 1 (mục 1.3)',
          productType: 'source-matrix',
          summary:
            'Lập ma trận phân tích 6 bài nghiên cứu về ứng dụng AI trong chẩn đoán hình ảnh từ cơ sở dữ liệu quốc tế.',
          keyTakeaways: [
            'Thẩm định chỉ số IF và tính chuẩn mực của bài báo khoa học',
            'Trích dẫn chính xác theo quy chuẩn Vancouver / APA',
          ],
          metrics: [
            { label: 'Nghiên cứu phân tích', value: '6 bài' },
            { label: 'Độ tin cậy nguồn', value: '100% Peer-reviewed' },
          ],
          media: [
            {
              id: 'bt-m-1',
              url: '/presets/assignment-medical.svg',
              caption: 'Ma trận tổng quan tài liệu y học thực chứng',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Medical student research portfolio showcase, cornflower indigo and buttercream clean palette',
          preferredImageStyle: 'canva-pastel-graphic',
          links: [],
          tags: ['Medical AI', 'PubMed', 'Evidence-based', 'INF2501'],
        },
      ],
    },
    {
      type: 'contact',
      title: 'Conclusion & Contact',
      subtitle: 'Chúc các bạn có một hành trình học tập nhiều hứng khởi!',
      thankYouMessage: 'THANK YOU FOR VISITING MY PORTFOLIO!',
      showContactForm: true,
      courseInfo: {
        courseCode: 'INF2501',
        courseName: 'Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo',
        institution: 'Trường Đại học Y Dược - ĐHQGHN',
        studentId: '25100237',
        studentName: 'Lương Thị Bảo Châm',
      },
    },
  ],
};

export const CHI_HUE_PORTFOLIO_DOC: PortfolioDocument = {
  id: 'canva-chi-hue-artistic-organic',
  slug: 'chihue',
  templateId: 'artistic-organic',
  imageGenerationConfig: {
    mode: 'hybrid-auto',
    visualStyle: 'editorial-illustration',
  },
  seo: {
    title: 'Ngô Thị Huệ | Artistic Portfolio 2026',
    description:
      'Portfolio nghệ thuật đường cong hữu cơ của Ngô Thị Huệ - GD3 ĐH Giáo dục ĐHQGHN, học phần INF2501.',
    ogImage: '/presets/avatar-chihue.svg',
  },
  theme: {
    primaryColor: '#3E000C',
    secondaryColor: '#381313',
    backgroundColor: '#FFECD1',
    surfaceColor: '#FFFFFF',
    textColor: '#3E000C',
    headingFont: 'Playfair Display',
    bodyFont: 'Be Vietnam Pro',
    borderRadius: 'full',
    pageTransition: 'slide-deck',
    effects: {
      enableFloat: true,
      enableGlow: true,
      enableTilt: false,
      enableSparkles: true,
      revealVariant: 'zoom-in',
      enableParallax: true,
    },
    backgroundIllustration: {
      mode: 'preset',
      presetId: 'abstract-blobs',
      opacity: 0.18,
      blur: 0,
      position: 'cover',
    },
  },
  profileOwner: {
    fullName: 'Ngô Thị Huệ',
    roleTitle: 'Khoa học Giáo dục & Sáng tạo Nghệ thuật • GD3 - UEd',
    avatarUrl: '/presets/avatar-chihue.svg',
    avatarSourceType: 'user-uploaded',
    frameStyle: 'cutout-blob',
    aspectRatio: '1/1',
    bioSnippet:
      'Giáo dục là nghệ thuật khơi dậy tiềm năng. Tư duy đổi mới, thấu cảm và trách nhiệm trong từng sáng tạo số.',
    learningGoals:
      'Hòa trộn tư duy thiết kế nghệ thuật với phương pháp luận sư phạm công nghệ để tạo ra trải nghiệm học tập độc đáo.',
    portfolioObjective:
      'Hồ sơ đánh giá học phần INF2501 thể hiện tính độc bản và chỉn chu.',
  },
  sections: [
    {
      type: 'hero',
      variant: 'canva-cover',
      headline: 'Portfolio 2026',
      fullName: 'Ngô Thị HUỆ',
      roleTitle: 'EDUCATOR • GD3 - ĐẠI HỌC GIÁO DỤC, ĐHQGHN',
      shortBio:
        'Xin chào! Mình là Ngô Thị Huệ. Giáo dục là nghệ thuật khơi dậy tiềm năng con người bằng sự chân thành, nhiệt huyết và công nghệ khai phóng.',
      avatar: {
        url: '/presets/avatar-chihue.svg',
        sourceType: 'user-uploaded',
        frameStyle: 'cutout-blob',
        aspectRatio: '1/1',
      },
      quickTags: ['GD3 - UEd', 'Kỹ năng sư phạm', 'Đổi mới', 'Sáng tạo'],
      ctaButtons: [
        { label: 'Xem Dự án', href: '#projects', style: 'primary' },
        { label: 'Liên hệ', href: '#contact', style: 'secondary' },
      ],
      decorations: [
        {
          id: 'dec-ch-1',
          type: 'sticker',
          label: '~~~~ HUE HERE !!! ~~~~',
          position: { top: '7%', left: '5%', rotate: 2, zIndex: 3 },
        },
      ],
    },
    {
      type: 'about',
      variant: 'story-card',
      title: 'Về tôi',
      biography:
        'Hành trình tại Trường Đại học Giáo dục - ĐHQGHN giúp mình nhận ra sức mạnh to lớn của sự thấu cảm trong sư phạm, đặc biệt khi được trợ lực bởi các công cụ AI hiện đại.',
      highlights: [
        { label: 'Đơn vị', value: 'ĐH Giáo dục - ĐHQGHN' },
        { label: 'Lớp', value: 'GD3' },
        { label: 'Học phần', value: 'INF2501' },
      ],
      contactInfo: {
        email: 'hue.ngo@ued.vnu.edu.vn',
        phone: '0981 333 444',
        location: 'Hà Nội',
        socials: [
          { platform: 'Canva', url: 'https://tntdesignlab.my.canva.site/chihue' },
        ],
      },
    },
    {
      type: 'skills',
      variant: 'icon-badges',
      title: 'Kỹ năng & Năng lực Sư phạm',
      categories: [
        {
          name: 'Năng lực Cốt lõi',
          skills: [
            { name: 'Quản trị Dự án Học tập Số', level: 93 },
            { name: 'Khai thác & Xử lý Dữ liệu Sư phạm', level: 90 },
            { name: 'Sáng tạo Nội dung Đa nền tảng', level: 95 },
          ],
        },
      ],
    },
    {
      type: 'projects',
      variant: 'masonry-gallery',
      title: 'My Projects',
      subtitle: 'Hệ thống các case study học tập và sáng tạo số',
      detailViewMode: 'dedicated-route',
      navigationLoop: true,
      projects: [
        {
          id: 'ch-proj-1',
          slug: 'quan-tri-so-giao-duc',
          title: '01. Quản trị Không gian Học tập Số và Dữ liệu',
          category: 'Quản trị Số',
          chapterTitle: 'Chương 1: Môi trường Số Sư phạm',
          exerciseNumber: 'Bài tập 1',
          productType: 'folder-tree',
          summary:
            'Xây dựng quy chuẩn quản lý tài liệu học tập theo chủ đề, tích hợp công cụ đám mây bảo mật cao.',
          keyTakeaways: [
            'Tính đồng bộ và khả năng truy xuất nhanh chóng là chìa khóa hiệu suất',
          ],
          metrics: [{ label: 'Thư mục số', value: '12 modules' }],
          media: [
            {
              id: 'ch-m-1',
              url: '/presets/assignment-organic.svg',
              caption: 'Cấu trúc quản trị số phong cách đường cong hữu cơ',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Artistic organic portfolio card with warm apricot and black cherry burgundy gradients',
          preferredImageStyle: 'editorial-illustration',
          links: [],
          tags: ['Quản trị số', 'UEd', 'Organic Shapes', 'INF2501'],
        },
      ],
    },
    {
      type: 'contact',
      title: 'Kết nối cùng Huệ',
      subtitle: 'LET’S WORK TOGETHER!',
      thankYouMessage: 'HẸN GẶP LẠI TRÊN HÀNH TRÌNH ĐỔI MỚI GIÁO DỤC!',
      showContactForm: true,
      courseInfo: {
        courseCode: 'INF2501',
        courseName: 'Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo',
        institution: 'Trường Đại học Giáo dục - ĐHQGHN',
        studentName: 'Ngô Thị Huệ',
      },
    },
  ],
};

export const VO_HOAI_PORTFOLIO_DOC: PortfolioDocument = {
  id: 'canva-hoai-academic-presentation',
  slug: 'hoai',
  templateId: 'academic-presentation',
  imageGenerationConfig: {
    mode: 'hybrid-auto',
    visualStyle: 'editorial-illustration',
  },
  seo: {
    title: 'Võ Thị Hoài | Academic Presentation Portfolio 2026',
    description:
      'Hồ sơ học thuật chuẩn mực của Võ Thị Hoài - Khoa học Giáo dục ĐH Giáo dục ĐHQGHN, học phần INF2501.',
    ogImage: '/presets/avatar-vothihoai.svg',
  },
  theme: {
    primaryColor: '#9B302D',
    secondaryColor: '#6A1C1B',
    backgroundColor: '#EDEAE2',
    surfaceColor: '#FFFFFF',
    textColor: '#9B302D',
    headingFont: 'Merriweather',
    bodyFont: 'Be Vietnam Pro',
    borderRadius: 'md',
    pageTransition: 'slide-deck',
    effects: {
      enableFloat: false,
      enableGlow: false,
      enableTilt: false,
      enableSparkles: true,
      revealVariant: 'fade-up',
      enableParallax: false,
    },
    backgroundIllustration: {
      mode: 'preset',
      presetId: 'vintage-parchment',
      opacity: 0.2,
      blur: 0,
      position: 'cover',
    },
  },
  profileOwner: {
    fullName: 'Võ Thị Hoài',
    roleTitle: 'Khoa học Giáo dục • ĐH Giáo dục - ĐHQGHN (UEd)',
    avatarUrl: '/presets/avatar-vothihoai.svg',
    avatarSourceType: 'user-uploaded',
    frameStyle: 'arch-window',
    aspectRatio: '3/4',
    bioSnippet:
      'Giáo dục là nền khoa học định hình tư duy. Nghiên cứu sâu về phân tích dữ liệu sư phạm và ứng dụng AI có trách nhiệm.',
    learningGoals:
      'Phát triển năng lực nghiên cứu định lượng, xây dựng mô hình dự đoán kết quả học tập và đạo đức học thuật số.',
    portfolioObjective:
      'Minh chứng chuẩn mực khoa học môn INF2501 đạt khung Rubric Xuất sắc.',
  },
  sections: [
    {
      type: 'hero',
      variant: 'canva-cover',
      headline: 'PORTFOLIO CREATIVE 2026',
      fullName: 'VÕ THỊ HOÀI',
      roleTitle: 'ĐHQGHN | TRƯỜNG ĐẠI HỌC GIÁO DỤC (UEd) • KHOA HỌC GIÁO DỤC',
      shortBio:
        'Chào mừng đến với không gian học thuật số của Võ Thị Hoài. Lưu giữ các kết quả nghiên cứu và bài tập học phần Nhập môn Công nghệ số & Trí tuệ Nhân tạo.',
      avatar: {
        url: '/presets/avatar-vothihoai.svg',
        sourceType: 'user-uploaded',
        frameStyle: 'arch-window',
        aspectRatio: '3/4',
      },
      quickTags: ['Nghiên cứu GD', 'Dữ liệu Sư phạm', 'Đạo đức AI', 'UEd'],
      ctaButtons: [
        { label: 'Xem Nghiên cứu', href: '#projects', style: 'primary' },
        { label: 'Liên hệ', href: '#contact', style: 'outline' },
      ],
      decorations: [
        {
          id: 'dec-vh-1',
          type: 'badge',
          label: 'ĐHQGHN • UEd 2026',
          position: { top: '8%', right: '5%', rotate: 0, zIndex: 3 },
        },
      ],
    },
    {
      type: 'about',
      variant: 'two-column-bio',
      title: 'Giới thiệu Nghiên cứu',
      biography:
        'Với định hướng học thuật nghiêm cẩn, em tập trung vào việc áp dụng phương pháp nghiên cứu định lượng và các chuẩn mực liêm chính khoa học trong toàn bộ quá trình học tập.',
      highlights: [
        { label: 'Trường', value: 'ĐH Giáo dục (UEd)' },
        { label: 'Chuyên ngành', value: 'Khoa học GD' },
        { label: 'Học phần', value: 'INF2501' },
      ],
      contactInfo: {
        email: 'hoaiv286@gmail.com',
        phone: '0396 873 006',
        location: 'Hà Nội',
        socials: [{ platform: 'Canva', url: 'https://lttm.my.canva.site/hoai' }],
      },
    },
    {
      type: 'skills',
      variant: 'category-cards',
      title: 'Năng lực Nghiên cứu & Công nghệ',
      categories: [
        {
          name: 'Phương pháp & Dữ liệu',
          skills: [
            { name: 'Thiết kế Nghiên cứu Khoa học Sư phạm', level: 95 },
            { name: 'Xử lý Dữ liệu Thống kê SPSS & Excel', level: 91 },
            { name: 'Thẩm định Đạo đức Trí tuệ Nhân tạo', level: 96 },
          ],
        },
      ],
    },
    {
      type: 'projects',
      variant: 'canva-slide-showcase',
      title: 'FEATURED PROJECTS',
      subtitle: 'Hệ thống báo cáo học thuật theo slide chuẩn mực (01 đến 05)',
      detailViewMode: 'dedicated-route',
      navigationLoop: true,
      projects: [
        {
          id: 'vh-proj-1',
          slug: 'kien-truc-du-lieu-hoc-thuat',
          title: '01. Kiến trúc Quản lý Dữ liệu & Học liệu Nghiên cứu',
          category: 'Quản trị Học thuật',
          chapterTitle: 'Chương 1: Nền tảng Dữ liệu Số',
          exerciseNumber: 'Slide 01 (Bài tập 1)',
          productType: 'folder-tree',
          summary:
            'Xây dựng hệ thống lưu trữ phân loại tài liệu nghiên cứu sư phạm khoa học, đảm bảo bảo toàn dữ liệu dài hạn.',
          keyTakeaways: [
            'Cấu trúc dữ liệu rõ ràng giúp tăng tốc độ tổng quan tài liệu',
          ],
          metrics: [
            { label: 'Tài liệu quản lý', value: '50+ files' },
            { label: 'Chuẩn lưu trữ', value: 'ISO 27001' },
          ],
          media: [
            {
              id: 'vh-m-1',
              url: '/presets/assignment-academic.svg',
              caption: 'Cấu trúc lưu trữ học thuật với viền đỏ gạch crimson trang trọng',
              sourceType: 'user-uploaded',
            },
          ],
          suggestedAiImagePrompt:
            'Academic presentation research deck, brick crimson and archival stone chalk background, scholarly fonts',
          preferredImageStyle: 'editorial-illustration',
          links: [],
          tags: ['Academic', 'UEd', 'Data Architecture', 'INF2501'],
        },
      ],
    },
    {
      type: 'contact',
      title: 'Thông tin Học thuật & Trao đổi',
      subtitle: '0396873006 • hoaiv286@gmail.com • ĐH Giáo dục - ĐHQGHN',
      thankYouMessage: 'XIN TRÂN TRỌNG CẢM ƠN QUÝ THẦY CÔ VÀ HỘI ĐỒNG ĐÁNH GIÁ!',
      showContactForm: true,
      courseInfo: {
        courseCode: 'INF2501',
        courseName: 'Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo',
        institution: 'Trường Đại học Giáo dục - ĐHQGHN',
        studentName: 'Võ Thị Hoài',
      },
    },
  ],
};

/**
 * Record of all 6 Canva Creative Preset Documents indexed by slug.
 */
export const CANVA_CREATIVE_PRESETS: Record<string, PortfolioDocument> = {
  'thu-trang': THU_TRANG_PORTFOLIO_DOC,
  hq: HONG_QUYEN_PORTFOLIO_DOC,
  ngocmai: NGOC_MAI_PORTFOLIO_DOC,
  bt: BAO_CHAM_PORTFOLIO_DOC,
  chihue: CHI_HUE_PORTFOLIO_DOC,
  hoai: VO_HOAI_PORTFOLIO_DOC,
};

/**
 * Array containing all 6 Canva Creative Preset Documents.
 */
export const ALL_CANVA_CREATIVE_DOCUMENTS: PortfolioDocument[] = [
  THU_TRANG_PORTFOLIO_DOC,
  HONG_QUYEN_PORTFOLIO_DOC,
  NGOC_MAI_PORTFOLIO_DOC,
  BAO_CHAM_PORTFOLIO_DOC,
  CHI_HUE_PORTFOLIO_DOC,
  VO_HOAI_PORTFOLIO_DOC,
];

/**
 * Get a Canva Creative Preset Document by its slug (e.g. 'thu-trang', 'hq', 'ngocmai', 'bt', 'chihue', 'hoai').
 */
export function getCanvaCreativePresetBySlug(
  slug: string
): PortfolioDocument | undefined {
  return CANVA_CREATIVE_PRESETS[slug];
}

/**
 * Get a Canva Creative Preset Document by its template archetype ID.
 */
export function getCanvaCreativePresetByTemplateId(
  templateId: TemplateId
): PortfolioDocument | undefined {
  return ALL_CANVA_CREATIVE_DOCUMENTS.find(
    (doc) => doc.templateId === templateId
  );
}
