"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Target,
  Lightbulb,
  CheckCircle2,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Tag,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Split,
  FolderTree,
  Scale,
  Users,
  ExternalLink,
  Compass,
  FileCheck,
} from "lucide-react";
import type { ProjectItem, ThemeConfig } from "@/schema/portfolio.schema";
import { getThemeTokens } from "@/templates/archetypes/archetypeStyles";

export interface AssignmentDetailModalProps {
  project: ProjectItem | null;
  theme: ThemeConfig;
  initialImageIndex?: number;
  onClose: () => void;
  allProjects?: ProjectItem[];
  currentIndex?: number;
  onNavigateProject?: (project: ProjectItem, index: number) => void;
  navigationLoop?: boolean;
}

export function AssignmentDetailModal({
  project,
  theme,
  initialImageIndex = 0,
  onClose,
  allProjects = [],
  currentIndex,
  onNavigateProject,
  navigationLoop = true,
}: AssignmentDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(initialImageIndex);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tokens = getThemeTokens(theme);
  const mediaList = project?.media ?? [];
  const safeIdx =
    activeImageIdx >= 0 && activeImageIdx < mediaList.length
      ? activeImageIdx
      : 0;
  const activeMedia = mediaList[safeIdx] ?? mediaList[0];

  // Resolve projects list and current index
  const effectiveProjects =
    allProjects.length > 0 ? allProjects : project ? [project] : [];
  const totalProjects = effectiveProjects.length;

  const resolvedCurrentIndex =
    typeof currentIndex === "number" && currentIndex >= 0
      ? currentIndex
      : project
        ? effectiveProjects.findIndex((p) => p.id === project.id)
        : 0;

  const safeCurrentIndex =
    resolvedCurrentIndex >= 0 && resolvedCurrentIndex < totalProjects
      ? resolvedCurrentIndex
      : 0;

  const currentNum = safeCurrentIndex + 1;

  // Boundary checks
  const hasPrev = navigationLoop ? totalProjects > 1 : safeCurrentIndex > 0;
  const hasNext = navigationLoop
    ? totalProjects > 1
    : safeCurrentIndex < totalProjects - 1;

  const prevIdx = (safeCurrentIndex - 1 + totalProjects) % totalProjects;
  const nextIdx = (safeCurrentIndex + 1) % totalProjects;

  const prevProject = effectiveProjects[prevIdx];
  const nextProject = effectiveProjects[nextIdx];

  const handleNavigatePrev = useCallback(() => {
    if (!hasPrev || !prevProject || !onNavigateProject) return;
    setActiveImageIdx(0);
    setLightboxZoomed(false);
    onNavigateProject(prevProject, prevIdx);
  }, [hasPrev, prevProject, prevIdx, onNavigateProject]);

  const handleNavigateNext = useCallback(() => {
    if (!hasNext || !nextProject || !onNavigateProject) return;
    setActiveImageIdx(0);
    setLightboxZoomed(false);
    onNavigateProject(nextProject, nextIdx);
  }, [hasNext, nextProject, nextIdx, onNavigateProject]);

  useEffect(() => {
    setActiveImageIdx(initialImageIndex);
    setLightboxZoomed(false);
  }, [initialImageIndex, project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxZoomed) {
          setLightboxZoomed(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (lightboxZoomed) {
        // When zoomed in, arrows change active media
        if (e.key === "ArrowLeft" && mediaList.length > 1) {
          setActiveImageIdx(
            (prev) => (prev - 1 + mediaList.length) % mediaList.length,
          );
        } else if (e.key === "ArrowRight" && mediaList.length > 1) {
          setActiveImageIdx((prev) => (prev + 1) % mediaList.length);
        }
      } else {
        // When modal is open (not zoomed in lightbox), arrows navigate projects!
        if (e.key === "ArrowLeft" && hasPrev && onNavigateProject) {
          handleNavigatePrev();
        } else if (e.key === "ArrowRight" && hasNext && onNavigateProject) {
          handleNavigateNext();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    project,
    lightboxZoomed,
    isFullscreen,
    mediaList.length,
    hasPrev,
    hasNext,
    onNavigateProject,
    handleNavigatePrev,
    handleNavigateNext,
    onClose,
  ]);

  if (!project) return null;

  const chapterText =
    project.chapterTitle || `Chương ${currentNum}: ${project.category}`;
  const exerciseText =
    project.exerciseNumber ||
    `Bài tập ${currentNum}${currentNum <= 6 ? ` (mục ${currentNum}.4)` : ""}`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm transition-all duration-300 ${
        isFullscreen ? "p-0" : "p-3 sm:p-6"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      {/* Edge Navigation Buttons (Left & Right) */}
      {totalProjects > 1 && onNavigateProject && !isFullscreen && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigatePrev();
            }}
            disabled={!hasPrev}
            className="fixed left-3 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white shadow-2xl backdrop-blur-md transition hover:scale-110 hover:bg-black/85 disabled:pointer-events-none disabled:opacity-20 hidden md:flex items-center justify-center"
            aria-label="Bài trước"
            title={`‹ Bài trước: ${prevProject?.title || ""}`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateNext();
            }}
            disabled={!hasNext}
            className="fixed right-3 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white shadow-2xl backdrop-blur-md transition hover:scale-110 hover:bg-black/85 disabled:pointer-events-none disabled:opacity-20 hidden md:flex items-center justify-center"
            aria-label="Bài tiếp theo"
            title={`Bài tiếp theo: ${nextProject?.title || ""} ›`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Modal Dialog Container */}
      <div
        className={`relative flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? "h-screen w-screen max-h-none max-w-none rounded-none"
            : "max-h-[92vh] w-full max-w-5xl rounded-3xl ring-1 ring-black/10"
        }`}
        style={{
          backgroundColor: theme.surfaceColor,
          color: theme.textColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
          style={{
            backgroundColor: theme.backgroundColor,
            borderColor: tokens.borderSubtle,
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span
                className="rounded-full px-3 py-0.5 text-white shadow-sm"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {chapterText}
              </span>
              <span
                className="rounded-full border px-2.5 py-0.5 font-bold"
                style={{
                  borderColor: `${theme.primaryColor}55`,
                  color: theme.primaryColor,
                  backgroundColor: `${theme.primaryColor}10`,
                }}
              >
                {exerciseText}
              </span>
              {totalProjects > 1 && (
                <span
                  className="rounded-full border px-2.5 py-0.5 opacity-80"
                  style={{
                    borderColor: tokens.borderSubtle,
                    backgroundColor: theme.surfaceColor,
                  }}
                >
                  {String(currentNum).padStart(2, "0")} /{" "}
                  {String(totalProjects).padStart(2, "0")}
                </span>
              )}
              {project.sourceDocxFileName && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 opacity-80"
                  style={{
                    borderColor: tokens.borderSubtle,
                    backgroundColor: theme.surfaceColor,
                  }}
                >
                  <FileText className="h-3 w-3" />
                  {project.sourceDocxFileName}
                </span>
              )}
            </div>

            <h3 className="mt-1.5 font-editorial text-xl font-bold leading-snug sm:text-2xl">
              {project.title}
            </h3>
          </div>

          {/* Action buttons (Prev / Next, Fullscreen, Close) */}
          <div className="flex items-center gap-2 shrink-0">
            {totalProjects > 1 && onNavigateProject && (
              <div
                className="flex items-center gap-1 mr-2 border-r pr-2"
                style={{ borderColor: tokens.borderSubtle }}
              >
                <button
                  type="button"
                  onClick={handleNavigatePrev}
                  disabled={!hasPrev}
                  className="rounded-full p-2 transition hover:opacity-75 disabled:opacity-30"
                  style={{ backgroundColor: `${theme.textColor}10` }}
                  aria-label="Bài trước"
                  title={`‹ Bài trước: ${prevProject?.title || ""}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNavigateNext}
                  disabled={!hasNext}
                  className="rounded-full p-2 transition hover:opacity-75 disabled:opacity-30"
                  style={{ backgroundColor: `${theme.textColor}10` }}
                  aria-label="Bài tiếp theo"
                  title={`Bài tiếp theo: ${nextProject?.title || ""} ›`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Fullscreen Expand toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="rounded-full p-2 transition hover:opacity-75"
              style={{ backgroundColor: `${theme.textColor}10` }}
              aria-label={
                isFullscreen ? "Thu nhỏ cửa sổ" : "Mở rộng toàn màn hình"
              }
              title={
                isFullscreen
                  ? "Thu nhỏ cửa sổ"
                  : "Mở rộng toàn màn hình (100vw/100vh)"
              }
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>

            {/* Close modal button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition hover:opacity-75"
              style={{ backgroundColor: `${theme.textColor}10` }}
              aria-label="Đóng cửa sổ chi tiết"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-12">
          {/* Left: Lightbox Media Gallery (zero distortion via object-contain) */}
          <div className="space-y-4 lg:col-span-6">
            {activeMedia ? (
              <div className="space-y-3">
                <div
                  className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border"
                  style={{
                    borderColor: tokens.borderSubtle,
                    backgroundColor: tokens.isDarkSurface
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(28,25,23,0.04)",
                  }}
                >
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.caption || project.title}
                    onClick={() => setLightboxZoomed(true)}
                    className="h-full w-full cursor-zoom-in object-contain p-1.5"
                  />

                  <div className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {activeMedia.sourceType === "docx-extracted"
                      ? "📄 Ảnh trích xuất DOCX"
                      : activeMedia.sourceType === "ai-generated"
                        ? "✨ Ảnh minh họa AI"
                        : "🖼️ Ảnh tải lên"}
                  </div>

                  <button
                    type="button"
                    onClick={() => setLightboxZoomed(true)}
                    className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/85"
                    aria-label="Phóng to ảnh"
                    title="Phóng to toàn màn hình"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

                  {mediaList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIdx(
                            (prev) =>
                              (prev - 1 + mediaList.length) % mediaList.length,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-stone-800 shadow-md hover:bg-white"
                        aria-label="Ảnh trước"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIdx(
                            (prev) => (prev + 1) % mediaList.length,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-stone-800 shadow-md hover:bg-white"
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
                    className="rounded-xl border p-3 text-xs"
                    style={{
                      borderColor: "rgba(245, 158, 11, 0.30)",
                      backgroundColor: tokens.isDarkSurface
                        ? "rgba(245, 158, 11, 0.10)"
                        : "rgba(255, 251, 235, 0.85)",
                    }}
                  >
                    <span
                      className="inline-flex items-center gap-1 font-semibold"
                      style={{
                        color: tokens.isDarkSurface ? "#FCD34D" : "#92400E",
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Prompt AI đã dùng:
                    </span>
                    <p className="mt-1 opacity-85">
                      {activeMedia.aiPromptUsed}
                    </p>
                  </div>
                )}

                {mediaList.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {mediaList.map((m, i) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveImageIdx(i)}
                        className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          i === safeIdx
                            ? "ring-2 ring-offset-1"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          borderColor:
                            i === safeIdx ? theme.primaryColor : "transparent",
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

            {/* Prompt Comparison Viewer if available */}
            {project.promptComparison && (
              <div
                className="rounded-2xl border p-4 text-xs"
                style={{
                  borderColor: tokens.borderSubtle,
                  backgroundColor: theme.backgroundColor,
                }}
              >
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-2">
                  <Split
                    className="h-4 w-4"
                    style={{ color: theme.primaryColor }}
                  />
                  <span style={{ color: theme.primaryColor }}>
                    So sánh Prompt ban đầu vs Cải tiến
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg p-2.5 bg-red-500/10 border border-red-500/20">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      Ban đầu:
                    </span>
                    <p className="mt-0.5 opacity-85 font-mono text-[11px]">
                      {project.promptComparison.initialPrompt}
                    </p>
                  </div>
                  <div className="rounded-lg p-2.5 bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Cải tiến:
                    </span>
                    <p className="mt-0.5 opacity-85 font-mono text-[11px]">
                      {project.promptComparison.improvedPrompt}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics */}
            {project.metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {project.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border p-3"
                    style={{
                      backgroundColor: theme.backgroundColor,
                      borderColor: tokens.borderSubtle,
                    }}
                  >
                    <p className="text-[11px] uppercase tracking-wider opacity-65">
                      {metric.label}
                    </p>
                    <p
                      className="mt-0.5 text-base font-bold"
                      style={{ color: theme.primaryColor }}
                    >
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Structured Summary & Full Details */}
          <div className="space-y-4 lg:col-span-6">
            {/* (a) Mục tiêu bài tập */}
            {project.assignmentBrief && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: `${theme.primaryColor}10`,
                  borderColor: `${theme.primaryColor}30`,
                }}
              >
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: theme.primaryColor }}
                >
                  <Target className="h-4 w-4" /> Đề bài / Mục tiêu bài tập
                  (INF2501)
                </div>
                <p className="mt-1.5 text-sm leading-relaxed">
                  {project.assignmentBrief}
                </p>
              </div>
            )}

            {/* (b) Quá trình thực hiện & Giải pháp */}
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: tokens.borderSubtle }}
            >
              <div
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                style={{
                  color: tokens.isDarkSurface
                    ? theme.primaryColor
                    : theme.secondaryColor,
                }}
              >
                <Lightbulb className="h-4 w-4" /> Giải pháp & Thực hiện (Quá
                trình)
              </div>
              <p className="mt-1.5 text-sm leading-relaxed opacity-90">
                {project.summary}
              </p>
            </div>

            {/* Obstacles & Solutions if available */}
            {project.obstaclesAndSolutions && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: tokens.borderSubtle,
                  backgroundColor: theme.backgroundColor,
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> Khó khăn
                  & Giải pháp
                </div>
                <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                  {project.obstaclesAndSolutions}
                </p>
              </div>
            )}

            {/* (c) Key Takeaways */}
            {project.keyTakeaways.some((item) => item.trim()) && (
              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: tokens.borderSubtle }}
              >
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: tokens.positiveAccent }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Kết quả & Kỹ năng cốt lõi
                </div>
                <ul className="mt-2 space-y-1.5">
                  {project.keyTakeaways
                    .filter((item) => item.trim())
                    .map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Links */}
            {project.links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {project.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
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
            )}

            {/* Full raw excerpt */}
            {project.fullRawExcerpt && (
              <details
                className="rounded-2xl border p-4 transition"
                style={{
                  backgroundColor: theme.backgroundColor,
                  borderColor: tokens.borderSubtle,
                }}
              >
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider opacity-70">
                  <span className="inline-flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5" /> Nội dung trích xuất
                    chi tiết từ bài làm
                  </span>
                </summary>
                <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed opacity-85">
                  {project.fullRawExcerpt}
                </pre>
              </details>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="h-3.5 w-3.5 opacity-55" />
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border px-2.5 py-0.5 text-xs font-medium opacity-80"
                    style={{ borderColor: tokens.borderSubtle }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Viewport Lightbox Zoom Overlay */}
      {lightboxZoomed && activeMedia && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-8"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxZoomed(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxZoomed(false);
            }}
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
                  setActiveImageIdx(
                    (prev) => (prev - 1 + mediaList.length) % mediaList.length,
                  )
                }
                className="rounded-full bg-white/15 p-2 hover:bg-white/25"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-medium opacity-85">
                {safeIdx + 1} / {mediaList.length}
                {activeMedia.caption ? ` — ${activeMedia.caption}` : ""}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveImageIdx((prev) => (prev + 1) % mediaList.length)
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
