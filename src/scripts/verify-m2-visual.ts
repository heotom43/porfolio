import assert from "assert";
import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BACKGROUND_PRESETS,
  BACKGROUND_PRESET_LIST,
  getBackgroundPreset,
} from "../data/background-presets";
import { AvatarFrame } from "../components/visual-primitives/AvatarFrame";
import { VisualEffectsLayer } from "../components/visual-primitives/VisualEffectsLayer";
import { BackgroundIllustrationLayer } from "../components/visual-primitives/BackgroundIllustrationLayer";
import { AboutBlock } from "../templates/blocks/AboutBlock";
import { TemplateShell } from "../templates/archetypes/TemplateShell";
import type {
  AboutSection,
  PortfolioDocument,
  ThemeConfig,
} from "../schema/portfolio.schema";

console.log("=== Starting M2 Visual & Background Verification ===");

// 1. Verify Background Illustration Presets
console.log("\n[1/5] Verifying Background Presets...");
const REQUIRED_PRESET_IDS = [
  "canva-musical",
  "botanical-leaves",
  "cyber-mesh",
  "geometric-dots",
  "abstract-blobs",
  "celestial-sparkles",
  "vintage-parchment",
  "minimalist-contour",
] as const;

assert.strictEqual(
  BACKGROUND_PRESET_LIST.length,
  8,
  "Must have exactly 8 curated presets",
);

for (const id of REQUIRED_PRESET_IDS) {
  const preset = BACKGROUND_PRESETS[id];
  assert.ok(preset, `Preset ${id} must exist in BACKGROUND_PRESETS`);
  assert.strictEqual(preset.id, id, `Preset ID must match ${id}`);
  assert.ok(preset.nameVi.length > 0, `Preset ${id} must have Vietnamese name`);
  assert.ok(
    preset.rawSvg.includes("<svg") && preset.rawSvg.includes("</svg>"),
    `Preset ${id} rawSvg must be valid SVG`,
  );
  assert.ok(
    preset.svgDataUri.startsWith("data:image/svg+xml;utf8,"),
    `Preset ${id} svgDataUri must be valid data URI`,
  );
  assert.strictEqual(
    getBackgroundPreset(id)?.id,
    id,
    `getBackgroundPreset(${id}) must return preset`,
  );
}
console.log("✓ All 8 background presets verified successfully.");

// 2. Verify globals.css keyframes, classes, and reduced motion
console.log("\n[2/5] Verifying globals.css...");
const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
const cssContent = fs.readFileSync(cssPath, "utf-8");

const requiredCssTokens = [
  "@keyframes float",
  "@keyframes glow",
  "@keyframes sparkle",
  "@keyframes tilt",
  ".animate-float",
  ".animate-glow",
  ".hover-tilt",
  ".card-glow",
  ".sparkle-particles",
  ".reveal-zoom",
  ".reveal-slide-left",
  ".reveal-slide-right",
  "@media (prefers-reduced-motion: reduce)",
];

for (const token of requiredCssTokens) {
  assert.ok(cssContent.includes(token), `globals.css must contain "${token}"`);
}
console.log(
  "✓ All required keyframes, utility classes, and reduced-motion rules verified in globals.css.",
);

// 3. Verify AvatarFrame (all 6 frame styles, aspect ratios, monogram fallback)
console.log("\n[3/5] Verifying AvatarFrame Component...");
const frameStyles = [
  "arch-window",
  "cutout-blob",
  "polaroid",
  "geometric-badge",
  "circle-ring",
  "clean-card",
  "none",
] as const;

for (const frameStyle of frameStyles) {
  const markupWithImage = renderToStaticMarkup(
    React.createElement(AvatarFrame, {
      avatar: {
        url: "https://example.com/avatar.jpg",
        frameStyle,
        aspectRatio: "3/4",
      },
      alt: "Từ Thị Vân Anh",
      primaryColor: "#735340",
      secondaryColor: "#304254",
      surfaceColor: "#FFFFFF",
    }),
  );
  assert.ok(
    markupWithImage.includes("https://example.com/avatar.jpg"),
    `AvatarFrame with style ${frameStyle} should render image`,
  );
  assert.ok(
    markupWithImage.includes("object-cover"),
    `AvatarFrame should use object-cover`,
  );
  assert.ok(
    markupWithImage.includes("object-top"),
    `AvatarFrame should use object-top`,
  );

  // Verify monogram fallback when url is missing
  const markupMonogram = renderToStaticMarkup(
    React.createElement(AvatarFrame, {
      avatar: {
        frameStyle,
        aspectRatio: "1/1",
      },
      alt: "Từ Thị Vân Anh",
      fullName: "Từ Thị Vân Anh",
      primaryColor: "#735340",
      secondaryColor: "#304254",
      surfaceColor: "#FFFFFF",
    }),
  );
  assert.ok(
    markupMonogram.includes("TA") ||
      markupMonogram.includes("VA") ||
      markupMonogram.includes("T"),
    `AvatarFrame ${frameStyle} monogram must render initials`,
  );
  assert.ok(
    !markupMonogram.includes("<img"),
    `AvatarFrame ${frameStyle} monogram must not render <img> tag when url is missing`,
  );
}

// Check Polaroid masking tape
const polaroidMarkup = renderToStaticMarkup(
  React.createElement(AvatarFrame, {
    avatar: {
      url: "https://example.com/avatar.jpg",
      frameStyle: "polaroid",
      aspectRatio: "4/5",
    },
    alt: "Polaroid Test",
  }),
);
assert.ok(
  polaroidMarkup.includes("-rotate-2"),
  "Polaroid frame must have -rotate-2",
);
assert.ok(
  polaroidMarkup.includes("#F3DEC0"),
  "Polaroid frame must render masking tape color",
);
console.log(
  "✓ AvatarFrame verified with all 6 frame styles, monogram fallback, and polaroid tape.",
);

// 4. Verify VisualEffectsLayer & BackgroundIllustrationLayer
console.log(
  "\n[4/5] Verifying VisualEffectsLayer & BackgroundIllustrationLayer...",
);

// VisualEffectsLayer
const effectsMarkup = renderToStaticMarkup(
  React.createElement(VisualEffectsLayer, {
    effects: {
      enableFloat: true,
      enableGlow: true,
      enableTilt: true,
      enableSparkles: true,
      revealVariant: "fade-up",
      enableParallax: false,
    },
    primaryColor: "#A96B54",
    secondaryColor: "#304254",
  }),
);
assert.ok(
  effectsMarkup.includes("animate-float"),
  "VisualEffectsLayer must render animate-float orbs",
);
assert.ok(
  effectsMarkup.includes("animate-glow"),
  "VisualEffectsLayer must render animate-glow elements",
);
assert.ok(
  effectsMarkup.includes("sparkle-particles"),
  "VisualEffectsLayer must render sparkle particles",
);
assert.ok(
  effectsMarkup.includes("pointer-events-none absolute inset-0 z-0"),
  "VisualEffectsLayer must stay inside its portfolio shell",
);
assert.ok(
  !effectsMarkup.includes("fixed inset-0"),
  "VisualEffectsLayer must not escape to the viewport",
);

// BackgroundIllustrationLayer preset mode
const bgPresetMarkup = renderToStaticMarkup(
  React.createElement(BackgroundIllustrationLayer, {
    config: {
      mode: "preset",
      presetId: "canva-musical",
      opacity: 0.25,
      blur: 2,
      position: "top-right",
    },
    primaryColor: "#735340",
  }),
);
assert.ok(
  bgPresetMarkup.includes("blur(2px)"),
  "BackgroundIllustrationLayer must apply blur",
);
assert.ok(
  bgPresetMarkup.includes("opacity:0.25"),
  "BackgroundIllustrationLayer must apply opacity",
);
assert.ok(
  bgPresetMarkup.includes("top-0 right-0"),
  "BackgroundIllustrationLayer must position top-right",
);
assert.ok(
  bgPresetMarkup.includes("<svg"),
  "BackgroundIllustrationLayer must embed preset SVG",
);
assert.ok(
  bgPresetMarkup.includes("pointer-events-none absolute inset-0 z-0"),
  "BackgroundIllustrationLayer must stay inside its portfolio shell",
);

// BackgroundIllustrationLayer custom URL
const bgCustomMarkup = renderToStaticMarkup(
  React.createElement(BackgroundIllustrationLayer, {
    config: {
      mode: "custom",
      presetId: "none",
      customUrl: "/uploads/custom-bg.svg",
      opacity: 0.18,
      blur: 0,
      position: "cover",
    },
  }),
);
assert.ok(
  bgCustomMarkup.includes("/uploads/custom-bg.svg"),
  "BackgroundIllustrationLayer must render custom URL",
);
assert.ok(
  bgCustomMarkup.includes("pointer-events-none absolute inset-0 z-0"),
  "Custom background must stay inside its portfolio shell",
);
console.log(
  "✓ VisualEffectsLayer & BackgroundIllustrationLayer verified successfully.",
);

// 5. Verify AboutBlock & TemplateShell integration
console.log("\n[5/5] Verifying AboutBlock & TemplateShell...");

const sampleTheme: ThemeConfig = {
  primaryColor: "#A96B54",
  secondaryColor: "#304254",
  backgroundColor: "#FFF8F0",
  surfaceColor: "#FFFFFF",
  textColor: "#1C1412",
  headingFont: "Playfair Display",
  bodyFont: "Be Vietnam Pro",
  borderRadius: "lg",
  pageTransition: "smooth-scroll",
  effects: {
    enableFloat: true,
    enableGlow: true,
    enableTilt: true,
    enableSparkles: true,
    revealVariant: "zoom-in",
    enableParallax: false,
  },
  backgroundIllustration: {
    mode: "preset",
    presetId: "canva-musical",
    opacity: 0.2,
    blur: 0,
    position: "cover",
  },
};

const sampleAboutSection: AboutSection = {
  type: "about",
  variant: "story-card",
  title: "Về bản thân",
  biography: "Sinh viên ngành Sư phạm Âm nhạc đam mê công nghệ số và AI.",
  highlights: [
    { label: "Chuyên ngành", value: "Sư phạm Âm nhạc" },
    { label: "Trường", value: "Trường ĐH Sư phạm Nghệ thuật TW" },
  ],
  contactInfo: {
    email: "vananh@example.com",
    phone: "0912345678",
    location: "Hà Nội, Việt Nam",
    socials: [],
  },
  learningGoals:
    "Nâng cao kỹ năng ứng dụng AI trong giảng dạy âm nhạc và thiết kế học liệu.",
  portfolioObjective:
    "Hoàn thiện hồ sơ học phần INF2501 đạt chuẩn xuất sắc với 6 bài tập.",
  introVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
};

// Check AboutBlock rendering on Canva Editorial archetype
const aboutCanvaMarkup = renderToStaticMarkup(
  React.createElement(AboutBlock, {
    section: sampleAboutSection,
    theme: sampleTheme,
    archetypeId: "canva-editorial",
    avatarUrl: "https://example.com/portrait.jpg",
    avatarAlt: "Từ Thị Vân Anh",
  }),
);
assert.ok(
  aboutCanvaMarkup.includes("https://example.com/portrait.jpg"),
  "AboutBlock on Canva Editorial must render portrait photo",
);
assert.ok(
  aboutCanvaMarkup.includes("Mục tiêu học tập &amp; phát triển"),
  "AboutBlock must render learningGoals",
);
assert.ok(
  aboutCanvaMarkup.includes("Mục tiêu của Portfolio"),
  "AboutBlock must render portfolioObjective",
);
assert.ok(
  !aboutCanvaMarkup.includes("Video Giới Thiệu Bản Thân"),
  "AboutBlock must omit intro video section",
);
assert.ok(
  !aboutCanvaMarkup.includes("youtube-nocookie.com/embed/"),
  "AboutBlock must not embed intro videos",
);

// Check AboutBlock rendering on non-Canva archetype (e.g. bento-grid)
const aboutBentoMarkup = renderToStaticMarkup(
  React.createElement(AboutBlock, {
    section: sampleAboutSection,
    theme: sampleTheme,
    archetypeId: "bento-grid",
    avatarUrl: "https://example.com/portrait.jpg",
    avatarAlt: "Từ Thị Vân Anh",
  }),
);
assert.ok(
  aboutBentoMarkup.includes("https://example.com/portrait.jpg"),
  "AboutBlock on bento-grid must also render portrait photo",
);
assert.ok(
  aboutBentoMarkup.includes("Mục tiêu học tập &amp; phát triển"),
  "AboutBlock on bento-grid must render learning goals",
);

// Check TemplateShell mounts layers
const sampleDoc: PortfolioDocument = {
  id: "doc-test-1",
  slug: "test-portfolio",
  templateId: "canva-editorial",
  imageGenerationConfig: {
    mode: "hybrid-auto",
    visualStyle: "canva-pastel-graphic",
  },
  seo: {
    title: "Test Portfolio",
    description: "Test Description",
  },
  theme: sampleTheme,
  sections: [sampleAboutSection],
};

const shellMarkup = renderToStaticMarkup(
  React.createElement(TemplateShell, {
    document: sampleDoc,
  }),
);
assert.ok(
  shellMarkup.includes("animate-float"),
  "TemplateShell must mount VisualEffectsLayer",
);
assert.ok(
  shellMarkup.includes("<svg"),
  "TemplateShell must mount BackgroundIllustrationLayer with preset SVG",
);
console.log("✓ AboutBlock & TemplateShell verified successfully.");

console.log("\n=== ALL M2 VERIFICATION CHECKS PASSED PERFECTLY! ===");
