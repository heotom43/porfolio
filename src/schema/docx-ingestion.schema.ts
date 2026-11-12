import { z } from 'zod';
import {
  ImageModeSchema,
  ProjectItemSchema,
  ThemeConfigSchema,
  VisualStyleSchema,
} from './portfolio.schema';

/**
 * Single image extracted from a .docx archive (word/media/*).
 */
export const ExtractedDocxImageSchema = z.object({
  id: z.string(),
  savedUrl: z.string(),
  mimeType: z.string(),
  originalName: z.string(),
  surroundingTextContext: z.string(),
  assignmentIndexHint: z.number().int().nonnegative().optional(),
});

/**
 * Preliminary assignment block detected while splitting a .docx file.
 */
export const DetectedAssignmentSchema = z.object({
  index: z.number().int().nonnegative(),
  sourceDocxFileName: z.string(),
  rawHeading: z.string(),
  rawText: z.string(),
  htmlSegment: z.string(),
  imageIds: z.array(z.string()),
});

/**
 * Full intermediate extraction result from parsing a single .docx file.
 */
export const RawDocxExtractionResultSchema = z.object({
  fileName: z.string(),
  rawText: z.string(),
  htmlPreview: z.string(),
  extractedImages: z.array(ExtractedDocxImageSchema),
  detectedAssignments: z.array(DetectedAssignmentSchema),
});

/**
 * Canonical DOCX ingestion schema alias matching Rule/01 specification.
 */
export const DocxIngestionSchema = RawDocxExtractionResultSchema;

/**
 * Request payload for AI assignment summarization.
 */
export const SummarizeAssignmentsRequestSchema = z.object({
  extractions: z.array(RawDocxExtractionResultSchema),
  studentProfile: z
    .object({
      fullName: z.string().optional(),
      roleTitle: z.string().optional(),
      avatarUrl: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  imageMode: ImageModeSchema.default('hybrid-auto'),
  visualStyle: VisualStyleSchema.default('canva-pastel-graphic'),
  themeColors: z
    .object({
      primaryColor: z.string(),
      backgroundColor: z.string(),
    })
    .optional(),
});

/**
 * AI-summarized portfolio structure inferred from raw .docx extractions.
 */
export const SummarizeAssignmentsResponseSchema = z.object({
  fullName: z.string(),
  roleTitle: z.string(),
  shortBio: z.string(),
  biography: z.string(),
  quickTags: z.array(z.string()),
  highlights: z.array(z.object({ label: z.string(), value: z.string() })),
  skills: z.array(
    z.object({
      name: z.string(),
      skills: z.array(
        z.object({
          name: z.string(),
          level: z.number().min(0).max(100),
        })
      ),
    })
  ),
  projects: z.array(ProjectItemSchema),
  stats: z.object({
    totalFiles: z.number().int().nonnegative(),
    totalAssignments: z.number().int().nonnegative(),
    docxImagesFound: z.number().int().nonnegative(),
    aiImagesGenerated: z.number().int().nonnegative(),
  }),
  suggestedTheme: ThemeConfigSchema.optional(),
});

/**
 * Request schema for generating a topic-aware AI illustration.
 */
export const GenerateTopicImageRequestSchema = z.object({
  topicTitle: z.string().min(1),
  assignmentSummary: z.string().default(''),
  customPrompt: z.string().optional(),
  visualStyle: VisualStyleSchema.default('canva-pastel-graphic'),
  themeColors: z
    .object({
      primaryColor: z.string(),
      backgroundColor: z.string(),
    })
    .optional(),
  aspectRatio: z.enum(['16:9', '4:3', '1:1']).default('4:3'),
});

export type ExtractedDocxImage = z.infer<typeof ExtractedDocxImageSchema>;
export type DetectedAssignment = z.infer<typeof DetectedAssignmentSchema>;
export type RawDocxExtractionResult = z.infer<
  typeof RawDocxExtractionResultSchema
>;
export type DocxIngestion = z.infer<typeof DocxIngestionSchema>;
export type SummarizeAssignmentsRequest = z.infer<
  typeof SummarizeAssignmentsRequestSchema
>;
export type SummarizeAssignmentsResponse = z.infer<
  typeof SummarizeAssignmentsResponseSchema
>;
export type GenerateTopicImageRequest = z.infer<
  typeof GenerateTopicImageRequestSchema
>;
