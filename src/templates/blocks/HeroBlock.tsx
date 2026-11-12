"use client";

import React from "react";
import {
  ArrowDownRight,
  Sparkles,
  Terminal,
  TrendingUp,
  RefreshCw,
  LayoutTemplate,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  HeroSection,
  TemplateId,
  ThemeConfig,
} from "@/schema/portfolio.schema";
import { AvatarFrame, DecorationLayer } from "@/components/visual-primitives";
import {
  getArchetypeProfile,
  getCardDecoration,
  getThemeTokens,
} from "@/templates/archetypes/archetypeStyles";
import { ArchetypeDivider } from "@/templates/archetypes/ArchetypeDivider";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import {
  CanvaCoverStaffBottomRight,
  CanvaCoverStaffTopLeft,
  CanvaFourPointStar,
  CanvaPortfolioDisplayTitle,
} from "./CanvaOrnaments";

export interface HeroBlockProps {
  section: HeroSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
  editable?: boolean;
  sectionIndex?: number;
}

export function HeroBlock({
  section,
  theme,
  archetypeId = "canva-editorial",
  editable = false,
  sectionIndex,
}: HeroBlockProps) {
  const profile = getArchetypeProfile(archetypeId);
  const tokens = getThemeTokens(theme);
  const swapHeroLayout = usePortfolioStore((s) => s.swapHeroLayout);
  const updateSection = usePortfolioStore((s) => s.updateSection);

  const isCanvaEditorial = archetypeId === "canva-editorial";
  const isTerminal = archetypeId === "tech-developer";
  const isMinimal =
    archetypeId === "framer-minimal" || archetypeId === "minimal-chic";
  const isBento =
    archetypeId === "bento-grid" ||
    archetypeId === "vibrant-student" ||
    section.variant === "bento" ||
    section.variant === "bento-intro";
  const isCreative =
    archetypeId === "creative-showcase" || archetypeId === "creative-bold";
  const isGrowth = archetypeId === "growth-marketer";
  const isWarmEditorial =
    archetypeId === "warm-editorial" ||
    section.variant === "editorial-asymmetric" ||
    section.variant === "editorial-magazine";
  const isOrganic = archetypeId === "artistic-organic";
  const isAcademic = archetypeId === "academic-presentation";

  const isCentered =
    section.variant === "centered" || section.variant === "minimal-center";
  const isSplitLeft = section.variant === "split-left";
  const isSplitRight =
    section.variant === "split-right" || section.variant === "split-modern";

  // Inverted layout check (Canvas swap)
  const isInverted = Boolean(
    section.layoutInverted ?? (section.mediaPosition === "left" || isSplitLeft),
  );

  const cardDec = getCardDecoration(archetypeId, theme);
  const buttonRadiusClass = isTerminal
    ? "rounded-lg font-mono"
    : isMinimal
      ? "rounded-lg"
      : isOrganic
        ? "rounded-[2rem]"
        : "rounded-full";

  if (isCanvaEditorial && !editable && section.variant === "canva-cover") {
    return (
      <section
        id="hero"
        className="reveal-on-scroll relative overflow-hidden pb-10 pt-2"
      >
        <div className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <CanvaCoverStaffTopLeft
            className="absolute -left-2 -top-2 h-44 w-44 opacity-95 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
            stroke="var(--text, #1C1412)"
            noteFill="var(--text, #16100E)"
          />
          <CanvaCoverStaffBottomRight
            className="absolute -bottom-2 -right-2 h-40 w-44 opacity-95 sm:h-56 sm:w-64 lg:h-64 lg:w-72"
            stroke="var(--text, #1C1412)"
            noteFill="var(--text, #16100E)"
          />

          <div className="relative z-10 pt-6 sm:pt-10">
            <CanvaPortfolioDisplayTitle
              textColor="var(--text, #1E120E)"
              strokeColor="var(--primary, #4B3128)"
              fillColor="var(--primary, #927869)"
            />

            <div className="mt-4 flex items-center justify-center gap-3">
              {section.avatar?.url && (
                <img
                  src={section.avatar.url}
                  alt={section.fullName}
                  className="h-9 w-9 rounded-full border-2 object-cover shadow-sm transition hover:scale-105"
                  style={{ borderColor: "var(--primary, #735340)" }}
                />
              )}
              <div className="text-center sm:text-left">
                <h1
                  className="font-editorial text-sm font-bold tracking-wide sm:text-base"
                  style={{ color: "var(--text, #3E2723)" }}
                >
                  {section.fullName}
                </h1>
                {section.roleTitle && (
                  <span
                    className="ml-2 hidden text-xs font-medium tracking-wider opacity-75 sm:inline"
                    style={{ color: "var(--primary, #735340)" }}
                  >
                    • {section.roleTitle}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-14 sm:gap-28">
              <CanvaFourPointStar
                className="h-6 w-6 sm:h-7 sm:w-7"
                color="var(--primary, #735340)"
              />
              <CanvaFourPointStar
                className="h-7 w-7 sm:h-8 sm:w-8"
                color="var(--primary, #735340)"
              />
              <CanvaFourPointStar
                className="h-6 w-6 sm:h-7 sm:w-7"
                color="var(--primary, #735340)"
              />
            </div>
            <div
              className="mt-6 border-b"
              style={{ borderColor: "var(--primary, #735340)", opacity: 0.55 }}
            />
          </div>
        </div>
      </section>
    );
  }

  const renderEyebrow = () => {
    const IconComponent = isTerminal
      ? Terminal
      : isGrowth
        ? TrendingUp
        : Sparkles;

    return (
      <div
        className={`inline-flex items-center gap-2 border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${
          isTerminal
            ? "rounded-md font-mono tracking-[0.12em]"
            : isMinimal
              ? "rounded-md tracking-[0.18em]"
              : isOrganic
                ? "rounded-[2rem] tracking-[0.15em]"
                : isCreative
                  ? "rotate-[-1.5deg] border-2 border-black bg-amber-300 text-black shadow-[3px_3px_0px_#000]"
                  : "rounded-full"
        }`}
        style={
          isCreative
            ? undefined
            : {
                borderColor: `${theme.primaryColor}45`,
                backgroundColor: theme.surfaceColor,
                color: theme.primaryColor,
              }
        }
      >
        <IconComponent className="h-3.5 w-3.5" />
        <span>
          {isTerminal ? `$ whoami • ${section.headline}` : section.headline}
        </span>
      </div>
    );
  };

  const renderCtaButtons = (centered = false) => (
    <div
      className={`flex flex-wrap gap-3 pt-1 ${centered ? "justify-center" : ""}`}
    >
      {section.ctaButtons.map((btn, idx) => (
        <a
          key={idx}
          href={btn.href}
          className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${buttonRadiusClass} ${
            isCreative
              ? "border-2 border-black font-black shadow-[4px_4px_0px_#000]"
              : ""
          }`}
          style={
            btn.style === "primary"
              ? { backgroundColor: theme.primaryColor, color: "#FFFFFF" }
              : btn.style === "secondary"
                ? { backgroundColor: theme.secondaryColor, color: "#FFFFFF" }
                : {
                    border: isCreative
                      ? undefined
                      : `1.5px solid ${
                          tokens.isDarkBg
                            ? theme.primaryColor
                            : theme.secondaryColor
                        }`,
                    color: tokens.isDarkBg
                      ? theme.primaryColor
                      : theme.secondaryColor,
                    backgroundColor: theme.surfaceColor,
                  }
          }
        >
          <span>{btn.label}</span>
          <ArrowDownRight className="h-4 w-4" />
        </a>
      ))}
    </div>
  );

  const renderQuickTags = (centered = false) => {
    if (section.quickTags.length === 0) return null;
    return (
      <div
        className={`flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}
      >
        {section.quickTags.map((tag, idx) => (
          <span
            key={idx}
            data-testid="hero-quick-tag"
            className={`border px-3.5 py-1 text-xs font-semibold ${
              isTerminal
                ? "rounded-md font-mono"
                : isMinimal
                  ? "rounded-md"
                  : isCreative
                    ? "rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_#000]"
                    : isOrganic
                      ? "rounded-[1.5rem]"
                      : "rounded-full shadow-sm"
            }`}
            style={
              isCreative
                ? undefined
                : {
                    backgroundColor: theme.surfaceColor,
                    borderColor: tokens.borderSubtle,
                  }
            }
          >
            {isTerminal ? "[" : isMinimal ? null : "✦ "}
            <span
              contentEditable={editable}
              suppressContentEditableWarning
              role={editable ? "textbox" : undefined}
              aria-label={editable ? `Sửa tag Hero ${idx + 1}` : undefined}
              onBlur={(event) => {
                if (!editable || sectionIndex === undefined) return;
                const nextTag = event.currentTarget.textContent?.trim() ?? "";
                if (nextTag === tag) return;
                updateSection(sectionIndex, {
                  ...section,
                  quickTags: section.quickTags.map((currentTag, tagIndex) =>
                    tagIndex === idx ? nextTag : currentTag,
                  ),
                });
              }}
              className={
                editable
                  ? "rounded-sm outline-none focus:ring-2 focus:ring-amber-400"
                  : ""
              }
            >
              {tag}
            </span>
            {editable && (
              <button
                type="button"
                aria-label={`Xóa tag Hero ${idx + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  if (sectionIndex === undefined) return;
                  updateSection(sectionIndex, {
                    ...section,
                    quickTags: section.quickTags.filter(
                      (_, tagIndex) => tagIndex !== idx,
                    ),
                  });
                }}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-rose-600"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
            {isTerminal ? "]" : null}
          </span>
        ))}
        {editable && (
          <button
            type="button"
            aria-label="Thêm tag Hero"
            onClick={(event) => {
              event.stopPropagation();
              if (sectionIndex === undefined) return;
              updateSection(sectionIndex, {
                ...section,
                quickTags: [...section.quickTags, "Tag mới"],
              });
            }}
            className="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: theme.surfaceColor,
              borderColor: tokens.borderSubtle,
            }}
          >
            <Plus className="h-3 w-3" />
            Thêm tag
          </button>
        )}
      </div>
    );
  };

  // Dedicated Renderers for Copy & Avatar
  const renderCopyBlock = () => (
    <div className="space-y-6">
      {renderEyebrow()}

      <div>
        <h1
          className={`font-editorial text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl ${
            isCreative ? "underline decoration-4 underline-offset-8" : ""
          } ${isMinimal ? "font-light tracking-wide uppercase sm:text-5xl" : ""}`}
          style={
            isCreative
              ? { textDecorationColor: `${theme.primaryColor}55` }
              : undefined
          }
        >
          {section.fullName}
        </h1>
        <p
          className={`mt-3 text-base font-semibold sm:text-xl ${
            isTerminal ? "font-mono text-sm sm:text-base" : ""
          } ${isMinimal ? "tracking-[0.15em] uppercase text-sm" : ""}`}
          style={{
            color: tokens.isDarkBg ? theme.primaryColor : theme.secondaryColor,
          }}
        >
          {isTerminal ? `> ${section.roleTitle}` : section.roleTitle}
        </p>
      </div>

      <p className="max-w-xl text-base leading-relaxed opacity-85">
        {section.shortBio}
      </p>

      {renderQuickTags(false)}
      {renderCtaButtons(false)}
    </div>
  );

  const renderAvatarBlock = () => (
    <div
      className={
        isTerminal
          ? "rounded-2xl border p-4"
          : isCreative
            ? "relative rounded-3xl border-4 border-black bg-white p-4 shadow-[8px_8px_0px_#000] before:absolute before:-top-3.5 before:left-1/2 before:-translate-x-1/2 before:w-20 before:h-6 before:bg-amber-300 before:rotate-[-3deg] before:z-20 before:shadow-sm"
            : isMinimal
              ? "rounded-2xl border border-[var(--primary)]/20 p-4"
              : isOrganic
                ? "rounded-[3rem_1.5rem_3.5rem_1.5rem] border border-[var(--primary)]/30 p-5 shadow-lg"
                : isAcademic
                  ? "rounded-xl border-2 border-stone-300 bg-white p-5 shadow-md"
                  : ""
      }
      style={
        isTerminal
          ? {
              backgroundColor: theme.surfaceColor,
              borderColor: `${theme.primaryColor}40`,
            }
          : undefined
      }
    >
      <AvatarFrame
        avatar={section.avatar}
        alt={section.fullName}
        primaryColor={theme.primaryColor}
        secondaryColor={theme.secondaryColor}
        surfaceColor={theme.surfaceColor}
        enableTilt={theme.effects?.enableTilt}
        enableGlow={theme.effects?.enableGlow}
      />
    </div>
  );

  return (
    <section
      id="hero"
      className={`relative overflow-hidden px-4 pb-12 pt-10 sm:px-6 lg:px-8 ${
        isMinimal ? "lg:pb-20 lg:pt-20" : "lg:pb-16 lg:pt-16"
      }`}
    >
      <DecorationLayer
        decorations={section.decorations}
        primaryColor={theme.primaryColor}
        secondaryColor={theme.secondaryColor}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Studio Direct Canvas Swap Handle */}
        {editable && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <LayoutTemplate className="h-4 w-4 text-amber-600" />
              <span>
                Bố cục Hero: {section.variant || "Mặc định"}{" "}
                {isInverted ? "(Đã đảo vị trí)" : ""}
              </span>
            </div>
            <button
              type="button"
              data-testid="swap-hero-layout"
              onClick={swapHeroLayout}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 font-bold text-white shadow-sm hover:bg-amber-700 transition cursor-pointer"
              title="Kéo đổi vị trí Ảnh với Chữ trên Canvas"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>⇄ Đổi vị trí Ảnh / Chữ</span>
            </button>
          </div>
        )}

        {/* Academic Presentation Slide Banner */}
        {isAcademic && (
          <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-2 text-xs text-stone-500 font-mono">
            <span>ĐHQGHN • UEd | TRƯỜNG ĐH SƯ PHẠM NGHỆ THUẬT TW</span>
            <span className="rounded bg-stone-100 px-2 py-0.5 font-bold text-stone-700">
              Slide 01 • Bìa mở đầu
            </span>
          </div>
        )}

        {/* Layout Branches */}
        {isCentered ? (
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="flex justify-center">
              <AvatarFrame
                avatar={section.avatar}
                alt={section.fullName}
                primaryColor={theme.primaryColor}
                secondaryColor={theme.secondaryColor}
                surfaceColor={theme.surfaceColor}
                enableTilt={theme.effects?.enableTilt}
                enableGlow={theme.effects?.enableGlow}
                className="max-w-[200px]"
              />
            </div>
            <div className="flex justify-center">{renderEyebrow()}</div>
            <h1 className="font-editorial text-4xl font-bold tracking-tight sm:text-6xl">
              {section.fullName}
            </h1>
            <p className="text-base font-medium opacity-80 sm:text-lg">
              {section.roleTitle}
            </p>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed opacity-80 sm:text-base">
              {section.shortBio}
            </p>
            {renderQuickTags(true)}
            {renderCtaButtons(true)}
          </div>
        ) : isBento ? (
          /* Multi-Cell Bento Grid (Bao Cham / bt link parity) */
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            {/* Cell 1: Main Intro */}
            <div
              className={`flex flex-col justify-between p-7 sm:p-10 lg:col-span-7 ${cardDec.className}`}
              style={cardDec.style}
            >
              <div className="space-y-5">
                {renderEyebrow()}
                <div>
                  <h1 className="font-editorial text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
                    {section.fullName}
                  </h1>
                  <p
                    className="mt-3 text-base font-semibold sm:text-lg"
                    style={{ color: theme.primaryColor }}
                  >
                    {section.roleTitle}
                  </p>
                </div>
                <p className="max-w-xl text-sm leading-relaxed opacity-85 sm:text-base">
                  {section.shortBio}
                </p>
              </div>
              <div
                className="mt-6 space-y-5 border-t pt-5"
                style={{ borderColor: tokens.borderSubtle }}
              >
                {renderQuickTags(false)}
                {renderCtaButtons(false)}
              </div>
            </div>

            {/* Cell 2: Avatar Tile */}
            <div
              className={`flex flex-col items-center justify-center p-6 sm:p-8 lg:col-span-5 ${cardDec.className}`}
              style={{
                ...cardDec.style,
                backgroundColor: `${theme.primaryColor}0D`,
              }}
            >
              <AvatarFrame
                avatar={section.avatar}
                alt={section.fullName}
                primaryColor={theme.primaryColor}
                secondaryColor={theme.secondaryColor}
                surfaceColor={theme.surfaceColor}
                enableTilt={theme.effects?.enableTilt}
                enableGlow={theme.effects?.enableGlow}
              />
              <span
                className="mt-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm"
                style={{
                  backgroundColor: theme.surfaceColor,
                  color: theme.secondaryColor,
                }}
              >
                {profile.badgeLabel} Portfolio
              </span>
            </div>
          </div>
        ) : isWarmEditorial ? (
          /* Asymmetric Magazine Editorial Spread (Thu Trang / thu-trang link parity) */
          <div className="rounded-3xl border border-[var(--primary)]/20 bg-white/70 p-6 sm:p-10 backdrop-blur-sm shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--primary)]/15 pb-3">
              <span className="font-editorial text-xs italic tracking-wider opacity-75">
                EDITORIAL ARCHIVE • DIGITAL PORTFOLIO 2026
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-700">
                VOL. 01 • SƯ PHẠM
              </span>
            </div>

            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div
                className={`space-y-6 ${isInverted ? "lg:col-span-7 lg:order-2" : "lg:col-span-7 lg:order-1"}`}
              >
                {renderCopyBlock()}
              </div>
              <div
                className={`${isInverted ? "lg:col-span-5 lg:order-1" : "lg:col-span-5 lg:order-2"}`}
              >
                {renderAvatarBlock()}
              </div>
            </div>
          </div>
        ) : (
          /* Standard & Invertible Split Layout (Split-Left / Split-Right / Creative-Bold / Academic) */
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div
              className={`space-y-6 ${isInverted ? "lg:col-span-7 lg:order-2" : "lg:col-span-7 lg:order-1"}`}
            >
              {renderCopyBlock()}
            </div>
            <div
              className={`${isInverted ? "lg:col-span-5 lg:order-1" : "lg:col-span-5 lg:order-2"}`}
            >
              {renderAvatarBlock()}
            </div>
          </div>
        )}

        <ArchetypeDivider archetypeId={archetypeId} theme={theme} />
      </div>
    </section>
  );
}
