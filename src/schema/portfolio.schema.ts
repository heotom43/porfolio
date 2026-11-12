import { z } from "zod";

/**
 * Media source type attached to a project or avatar.
 */
export const MediaSourceTypeSchema = z.enum([
  "docx-extracted",
  "ai-generated",
  "user-uploaded",
]);

/**
 * Supported AI visual style presets for topic-aware image generation.
 */
export const VisualStyleSchema = z.enum([
  "editorial-illustration",
  "3d-render",
  "minimal-photo",
  "canva-pastel-graphic",
]);

/**
 * Image processing mode during DOCX-to-Portfolio conversion.
 */
export const ImageModeSchema = z.enum([
  "docx-extract",
  "hybrid-auto",
  "ai-generate-all",
]);

/**
 * Supported portfolio archetype templates.
 */
export const TemplateIdSchema = z.enum([
  "canva-editorial",
  "bento-grid",
  "framer-minimal",
  "creative-showcase",
  "growth-marketer",
  "tech-developer",
  // Canva Creative Archetypes
  "warm-editorial",
  "creative-bold",
  "minimal-chic",
  "vibrant-student",
  "artistic-organic",
  "academic-presentation",
]);

/**
 * Unified profile owner details & portrait avatar configuration.
 */
export const ProfileOwnerSchema = z.object({
  fullName: z.string(),
  roleTitle: z.string(),
  avatarUrl: z.string(),
  avatarSourceType: MediaSourceTypeSchema.default("user-uploaded"),
  frameStyle: z
    .enum([
      "arch-window",
      "cutout-blob",
      "polaroid",
      "circle",
      "rounded-rect",
      "none",
    ])
    .default("arch-window"),
  aspectRatio: z.enum(["3/4", "1/1", "4/5", "none"]).default("3/4"),
  bioSnippet: z.string().optional(),
  learningGoals: z.string().optional(),
  portfolioObjective: z.string().optional(),
  introVideoUrl: z.string().optional(),
});

/**
 * Visual and motion effects configuration toggles for the portfolio presentation.
 */
export const VisualEffectsConfigSchema = z.object({
  enableFloat: z.boolean().default(false),
  enableGlow: z.boolean().default(false),
  enableTilt: z.boolean().default(false),
  enableSparkles: z.boolean().default(true),
  revealVariant: z
    .enum(["fade-up", "zoom-in", "slide-left", "slide-right", "none"])
    .default("fade-up"),
  enableParallax: z.boolean().default(false),
});

/**
 * Background illustration and texture overlay configuration.
 */
export const BackgroundIllustrationConfigSchema = z.object({
  mode: z.enum(["none", "preset", "custom"]).default("preset"),
  presetId: z
    .enum([
      "none",
      "canva-musical",
      "botanical-leaves",
      "cyber-mesh",
      "geometric-dots",
      "abstract-blobs",
      "celestial-sparkles",
      "vintage-parchment",
      "minimalist-contour",
      "halftone-field",
      "editorial-arcs",
      "soft-paper-waves",
      "quiet-starburst",
    ])
    .default("none"),
  customUrl: z.string().optional(),
  opacity: z.number().min(0).max(1).default(0.15),
  blur: z.number().min(0).max(20).default(0),
  position: z
    .enum(["cover", "pattern-repeat", "top-right", "bottom-left", "center"])
    .default("cover"),
});

/**
 * Navigation and presentation mode when viewing a project detail.
 */
export const ProjectDetailModeSchema = z
  .enum(["fullscreen-overlay", "dedicated-route"])
  .default("dedicated-route");

/**
 * Media item attached to a summarized project / assignment.
 */
export const ProjectMediaItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
  sourceType: MediaSourceTypeSchema,
  aiPromptUsed: z.string().optional(),
  originalDocxMediaName: z.string().optional(),
});

/**
 * Floating decorative sticker, badge, shape, or tag rendered over sections.
 */
export const VisualDecorationSchema = z.object({
  id: z.string(),
  type: z.enum([
    "badge",
    "sticker",
    "shape",
    "frame",
    "floating-tag",
    "grid-pattern",
  ]),
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

export const SectionMotifSchema = z.enum([
  "none",
  "canva-musical",
  "botanical-leaves",
  "cyber-mesh",
  "geometric-dots",
  "abstract-blobs",
  "celestial-sparkles",
  "vintage-parchment",
  "minimalist-contour",
  "halftone-field",
  "editorial-arcs",
  "soft-paper-waves",
  "quiet-starburst",
]);

export const SectionAppearanceSchema = z.object({
  motif: SectionMotifSchema.optional(),
  accentColor: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Hero / magazine cover section.
 */
export const HeroSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("hero"),
  variant: z.enum([
    "canva-cover",
    "split-modern",
    "bento-intro",
    "minimal-center",
    "editorial-magazine",
    "centered",
    "split-left",
    "split-right",
    "editorial-asymmetric",
    "bento",
  ]),
  headline: z.string(),
  fullName: z.string(),
  roleTitle: z.string(),
  shortBio: z.string(),
  avatar: z.object({
    url: z.string(),
    sourceType: MediaSourceTypeSchema.default("user-uploaded"),
    frameStyle: z.enum([
      "cutout-blob",
      "arch-window",
      "polaroid",
      "circle",
      "rounded-rect",
      "none",
    ]),
    aspectRatio: z.string().default("3/4"),
  }),
  layoutInverted: z.boolean().optional(),
  mediaPosition: z.enum(["left", "right"]).optional(),
  quickTags: z.array(z.string()),
  ctaButtons: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
      style: z.enum(["primary", "secondary", "outline"]),
    }),
  ),
  decorations: z.array(VisualDecorationSchema).default([]),
});

/**
 * About me / biography and contact summary section.
 */
export const AboutSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("about"),
  variant: z.enum([
    "story-card",
    "two-column-bio",
    "bento-facts",
    "editorial-poster",
    "profile-dashboard",
    "spotlight",
    "tabs",
    "grid",
    "timeline",
    "cards",
    "organic",
  ]),
  title: z.string(),
  biography: z.string(),
  highlights: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      width: z.number().int().min(1).max(4).optional(),
      height: z.number().int().min(1).max(3).optional(),
    }),
  ),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    socials: z.array(
      z.object({
        platform: z.string(),
        url: z.string(),
      }),
    ),
  }),
  layoutInverted: z.boolean().optional(),
  mediaPosition: z.enum(["left", "right"]).optional(),
  cardOrder: z
    .array(z.string())
    .default(["contact", "education", "learningGoals"])
    .optional(),
  cardPositions: z
    .record(
      z.string(),
      z.object({
        column: z.number().int().min(0).max(11),
        row: z.number().int().min(0).max(100),
        width: z.number().int().min(1).max(12),
        height: z.number().int().min(1).max(12),
      }),
    )
    .optional(),
  cardTitles: z
    .object({
      contact: z.string().optional(),
      education: z.string().optional(),
      learningGoals: z.string().optional(),
      portfolioObjective: z.string().optional(),
    })
    .optional(),
  cardFrame: z
    .enum([
      "template",
      "soft",
      "glass",
      "outline",
      "editorial",
      "elevated",
      "dashed",
    ])
    .optional(),
  cardHeadingFont: z.string().optional(),
  cardBodyFont: z.string().optional(),
  educationSchool: z.string().optional(),
  educationDegree: z.string().optional(),
  educationPeriod: z.string().optional(),
  // INF2501 Rubric additions
  learningGoals: z.string().optional(),
  portfolioObjective: z.string().optional(),
  introVideoUrl: z.string().optional(),
});

/**
 * Skills showcase section.
 */
export const SkillsSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("skills"),
  variant: z.enum([
    "icon-badges",
    "progress-bars",
    "category-cards",
    "canva-visual-grid",
  ]),
  title: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
      skills: z.array(
        z.object({
          name: z.string(),
          level: z.number().min(0).max(100).optional(),
          iconUrl: z.string().optional(),
        }),
      ),
    }),
  ),
});

/**
 * Experience timeline section.
 */
export const ExperienceTimelineSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("experience"),
  variant: z.enum(["vertical-timeline", "canva-cards", "compact-list"]),
  title: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      organization: z.string(),
      period: z.string(),
      description: z.string(),
      achievements: z.array(z.string()),
    }),
  ),
});

/**
 * Education history section.
 */
export const EducationSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("education"),
  variant: z
    .enum(["academic-grid", "timeline", "compact-list", "bento"])
    .optional(),
  title: z.string(),
  items: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      period: z.string(),
      gpaOrHonors: z.string().optional(),
      details: z.string().optional(),
    }),
  ),
});

/**
 * Individual summarized assignment / case study project item.
 */
export const ProjectItemSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  title: z.string(),
  category: z.string(),
  sourceDocxFileName: z.string().optional(),
  docxUrl: z.string().optional(),
  assignmentBrief: z.string().optional(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()).default([]),
  fullRawExcerpt: z.string().optional(),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  media: z.array(ProjectMediaItemSchema).default([]),
  suggestedAiImagePrompt: z.string(),
  preferredImageStyle: VisualStyleSchema.default("canva-pastel-graphic"),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      }),
    )
    .default([]),
  tags: z.array(z.string()),
  layoutInverted: z.boolean().optional(),
  mediaPosition: z.enum(["left", "right", "top", "bottom"]).optional(),
  // INF2501 Rubric additions
  chapterTitle: z.string().optional(),
  exerciseNumber: z.string().optional(),
  academicIntegrityNote: z.string().optional(),
  processSteps: z.array(z.string()).optional(),
  obstaclesAndSolutions: z.string().optional(),
  promptComparison: z
    .object({
      initialPrompt: z.string(),
      improvedPrompt: z.string(),
      aiOutput: z.string(),
    })
    .optional(),
  productType: z
    .enum([
      "image",
      "video",
      "pdf",
      "prompt-comparison",
      "responsible-ai-rules",
      "folder-tree",
      "source-matrix",
      "group-work",
      "mixed",
    ])
    .optional(),
});

/**
 * Featured assignments & projects showcase section.
 */
export const ProjectsSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("projects"),
  variant: z.enum([
    "canva-slide-showcase",
    "masonry-gallery",
    "case-study-cards",
    "bento-projects",
    "grid",
    "staggered-cards",
    "carousel",
    "list",
  ]),
  title: z.string(),
  subtitle: z.string().optional(),
  detailViewMode: ProjectDetailModeSchema.optional(),
  navigationLoop: z.boolean().default(true).optional(),
  projects: z.array(ProjectItemSchema),
});

/**
 * Closing contact & thank-you section.
 */
export const ContactSectionSchema = z.object({
  ...SectionAppearanceSchema.shape,
  type: z.literal("contact"),
  variant: z
    .enum(["minimal-card", "split-form", "full-banner", "footer-widget"])
    .default("full-banner")
    .optional(),
  title: z.string(),
  subtitle: z.string(),
  thankYouMessage: z.string().default("THANK YOU FOR WATCHING!"),
  showContactForm: z.boolean().default(true),
  // INF2501 Rubric additions
  courseInfo: z
    .object({
      courseCode: z.string().default("INF2501"),
      courseName: z
        .string()
        .default("Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo"),
      institution: z.string().default("Trường ĐH Sư phạm Nghệ thuật TW"),
      studentClass: z.string().optional(),
      studentId: z.string().optional(),
      studentName: z.string().optional(),
      studentNamePosition: z.enum(["left", "center", "right"]).optional(),
    })
    .optional(),
  aiToolsDeclaration: z
    .array(
      z.object({
        toolName: z.string(),
        purpose: z.string(),
        academicIntegrityDeclaration: z.string(),
      }),
    )
    .optional(),
  personalReflection: z
    .object({
      experienceAndFeeling: z.string().optional(),
      knowledgeAndSkills: z.string().optional(),
      keyTakeawaysAndChallenges: z.string().optional(),
    })
    .optional(),
});

/**
 * Union of all portfolio section types.
 */
export const PortfolioSectionSchema = z.discriminatedUnion("type", [
  HeroSectionSchema,
  AboutSectionSchema,
  ExperienceTimelineSectionSchema,
  EducationSectionSchema,
  SkillsSectionSchema,
  ProjectsSectionSchema,
  ContactSectionSchema,
]);

/**
 * Visual theme tokens for the portfolio.
 */
export const ThemeConfigSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  surfaceColor: z.string(),
  textColor: z.string(),
  headingFont: z.string(),
  bodyFont: z.string(),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]),
  pageTransition: z.enum(["slide-deck", "smooth-scroll", "fade"]),
  effects: VisualEffectsConfigSchema.optional(),
  backgroundIllustration: BackgroundIllustrationConfigSchema.optional(),
});

/**
 * Root Portfolio Document schema (Single Source of Truth across all agents).
 */
export const PortfolioDocumentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  templateId: TemplateIdSchema,
  imageGenerationConfig: z.object({
    mode: ImageModeSchema.default("hybrid-auto"),
    visualStyle: VisualStyleSchema.default("canva-pastel-graphic"),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    ogImage: z.string().optional(),
  }),
  theme: ThemeConfigSchema,
  sections: z.array(PortfolioSectionSchema),
  profileOwner: ProfileOwnerSchema.optional(),
});

export type MediaSourceType = z.infer<typeof MediaSourceTypeSchema>;
export type VisualStyle = z.infer<typeof VisualStyleSchema>;
export type ImageMode = z.infer<typeof ImageModeSchema>;
export type TemplateId = z.infer<typeof TemplateIdSchema>;
export type ProfileOwner = z.infer<typeof ProfileOwnerSchema>;
export type VisualEffectsConfig = z.infer<typeof VisualEffectsConfigSchema>;
export type BackgroundIllustrationConfig = z.infer<
  typeof BackgroundIllustrationConfigSchema
>;
export type ProjectDetailMode = z.infer<typeof ProjectDetailModeSchema>;
export type ProjectMediaItem = z.infer<typeof ProjectMediaItemSchema>;
export type VisualDecoration = z.infer<typeof VisualDecorationSchema>;
export type SectionMotif = z.infer<typeof SectionMotifSchema>;
export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type AboutSection = z.infer<typeof AboutSectionSchema>;
export type SkillsSection = z.infer<typeof SkillsSectionSchema>;
export type ExperienceSection = z.infer<typeof ExperienceTimelineSectionSchema>;
export type EducationSection = z.infer<typeof EducationSectionSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type ProjectsSection = z.infer<typeof ProjectsSectionSchema>;
export type ContactSection = z.infer<typeof ContactSectionSchema>;
export type PortfolioSection = z.infer<typeof PortfolioSectionSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type PortfolioDocument = z.infer<typeof PortfolioDocumentSchema>;
