"use client";

import React, { useState } from "react";
import {
  Palette,
  RotateCcw,
  Sparkles,
  Check,
  Wand2,
  Image as ImageIcon,
  Sliders,
  Upload,
  Layers,
  Sparkle,
  Move,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { THEME_PRESETS, VIETNAMESE_FONT_OPTIONS } from "@/schema/theme.schema";
import type {
  VisualEffectsConfig,
  BackgroundIllustrationConfig,
} from "@/schema/portfolio.schema";
import {
  CANVA_REFERENCE_THEME,
  usePortfolioStore,
} from "@/store/usePortfolioStore";

const CANVA_SWATCHES = [
  { label: "Nền kem", hex: "#FFF3E6" },
  { label: "Chữ nâu", hex: "#3E2723" },
  { label: "Nâu chính", hex: "#735340" },
  { label: "Nâu phụ", hex: "#5D4037" },
] as const;

const BACKGROUND_PRESET_GALLERY: Array<{
  id: BackgroundIllustrationConfig["presetId"];
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: "canva-musical",
    name: "Nốt nhạc Canva",
    description: "Khuôn nhạc & nốt cổ điển",
    icon: "🎵",
  },
  {
    id: "botanical-leaves",
    name: "Cành lá thực vật",
    description: "Họa tiết tự nhiên & sinh thái",
    icon: "🌿",
  },
  {
    id: "cyber-mesh",
    name: "Lưới sóng Cyber",
    description: "Công nghệ số & AI matrix",
    icon: "🌐",
  },
  {
    id: "geometric-dots",
    name: "Chấm bi hình học",
    description: "Lưới chấm bi hiện đại",
    icon: "⠶",
  },
  {
    id: "abstract-blobs",
    name: "Khối hữu cơ Blob",
    description: "Đường cong nghệ thuật Canva",
    icon: "🫧",
  },
  {
    id: "celestial-sparkles",
    name: "Ánh sao lấp lánh",
    description: "Chòm sao & tia sáng tinh tú",
    icon: "✨",
  },
  {
    id: "vintage-parchment",
    name: "Giấy da cổ điển",
    description: "Học thuật & vân cổ xưa",
    icon: "📜",
  },
  {
    id: "minimalist-contour",
    name: "Đường nét tối giản",
    description: "Đường viền trang nhã",
    icon: "〰️",
  },
  {
    id: "halftone-field",
    name: "Chấm halftone",
    description: "Chấm mờ phong cách editorial",
    icon: "⠿",
  },
  {
    id: "editorial-arcs",
    name: "Cung editorial",
    description: "Cung nét mảnh ở góc trang",
    icon: "◜",
  },
  {
    id: "soft-paper-waves",
    name: "Sóng giấy mềm",
    description: "Làn sóng nhẹ trên nền giấy",
    icon: "〰",
  },
  {
    id: "quiet-starburst",
    name: "Tia sao góc",
    description: "Điểm nhấn sao tối giản",
    icon: "✳",
  },
];

export function ThemeCustomizer() {
  const {
    document,
    updateTheme,
    applyThemePreset,
    restoreCanvaOriginal,
    updateThemeEffects,
    updateBackgroundIllustration,
  } = usePortfolioStore();

  const [activeSection, setActiveSection] = useState<
    "palette" | "effects" | "background"
  >("palette");

  const effects: VisualEffectsConfig = document.theme.effects ?? {
    enableFloat: false,
    enableGlow: false,
    enableTilt: false,
    enableSparkles: true,
    revealVariant: "fade-up",
    enableParallax: false,
  };

  const bgConfig: BackgroundIllustrationConfig = document.theme
    .backgroundIllustration ?? {
    mode: "none",
    presetId: "none",
    opacity: 0.15,
    blur: 0,
    position: "cover",
  };

  const isCanvaReferenceTheme =
    document.templateId === "canva-editorial" &&
    document.theme.backgroundColor.toLowerCase() ===
      CANVA_REFERENCE_THEME.backgroundColor.toLowerCase() &&
    document.theme.textColor.toLowerCase() ===
      CANVA_REFERENCE_THEME.textColor.toLowerCase() &&
    document.theme.primaryColor.toLowerCase() ===
      CANVA_REFERENCE_THEME.primaryColor.toLowerCase() &&
    document.theme.secondaryColor.toLowerCase() ===
      CANVA_REFERENCE_THEME.secondaryColor.toLowerCase();

  const matchedPreset = isCanvaReferenceTheme
    ? THEME_PRESETS.find((p) => p.id === "canva-editorial-pastel")
    : THEME_PRESETS.find(
        (p) =>
          p.id !== "canva-editorial-pastel" &&
          p.templateId === document.templateId &&
          p.theme.primaryColor.toLowerCase() ===
            document.theme.primaryColor.toLowerCase() &&
          p.theme.backgroundColor.toLowerCase() ===
            document.theme.backgroundColor.toLowerCase() &&
          p.theme.textColor.toLowerCase() ===
            document.theme.textColor.toLowerCase(),
      );

  const handleCustomBgUpload = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateBackgroundIllustration({
          mode: "custom",
          customUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border-t border-stone-200 pt-3 text-xs text-stone-800 space-y-3">
      {/* Tab Switcher: Palette & Fonts vs Visual Effects vs Background Illustration */}
      <div className="flex rounded-xl bg-stone-100 p-0.5 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setActiveSection("palette")}
          className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 transition ${
            activeSection === "palette"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Palette className="h-3 w-3 text-amber-600" />
          <span>Màu &amp; Font</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("effects")}
          className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 transition ${
            activeSection === "effects"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <Wand2 className="h-3 w-3 text-indigo-600" />
          <span>Hiệu ứng</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("background")}
          className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 transition ${
            activeSection === "background"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <ImageIcon className="h-3 w-3 text-emerald-600" />
          <span>Ảnh nền</span>
        </button>
      </div>

      {/* SECTION 1: Palette, Presets & Typography */}
      {activeSection === "palette" && (
        <div className="space-y-3">
          {/* Featured Canva Reference Preset Card */}
          <div className="rounded-2xl border-2 border-[#735340]/40 bg-[#FFF3E6] p-3 text-[#3E2723] shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#735340]">
                  <Sparkles className="h-3 w-3" />
                  <span>Chuẩn mẫu Canva gốc</span>
                </div>
                <p className="mt-0.5 text-xs font-bold">
                  Canva Editorial (tuthivananhportfolio)
                </p>
              </div>
              {isCanvaReferenceTheme && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#735340] px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Check className="h-2.5 w-2.5" />
                  Đang dùng
                </span>
              )}
            </div>

            {/* 4 Official Canva Palette Swatches */}
            <div className="mt-2 flex items-center gap-1.5">
              {CANVA_SWATCHES.map((swatch) => (
                <div
                  key={swatch.hex}
                  className="flex flex-1 flex-col items-center gap-0.5"
                  title={`${swatch.label}: ${swatch.hex}`}
                >
                  <span
                    className="h-4 w-full rounded-md border border-[#3E2723]/20"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="font-mono text-[9px] font-semibold text-[#5D4037]">
                    {swatch.hex}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              data-testid="restore-canva-original-btn"
              onClick={restoreCanvaOriginal}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#735340] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#5D4037]"
            >
              <RotateCcw className="h-3 w-3 shrink-0" />
              <span>Khôi phục màu Canva mẫu gốc</span>
            </button>
          </div>

          {/* 12 Presets Switcher Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600">
              Chọn Preset thẩm mỹ (12 Mẫu Canva &amp; Hiện đại)
            </label>
            <select
              aria-label="Chọn Preset thẩm mỹ"
              value={matchedPreset?.id ?? ""}
              onChange={(e) => {
                if (e.target.value) applyThemePreset(e.target.value);
              }}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs font-semibold text-stone-800"
            >
              <option value="" disabled>
                Tùy chỉnh (Chọn 1 trong 12 Presets...)
              </option>
              <optgroup label="🌟 6 Mẫu Canva tham khảo thực tế">
                {THEME_PRESETS.filter((p) =>
                  [
                    "canva-editorial-pastel",
                    "canva-warm-editorial-slate",
                    "canva-bold-creative-rose",
                    "canva-minimal-chic-marine",
                    "canva-vibrant-student-indigo",
                    "canva-artistic-organic-burgundy",
                    "canva-academic-crimson",
                  ].includes(p.id),
                ).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ 5 Phong cách Thiết kế Hiện đại">
                {THEME_PRESETS.filter(
                  (p) =>
                    ![
                      "canva-editorial-pastel",
                      "canva-warm-editorial-slate",
                      "canva-bold-creative-rose",
                      "canva-minimal-chic-marine",
                      "canva-vibrant-student-indigo",
                      "canva-artistic-organic-burgundy",
                      "canva-academic-crimson",
                    ].includes(p.id),
                ).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Color Tokens */}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] font-medium text-stone-700">
              Màu chính
              <input
                type="color"
                value={document.theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="mt-1 block h-7 w-full cursor-pointer rounded-lg border border-stone-200"
              />
            </label>
            <label className="text-[11px] font-medium text-stone-700">
              Màu phụ
              <input
                type="color"
                value={document.theme.secondaryColor}
                onChange={(e) =>
                  updateTheme({ secondaryColor: e.target.value })
                }
                className="mt-1 block h-7 w-full cursor-pointer rounded-lg border border-stone-200"
              />
            </label>
            <label className="text-[11px] font-medium text-stone-700">
              Màu nền
              <input
                type="color"
                value={document.theme.backgroundColor}
                onChange={(e) =>
                  updateTheme({ backgroundColor: e.target.value })
                }
                className="mt-1 block h-7 w-full cursor-pointer rounded-lg border border-stone-200"
              />
            </label>
            <label className="text-[11px] font-medium text-stone-700">
              Màu chữ
              <input
                type="color"
                value={document.theme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="mt-1 block h-7 w-full cursor-pointer rounded-lg border border-stone-200"
              />
            </label>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600">
              Font Tiêu đề (Hỗ trợ Tiếng Việt)
            </label>
            <select
              value={document.theme.headingFont}
              onChange={(e) => updateTheme({ headingFont: e.target.value })}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium"
            >
              {VIETNAMESE_FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600">
              Font Nội dung (Body)
            </label>
            <select
              value={document.theme.bodyFont}
              onChange={(e) => updateTheme({ bodyFont: e.target.value })}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium"
            >
              {VIETNAMESE_FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SECTION 2: Visual Effects Control Panel */}
      {activeSection === "effects" && (
        <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <div>
              <span className="font-bold text-indigo-900">
                Hiệu ứng Thị giác &amp; Chuyển động
              </span>
              <p className="text-[10px] text-stone-500">
                Xem hiệu ứng trực tiếp trong khung Portfolio
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>

          {/* Motion Toggles */}
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200 cursor-pointer hover:bg-stone-50">
              <div>
                <span className="font-semibold text-stone-800">
                  Lơ lửng bồng bềnh (Float)
                </span>
                <p className="text-[10px] text-stone-400">
                  Mảng sáng nền chuyển động nhẹ trong Portfolio
                </p>
              </div>
              <input
                type="checkbox"
                checked={effects.enableFloat}
                onChange={(e) =>
                  updateThemeEffects({ enableFloat: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200 cursor-pointer hover:bg-stone-50">
              <div>
                <span className="font-semibold text-stone-800">
                  Hào quang phát sáng (Glow)
                </span>
                <p className="text-[10px] text-stone-400">
                  Viền sáng hiện rõ quanh các thẻ nội dung
                </p>
              </div>
              <input
                type="checkbox"
                checked={effects.enableGlow}
                onChange={(e) =>
                  updateThemeEffects({ enableGlow: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200 cursor-pointer hover:bg-stone-50">
              <div>
                <span className="font-semibold text-stone-800">
                  Nghiêng 3D tương tác chuột (3D Tilt)
                </span>
                <p className="text-[10px] text-stone-400">
                  Góc nghiêng perspective khi di chuột qua thẻ
                </p>
              </div>
              <input
                type="checkbox"
                checked={effects.enableTilt}
                onChange={(e) =>
                  updateThemeEffects({ enableTilt: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200 cursor-pointer hover:bg-stone-50">
              <div>
                <span className="font-semibold text-stone-800">
                  Lấp lánh tinh tú (Sparkles)
                </span>
                <p className="text-[10px] text-stone-400">
                  Hạt bụi sáng &amp; ngôi sao 4 cánh chuẩn Canva
                </p>
              </div>
              <input
                type="checkbox"
                checked={effects.enableSparkles}
                onChange={(e) =>
                  updateThemeEffects({ enableSparkles: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200 cursor-pointer hover:bg-stone-50">
              <div>
                <span className="font-semibold text-stone-800">
                  Thị sai chiều sâu (Parallax)
                </span>
                <p className="text-[10px] text-stone-400">
                  Họa tiết nền trôi chậm khi cuộn trang
                </p>
              </div>
              <input
                type="checkbox"
                checked={effects.enableParallax}
                onChange={(e) =>
                  updateThemeEffects({ enableParallax: e.target.checked })
                }
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Reveal Variant Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700">
              Hiệu ứng xuất hiện khi cuộn (Reveal Variant)
            </label>
            <select
              aria-label="Hiệu ứng xuất hiện khi cuộn"
              value={effects.revealVariant}
              onChange={(e) =>
                updateThemeEffects({
                  revealVariant: e.target
                    .value as VisualEffectsConfig["revealVariant"],
                })
              }
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold"
            >
              <option value="fade-up">Fade Up (Mờ dần từ dưới lên)</option>
              <option value="zoom-in">Zoom In (Phóng to nhẹ nhàng)</option>
              <option value="slide-left">
                Slide Left (Trượt từ trái sang)
              </option>
              <option value="slide-right">
                Slide Right (Trượt từ phải sang)
              </option>
              <option value="none">None (Không hiệu ứng chuyển động)</option>
            </select>
          </div>
        </div>
      )}

      {/* SECTION 3: Background Illustration Picker */}
      {activeSection === "background" && (
        <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <div>
              <span className="font-bold text-emerald-950">
                Ảnh Phụ họa Nền (Background Asset Engine)
              </span>
              <p className="text-[10px] text-stone-500">
                Kho 12 họa tiết &amp; tải lên tùy ý
              </p>
            </div>
            <ImageIcon className="h-4 w-4 text-emerald-600" />
          </div>

          {/* Background Mode Toggles */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-white p-1 border border-stone-200">
            {(
              [
                { id: "none", label: "Tắt nền" },
                { id: "preset", label: "Kho có sẵn" },
                { id: "custom", label: "Tải lên" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateBackgroundIllustration({ mode: m.id })}
                className={`rounded-lg py-1 text-center text-[11px] font-semibold transition ${
                  bgConfig.mode === m.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Preset Gallery (12 Presets) */}
          {bgConfig.mode === "preset" && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-700">
                Chọn họa tiết từ thư viện (12 Presets)
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
                {BACKGROUND_PRESET_GALLERY.map((p) => {
                  const isSelected = bgConfig.presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        updateBackgroundIllustration({
                          mode: "preset",
                          presetId: p.id,
                        })
                      }
                      className={`flex flex-col items-start rounded-xl border p-2 text-left transition ${
                        isSelected
                          ? "border-emerald-600 bg-white ring-2 ring-emerald-500/30 shadow-sm"
                          : "border-stone-200 bg-white/80 hover:bg-white hover:border-stone-300"
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="mt-1 font-bold text-stone-800 text-[11px] line-clamp-1">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-stone-500 line-clamp-1">
                        {p.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Upload / URL */}
          {bgConfig.mode === "custom" && (
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-2.5">
              <label className="block text-[11px] font-semibold text-stone-700">
                Tải ảnh nền tùy ý (Upload hoặc URL)
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-stone-800">
                  <Upload className="h-3 w-3" />
                  <span>Chọn tệp ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleCustomBgUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {bgConfig.customUrl && (
                  <span className="text-[10px] text-emerald-700 font-semibold truncate">
                    ✓ Đã gắn ảnh
                  </span>
                )}
              </div>
              <input
                type="text"
                value={
                  bgConfig.customUrl?.startsWith("data:")
                    ? ""
                    : (bgConfig.customUrl ?? "")
                }
                onChange={(e) =>
                  updateBackgroundIllustration({
                    mode: "custom",
                    customUrl: e.target.value,
                  })
                }
                placeholder={
                  bgConfig.customUrl?.startsWith("data:")
                    ? "Đang dùng ảnh upload (hoặc dán URL khác)"
                    : "Hoặc dán URL ảnh nền (https://...)"
                }
                className="w-full rounded-lg border border-stone-200 px-2 py-1 text-xs font-mono"
              />
            </div>
          )}

          {/* Opacity & Blur Sliders */}
          {bgConfig.mode !== "none" && (
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                  <span>Độ mờ đục (Opacity)</span>
                  <span className="font-mono text-emerald-700">
                    {Math.round(bgConfig.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgConfig.opacity}
                  onChange={(e) =>
                    updateBackgroundIllustration({
                      opacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                  <span>Độ mờ hậu cảnh (Blur)</span>
                  <span className="font-mono text-emerald-700">
                    {bgConfig.blur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={bgConfig.blur}
                  onChange={(e) =>
                    updateBackgroundIllustration({
                      blur: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700">
                  Vị trí hiển thị (Position)
                </label>
                <select
                  value={bgConfig.position}
                  onChange={(e) =>
                    updateBackgroundIllustration({
                      position: e.target
                        .value as BackgroundIllustrationConfig["position"],
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium"
                >
                  <option value="cover">Phủ kín toàn màn hình (Cover)</option>
                  <option value="pattern-repeat">
                    Lặp lại dạng hoa văn (Pattern Repeat)
                  </option>
                  <option value="top-right">
                    Góc trên cùng bên phải (Top Right)
                  </option>
                  <option value="bottom-left">
                    Góc dưới cùng bên trái (Bottom Left)
                  </option>
                  <option value="center">Chính giữa trọng tâm (Center)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
