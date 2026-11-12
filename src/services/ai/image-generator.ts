import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { VisualStyle } from '@/schema/portfolio.schema';
import type { GenerateTopicImageRequest } from '@/schema/docx-ingestion.schema';

const AI_IMAGES_DIR = path.resolve(process.cwd(), 'public/uploads/ai-generated');

const STYLE_PROMPTS: Record<VisualStyle, string> = {
  'canva-pastel-graphic':
    'Canva pastel editorial graphic design, soft warm cream and terracotta accents, clean flat vector cards, harmonious shapes, high aesthetic presentation',
  'editorial-illustration':
    'Modern magazine editorial flat illustration, expressive geometric characters and workspace motifs, refined limited color palette, clean crisp lines',
  '3d-render':
    'Soft 3D isometric clay render, studio lighting, tactile matte materials, subtle depth of field, modern creative tech aesthetic',
  'minimal-photo':
    'Minimalist lifestyle editorial photography, natural soft daylight, tidy creative workspace flatlay, shallow depth of field',
};

const DIMENSIONS: Record<'16:9' | '4:3' | '1:1', { w: number; h: number }> = {
  '16:9': { w: 1280, h: 720 },
  '4:3': { w: 1200, h: 900 },
  '1:1': { w: 1024, h: 1024 },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFinalPrompt(req: GenerateTopicImageRequest): string {
  const baseTopic =
    req.customPrompt?.trim() ||
    `${req.topicTitle}. Context: ${req.assignmentSummary.slice(0, 180)}`;
  const styleDesc = STYLE_PROMPTS[req.visualStyle];
  const colorHint = req.themeColors
    ? `Color palette inspired by ${req.themeColors.primaryColor} and ${req.themeColors.backgroundColor}.`
    : '';
  return `${baseTopic}. ${styleDesc}. ${colorHint} No watermark, no messy text overlay.`;
}

/**
 * Generates an on-theme artistic vector SVG graphic saved locally when external
 * image endpoints are unreachable or offline. Guarantees 100% zero broken images.
 */
function createLocalArtisticSvg(
  req: GenerateTopicImageRequest,
  seed: number
): string {
  const primary = req.themeColors?.primaryColor || '#A96B54';
  const bg = req.themeColors?.backgroundColor || '#FFF3E6';
  const secondary = '#304254';
  const titleLines = req.topicTitle.slice(0, 56);
  const accentX = 180 + (seed % 420);
  const accentY = 160 + ((seed >> 4) % 240);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" fill="none">
  <rect width="1200" height="900" fill="${bg}"/>
  <circle cx="${accentX}" cy="${accentY}" r="230" fill="${primary}" opacity="0.16"/>
  <circle cx="960" cy="700" r="240" fill="${secondary}" opacity="0.12"/>
  <rect x="96" y="104" width="1008" height="692" rx="36" fill="#FFFFFF" stroke="${primary}" stroke-opacity="0.25" stroke-width="3"/>
  <rect x="96" y="104" width="1008" height="84" rx="36" fill="${secondary}"/>
  <rect x="96" y="156" width="1008" height="32" fill="${secondary}"/>
  <circle cx="152" cy="146" r="10" fill="#FAF5EE"/>
  <circle cx="186" cy="146" r="10" fill="#FAF5EE" opacity="0.7"/>
  <circle cx="220" cy="146" r="10" fill="#FAF5EE" opacity="0.45"/>
  <rect x="148" y="236" width="440" height="480" rx="28" fill="${bg}"/>
  <path d="M210 560C210 420 278 330 368 330C458 330 526 420 526 560H210Z" fill="${primary}" opacity="0.88"/>
  <circle cx="368" cy="390" r="64" fill="#FFFFFF" opacity="0.92"/>
  <path d="M368 346L380 378L412 390L380 402L368 434L356 402L324 390L356 378L368 346Z" fill="${secondary}"/>
  <rect x="634" y="236" width="416" height="52" rx="26" fill="${primary}" opacity="0.16"/>
  <text x="664" y="270" fill="${primary}" font-family="system-ui, sans-serif" font-size="22" font-weight="700">AI TOPIC ILLUSTRATION</text>
  <text x="634" y="352" fill="#24201E" font-family="Georgia, serif" font-size="34" font-weight="700">${escapeXml(titleLines.slice(0, 26))}</text>
  <text x="634" y="398" fill="#24201E" font-family="Georgia, serif" font-size="34" font-weight="700">${escapeXml(titleLines.slice(26, 54))}</text>
  <rect x="634" y="454" width="380" height="18" rx="9" fill="#E5DCD2"/>
  <rect x="634" y="488" width="320" height="18" rx="9" fill="#E5DCD2"/>
  <rect x="634" y="556" width="180" height="140" rx="22" fill="${primary}" opacity="0.22"/>
  <rect x="836" y="556" width="180" height="140" rx="22" fill="${secondary}" opacity="0.15"/>
  <rect x="662" y="640" width="28" height="36" rx="6" fill="${primary}"/>
  <rect x="704" y="616" width="28" height="60" rx="6" fill="${primary}"/>
  <rect x="746" y="592" width="28" height="84" rx="6" fill="${secondary}"/>
  <circle cx="926" cy="626" r="36" fill="${secondary}" opacity="0.75"/>
</svg>`;
}

export interface GeneratedTopicImageResult {
  url: string;
  provider: 'gemini-imagen' | 'openai-dalle3' | 'pollinations-flux' | 'local-editorial-svg';
  promptUsed: string;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

function getExtFromMime(mimeType?: string): string {
  if (!mimeType) return 'png';
  const normalized = mimeType.toLowerCase().split(';')[0].trim();
  return MIME_TO_EXT[normalized] || 'png';
}

/**
 * Attempts image generation with Google Gemini Imagen 3 (and falls back to
 * Gemini native image generation if Imagen 3 is unavailable on the API key).
 */
async function tryGenerateWithGeminiImagen(
  apiKey: string,
  promptUsed: string,
  aspectRatio: '16:9' | '4:3' | '1:1',
  hash: string
): Promise<GeneratedTopicImageResult | null> {
  const imagenModels = Array.from(
    new Set([
      process.env.GEMINI_IMAGEN_MODEL?.trim() || 'imagen-3.0-generate-002',
      'imagen-4.0-generate-001',
    ])
  );

  for (const model of imagenModels) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            instances: [{ prompt: promptUsed }],
            parameters: {
              sampleCount: 1,
              aspectRatio,
            },
          }),
          signal: AbortSignal.timeout(25000),
        }
      );

      if (res.ok) {
        const json = (await res.json()) as {
          predictions?: Array<{
            bytesBase64Encoded?: string;
            mimeType?: string;
          }>;
        };
        const prediction = json.predictions?.[0];
        if (prediction?.bytesBase64Encoded) {
          const ext = getExtFromMime(prediction.mimeType);
          const fileName = `ai-gemini-${Date.now()}-${hash}.${ext}`;
          fs.writeFileSync(
            path.join(AI_IMAGES_DIR, fileName),
            Buffer.from(prediction.bytesBase64Encoded, 'base64')
          );
          return {
            url: `/uploads/ai-generated/${fileName}`,
            provider: 'gemini-imagen',
            promptUsed,
          };
        }
      }

      // If key/quota failed (401/403/429), skip trying another Gemini model
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        return null;
      }
    } catch {
      // Try next Gemini image endpoint/fallback
    }
  }

  // Forward-compatible fallback: native Gemini Flash Image (:generateContent)
  try {
    const flashModel =
      process.env.GEMINI_FLASH_IMAGE_MODEL?.trim() || 'gemini-2.5-flash-image';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        flashModel
      )}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptUsed }] }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: { aspectRatio },
          },
        }),
        signal: AbortSignal.timeout(25000),
      }
    );

    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              inlineData?: { data?: string; mimeType?: string };
            }>;
          };
        }>;
      };
      const parts = json.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find((p) => p.inlineData?.data);
      if (imgPart?.inlineData?.data) {
        const ext = getExtFromMime(imgPart.inlineData.mimeType);
        const fileName = `ai-gemini-${Date.now()}-${hash}.${ext}`;
        fs.writeFileSync(
          path.join(AI_IMAGES_DIR, fileName),
          Buffer.from(imgPart.inlineData.data, 'base64')
        );
        return {
          url: `/uploads/ai-generated/${fileName}`,
          provider: 'gemini-imagen',
          promptUsed,
        };
      }
    }
  } catch {
    // Fall through cleanly to next provider
  }

  return null;
}

/**
 * Multi-provider Topic-Aware AI Image Generator.
 * Priority:
 * 1. Gemini Imagen 3 (when GEMINI_API_KEY is configured)
 * 2. OpenAI DALL-E 3 (when OPENAI_API_KEY is configured)
 * 3. Pollinations.ai Flux (free, no API key required)
 * 4. Local theme-matched editorial SVG asset (100% offline-resilient fallback)
 */
export async function generateTopicImage(
  req: GenerateTopicImageRequest
): Promise<GeneratedTopicImageResult> {
  fs.mkdirSync(AI_IMAGES_DIR, { recursive: true });

  const aspectRatio = req.aspectRatio || '4:3';
  const promptUsed = buildFinalPrompt(req);
  const dims = DIMENSIONS[aspectRatio];
  const hash = crypto
    .createHash('md5')
    .update(`${req.topicTitle}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .slice(0, 8);
  const seed = parseInt(hash, 16) % 999999;

  // Provider 1: Google Gemini Imagen 3 (when GEMINI_API_KEY is configured)
  if (process.env.GEMINI_API_KEY) {
    const geminiResult = await tryGenerateWithGeminiImagen(
      process.env.GEMINI_API_KEY,
      promptUsed,
      aspectRatio,
      hash
    );
    if (geminiResult) {
      return geminiResult;
    }
  }

  // Provider 2: OpenAI DALL-E 3 (when OPENAI_API_KEY is configured)
  if (process.env.OPENAI_API_KEY) {
    try {
      const openAiSize = aspectRatio === '16:9' ? '1792x1024' : '1024x1024';
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: promptUsed,
          n: 1,
          size: openAiSize,
          response_format: 'b64_json',
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          data?: Array<{ b64_json?: string }>;
        };
        const b64 = json.data?.[0]?.b64_json;
        if (b64) {
          const fileName = `ai-openai-${Date.now()}-${hash}.png`;
          fs.writeFileSync(
            path.join(AI_IMAGES_DIR, fileName),
            Buffer.from(b64, 'base64')
          );
          return {
            url: `/uploads/ai-generated/${fileName}`,
            provider: 'openai-dalle3',
            promptUsed,
          };
        }
      }
    } catch {
      // Fall through to next provider
    }
  }

  // Provider 3: Pollinations.ai Flux (free, no API key required)
  try {
    const encodedPrompt = encodeURIComponent(promptUsed);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.w}&height=${dims.h}&seed=${seed}&nologo=true&model=flux`;
    const res = await fetch(pollinationsUrl, {
      signal: AbortSignal.timeout(12000),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.startsWith('image/')) {
      const arrayBuf = await res.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      if (buf.length > 1024) {
        const ext = contentType.includes('png')
          ? 'png'
          : contentType.includes('webp')
          ? 'webp'
          : 'jpg';
        const fileName = `ai-flux-${Date.now()}-${hash}.${ext}`;
        fs.writeFileSync(path.join(AI_IMAGES_DIR, fileName), buf);
        return {
          url: `/uploads/ai-generated/${fileName}`,
          provider: 'pollinations-flux',
          promptUsed,
        };
      }
    }
  } catch {
    // Fall through to resilient local artistic SVG
  }

  // Provider 4: Local theme-matched editorial SVG asset
  const svgContent = createLocalArtisticSvg(req, seed);
  const svgFileName = `ai-local-${Date.now()}-${hash}.svg`;
  fs.writeFileSync(path.join(AI_IMAGES_DIR, svgFileName), svgContent, 'utf-8');

  return {
    url: `/uploads/ai-generated/${svgFileName}`,
    provider: 'local-editorial-svg',
    promptUsed,
  };
}
