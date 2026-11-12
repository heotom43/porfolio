import fs from "fs";
import path from "path";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import tuthivananhPreset from "@/data/presets/tuthivananh-sample.json";
import {
  ImageModeSchema,
  PortfolioDocumentSchema,
  TemplateIdSchema,
  VisualStyleSchema,
  type TemplateId,
  type PortfolioDocument,
} from "@/schema/portfolio.schema";
import { THEME_PRESETS } from "@/schema/theme.schema";
import { parseDocxBuffer } from "@/services/docx/docx-parser";
import { summarizeAssignments } from "@/services/ai/summarize-assignments";
import {
  sanitizeSlug,
  savePortfolioDocument,
} from "@/services/export/portfolio-repository";

interface CsvRowInfo {
  fileName?: string;
  fullName?: string;
  roleTitle?: string;
  email?: string;
  avatarUrl?: string;
}

const BatchLayoutSchema = z.enum(["standard", "projects-first"]);
const BatchFileOptionsSchema = z
  .object({
    templateId: TemplateIdSchema.optional(),
    layout: BatchLayoutSchema.optional(),
    visualStyle: VisualStyleSchema.optional(),
  })
  .strict();

function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

function parseSimpleCsv(csvText: string): CsvRowInfo[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: CsvRowInfo = {};
    headers.forEach((h, i) => {
      if (h.includes("file")) row.fileName = cols[i];
      else if (h.includes("name") || h.includes("ten")) row.fullName = cols[i];
      else if (h.includes("role") || h.includes("nganh"))
        row.roleTitle = cols[i];
      else if (h.includes("mail")) row.email = cols[i];
      else if (h.includes("avatar") || h.includes("anh"))
        row.avatarUrl = cols[i];
    });
    return row;
  });
}

function inferNameFromFilename(fileName: string): string {
  const base = fileName
    .replace(/\.docx$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b(baitap|bai tap|assignment|portfolio|profile)\b/gi, "")
    .trim();
  return base || "Học viên TNT Lab";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const useSampleBatch = formData.get("useSampleBatch") === "true";

    const imageMode = ImageModeSchema.parse(
      formData.get("imageMode") || "hybrid-auto",
    );
    const visualStyle = VisualStyleSchema.parse(
      formData.get("visualStyle") || "canva-pastel-graphic",
    );
    const defaultLayout = BatchLayoutSchema.parse(
      formData.get("layout") || "standard",
    );
    const defaultTemplateId = TemplateIdSchema.parse(
      formData.get("templateId") || "canva-editorial",
    );
    const csvText = String(formData.get("csvText") || "");
    const csvRows = csvText ? parseSimpleCsv(csvText) : [];

    const baseTemplateDoc = PortfolioDocumentSchema.parse(tuthivananhPreset);

    type InputEntry = {
      fileName: string;
      buffer: Buffer;
      overrideName?: string;
      overrideRole?: string;
      overrideEmail?: string;
      overrideAvatarUrl?: string;
    };

    const inputs: InputEntry[] = [];

    if (useSampleBatch) {
      const samplePath = path.resolve(
        process.cwd(),
        "references/sample-assignments.docx",
      );
      if (!fs.existsSync(samplePath)) {
        return NextResponse.json(
          { error: "Sample DOCX not found" },
          { status: 404 },
        );
      }
      const sampleBuf = fs.readFileSync(samplePath);
      inputs.push({
        fileName: "sample-assignments.docx",
        buffer: sampleBuf,
        overrideName: "Hồ sơ minh họa",
        overrideRole: "Dữ liệu mẫu",
      });
    } else {
      const uploadedFiles = formData
        .getAll("files")
        .filter((f): f is File => f instanceof File);

      if (uploadedFiles.length === 0) {
        return NextResponse.json(
          { error: "Vui lòng chọn ít nhất 1 file .docx" },
          { status: 400 },
        );
      }

      for (let i = 0; i < uploadedFiles.length; i++) {
        const f = uploadedFiles[i];
        const buf = Buffer.from(await f.arrayBuffer());
        const csvMatch =
          csvRows.find(
            (r) =>
              r.fileName && r.fileName.toLowerCase() === f.name.toLowerCase(),
          ) ?? csvRows[i];

        inputs.push({
          fileName: f.name,
          buffer: buf,
          overrideName: csvMatch?.fullName || inferNameFromFilename(f.name),
          overrideRole: csvMatch?.roleTitle,
          overrideEmail: csvMatch?.email,
          overrideAvatarUrl: csvMatch?.avatarUrl,
        });
      }
    }

    const fileOptionsValue = formData.get("fileOptions");
    let perFileOptions: z.infer<typeof BatchFileOptionsSchema>[] = [];
    if (fileOptionsValue !== null) {
      if (typeof fileOptionsValue !== "string") {
        return NextResponse.json(
          { error: "Tùy chọn theo file phải là dữ liệu JSON hợp lệ." },
          { status: 400 },
        );
      }

      let parsedOptions: unknown;
      try {
        parsedOptions = JSON.parse(fileOptionsValue);
      } catch {
        return NextResponse.json(
          { error: "Tùy chọn theo file phải là dữ liệu JSON hợp lệ." },
          { status: 400 },
        );
      }
      const validatedOptions = z
        .array(BatchFileOptionsSchema)
        .safeParse(parsedOptions);
      if (!validatedOptions.success) {
        return NextResponse.json(
          {
            error:
              "Tùy chọn template, bố cục hoặc phong cách ảnh không hợp lệ.",
          },
          { status: 400 },
        );
      }
      if (validatedOptions.data.length !== inputs.length) {
        return NextResponse.json(
          { error: "Số tùy chọn phải khớp với số file đầu vào." },
          { status: 400 },
        );
      }
      perFileOptions = validatedOptions.data;
    }

    const createdResults: Array<{
      slug: string;
      fullName: string;
      roleTitle: string;
      url: string;
      assignmentCount: number;
      docxImages: number;
      aiImages: number;
      document: PortfolioDocument;
    }> = [];

    const usedSlugs = new Set<string>();

    for (let i = 0; i < inputs.length; i++) {
      const entry = inputs[i];
      const options = perFileOptions[i] ?? {};
      const templateId: TemplateId = options.templateId ?? defaultTemplateId;
      const fileLayout = options.layout ?? defaultLayout;
      const fileVisualStyle = options.visualStyle ?? visualStyle;
      const preset =
        THEME_PRESETS.find((p) => p.templateId === templateId) ??
        THEME_PRESETS[0];
      const effectiveTheme =
        templateId === "canva-editorial"
          ? { ...baseTemplateDoc.theme }
          : { ...preset.theme };
      const extraction = await parseDocxBuffer(entry.buffer, entry.fileName);

      const summary = await summarizeAssignments({
        extractions: [extraction],
        studentProfile: {
          fullName: entry.overrideName,
          roleTitle: entry.overrideRole,
          email: entry.overrideEmail,
          avatarUrl: entry.overrideAvatarUrl,
        },
        imageMode,
        visualStyle: fileVisualStyle,
        themeColors: {
          primaryColor: effectiveTheme.primaryColor,
          backgroundColor: effectiveTheme.backgroundColor,
        },
      });

      const baseSlug = sanitizeSlug(`${summary.fullName}portfolio`);
      let slug = baseSlug;
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix++}`;
      }
      usedSlugs.add(slug);

      const generatedSections = baseTemplateDoc.sections.map((sec) => {
        if (sec.type === "hero") {
          return {
            ...sec,
            variant: sec.variant,
            headline: "Digital Portfolio",
            fullName: summary.fullName,
            roleTitle: summary.roleTitle,
            shortBio: summary.shortBio,
            avatar: {
              ...sec.avatar,
              url: entry.overrideAvatarUrl || "",
              sourceType: entry.overrideAvatarUrl
                ? ("user-uploaded" as const)
                : ("docx-extracted" as const),
            },
            quickTags: summary.quickTags,
            ctaButtons: sec.ctaButtons.map((btn) => ({ ...btn })),
            decorations: sec.decorations.map((dec) => ({
              ...dec,
              position: { ...dec.position },
            })),
          };
        }
        if (sec.type === "about") {
          return {
            ...sec,
            variant: sec.variant,
            title: sec.title,
            biography: summary.biography,
            highlights: summary.highlights,
            contactInfo: {
              email: entry.overrideEmail,
              socials: [],
            },
          };
        }
        if (sec.type === "skills") {
          return {
            ...sec,
            variant: sec.variant,
            title: sec.title,
            categories: summary.skills,
          };
        }
        if (sec.type === "education") {
          return {
            ...sec,
            items: [],
          };
        }
        if (sec.type === "projects") {
          return {
            ...sec,
            variant: sec.variant,
            title: `Project • ${String(summary.projects.length).padStart(
              2,
              "0",
            )} Bài Tập Thực Hành`,
            subtitle:
              "Nội dung được tổng hợp từ tài liệu DOCX đã nạp; vui lòng kiểm tra tính chính xác trước khi công bố.",
            projects: summary.projects,
          };
        }
        if (sec.type === "contact") {
          return {
            ...sec,
            title: sec.title,
            subtitle: `Cảm ơn bạn đã xem hồ sơ của ${summary.fullName}. Vui lòng xác nhận thông tin liên hệ trước khi công bố.`,
            thankYouMessage: sec.thankYouMessage,
            showContactForm: sec.showContactForm,
          };
        }
        return sec;
      });
      const sections =
        fileLayout === "projects-first"
          ? [
              ...generatedSections.filter(
                (section) => section.type === "projects",
              ),
              ...generatedSections.filter(
                (section) => section.type !== "projects",
              ),
            ]
          : generatedSections;

      const doc: PortfolioDocument = {
        ...baseTemplateDoc,
        id: `batch-${slug}-${Date.now()}-${i}`,
        slug,
        templateId,
        imageGenerationConfig: {
          mode: imageMode,
          visualStyle: fileVisualStyle,
        },
        seo: {
          title: `${summary.fullName} | Digital Portfolio 2026`,
          description: summary.shortBio,
          ogImage: entry.overrideAvatarUrl,
        },
        theme: effectiveTheme,
        sections,
      };

      const saved = savePortfolioDocument(doc);
      createdResults.push({
        slug: saved.slug,
        fullName: summary.fullName,
        roleTitle: summary.roleTitle,
        url: `/${saved.slug}`,
        assignmentCount: summary.stats.totalAssignments,
        docxImages: summary.stats.docxImagesFound,
        aiImages: summary.stats.aiImagesGenerated,
        document: saved,
      });
    }

    return NextResponse.json({
      count: createdResults.length,
      portfolios: createdResults,
    });
  } catch (error) {
    console.error("Batch factory error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Batch generation failed",
      },
      { status: 500 },
    );
  }
}
