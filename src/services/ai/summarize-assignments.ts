import { z } from 'zod';
import type {
  ProjectItem,
  ProjectMediaItem,
  ThemeConfig,
  VisualStyle,
} from '@/schema/portfolio.schema';
import { resolveThemeFromContext } from '@/schema/theme.schema';
import {
  SummarizeAssignmentsResponseSchema,
  type DetectedAssignment,
  type ExtractedDocxImage,
  type SummarizeAssignmentsRequest,
  type SummarizeAssignmentsResponse,
} from '@/schema/docx-ingestion.schema';
import { generateTopicImage } from './image-generator';

const LlmProjectSummarySchema = z.object({
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  category: z.string().min(1),
  assignmentBrief: z.string().min(1),
  summary: z.string().min(1),
  keyTakeaways: z.array(z.string().min(1)).min(1),
  metrics: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .default([]),
  tags: z.array(z.string().min(1)).min(1),
  suggestedAiImagePrompt: z.string().min(1),
});

const LlmSummaryOutputSchema = z.object({
  fullName: z.string().min(1),
  roleTitle: z.string().min(1),
  shortBio: z.string().min(1),
  biography: z.string().min(1),
  quickTags: z.array(z.string().min(1)).min(1),
  skills: z
    .array(
      z.object({
        name: z.string().min(1),
        skills: z
          .array(
            z.object({
              name: z.string().min(1),
              level: z.number().min(0).max(100),
            })
          )
          .min(1),
      })
    )
    .min(1),
  projects: z.array(LlmProjectSummarySchema).min(1),
});

type LlmSummaryOutput = z.infer<typeof LlmSummaryOutputSchema>;

const CATEGORY_PATTERNS: Array<{ category: string; regex: RegExp }> = [
  {
    category: 'AI Prompt Engineering',
    regex: /prompt|chain-of-thought|few-shot|chatgpt|gemini|\bllm\b|tạo sinh|automation|\bai\b/gi,
  },
  {
    category: 'Thiết kế Truyền thông',
    regex: /thiết kế|bộ nhận diện|landing page|canva|figma|poster|banner|carousel|\bui\b|\bux\b/gi,
  },
  {
    category: 'Content Marketing',
    regex: /content marketing|content pillar|copywriting|bài đăng|kịch bản|aida|pas|\bseo\b|facebook|tiktok|chiến dịch/gi,
  },
  {
    category: 'Phân tích & Nghiên cứu',
    regex: /khảo sát|phản hồi khách hàng|nghiên cứu thị trường|dữ liệu|\bdata\b|excel|biểu đồ|insight|csat/gi,
  },
  {
    category: 'Giáo dục & Sáng tạo',
    regex: /âm nhạc|giảng dạy|sư phạm|giáo dục|học liệu/gi,
  },
  {
    category: 'Phát triển Sản phẩm Số',
    regex: /\bcode\b|next\.js|react|\bapi\b|phần mềm|lập trình|ứng dụng web/gi,
  },
];

function inferCategory(title: string, rawText: string): string {
  const titleLower = title.toLowerCase();
  const bodyLower = rawText.toLowerCase();

  let bestCategory = 'Dự án Thực hành';
  let bestScore = 0;

  for (const { category, regex } of CATEGORY_PATTERNS) {
    const titleHits = (titleLower.match(regex) ?? []).length;
    const bodyHits = (bodyLower.match(regex) ?? []).length;
    const score = titleHits * 3 + bodyHits;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function cleanProjectTitle(
  rawHeading: string,
  category: string,
  rawText: string
): string {
  const stripped = rawHeading
    .replace(
      /^(?:bài(?:\s+tập)?|assignment|project|dự\s*án|case\s*study|phần|chương|chủ\s*đề)\s*(?:số\s*)?(?:\d+|[ivx]+)?\s*[:.\-–]?\s*/i,
      ''
    )
    .trim();

  const isGenericHomeworkTitle =
    !stripped ||
    /^(?:về nhà|tuần\s*\d+|buổi\s*\d+|thực hành|homework|exercise)\s*\d*$/i.test(
      stripped
    );

  if (!isGenericHomeworkTitle) {
    return stripped;
  }

  const brief = extractLabeledSegment(rawText, [
    'Chủ đề',
    'Đề bài',
    'Mục tiêu',
    'Yêu cầu',
  ]);
  if (brief) {
    const shortClause = brief.split(/[,.;\n]/)[0].trim();
    if (shortClause.length >= 12) {
      return shortClause.slice(0, 84);
    }
  }

  return `Dự án ${category}`;
}

function extractLabeledSegment(
  rawText: string,
  labels: string[]
): string | undefined {
  for (const label of labels) {
    const regex = new RegExp(
      `(?:^|\\n)\\s*${label}\\s*[:\\-]\\s*([^\\n]+)`,
      'i'
    );
    const match = rawText.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

/**
 * Splits Vietnamese prose into sentences without breaking numbers like 185.000, 9.5/10, or 4.8%.
 */
function splitCleanSentences(text: string): string[] {
  return text
    .split(/(?<!\d)\.(?!\d)\s*|[;\n]+/)
    .map((s) => s.trim().replace(/\.+$/, ''))
    .filter((s) => s.length > 8);
}

function buildKeyTakeaways(
  title: string,
  category: string,
  solution: string,
  resultLine: string | undefined,
  tags: string[]
): string[] {
  const takeaways: string[] = [];

  if (resultLine) {
    const sentences = splitCleanSentences(resultLine);
    for (const sentence of sentences) {
      if (sentence.length > 105 && sentence.includes(', ')) {
        const clauses = sentence
          .split(/,\s+(?=[A-Za-zÀ-ỹ0-9+])/)
          .map((c) => c.trim())
          .filter((c) => c.length > 12);
        takeaways.push(...clauses);
      } else {
        takeaways.push(sentence);
      }
    }
  }

  if (takeaways.length < 3 && solution) {
    const solutionSentences = splitCleanSentences(solution);
    for (const s of solutionSentences) {
      if (takeaways.length >= 4) break;
      if (!takeaways.some((t) => t.includes(s.slice(0, 24)))) {
        takeaways.push(s);
      }
    }
  }

  if (takeaways.length < 3) {
    takeaways.push(
      `Hoàn thiện case study "${title}" theo quy trình Đề bài – Giải pháp – Kết quả`
    );
  }
  if (takeaways.length < 3) {
    takeaways.push(
      `Ứng dụng kỹ năng ${category}${
        tags.length > 0 ? ` (${tags.slice(0, 3).join(', ')})` : ''
      }`
    );
  }

  return Array.from(new Set(takeaways)).slice(0, 4);
}

function extractMetrics(rawText: string): Array<{ label: string; value: string }> {
  const metrics: Array<{ label: string; value: string }> = [];
  const seenValues = new Set<string>();

  const pushMetric = (label: string, value: string) => {
    const cleaned = value.trim();
    if (!cleaned || seenValues.has(cleaned)) return;
    seenValues.add(cleaned);
    metrics.push({ label, value: cleaned });
  };

  const scoreMatch = rawText.match(/(\d+(?:[.,]\d+)?\s*\/\s*10)/);
  if (scoreMatch) {
    pushMetric('Điểm đánh giá', scoreMatch[1].replace(/\s+/g, ''));
  }

  const pctMatches = Array.from(rawText.matchAll(/([+-]?\d+(?:[.,]\d+)?%)/g)).map(
    (m) => m[1]
  );
  if (pctMatches.length > 0) {
    // Prefer signed growth or highest-impact metric first
    const prioritized =
      pctMatches.find((p) => p.startsWith('+') || p.startsWith('-')) ??
      pctMatches[0];
    pushMetric('Chỉ số nổi bật', prioritized);
  }

  const scaleRegex =
    /(\d{1,3}(?:[.,]\d{3})+(?:\s*(?:lượt tiếp cận|lượt xem|lượt|khách hàng|đơn hàng|mẫu khảo sát|phản hồi|mẫu))?|\d+\s*(?:mẫu khảo sát|phản hồi|đơn hàng|lượt tiếp cận|template|bài đăng|video|mẫu|đơn|lượt|phút|bước))/gi;
  const scaleMatches = Array.from(rawText.matchAll(scaleRegex)).map((m) => m[1]);
  for (const scale of scaleMatches) {
    if (metrics.length >= 3) break;
    pushMetric('Quy mô / Tác động', scale);
  }

  return metrics.slice(0, 3);
}

function extractTags(rawText: string, category: string): string[] {
  const candidates = [
    'Canva',
    'Figma',
    'ChatGPT',
    'Gemini',
    'TikTok',
    'Facebook',
    'SEO',
    'AIDA',
    'PAS',
    'Landing Page',
    'Content Pillar',
    'Prompt Engineering',
    'Chain-of-Thought',
    'Few-shot',
    'CSAT',
    'Google Scholar',
    'Next.js',
    'React',
    'Analytics',
  ];
  const lower = rawText.toLowerCase();
  const matched = candidates.filter((kw) => lower.includes(kw.toLowerCase()));
  if (matched.length === 0) {
    return [category, 'Case Study', 'Thực hành'];
  }
  return matched.slice(0, 4);
}

function buildSuggestedPrompt(
  title: string,
  category: string,
  style: VisualStyle
): string {
  const stylePhrase =
    style === '3d-render'
      ? '3D isometric creative render'
      : style === 'minimal-photo'
      ? 'Minimalist clean workspace photography'
      : style === 'editorial-illustration'
      ? 'Modern magazine editorial flat illustration'
      : 'Modern pastel editorial illustration';
  return `${stylePhrase} representing "${title}" in the field of ${category}, clean visual storytelling cards, cohesive warm color palette`;
}

function inferSkillsFromAssignments(projects: ProjectItem[]) {
  const allText = projects
    .map(
      (p) =>
        `${p.title} ${p.category} ${p.summary} ${p.tags.join(' ')} ${p.fullRawExcerpt ?? ''}`
    )
    .join(' ')
    .toLowerCase();

  const categories = [
    {
      name: 'Chuyên môn & Thực chiến',
      skills: Array.from(new Set(projects.map((p) => p.category))).map(
        (cat, idx) => ({
          name: cat,
          level: Math.max(82, 95 - idx * 3),
        })
      ),
    },
    {
      name: 'Công cụ & Nền tảng',
      skills: [
        ...(allText.includes('canva')
          ? [{ name: 'Canva Visual & Editorial Design', level: 92 }]
          : []),
        ...(allText.includes('figma')
          ? [{ name: 'Figma Layout & Prototyping', level: 86 }]
          : []),
        ...(allText.includes('prompt') ||
        allText.includes('chatgpt') ||
        allText.includes('gemini')
          ? [{ name: 'AI Prompt Engineering (ChatGPT / Gemini)', level: 94 }]
          : []),
        ...(allText.includes('seo') ||
        allText.includes('content') ||
        allText.includes('aida')
          ? [{ name: 'Content Strategy & Copywriting', level: 90 }]
          : []),
        ...(allText.includes('khảo sát') ||
        allText.includes('nghiên cứu') ||
        allText.includes('csat')
          ? [{ name: 'Phân tích Insight & Dữ liệu Khách hàng', level: 88 }]
          : []),
      ],
    },
  ];

  if (categories[1].skills.length === 0) {
    categories[1].skills = [
      { name: 'Tổng hợp & Trình bày Báo cáo Số', level: 90 },
      { name: 'Ứng dụng AI hỗ trợ Sáng tạo', level: 88 },
      { name: 'Nghiên cứu & Giải quyết vấn đề', level: 86 },
    ];
  }

  return categories;
}

function detectStudentNameFromRawText(rawText: string): string | undefined {
  const match = rawText.match(
    /(?:học viên|sinh viên|tác giả|họ tên)\s*[:\-]\s*([^\n|]+)/i
  );
  return match?.[1]?.trim();
}

function detectStudentRoleFromRawText(rawText: string): string | undefined {
  const match = rawText.match(
    /(?:chuyên\s*ngành|ngành|định\s*hướng|vị\s*trí|role)\s*[:\-]\s*([^\n|]+)/i
  );
  return match?.[1]?.trim();
}

function buildLlmPrompts(
  flatAssignments: DetectedAssignment[],
  combinedRawText: string,
  studentProfile: SummarizeAssignmentsRequest['studentProfile'],
  visualStyle: VisualStyle
) {
  const systemPrompt = `You are a senior Vietnamese Portfolio Content Strategist.
Convert raw student assignments extracted from .docx files into concise, scannable, high-impact portfolio case studies in Vietnamese (and an English visual illustration prompt per project).
Rules:
1. Keep exact 1-to-1 mapping using each assignment's "index" (0..${flatAssignments.length - 1}). Never merge or drop assignments.
2. Clean project titles (remove prefixes like "Bài tập 1:", "Assignment 2 -") into attractive portfolio titles while preserving the specific topic/subject name.
3. For each project, produce:
   - "assignmentBrief": 1-2 crisp Vietnamese sentences summarizing the brief/goal.
   - "summary": 2-3 crisp Vietnamese sentences summarizing methodology, execution, and content.
   - "keyTakeaways": 3-4 concise Vietnamese bullet points highlighting outcomes and core skills.
   - "metrics": up to 3 real numbers extracted from the assignment text (do NOT invent numbers).
   - "tags": 3-5 relevant tools/skills/topics.
   - "suggestedAiImagePrompt": 1 descriptive English prompt tailored to the assignment topic and visual style "${visualStyle}".
4. Infer cohesive "skills" (2 categories) and write compelling Vietnamese "shortBio" & "biography".
5. Return ONLY valid JSON matching the requested schema.`;

  const userPayload = {
    studentHint: {
      fullName: studentProfile?.fullName || detectStudentNameFromRawText(combinedRawText) || null,
      roleTitle: studentProfile?.roleTitle || detectStudentRoleFromRawText(combinedRawText) || null,
    },
    visualStyle,
    assignments: flatAssignments.map((a, index) => ({
      index,
      sourceDocxFileName: a.sourceDocxFileName,
      rawHeading: a.rawHeading,
      rawText: a.rawText.slice(0, 3500),
    })),
  };

  return {
    systemPrompt,
    userPrompt: JSON.stringify(userPayload),
  };
}

const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    fullName: { type: 'STRING' },
    roleTitle: { type: 'STRING' },
    shortBio: { type: 'STRING' },
    biography: { type: 'STRING' },
    quickTags: { type: 'ARRAY', items: { type: 'STRING' } },
    skills: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          skills: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                level: { type: 'INTEGER' },
              },
              required: ['name', 'level'],
            },
          },
        },
        required: ['name', 'skills'],
      },
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          index: { type: 'INTEGER' },
          title: { type: 'STRING' },
          category: { type: 'STRING' },
          assignmentBrief: { type: 'STRING' },
          summary: { type: 'STRING' },
          keyTakeaways: { type: 'ARRAY', items: { type: 'STRING' } },
          metrics: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                label: { type: 'STRING' },
                value: { type: 'STRING' },
              },
              required: ['label', 'value'],
            },
          },
          tags: { type: 'ARRAY', items: { type: 'STRING' } },
          suggestedAiImagePrompt: { type: 'STRING' },
        },
        required: [
          'index',
          'title',
          'category',
          'assignmentBrief',
          'summary',
          'keyTakeaways',
          'metrics',
          'tags',
          'suggestedAiImagePrompt',
        ],
      },
    },
  },
  required: [
    'fullName',
    'roleTitle',
    'shortBio',
    'biography',
    'quickTags',
    'skills',
    'projects',
  ],
};

async function trySummarizeWithGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<LlmSummaryOutput | null> {
  try {
    const model = process.env.GEMINI_TEXT_MODEL?.trim() || 'gemini-2.5-flash';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_RESPONSE_SCHEMA,
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!res.ok) return null;

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const rawJsonText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) return null;

    const parsed = LlmSummaryOutputSchema.safeParse(JSON.parse(rawJsonText));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function trySummarizeWithOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<LlmSummaryOutput | null> {
  try {
    const model = process.env.OPENAI_TEXT_MODEL?.trim() || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawJsonText = json.choices?.[0]?.message?.content;
    if (!rawJsonText) return null;

    const parsed = LlmSummaryOutputSchema.safeParse(JSON.parse(rawJsonText));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function generateLlmSummaryIfAvailable(
  flatAssignments: DetectedAssignment[],
  combinedRawText: string,
  studentProfile: SummarizeAssignmentsRequest['studentProfile'],
  visualStyle: VisualStyle
): Promise<LlmSummaryOutput | null> {
  if (flatAssignments.length === 0) return null;

  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (!hasGemini && !hasOpenAI) return null;

  const { systemPrompt, userPrompt } = buildLlmPrompts(
    flatAssignments,
    combinedRawText,
    studentProfile,
    visualStyle
  );

  if (process.env.GEMINI_API_KEY?.trim()) {
    const geminiResult = await trySummarizeWithGemini(
      process.env.GEMINI_API_KEY.trim(),
      systemPrompt,
      userPrompt
    );
    if (geminiResult) return geminiResult;
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    const openAiResult = await trySummarizeWithOpenAI(
      process.env.OPENAI_API_KEY.trim(),
      systemPrompt,
      userPrompt
    );
    if (openAiResult) return openAiResult;
  }

  return null;
}

/**
 * Summarizes raw parsed assignments from 1 or more .docx files into structured
 * portfolio Projects, Skills, About bio, and handles the Dual Image Pipeline
 * (preserving .docx embedded media and generating topic-aware AI illustrations when needed).
 * Uses optional GEMINI_API_KEY / OPENAI_API_KEY structured JSON summarization with seamless
 * fallback to the deterministic Vietnamese heuristic summarizer when no API key is present.
 */
export type SummarizeAssignmentsResult = SummarizeAssignmentsResponse & {
  suggestedTheme?: ThemeConfig;
};

export async function summarizeAssignments(
  req: SummarizeAssignmentsRequest
): Promise<SummarizeAssignmentsResult> {
  const { extractions, studentProfile, imageMode, visualStyle, themeColors } = req;

  const combinedRawText = extractions.map((e) => e.rawText).join('\n');
  const detectedName = detectStudentNameFromRawText(combinedRawText);
  const detectedRole = detectStudentRoleFromRawText(combinedRawText);

  // Map extracted images by ID across all uploaded files
  const allImageById = new Map<string, ExtractedDocxImage>();
  for (const ext of extractions) {
    for (const img of ext.extractedImages) {
      allImageById.set(img.id, img);
    }
  }

  const flatAssignments: DetectedAssignment[] = extractions.flatMap(
    (e) => e.detectedAssignments
  );

  // Optional structured LLM enrichment (seamless null fallback when offline / no key)
  const llmOutput = await generateLlmSummaryIfAvailable(
    flatAssignments,
    combinedRawText,
    studentProfile,
    visualStyle
  );

  const fullName =
    studentProfile?.fullName?.trim() ||
    detectedName ||
    llmOutput?.fullName?.trim() ||
    'Học viên TNT Lab';
  const roleTitle =
    studentProfile?.roleTitle?.trim() ||
    detectedRole ||
    llmOutput?.roleTitle?.trim() ||
    'Digital Creator & AI Practical Portfolio';

  let docxImagesFound = 0;
  let aiImagesGenerated = 0;

  const projects: ProjectItem[] = [];

  for (let i = 0; i < flatAssignments.length; i++) {
    const item = flatAssignments[i];
    const llmItem =
      llmOutput?.projects.find((p) => p.index === i) ?? llmOutput?.projects[i];

    const heuristicCategory = inferCategory(item.rawHeading, item.rawText);
    const heuristicTitle = cleanProjectTitle(
      item.rawHeading,
      heuristicCategory,
      item.rawText
    );
    const heuristicBrief =
      extractLabeledSegment(item.rawText, [
        'Đề bài',
        'Mục tiêu',
        'Yêu cầu',
        'Brief',
      ]) || item.rawText.split('\n').slice(0, 2).join(' ').slice(0, 220);
    const heuristicSolution =
      extractLabeledSegment(item.rawText, [
        'Cách làm',
        'Giải pháp',
        'Thực hiện',
        'Phương pháp',
      ]) || item.rawText.slice(0, 280);
    const resultLine = extractLabeledSegment(item.rawText, [
      'Kết quả',
      'Thành quả',
      'Đánh giá',
    ]);
    const heuristicTags = extractTags(item.rawText, heuristicCategory);
    const heuristicTakeaways = buildKeyTakeaways(
      heuristicTitle,
      heuristicCategory,
      heuristicSolution,
      resultLine,
      heuristicTags
    );
    const heuristicMetrics = extractMetrics(item.rawText);
    const heuristicPrompt = buildSuggestedPrompt(
      heuristicTitle,
      heuristicCategory,
      visualStyle
    );

    const title = llmItem?.title?.trim() || heuristicTitle;
    const category = llmItem?.category?.trim() || heuristicCategory;
    const assignmentBrief = llmItem?.assignmentBrief?.trim() || heuristicBrief;
    const solution = llmItem?.summary?.trim() || heuristicSolution;
    const keyTakeaways =
      llmItem?.keyTakeaways && llmItem.keyTakeaways.length > 0
        ? llmItem.keyTakeaways.slice(0, 4)
        : heuristicTakeaways;
    const metrics =
      llmItem?.metrics && llmItem.metrics.length > 0
        ? llmItem.metrics.slice(0, 3)
        : heuristicMetrics;
    const tags =
      llmItem?.tags && llmItem.tags.length > 0
        ? llmItem.tags.slice(0, 5)
        : heuristicTags;
    const suggestedAiImagePrompt =
      llmItem?.suggestedAiImagePrompt?.trim() || heuristicPrompt;

    const docxMediaForItem: ProjectMediaItem[] = item.imageIds
      .map((id) => allImageById.get(id))
      .filter((img): img is ExtractedDocxImage => Boolean(img))
      .map((img, mIdx) => ({
        id: img.id,
        url: img.savedUrl,
        caption: `Ảnh trích xuất từ ${item.sourceDocxFileName} (#${mIdx + 1})`,
        sourceType: 'docx-extracted' as const,
        originalDocxMediaName: img.originalName,
      }));

    let finalMedia: ProjectMediaItem[] = [];

    if (imageMode === 'docx-extract') {
      finalMedia = docxMediaForItem;
      docxImagesFound += docxMediaForItem.length;
    } else if (imageMode === 'ai-generate-all') {
      const gen = await generateTopicImage({
        topicTitle: title,
        assignmentSummary: solution,
        customPrompt: suggestedAiImagePrompt,
        visualStyle,
        themeColors,
        aspectRatio: '4:3',
      });
      aiImagesGenerated += 1;
      finalMedia = [
        {
          id: `ai-init-${Date.now()}-${i}`,
          url: gen.url,
          caption: `Ảnh AI theo chủ đề: ${title}`,
          sourceType: 'ai-generated',
          aiPromptUsed: gen.promptUsed,
        },
      ];
    } else {
      // hybrid-auto: preserve DOCX images if present, generate AI image if missing
      if (docxMediaForItem.length > 0) {
        finalMedia = docxMediaForItem;
        docxImagesFound += docxMediaForItem.length;
      } else {
        const gen = await generateTopicImage({
          topicTitle: title,
          assignmentSummary: solution,
          customPrompt: suggestedAiImagePrompt,
          visualStyle,
          themeColors,
          aspectRatio: '4:3',
        });
        aiImagesGenerated += 1;
        finalMedia = [
          {
            id: `ai-auto-${Date.now()}-${i}`,
            url: gen.url,
            caption: `Ảnh AI tự động bù theo chủ đề: ${title}`,
            sourceType: 'ai-generated',
            aiPromptUsed: gen.promptUsed,
          },
        ];
      }
    }

    projects.push({
      id: `proj-docx-${i + 1}-${Date.now()}`,
      title,
      category,
      sourceDocxFileName: item.sourceDocxFileName,
      assignmentBrief,
      summary: solution,
      keyTakeaways,
      fullRawExcerpt: item.rawText,
      metrics,
      media: finalMedia,
      suggestedAiImagePrompt,
      preferredImageStyle: visualStyle,
      links: [],
      tags,
    });
  }

  const skills =
    llmOutput?.skills && llmOutput.skills.length > 0
      ? llmOutput.skills.map((cat) => ({
          name: cat.name,
          skills: cat.skills.map((sk) => ({
            name: sk.name,
            level: Math.max(0, Math.min(100, Math.round(sk.level))),
          })),
        }))
      : inferSkillsFromAssignments(projects);

  const categoriesList = Array.from(new Set(projects.map((p) => p.category)));

  const shortBio =
    llmOutput?.shortBio?.trim() ||
    `Tổng hợp ${projects.length} bài tập và dự án thực hành về ${categoriesList.join(', ')} được xây dựng bài bản và đo lường kết quả rõ ràng.`;
  const biography =
    llmOutput?.biography?.trim() ||
    `Xin chào! Mình là ${fullName} (${roleTitle}). Portfolio này được tổng hợp trực tiếp từ hồ sơ bài tập thực chiến gồm ${projects.length} dự án thuộc các mảng ${categoriesList.join(', ')}. Mỗi bài tập đều được chuẩn hóa theo tư duy Đề bài - Giải pháp - Kết quả nhằm thể hiện năng lực triển khai thực tế.`;
  const quickTags =
    llmOutput?.quickTags && llmOutput.quickTags.length > 0
      ? llmOutput.quickTags.slice(0, 4)
      : categoriesList.slice(0, 4);

  const contextKeywords = [
    ...categoriesList,
    ...projects.map((p) => p.title),
    ...projects.flatMap((p) => p.tags || []),
  ];
  const suggestedTheme = resolveThemeFromContext(contextKeywords);

  const baseSummary = SummarizeAssignmentsResponseSchema.parse({
    fullName,
    roleTitle,
    shortBio,
    biography,
    quickTags,
    highlights: [
      { label: 'Dự án thực hành', value: `${projects.length} Case Studies` },
      { label: 'Ảnh từ DOCX', value: `${docxImagesFound} ảnh` },
      { label: 'Ảnh AI bổ sung', value: `${aiImagesGenerated} ảnh` },
      { label: 'Lĩnh vực chính', value: categoriesList[0] || 'Digital' },
    ],
    skills,
    projects,
    stats: {
      totalFiles: extractions.length,
      totalAssignments: projects.length,
      docxImagesFound,
      aiImagesGenerated,
    },
    suggestedTheme,
  });

  return baseSummary;
}
