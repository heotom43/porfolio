"use client";

import React, { useEffect, useRef } from "react";
import type {
  AboutSection,
  PortfolioDocument,
  PortfolioSection,
  ProjectsSection,
  EducationSection,
  TemplateId,
} from "@/schema/portfolio.schema";
import type { MediaFrameVariant } from "@/components/visual-primitives";
import {
  BackgroundIllustrationLayer,
  SectionMotif,
} from "@/components/visual-primitives/BackgroundIllustrationLayer";
import { VisualEffectsLayer } from "@/components/visual-primitives/VisualEffectsLayer";
import {
  HeroBlock,
  AboutBlock,
  SkillsBlock,
  ExperienceBlock,
  EducationBlock,
  ProjectsShowcaseBlock,
  ContactBlock,
} from "@/templates/blocks";
import {
  getArchetypeProfile,
  getBackdropStyle,
  getThemeTokens,
  type ArchetypeNavVariant,
} from "./archetypeStyles";

export interface ArchetypeTemplateProps {
  document: PortfolioDocument;
  editable?: boolean;
  activeSectionIndex?: number | null;
  onSelectSection?: (index: number) => void;
  onRegenerateProjectImage?: (
    projectId: string,
    customPrompt?: string,
  ) => Promise<void>;
  onSwitchProjectImageSource?: (projectId: string, mode: "docx" | "ai") => void;
  generatingProjectId?: string | null;
}

export interface TemplateShellProps extends ArchetypeTemplateProps {
  archetypeId?: TemplateId;
  frameVariant?: MediaFrameVariant;
  wrapperClassName?: string;
  showSlideNumbers?: boolean;
  navVariant?: ArchetypeNavVariant;
}

const SECTION_LABELS: Record<PortfolioSection["type"], string> = {
  hero: "Introduction",
  about: "About me",
  skills: "Tools & Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  contact: "Contact",
};

function getSectionLabel(section: PortfolioSection): string {
  if ("title" in section && section.title.trim()) {
    return section.title.trim();
  }
  return SECTION_LABELS[section.type];
}

function getFontStack(fontName: string): string {
  switch (fontName) {
    case "Playfair Display":
      return 'var(--font-playfair), "Playfair Display", Georgia, serif';
    case "Be Vietnam Pro":
      return 'var(--font-body), "Be Vietnam Pro", system-ui, sans-serif';
    case "Lora":
      return 'var(--font-lora), "Lora", Georgia, serif';
    case "Merriweather":
      return '"Merriweather", var(--font-lora), Georgia, serif';
    case "Plus Jakarta Sans":
      return 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif';
    case "Space Grotesk":
      return 'var(--font-space-grotesk), "Space Grotesk", var(--font-jakarta), sans-serif';
    case "Merriweather":
      return 'var(--font-merriweather), "Merriweather", Georgia, serif';
    default:
      return 'var(--font-body), "Be Vietnam Pro", system-ui, sans-serif';
  }
}

export function TemplateShell({
  document,
  editable = false,
  activeSectionIndex = null,
  onSelectSection,
  onRegenerateProjectImage,
  onSwitchProjectImageSource,
  generatingProjectId = null,
  archetypeId,
  frameVariant,
  wrapperClassName,
  showSlideNumbers,
  navVariant,
}: TemplateShellProps) {
  const { theme, sections } = document;
  const resolvedArchetypeId: TemplateId =
    archetypeId ?? document.templateId ?? "canva-editorial";
  const profile = getArchetypeProfile(resolvedArchetypeId);
  const tokens = getThemeTokens(theme);
  const isCanvaEditorial = resolvedArchetypeId === "canva-editorial";

  const resolvedFrameVariant = isCanvaEditorial
    ? profile.frameVariant
    : (frameVariant ?? profile.frameVariant);
  const resolvedNavVariant = navVariant ?? profile.navVariant;
  const resolvedSlideNumbers = isCanvaEditorial
    ? false
    : (showSlideNumbers ?? profile.showSlideNumbers);
  const resolvedWrapperClass = isCanvaEditorial
    ? ""
    : (wrapperClassName ?? profile.wrapperClassName);
  const portfolioRootRef = useRef<HTMLDivElement>(null);

  const aboutSec = sections.find((s): s is AboutSection => s.type === "about");
  const ownerEmail = aboutSec?.contactInfo.email;
  const heroSec = sections.find((s) => s.type === "hero");
  const brandName =
    heroSec?.type === "hero" ? heroSec.fullName : document.seo.title;
  const ownerRole = heroSec?.type === "hero" ? heroSec.roleTitle : undefined;
  const heroAvatarUrl =
    heroSec?.type === "hero" ? heroSec.avatar?.url : undefined;
  const heroAvatarAlt = heroSec?.type === "hero" ? heroSec.fullName : undefined;

  const eduSec = sections.find(
    (s): s is EducationSection => s.type === "education",
  );
  const eduInfo = eduSec?.items[0]
    ? { school: eduSec.items[0].school, degree: eduSec.items[0].degree }
    : undefined;

  const projSec = sections.find(
    (s): s is ProjectsSection => s.type === "projects",
  );
  const projectList = projSec ? projSec.projects : [];

  const rootStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: getFontStack(theme.bodyFont),
    ["--font-heading" as string]: getFontStack(theme.headingFont),
    ...tokens.cssVariables,
    ...getBackdropStyle(resolvedArchetypeId, theme),
  };

  useEffect(() => {
    const root = portfolioRootRef.current;
    if (!root) return;
    const elements = root.querySelectorAll(
      ".reveal-on-scroll, .reveal-zoom, .reveal-slide-left, .reveal-slide-right",
    );
    const revealClass = {
      "fade-up": "reveal-on-scroll",
      "zoom-in": "reveal-zoom",
      "slide-left": "reveal-slide-left",
      "slide-right": "reveal-slide-right",
      none: "",
    }[theme.effects?.revealVariant ?? "fade-up"];

    elements.forEach((element) => {
      element.classList.remove(
        "reveal-on-scroll",
        "reveal-zoom",
        "reveal-slide-left",
        "reveal-slide-right",
      );
      if (revealClass) element.classList.add(revealClass);
    });

    const revealElements = revealClass
      ? root.querySelectorAll(`.${revealClass}`)
      : [];

    if (revealClass && typeof IntersectionObserver === "undefined") {
      revealElements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    if (!revealClass) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -20px 0px" },
    );

    revealElements.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-revealed");
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [sections, theme.effects?.revealVariant]);

  useEffect(() => {
    const root = portfolioRootRef.current;
    if (!root || !theme.effects?.enableParallax) return;

    const mainContainer = root.closest("main");
    const scrollTarget =
      mainContainer && mainContainer.scrollHeight > mainContainer.clientHeight
        ? mainContainer
        : window;
    let frame = 0;
    const updateParallax = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollPosition =
          scrollTarget instanceof HTMLElement
            ? scrollTarget.scrollTop
            : window.scrollY;
        const offset = Math.min(scrollPosition * 0.12, 120);
        root.style.setProperty("--portfolio-parallax-offset", `${offset}px`);
      });
    };

    updateParallax();
    scrollTarget.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    return () => {
      cancelAnimationFrame(frame);
      scrollTarget.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
      root.style.removeProperty("--portfolio-parallax-offset");
    };
  }, [theme.effects?.enableParallax]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    idx: number,
    secType: PortfolioSection["type"],
  ) => {
    if (editable && onSelectSection) {
      e.preventDefault();
      onSelectSection(idx);
      window.document
        .getElementById(secType)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={portfolioRootRef}
      style={rootStyle}
      data-effect-tilt={theme.effects?.enableTilt ? "enabled" : "disabled"}
      data-effect-glow={theme.effects?.enableGlow ? "enabled" : "disabled"}
      data-effect-parallax={
        theme.effects?.enableParallax ? "enabled" : "disabled"
      }
      data-effect-float={theme.effects?.enableFloat ? "enabled" : "disabled"}
      data-effect-sparkles={
        theme.effects?.enableSparkles ? "enabled" : "disabled"
      }
      data-reveal-variant={theme.effects?.revealVariant ?? "fade-up"}
      className={`min-h-screen relative transition-colors ${resolvedWrapperClass}`}
    >
      {/* Background Illustration & Visual Effects Layers */}
      <BackgroundIllustrationLayer
        config={theme.backgroundIllustration}
        primaryColor={theme.primaryColor}
      />
      {theme.effects?.enableParallax &&
        (!theme.backgroundIllustration ||
          theme.backgroundIllustration.mode === "none" ||
          (theme.backgroundIllustration.mode === "preset" &&
            theme.backgroundIllustration.presetId === "none")) && (
          <div
            className="portfolio-parallax-layer pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute -inset-x-[10%] -top-[10%] h-[55%] opacity-40 blur-3xl"
              style={{
                background: `radial-gradient(ellipse at 30% 35%, ${theme.primaryColor}35, transparent 65%), radial-gradient(ellipse at 75% 55%, ${theme.secondaryColor}28, transparent 62%)`,
              }}
            />
          </div>
        )}
      <VisualEffectsLayer
        effects={theme.effects}
        primaryColor={theme.primaryColor}
        secondaryColor={theme.secondaryColor}
      />

      {/* Sticky Floating Navigation */}
      <nav
        className="sticky top-0 z-30 border-b backdrop-blur-md no-print"
        style={{
          display: editable ? undefined : "none",
          backgroundColor: isCanvaEditorial
            ? `${theme.backgroundColor}F2`
            : `${theme.backgroundColor}EB`,
          borderColor:
            resolvedArchetypeId === "tech-developer"
              ? `${theme.primaryColor}33`
              : isCanvaEditorial
                ? `${theme.primaryColor}24`
                : tokens.borderSubtle,
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            {resolvedNavVariant === "terminal-bar" && (
              <span className="inline-flex shrink-0 gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
            )}

            <span
              className={`truncate text-sm font-bold sm:text-base ${
                resolvedNavVariant === "terminal-bar"
                  ? "font-mono text-xs sm:text-sm"
                  : "font-editorial"
              }`}
            >
              {resolvedNavVariant === "terminal-bar"
                ? `~/portfolio/${document.slug}`
                : brandName}
            </span>

            {resolvedArchetypeId !== "framer-minimal" && !isCanvaEditorial && (
              <span
                className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${
                  resolvedNavVariant === "terminal-bar" ? "font-mono" : ""
                }`}
                style={{
                  borderColor: `${theme.primaryColor}45`,
                  backgroundColor: `${theme.primaryColor}14`,
                  color: theme.primaryColor,
                }}
              >
                {resolvedArchetypeId === "growth-marketer" && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                )}
                {profile.badgeLabel}
              </span>
            )}
          </div>

          <div
            data-testid="portfolio-section-navigation"
            className={`flex w-full flex-wrap items-center justify-center sm:w-auto sm:flex-nowrap ${
              resolvedNavVariant === "badge-bar"
                ? "gap-1 rounded-full border p-1"
                : resolvedNavVariant === "minimal-bar" || isCanvaEditorial
                  ? "gap-x-5 gap-y-2"
                  : "gap-x-1.5 gap-y-2"
            }`}
            style={
              resolvedNavVariant === "badge-bar"
                ? {
                    backgroundColor: theme.surfaceColor,
                    borderColor: tokens.borderSubtle,
                  }
                : undefined
            }
          >
            {sections.map((sec, idx) => {
              const isNavActive = activeSectionIndex === idx;

              if (isCanvaEditorial) {
                return (
                  <a
                    key={`${sec.type}-${idx}`}
                    href={`#${sec.type}`}
                    onClick={(e) => handleNavClick(e, idx, sec.type)}
                    className="relative shrink-0 py-1 text-xs font-medium tracking-wide transition hover:opacity-100"
                    style={{
                      color: theme.textColor,
                      opacity: isNavActive ? 1 : 0.72,
                    }}
                  >
                    {getSectionLabel(sec)}
                    {isNavActive && (
                      <span
                        className="absolute inset-x-0 -bottom-0.5 h-[2px]"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                    )}
                  </a>
                );
              }

              if (resolvedNavVariant === "minimal-bar") {
                return (
                  <a
                    key={`${sec.type}-${idx}`}
                    href={`#${sec.type}`}
                    onClick={(e) => handleNavClick(e, idx, sec.type)}
                    className="relative shrink-0 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:opacity-100"
                    style={{
                      opacity: isNavActive ? 1 : 0.65,
                      color: isNavActive ? theme.primaryColor : theme.textColor,
                    }}
                  >
                    {getSectionLabel(sec)}
                    {isNavActive && (
                      <span
                        className="absolute inset-x-0 -bottom-0.5 h-[2px]"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                    )}
                  </a>
                );
              }

              if (resolvedNavVariant === "terminal-bar") {
                return (
                  <a
                    key={`${sec.type}-${idx}`}
                    href={`#${sec.type}`}
                    onClick={(e) => handleNavClick(e, idx, sec.type)}
                    className="shrink-0 rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition hover:opacity-100"
                    style={
                      isNavActive
                        ? {
                            backgroundColor: `${theme.primaryColor}20`,
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor,
                          }
                        : {
                            borderColor: "transparent",
                            opacity: 0.72,
                          }
                    }
                  >
                    {`${String(idx + 1).padStart(2, "0")}.${sec.type}`}
                  </a>
                );
              }

              return (
                <a
                  key={`${sec.type}-${idx}`}
                  href={`#${sec.type}`}
                  onClick={(e) => handleNavClick(e, idx, sec.type)}
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-100"
                  style={
                    isNavActive
                      ? {
                          backgroundColor: theme.primaryColor,
                          color: "#FFFFFF",
                        }
                      : { opacity: 0.78 }
                  }
                >
                  {getSectionLabel(sec)}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sections List */}
      <main>
        {sections.map((section, idx) => {
          const isActive = editable && activeSectionIndex === idx;
          const sectionTheme = {
            ...theme,
            ...(section.accentColor
              ? { primaryColor: section.accentColor }
              : {}),
            headingFont: section.headingFont ?? theme.headingFont,
            bodyFont: section.bodyFont ?? theme.bodyFont,
          };
          const sectionStyle: React.CSSProperties = {
            fontFamily: getFontStack(sectionTheme.bodyFont),
            ["--font-heading" as string]: getFontStack(
              sectionTheme.headingFont,
            ),
          };

          const renderContent = () => {
            switch (section.type) {
              case "hero":
                return (
                  <HeroBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                    editable={editable}
                    sectionIndex={idx}
                  />
                );
              case "about":
                return (
                  <AboutBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                    avatarUrl={
                      document.profileOwner?.avatarUrl || heroAvatarUrl
                    }
                    avatarAlt={document.profileOwner?.fullName || heroAvatarAlt}
                    educationInfo={eduInfo}
                    profileOwner={document.profileOwner}
                    learningGoals={
                      section.learningGoals ||
                      document.profileOwner?.learningGoals
                    }
                    portfolioObjective={
                      section.portfolioObjective ||
                      document.profileOwner?.portfolioObjective
                    }
                    editable={editable}
                    sectionIndex={idx}
                  />
                );
              case "skills":
                return (
                  <SkillsBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                  />
                );
              case "experience":
                return (
                  <ExperienceBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                  />
                );
              case "education":
                return (
                  <EducationBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                  />
                );
              case "projects":
                return (
                  <ProjectsShowcaseBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                    editable={editable}
                    sectionIndex={idx}
                    frameVariant={resolvedFrameVariant}
                    generatingProjectId={generatingProjectId}
                    onRegenerateProjectImage={onRegenerateProjectImage}
                    onSwitchProjectImageSource={onSwitchProjectImageSource}
                  />
                );
              case "contact":
                return (
                  <ContactBlock
                    section={section}
                    theme={sectionTheme}
                    archetypeId={resolvedArchetypeId}
                    ownerEmail={ownerEmail}
                    ownerName={brandName}
                    ownerRole={ownerRole}
                    projects={projectList}
                    profileOwner={document.profileOwner}
                    editable={editable}
                    sectionIndex={idx}
                  />
                );
            }
          };

          return (
            <div
              key={`${section.type}-${idx}`}
              data-section-type={section.type}
              data-section-motif={section.motif ?? "none"}
              style={sectionStyle}
              onClick={() => {
                if (editable && onSelectSection) {
                  onSelectSection(idx);
                }
              }}
              className={`relative transition ${
                editable
                  ? "cursor-pointer hover:ring-2 hover:ring-inset hover:ring-amber-500/40"
                  : ""
              } ${
                isActive ? "ring-2 ring-inset ring-amber-600 shadow-inner" : ""
              }`}
            >
              {section.motif && section.motif !== "none" && (
                <SectionMotif
                  presetId={section.motif}
                  primaryColor={section.accentColor ?? theme.primaryColor}
                  opacity={0.12}
                  className="absolute inset-0"
                />
              )}
              {editable && (
                <div className="pointer-events-none absolute right-4 top-3 z-20 rounded-full bg-stone-900/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white opacity-80">
                  {getSectionLabel(section)}
                </div>
              )}

              {renderContent()}

              {section.tags && section.tags.length > 0 && (
                <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-6 sm:px-6 lg:px-8">
                  {section.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                      style={{
                        borderColor: `${sectionTheme.primaryColor}45`,
                        color: sectionTheme.primaryColor,
                        backgroundColor: `${sectionTheme.primaryColor}10`,
                      }}
                    >
                      #{tag.replace(/^#+/, "")}
                    </span>
                  ))}
                </div>
              )}

              {resolvedSlideNumbers && (
                <div className="mx-auto max-w-6xl px-4 pb-2 text-right text-[10px] font-semibold uppercase tracking-[0.25em] opacity-40 sm:px-6 lg:px-8">
                  {profile.slideLabelPrefix} {String(idx + 1).padStart(2, "0")}{" "}
                  / {String(sections.length).padStart(2, "0")}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
