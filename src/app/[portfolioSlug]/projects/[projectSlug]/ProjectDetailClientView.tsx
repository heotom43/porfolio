"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Target,
  Lightbulb,
  CheckCircle2,
  FileText,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertTriangle,
  FolderTree,
  Scale,
  Users,
  Compass,
  Tag,
  ExternalLink,
  Split,
  FileCheck,
} from "lucide-react";
import type { PortfolioDocument, ProjectItem } from "@/schema/portfolio.schema";
import { getThemeTokens } from "@/templates/archetypes/archetypeStyles";
import { getProjectSlug, findProjectBySlug } from "./projectSlugHelper";
export { getProjectSlug, findProjectBySlug };

export interface ProjectDetailClientViewProps {
  portfolioDoc: PortfolioDocument;
  portfolioSlug: string;
  project: ProjectItem;
  projectIndex: number;
  allProjects: ProjectItem[];
  navigationLoop?: boolean;
}

export function ProjectDetailClientView({
  portfolioDoc,
  portfolioSlug,
  project,
  projectIndex,
  allProjects,
  navigationLoop = true,
}: ProjectDetailClientViewProps) {
  const router = useRouter();
  const theme = portfolioDoc.theme;
  const tokens = getThemeTokens(theme);

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  const total = allProjects.length;
  const currentNum = projectIndex + 1;
  const mediaList = project.media ?? [];
  const safeMediaIdx =
    activeMediaIdx >= 0 && activeMediaIdx < mediaList.length
      ? activeMediaIdx
      : 0;
  const activeMedia = mediaList[safeMediaIdx] ?? mediaList[0];

  // Boundary calculations
  const hasPrev = navigationLoop ? total > 1 : projectIndex > 0;
  const hasNext = navigationLoop ? total > 1 : projectIndex < total - 1;

  const prevIndex = (projectIndex - 1 + total) % total;
  const nextIndex = (projectIndex + 1) % total;

  const prevProject = allProjects[prevIndex];
  const nextProject = allProjects[nextIndex];

  const prevUrl = prevProject
    ? `/${portfolioSlug}/projects/${getProjectSlug(prevProject, prevIndex)}`
    : `/${portfolioSlug}#projects`;

  const nextUrl = nextProject
    ? `/${portfolioSlug}/projects/${getProjectSlug(nextProject, nextIndex)}`
    : `/${portfolioSlug}#projects`;

  const portfolioHomeUrl = `/${portfolioSlug}#projects`;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If lightbox is zoomed, arrows navigate images and Escape closes lightbox
      if (lightboxZoomed) {
        if (e.key === "Escape") {
          setLightboxZoomed(false);
        } else if (e.key === "ArrowLeft" && mediaList.length > 1) {
          setActiveMediaIdx(
            (prev) => (prev - 1 + mediaList.length) % mediaList.length,
          );
        } else if (e.key === "ArrowRight" && mediaList.length > 1) {
          setActiveMediaIdx((prev) => (prev + 1) % mediaList.length);
        }
        return;
      }

      if (e.key === "Escape") {
        router.push(portfolioHomeUrl);
      } else if (e.key === "ArrowLeft" && hasPrev && prevProject) {
        router.push(prevUrl);
      } else if (e.key === "ArrowRight" && hasNext && nextProject) {
        router.push(nextUrl);
      }
    },
    [
      lightboxZoomed,
      mediaList.length,
      hasPrev,
      hasNext,
      prevProject,
      nextProject,
      prevUrl,
      nextUrl,
      portfolioHomeUrl,
      router,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setActiveMediaIdx(0);
    setLightboxZoomed(false);
  }, [project.id]);

  // Format Chapter badge
  const chapterText =
    project.chapterTitle || `Chương ${currentNum}: ${project.category}`;
  const exerciseText =
    project.exerciseNumber ||
    `Bài tập ${currentNum}${currentNum <= 6 ? ` (mục ${currentNum}.4)` : ""}`;
  const detailExerciseNumber =
    exerciseText.match(/(?:mục\s*)?(\d+(?:\.\d+)?)/i)?.[1] ??
    String(currentNum);

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.bodyFont,
      }}
    >
      {/* Sticky Header Bar */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: `${theme.surfaceColor}F2`,
          borderColor: tokens.borderSubtle,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href={portfolioHomeUrl}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition hover:opacity-85"
            style={{
              borderColor: tokens.borderSubtle,
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại Portfolio</span>
            <span className="sm:hidden">Portfolio</span>
          </Link>

          {/* Counter badge: e.g. "02 / 06 — BÀI TẬP 2" */}
          <div
            className="rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{
              borderColor: `${theme.primaryColor}40`,
              backgroundColor: `${theme.primaryColor}12`,
              color: theme.primaryColor,
            }}
          >
            {String(currentNum).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")} — BÀI TẬP {currentNum}
          </div>

          {/* Prev / Next controls */}
          <div className="flex items-center gap-2">
            {hasPrev && prevProject ? (
              <Link
                href={prevUrl}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                style={{
                  borderColor: tokens.borderSubtle,
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                }}
                title={`Bài trước: ${prevProject.title}`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:inline">‹ Bài trước</span>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium opacity-35"
                style={{ borderColor: tokens.borderSubtle }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:inline">‹ Bài trước</span>
              </button>
            )}

            {hasNext && nextProject ? (
              <Link
                href={nextUrl}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                style={{
                  borderColor: tokens.borderSubtle,
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                }}
                title={`Bài tiếp: ${nextProject.title}`}
              >
                <span className="hidden md:inline">Bài tiếp theo ›</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium opacity-35"
                style={{ borderColor: tokens.borderSubtle }}
              >
                <span className="hidden md:inline">Bài tiếp theo ›</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb & Chapter / Exercise Header */}
        <div className="mb-8 space-y-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs opacity-75"
          >
            <Link href={portfolioHomeUrl} className="hover:underline">
              Portfolio
            </Link>
            <span>/</span>
            <Link href={portfolioHomeUrl} className="hover:underline">
              Dự án & Bài tập
            </Link>
            <span>/</span>
            <span
              className="font-medium truncate max-w-[200px] sm:max-w-md"
              style={{ color: theme.primaryColor }}
            >
              {project.title}
            </span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Compass className="h-3.5 w-3.5" />
              {chapterText} — {exerciseText}
            </span>

            {project.sourceDocxFileName && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: tokens.borderSubtle,
                  backgroundColor: theme.surfaceColor,
                }}
              >
                <FileText className="h-3.5 w-3.5 opacity-70" />
                <span>Nguồn: {project.sourceDocxFileName}</span>
              </span>
            )}
            {project.docxUrl &&
              (/^https?:\/\//i.test(project.docxUrl) || project.docxUrl.startsWith("/")) && (
                <a
                  href={project.docxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở file DOCX gốc của bài làm"
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                  style={{
                    borderColor: tokens.borderSubtle,
                    backgroundColor: theme.surfaceColor,
                    color: theme.primaryColor,
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Mở file DOCX
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
          </div>

          <h1
            className="font-editorial text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: theme.textColor }}
          >
            {project.title}
          </h1>
        </div>

        {/* 3 Mandatory Sections per INF2501 Rubric */}
        <div className="space-y-12">
          {/* SECTION A: MỤC TIÊU BÀI TẬP */}
          <section
            aria-labelledby="section-goals-heading"
            className="rounded-3xl border p-6 shadow-sm sm:p-8"
            style={{
              backgroundColor: theme.surfaceColor,
              borderColor: tokens.borderSubtle,
            }}
          >
            <div
              className="flex items-center gap-3 border-b pb-4"
              style={{ borderColor: tokens.borderSubtle }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${theme.primaryColor}15`,
                  color: theme.primaryColor,
                }}
              >
                <Target className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                  Phần A — Tiêu chuẩn INF2501
                </span>
                <h2
                  id="section-goals-heading"
                  className="font-editorial text-xl font-bold sm:text-2xl"
                  style={{ color: theme.primaryColor }}
                >
                  Mục tiêu bài tập & Kỹ năng rèn luyện
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: `${theme.primaryColor}08`,
                    borderColor: `${theme.primaryColor}25`,
                  }}
                >
                  <h3
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    style={{ color: theme.primaryColor }}
                  >
                    <Target className="h-4 w-4" /> Yêu cầu đề bài (Assignment
                    Brief)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed sm:text-base">
                    {project.assignmentBrief || project.summary}
                  </p>
                </div>

                {project.keyTakeaways.length > 0 && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: tokens.borderSubtle,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <h3
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                      style={{ color: tokens.positiveAccent }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Kỹ năng cốt lõi & Kết
                      quả kỳ vọng
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {project.keyTakeaways.map((takeaway, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm leading-relaxed"
                        >
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Metrics sidebar */}
              <div className="space-y-4 lg:col-span-5">
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: tokens.borderSubtle,
                    backgroundColor: theme.backgroundColor,
                  }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Chỉ số & Đánh giá bài làm
                  </h3>
                  {project.metrics.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {project.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border p-3.5"
                          style={{
                            backgroundColor: theme.surfaceColor,
                            borderColor: tokens.borderSubtle,
                          }}
                        >
                          <p className="text-[11px] uppercase tracking-wider opacity-65">
                            {m.label}
                          </p>
                          <p
                            className="mt-1 text-lg font-bold"
                            style={{ color: theme.primaryColor }}
                          >
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs opacity-70 italic">
                      Hoàn thành đầy đủ các tiêu chí chấm điểm của học phần
                      INF2501.
                    </p>
                  )}
                </div>

                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                        style={{
                          borderColor: tokens.borderSubtle,
                          backgroundColor: theme.surfaceColor,
                        }}
                      >
                        <Tag className="h-3 w-3 opacity-60" />#{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION B: QUÁ TRÌNH THỰC HIỆN */}
          <section
            aria-labelledby="section-process-heading"
            className="rounded-3xl border p-6 shadow-sm sm:p-8"
            style={{
              backgroundColor: theme.surfaceColor,
              borderColor: tokens.borderSubtle,
            }}
          >
            <div
              className="flex items-center gap-3 border-b pb-4"
              style={{ borderColor: tokens.borderSubtle }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${theme.secondaryColor}15`,
                  color: theme.secondaryColor,
                }}
              >
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                  Phần B — Tiêu chuẩn INF2501
                </span>
                <h2
                  id="section-process-heading"
                  className="font-editorial text-xl font-bold sm:text-2xl"
                  style={{ color: theme.secondaryColor }}
                >
                  Quá trình thực hiện
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Chronological Process Steps */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-85">
                  1. Các bước thực hiện chi tiết
                </h3>
                {project.processSteps && project.processSteps.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {project.processSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-2xl border p-4"
                        style={{
                          borderColor: tokens.borderSubtle,
                          backgroundColor: theme.backgroundColor,
                        }}
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {idx + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="mt-3 rounded-2xl border p-4 text-sm leading-relaxed"
                    style={{
                      borderColor: tokens.borderSubtle,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <p>{project.summary}</p>
                  </div>
                )}
              </div>

              {/* Obstacles and Solutions (Khó khăn & Giải pháp) */}
              {project.obstaclesAndSolutions && (
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: tokens.borderSubtle,
                    backgroundColor: theme.backgroundColor,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className="h-4 w-4"
                      style={{ color: theme.secondaryColor }}
                    />
                    <h3
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: theme.secondaryColor }}
                    >
                      Khó khăn gặp phải & Giải pháp thực tiễn
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">
                    {project.obstaclesAndSolutions}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION C: SẢN PHẨM CUỐI CÙNG & TÍNH NĂNG TƯƠNG TÁC */}
          <section
            aria-labelledby="section-products-heading"
            className="rounded-3xl border p-6 shadow-sm sm:p-8"
            style={{
              backgroundColor: theme.surfaceColor,
              borderColor: tokens.borderSubtle,
            }}
          >
            <div
              className="flex items-center gap-3 border-b pb-4"
              style={{ borderColor: tokens.borderSubtle }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${theme.primaryColor}15`,
                  color: theme.primaryColor,
                }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                  Phần C — Tiêu chuẩn INF2501
                </span>
                <h2
                  id="section-products-heading"
                  className="font-editorial text-xl font-bold sm:text-2xl"
                  style={{ color: theme.primaryColor }}
                >
                  Sản phẩm cuối cùng & Minh chứng bài làm
                </h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Interactive Media Gallery with zero distortion */}
              <div className="space-y-4 lg:col-span-7">
                {activeMedia ? (
                  <div className="space-y-3">
                    <div
                      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border shadow-inner"
                      style={{
                        borderColor: tokens.borderSubtle,
                        backgroundColor: tokens.isDarkSurface
                          ? "rgba(0,0,0,0.40)"
                          : "rgba(28,25,23,0.04)",
                      }}
                    >
                      <img
                        src={activeMedia.url}
                        alt={activeMedia.caption || project.title}
                        onClick={() => setLightboxZoomed(true)}
                        className="h-full w-full cursor-zoom-in object-contain p-2"
                      />

                      {/* Source badge */}
                      <div className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                        {activeMedia.sourceType === "docx-extracted"
                          ? "📄 Ảnh trích xuất DOCX"
                          : activeMedia.sourceType === "ai-generated"
                            ? "✨ Ảnh minh họa AI"
                            : "🖼️ Ảnh bài nộp"}
                      </div>

                      {/* Fullscreen zoom button */}
                      <button
                        type="button"
                        onClick={() => setLightboxZoomed(true)}
                        className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white backdrop-blur-sm transition hover:bg-black/85"
                        aria-label="Phóng to ảnh toàn màn hình"
                        title="Phóng to toàn màn hình"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>

                      {/* In-frame arrows */}
                      {mediaList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaIdx(
                                (prev) =>
                                  (prev - 1 + mediaList.length) %
                                  mediaList.length,
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-800 shadow-md transition hover:bg-white"
                            aria-label="Ảnh trước"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMediaIdx(
                                (prev) => (prev + 1) % mediaList.length,
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-800 shadow-md transition hover:bg-white"
                            aria-label="Ảnh tiếp theo"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {activeMedia.caption && (
                      <p className="text-xs italic opacity-75">
                        {activeMedia.caption}
                      </p>
                    )}

                    {activeMedia.aiPromptUsed && (
                      <div
                        className="rounded-xl border p-3.5 text-xs"
                        style={{
                          borderColor: "rgba(245, 158, 11, 0.35)",
                          backgroundColor: tokens.isDarkSurface
                            ? "rgba(245, 158, 11, 0.10)"
                            : "rgba(255, 251, 235, 0.90)",
                        }}
                      >
                        <span
                          className="inline-flex items-center gap-1.5 font-semibold"
                          style={{
                            color: tokens.isDarkSurface ? "#FCD34D" : "#92400E",
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Prompt AI tạo
                          ảnh:
                        </span>
                        <p className="mt-1 opacity-90">
                          {activeMedia.aiPromptUsed}
                        </p>
                      </div>
                    )}

                    {/* Thumbnail Selector */}
                    {mediaList.length > 1 && (
                      <div className="flex gap-2.5 overflow-x-auto pb-1">
                        {mediaList.map((m, i) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setActiveMediaIdx(i)}
                            className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                              i === safeMediaIdx
                                ? "ring-2 ring-offset-2"
                                : "opacity-70 hover:opacity-100"
                            }`}
                            style={{
                              borderColor:
                                i === safeMediaIdx
                                  ? theme.primaryColor
                                  : "transparent",
                            }}
                          >
                            <img
                              src={m.url}
                              alt={m.caption || ""}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed text-sm opacity-65"
                    style={{
                      borderColor: tokens.borderMedium,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    Chưa có hình ảnh đính kèm cho bài tập này
                  </div>
                )}
              </div>

              {/* Right Column: Prompt Comparison Viewer & Specialized INF2501 Artifacts */}
              <div className="space-y-4 lg:col-span-5">
                {/* Prompt Comparison Viewer */}
                {project.promptComparison ? (
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: tokens.borderSubtle,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <div
                      className="flex items-center gap-2 border-b pb-3"
                      style={{ borderColor: tokens.borderSubtle }}
                    >
                      <Split
                        className="h-4 w-4"
                        style={{ color: theme.primaryColor }}
                      />
                      <h3
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: theme.primaryColor }}
                      >
                        So sánh Prompt ban đầu vs Prompt cải tiến
                      </h3>
                    </div>

                    <div className="mt-3 space-y-3 text-xs">
                      <div className="rounded-xl border p-3 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40">
                        <span className="font-bold text-red-700 dark:text-red-400">
                          1. Prompt ban đầu (Initial Prompt):
                        </span>
                        <p className="mt-1 font-mono text-[11px] opacity-85">
                          {project.promptComparison.initialPrompt}
                        </p>
                      </div>

                      <div className="rounded-xl border p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          2. Prompt cải tiến (Improved Prompt):
                        </span>
                        <p className="mt-1 font-mono text-[11px] opacity-85">
                          {project.promptComparison.improvedPrompt}
                        </p>
                      </div>

                      <div className="rounded-xl border p-3 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40">
                        <span className="font-bold text-blue-700 dark:text-blue-400">
                          3. Kết quả AI đạt được:
                        </span>
                        <p className="mt-1 text-[11px] opacity-85">
                          {project.promptComparison.aiOutput}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Specific Artifacts for INF2501 Chapters */}
                {project.productType === "responsible-ai-rules" && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: tokens.borderSubtle,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Scale
                        className="h-4 w-4"
                        style={{ color: theme.primaryColor }}
                      />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Bộ nguyên tắc sử dụng AI có trách nhiệm (Chương 6)
                      </h3>
                    </div>
                    <ul className="mt-3 space-y-2 text-xs opacity-90">
                      <li>• Minh bạch nguồn dữ liệu và prompt tạo sinh.</li>
                      <li>
                        • Kiểm chứng thông tin đối chiếu với nguồn học thuật tin
                        cậy.
                      </li>
                      <li>
                        • Tôn trọng bản quyền tác giả và quyền riêng tư cá nhân.
                      </li>
                    </ul>
                  </div>
                )}

                {project.productType === "folder-tree" && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: tokens.borderSubtle,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FolderTree
                        className="h-4 w-4"
                        style={{ color: theme.primaryColor }}
                      />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Cấu trúc lưu trữ dữ liệu & thư mục số (Chương 1)
                      </h3>
                    </div>
                    <pre className="mt-3 font-mono text-[11px] leading-relaxed opacity-85">
                      {`📁 INF2501_Portfolio/
├── 📁 BaiTap_Chương_1/
├── 📁 BaiTap_Chương_2/
├── 📁 BaiTap_Chương_3/
└── 📄 BaoCao_TongKet.pdf`}
                    </pre>
                  </div>
                )}

                {project.productType === "group-work" && (
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      borderColor: tokens.borderSubtle,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        className="h-4 w-4"
                        style={{ color: theme.primaryColor }}
                      />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Minh chứng hợp tác nhóm & chia sẻ số (Chương 4)
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed opacity-85">
                      Tài liệu và không gian làm việc số được đồng bộ trên nền
                      tảng đám mây, đảm bảo phân công vai trò rõ ràng và tương
                      tác hiệu quả.
                    </p>
                  </div>
                )}

                {/* External links */}
                {project.links.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                      Đường liên kết sản phẩm:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition hover:opacity-85"
                          style={{
                            borderColor: theme.primaryColor,
                            color: theme.primaryColor,
                            backgroundColor: `${theme.primaryColor}10`,
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>{link.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full raw excerpt collapsible */}
                {project.fullRawExcerpt && (
                  <details
                    className="rounded-2xl border p-4 transition"
                    style={{
                      backgroundColor: theme.backgroundColor,
                      borderColor: tokens.borderSubtle,
                    }}
                  >
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider opacity-75">
                      <span className="inline-flex items-center gap-1.5">
                        <FileCheck className="h-3.5 w-3.5" /> Nội dung trích
                        xuất bài nộp gốc (DOCX)
                      </span>
                    </summary>
                    <pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed opacity-85">
                      {project.fullRawExcerpt}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Next / Previous Transition Cards */}
        <div
          className="mt-16 border-t pt-10"
          style={{ borderColor: tokens.borderSubtle }}
        >
          <div className="mb-4 text-center">
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              Điều hướng bài tập tiếp theo
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Prev Project Card */}
            {prevProject ? (
              <Link
                href={prevUrl}
                className="group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: theme.surfaceColor,
                  borderColor: tokens.borderSubtle,
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    color: theme.primaryColor,
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                    ‹ Bài trước (Bài {prevIndex + 1})
                  </span>
                  <h4 className="truncate font-editorial text-base font-bold sm:text-lg">
                    {prevProject.title}
                  </h4>
                </div>
              </Link>
            ) : null}

            {/* Next Project Card */}
            {nextProject ? (
              <Link
                href={nextUrl}
                className="group flex items-center justify-between gap-4 rounded-2xl border p-4 text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: theme.surfaceColor,
                  borderColor: tokens.borderSubtle,
                }}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                    Bài tiếp theo (Bài {nextIndex + 1}) ›
                  </span>
                  <h4 className="truncate font-editorial text-base font-bold sm:text-lg">
                    {nextProject.title}
                  </h4>
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    color: theme.primaryColor,
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </main>

      {/* Fullscreen Lightbox Zoom Overlay */}
      {lightboxZoomed && activeMedia && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-8"
          onClick={() => setLightboxZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxZoomed(false)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/25"
            aria-label="Thu nhỏ ảnh"
          >
            <Minimize2 className="h-5 w-5" />
          </button>

          <img
            src={activeMedia.url}
            alt={activeMedia.caption || project.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[84vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />

          {mediaList.length > 1 && (
            <div
              className="mt-4 flex items-center gap-4 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIdx(
                    (prev) => (prev - 1 + mediaList.length) % mediaList.length,
                  )
                }
                className="rounded-full bg-white/15 p-2 hover:bg-white/25"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-medium opacity-85">
                {safeMediaIdx + 1} / {mediaList.length}
                {activeMedia.caption ? ` — ${activeMedia.caption}` : ""}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveMediaIdx((prev) => (prev + 1) % mediaList.length)
                }
                className="rounded-full bg-white/15 p-2 hover:bg-white/25"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
