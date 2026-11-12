"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Target,
  Lightbulb,
  CheckCircle2,
  FileText,
  Eye,
  Wand2,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LayoutGrid,
  GalleryHorizontalEnd,
  GripVertical,
  RefreshCw,
  LayoutTemplate,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import type {
  ProjectItem,
  ProjectsSection,
  TemplateId,
  ThemeConfig,
} from "@/schema/portfolio.schema";
import {
  ImageSourceBadge,
  MediaFrame,
  type MediaFrameVariant,
} from "@/components/visual-primitives";
import {
  formatSectionEyebrow,
  getArchetypeProfile,
  getCardDecoration,
  getRadiusClass,
  getThemeTokens,
} from "@/templates/archetypes/archetypeStyles";
import { AssignmentDetailModal } from "./AssignmentDetailModal";
import { CanvaFourPointStar, CanvaVinylSketchSvg } from "./CanvaOrnaments";

function getSafeDocxHref(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }
  return null;
}

function DocxFileLink({ url }: { url: string | undefined }) {
  const href = getSafeDocxHref(url);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Mở file DOCX đính kèm"
      onClick={(event) => event.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition hover:opacity-80"
      style={{
        borderColor: "var(--primary, #735340)",
        color: "var(--primary, #735340)",
        backgroundColor: "var(--surface, #FFF8F0)",
      }}
    >
      <FileText className="h-3 w-3" />
      Mở file DOCX
    </a>
  );
}

export interface ProjectsShowcaseBlockProps {
  section: ProjectsSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
  editable?: boolean;
  sectionIndex?: number;
  frameVariant?: MediaFrameVariant;
  generatingProjectId?: string | null;
  onRegenerateProjectImage?: (
    projectId: string,
    customPrompt?: string,
  ) => Promise<void>;
  onSwitchProjectImageSource?: (projectId: string, mode: "docx" | "ai") => void;
  portfolioSlug?: string;
}

function stripLeadingIndex(title: string): string {
  return title.replace(/^\d{1,2}\s*[.\-:]\s*/, "").trim() || title;
}

function getProjectSlug(project: ProjectItem, index: number): string {
  if (project.slug && project.slug.trim()) return project.slug.trim();
  if (project.id && project.id.trim()) return project.id.trim();
  return `proj-${index + 1}`;
}

type ProjectMediaPosition = "left" | "right" | "top" | "bottom";

function getProjectMediaPosition(
  project: ProjectItem,
  fallback: ProjectMediaPosition = "left",
): ProjectMediaPosition {
  if (project.mediaPosition) return project.mediaPosition;
  if (project.layoutInverted) return "right";
  return fallback;
}

function getProjectMediaOrder(position: ProjectMediaPosition) {
  const mediaFirst = position === "left" || position === "top";
  return {
    media: mediaFirst ? "order-1" : "order-2",
    details: mediaFirst ? "order-2" : "order-1",
    vertical: position === "top" || position === "bottom",
  };
}

function SortableProjectCardWrapper({
  id,
  children,
  editable,
  className = "",
  style,
  mediaPosition,
}: {
  id: string;
  children: React.ReactNode;
  editable: boolean;
  className?: string;
  style?: React.CSSProperties;
  mediaPosition?: ProjectMediaPosition;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editable });

  const combinedStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <article
      ref={setNodeRef}
      style={combinedStyle}
      data-testid={`canvas-project-card-${id}`}
      data-project-media-position={mediaPosition}
      className={`relative group ${className} ${
        isDragging ? "ring-2 ring-amber-500 shadow-2xl rounded-2xl" : ""
      }`}
    >
      {editable && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
          <button
            type="button"
            {...attributes}
            {...listeners}
            data-testid={`drag-handle-project-${id}`}
            className="inline-flex items-center gap-1 rounded-md bg-stone-900/80 px-2 py-1 text-[11px] font-bold text-white shadow-md hover:bg-amber-600 transition cursor-grab active:cursor-grabbing"
            title="Kéo để đổi thứ tự bài tập trên Canvas"
          >
            <GripVertical className="h-3.5 w-3.5" />
            <span>⠿ Kéo đổi thứ tự</span>
          </button>
        </div>
      )}
      {children}
    </article>
  );
}

function SortableProjectThumbItem({
  id,
  children,
  editable,
  onClick,
  isActive,
  borderColor,
}: {
  id: string;
  children: React.ReactNode;
  editable: boolean;
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
  borderColor: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderColor: isActive ? borderColor : "transparent",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(editable ? attributes : {})}
      {...(editable ? listeners : {})}
      onClick={onClick}
      className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition cursor-pointer ${
        isActive ? "opacity-100 shadow-md" : "opacity-65 hover:opacity-100"
      } ${editable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {children}
    </div>
  );
}

export function ProjectsShowcaseBlock({
  section,
  theme,
  archetypeId = "canva-editorial",
  editable = false,
  sectionIndex,
  frameVariant,
  generatingProjectId = null,
  onRegenerateProjectImage,
  onSwitchProjectImageSource,
  portfolioSlug,
}: ProjectsShowcaseBlockProps) {
  const router = useRouter();
  const params = useParams();
  const routePortfolioSlug =
    portfolioSlug ||
    (params?.portfolioSlug as string) ||
    "tuthivananhportfolio";

  const reorderProjects = usePortfolioStore((s) => s.reorderProjects);
  const reorderProjectMedia = usePortfolioStore((s) => s.reorderProjectMedia);
  const swapProjectLayout = usePortfolioStore((s) => s.swapProjectLayout);

  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.projects.findIndex((p) => p.id === active.id);
    const newIndex = section.projects.findIndex((p) => p.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderProjects(sectionIndex ?? 0, oldIndex, newIndex);
    }
  };

  const [modalProject, setModalProject] = useState<ProjectItem | null>(null);
  const [modalProjectIndex, setModalProjectIndex] = useState(0);
  const [modalImgIdx, setModalImgIdx] = useState(0);
  const [carouselIndices, setCarouselIndices] = useState<
    Record<string, number>
  >({});
  const [collageModes, setCollageModes] = useState<Record<string, boolean>>({});

  const profile = getArchetypeProfile(archetypeId);
  const tokens = getThemeTokens(theme);
  const cardDec = getCardDecoration(archetypeId, theme);
  const mediaRadius = getRadiusClass(theme.borderRadius, archetypeId);
  const resolvedFrameVariant: MediaFrameVariant =
    frameVariant ?? profile.frameVariant;

  const isCanvaEditorial = archetypeId === "canva-editorial";
  const isStaggered = section.variant === "staggered-cards";
  const isCarousel = section.variant === "carousel";
  const isList = section.variant === "list";
  const isGrid = section.variant === "grid";
  const isBento = section.variant === "bento-projects";
  const isCanvaSlideShowcase = section.variant === "canva-slide-showcase";
  const isCaseStudyCards = section.variant === "case-study-cards";
  const isMinimal =
    archetypeId === "framer-minimal" || archetypeId === "minimal-chic";
  const isCreative =
    archetypeId === "creative-showcase" || archetypeId === "creative-bold";
  const isGrowth = archetypeId === "growth-marketer";
  const isTerminal = archetypeId === "tech-developer";
  const isOrganic = archetypeId === "artistic-organic";
  const isAcademic = archetypeId === "academic-presentation";

  const openModal = (
    project: ProjectItem,
    projectIndex: number,
    imgIndex = 0,
  ) => {
    const detailMode = section.detailViewMode || "dedicated-route";
    if (detailMode === "dedicated-route" && !editable) {
      const slug = getProjectSlug(project, projectIndex);
      router.push(`/${routePortfolioSlug}/projects/${slug}`);
      return;
    }
    setModalProject(project);
    setModalProjectIndex(projectIndex);
    setModalImgIdx(imgIndex);
  };

  const triggerRegenerate = (projectId: string) => {
    if (!onRegenerateProjectImage) return;
    setCarouselIndices((prev) => ({ ...prev, [projectId]: 0 }));
    void onRegenerateProjectImage(projectId);
  };

  const renderAdaptiveMedia = (project: ProjectItem, index: number) => {
    const media = project.media ?? [];
    const isGen = generatingProjectId === project.id;
    const masonryAspectClass =
      section.variant === "masonry-gallery"
        ? ["aspect-[5/4]", "aspect-[4/5]", "aspect-[5/4]", "aspect-[3/2]"][
            index % 4
          ]
        : undefined;

    const canvaMediaClass = isCanvaEditorial
      ? index % 2 === 0
        ? "rounded-[40px] border-[3px] !border-[var(--primary)] shadow-none"
        : "rounded-[24px] border-[3px] !border-[var(--primary)] shadow-none"
      : mediaRadius;
    const effectiveVariant: MediaFrameVariant = isCanvaEditorial
      ? "rounded-card"
      : resolvedFrameVariant;
    const effectivePrimary = theme.primaryColor || "#735340";
    const effectiveSecondary = theme.secondaryColor || "#5D4037";
    const effectiveSurface = theme.surfaceColor || "#FFF8F0";

    if (media.length === 0) {
      return (
        <div
          className={`flex aspect-[4/3] flex-col items-center justify-center gap-3 border-2 border-dashed p-6 text-center ${
            isCanvaEditorial ? "rounded-[32px]" : mediaRadius
          }`}
          style={{
            borderColor: `${effectivePrimary}45`,
            backgroundColor: isCanvaEditorial
              ? effectiveSurface
              : `${effectivePrimary}08`,
          }}
        >
          <ImagePlus
            className="h-8 w-8 opacity-60"
            style={{ color: effectivePrimary }}
          />
          <p className="text-sm font-medium opacity-75">
            Bài tập chưa có ảnh minh họa
          </p>
          {editable && onRegenerateProjectImage && (
            <button
              type="button"
              disabled={isGen}
              onClick={(e) => {
                e.stopPropagation();
                triggerRegenerate(project.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: effectivePrimary }}
            >
              {isGen ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              <span>🎨 Tạo ảnh AI mới theo chủ đề</span>
            </button>
          )}
        </div>
      );
    }

    // 1 Image: Clean single showcase frame (no distortion)
    if (media.length === 1) {
      return (
        <MediaFrame
          media={media[0]}
          variant={effectiveVariant}
          aspectClass={masonryAspectClass}
          radiusClass={canvaMediaClass}
          primaryColor={effectivePrimary}
          secondaryColor={effectiveSecondary}
          surfaceColor={effectiveSurface}
          editable={editable}
          isGenerating={isGen}
          onClick={() => openModal(project, index, 0)}
          onRegenerateAiImage={
            onRegenerateProjectImage
              ? () => triggerRegenerate(project.id)
              : undefined
          }
          onSwitchToDocx={
            onSwitchProjectImageSource
              ? () => onSwitchProjectImageSource(project.id, "docx")
              : undefined
          }
        />
      );
    }

    // 2 - 4+ Images: Interactive Carousel + Adaptive Thumbnail Strip OR 2-4+ Collage Grid
    const rawIdx = carouselIndices[project.id] ?? 0;
    const activeIdx = rawIdx >= 0 && rawIdx < media.length ? rawIdx : 0;
    const currentMedia = media[activeIdx] ?? media[0];
    const isCollage = collageModes[project.id] ?? false;

    const thumbGridCols =
      media.length === 2
        ? "grid-cols-2"
        : media.length === 3
          ? "grid-cols-3"
          : "grid-cols-4";

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
          <span
            className={`rounded-full border px-2.5 py-0.5 ${
              isTerminal ? "font-mono" : ""
            }`}
            style={{
              borderColor: isCanvaEditorial
                ? `${effectivePrimary}73`
                : tokens.borderSubtle,
              backgroundColor: isCanvaEditorial
                ? effectiveSurface
                : theme.backgroundColor,
            }}
          >
            {isCollage
              ? `${media.length} hình ảnh đính kèm`
              : `Ảnh ${activeIdx + 1} / ${media.length}`}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCollageModes((prev) => ({
                ...prev,
                [project.id]: !isCollage,
              }));
            }}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 transition hover:opacity-85"
            style={{
              borderColor: `${effectivePrimary}55`,
              color: effectivePrimary,
              backgroundColor: `${effectivePrimary}12`,
            }}
          >
            {isCollage ? (
              <>
                <GalleryHorizontalEnd className="h-3 w-3" />
                <span>Slide</span>
              </>
            ) : (
              <>
                <LayoutGrid className="h-3 w-3" />
                <span>Lưới ảnh</span>
              </>
            )}
          </button>
        </div>

        {isCollage ? (
          <div className="grid grid-cols-2 gap-2.5">
            {media.slice(0, 4).map((m, idx) => {
              const isHeroThree = media.length === 3 && idx === 0;
              const extraCount = media.length - 4;
              const showOverflow = idx === 3 && extraCount > 0;

              return (
                <div
                  key={m.id}
                  onClick={() => openModal(project, index, idx)}
                  className={`group relative cursor-zoom-in overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md ${
                    isHeroThree ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                  } ${isCanvaEditorial ? "!border-2" : ""}`}
                  style={{
                    borderColor: isCanvaEditorial
                      ? effectivePrimary
                      : tokens.borderSubtle,
                    backgroundColor: theme.backgroundColor,
                  }}
                >
                  {idx === 0 && editable && (
                    <div className="pointer-events-none absolute left-2.5 top-2.5 z-20">
                      <ImageSourceBadge
                        sourceType={m.sourceType}
                        editable={editable}
                        isGenerating={isGen}
                        onRegenerateAiImage={
                          onRegenerateProjectImage
                            ? () => triggerRegenerate(project.id)
                            : undefined
                        }
                        onSwitchToDocx={
                          onSwitchProjectImageSource
                            ? () =>
                                onSwitchProjectImageSource(project.id, "docx")
                            : undefined
                        }
                      />
                    </div>
                  )}

                  {idx === 0 && isGen && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-stone-900/60 text-white backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-amber-300" />
                    </div>
                  )}

                  <img
                    src={m.url}
                    alt={m.caption || `${project.title} - ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  {showOverflow && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white backdrop-blur-[1px]">
                      +{extraCount} ảnh
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="relative">
              <MediaFrame
                media={currentMedia}
                variant={effectiveVariant}
                aspectClass={masonryAspectClass}
                radiusClass={canvaMediaClass}
                primaryColor={effectivePrimary}
                secondaryColor={effectiveSecondary}
                surfaceColor={effectiveSurface}
                editable={editable}
                isGenerating={isGen}
                onClick={() => openModal(project, activeIdx)}
                onRegenerateAiImage={
                  onRegenerateProjectImage
                    ? () => triggerRegenerate(project.id)
                    : undefined
                }
                onSwitchToDocx={
                  onSwitchProjectImageSource
                    ? () => onSwitchProjectImageSource(project.id, "docx")
                    : undefined
                }
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCarouselIndices((prev) => ({
                    ...prev,
                    [project.id]: (activeIdx - 1 + media.length) % media.length,
                  }));
                }}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-stone-900 shadow-md transition hover:bg-white"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCarouselIndices((prev) => ({
                    ...prev,
                    [project.id]: (activeIdx + 1) % media.length,
                  }));
                }}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-stone-900 shadow-md transition hover:bg-white"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className={`grid gap-2 ${thumbGridCols}`}>
              {editable ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;
                    const oldIdx = media.findIndex((m) => m.id === active.id);
                    const newIdx = media.findIndex((m) => m.id === over.id);
                    if (oldIdx !== -1 && newIdx !== -1) {
                      reorderProjectMedia(project.id, oldIdx, newIdx);
                    }
                  }}
                >
                  <SortableContext
                    items={media.slice(0, 4).map((m) => m.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {media.slice(0, 4).map((m, idx) => {
                      const extraCount = media.length - 4;
                      const showOverflow = idx === 3 && extraCount > 0;
                      return (
                        <SortableProjectThumbItem
                          key={m.id}
                          id={m.id}
                          editable={editable}
                          isActive={idx === activeIdx}
                          borderColor={effectivePrimary}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (showOverflow) {
                              openModal(project, index, idx);
                            } else {
                              setCarouselIndices((prev) => ({
                                ...prev,
                                [project.id]: idx,
                              }));
                            }
                          }}
                        >
                          <img
                            src={m.url}
                            alt={m.caption || `Media ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 rounded bg-amber-500 px-1 py-0.2 text-[8px] font-bold text-white shadow-xs">
                              ★ Chính
                            </span>
                          )}
                          {showOverflow && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-bold text-white">
                              +{extraCount}
                            </div>
                          )}
                        </SortableProjectThumbItem>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              ) : (
                media.slice(0, 4).map((m, idx) => {
                  const extraCount = media.length - 4;
                  const showOverflow = idx === 3 && extraCount > 0;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (showOverflow) {
                          openModal(project, index, idx);
                        } else {
                          setCarouselIndices((prev) => ({
                            ...prev,
                            [project.id]: idx,
                          }));
                        }
                      }}
                      className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                        idx === activeIdx
                          ? "opacity-100 shadow-md"
                          : "opacity-65 hover:opacity-100"
                      }`}
                      style={{
                        borderColor:
                          idx === activeIdx ? effectivePrimary : "transparent",
                      }}
                    >
                      <img
                        src={m.url}
                        alt={m.caption || `Media ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {showOverflow && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-bold text-white">
                          +{extraCount}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  if (
    isCanvaEditorial &&
    section.variant === "canva-slide-showcase" &&
    !editable
  ) {
    return (
      <section
        id="projects"
        className="reveal-on-scroll mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
      >
        {/* Slide 3: Centered serif "project" flanked by 2 vinyl sketches + TOC Index Grid */}
        <div className="reveal-on-scroll pb-14">
          <div className="flex items-center justify-center gap-6 sm:gap-14">
            <CanvaVinylSketchSvg
              className="hidden h-24 w-24 shrink-0 opacity-85 sm:block md:h-28 md:w-28"
              stroke="var(--text, #3E2723)"
              strokeSecondary="var(--primary, #5D4037)"
            />
            <div className="text-center">
              <h2
                className="font-editorial text-6xl font-normal leading-none tracking-tight sm:text-8xl"
                style={{ color: "var(--text, #3E2723)" }}
              >
                project
              </h2>
              {section.subtitle && (
                <p
                  className="mx-auto mt-3 max-w-xl text-xs leading-relaxed sm:text-sm"
                  style={{ color: "var(--secondary, #5D4037)" }}
                >
                  {section.subtitle}
                </p>
              )}
            </div>
            <CanvaVinylSketchSvg
              className="hidden h-24 w-24 shrink-0 opacity-85 sm:block md:h-28 md:w-28"
              stroke="var(--text, #3E2723)"
              strokeSecondary="var(--primary, #5D4037)"
            />
          </div>

          {/* 3-Column Index Grid matching Slide 3 */}
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {section.projects.map((proj, idx) => {
              const numLabel = `${String(idx + 1).padStart(2, "0")}.`;
              const showRightStar =
                (idx + 1) % 3 !== 0 && idx < section.projects.length - 1;
              return (
                <div
                  key={proj.id}
                  className="relative flex flex-col items-center text-center"
                >
                  {showRightStar && (
                    <CanvaFourPointStar
                      className="pointer-events-none absolute -right-7 top-6 hidden h-6 w-6 lg:block"
                      color="var(--primary, #735340)"
                    />
                  )}
                  <span
                    className="font-editorial text-2xl font-normal sm:text-3xl"
                    style={{ color: "var(--text, #3E2723)" }}
                  >
                    {numLabel}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.document
                        .getElementById(`project-item-${idx}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className="mt-2.5 w-full max-w-[270px] rounded-full border px-5 py-2 text-xs font-medium leading-snug underline underline-offset-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl"
                    style={{
                      borderColor: "var(--primary, #735340)",
                      color: "var(--text, #3E2723)",
                      backgroundColor: "var(--surface, #FFF8F0)",
                    }}
                  >
                    {stripLeadingIndex(proj.title)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slides 4 - 7: Assignment Chapters directly on canvas paper */}
        <div className="space-y-16">
          {section.projects.map((project, index) => {
            const chapterNum = String(index + 1).padStart(2, "0");
            const mediaPosition = getProjectMediaPosition(project, "right");
            const mediaOrder = getProjectMediaOrder(mediaPosition);
            const hasMedia = (project.media?.length ?? 0) > 0;
            const mediaSpan = !hasMedia
              ? "lg:col-span-12"
              : mediaOrder.vertical
              ? "lg:col-span-12"
              : "lg:col-span-6";
            return (
              <article
                key={project.id}
                id={`project-item-${index}`}
                data-project-media-position={mediaPosition}
                className="reveal-on-scroll relative scroll-mt-20 border-t pt-12 transition-all duration-300 ease-out"
                style={{
                  borderColor: "var(--primary, #735340)",
                  opacity: 0.95,
                }}
              >
                {/* Chapter Header: Giant serif numeral 01-06 + Title Stack */}
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-8">
                  <span
                    className="font-editorial text-8xl sm:text-9xl leading-none font-normal tracking-tight"
                    style={{ color: "var(--text, #3E2723)" }}
                  >
                    {chapterNum}
                  </span>
                  <div className="min-w-0 flex-1 pt-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p
                        className="text-sm font-bold uppercase tracking-[0.14em] sm:text-base"
                        style={{ color: "var(--secondary, #5D4037)" }}
                      >
                        CHƯƠNG {index + 1} : {project.category}
                      </p>
                      {project.sourceDocxFileName && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px]"
                          style={{
                            borderColor: "var(--primary, #735340)",
                            color: "var(--secondary, #5D4037)",
                            backgroundColor: "var(--surface, #FFF8F0)",
                          }}
                        >
                          <FileText className="h-3 w-3" />
                          {project.sourceDocxFileName}
                        </span>
                      )}
                      <DocxFileLink url={project.docxUrl} />
                    </div>
                    <h3
                      className="mt-2 font-editorial text-2xl font-bold uppercase leading-snug tracking-tight sm:text-3xl lg:text-4xl"
                      style={{ color: "var(--text, #3E2723)" }}
                    >
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Two-Column Editorial Chapter Body */}
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                  {/* Left (col-span-6): MỤC TIÊU + bullets, QUY TRÌNH & KẾT QUẢ, metric badges, modal trigger */}
                  <div
                    className={`flex gap-4 ${mediaSpan} ${mediaOrder.details}`}
                    data-project-content="details"
                  >
                    {index % 2 === 1 && (
                      <div
                        className="hidden shrink-0 flex-col items-center gap-4 pt-2 sm:flex"
                        aria-hidden="true"
                      >
                        <CanvaFourPointStar
                          className="h-7 w-7"
                          color="var(--primary, #735340)"
                        />
                        <CanvaFourPointStar
                          className="h-7 w-7"
                          color="var(--primary, #735340)"
                        />
                        <CanvaFourPointStar
                          className="h-7 w-7"
                          color="var(--primary, #735340)"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-6">
                      {(project.assignmentBrief ||
                        project.keyTakeaways.some((item) => item.trim())) && (
                        <div className="space-y-3">
                          <h4
                            className="text-lg font-extrabold uppercase tracking-wide"
                            style={{ color: "var(--text, #3E2723)" }}
                          >
                            MỤC TIÊU
                          </h4>
                          {project.assignmentBrief && (
                            <p
                              className="text-sm leading-relaxed sm:text-[15px]"
                              style={{
                                color: "var(--text, #3E2723)",
                                opacity: 0.92,
                              }}
                            >
                              {project.assignmentBrief}
                            </p>
                          )}
                          {project.keyTakeaways.some((item) => item.trim()) && (
                            <ul className="space-y-2 pt-1">
                              {project.keyTakeaways
                                .filter((takeaway) => takeaway.trim())
                                .map((takeaway, tIdx) => (
                                  <li
                                    key={tIdx}
                                    className="flex items-start gap-2.5 text-sm leading-relaxed"
                                    style={{
                                      color: "var(--text, #3E2723)",
                                      opacity: 0.9,
                                    }}
                                  >
                                    <span
                                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                      style={{
                                        backgroundColor:
                                          "var(--primary, #735340)",
                                      }}
                                    />
                                    <span>{takeaway}</span>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4
                          className="text-lg font-extrabold uppercase tracking-wide"
                          style={{ color: "var(--text, #3E2723)" }}
                        >
                          QUY TRÌNH & KẾT QUẢ
                        </h4>
                        <p
                          className="text-sm leading-relaxed sm:text-[15px]"
                          style={{
                            color: "var(--text, #3E2723)",
                            opacity: 0.92,
                          }}
                        >
                          {project.summary}
                        </p>
                      </div>
                      {project.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {project.metrics.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="rounded-full border px-3.5 py-1 text-xs shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                              style={{
                                borderColor: "var(--primary, #735340)",
                                backgroundColor: "var(--surface, #FFF8F0)",
                                color: "var(--text, #3E2723)",
                              }}
                            >
                              <span
                                style={{ color: "var(--primary, #735340)" }}
                              >
                                {m.label}:{" "}
                              </span>
                              <span className="font-bold">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 4).map((tag, tagIdx) => (
                            <span
                              key={tagIdx}
                              className="text-xs font-semibold"
                              style={{ color: "var(--primary, #735340)" }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(project, index, 0);
                          }}
                          className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                          style={{
                            borderColor: "var(--primary, #735340)",
                            color: "var(--text, #3E2723)",
                            backgroundColor: "var(--surface, #FFF8F0)",
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>
                            {(section.detailViewMode ?? "dedicated-route") ===
                              "dedicated-route" && !editable
                              ? "Xem trang riêng bài làm ›"
                              : "Xem chi tiết bài làm"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right (col-span-6): Canva Framed Media + peeking vinyl disc accent */}
                  {hasMedia && (
                    <div
                      className={`group relative ${mediaSpan} ${mediaOrder.media}`}
                      data-project-content="media"
                    >
                      <div className="transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl">
                        {renderAdaptiveMedia(project, index)}
                      </div>
                      {index === 0 && (
                        <CanvaVinylSketchSvg
                          className="pointer-events-none -bottom-10 -right-4 hidden h-28 w-28 opacity-60 lg:absolute lg:block"
                          stroke="var(--text, #3E2723)"
                          strokeSecondary="var(--primary, #5D4037)"
                        />
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <AssignmentDetailModal
          project={modalProject}
          theme={theme}
          initialImageIndex={modalImgIdx}
          onClose={() => setModalProject(null)}
          allProjects={section.projects}
          currentIndex={modalProjectIndex}
          onNavigateProject={(proj, idx) => {
            setModalProject(proj);
            setModalProjectIndex(idx);
            setModalImgIdx(0);
          }}
          navigationLoop={section.navigationLoop ?? true}
        />
      </section>
    );
  }

  const renderProjectDetails = (project: ProjectItem, index: number) => {
    const idxStr = String(index + 1).padStart(2, "0");
    return (
      <div className="flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Terminal IDE strip for Tech Developer */}
          {isTerminal && (
            <div
              className="flex items-center justify-between border-b pb-2 font-mono text-[11px] opacity-75"
              style={{ borderColor: tokens.borderSubtle }}
            >
              <span>{`case-${idxStr}.md`}</span>
              <span>{project.category}</span>
            </div>
          )}

          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2">
            {isMinimal ? (
              <span
                className="font-mono text-xs font-bold tracking-wider"
                style={{ color: theme.primaryColor }}
              >
                {idxStr} —
              </span>
            ) : (
              <span
                className={`inline-flex h-7 items-center justify-center px-2.5 text-xs font-bold text-white ${
                  isTerminal ? "rounded-md font-mono" : "rounded-full"
                }`}
                style={{ backgroundColor: theme.secondaryColor }}
              >
                {isCreative
                  ? `Exhibit ${idxStr}`
                  : isTerminal
                    ? `[${idxStr}]`
                    : idxStr}
              </span>
            )}

            <span
              className={`px-3 py-1 text-xs font-semibold ${
                isTerminal
                  ? "rounded-md font-mono"
                  : isMinimal
                    ? "rounded-md"
                    : "rounded-full"
              }`}
              style={{
                backgroundColor: `${theme.primaryColor}18`,
                color: theme.primaryColor,
              }}
            >
              {project.category}
            </span>

            {project.sourceDocxFileName && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] opacity-75 ${
                  isTerminal ? "font-mono" : ""
                }`}
                style={{ borderColor: tokens.borderSubtle }}
              >
                <FileText className="h-3 w-3" />
                {project.sourceDocxFileName}
              </span>
            )}
            <DocxFileLink url={project.docxUrl} />
          </div>

          <h3 className="font-editorial text-2xl font-bold leading-snug sm:text-[26px]">
            {project.title}
          </h3>

          {/* Layer 1: Assignment Brief */}
          {project.assignmentBrief && (
            <div
              className={
                isMinimal
                  ? "border-l-2 py-1 pl-3.5 text-sm leading-relaxed"
                  : isBento
                    ? "rounded-2xl border p-3.5 text-sm leading-relaxed"
                    : "rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed"
              }
              style={{
                backgroundColor: isMinimal
                  ? "transparent"
                  : `${theme.primaryColor}0F`,
                borderColor: isMinimal
                  ? theme.primaryColor
                  : `${theme.primaryColor}30`,
              }}
            >
              <div
                className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  isTerminal ? "font-mono" : ""
                }`}
                style={{ color: theme.primaryColor }}
              >
                <Target className="h-3.5 w-3.5" /> Đề bài / Mục tiêu
              </div>
              <p className="opacity-90">{project.assignmentBrief}</p>
            </div>
          )}

          {/* Layer 2: Summary */}
          <div
            className={isBento ? "rounded-2xl border p-3.5" : ""}
            style={
              isBento
                ? {
                    backgroundColor: theme.backgroundColor,
                    borderColor: tokens.borderSubtle,
                  }
                : undefined
            }
          >
            <div
              className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                isTerminal ? "font-mono" : ""
              }`}
              style={{
                color: tokens.isDarkSurface
                  ? theme.primaryColor
                  : theme.secondaryColor,
              }}
            >
              <Lightbulb className="h-3.5 w-3.5" /> Giải pháp & Thực hiện
            </div>
            <p className="text-sm leading-relaxed opacity-85">
              {project.summary}
            </p>
          </div>

          {/* Layer 3: Key Takeaways & Metrics */}
          {project.keyTakeaways.some((item) => item.trim()) && (
            <div className="space-y-1.5">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  isTerminal ? "font-mono" : ""
                }`}
                style={{ color: tokens.positiveAccent }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Kết quả & Điểm nhấn
              </div>
              <ul className="space-y-1">
                {project.keyTakeaways
                  .filter((takeaway) => takeaway.trim())
                  .map((takeaway, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm opacity-90"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span>{takeaway}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {project.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className={`border px-3 py-1.5 text-xs ${
                    isGrowth
                      ? "rounded-lg border-l-2 shadow-sm"
                      : isTerminal
                        ? "rounded-md font-mono"
                        : "rounded-xl"
                  }`}
                  style={{
                    backgroundColor: theme.backgroundColor,
                    borderColor: tokens.borderSubtle,
                    borderLeftColor: isGrowth ? theme.primaryColor : undefined,
                  }}
                >
                  <span className="opacity-65">{m.label}: </span>
                  <span
                    className="font-bold"
                    style={{ color: theme.primaryColor }}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pt-2 ${
            isMinimal ? "border-t pt-3" : ""
          }`}
          style={isMinimal ? { borderColor: tokens.borderSubtle } : undefined}
        >
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className={`border px-2.5 py-0.5 text-[11px] font-medium opacity-80 ${
                  isTerminal ? "rounded-md font-mono" : "rounded-full"
                }`}
                style={{ borderColor: tokens.borderSubtle }}
              >
                {isTerminal ? `#${tag}` : tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {editable && (
              <button
                type="button"
                data-testid={`swap-project-layout-${project.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  swapProjectLayout(project.id);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-xs hover:bg-amber-100 transition cursor-pointer"
                title="Đổi vị trí Ảnh và Nội dung bài tập này"
              >
                <RefreshCw className="h-3 w-3" />
                <span>⇄ Đổi ảnh/chữ</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal(project, index, 0);
              }}
              className={`inline-flex items-center gap-1.5 border px-4 py-2 text-xs font-semibold transition hover:shadow-md ${
                isTerminal
                  ? "rounded-lg font-mono"
                  : isMinimal
                    ? "rounded-lg"
                    : "rounded-full"
              }`}
              style={{
                borderColor: tokens.isDarkSurface
                  ? theme.primaryColor
                  : theme.secondaryColor,
                color: tokens.isDarkSurface
                  ? theme.primaryColor
                  : theme.secondaryColor,
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>
                {(section.detailViewMode ?? "dedicated-route") ===
                  "dedicated-route" && !editable
                  ? "Xem trang riêng ›"
                  : "Xem chi tiết bài làm"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const isMasonry = !isBento && section.variant === "masonry-gallery";

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"
    >
      {/* Section Heading */}
      <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span
            className={`text-xs font-bold uppercase tracking-[0.2em] ${
              isTerminal ? "font-mono" : ""
            }`}
            style={{ color: theme.primaryColor }}
          >
            {formatSectionEyebrow(
              archetypeId,
              "04",
              "Case Studies & Assignments",
            )}
          </span>
          <h2 className="mt-1 font-editorial text-3xl font-bold sm:text-4xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-75">
              {section.subtitle}
            </p>
          )}
        </div>
        <div
          className={`text-xs font-semibold opacity-70 ${
            isTerminal ? "font-mono" : ""
          }`}
        >
          {section.projects.length} bài tập trưng bày
        </div>
      </div>

      {/* Layout based on archetype & section variant */}
      {(() => {
        const renderLayoutContent = () => {
          if (isStaggered) {
            /* Alternating Staggered Cards (Hong Quyen / creative-bold link parity) */
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pb-8">
                {section.projects.map((project, index) => {
                  const staggerClass =
                    index % 2 === 1 ? "md:translate-y-8" : "";
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className={`grid grid-cols-1 justify-between gap-5 p-6 rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0px_#000] ${staggerClass} relative before:absolute before:-top-3 before:right-8 before:w-16 before:h-5 before:bg-amber-300 before:rotate-[-2deg] before:z-10 ${mediaOrder.vertical ? "md:grid-cols-1" : "md:grid-cols-2"}`}
                    >
                      <div
                        className={mediaOrder.media}
                        data-project-content="media"
                      >
                        {renderAdaptiveMedia(project, index)}
                      </div>
                      <div
                        className={mediaOrder.details}
                        data-project-content="details"
                      >
                        {renderProjectDetails(project, index)}
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          if (isCarousel) {
            /* Horizontal Slider / Carousel */
            const curProject =
              section.projects[activeCarouselSlide] || section.projects[0];
            const curIndex =
              activeCarouselSlide < section.projects.length
                ? activeCarouselSlide
                : 0;
            const mediaPosition = curProject
              ? getProjectMediaPosition(curProject)
              : "left";
            const mediaOrder = getProjectMediaOrder(mediaPosition);
            return (
              <div
                className="rounded-3xl border p-6 sm:p-10 space-y-6"
                style={cardDec.style}
              >
                <div
                  className="flex items-center justify-between pb-3 border-b text-xs font-mono"
                  style={{ borderColor: tokens.borderSubtle }}
                >
                  <span className="font-bold text-stone-600">
                    BÀI TẬP {curIndex + 1} / {section.projects.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="carousel-prev-btn"
                      onClick={() =>
                        setActiveCarouselSlide(
                          (prev) =>
                            (prev - 1 + section.projects.length) %
                            section.projects.length,
                        )
                      }
                      className="rounded-full border p-2 hover:bg-stone-100 transition cursor-pointer"
                      aria-label="Bài trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      data-testid="carousel-next-btn"
                      onClick={() =>
                        setActiveCarouselSlide(
                          (prev) => (prev + 1) % section.projects.length,
                        )
                      }
                      className="rounded-full border p-2 hover:bg-stone-100 transition cursor-pointer"
                      aria-label="Bài sau"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {curProject && (
                  <SortableProjectCardWrapper
                    id={curProject.id}
                    editable={editable}
                    mediaPosition={mediaPosition}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    <div
                      className={`${mediaOrder.vertical ? "lg:col-span-12" : "lg:col-span-6"} ${mediaOrder.media}`}
                      data-project-content="media"
                    >
                      {renderAdaptiveMedia(curProject, curIndex)}
                    </div>
                    <div
                      className={`${mediaOrder.vertical ? "lg:col-span-12" : "lg:col-span-6"} ${mediaOrder.details}`}
                      data-project-content="details"
                    >
                      {renderProjectDetails(curProject, curIndex)}
                    </div>
                  </SortableProjectCardWrapper>
                )}
              </div>
            );
          }

          if (isList) {
            /* Compact Academic / Presentation List View */
            return (
              <div className="space-y-4">
                {section.projects.map((project, index) => {
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        <div className="md:col-span-1 text-center font-editorial text-2xl font-bold opacity-60">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div
                          className={`${mediaOrder.vertical ? "md:col-span-11" : "md:col-span-4"} ${mediaOrder.media}`}
                          data-project-content="media"
                        >
                          {renderAdaptiveMedia(project, index)}
                        </div>
                        <div
                          className={`${mediaOrder.vertical ? "md:col-span-11" : "md:col-span-7"} ${mediaOrder.details}`}
                          data-project-content="details"
                        >
                          {renderProjectDetails(project, index)}
                        </div>
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          if (isGrid) {
            /* Multi-column Grid (Minimal Chic / Ngoc Mai link parity) */
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.projects.map((project, index) => {
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className={`grid grid-cols-1 justify-between gap-5 p-6 rounded-2xl border ${mediaOrder.vertical ? "lg:grid-cols-1" : "lg:grid-cols-2"} ${cardDec.className} ${
                        isMinimal
                          ? "border-[1px] border-[var(--primary)]/20 shadow-none"
                          : ""
                      }`}
                      style={cardDec.style}
                    >
                      <div
                        className={mediaOrder.media}
                        data-project-content="media"
                      >
                        {renderAdaptiveMedia(project, index)}
                      </div>
                      <div
                        className={mediaOrder.details}
                        data-project-content="details"
                      >
                        {renderProjectDetails(project, index)}
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          if (isCanvaSlideShowcase) {
            return (
              <div className="space-y-10">
                {section.projects.map((project, index) => {
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  const mediaSpan = mediaOrder.vertical
                    ? "lg:col-span-12"
                    : "lg:col-span-7";
                  const detailsSpan = mediaOrder.vertical
                    ? "lg:col-span-12"
                    : "lg:col-span-5";
                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className="grid grid-cols-1 items-center gap-6 border-b pb-10 last:border-b-0 lg:grid-cols-12 lg:gap-10"
                      style={{ borderColor: tokens.borderSubtle }}
                    >
                      <div
                        className={`flex items-start gap-4 ${mediaSpan} ${mediaOrder.media}`}
                        data-project-content="media"
                      >
                        <span
                          aria-hidden="true"
                          className="hidden shrink-0 font-editorial text-4xl leading-none opacity-45 sm:block"
                          style={{ color: theme.primaryColor }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          {renderAdaptiveMedia(project, index)}
                        </div>
                      </div>
                      <div
                        className={`${detailsSpan} ${mediaOrder.details}`}
                        data-project-content="details"
                      >
                        {renderProjectDetails(project, index)}
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          if (isCaseStudyCards) {
            return (
              <div className="space-y-7">
                {section.projects.map((project, index) => {
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className="grid grid-cols-1 overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-lg md:grid-cols-12"
                      style={{
                        ...cardDec.style,
                        backgroundColor:
                          theme.surfaceColor || theme.backgroundColor,
                        borderColor: tokens.borderSubtle,
                      }}
                    >
                      <div
                        className={`p-4 ${mediaOrder.vertical ? "md:col-span-12" : "md:col-span-5"} md:p-6 ${mediaOrder.media}`}
                        data-project-content="media"
                      >
                        {renderAdaptiveMedia(project, index)}
                      </div>
                      <div
                        className={`flex min-w-0 flex-col justify-center p-5 pt-2 ${mediaOrder.vertical ? "md:col-span-12" : "md:col-span-7"} md:p-8 lg:p-10 ${mediaOrder.details}`}
                        data-project-content="details"
                      >
                        {renderProjectDetails(project, index)}
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          if (isBento) {
            /* Multi-cell Bento Grid (Bao Cham / bt link parity) */
            return (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {section.projects.map((project, index) => {
                  const isHeroSpan =
                    index === 0 &&
                    (section.projects.length === 1 ||
                      section.projects.length % 2 === 1);
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  if (isHeroSpan) {
                    return (
                      <SortableProjectCardWrapper
                        key={project.id}
                        id={project.id}
                        editable={editable}
                        mediaPosition={mediaPosition}
                        className={`grid grid-cols-1 items-center gap-7 p-6 md:col-span-2 lg:grid-cols-12 lg:p-8 ${cardDec.className}`}
                        style={cardDec.style}
                      >
                        <div
                          className={`${mediaOrder.vertical ? "lg:col-span-12" : "lg:col-span-6"} ${mediaOrder.media}`}
                          data-project-content="media"
                        >
                          {renderAdaptiveMedia(project, index)}
                        </div>
                        <div
                          className={`${mediaOrder.vertical ? "lg:col-span-12" : "lg:col-span-6"} ${mediaOrder.details}`}
                          data-project-content="details"
                        >
                          {renderProjectDetails(project, index)}
                        </div>
                      </SortableProjectCardWrapper>
                    );
                  }

                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className={`grid grid-cols-1 justify-between gap-5 p-6 ${mediaOrder.vertical ? "md:grid-cols-1" : "md:grid-cols-2"} ${cardDec.className}`}
                      style={cardDec.style}
                    >
                      <div
                        className={mediaOrder.media}
                        data-project-content="media"
                      >
                        {renderAdaptiveMedia(project, index)}
                      </div>
                      <div
                        className={mediaOrder.details}
                        data-project-content="details"
                      >
                        {renderProjectDetails(project, index)}
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          if (isMasonry) {
            return (
              <div className="grid grid-cols-1 items-start gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-12">
                {section.projects.map((project, index) => {
                  const mediaPosition = getProjectMediaPosition(project);
                  const mediaOrder = getProjectMediaOrder(mediaPosition);
                  return (
                    <SortableProjectCardWrapper
                      key={project.id}
                      id={project.id}
                      editable={editable}
                      mediaPosition={mediaPosition}
                      className={`grid grid-cols-1 justify-between gap-5 p-5 md:p-6 ${mediaOrder.vertical ? "md:grid-cols-1" : "md:grid-cols-2"} ${
                        index % 4 === 0
                          ? "lg:col-span-7 lg:row-span-2"
                          : index % 4 === 1 || index % 4 === 2
                            ? "lg:col-span-5"
                            : "lg:col-span-7"
                      } ${index % 4 === 1 ? "lg:translate-y-10" : ""} ${
                        cardDec.className
                      }`}
                      style={cardDec.style}
                    >
                      <div
                        className={mediaOrder.media}
                        data-project-content="media"
                      >
                        {renderAdaptiveMedia(project, index)}
                      </div>
                      <div
                        className={mediaOrder.details}
                        data-project-content="details"
                      >
                        {renderProjectDetails(project, index)}
                      </div>
                    </SortableProjectCardWrapper>
                  );
                })}
              </div>
            );
          }

          /* 50/50 Split Slides Fallback */
          return (
            <div className="space-y-8">
              {section.projects.map((project, index) => {
                const defaultMediaPosition = profile.alternateProjectMedia
                  ? index % 2 === 1
                    ? "right"
                    : "left"
                  : "left";
                const mediaPosition = getProjectMediaPosition(
                  project,
                  defaultMediaPosition,
                );
                const mediaOrder = getProjectMediaOrder(mediaPosition);
                return (
                  <SortableProjectCardWrapper
                    key={project.id}
                    id={project.id}
                    editable={editable}
                    mediaPosition={mediaPosition}
                    className={`grid grid-cols-1 items-center gap-7 p-6 lg:grid-cols-12 lg:p-8 ${cardDec.className}`}
                    style={cardDec.style}
                  >
                    <div
                      className={`${mediaOrder.vertical ? "lg:col-span-12" : "lg:col-span-6"} ${mediaOrder.media}`}
                      data-project-content="media"
                    >
                      {renderAdaptiveMedia(project, index)}
                    </div>
                    <div
                      className={`${mediaOrder.vertical ? "lg:col-span-12" : "lg:col-span-6"} ${mediaOrder.details}`}
                      data-project-content="details"
                    >
                      {renderProjectDetails(project, index)}
                    </div>
                  </SortableProjectCardWrapper>
                );
              })}
            </div>
          );
        };

        if (editable) {
          return (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleProjectDragEnd}
            >
              <SortableContext
                items={section.projects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {renderLayoutContent()}
              </SortableContext>
            </DndContext>
          );
        }

        return renderLayoutContent();
      })()}

      <AssignmentDetailModal
        project={modalProject}
        theme={theme}
        initialImageIndex={modalImgIdx}
        onClose={() => setModalProject(null)}
        allProjects={section.projects}
        currentIndex={modalProjectIndex}
        onNavigateProject={(proj, idx) => {
          setModalProject(proj);
          setModalProjectIndex(idx);
          setModalImgIdx(0);
        }}
        navigationLoop={section.navigationLoop ?? true}
      />
    </section>
  );
}
