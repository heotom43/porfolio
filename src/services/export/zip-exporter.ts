import fs from "fs";
import path from "path";
import JSZip from "jszip";
import type {
  AboutSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  HeroSection,
  PortfolioDocument,
  PortfolioSection,
  ProjectItem,
  ProjectsSection,
  SkillsSection,
} from "@/schema/portfolio.schema";
import { sanitizeSlug } from "./portfolio-repository";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(url: string): string {
  const trimmed = url.trim();
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return "#";
}

function safeDocxHref(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return safeHref(trimmed);
  }
  return null;
}

function renderDocxLink(url: string | undefined): string {
  const href = safeDocxHref(url);
  if (!href) return "";
  return `<a class="pill" style="margin:0;text-decoration:none;" href="${escapeHtml(
    href,
  )}" target="_blank" rel="noopener noreferrer">🔗 Mở file DOCX</a>`;
}

export interface CollectedAsset {
  originalUrl: string;
  bundleRelPath: string; // e.g. "./assets/images/1-image1.png"
  zipPath: string; // e.g. "assets/images/1-image1.png"
  buffer: Buffer;
}

const DATA_MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

function resolvePublicFileBuffer(
  url: string,
): { buffer: Buffer; baseName: string } | null {
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return null;
  }

  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  let decoded = withoutQuery;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    // Keep original string if malformed percent encoding
  }

  const relativeUrl = decoded.replace(/^\/+/, "");
  if (!relativeUrl) return null;

  const publicDir = path.resolve(process.cwd(), "public");
  const candidate = path.resolve(publicDir, relativeUrl);
  const rel = path.relative(publicDir, candidate);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return {
      buffer: fs.readFileSync(candidate),
      baseName: path.basename(candidate) || "asset.png",
    };
  }
  return null;
}

function resolveDataImageBuffer(
  url: string,
): { buffer: Buffer; ext: string } | null {
  const match = url
    .trim()
    .match(/^data:(image\/[a-zA-Z0-9+.-]+)((?:;[^,]*)?),([\s\S]*)$/i);
  if (!match) return null;

  const mime = match[1].toLowerCase();
  const params = match[2] || "";
  const payload = match[3] || "";
  if (!payload) return null;

  const ext =
    DATA_MIME_TO_EXT[mime] ||
    mime
      .slice(mime.indexOf("/") + 1)
      .split("+")[0]
      .replace(/^x-/, "")
      .replace(/[^a-z0-9]/g, "") ||
    "img";
  const isBase64 = /;base64\b/i.test(params);

  let buffer: Buffer;
  if (isBase64) {
    buffer = Buffer.from(payload.replace(/\s+/g, ""), "base64");
  } else {
    let textPayload = payload;
    try {
      textPayload = decodeURIComponent(payload);
    } catch {
      // Use raw payload if not percent-encoded
    }
    buffer = Buffer.from(textPayload, "utf-8");
  }

  if (buffer.length === 0) return null;
  return { buffer, ext };
}

/**
 * Collects all local `public/` images (`/uploads/docx-media/`, `/uploads/ai-generated/`, `/presets/`)
 * and `data:image/...` URLs referenced in the portfolio and maps them into `./assets/images/`.
 */
export function collectAndMapAssets(
  doc: PortfolioDocument,
): Map<string, CollectedAsset> {
  const map = new Map<string, CollectedAsset>();
  let counter = 0;

  const register = (url: string | undefined, roleHint: string) => {
    if (!url || !url.trim() || map.has(url)) return;

    const publicAsset = resolvePublicFileBuffer(url);
    if (publicAsset) {
      counter += 1;
      const safeBase =
        publicAsset.baseName.replace(/[^a-zA-Z0-9._-]/g, "_") ||
        `${roleHint}.png`;
      const safeName = `${counter}-${safeBase}`;
      map.set(url, {
        originalUrl: url,
        bundleRelPath: `./assets/images/${safeName}`,
        zipPath: `assets/images/${safeName}`,
        buffer: publicAsset.buffer,
      });
      return;
    }

    const dataAsset = resolveDataImageBuffer(url);
    if (dataAsset) {
      counter += 1;
      const safeRole = roleHint.replace(/[^a-zA-Z0-9_-]/g, "-") || "image";
      const safeName = `${counter}-${safeRole}.${dataAsset.ext}`;
      map.set(url, {
        originalUrl: url,
        bundleRelPath: `./assets/images/${safeName}`,
        zipPath: `assets/images/${safeName}`,
        buffer: dataAsset.buffer,
      });
    }
  };

  register(doc.seo.ogImage, "og-image");

  // Unified Profile Owner portrait
  if (doc.profileOwner?.avatarUrl) {
    register(doc.profileOwner.avatarUrl, "owner-portrait");
  }

  // Custom background illustration
  if (doc.theme.backgroundIllustration?.customUrl) {
    register(doc.theme.backgroundIllustration.customUrl, "bg-illustration");
  }

  for (const sec of doc.sections) {
    if (sec.type === "hero") {
      register(sec.avatar.url, "avatar");
      for (const dec of sec.decorations) {
        register(dec.assetUrl, "decoration");
      }
    } else if (sec.type === "skills") {
      for (const cat of sec.categories) {
        for (const sk of cat.skills) {
          register(sk.iconUrl, "skill-icon");
        }
      }
    } else if (sec.type === "projects") {
      for (const proj of sec.projects) {
        for (const m of proj.media) {
          register(m.url, "project-media");
        }
      }
    }
  }

  return map;
}

function isDarkHexColor(hex: string): boolean {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface ResolvedPalette {
  isCanvaEditorial: boolean;
  primary: string;
  secondary: string;
  bg: string;
  surface: string;
  text: string;
  frame: string;
  headingFont: string;
  bodyFont: string;
}

export function resolveDocPalette(doc: PortfolioDocument): ResolvedPalette {
  const isCanvaEditorial = doc.templateId === "canva-editorial";
  const { theme } = doc;

  const primary = theme.primaryColor || "#735340";
  const secondary = theme.secondaryColor || "#5D4037";
  const bg = theme.backgroundColor || "#FFF3E6";
  const surface = theme.surfaceColor || "#FFF8F0";
  const text = theme.textColor || "#3E2723";
  const headingFont = theme.headingFont || "Playfair Display";
  const bodyFont = theme.bodyFont || "Be Vietnam Pro";

  return {
    isCanvaEditorial,
    primary,
    secondary,
    bg,
    surface,
    text,
    frame: primary,
    headingFont,
    bodyFont,
  };
}

const EXPORT_FONT_STACKS: Record<string, string> = {
  "Playfair Display": "'Playfair Display', Georgia, serif",
  "Be Vietnam Pro": "'Be Vietnam Pro', system-ui, -apple-system, sans-serif",
  Lora: "'Lora', Georgia, serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', sans-serif",
  Merriweather: "'Merriweather', Georgia, serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
};

function exportFontStack(
  fontName: string | undefined,
  fallback: string,
): string {
  return (
    EXPORT_FONT_STACKS[fontName ?? ""] ??
    EXPORT_FONT_STACKS[fallback] ??
    EXPORT_FONT_STACKS["Be Vietnam Pro"]
  );
}

function applySectionTypography(
  html: string,
  section: PortfolioSection,
  defaultHeadingFont: string,
  defaultBodyFont: string,
): string {
  const headingFont = exportFontStack(section.headingFont, defaultHeadingFont);
  const bodyFont = exportFontStack(section.bodyFont, defaultBodyFont);
  const sectionOpen = html.match(/<section\b[^>]*>/i)?.[0];
  if (!sectionOpen) return html;

  const withType = sectionOpen.replace(
    "<section",
    `<section data-section-type="${section.type}"`,
  );
  const styleAttribute = withType.match(/\sstyle="([^"]*)"/i);
  const sectionStyle = `--section-heading-font:${headingFont};--section-body-font:${bodyFont};`;
  const styledOpen = styleAttribute
    ? withType.replace(
        styleAttribute[0],
        ` style="${styleAttribute[1]};${sectionStyle}"`,
      )
    : withType.replace(/<section\b/i, `<section style="${sectionStyle}"`);

  let result = html.replace(sectionOpen, styledOpen);
  if (section.tags && section.tags.length > 0) {
    const tagMarkup = `<div class="section-hashtags">${section.tags
      .map((tag) => {
        const normalizedTag = tag
          .trim()
          .replace(/^#+/, "")
          .replace(/\s+/g, "-");
        return normalizedTag
          ? `<span>#${escapeHtml(normalizedTag)}</span>`
          : "";
      })
      .filter(Boolean)
      .join("")}</div>`;
    const closingIndex = result.lastIndexOf("</section>");
    if (closingIndex !== -1 && tagMarkup) {
      result = `${result.slice(0, closingIndex)}${tagMarkup}${result.slice(
        closingIndex,
      )}`;
    }
  }
  return result;
}

function renderStandaloneCss(doc: PortfolioDocument): string {
  const pal = resolveDocPalette(doc);
  const navBg = isDarkHexColor(pal.bg)
    ? "rgba(15, 23, 42, 0.92)"
    : hexToRgba(pal.bg, 0.94);

  return `:root {
  --primary: ${pal.primary};
  --secondary: ${pal.secondary};
  --bg: ${pal.bg};
  --surface: ${pal.surface};
  --text: ${pal.text};
  --frame: ${pal.frame};
  --font-heading: ${exportFontStack(pal.headingFont, "Playfair Display")};
  --font-body: ${exportFontStack(pal.bodyFont, "Be Vietnam Pro")};
}
* { box-sizing: border-box; }
img { max-width: 100%; }
html {
  scroll-behavior: smooth;
  scrollbar-color: var(--primary) var(--bg);
  scrollbar-width: thin;
}
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb {
  background: var(--primary);
  border: 2px solid var(--bg);
  border-radius: 999px;
}
body {
  margin: 0;
  font-family: var(--font-body);
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
h1, h2, h3, h4, .font-editorial {
  font-family: var(--font-heading);
}
[data-section-type] h1,
[data-section-type] h2,
[data-section-type] h3,
[data-section-type] h4,
[data-section-type] .font-editorial {
  font-family: var(--section-heading-font, var(--font-heading));
}
[data-section-type] p,
[data-section-type] li {
  font-family: var(--section-body-font, var(--font-body));
}
.section-hashtags {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.section-hashtags span {
  border: 1px solid var(--primary);
  border-radius: 999px;
  padding: 4px 10px;
  color: var(--primary);
  background: var(--surface);
  font-size: 11px;
  font-weight: 600;
}
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.nav {
  position: sticky; top: 0; z-index: 30;
  background: ${navBg};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${hexToRgba(pal.primary, 0.22)};
}
.nav-inner {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 24px; max-width: 1120px; margin: 0 auto; gap: 16px;
}
.nav-links { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.nav-links a {
  text-decoration: none; color: var(--text); font-size: 13px; font-weight: 600;
  padding: 6px 12px; border-radius: 999px; opacity: 0.86; transition: all 0.2s ease;
}
.nav-links a:hover { background: var(--primary); color: var(--bg); opacity: 1; }
.btn-print {
  border: 1px solid ${hexToRgba(pal.primary, 0.45)}; background: var(--surface); color: var(--text);
  padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease;
}
.btn-print:hover { background: var(--primary); color: var(--bg); border-color: var(--primary); }
section { padding: 44px 0; position: relative; }
.editorial-rule { border-bottom: 1px solid ${hexToRgba(pal.primary, 0.32)}; }

/* CSS Motion & Scroll Reveal System */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 0.55;
    filter: drop-shadow(0 0 12px rgba(169, 107, 84, 0.4));
  }
  50% {
    opacity: 0.95;
    filter: drop-shadow(0 0 24px rgba(169, 107, 84, 0.75));
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.25;
    transform: scale(0.75) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.15) rotate(180deg);
  }
}

@keyframes sparklePulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes tilt {
  0%, 100% {
    transform: rotate(-1.5deg);
  }
  50% {
    transform: rotate(1.5deg);
  }
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}

.animate-glow {
  animation: glow 3s ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle 4s ease-in-out infinite;
}

.animate-tilt {
  animation: tilt 6s ease-in-out infinite;
}

.portfolio-export-root {
  position: relative;
  isolation: isolate;
  overflow: clip;
  min-height: 100vh;
}
.portfolio-export-root > .nav,
.portfolio-export-root > main {
  position: relative;
  z-index: 1;
}
.portfolio-export-effects {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.portfolio-export-effects .effect-orb,
.portfolio-export-effects .effect-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(72px);
}
.portfolio-export-effects .effect-orb {
  width: min(36vw, 360px);
  aspect-ratio: 1;
  animation: float 6s ease-in-out infinite;
}
.portfolio-export-effects .effect-orb:nth-child(2) {
  top: 24%;
  right: -5%;
  animation-delay: 1.4s;
}
.portfolio-export-effects .effect-orb:nth-child(3) {
  bottom: 8%;
  left: 28%;
  animation-delay: 2.4s;
}
.portfolio-export-effects .effect-glow {
  width: min(42vw, 460px);
  aspect-ratio: 1;
  animation: glow 3.2s ease-in-out infinite alternate;
}
.portfolio-export-effects .effect-parallax-wash {
  position: absolute;
  inset: -12% -8% 30%;
  background:
    radial-gradient(ellipse at 30% 35%, ${hexToRgba(pal.primary, 0.22)}, transparent 65%),
    radial-gradient(ellipse at 75% 55%, ${hexToRgba(pal.secondary, 0.18)}, transparent 62%);
  filter: blur(48px);
}
.portfolio-export-effects .effect-sparkle {
  position: absolute;
  width: 18px;
  height: 18px;
  animation: sparkle 3.8s ease-in-out infinite;
}
.portfolio-export-root[data-effect-tilt="enabled"] main .surface-block:hover,
.portfolio-export-root[data-effect-tilt="enabled"] main .about-free-card:hover,
.portfolio-export-root[data-effect-tilt="enabled"] main article:hover {
  transform: perspective(1000px) rotateX(1.5deg) rotateY(-2deg) translateY(-3px);
}
.portfolio-export-root[data-effect-tilt="enabled"] main .surface-block,
.portfolio-export-root[data-effect-tilt="enabled"] main .about-free-card,
.portfolio-export-root[data-effect-tilt="enabled"] main article {
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
.portfolio-export-root[data-effect-glow="enabled"] main .surface-block,
.portfolio-export-root[data-effect-glow="enabled"] main .about-free-card,
.portfolio-export-root[data-effect-glow="enabled"] main article {
  box-shadow: 0 8px 26px -14px ${hexToRgba(pal.primary, 0.6)};
  transition: box-shadow 0.3s ease;
}
.portfolio-export-root[data-effect-glow="enabled"] main .surface-block:hover,
.portfolio-export-root[data-effect-glow="enabled"] main .about-free-card:hover,
.portfolio-export-root[data-effect-glow="enabled"] main article:hover {
  box-shadow: 0 12px 32px -10px ${hexToRgba(pal.primary, 0.75)};
}
.portfolio-export-root[data-effect-parallax="enabled"] .portfolio-export-effects {
  transform: translate3d(0, var(--portfolio-parallax-offset, 0px), 0);
}
.portfolio-export-root[data-reveal-variant="zoom-in"] .reveal-on-scroll { transform: scale(0.92); }
.portfolio-export-root[data-reveal-variant="zoom-in"] .reveal-on-scroll.is-revealed { transform: scale(1); }
.portfolio-export-root[data-reveal-variant="slide-left"] .reveal-on-scroll { transform: translateX(-32px); }
.portfolio-export-root[data-reveal-variant="slide-left"] .reveal-on-scroll.is-revealed { transform: translateX(0); }
.portfolio-export-root[data-reveal-variant="slide-right"] .reveal-on-scroll { transform: translateX(32px); }
.portfolio-export-root[data-reveal-variant="slide-right"] .reveal-on-scroll.is-revealed { transform: translateX(0); }
.portfolio-export-root[data-reveal-variant="none"] .reveal-on-scroll {
  opacity: 1; transform: none; transition: none;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.reveal-on-scroll.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Hover Elevation & Transitions */
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
}

.project-media-item img {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.project-media-item:hover img {
  transform: scale(1.03);
}

.toc-pill {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toc-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.conclusion-pill-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.conclusion-pill-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.btn-primary, .btn-outline, .btn-print {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-primary:hover, .btn-outline:hover, .btn-print:hover {
  transform: translateY(-1.5px);
}

/* Modern Glassmorphism & Depth Utilities */
.glass-panel {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.glass-dock {
  background-color: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .hover-lift:hover {
    transform: none !important;
  }
}

/* Canva Slide 1 Cover Canvas */
.cover-canvas {
  position: relative; overflow: hidden; padding: 28px 16px 26px; margin-bottom: 18px;
}
.ornament-tl {
  position: absolute; top: -8px; left: -8px; width: 250px; height: 250px;
  opacity: 0.94; pointer-events: none;
}
.ornament-br {
  position: absolute; bottom: -8px; right: -8px; width: 255px; height: 226px;
  opacity: 0.94; pointer-events: none;
}
.cover-title-wrap {
  position: relative; z-index: 2; max-width: 760px; margin: 16px auto 0; text-align: center;
}
.cover-word-digital {
  position: absolute; left: 25%; top: 4%; z-index: 3;
  font-size: clamp(20px, 3vw, 34px); font-weight: 800; color: #1E120E;
}
.cover-word-year {
  position: absolute; right: 18%; bottom: 4%; z-index: 3;
  font-size: clamp(18px, 2.5vw, 28px); font-weight: 800; letter-spacing: 0.06em; color: #1E120E;
}
.cover-stars {
  display: flex; align-items: center; justify-content: center; gap: clamp(18px, 8vw, 72px); margin: 16px 0 18px;
}
.hero-grid { display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 40px; align-items: center; position: relative; }
.about-hero-grid { display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 36px; align-items: center; }
.about-wrap[data-about-layout="editorial-poster"] .about-hero-grid {
  grid-template-columns: 1.5fr 0.7fr; align-items: start;
}
.about-wrap[data-about-layout="editorial-poster"] .about-hero-grid > div:first-child {
  padding: 24px; border-left: 4px solid var(--primary); border-radius: 0 20px 20px 0;
  background: var(--surface);
}
.about-wrap[data-about-layout="profile-dashboard"] .about-hero-grid {
  grid-template-columns: 1.15fr 0.85fr; gap: 20px;
}
.about-wrap[data-about-layout="profile-dashboard"] .about-hero-grid > div {
  padding: 24px; border: 1px solid ${hexToRgba(pal.primary, 0.2)};
  border-radius: 24px; background: var(--surface);
}
.about-wrap[data-about-layout="spotlight"] .about-hero-grid {
  grid-template-columns: 1fr; max-width: 860px; margin: 0 auto; text-align: center;
}
.about-wrap[data-about-layout="spotlight"] .about-highlight-grid {
  text-align: left;
}
.hero-eyebrow {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em;
  color: var(--primary); margin: 0 0 10px;
}
.avatar-frame {
  width: 100%; max-width: 340px; aspect-ratio: 3/4; object-fit: cover;
  border: 3px solid var(--frame); display: block; margin: 0 auto; background: var(--surface);
}
.avatar-arch { border-radius: 999px 999px 24px 24px; }
.avatar-circle { border-radius: 999px; aspect-ratio: 1/1; }
.avatar-rounded { border-radius: 26px; }
.avatar-blob { border-radius: 48% 52% 42% 58% / 44% 48% 52% 56%; }

.pill {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px;
  border-radius: 999px; font-size: 12px; font-weight: 600;
  background: var(--surface); border: 1px solid ${hexToRgba(pal.primary, 0.4)};
  color: var(--text); margin: 4px 6px 4px 0; text-decoration: none;
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px; background: var(--primary); color: var(--bg);
  text-decoration: none; padding: 11px 22px; border-radius: 999px; font-weight: 600;
  font-size: 14px; border: 1px solid var(--primary); cursor: pointer; transition: all 0.2s ease;
}
.btn-primary:hover { background: var(--secondary); border-color: var(--secondary); }
.btn-outline {
  display: inline-flex; align-items: center; gap: 6px; background: transparent; color: var(--text);
  text-decoration: none; padding: 10px 20px; border-radius: 999px; font-weight: 600;
  font-size: 13px; border: 1.5px solid var(--primary); cursor: pointer; transition: all 0.2s ease;
}
.btn-outline:hover { background: var(--primary); color: var(--bg); }

/* Unboxed Editorial Sections on #FFF3E6 */
.section-heading {
  font-size: clamp(32px, 4.2vw, 48px); font-weight: 800; letter-spacing: -0.02em;
  margin: 0 0 18px; line-height: 1.12; color: var(--text);
}
.about-wrap { position: relative; overflow: hidden; padding-bottom: 16px; }
.about-ribbon {
  position: absolute; right: -8px; bottom: 16px; width: 120px; height: 320px;
  opacity: 0.78; pointer-events: none;
}
.about-columns {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px;
  margin-top: 28px; padding-right: 96px;
}
.about-free-grid-export {
  display: grid; grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: 48px; gap: 16px; margin-top: 28px;
}
.about-default-card-grid-export {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px; margin-top: 28px;
}
.about-free-card {
  min-width: 0; overflow: auto; padding: 18px; border: 1px solid ${hexToRgba(pal.primary, 0.22)};
  border-radius: 16px; background: var(--surface);
  font-family: var(--about-card-body-font, var(--font-body));
}
.about-free-card h3, .about-free-card h4 {
  font-family: var(--about-card-heading-font, var(--font-heading));
}
.about-free-card[data-about-frame="soft"] {
  border-radius: 16px; box-shadow: 0 8px 24px -16px rgba(0,0,0,0.28);
}
.about-free-card[data-about-frame="glass"] {
  border-radius: 24px; background: color-mix(in srgb, var(--surface) 78%, transparent);
  backdrop-filter: blur(14px); box-shadow: 0 14px 32px -18px rgba(0,0,0,0.32);
}
.about-free-card[data-about-frame="outline"] {
  border: 2px solid var(--primary); border-radius: 18px; box-shadow: none;
}
.about-free-card[data-about-frame="editorial"] {
  border: 0; border-left: 4px solid var(--primary); border-radius: 0; box-shadow: none;
}
.about-free-card[data-about-frame="elevated"] {
  border-radius: 24px; box-shadow: 0 18px 38px -20px rgba(0,0,0,0.42);
}
.about-free-card[data-about-frame="dashed"] {
  border: 2px dashed var(--primary); border-radius: 18px; box-shadow: none;
}
.about-col h3 { font-size: 22px; margin: 0 0 12px; color: var(--text); }
.contact-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; }
.contact-icon-badge {
  width: 28px; height: 28px; border-radius: 999px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--primary); color: var(--bg);
}
.highlight-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--primary); margin: 0 0 2px;
}
.highlight-val { font-size: 15px; font-weight: 700; color: var(--text); margin: 0 0 12px; }
.about-highlight-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(88px, auto); gap: 12px; margin-top: 20px;
}
.about-highlight-card {
  min-width: 0; padding: 12px; border: 1px solid ${hexToRgba(pal.primary, 0.22)};
  border-radius: 12px; background: var(--surface);
}
.about-highlight-grid [data-highlight-width="1"] { grid-column: span 1; }
.about-highlight-grid [data-highlight-width="2"] { grid-column: span 2; }
.about-highlight-grid [data-highlight-width="3"] { grid-column: span 3; }
.about-highlight-grid [data-highlight-width="4"] { grid-column: span 4; }
.about-highlight-label {
  display: block; font-size: 10px; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.08em; opacity: 0.65;
}
.about-highlight-value {
  display: block; width: 100%; margin-top: 4px; overflow: hidden; white-space: nowrap;
  font-size: 18px; font-weight: 700; font-family: var(--font-heading);
}
.about-highlight-value__text { display: inline-block; white-space: nowrap; }
.about-highlight-value__text.is-overflowing {
  animation: aboutHighlightMarquee var(--about-marquee-duration) ease-in-out infinite alternate;
}
.about-highlight-value:hover .about-highlight-value__text.is-overflowing,
.about-highlight-value:focus-within .about-highlight-value__text.is-overflowing {
  animation-play-state: paused;
}
@keyframes aboutHighlightMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(var(--about-marquee-distance)); }
}
@media (min-width: 640px) {
  .about-highlight-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 639px) {
  .about-highlight-grid [data-highlight-width="3"],
  .about-highlight-grid [data-highlight-width="4"] { grid-column: span 2 !important; }
}
@media (prefers-reduced-motion: reduce) {
  .about-highlight-value { overflow: visible; white-space: normal; }
  .about-highlight-value__text {
    max-width: 100%; white-space: normal; overflow-wrap: anywhere;
    animation: none !important; transform: none !important;
  }
}

/* Skills Unboxed Grid */
.skills-header-row {
  display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between;
  gap: 18px; margin-bottom: 28px;
}
.skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 28px; }
.skill-col { border-top: 1px solid ${hexToRgba(pal.primary, 0.35)}; padding-top: 16px; }
.skill-col h3 { margin: 0 0 14px; font-size: 18px; color: var(--text); }
.skill-bar-track { height: 4px; border-radius: 999px; background: ${hexToRgba(pal.primary, 0.16)}; overflow: hidden; margin-top: 5px; }
.skill-bar-fill { height: 100%; border-radius: 999px; background: var(--primary); }

/* Editorial Education & Experience Entries (Left-border unboxed, no white SaaS box) */
.editorial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 28px; }
.editorial-entry { border-left: 2px solid var(--primary); padding-left: 20px; }
.period-pill {
  display: inline-block; border: 1px solid ${hexToRgba(pal.primary, 0.55)}; border-radius: 999px;
  padding: 2px 10px; font-size: 12px; font-weight: 600; color: var(--secondary);
}

/* Non-Canva fallback surface container (never forced white, never navy) */
.surface-block {
  background: var(--surface); border: 1px solid ${hexToRgba(pal.primary, 0.22)};
  border-radius: 24px; padding: 28px; margin-bottom: 22px;
}

/* Canva Slide 3: Project Header + Vinyl Sketches + 3-Col TOC */
.projects-cover-header {
  display: flex; align-items: center; justify-content: center; gap: 36px; text-align: center;
}
.projects-display-title {
  font-size: clamp(54px, 8vw, 94px); font-weight: 400; line-height: 0.98;
  letter-spacing: -0.02em; margin: 0; color: var(--text);
}
.vinyl-sketch { width: 104px; height: 104px; flex-shrink: 0; opacity: 0.85; }
.toc-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px 28px;
  margin-top: 38px; margin-bottom: 48px;
}
.toc-item {
  position: relative; display: flex; flex-direction: column; align-items: center; text-align: center;
}
.toc-num { font-size: 28px; font-weight: 400; color: var(--text); line-height: 1.1; }
.toc-pill {
  margin-top: 10px; width: 100%; max-width: 270px; border-radius: 999px;
  border: 1px solid var(--primary); padding: 9px 18px; font-size: 13px; font-weight: 500;
  color: var(--text); text-decoration: underline; text-decoration-color: ${hexToRgba(pal.text, 0.45)};
  text-underline-offset: 4px; transition: all 0.2s ease; display: block;
}
.toc-pill:hover { background: var(--primary); color: var(--bg); text-decoration-color: ${hexToRgba(pal.bg, 0.65)}; }
.toc-star { position: absolute; right: -22px; top: 24px; }

/* Slides 4 - 7: Assignment Chapters */
.chapter-article {
  border-top: 1px solid ${hexToRgba(pal.primary, 0.42)}; padding: 44px 0 38px;
  position: relative; scroll-margin-top: 72px;
}
.chapter-header { display: flex; gap: 22px; align-items: flex-start; margin-bottom: 26px; }
.chapter-num {
  font-size: clamp(54px, 6.2vw, 86px); font-weight: 400; line-height: 0.88;
  letter-spacing: -0.03em; color: var(--text); flex-shrink: 0;
}
.chapter-eyebrow {
  font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--secondary); margin: 2px 0 4px;
}
.chapter-title {
  font-size: clamp(22px, 2.6vw, 30px); font-weight: 700; text-transform: uppercase;
  line-height: 1.25; margin: 0; color: var(--text);
}
.chapter-label {
  font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--text); margin: 0 0 8px;
}
.project-grid { display: grid; grid-template-columns: 1.02fr 0.98fr; gap: 32px; align-items: start; }
.project-grid[data-project-media-position="left"] .chapter-left-flex,
.project-grid[data-project-media-position="top"] .chapter-left-flex { order: 2; }
.project-grid[data-project-media-position="left"] .project-media-stack,
.project-grid[data-project-media-position="top"] .project-media-stack { order: 1; }
.project-grid[data-project-media-position="bottom"] .chapter-left-flex { order: 1; }
.project-grid[data-project-media-position="bottom"] .project-media-stack { order: 2; }
.project-grid[data-project-media-position="top"],
.project-grid[data-project-media-position="bottom"] { grid-template-columns: 1fr; }
.chapter-left-flex { display: flex; gap: 16px; align-items: flex-start; }
.chapter-stars-col { display: flex; flex-direction: column; gap: 14px; padding-top: 6px; flex-shrink: 0; }
.project-media-stack { display: flex; flex-direction: column; gap: 14px; position: relative; }
.project-media-item {
  position: relative; overflow: hidden; border: 3px solid var(--frame);
  background: var(--surface);
}
.canva-radius-even { border-radius: 40px; }
.canva-radius-odd { border-radius: 24px; }
.project-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; cursor: zoom-in; }
.media-badge {
  position: absolute; top: 12px; left: 12px; background: ${hexToRgba(pal.text, 0.84)}; color: var(--bg);
  font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
}
.metrics-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
.metric-chip {
  padding: 5px 13px; border-radius: 999px; background: var(--surface);
  border: 1px solid ${hexToRgba(pal.primary, 0.45)}; font-size: 12px;
}
.takeaway-list { list-style: none; padding: 0; margin: 8px 0 18px; }
.takeaway-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; margin-bottom: 6px; }
.takeaway-dot {
  width: 6px; height: 6px; border-radius: 999px; background: var(--primary);
  margin-top: 8px; flex-shrink: 0;
}

/* Slides 8 - 10: Conclusion + Mocha Container + Thank You + Black Strip */
.conclusion-band { position: relative; padding: 36px 0 18px; overflow: hidden; }
.conclusion-spiral {
  position: absolute; left: -48px; top: -16px; width: 280px; height: 250px;
  opacity: 0.84; pointer-events: none;
}
.conclusion-heading-row {
  position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 36px;
}
.conclusion-heading {
  font-size: clamp(38px, 5vw, 60px); font-weight: 800; margin: 0; color: var(--text);
}
.conclusion-pills-grid {
  position: relative; z-index: 2; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px; max-width: 920px; margin: 34px auto 0;
}
.conclusion-pill-col { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.conclusion-pill-num { font-size: 18px; font-weight: 800; color: var(--text); }
.conclusion-pill-card {
  width: 100%; min-height: 68px; border-radius: 999px; background: var(--primary);
  color: var(--bg); padding: 12px 18px; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.4;
}
.mocha-box-wrap { position: relative; max-width: 880px; margin: 48px auto 0; }
.rota-sticker {
  position: absolute; left: -54px; top: -44px; width: 215px; height: 215px;
  z-index: 3; pointer-events: none;
}
.mocha-contact-box {
  position: relative; z-index: 2; background: var(--primary); color: var(--bg);
  border-radius: 54px; padding: 44px 48px 44px 188px;
}
.mocha-contact-box a { color: var(--bg); }
.thank-you-band { position: relative; overflow: hidden; padding: 72px 16px 76px; text-align: center; }
.halftone-left {
  position: absolute; left: -8px; top: 8px; bottom: 8px; height: 100%; width: 195px;
  opacity: 0.9; pointer-events: none;
}
.thankyou-burst {
  position: absolute; right: 0; top: 0; width: 290px; height: 230px;
  opacity: 0.95; pointer-events: none;
}
.thank-you-title {
  font-size: clamp(46px, 7vw, 86px); font-weight: 800; line-height: 1.05;
  margin: 0; color: var(--text); position: relative; z-index: 2;
}
.canva-footer-strip {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
  background: #0B0908; color: rgba(255, 255, 255, 0.86); padding: 11px 28px;
  font-size: 11px; margin: 0 -24px;
}
.contact-box {
  background: var(--primary); color: var(--bg); border-radius: 36px; padding: 44px;
}
.contact-box a { color: var(--bg); }

/* Assignment Detail Modal */
.modal-backdrop {
  display: none; position: fixed; inset: 0; z-index: 60;
  background: rgba(28, 18, 14, 0.72); backdrop-filter: blur(4px);
  padding: 20px; align-items: center; justify-content: center;
}
.modal-backdrop.open { display: flex; }
.modal-panel {
  background: var(--surface); color: var(--text); max-width: 960px; width: 100%;
  max-height: 90vh; overflow-y: auto; border-radius: 26px; padding: 28px; position: relative;
  border: 2px solid ${hexToRgba(pal.primary, 0.35)}; transition: all 0.25s ease;
}
.modal-top-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-bottom: 1px solid ${hexToRgba(pal.primary, 0.2)}; padding-bottom: 14px; margin-bottom: 16px;
}
.modal-nav-group { display: flex; align-items: center; gap: 8px; }
.modal-actions-group { display: flex; align-items: center; gap: 8px; }
.modal-counter-badge {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  padding: 4px 12px; border-radius: 999px; background: ${hexToRgba(pal.primary, 0.12)}; color: var(--primary);
}
.modal-icon-btn {
  border: 1px solid ${hexToRgba(pal.primary, 0.35)}; border-radius: 999px;
  background: var(--surface); color: var(--text); width: 34px; height: 34px;
  font-size: 16px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.modal-icon-btn:hover { background: ${hexToRgba(pal.primary, 0.18)}; transform: scale(1.06); }
.modal-close {
  border: 1px solid ${hexToRgba(pal.primary, 0.35)}; border-radius: 999px;
  background: ${hexToRgba(pal.primary, 0.14)}; color: var(--text); width: 34px; height: 34px; font-size: 18px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease;
}
.modal-close:hover { background: ${hexToRgba(pal.primary, 0.28)}; transform: scale(1.06); }
.modal-panel.is-fullscreen {
  max-width: 100vw !important; width: 100vw !important; height: 100vh !important;
  max-height: 100vh !important; border-radius: 0 !important; inset: 0 !important;
  position: fixed !important; margin: 0 !important; border: none !important;
  z-index: 9999 !important;
}
.modal-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 12px; }
.modal-img { display: block; width: 100%; height: auto; max-height: min(70vh, 760px); object-fit: contain; border-radius: 16px; background: ${hexToRgba(pal.primary, 0.06)}; }
.brief-box {
  padding: 12px 16px; border-radius: 14px;
  background: ${hexToRgba(pal.primary, 0.08)}; border: 1px solid ${hexToRgba(pal.primary, 0.25)};
  font-size: 14px; margin: 12px 0;
}

/* Standalone Project Subpage Styles */
.project-subpage-header {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 0; border-bottom: 1px solid ${hexToRgba(pal.primary, 0.25)}; margin-bottom: 24px;
}
.project-subpage-card {
  background: var(--surface); border: 1px solid ${hexToRgba(pal.primary, 0.25)};
  border-radius: 24px; padding: 28px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}
.transition-cards-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; margin-top: 36px; padding-top: 24px;
  border-top: 1px solid ${hexToRgba(pal.primary, 0.2)};
}
.transition-card {
  display: flex; align-items: center; gap: 16px; padding: 18px; border-radius: 18px;
  background: var(--surface); border: 1px solid ${hexToRgba(pal.primary, 0.25)};
  text-decoration: none; color: inherit; transition: all 0.25s ease;
}
.transition-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.transition-card-icon {
  width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  background: ${hexToRgba(pal.primary, 0.12)}; color: var(--primary); font-size: 20px; font-weight: 700; flex-shrink: 0;
}

@media (max-width: 900px) {
  .hero-grid, .project-grid, .modal-body-grid, .about-hero-grid { grid-template-columns: 1fr; }
  .about-columns { grid-template-columns: 1fr; padding-right: 0; }
  .about-default-card-grid-export { grid-template-columns: 1fr; }
  .about-free-grid-export { grid-template-columns: 1fr; grid-auto-rows: auto; min-height: 0 !important; }
  .about-free-grid-export > [data-about-card] {
    grid-column: 1 / -1 !important; grid-row: auto !important; min-height: 0 !important;
  }
  .about-ribbon, .rota-sticker, .conclusion-spiral, .vinyl-sketch, .toc-star { display: none; }
  .toc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mocha-contact-box { padding: 32px 26px; border-radius: 36px; }
  .conclusion-pills-grid { grid-template-columns: 1fr; }
}
@media (max-width: 820px) {
  .toc-grid { grid-template-columns: 1fr; }
  .nav-inner { flex-direction: column; align-items: stretch; }
  .nav-inner > strong { text-align: center; }
  .nav-links { justify-content: center; }
  .ornament-tl, .ornament-br, .halftone-left, .thankyou-burst { opacity: 0.45; }
}
@media (max-width: 640px) {
  .container { padding-right: 16px; padding-left: 16px; }
  section { padding: 34px 0; }
  .cover-canvas { padding: 24px 8px 20px; }
  .cover-word-digital { left: 16%; top: 0; }
  .cover-word-year { right: 12%; bottom: 0; }
  .chapter-header { gap: 14px; }
  .chapter-title { overflow-wrap: anywhere; }
  .chapter-article { padding: 32px 0 28px; }
  .project-subpage-card { padding: 18px; border-radius: 18px; }
  .contact-box { padding: 28px 20px; border-radius: 24px; }
  .mocha-contact-box { padding: 24px 18px; border-radius: 24px; }
  .thank-you-band { padding: 56px 8px 60px; }
  .modal-backdrop { padding: 10px; }
  .modal-panel { padding: 18px; border-radius: 18px; max-height: 90dvh; }
  .modal-top-bar { flex-wrap: wrap; }
  .modal-img { max-height: 62dvh; }
}
@media print {
  @page { size: A4 landscape; margin: 10mm; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .no-print, .nav, .modal-backdrop, .portfolio-export-effects { display: none !important; }
  .reveal-on-scroll { opacity: 1 !important; transform: none !important; }
  section { break-inside: avoid-page; page-break-inside: avoid; break-after: page; page-break-after: always; padding: 18px 0; }
  #projects { break-inside: auto; page-break-inside: auto; break-after: auto; page-break-after: auto; }
  #projects article { break-inside: avoid-page; page-break-inside: avoid; break-after: page; page-break-after: always; }
  main > section:last-child { break-after: auto; page-break-after: auto; }
}`;
}

const NAV_LABELS: Record<PortfolioSection["type"], string> = {
  hero: "Bìa mở đầu",
  about: "Giới thiệu",
  skills: "Kỹ năng",
  experience: "Kinh nghiệm",
  education: "Học vấn",
  projects: "Bài tập & Dự án",
  contact: "Liên hệ",
};

function stripLeadingIndex(title: string): string {
  return title.replace(/^\d{1,2}\s*[.\-:]\s*/, "").trim() || title;
}

function svgFourPointStar(
  size: number,
  color: string = "var(--primary, #735340)",
  extraClass: string = "",
): string {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" fill="none"${
    extraClass ? ` class="${extraClass}"` : ""
  } aria-hidden="true"><path d="M32 2C34.5 21 43 29.5 62 32C43 34.5 34.5 43 32 62C29.5 43 21 34.5 2 32C21 29.5 29.5 21 32 2Z" fill="${color}" /></svg>`;
}

function svgCoverStaffTopLeft(
  stroke: string = "var(--text, #1C1412)",
  noteFill: string = "var(--text, #16100E)",
): string {
  const lines = [0, 12, 24, 36, 48]
    .map(
      (o) =>
        `<path d="M ${88 + o * 0.9} -10 C ${118 + o * 0.7} 135, ${78 + o * 0.5} 235, -10 ${245 + o * 0.75}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" />`,
    )
    .join("");
  return `<svg viewBox="0 0 360 360" fill="none" class="ornament-tl" aria-hidden="true">
    ${lines}
    <path d="M 165 -6 C 210 2, 260 10, 315 22" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" />
    <g transform="translate(115, 22) rotate(12)">
      <ellipse cx="0" cy="0" rx="13" ry="8.5" transform="rotate(-24)" fill="${noteFill}" />
      <path d="M 10 -4 L 10 56" stroke="${noteFill}" stroke-width="3.5" />
      <path d="M 10 18 L 42 50" stroke="${noteFill}" stroke-width="3.2" />
    </g>
    <g transform="translate(72, 128) rotate(-42)">
      <rect x="0" y="0" width="42" height="7" fill="${noteFill}" />
      <rect x="0" y="12" width="42" height="5" fill="${noteFill}" />
      <path d="M 3 4 L 3 50 M 39 4 L 39 50" stroke="${noteFill}" stroke-width="3.5" />
      <ellipse cx="-3" cy="51" rx="9" ry="6.5" transform="rotate(-20 -3 51)" fill="${noteFill}" />
      <ellipse cx="33" cy="51" rx="9" ry="6.5" transform="rotate(-20 33 51)" fill="${noteFill}" />
    </g>
    <g transform="translate(88, 205) rotate(16)">
      <ellipse cx="0" cy="0" rx="10" ry="7" transform="rotate(-22)" fill="${noteFill}" />
      <path d="M 8 -3 L 8 44" stroke="${noteFill}" stroke-width="3" />
    </g>
  </svg>`;
}

function svgCoverStaffBottomRight(
  stroke: string = "var(--text, #1C1412)",
  noteFill: string = "var(--text, #16100E)",
): string {
  const lines = [0, 12, 24, 36, 48]
    .map(
      (o) =>
        `<path d="M ${70 + o * 0.85} 325 C ${95 + o * 0.7} 210, ${205 + o * 0.45} 145, 365 ${78 + o * 0.9}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" />`,
    )
    .join("");
  return `<svg viewBox="0 0 360 320" fill="none" class="ornament-br" aria-hidden="true">
    ${lines}
    <path d="M 105 292 C 138 292, 152 268, 134 256 C 118 246, 102 262, 114 276 C 128 290, 178 274, 168 256 C 160 242, 140 250, 146 266" stroke="${noteFill}" stroke-width="4.2" stroke-linecap="round" fill="none" />
    <path d="M 192 252 C 216 244, 224 270, 200 282" stroke="${noteFill}" stroke-width="4" stroke-linecap="round" fill="none" />
    <circle cx="204" cy="288" r="3.5" fill="${noteFill}" />
    <circle cx="215" cy="281" r="3.5" fill="${noteFill}" />
    <ellipse cx="236" cy="222" rx="14" ry="10" transform="rotate(-32 236 222)" stroke="${noteFill}" stroke-width="3.5" fill="none" />
    <g transform="translate(178, 178) rotate(-32)">
      <ellipse cx="0" cy="36" rx="10" ry="7" fill="${noteFill}" />
      <path d="M 8 36 L 8 0 L 28 12" stroke="${noteFill}" stroke-width="3.5" fill="none" />
    </g>
    <g transform="translate(274, 118) rotate(-25)">
      <rect x="0" y="0" width="36" height="6" fill="${noteFill}" />
      <path d="M 3 3 L 3 40 M 33 3 L 33 40" stroke="${noteFill}" stroke-width="3.2" />
      <ellipse cx="-2" cy="40" rx="9" ry="6.5" fill="${noteFill}" />
      <ellipse cx="28" cy="40" rx="9" ry="6.5" fill="${noteFill}" />
    </g>
  </svg>`;
}

function svgVerticalMusicRibbon(
  stroke: string = "var(--text, #2A1C18)",
  noteFill: string = "var(--text, #2A1C18)",
): string {
  const lines = [0, 9, 18, 27, 36]
    .map(
      (o) =>
        `<path d="M ${42 + o} 0 C ${112 + o} 95, ${24 + o} 185, ${96 + o} 285 C ${134 + o} 340, ${88 + o} 388, ${56 + o} 420" stroke="${stroke}" stroke-width="1.2" stroke-opacity="0.72" />`,
    )
    .join("");
  const notes = [
    { x: 64, y: 78, rot: -18 },
    { x: 96, y: 158, rot: 14 },
    { x: 58, y: 235, rot: -12 },
    { x: 112, y: 318, rot: 22 },
  ]
    .map(
      (n) =>
        `<g transform="translate(${n.x}, ${n.y}) rotate(${n.rot})"><ellipse cx="0" cy="0" rx="6.5" ry="4.5" fill="${noteFill}" /><path d="M 5.5 0 L 5.5 -24 L 16 -18" stroke="${noteFill}" stroke-width="2.2" /></g>`,
    )
    .join("");
  return `<svg viewBox="0 0 180 420" fill="none" class="about-ribbon" aria-hidden="true">${lines}${notes}</svg>`;
}

function svgVinylSketch(
  stroke: string = "var(--text, #3E2723)",
  strokeSubtle: string = "var(--secondary, #5D4037)",
  extraClass: string = "vinyl-sketch",
): string {
  return `<svg viewBox="0 0 160 160" fill="none" class="${extraClass}" aria-hidden="true">
    <circle cx="80" cy="80" r="74" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="110 14 70 10" />
    <circle cx="80" cy="80" r="68" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="85 20 55 18" />
    <circle cx="80" cy="80" r="62" stroke="${strokeSubtle}" stroke-width="1" stroke-dasharray="55 24 90 12" />
    <circle cx="80" cy="80" r="55" stroke="${stroke}" stroke-width="1.3" stroke-dasharray="120 18 40 22" />
    <circle cx="80" cy="80" r="48" stroke="${strokeSubtle}" stroke-width="0.9" stroke-dasharray="45 15 65 20" />
    <circle cx="80" cy="80" r="41" stroke="${stroke}" stroke-width="1.1" stroke-dasharray="70 28 38 14" />
    <circle cx="80" cy="80" r="34" stroke="${strokeSubtle}" stroke-width="0.9" stroke-dasharray="38 12 52 18" />
    <circle cx="80" cy="80" r="24" stroke="${stroke}" stroke-width="1.4" />
    <circle cx="80" cy="80" r="17" stroke="${strokeSubtle}" stroke-width="0.8" stroke-dasharray="24 8" />
    <circle cx="80" cy="80" r="4.5" stroke="${stroke}" stroke-width="1.3" />
  </svg>`;
}

function svgSpiralMusicStaff(
  stroke: string = "var(--text, #2E1D18)",
  noteFill: string = "var(--text, #2E1D18)",
): string {
  const pts = [
    { x: 56, y: 40 },
    { x: 118, y: 18 },
    { x: 204, y: 24 },
    { x: 274, y: 74 },
    { x: 288, y: 164 },
    { x: 244, y: 238 },
    { x: 146, y: 256 },
    { x: 88, y: 204 },
    { x: 110, y: 112 },
  ]
    .map(
      (pt) =>
        `<g transform="translate(${pt.x}, ${pt.y})"><circle cx="0" cy="0" r="4" fill="${noteFill}" /><path d="M 3.5 0 L 3.5 -16 L 10 -12" stroke="${noteFill}" stroke-width="1.6" /></g>`,
    )
    .join("");
  return `<svg viewBox="0 0 360 320" fill="none" class="conclusion-spiral" aria-hidden="true">
    <path d="M 22 68 C 72 8, 224 4, 272 86 C 314 156, 266 254, 186 258 C 118 262, 74 210, 82 148 C 90 98, 138 74, 182 88 C 218 100, 232 142, 212 174 C 194 202, 152 204, 136 178 C 122 156, 136 128, 160 128 C 178 128, 188 144, 178 160 C 170 170, 156 168, 154 156" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.8" />
    <path d="M 14 82 C 68 18, 234 16, 284 98 C 328 172, 278 270, 190 274 C 112 278, 60 220, 70 148 C 80 88, 138 62, 190 78 C 232 92, 248 144, 224 182 C 202 216, 150 218, 128 186" stroke="${stroke}" stroke-width="1.1" stroke-opacity="0.65" />
    <path d="M 32 54 C 82 -2, 216 -4, 262 74 C 302 140, 256 238, 182 242 C 124 244, 88 198, 96 146" stroke="${stroke}" stroke-width="1" stroke-opacity="0.55" />
    ${pts}
  </svg>`;
}

function svgRotaSheetSticker(
  paperBg: string = "var(--surface, #FFFDF8)",
  stroke: string = "var(--text, #2E1D18)",
  noteFill: string = "var(--text, #2E1D18)",
): string {
  const staves = [46, 82, 118, 154]
    .map((topY, bIdx) => {
      const lines = [0, 4, 8, 12, 16]
        .map(
          (dy) =>
            `<line x1="14" y1="${topY + dy}" x2="134" y2="${topY + dy}" stroke="${stroke}" stroke-width="0.9" stroke-opacity="0.7" />`,
        )
        .join("");
      const dots = [28, 52, 78, 104, 120]
        .map((nx, nIdx) => {
          const cy = topY + ((nIdx * 3 + bIdx * 2) % 14);
          return `<circle cx="${nx}" cy="${cy}" r="2.2" fill="${noteFill}" /><line x1="${nx + 2}" y1="${cy}" x2="${nx + 2}" y2="${cy - 10}" stroke="${noteFill}" stroke-width="1.1" />`;
        })
        .join("");
      return lines + dots;
    })
    .join("");

  return `<svg viewBox="0 0 260 260" fill="none" class="rota-sticker" aria-hidden="true">
    <g transform="translate(18, 38) rotate(-12)">
      <rect x="0" y="0" width="148" height="190" rx="3" fill="${paperBg}" stroke="${stroke}" stroke-width="1.8" />
      <text x="74" y="30" text-anchor="middle" fill="${stroke}" style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-style:italic;font-weight:700;">~ Rota ~</text>
      ${staves}
    </g>
    <g transform="translate(175, 22)">
      <circle cx="8" cy="36" r="4" fill="${noteFill}" />
      <path d="M 11.5 36 L 11.5 14 L 24 10 L 24 32" stroke="${noteFill}" stroke-width="2.2" />
      <circle cx="21" cy="32" r="4" fill="${noteFill}" />
      <circle cx="46" cy="24" r="3.8" fill="${noteFill}" />
      <path d="M 49.5 24 L 49.5 4 L 62 0 L 62 20" stroke="${noteFill}" stroke-width="2.2" />
      <circle cx="59" cy="20" r="3.8" fill="${noteFill}" />
      <circle cx="28" cy="68" r="4.5" fill="#C93B2B" />
      <path d="M 32 68 L 32 45 L 42 50" stroke="#C93B2B" stroke-width="2.3" />
      <circle cx="46" cy="84" r="3.5" fill="${noteFill}" />
      <path d="M 49 84 L 49 66 L 58 70" stroke="${noteFill}" stroke-width="1.8" />
    </g>
  </svg>`;
}

function svgHalftoneVinylLeft(
  circleFill: string = "var(--text, #1C1613)",
  stroke: string = "var(--bg, #FFF3E6)",
): string {
  return `<svg viewBox="0 0 260 440" fill="none" class="halftone-left" aria-hidden="true">
    <defs>
      <pattern id="canva-halftone-left" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="2.1" fill="${circleFill}" />
      </pattern>
    </defs>
    <circle cx="20" cy="220" r="212" fill="url(#canva-halftone-left)" opacity="0.88" />
    <circle cx="20" cy="220" r="145" stroke="${stroke}" stroke-width="3" stroke-opacity="0.45" />
    <circle cx="20" cy="220" r="68" fill="${stroke}" fill-opacity="0.7" />
    <circle cx="20" cy="220" r="56" fill="url(#canva-halftone-left)" opacity="0.35" />
  </svg>`;
}

function svgThankYouVinylBurst(
  vinylFill: string = "var(--surface, #EAE4DB)",
  vinylStroke: string = "var(--text, #1E1815)",
  burstFill: string = "#DFB634",
): string {
  return `<svg viewBox="0 0 360 280" fill="none" class="thankyou-burst" aria-hidden="true">
    <defs>
      <pattern id="canva-halftone-right" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="1.7" fill="${vinylStroke}" />
      </pattern>
    </defs>
    <circle cx="152" cy="116" r="102" fill="${vinylFill}" />
    <circle cx="270" cy="100" r="100" fill="${vinylFill}" />
    <circle cx="152" cy="116" r="88" fill="url(#canva-halftone-right)" />
    <circle cx="152" cy="116" r="32" fill="${vinylFill}" />
    <circle cx="152" cy="116" r="6" fill="${vinylStroke}" />
    <circle cx="270" cy="100" r="88" fill="url(#canva-halftone-right)" />
    <circle cx="270" cy="100" r="32" fill="${vinylFill}" />
    <circle cx="270" cy="100" r="6" fill="${vinylStroke}" />
    <polygon points="214,34 226,105 288,82 246,138 308,214 234,174 206,246 196,174 128,194 178,136 144,78 202,110" fill="${burstFill}" />
  </svg>`;
}

function svgContactBadgeIcon(kind: "mail" | "phone" | "pin"): string {
  if (kind === "mail") {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;
  }
  if (kind === "phone") {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

function renderAvatarClass(
  frameStyle: HeroSection["avatar"]["frameStyle"],
): string {
  switch (frameStyle) {
    case "circle":
      return "avatar-frame avatar-circle";
    case "cutout-blob":
      return "avatar-frame avatar-blob";
    case "rounded-rect":
    case "polaroid":
    case "none":
      return "avatar-frame avatar-rounded";
    default:
      return "avatar-frame avatar-arch";
  }
}

function renderHeroHtml(
  hero: HeroSection,
  resolveSrc: (url: string) => string,
  isCanvaEditorial: boolean,
): string {
  const stickerTags = hero.decorations
    .filter((d) => d.assetUrl)
    .map(
      (d) =>
        `<img src="${escapeHtml(resolveSrc(d.assetUrl!))}" alt="${escapeHtml(
          d.label || "Decoration",
        )}" style="width:44px; height:44px; object-fit:contain;" />`,
    )
    .join("");

  if (isCanvaEditorial) {
    return `<section id="hero" class="reveal-on-scroll">
      <div class="cover-canvas">
        ${svgCoverStaffTopLeft()}
        ${svgCoverStaffBottomRight()}
        <div class="cover-title-wrap">
          <span class="cover-word-digital font-editorial">Digital</span>
          <svg viewBox="0 0 880 300" style="width:100%;overflow:visible;" aria-hidden="true">
            <g transform="rotate(-2.2 440 155)">
              <text x="440" y="222" text-anchor="middle" fill="var(--primary, #927869)" stroke="var(--text, #4B3128)" stroke-width="4.2" stroke-linejoin="round" style="font-family:var(--font-heading, 'Playfair Display', Georgia, serif);font-size:205px;font-weight:700;letter-spacing:-0.03em;">Portfolio</text>
            </g>
          </svg>
          <span class="cover-word-year font-editorial">2026</span>
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;">
            ${hero.avatar.url ? `<img src="${escapeHtml(resolveSrc(hero.avatar.url))}" alt="${escapeHtml(hero.fullName)}" style="width:36px;height:36px;border-radius:999px;border:2px solid var(--primary);object-fit:cover;" />` : ""}
            <div>
              <strong class="font-editorial" style="font-size:15px;color:var(--text);">${escapeHtml(hero.fullName)}</strong>
              ${hero.roleTitle ? `<span style="font-size:12px;color:var(--primary);margin-left:6px;opacity:0.8;">• ${escapeHtml(hero.roleTitle)}</span>` : ""}
            </div>
          </div>
          <div class="cover-stars">
            ${svgFourPointStar(24)}
            ${svgFourPointStar(28)}
            ${svgFourPointStar(24)}
          </div>
          <div class="editorial-rule"></div>
        </div>
      </div>
    </section>`;
  }

  return `<section id="hero" class="reveal-on-scroll">
    <div class="hero-grid" style="padding: 18px 0 36px;">
      <div>
        <p class="hero-eyebrow">${escapeHtml(hero.headline)}</p>
        <h1 style="font-size: clamp(38px, 5vw, 56px); line-height: 1.12; margin: 8px 0 10px;">${escapeHtml(
          hero.fullName,
        )}</h1>
        <p style="font-size: 18px; font-weight: 600; color: var(--secondary); margin: 0 0 16px;">${escapeHtml(
          hero.roleTitle,
        )}</p>
        <p style="max-width: 60ch;">${escapeHtml(hero.shortBio)}</p>
        ${
          hero.quickTags.length > 0
            ? `<div style="margin: 18px 0;">${hero.quickTags
                .map((t) => `<span class="pill">✦ ${escapeHtml(t)}</span>`)
                .join("")}</div>`
            : ""
        }
        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:16px;">
          ${hero.ctaButtons
            .map(
              (btn) =>
                `<a class="${
                  btn.style === "outline" ? "btn-outline" : "btn-primary"
                }" href="${escapeHtml(safeHref(btn.href))}">${escapeHtml(btn.label)}</a>`,
            )
            .join("")}
        </div>
        ${
          stickerTags
            ? `<div style="display:flex; gap:10px; margin-top:14px;">${stickerTags}</div>`
            : ""
        }
      </div>
      <div>
        <img class="${renderAvatarClass(hero.avatar.frameStyle)}" src="${escapeHtml(
          resolveSrc(hero.avatar.url),
        )}" alt="${escapeHtml(hero.fullName)}" />
      </div>
    </div>
    <div class="editorial-rule"></div>
  </section>`;
}

function renderAboutHtml(
  about: AboutSection,
  isCanvaEditorial: boolean,
  heroAvatarUrl?: string,
  heroFullName?: string,
  educationSec?: EducationSection,
): string {
  const { contactInfo } = about;
  const eduSchool =
    about.educationSchool ||
    educationSec?.items[0]?.school ||
    about.highlights.find((h) =>
      /trường|đại học|học viện|education|school/i.test(h.label),
    )?.value ||
    "Trường ĐH Sư phạm Nghệ thuật TW";
  const eduDegree =
    about.educationDegree ||
    educationSec?.items[0]?.degree ||
    about.highlights.find((h) =>
      /chuyên ngành|ngành|degree|major/i.test(h.label),
    )?.value ||
    "Sư phạm Âm nhạc";
  const aboutHighlightsHtml =
    about.highlights.length > 0
      ? `<div class="about-highlight-grid">
          ${about.highlights
            .map((highlight, index) => {
              const width = Math.max(1, Math.min(4, highlight.width ?? 1));
              const height = Math.max(1, Math.min(3, highlight.height ?? 1));
              return `<div class="about-highlight-card" data-highlight-width="${width}" style="grid-row:span ${height};min-height:${height * 88}px;">
                <span class="about-highlight-label">${escapeHtml(highlight.label)}</span>
                <span class="about-highlight-value" style="color:${index % 2 === 0 ? "var(--primary)" : "var(--secondary)"}"><span class="about-highlight-value__text">${escapeHtml(highlight.value)}</span></span>
              </div>`;
            })
            .join("")}
        </div>`
      : "";
  const defaultCardPositions: Record<
    string,
    { column: number; row: number; width: number; height: number }
  > = {
    contact: { column: 0, row: 0, width: 7, height: 7 },
    education: { column: 7, row: 0, width: 5, height: 3 },
    learningGoals: { column: 7, row: 3, width: 5, height: 4 },
  };
  const aboutCardTitleFallbacks = {
    contact: "Thông tin liên hệ",
    education: "Học vấn & Đào tạo",
    learningGoals: "Mục tiêu học tập & phát triển (INF2501)",
  } as const;
  const safeFontName = (font: string | undefined) =>
    font?.replace(/[^a-zA-Z0-9 -]/g, "");
  const cardHeadingFont = safeFontName(about.cardHeadingFont);
  const cardBodyFont = safeFontName(about.cardBodyFont);
  const freeAboutHeight =
    Math.max(
      ...["contact", "education", "learningGoals"].map((id) => {
        const position = about.cardPositions?.[id] ?? defaultCardPositions[id];
        return position.row + position.height;
      }),
    ) *
      64 -
    16;
  const aboutCardsStyle = [
    about.cardPositions ? `min-height:${freeAboutHeight}px;` : "",
    cardHeadingFont
      ? `--about-card-heading-font:'${cardHeadingFont}',var(--font-heading);`
      : "",
    cardBodyFont
      ? `--about-card-body-font:'${cardBodyFont}',var(--font-body);`
      : "",
  ].join("");
  const aboutCardsHtml = `<div class="${
    about.cardPositions
      ? "about-free-grid-export"
      : "about-default-card-grid-export"
  }" ${aboutCardsStyle ? `style="${escapeHtml(aboutCardsStyle)}"` : ""}>
      ${["contact", "education", "learningGoals"]
        .map((id) => {
          const position =
            about.cardPositions?.[id] ?? defaultCardPositions[id];
          const titleKey = id as keyof typeof aboutCardTitleFallbacks;
          const title =
            about.cardTitles?.[titleKey] ?? aboutCardTitleFallbacks[titleKey];
          const positionStyle = about.cardPositions
            ? `grid-column:${position.column + 1} / span ${position.width};grid-row:${position.row + 1} / span ${position.height};min-height:${position.height * 48 + (position.height - 1) * 16}px;`
            : "";

          if (id === "contact") {
            return `<div class="about-free-card" data-about-card="contact" data-about-frame="${escapeHtml(about.cardFrame ?? "template")}" style="${positionStyle}">
                <h3>${escapeHtml(title)}</h3>
                ${contactInfo.email ? `<div class="contact-row"><span class="contact-icon-badge">${svgContactBadgeIcon("mail")}</span><a href="mailto:${escapeHtml(contactInfo.email)}">${escapeHtml(contactInfo.email)}</a></div>` : ""}
                ${contactInfo.phone ? `<div class="contact-row"><span class="contact-icon-badge">${svgContactBadgeIcon("phone")}</span><span>${escapeHtml(contactInfo.phone)}</span></div>` : ""}
                ${contactInfo.location ? `<div class="contact-row"><span class="contact-icon-badge">${svgContactBadgeIcon("pin")}</span><span>${escapeHtml(contactInfo.location)}</span></div>` : ""}
                ${contactInfo.website ? `<div class="contact-row"><a href="${escapeHtml(safeHref(contactInfo.website))}" target="_blank" rel="noreferrer">${escapeHtml(contactInfo.website)}</a></div>` : ""}
              </div>`;
          }
          if (id === "education") {
            return `<div class="about-free-card" data-about-card="education" data-about-frame="${escapeHtml(about.cardFrame ?? "template")}" style="${positionStyle}">
                <h3>${escapeHtml(title)}</h3>
                <p class="highlight-label">Trường đào tạo</p>
                <p class="highlight-val">${escapeHtml(eduSchool)}</p>
                <p class="highlight-label">Chuyên ngành</p>
                <p class="highlight-val">${escapeHtml(eduDegree)}</p>
                <p class="highlight-label">${escapeHtml(about.educationPeriod ?? "Khoá K18 • Học phần INF2501")}</p>
              </div>`;
          }
          const goalTitle =
            about.cardTitles?.portfolioObjective ?? "Mục tiêu của Portfolio";
          return `<div class="about-free-card" data-about-card="learningGoals" data-about-frame="${escapeHtml(about.cardFrame ?? "template")}" style="${positionStyle}">
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(about.learningGoals ?? "Vận dụng thành thạo AI tạo sinh và thiết kế số vào giảng dạy thực tiễn.")}</p>
              <hr />
              <h4>${escapeHtml(goalTitle)}</h4>
              <p>${escapeHtml(about.portfolioObjective ?? "Tổng hợp toàn bộ học liệu, bài tập và minh chứng năng lực ứng dụng AI.")}</p>
            </div>`;
        })
        .join("")}
    </div>`;

  if (isCanvaEditorial) {
    const bioParagraphs = about.biography
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    return `<section id="about" class="about-wrap reveal-on-scroll" data-about-layout="${escapeHtml(about.variant)}">
      <div style="position:relative; z-index:2;">
        <!-- Top Grid: Left 7 cols Bio, Right 5 cols Student Portrait (3:4 ratio) -->
        <div class="about-hero-grid">
          <div>
            <h2 class="section-heading font-editorial" style="margin:0 0 16px;">${escapeHtml(about.title || "About me")}</h2>
            ${
              bioParagraphs.length > 0
                ? bioParagraphs
                    .map(
                      (para) =>
                        `<p style="font-size:16px;line-height:1.7;margin:0 0 12px;opacity:0.92;">${escapeHtml(para)}</p>`,
                    )
                    .join("")
                : `<p style="font-size:16px;line-height:1.7;margin:0 0 12px;opacity:0.92;">${escapeHtml(about.biography)}</p>`
            }
            ${aboutHighlightsHtml}
          </div>
          <div style="display:flex;justify-content:center;">
            <div style="aspect-ratio:3/4;border-radius:28px;border:3px solid var(--primary);overflow:hidden;background:var(--surface);width:100%;max-width:320px;box-shadow:0 12px 24px -8px rgba(0,0,0,0.12);">
              ${heroAvatarUrl ? `<img src="${escapeHtml(heroAvatarUrl)}" alt="${escapeHtml(heroFullName || "Portrait")}" style="width:100%;height:100%;object-fit:cover;display:block;" />` : ""}
            </div>
          </div>
        </div>

        ${aboutCardsHtml}
        ${svgVerticalMusicRibbon()}

        <div class="editorial-rule" style="margin-top:28px;"></div>
      </div>
    </section>`;
  }

  const bioParagraphs = about.biography
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return `<section id="about" class="about-wrap reveal-on-scroll" data-about-layout="${escapeHtml(about.variant)}">
    <div class="surface-block">
      <div class="${heroAvatarUrl ? "about-hero-grid" : ""}">
        <div>
          <h2 class="section-heading" style="margin-top:0;">${escapeHtml(about.title)}</h2>
          ${bioParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          ${aboutHighlightsHtml}
        </div>
        ${
          heroAvatarUrl
            ? `<div style="display:flex;justify-content:center;align-items:center;">
                <img src="${escapeHtml(heroAvatarUrl)}" alt="${escapeHtml(heroFullName || "Portrait")}" style="width:100%;max-width:320px;aspect-ratio:3/4;object-fit:cover;border-radius:24px;" />
              </div>`
            : ""
        }
      </div>
      ${aboutCardsHtml}
    </div>
  </section>`;
}

function renderSkillsHtml(
  skills: SkillsSection,
  resolveSrc: (url: string) => string,
  isCanvaEditorial: boolean,
): string {
  const showBars =
    skills.variant === "progress-bars" ||
    skills.variant === "canva-visual-grid";

  return `<section id="skills" class="reveal-on-scroll">
    <div class="skills-header-row">
      <h2 class="section-heading" style="margin-bottom:0;">${escapeHtml(skills.title)}</h2>
    </div>
    <div class="skills-grid">
      ${skills.categories
        .map(
          (cat, categoryIndex) => `<div class="${
            isCanvaEditorial
              ? "skill-col reveal-on-scroll"
              : "surface-block reveal-on-scroll"
          }" style="${
            isCanvaEditorial
              ? `transition-delay:${categoryIndex * 100}ms;`
              : `margin-bottom:0;transition-delay:${categoryIndex * 100}ms;`
          }">
        <h3>${escapeHtml(cat.name)}</h3>
        ${
          showBars
            ? `<div style="display:flex; flex-direction:column; gap:12px;">
          ${cat.skills
            .map(
              (sk) => `<div class="hover-lift">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:600; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:6px;">
                ${
                  sk.iconUrl
                    ? `<img src="${escapeHtml(resolveSrc(sk.iconUrl))}" alt="" style="width:16px; height:16px; object-fit:contain;" />`
                    : ""
                }
                ${escapeHtml(sk.name)}
              </span>
              ${typeof sk.level === "number" ? `<span style="color:var(--primary);">${sk.level}%</span>` : ""}
            </div>
            ${
              typeof sk.level === "number"
                ? `<div class="skill-bar-track"><div class="skill-bar-fill" style="width:${Math.max(
                    0,
                    Math.min(100, sk.level),
                  )}%;"></div></div>`
                : ""
            }
          </div>`,
            )
            .join("")}
        </div>`
            : `<div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${cat.skills
            .map(
              (sk) =>
                `<span class="pill hover-lift">${escapeHtml(sk.name)}</span>`,
            )
            .join("")}
        </div>`
        }
      </div>`,
        )
        .join("")}
    </div>
    ${isCanvaEditorial ? '<div class="editorial-rule" style="margin-top:36px;"></div>' : ""}
  </section>`;
}

function renderExperienceHtml(
  experience: ExperienceSection,
  isCanvaEditorial: boolean,
): string {
  return `<section id="experience" class="reveal-on-scroll">
    <h2 class="section-heading">${escapeHtml(experience.title)}</h2>
    <div class="editorial-grid">
      ${experience.items
        .map(
          (
            exp,
          ) => `<div class="${isCanvaEditorial ? "editorial-entry" : "surface-block"}">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;">
          <strong style="font-size:17px;">${escapeHtml(exp.role)}</strong>
          <span class="period-pill">${escapeHtml(exp.period)}</span>
        </div>
        <p style="font-weight:600;color:var(--secondary);margin:4px 0 8px;">${escapeHtml(
          exp.organization,
        )}</p>
        <p style="margin:0 0 8px;">${escapeHtml(exp.description)}</p>
        ${
          exp.achievements.length > 0
            ? `<ul style="margin:6px 0 0; padding-left:18px;">${exp.achievements
                .map((a) => `<li>${escapeHtml(a)}</li>`)
                .join("")}</ul>`
            : ""
        }
      </div>`,
        )
        .join("")}
    </div>
    ${isCanvaEditorial ? '<div class="editorial-rule" style="margin-top:36px;"></div>' : ""}
  </section>`;
}

function renderEducationHtml(
  education: EducationSection,
  isCanvaEditorial: boolean,
): string {
  return `<section id="education" class="reveal-on-scroll">
    <h2 class="section-heading">${escapeHtml(education.title)}</h2>
    <div class="editorial-grid">
      ${education.items
        .map(
          (
            edu,
          ) => `<div class="${isCanvaEditorial ? "editorial-entry" : "surface-block"}">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;">
          <strong style="font-size:17px;">${escapeHtml(edu.school)}</strong>
          <span class="period-pill">${escapeHtml(edu.period)}</span>
        </div>
        <p style="font-weight:600;color:var(--secondary);margin:4px 0 0;">${escapeHtml(edu.degree)}</p>
        ${
          edu.gpaOrHonors
            ? `<p style="font-size:13px; font-weight:600; color:var(--primary); margin:6px 0 0;">✦ ${escapeHtml(
                edu.gpaOrHonors,
              )}</p>`
            : ""
        }
        ${edu.details ? `<p style="margin:6px 0 0;">${escapeHtml(edu.details)}</p>` : ""}
      </div>`,
        )
        .join("")}
    </div>
    ${isCanvaEditorial ? '<div class="editorial-rule" style="margin-top:36px;"></div>' : ""}
  </section>`;
}

function renderProjectsHtml(
  projects: ProjectsSection,
  resolveSrc: (url: string) => string,
  allProjectsCollected: ProjectItem[],
  isCanvaEditorial: boolean,
): string {
  const headerHtml = isCanvaEditorial
    ? `<div style="padding-bottom: 16px;">
        <div class="projects-cover-header">
          ${svgVinylSketch()}
          <div>
            <h2 class="projects-display-title font-editorial">project</h2>
            ${
              projects.subtitle
                ? `<p style="max-width:560px;margin:12px auto 0;font-size:14px;color:var(--secondary);">${escapeHtml(
                    projects.subtitle,
                  )}</p>`
                : ""
            }
          </div>
          ${svgVinylSketch()}
        </div>
        <div class="toc-grid">
          ${projects.projects
            .map((proj, idx) => {
              const numLabel = `${String(idx + 1).padStart(2, "0")}.`;
              const showRightStar =
                (idx + 1) % 3 !== 0 && idx < projects.projects.length - 1;
              return `<div class="toc-item">
                ${showRightStar ? svgFourPointStar(22, "var(--primary, #735340)", "toc-star") : ""}
                <span class="toc-num font-editorial">${numLabel}</span>
                <a class="toc-pill hover-lift" href="#project-item-${idx}">${escapeHtml(
                  stripLeadingIndex(proj.title),
                )}</a>
              </div>`;
            })
            .join("")}
        </div>
      </div>`
    : `<h2 class="section-heading">${escapeHtml(projects.title)}</h2>${
        projects.subtitle ? `<p>${escapeHtml(projects.subtitle)}</p>` : ""
      }`;

  return `<section id="projects" class="reveal-on-scroll">
    ${headerHtml}
    ${projects.projects
      .map((proj, idx) => {
        const modalIdx = allProjectsCollected.length;
        allProjectsCollected.push({
          ...proj,
          media: proj.media.map((m) => ({
            ...m,
            url: resolveSrc(m.url),
          })),
        });
        const chapterNum = String(idx + 1).padStart(2, "0");
        const frameRadiusClass =
          idx % 2 === 0 ? "canva-radius-even" : "canva-radius-odd";

        return `<article id="project-item-${idx}" class="${
          isCanvaEditorial
            ? "chapter-article reveal-on-scroll"
            : "surface-block reveal-on-scroll"
        }">
      <div class="chapter-header">
        <span class="chapter-num font-editorial">${chapterNum}</span>
        <div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <p class="chapter-eyebrow">CHƯƠNG ${idx + 1} : ${escapeHtml(proj.category)}</p>
            ${
              proj.sourceDocxFileName
                ? `<span class="pill" style="margin:0;">📄 ${escapeHtml(proj.sourceDocxFileName)}</span>`
                : ""
            }
            ${renderDocxLink(proj.docxUrl)}
          </div>
          <h3 class="chapter-title font-editorial">${escapeHtml(proj.title)}</h3>
        </div>
      </div>

      <div class="project-grid" data-project-media-position="${proj.mediaPosition ?? "right"}">
        <div class="chapter-left-flex">
          ${
            isCanvaEditorial && idx % 2 === 1
              ? `<div class="chapter-stars-col" aria-hidden="true">
                  ${svgFourPointStar(26)}
                  ${svgFourPointStar(26)}
                  ${svgFourPointStar(26)}
                </div>`
              : ""
          }
          <div style="flex:1;min-width:0;">
            ${
              proj.assignmentBrief ||
              proj.keyTakeaways.some((takeaway) => takeaway.trim())
                ? `<div style="margin-bottom:18px;">
                  <h4 class="chapter-label">MỤC TIÊU</h4>
                  ${
                    proj.assignmentBrief
                      ? `<p style="margin:0 0 10px;font-size:15px;">${escapeHtml(
                          proj.assignmentBrief,
                        )}</p>`
                      : ""
                  }
                  ${
                    proj.keyTakeaways.some((takeaway) => takeaway.trim())
                      ? `<ul class="takeaway-list">${proj.keyTakeaways
                          .filter((takeaway) => takeaway.trim())
                          .map(
                            (k) =>
                              `<li><span class="takeaway-dot"></span><span>${escapeHtml(k)}</span></li>`,
                          )
                          .join("")}</ul>`
                      : ""
                  }
                </div>`
                : ""
            }
            <div style="margin-bottom:16px;">
              <h4 class="chapter-label">QUY TRÌNH &amp; KẾT QUẢ</h4>
              <p style="margin:0;font-size:15px;">${escapeHtml(proj.summary)}</p>
            </div>
            ${
              proj.metrics.length > 0
                ? `<div class="metrics-row">${proj.metrics
                    .map(
                      (m) =>
                        `<div class="metric-chip hover-lift"><span style="color:var(--primary);">${escapeHtml(
                          m.label,
                        )}: </span><strong>${escapeHtml(m.value)}</strong></div>`,
                    )
                    .join("")}</div>`
                : ""
            }
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;">
              ${
                proj.tags.length > 0
                  ? `<div style="display:flex;flex-wrap:gap:8px;font-size:12px;font-weight:600;color:var(--primary);">${proj.tags
                      .map((t) => `<span>#${escapeHtml(t)}</span>`)
                      .join("")}</div>`
                  : "<span></span>"
              }
              <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                <a class="btn-outline hover-lift no-print" style="text-decoration:none;" href="projects/project-${modalIdx + 1}.html">Xem chi tiết bài làm</a>
                ${proj.links
                  .map(
                    (lnk) =>
                      `<a class="pill hover-lift" style="margin:0;" href="${escapeHtml(
                        safeHref(lnk.url),
                      )}" target="_blank" rel="noreferrer">${escapeHtml(lnk.label)}</a>`,
                  )
                  .join("")}
              </div>
            </div>
            ${
              proj.fullRawExcerpt
                ? `<details style="margin-top:12px;"><summary style="cursor:pointer;font-weight:600;font-size:13px;color:var(--secondary);">Xem nội dung trích xuất chi tiết</summary><pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;opacity:0.88;">${escapeHtml(
                    proj.fullRawExcerpt,
                  )}</pre></details>`
                : ""
            }
          </div>
        </div>

        <div class="project-media-stack">
          ${proj.media
            .map((m, mIdx) => {
              const sourceLabel =
                m.sourceType === "docx-extracted"
                  ? "📄 Ảnh từ DOCX"
                  : m.sourceType === "ai-generated"
                    ? "✨ Ảnh AI"
                    : "🖼️ Ảnh tải lên";
              return `<div class="project-media-item hover-lift ${frameRadiusClass}">
              <span class="media-badge">${sourceLabel}</span>
              <img class="project-img" loading="lazy" decoding="async" data-open-project="${modalIdx}" data-media-index="${mIdx}" src="${escapeHtml(
                resolveSrc(m.url),
              )}" alt="${escapeHtml(m.caption || proj.title)}" />
            </div>`;
            })
            .join("")}
        </div>
      </div>
    </article>`;
      })
      .join("")}
  </section>`;
}

function renderContactHtml(
  contact: ContactSection,
  about: AboutSection | undefined,
  hero: HeroSection | undefined,
  isCanvaEditorial: boolean,
  projects?: ProjectItem[],
  profileOwner?: { fullName?: string },
): string {
  const ownerIdentity = [hero?.fullName, hero?.roleTitle]
    .filter(Boolean)
    .join(" • ");

  const courseInfo = contact.courseInfo;

  const studentName =
    courseInfo?.studentName ||
    profileOwner?.fullName ||
    hero?.fullName ||
    "Sinh viên";
  const studentNamePosition = courseInfo?.studentNamePosition || "left";
  const studentNameJustify =
    studentNamePosition === "center"
      ? "center"
      : studentNamePosition === "right"
        ? "flex-end"
        : "flex-start";
  const studentId = courseInfo?.studentId || "25010001";
  const studentClass = courseInfo?.studentClass || "K18 - INF2501";
  const courseCode = courseInfo?.courseCode || "INF2501";
  const courseName =
    courseInfo?.courseName ||
    "Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo";
  const institution =
    courseInfo?.institution || "Trường ĐH Sư phạm Nghệ thuật TW";

  const courseFooterHtml = `
    <footer data-testid="rubric-course-footer" style="margin-top:32px;border-top:1px solid rgba(0,0,0,0.1);background:#1c1917;padding:16px 24px;color:#d6d3d1;font-size:12px;">
      <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:12px;">
        <div style="display:flex;flex:1 1 55%;flex-wrap:wrap;align-items:center;gap:4px 12px;justify-content:${studentNameJustify};">
          <span style="font-weight:700;color:#fff;font-size:13px;">${escapeHtml(studentName)}</span>
          <span style="margin-left:12px;background:#292524;padding:2px 8px;border-radius:4px;font-family:monospace;">MSSV: ${escapeHtml(studentId)}</span>
          <span style="margin-left:12px;color:#a8a29e;">Lớp: ${escapeHtml(studentClass)}</span>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-weight:600;color:#f5f5f4;">${escapeHtml(courseCode)} - ${escapeHtml(courseName)}</p>
          <p style="margin:2px 0 0;color:#a8a29e;font-size:11px;">${escapeHtml(institution)}</p>
        </div>
      </div>
    </footer>`;

  if (isCanvaEditorial) {
    const conclusionPills = [
      { num: "(01)", label: "TRẢI NGHIỆM & CẢM NHẬN VỀ DỰ ÁN" },
      { num: "(02)", label: "KIẾN THỨC & KỸ NĂNG CỐT LÕI ĐẠT ĐƯỢC" },
      { num: "(03)", label: "TÂM ĐẮC & THÁCH THỨC KHI XÂY DỰNG PORTFOLIO" },
    ];

    const exerciseLinks = (projects || [])
      .map(
        (proj, pIdx) =>
          `<a href="#project-item-${pIdx}" class="pill hover-lift" style="display:inline-flex;align-items:center;gap:6px;border-radius:999px;border:1px solid rgba(255,255,255,0.35);padding:5px 14px;font-size:12px;color:var(--bg, #FFF3E6);background:rgba(255,255,255,0.1);text-decoration:none;"><span style="font-weight:700;opacity:0.8;">0${pIdx + 1}.</span><span>${escapeHtml(stripLeadingIndex(proj.title))}</span></a>`,
      )
      .join("");

    return `<section id="contact" class="reveal-on-scroll" style="padding-bottom:0;">
      <div class="conclusion-band">
        ${svgSpiralMusicStaff()}
        <div class="conclusion-heading-row">
          ${svgFourPointStar(32)}
          <h2 class="conclusion-heading font-editorial">Conclusion</h2>
          ${svgFourPointStar(32)}
        </div>

        <div class="conclusion-pills-grid">
          ${conclusionPills
            .map(
              (p) => `<div class="conclusion-pill-col">
            <span class="conclusion-pill-num">${p.num}</span>
            <div class="conclusion-pill-card hover-lift">${p.label}</div>
          </div>`,
            )
            .join("")}
        </div>

        <div style="max-width:760px;margin:24px auto 0;text-align:center;">
          <p style="font-size:15px;line-height:1.7;color:var(--text);opacity:0.9;">Hành trình thực hiện các dự án đã trang bị cho tôi nền tảng vững chắc về tư duy giải pháp, năng lực ứng dụng AI sáng tạo và khả năng hoàn thiện sản phẩm theo chuẩn mực chất lượng cao.</p>
        </div>

        <div class="mocha-box-wrap">
          ${svgRotaSheetSticker()}
          <div class="mocha-contact-box">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;opacity:0.78;">${escapeHtml(
              contact.title,
            )}</p>
            <p style="margin:12px 0 0;font-size:16px;line-height:1.65;">${escapeHtml(
              contact.subtitle,
            )}</p>
            ${
              about?.contactInfo.email
                ? `<p style="margin:18px 0 0;font-size:14px;font-weight:600;">Liên hệ trực tiếp: <a href="mailto:${escapeHtml(
                    about.contactInfo.email,
                  )}">${escapeHtml(about.contactInfo.email)}</a></p>`
                : ""
            }
            ${
              about?.contactInfo.phone
                ? `<p style="margin:6px 0 0;font-size:14px;">Điện thoại: ${escapeHtml(
                    about.contactInfo.phone,
                  )}</p>`
                : ""
            }
            ${
              about?.contactInfo.location
                ? `<p style="margin:6px 0 0;font-size:14px;">Địa điểm: ${escapeHtml(
                    about.contactInfo.location,
                  )}</p>`
                : ""
            }
            ${
              about && about.contactInfo.socials.length > 0
                ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;">${about.contactInfo.socials
                    .map(
                      (s) =>
                        `<a href="${escapeHtml(
                          safeHref(s.url),
                        )}" target="_blank" rel="noreferrer" style="border:1px solid rgba(255,255,255,0.4);color:var(--bg);background:rgba(255,255,255,0.08);padding:5px 14px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:600;">${escapeHtml(
                          s.platform,
                        )}</a>`,
                    )
                    .join("")}</div>`
                : ""
            }
            ${
              exerciseLinks
                ? `<div style="margin-top:20px;border-top:1px solid rgba(255,255,255,0.2);padding-top:16px;">
              <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;opacity:0.85;margin:0 0 10px;">TỔNG HỢP CÁC ĐƯỜNG LIÊN KẾT DẪN TỚI CÁC BÀI TẬP</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">${exerciseLinks}</div>
            </div>`
                : ""
            }
          </div>
        </div>
      </div>

      <div class="thank-you-band">
        ${svgHalftoneVinylLeft()}
        ${svgThankYouVinylBurst()}
        <h2 class="thank-you-title font-editorial">Thank You !</h2>
        <p style="position:relative;z-index:2;margin:18px 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;">${escapeHtml(
          ownerIdentity || contact.thankYouMessage,
        )}</p>
        <p style="position:relative;z-index:2;margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;color:var(--secondary);">${escapeHtml(
          contact.thankYouMessage,
        )}</p>
      </div>

      ${courseFooterHtml}

      <div class="canva-footer-strip">
        <div style="display:flex;gap:16px;">
          <span>Điều khoản và hỗ trợ</span>
          <span>Chính sách quyền riêng tư</span>
        </div>
        <span>Canva Editorial Portfolio</span>
      </div>
    </section>`;
  }

  return `<section id="contact" class="reveal-on-scroll">
    <div class="contact-box">
      <p style="text-transform:uppercase; letter-spacing:0.18em; font-size:12px; opacity:0.85;">${escapeHtml(
        contact.thankYouMessage,
      )}</p>
      <h2 style="margin:8px 0;">${escapeHtml(contact.title)}</h2>
      <p style="opacity:0.9;">${escapeHtml(contact.subtitle)}</p>
      ${
        about?.contactInfo.email
          ? `<p>Email: <a href="mailto:${escapeHtml(
              about.contactInfo.email,
            )}">${escapeHtml(about.contactInfo.email)}</a></p>`
          : ""
      }
      ${
        about?.contactInfo.phone
          ? `<p>Điện thoại: ${escapeHtml(about.contactInfo.phone)}</p>`
          : ""
      }
      ${
        about?.contactInfo.location
          ? `<p>Địa điểm: ${escapeHtml(about.contactInfo.location)}</p>`
          : ""
      }
      ${
        about && about.contactInfo.socials.length > 0
          ? `<div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:16px;">${about.contactInfo.socials
              .map(
                (s) =>
                  `<a href="${escapeHtml(
                    safeHref(s.url),
                  )}" target="_blank" rel="noreferrer" style="border:1px solid rgba(255,255,255,0.45); padding:6px 14px; border-radius:999px; text-decoration:none; font-size:13px;">${escapeHtml(
                    s.platform,
                  )}</a>`,
              )
              .join("")}</div>`
          : ""
      }
    </div>
    ${courseFooterHtml}
  </section>`;
}

export function renderStandaloneHtml(
  doc: PortfolioDocument,
  assetMap: Map<string, CollectedAsset>,
  inlineCss: boolean = false,
): string {
  const resolveSrc = (url: string) => assetMap.get(url)?.bundleRelPath || url;
  const pal = resolveDocPalette(doc);
  const isCanvaEditorial = pal.isCanvaEditorial;

  const hero = doc.sections.find((s): s is HeroSection => s.type === "hero");
  const about = doc.sections.find((s): s is AboutSection => s.type === "about");
  const education = doc.sections.find(
    (s): s is EducationSection => s.type === "education",
  );
  const projectsSec = doc.sections.find(
    (s): s is ProjectsSection => s.type === "projects",
  );

  const cssBlock = inlineCss
    ? `<style>${renderStandaloneCss(doc)}</style>`
    : `<link rel="stylesheet" href="./assets/styles.css" />`;
  const effects = doc.theme.effects ?? {
    enableFloat: false,
    enableGlow: false,
    enableTilt: false,
    enableSparkles: false,
    revealVariant: "fade-up" as const,
    enableParallax: false,
  };
  const effectDecorations = [
    effects.enableFloat
      ? `<span class="effect-orb" style="top:-7%;left:-6%;background:radial-gradient(circle,${escapeHtml(pal.primary)}80,transparent 70%);opacity:.35;"></span>
         <span class="effect-orb" style="background:radial-gradient(circle,${escapeHtml(pal.secondary)}70,transparent 70%);opacity:.3;"></span>
         <span class="effect-orb" style="background:radial-gradient(circle,${escapeHtml(pal.primary)}60,transparent 70%);opacity:.25;"></span>`
      : "",
    effects.enableGlow
      ? `<span class="effect-glow" style="top:28%;left:18%;background:radial-gradient(circle,${escapeHtml(pal.primary)}55,transparent 68%);opacity:.24;"></span>
         <span class="effect-glow" style="right:8%;bottom:18%;background:radial-gradient(circle,${escapeHtml(pal.secondary)}45,transparent 68%);opacity:.2;"></span>`
      : "",
    effects.enableSparkles
      ? [
          ["12%", "8%", pal.primary],
          ["22%", "89%", pal.secondary],
          ["45%", "5%", "#F59E0B"],
          ["58%", "92%", pal.primary],
          ["78%", "12%", pal.secondary],
          ["88%", "86%", "#F59E0B"],
        ]
          .map(
            ([top, left, color], index) =>
              `<svg class="effect-sparkle" style="top:${top};left:${left};animation-delay:${index * 0.45}s;fill:${escapeHtml(color)};" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z"/></svg>`,
          )
          .join("")
      : "",
    effects.enableParallax &&
    (!doc.theme.backgroundIllustration ||
      doc.theme.backgroundIllustration.mode === "none" ||
      (doc.theme.backgroundIllustration.mode === "preset" &&
        doc.theme.backgroundIllustration.presetId === "none"))
      ? `<span class="effect-parallax-wash"></span>`
      : "",
  ].join("");
  const effectLayerHtml = effectDecorations
    ? `<div class="portfolio-export-effects" aria-hidden="true">${effectDecorations}</div>`
    : "";

  const navLinksHtml = doc.sections
    .map(
      (sec) => `<a href="#${sec.type}">${escapeHtml(NAV_LABELS[sec.type])}</a>`,
    )
    .join("");

  const modalProjects: ProjectItem[] = [];
  const sectionsHtml = doc.sections
    .map((sec) => {
      const sectionHtml = (() => {
        switch (sec.type) {
          case "hero":
            return renderHeroHtml(sec, resolveSrc, isCanvaEditorial);
          case "about":
            return renderAboutHtml(
              sec,
              isCanvaEditorial,
              hero?.avatar.url ? resolveSrc(hero.avatar.url) : undefined,
              hero?.fullName,
              education,
            );
          case "skills":
            return renderSkillsHtml(sec, resolveSrc, isCanvaEditorial);
          case "experience":
            return renderExperienceHtml(sec, isCanvaEditorial);
          case "education":
            return renderEducationHtml(sec, isCanvaEditorial);
          case "projects":
            return renderProjectsHtml(
              sec,
              resolveSrc,
              modalProjects,
              isCanvaEditorial,
            );
          case "contact":
            return renderContactHtml(
              sec,
              about,
              hero,
              isCanvaEditorial,
              projectsSec?.projects,
              doc.profileOwner,
            );
        }
      })();
      return applySectionTypography(
        sectionHtml,
        sec,
        pal.headingFont,
        pal.bodyFont,
      );
    })
    .join("\n");

  const safeProjectsJson = JSON.stringify(modalProjects).replace(
    /</g,
    "\\u003c",
  );

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(doc.seo.title)}</title>
  <meta name="description" content="${escapeHtml(doc.seo.description)}" />
  ${
    doc.seo.ogImage
      ? `<meta property="og:image" content="${escapeHtml(
          resolveSrc(doc.seo.ogImage),
        )}" />`
      : ""
  }
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${cssBlock}
</head>
<body${isCanvaEditorial ? ' class="theme-canva-editorial"' : ""}>
  <div class="portfolio-export-root"
    data-effect-tilt="${effects.enableTilt ? "enabled" : "disabled"}"
    data-effect-glow="${effects.enableGlow ? "enabled" : "disabled"}"
    data-effect-parallax="${effects.enableParallax ? "enabled" : "disabled"}"
    data-effect-float="${effects.enableFloat ? "enabled" : "disabled"}"
    data-effect-sparkles="${effects.enableSparkles ? "enabled" : "disabled"}"
    data-reveal-variant="${effects.revealVariant}">
  ${effectLayerHtml}
  <nav class="nav no-print" aria-label="Điều hướng Portfolio">
    <div class="nav-inner">
      <strong class="font-editorial">${escapeHtml(hero?.fullName || doc.seo.title)}</strong>
      <div class="nav-links">
        ${navLinksHtml}
        <button type="button" class="btn-print" onclick="window.print()">Xuất PDF</button>
      </div>
    </div>
  </nav>

  <main class="container">
    ${sectionsHtml}
  </main>
  </div>

  <div id="assignment-modal" class="modal-backdrop no-print" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="modal-panel glass-panel">
      <div class="modal-top-bar">
        <div class="modal-nav-group">
          <span id="modal-counter-badge" class="modal-counter-badge"></span>
          <button type="button" id="modal-prev-btn" class="modal-icon-btn" aria-label="Bài trước" title="Bài trước (ArrowLeft)">‹</button>
          <button type="button" id="modal-next-btn" class="modal-icon-btn" aria-label="Bài tiếp theo" title="Bài tiếp theo (ArrowRight)">›</button>
        </div>
        <div class="modal-actions-group">
          <button type="button" id="modal-fullscreen-btn" class="modal-icon-btn" aria-label="Mở rộng toàn màn hình" title="Mở rộng toàn màn hình (100vw/100vh)">⛶</button>
          <button type="button" id="modal-close-btn" class="modal-close" aria-label="Đóng cửa sổ chi tiết">&times;</button>
        </div>
      </div>
      <div id="modal-content"></div>
    </div>
  </div>

  <script id="portfolio-projects-data" type="application/json">${safeProjectsJson}</script>
  <script>
    (function () {
      var containers = document.querySelectorAll('.about-highlight-value');
      if (!containers.length) return;

      function measure(container) {
        var text = container.querySelector('.about-highlight-value__text');
        if (!text) return;
        var distance = Math.max(0, Math.ceil(text.scrollWidth - container.clientWidth));
        if (distance > 0) {
          container.tabIndex = 0;
          text.classList.add('is-overflowing');
          container.style.setProperty('--about-marquee-distance', '-' + distance + 'px');
          container.style.setProperty('--about-marquee-duration', Math.max(4, distance / 24) + 's');
        } else {
          container.removeAttribute('tabindex');
          text.classList.remove('is-overflowing');
          container.style.removeProperty('--about-marquee-distance');
          container.style.removeProperty('--about-marquee-duration');
        }
      }

      if (typeof ResizeObserver !== 'undefined') {
        for (var i = 0; i < containers.length; i++) {
          (function (container) {
            var text = container.querySelector('.about-highlight-value__text');
            var observer = new ResizeObserver(function () { measure(container); });
            observer.observe(container);
            if (text) observer.observe(text);
            measure(container);
          })(containers[i]);
        }
      } else {
        function measureAll() {
          for (var j = 0; j < containers.length; j++) measure(containers[j]);
        }
        measureAll();
        window.addEventListener('resize', measureAll);
      }
    })();
  </script>
  <script>
    (function () {
      var dataEl = document.getElementById('portfolio-projects-data');
      var modal = document.getElementById('assignment-modal');
      var content = document.getElementById('modal-content');
      var closeBtn = document.getElementById('modal-close-btn');
      var prevBtn = document.getElementById('modal-prev-btn');
      var nextBtn = document.getElementById('modal-next-btn');
      var fullscreenBtn = document.getElementById('modal-fullscreen-btn');
      var counterBadge = document.getElementById('modal-counter-badge');
      if (!dataEl || !modal || !content || !closeBtn) return;
      var panel = modal.querySelector('.modal-panel');
      var projects = [];
      try { projects = JSON.parse(dataEl.textContent || '[]'); } catch (e) { projects = []; }

      var currentProjIdx = 0;
      var currentMediaIdx = 0;

      function updateCounter() {
        if (counterBadge && projects.length > 0) {
          var cur = String(currentProjIdx + 1).padStart(2, '0');
          var tot = String(projects.length).padStart(2, '0');
          counterBadge.textContent = cur + ' / ' + tot + ' — BÀI TẬP ' + (currentProjIdx + 1);
        }
      }

      function makeEl(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
      }

      function openProject(projIdx, mediaIdx) {
        if (projects.length === 0) return;
        if (projIdx < 0) projIdx = projects.length - 1;
        if (projIdx >= projects.length) projIdx = 0;
        currentProjIdx = projIdx;
        currentMediaIdx = mediaIdx || 0;
        updateCounter();

        var proj = projects[projIdx];
        if (!proj) return;
        var media = Array.isArray(proj.media) ? proj.media : [];
        var active = media[currentMediaIdx] || media[0];
        content.textContent = '';

        var headerRow = makeEl('div', 'modal-header-row');
        headerRow.style.display = 'flex';
        headerRow.style.alignItems = 'center';
        headerRow.style.flexWrap = 'wrap';
        headerRow.style.gap = '8px';
        headerRow.style.marginBottom = '8px';

        var catPill = makeEl('span', 'pill', (proj.chapterTitle || ('Chương ' + (projIdx + 1) + ': ' + (proj.category || ''))));
        headerRow.appendChild(catPill);

        var exPill = makeEl('span', 'pill', (proj.exerciseNumber || ('Bài tập ' + (projIdx + 1))));
        exPill.style.backgroundColor = 'transparent';
        exPill.style.border = '1px solid currentColor';
        headerRow.appendChild(exPill);

        var linkStandalone = makeEl('a', 'pill', 'Mở trang riêng bài làm ↗');
        linkStandalone.href = 'projects/project-' + (projIdx + 1) + '.html';
        linkStandalone.style.textDecoration = 'none';
        linkStandalone.style.marginLeft = 'auto';
        headerRow.appendChild(linkStandalone);

        content.appendChild(headerRow);

        var heading = makeEl('h2', '', proj.title || '');
        heading.style.margin = '8px 0 16px';
        content.appendChild(heading);

        var grid = makeEl('div', 'modal-body-grid');
        var mediaSlot = makeEl('div');
        mediaSlot.id = 'modal-media-slot';
        if (active && active.url) {
          var modalImg = document.createElement('img');
          modalImg.className = 'modal-img';
          modalImg.src = active.url;
          modalImg.alt = active.caption || proj.title || '';
          mediaSlot.appendChild(modalImg);
        }
        if (active && active.caption) {
          var cap = makeEl('p', '', active.caption);
          cap.style.fontSize = '12px';
          cap.style.opacity = '0.75';
          cap.style.marginTop = '6px';
          mediaSlot.appendChild(cap);
        }
        if (active && active.aiPromptUsed) {
          var promptBox = makeEl('div', 'brief-box');
          promptBox.style.marginTop = '8px';
          promptBox.style.fontSize = '12px';
          promptBox.appendChild(makeEl('strong', '', '✨ Prompt AI: '));
          promptBox.appendChild(document.createTextNode(active.aiPromptUsed));
          mediaSlot.appendChild(promptBox);
        }
        grid.appendChild(mediaSlot);

        var infoCol = makeEl('div');
        if (proj.assignmentBrief) {
          var brief = makeEl('div', 'brief-box');
          brief.appendChild(makeEl('strong', '', '🎯 Đề bài / Mục tiêu (INF2501): '));
          brief.appendChild(document.createTextNode(proj.assignmentBrief));
          infoCol.appendChild(brief);
        }
        var summaryP = makeEl('p');
        summaryP.style.marginTop = '12px';
        summaryP.appendChild(makeEl('strong', '', '💡 Quá trình thực hiện & Giải pháp: '));
        summaryP.appendChild(document.createTextNode(proj.summary || ''));
        infoCol.appendChild(summaryP);
        if (proj.promptComparison) {
          var compBox = makeEl('div', 'brief-box');
          compBox.style.marginTop = '10px';
          compBox.appendChild(makeEl('strong', '', '⚖️ So sánh Prompt ban đầu vs Cải tiến: '));
          var initialP = makeEl('p', '', '1. Ban đầu: ' + proj.promptComparison.initialPrompt);
          initialP.style.fontSize = '12px';
          initialP.style.margin = '4px 0';
          var improvedP = makeEl('p', '', '2. Cải tiến: ' + proj.promptComparison.improvedPrompt);
          improvedP.style.fontSize = '12px';
          improvedP.style.margin = '4px 0';
          compBox.appendChild(initialP);
          compBox.appendChild(improvedP);
          infoCol.appendChild(compBox);
        }

        var takeaways = Array.isArray(proj.keyTakeaways)
          ? proj.keyTakeaways.filter(function (item) { return item && item.trim(); })
          : [];
        if (takeaways.length > 0) {
          var ul = makeEl('ul');
          ul.style.marginTop = '10px';
          for (var i = 0; i < takeaways.length; i++) {
            ul.appendChild(makeEl('li', '', takeaways[i]));
          }
          infoCol.appendChild(ul);
        }

        if (proj.fullRawExcerpt) {
          var det = makeEl('details');
          det.style.marginTop = '10px';
          var sum = makeEl('summary', '', 'Nội dung trích xuất chi tiết');
          sum.style.cursor = 'pointer';
          sum.style.fontWeight = '600';
          sum.style.fontSize = '13px';
          var pre = makeEl('pre', '', proj.fullRawExcerpt);
          pre.style.whiteSpace = 'pre-wrap';
          pre.style.fontFamily = 'inherit';
          pre.style.fontSize = '12px';
          det.appendChild(sum);
          det.appendChild(pre);
          infoCol.appendChild(det);
        }

        grid.appendChild(infoCol);
        content.appendChild(grid);

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }

      function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        if (panel) panel.classList.remove('is-fullscreen');
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          openProject(currentProjIdx - 1, 0);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          openProject(currentProjIdx + 1, 0);
        });
      }
      if (fullscreenBtn && panel) {
        fullscreenBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          panel.classList.toggle('is-fullscreen');
        });
      }
      closeBtn.addEventListener('click', closeModal);

      document.addEventListener('click', function (ev) {
        var target = ev.target && ev.target.closest ? ev.target.closest('[data-open-project]') : null;
        if (target) {
          var pIdx = Number(target.getAttribute('data-open-project'));
          var mIdx = Number(target.getAttribute('data-media-index') || '0');
          openProject(pIdx, mIdx);
        } else if (ev.target === modal) {
          closeModal();
        }
      });

      document.addEventListener('keydown', function (ev) {
        if (!modal.classList.contains('open')) return;
        if (ev.key === 'Escape') {
          if (panel && panel.classList.contains('is-fullscreen')) {
            panel.classList.remove('is-fullscreen');
          } else {
            closeModal();
          }
        } else if (ev.key === 'ArrowLeft') {
          openProject(currentProjIdx - 1, 0);
        } else if (ev.key === 'ArrowRight') {
          openProject(currentProjIdx + 1, 0);
        }
      });
    })();
  </script>
  <script>
    (function () {
      var root = document.querySelector('.portfolio-export-root[data-effect-parallax="enabled"]');
      if (!root) return;
      var frame = 0;
      function updateParallax() {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(function () {
          var offset = Math.min(window.scrollY * 0.12, 120);
          root.style.setProperty('--portfolio-parallax-offset', offset + 'px');
        });
      }
      updateParallax();
      window.addEventListener('scroll', updateParallax, { passive: true });
      window.addEventListener('resize', updateParallax);
    })();
  </script>
  <script>
    (function () {
      var root = document.querySelector('.portfolio-export-root');
      var els = root ? root.querySelectorAll('.reveal-on-scroll') : [];
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        for (var i = 0; i < els.length; i++) {
          els[i].classList.add('is-revealed');
        }
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              entries[i].target.classList.add('is-revealed');
            }
          }
        },
        { threshold: 0.01, rootMargin: '0px 0px -20px 0px' }
      );
      for (var j = 0; j < els.length; j++) {
        if (els[j].getBoundingClientRect().top < window.innerHeight) {
          els[j].classList.add('is-revealed');
        }
        observer.observe(els[j]);
      }
    })();
  </script>
  <noscript>
    <style>
      .reveal-on-scroll {
        opacity: 1 !important;
        transform: none !important;
      }
    </style>
  </noscript>
</body>
</html>`;
}

export function renderStandaloneProjectPageHtml(
  doc: PortfolioDocument,
  project: ProjectItem,
  projectIndex: number,
  allProjects: ProjectItem[],
  assetMap: Map<string, CollectedAsset>,
): string {
  const isCanvaEditorial = doc.templateId === "canva-editorial";
  const total = allProjects.length;
  const currentNum = projectIndex + 1;
  const prevIdx = (projectIndex - 1 + total) % total;
  const nextIdx = (projectIndex + 1) % total;
  const prevProj = allProjects[prevIdx];
  const nextProj = allProjects[nextIdx];

  const resolveSubpageSrc = (url: string): string => {
    const asset = assetMap.get(url);
    if (asset) {
      return `../${asset.zipPath}`;
    }
    return url;
  };

  const chapterText =
    project.chapterTitle || `Chương ${currentNum}: ${project.category}`;
  const exerciseText =
    project.exerciseNumber ||
    `Bài tập ${currentNum}${currentNum <= 6 ? ` (mục ${currentNum}.4)` : ""}`;

  const mediaList = project.media ?? [];
  const primaryMedia = mediaList[0];

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(project.title)} | ${escapeHtml(doc.seo.title)}</title>
  <meta name="description" content="${escapeHtml(project.summary || doc.seo.description)}" />
  ${
    primaryMedia?.url
      ? `<meta property="og:image" content="${escapeHtml(resolveSubpageSrc(primaryMedia.url))}" />`
      : ""
  }
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../assets/styles.css" />
</head>
<body${isCanvaEditorial ? ' class="theme-canva-editorial"' : ""}>
  <header class="project-subpage-header no-print container">
    <a href="../index.html#projects" class="btn-outline hover-lift" style="text-decoration:none;">← Quay lại Portfolio</a>
    <span class="modal-counter-badge">
      ${String(currentNum).padStart(2, "0")} / ${String(total).padStart(2, "0")} — BÀI TẬP ${currentNum}
    </span>
    <div style="display:flex;gap:8px;">
      <a href="project-${prevIdx + 1}.html" class="btn-outline hover-lift" style="text-decoration:none;" title="${escapeHtml(prevProj.title)}">‹ Bài trước</a>
      <a href="project-${nextIdx + 1}.html" class="btn-outline hover-lift" style="text-decoration:none;" title="${escapeHtml(nextProj.title)}">Bài tiếp theo ›</a>
    </div>
  </header>

  <main class="container">
    <nav aria-label="Breadcrumb" style="display:flex;align-items:center;gap:8px;font-size:13px;opacity:0.8;margin-bottom:16px;">
      <a href="../index.html" style="color:inherit;text-decoration:none;">Portfolio</a>
      <span>/</span>
      <a href="../index.html#projects" style="color:inherit;text-decoration:none;">Dự án &amp; Bài tập</a>
      <span>/</span>
      <span style="font-weight:600;color:var(--primary);">${escapeHtml(project.title)}</span>
    </nav>

    <div style="margin-bottom:28px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
        <span class="pill" style="margin:0;">${escapeHtml(chapterText)}</span>
        <span class="pill" style="margin:0;background:transparent;border:1px solid currentColor;">${escapeHtml(exerciseText)}</span>
        ${
          project.sourceDocxFileName
            ? `<span class="pill" style="margin:0;opacity:0.8;">📄 ${escapeHtml(project.sourceDocxFileName)}</span>`
            : ""
        }
        ${renderDocxLink(project.docxUrl)}
      </div>
      <h1 class="font-editorial" style="font-size:clamp(28px, 4.5vw, 48px);margin:0;line-height:1.2;">
        ${escapeHtml(project.title)}
      </h1>
    </div>

    <!-- PHẦN A: MỤC TIÊU BÀI TẬP (INF2501) -->
    <section class="project-subpage-card">
      <div style="border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:12px;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.65;">Phần A — Tiêu chuẩn INF2501</span>
        <h2 class="font-editorial" style="font-size:24px;margin:4px 0 0;color:var(--primary);">Mục tiêu bài tập &amp; Kỹ năng rèn luyện</h2>
      </div>

      <div class="project-detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(100%, 300px), 1fr));gap:24px;">
        <div>
          <div class="brief-box" style="margin-top:0;">
            <strong style="color:var(--primary);display:block;margin-bottom:6px;">🎯 Yêu cầu đề bài (Assignment Brief):</strong>
            <p style="margin:0;line-height:1.6;">${escapeHtml(project.assignmentBrief || project.summary)}</p>
          </div>

          ${
            project.keyTakeaways.some((takeaway) => takeaway.trim())
              ? `<div style="margin-top:16px;">
                  <strong style="display:block;margin-bottom:8px;font-size:14px;color:var(--secondary);">✨ Kỹ năng cốt lõi &amp; Kết quả kỳ vọng:</strong>
                  <ul class="takeaway-list" style="margin:0;">
                    ${project.keyTakeaways
                      .filter((takeaway) => takeaway.trim())
                      .map(
                        (t) =>
                          `<li><span class="takeaway-dot"></span><span>${escapeHtml(t)}</span></li>`,
                      )
                      .join("")}
                  </ul>
                </div>`
              : ""
          }
        </div>

        <div>
          ${
            project.metrics.length > 0
              ? `<div>
                  <strong style="display:block;margin-bottom:8px;font-size:13px;opacity:0.75;">Chỉ số đánh giá:</strong>
                  <div class="metrics-row">
                    ${project.metrics
                      .map(
                        (m) =>
                          `<div class="metric-chip"><span style="color:var(--primary);">${escapeHtml(
                            m.label,
                          )}: </span><strong>${escapeHtml(m.value)}</strong></div>`,
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }

          ${
            project.tags.length > 0
              ? `<div style="margin-top:16px;">
                  <strong style="display:block;margin-bottom:8px;font-size:13px;opacity:0.75;">Thẻ chủ đề:</strong>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${project.tags
                      .map(
                        (t) =>
                          `<span class="pill" style="margin:0;">#${escapeHtml(t)}</span>`,
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
        </div>
      </div>
    </section>

    <!-- PHẦN B: QUÁ TRÌNH THỰC HIỆN (INF2501) -->
    <section class="project-subpage-card">
      <div style="border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:12px;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.65;">Phần B — Tiêu chuẩn INF2501</span>
        <h2 class="font-editorial" style="font-size:24px;margin:4px 0 0;color:var(--secondary);">Quá trình thực hiện</h2>
      </div>

      <div style="margin-bottom:20px;">
        <strong style="display:block;font-size:14px;margin-bottom:10px;">1. Các bước thực hiện chi tiết:</strong>
        ${
          project.processSteps && project.processSteps.length > 0
            ? `<div class="project-detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr));gap:12px;">
                ${project.processSteps
                  .map(
                    (s, sIdx) =>
                      `<div style="display:flex;gap:12px;padding:14px;border-radius:14px;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.08);">
                        <span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;background:var(--primary);color:#fff;font-size:11px;font-weight:700;flex-shrink:0;">${sIdx + 1}</span>
                        <p style="margin:0;font-size:13px;line-height:1.5;">${escapeHtml(s)}</p>
                      </div>`,
                  )
                  .join("")}
              </div>`
            : `<div style="padding:14px;border-radius:14px;background:rgba(0,0,0,0.03);font-size:14px;line-height:1.6;">${escapeHtml(project.summary)}</div>`
        }
      </div>

      ${
        project.obstaclesAndSolutions
          ? `<div class="brief-box" style="margin-top:16px;">
              <strong style="display:block;margin-bottom:6px;">⚠️ Khó khăn gặp phải &amp; Giải pháp:</strong>
              <p style="margin:0;font-size:13px;line-height:1.5;">${escapeHtml(project.obstaclesAndSolutions)}</p>
            </div>`
          : ""
      }
    </section>

    <!-- PHẦN C: SẢN PHẨM CUỐI CÙNG & MINH CHỨNG (INF2501) -->
    <section class="project-subpage-card">
      <div style="border-bottom:1px solid rgba(0,0,0,0.1);padding-bottom:12px;margin-bottom:16px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;opacity:0.65;">Phần C — Tiêu chuẩn INF2501</span>
        <h2 class="font-editorial" style="font-size:24px;margin:4px 0 0;color:var(--primary);">Sản phẩm cuối cùng &amp; Minh chứng bài làm</h2>
      </div>

      <div class="project-detail-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(100%, 320px), 1fr));gap:24px;">
        <div>
          ${
            primaryMedia
              ? `<div>
                  <div style="overflow:hidden;border-radius:18px;border:1px solid rgba(0,0,0,0.12);background:rgba(0,0,0,0.03);text-align:center;">
                    <img id="subpage-active-img" src="${escapeHtml(resolveSubpageSrc(primaryMedia.url))}" alt="${escapeHtml(primaryMedia.caption || project.title)}" decoding="async" style="display:block;max-height:min(70vh,760px);height:auto;width:100%;object-fit:contain;padding:8px;" />
                  </div>
                  ${
                    primaryMedia.caption
                      ? `<p id="subpage-active-cap" style="font-size:12px;font-style:italic;opacity:0.8;margin:8px 0 0;">${escapeHtml(primaryMedia.caption)}</p>`
                      : ""
                  }
                  ${
                    mediaList.length > 1
                      ? `<div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;">
                          ${mediaList
                            .map(
                              (m, mIdx) =>
                                `<button type="button" onclick="document.getElementById('subpage-active-img').src='${escapeHtml(
                                  resolveSubpageSrc(m.url),
                                )}';var c=document.getElementById('subpage-active-cap');if(c)c.textContent='${escapeHtml(
                                  m.caption || "",
                                )}';" style="width:72px;height:56px;border-radius:10px;overflow:hidden;border:2px solid ${
                                  mIdx === 0 ? "var(--primary)" : "transparent"
                                };cursor:pointer;padding:0;background:none;flex-shrink:0;">
                                  <img src="${escapeHtml(resolveSubpageSrc(m.url))}" alt="${escapeHtml(m.caption || "")}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;" />
                                </button>`,
                            )
                            .join("")}
                        </div>`
                      : ""
                  }
                </div>`
              : `<div style="padding:48px 16px;text-align:center;border:2px dashed rgba(0,0,0,0.15);border-radius:18px;font-size:14px;opacity:0.65;">Chưa có ảnh đính kèm cho bài tập này</div>`
          }
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">
          ${
            project.promptComparison
              ? `<div class="brief-box" style="margin:0;">
                  <strong style="color:var(--primary);display:block;margin-bottom:8px;">⚖️ So sánh Prompt ban đầu vs Cải tiến:</strong>
                  <div style="margin-bottom:8px;padding:8px;border-radius:8px;background:rgba(239, 68, 68, 0.08);border:1px solid rgba(239, 68, 68, 0.25);">
                    <span style="font-weight:700;color:#B91C1C;font-size:12px;">1. Prompt ban đầu:</span>
                    <p style="margin:4px 0 0;font-size:12px;font-family:monospace;">${escapeHtml(project.promptComparison.initialPrompt)}</p>
                  </div>
                  <div style="margin-bottom:8px;padding:8px;border-radius:8px;background:rgba(16, 185, 129, 0.08);border:1px solid rgba(16, 185, 129, 0.25);">
                    <span style="font-weight:700;color:#047857;font-size:12px;">2. Prompt cải tiến:</span>
                    <p style="margin:4px 0 0;font-size:12px;font-family:monospace;">${escapeHtml(project.promptComparison.improvedPrompt)}</p>
                  </div>
                  <div style="padding:8px;border-radius:8px;background:rgba(59, 130, 246, 0.08);border:1px solid rgba(59, 130, 246, 0.25);">
                    <span style="font-weight:700;color:#1D4ED8;font-size:12px;">3. Kết quả AI:</span>
                    <p style="margin:4px 0 0;font-size:12px;">${escapeHtml(project.promptComparison.aiOutput)}</p>
                  </div>
                </div>`
              : ""
          }

          ${
            project.links.length > 0
              ? `<div>
                  <strong style="display:block;margin-bottom:8px;font-size:13px;opacity:0.75;">Đường liên kết sản phẩm:</strong>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${project.links
                      .map(
                        (l) =>
                          `<a href="${escapeHtml(safeHref(l.url))}" target="_blank" rel="noreferrer" class="btn-outline hover-lift" style="text-decoration:none;font-size:12px;">🔗 ${escapeHtml(l.label)}</a>`,
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }

          ${
            project.fullRawExcerpt
              ? `<details style="margin-top:auto;padding:12px;border-radius:14px;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.08);">
                  <summary style="cursor:pointer;font-weight:600;font-size:13px;color:var(--secondary);">📄 Nội dung trích xuất chi tiết từ bài làm (DOCX)</summary>
                  <pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;opacity:0.85;margin-top:10px;max-height:240px;overflow-y:auto;">${escapeHtml(project.fullRawExcerpt)}</pre>
                </details>`
              : ""
          }
        </div>
      </div>
    </section>

    <!-- FOOTER NEXT / PREV TRANSITION CARDS -->
    <div class="transition-cards-grid no-print">
      <a href="project-${prevIdx + 1}.html" class="transition-card">
        <div class="transition-card-icon">‹</div>
        <div style="min-width:0;flex:1;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;opacity:0.65;display:block;">‹ Bài trước (Bài ${prevIdx + 1})</span>
          <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:16px;">${escapeHtml(prevProj.title)}</strong>
        </div>
      </a>

      <a href="project-${nextIdx + 1}.html" class="transition-card" style="text-align:right;">
        <div style="min-width:0;flex:1;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;opacity:0.65;display:block;">Bài tiếp theo (Bài ${nextIdx + 1}) ›</span>
          <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:16px;">${escapeHtml(nextProj.title)}</strong>
        </div>
        <div class="transition-card-icon">›</div>
      </a>
    </div>
  </main>

  <script>
    document.addEventListener('keydown', function(ev) {
      if (ev.key === 'Escape') {
        window.location.href = '../index.html#projects';
      } else if (ev.key === 'ArrowLeft') {
        window.location.href = 'project-${prevIdx + 1}.html';
      } else if (ev.key === 'ArrowRight') {
        window.location.href = 'project-${nextIdx + 1}.html';
      }
    });
  </script>
</body>
</html>`;
}

function writePortfolioFolderIntoZip(zipFolder: JSZip, doc: PortfolioDocument) {
  const assetMap = collectAndMapAssets(doc);
  const html = renderStandaloneHtml(doc, assetMap, false);
  const css = renderStandaloneCss(doc);

  zipFolder.file("index.html", html);
  zipFolder.file("assets/styles.css", css);
  assetMap.forEach((asset) => {
    zipFolder.file(asset.zipPath, asset.buffer, { compression: "STORE" });
  });

  // Bundle standalone projects/project-X.html pages for every project inside the ZIP file
  const projectsSec = doc.sections.find(
    (s): s is ProjectsSection => s.type === "projects",
  );
  if (projectsSec && projectsSec.projects.length > 0) {
    const projects = projectsSec.projects;
    projects.forEach((proj, idx) => {
      const projHtml = renderStandaloneProjectPageHtml(
        doc,
        proj,
        idx,
        projects,
        assetMap,
      );
      // Bundle primary 1-based index page
      zipFolder.file(`projects/project-${idx + 1}.html`, projHtml);

      // Also bundle slug or id aliases if distinct
      if (proj.slug) {
        const safeSlug = sanitizeSlug(proj.slug);
        if (safeSlug && safeSlug !== `project-${idx + 1}`) {
          zipFolder.file(`projects/${safeSlug}.html`, projHtml);
        }
      }
      if (proj.id) {
        const safeId = sanitizeSlug(proj.id);
        if (safeId && safeId !== `project-${idx + 1}`) {
          zipFolder.file(`projects/${safeId}.html`, projHtml);
        }
      }
    });
  }
}

/**
 * Exports a single PortfolioDocument into a standalone static HTML/CSS + ./assets/images/ ZIP buffer.
 */
export async function exportSinglePortfolioZip(
  doc: PortfolioDocument,
): Promise<Buffer> {
  const zip = new JSZip();
  writePortfolioFolderIntoZip(zip, doc);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

/**
 * Exports multiple PortfolioDocuments into one bulk ZIP with deduplicated subfolders per slug.
 */
export async function exportBulkPortfoliosZip(
  docs: PortfolioDocument[],
): Promise<Buffer> {
  const zip = new JSZip();
  const usedFolders = new Set<string>();

  for (const doc of docs) {
    const baseSlug = sanitizeSlug(doc.slug);
    let folderName = baseSlug;
    let suffix = 2;
    while (usedFolders.has(folderName)) {
      folderName = `${baseSlug}-${suffix++}`;
    }
    usedFolders.add(folderName);

    const folder = zip.folder(folderName);
    if (folder) {
      writePortfolioFolderIntoZip(folder, doc);
    }
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
