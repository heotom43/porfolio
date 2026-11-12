import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import type {
  DetectedAssignment,
  ExtractedDocxImage,
  RawDocxExtractionResult,
} from '@/schema/docx-ingestion.schema';

const DOCX_MEDIA_DIR = path.resolve(process.cwd(), 'public/uploads/docx-media');

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const ASSIGNMENT_HEADING_REGEX =
  /^(?:bài(?:\s+tập)?|assignment|project|dự\s*án|case\s*study|phần|chương|chủ\s*đề)\s*(?:số\s*)?(?:\d+|[ivx]+)\b[:.\-\s]*/i;

const TOPIC_MARKER_REGEX = /^(?:chủ\s*đề|đề\s*tài)\s*[:\-]\s*\S+/i;

/**
 * Splits mammoth HTML output into distinct assignment blocks while preserving
 * embedded image positions so each image stays bound to its matching assignment.
 */
function splitHtmlIntoAssignments(
  htmlPreview: string,
  fileName: string,
  extractedImages: ExtractedDocxImage[]
): DetectedAssignment[] {
  // Split HTML into top-level block tokens (<h1..h4>, <p>, <table>, <ul>, <ol>)
  const blockRegex =
    /<(h[1-4]|p|table|ul|ol|div)[^>]*>[\s\S]*?<\/\1>/gi;
  const blocks = htmlPreview.match(blockRegex) ?? [htmlPreview];

  type Bucket = { heading: string; blocks: string[] };
  const buildBuckets = (useTopicMarkers: boolean): { buckets: Bucket[]; preambleBlocks: string[] } => {
    const buckets: Bucket[] = [];
    let currentBucket: Bucket | null = null;
    const preambleBlocks: string[] = [];

    for (const block of blocks) {
      const isH1OrH2 = /^<h[12]\b/i.test(block);
      const plain = stripHtmlTags(block);
      const matchesAssignmentKeyword = useTopicMarkers
        ? TOPIC_MARKER_REGEX.test(plain)
        : ASSIGNMENT_HEADING_REGEX.test(plain);

      const isSplitBoundary =
        (!useTopicMarkers && isH1OrH2 && plain.length > 0 && plain.length < 180) ||
        (matchesAssignmentKeyword && plain.length < 180);

      if (isSplitBoundary) {
        if (currentBucket) {
          buckets.push(currentBucket);
        }
        currentBucket = {
          heading: plain || `Bài tập ${buckets.length + 1}`,
          blocks: [block],
        };
      } else if (currentBucket) {
        currentBucket.blocks.push(block);
      } else {
        preambleBlocks.push(block);
      }
    }

    if (currentBucket) {
      buckets.push(currentBucket);
    }
    return { buckets, preambleBlocks };
  };

  let { buckets, preambleBlocks } = buildBuckets(false);

  // Secondary fallback: split on standalone "Chủ đề:" / "Đề tài:" markers only if
  // no primary heading/numbered assignment boundaries were detected and >= 2 markers exist.
  if (buckets.length === 0) {
    const topicPass = buildBuckets(true);
    if (topicPass.buckets.length >= 2) {
      buckets = topicPass.buckets;
      preambleBlocks = topicPass.preambleBlocks;
    }
  }

  // If no explicit assignment boundaries were found, treat whole document as 1 assignment
  if (buckets.length === 0) {
    const cleanBaseName = fileName.replace(/\.docx$/i, '').replace(/[_-]+/g, ' ');
    const fullText = stripHtmlTags(htmlPreview);
    const allImageIds = extractedImages.map((img) => img.id);
    extractedImages.forEach((img) => {
      img.assignmentIndexHint = 0;
    });
    return [
      {
        index: 0,
        sourceDocxFileName: fileName,
        rawHeading: cleanBaseName || 'Bài tập thực hành',
        rawText: fullText,
        htmlSegment: htmlPreview,
        imageIds: allImageIds,
      },
    ];
  }

  // If preamble happened to contain images before the first heading, attach them to assignment 0
  if (preambleBlocks.length > 0) {
    const preambleHtml = preambleBlocks.join('\n');
    if (/<img\b/i.test(preambleHtml)) {
      buckets[0].blocks.unshift(preambleHtml);
    }
  }

  return buckets.map((bucket, idx) => {
    const htmlSegment = bucket.blocks.join('\n');
    const imgIdMatches = Array.from(
      htmlSegment.matchAll(/data-docx-img-id="([^"]+)"/g)
    ).map((m) => m[1]);

    // Fallback: match by savedUrl in htmlSegment
    const urlMatchedIds = extractedImages
      .filter((img) => htmlSegment.includes(img.savedUrl))
      .map((img) => img.id);

    const imageIds = Array.from(new Set([...imgIdMatches, ...urlMatchedIds]));
    const rawText = bucket.blocks.map(stripHtmlTags).filter(Boolean).join('\n');

    imageIds.forEach((imgId) => {
      const target = extractedImages.find((e) => e.id === imgId);
      if (target) {
        target.assignmentIndexHint = idx;
        target.surroundingTextContext = rawText.slice(0, 260);
      }
    });

    return {
      index: idx,
      sourceDocxFileName: fileName,
      rawHeading: bucket.heading,
      rawText,
      htmlSegment,
      imageIds,
    };
  });
}

/**
 * Extracts structured text, HTML preview, embedded images (saved to public/uploads/docx-media/),
 * and automatically splits multiple assignments from a .docx buffer.
 */
export async function parseDocxBuffer(
  buffer: Buffer,
  fileName: string
): Promise<RawDocxExtractionResult> {
  fs.mkdirSync(DOCX_MEDIA_DIR, { recursive: true });

  // Inspect zip media names for originalDocxMediaName reference
  const zip = await JSZip.loadAsync(buffer);
  const mediaEntries = Object.keys(zip.files)
    .filter((k) => k.startsWith('word/media/') && !zip.files[k].dir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const timestamp = Date.now();
  const safeSlug = fileName
    .replace(/\.docx$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 28);

  const extractedImages: ExtractedDocxImage[] = [];
  let imageCounter = 0;

  const htmlResult = await mammoth.convertToHtml(
    { buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        imageCounter += 1;
        const imgBuffer = await image.read();
        const mimeType = image.contentType || 'image/png';
        const ext = MIME_TO_EXT[mimeType] || 'png';
        const hash = crypto
          .createHash('md5')
          .update(imgBuffer)
          .digest('hex')
          .slice(0, 6);
        const savedFileName = `${timestamp}-${safeSlug}-${imageCounter}-${hash}.${ext}`;
        const savedFilePath = path.join(DOCX_MEDIA_DIR, savedFileName);

        fs.writeFileSync(savedFilePath, imgBuffer);

        const savedUrl = `/uploads/docx-media/${savedFileName}`;
        const imgId = `docx-img-${timestamp}-${imageCounter}`;
        const originalName =
          mediaEntries[imageCounter - 1] ?? `word/media/image${imageCounter}.${ext}`;

        extractedImages.push({
          id: imgId,
          savedUrl,
          mimeType,
          originalName,
          surroundingTextContext: '',
        });

        return {
          src: savedUrl,
          alt: `Embedded media ${imageCounter}`,
          'data-docx-img-id': imgId,
        };
      }),
    }
  );

  const rawTextResult = await mammoth.extractRawText({ buffer });
  const rawText = rawTextResult.value.trim();
  const htmlPreview = htmlResult.value;

  const detectedAssignments = splitHtmlIntoAssignments(
    htmlPreview,
    fileName,
    extractedImages
  );

  return {
    fileName,
    rawText,
    htmlPreview,
    extractedImages,
    detectedAssignments,
  };
}
