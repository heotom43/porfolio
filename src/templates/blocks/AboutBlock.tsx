"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  GraduationCap,
  Target,
  Compass,
  GripVertical,
  RefreshCw,
  LayoutTemplate,
  CheckCircle2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  AboutSection,
  ProfileOwner,
  TemplateId,
  ThemeConfig,
} from "@/schema/portfolio.schema";
import { AvatarFrame } from "@/components/visual-primitives/AvatarFrame";
import {
  formatSectionEyebrow,
  getCardDecoration,
  getThemeTokens,
} from "@/templates/archetypes/archetypeStyles";
import { CanvaFourPointStar, CanvaVerticalMusicRibbon } from "./CanvaOrnaments";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export interface AboutBlockProps {
  section: AboutSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
  avatarUrl?: string;
  avatarAlt?: string;
  educationInfo?: { school: string; degree: string };
  profileOwner?: ProfileOwner;
  learningGoals?: string;
  portfolioObjective?: string;
  editable?: boolean;
  sectionIndex?: number;
}

// Reusable Sortable Card Wrapper for Canvas Drag-and-Drop
function SortableAboutCardItem({
  id,
  children,
  editable,
  onResize,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  editable: boolean;
  onResize: (id: string, dimension: "width" | "height", delta: number) => void;
  className?: string;
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
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`about-card-${id}`}
      className={`relative group ${className} ${
        isDragging ? "ring-2 ring-amber-500 shadow-2xl rounded-2xl" : ""
      }`}
    >
      {editable && (
        <div className="absolute -top-3 right-2 z-20 flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white/95 p-0.5 shadow-sm">
          <button
            type="button"
            {...attributes}
            {...listeners}
            data-testid={`drag-handle-about-${id}`}
            aria-label={`Kéo ô ${id} đến vị trí khác`}
            className="inline-flex cursor-grab touch-none items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold text-stone-600 hover:bg-amber-50 active:cursor-grabbing"
            title="Kéo thả đổi vị trí ô này"
          >
            <GripVertical className="h-3 w-3" />
            Kéo
          </button>
          <AboutCardResizeControls id={id} onResize={onResize} />
        </div>
      )}
      {children}
    </div>
  );
}

type AboutCardPosition = {
  column: number;
  row: number;
  width: number;
  height: number;
};

const ABOUT_CARD_FRAME_PRESETS = {
  soft: "rounded-2xl border p-5 shadow-sm transition hover:shadow-md",
  glass:
    "rounded-3xl border p-5 shadow-lg backdrop-blur-md transition hover:shadow-xl",
  outline: "rounded-2xl border-2 p-5 shadow-none transition",
  editorial:
    "rounded-none border-y-0 border-r-0 border-l-4 p-5 shadow-none transition",
  elevated: "rounded-3xl border p-6 shadow-xl transition hover:-translate-y-1",
  dashed: "rounded-2xl border-2 border-dashed p-5 shadow-none transition",
} as const;

const DEFAULT_ABOUT_CARD_POSITIONS: Record<string, AboutCardPosition> = {
  contact: { column: 0, row: 0, width: 7, height: 7 },
  education: { column: 7, row: 0, width: 5, height: 3 },
  learningGoals: { column: 7, row: 3, width: 5, height: 4 },
};

function AboutCardResizeControls({
  id,
  onResize,
}: {
  id: string;
  onResize: (id: string, dimension: "width" | "height", delta: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label={`Thu hẹp ô ${id}`}
        onClick={() => onResize(id, "width", -1)}
        className="rounded px-1 py-0.5 text-[10px] font-bold text-stone-600 hover:bg-stone-100"
      >
        W−
      </button>
      <button
        type="button"
        aria-label={`Mở rộng ô ${id}`}
        onClick={() => onResize(id, "width", 1)}
        className="rounded px-1 py-0.5 text-[10px] font-bold text-stone-600 hover:bg-stone-100"
      >
        W+
      </button>
      <button
        type="button"
        aria-label={`Rút ngắn ô ${id}`}
        onClick={() => onResize(id, "height", -1)}
        className="rounded px-1 py-0.5 text-[10px] font-bold text-stone-600 hover:bg-stone-100"
      >
        H−
      </button>
      <button
        type="button"
        aria-label={`Kéo dài ô ${id}`}
        onClick={() => onResize(id, "height", 1)}
        className="rounded px-1 py-0.5 text-[10px] font-bold text-stone-600 hover:bg-stone-100"
      >
        H+
      </button>
    </>
  );
}

function FreePositionAboutCardItem({
  id,
  position,
  children,
  onResize,
  editable,
}: {
  id: string;
  position: AboutCardPosition;
  children: React.ReactNode;
  onResize: (id: string, dimension: "width" | "height", delta: number) => void;
  editable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled: !editable });

  const style: React.CSSProperties = {
    gridColumn: `${position.column + 1} / span ${position.width}`,
    gridRow: `${position.row + 1} / span ${position.height}`,
    minHeight: `${position.height * 48 + (position.height - 1) * 16}px`,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`about-card-${id}`}
      data-about-card={id}
      className={`group relative ${isDragging ? "rounded-2xl ring-2 ring-amber-500 shadow-2xl" : ""}`}
    >
      {editable && (
        <div className="absolute -top-3 right-2 z-20 flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white/95 p-0.5 shadow-sm">
          <button
            type="button"
            {...attributes}
            {...listeners}
            data-testid={`drag-handle-about-${id}`}
            aria-label={`Kéo ô ${id} đến vị trí khác`}
            className="inline-flex cursor-grab touch-none items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold text-stone-600 hover:bg-amber-50 active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
            Kéo
          </button>
          <AboutCardResizeControls id={id} onResize={onResize} />
        </div>
      )}
      {children}
    </div>
  );
}

function InlineAboutText({
  value,
  editable,
  ariaLabel,
  className = "",
  onSave,
}: {
  value: string;
  editable: boolean;
  ariaLabel: string;
  className?: string;
  onSave: (value: string) => void;
}) {
  return (
    <span
      contentEditable={editable}
      suppressContentEditableWarning
      role={editable ? "textbox" : undefined}
      aria-label={editable ? ariaLabel : undefined}
      onBlur={(event) => {
        if (!editable) return;
        const nextValue = event.currentTarget.textContent?.trim() ?? "";
        if (nextValue !== value) onSave(nextValue);
      }}
      className={`${className} ${
        editable
          ? "rounded-sm outline-none focus:ring-2 focus:ring-amber-400"
          : ""
      }`}
    >
      {value}
    </span>
  );
}

function AboutHighlightValue({
  value,
  color,
  editable,
  ariaLabel,
  onSave,
}: {
  value: string;
  color: string;
  editable: boolean;
  ariaLabel: string;
  onSave: (value: string) => void;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) return;

    const measureOverflow = () => {
      const distance = Math.max(
        0,
        Math.ceil(text.scrollWidth - container.clientWidth),
      );
      setOverflowDistance((current) =>
        current === distance ? current : distance,
      );
    };

    measureOverflow();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureOverflow);
      return () => window.removeEventListener("resize", measureOverflow);
    }

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(container);
    observer.observe(text);
    return () => observer.disconnect();
  }, [value]);

  const style: React.CSSProperties & {
    "--about-marquee-distance"?: string;
    "--about-marquee-duration"?: string;
  } = {
    color,
    ...(overflowDistance > 0
      ? {
          "--about-marquee-distance": `-${overflowDistance}px`,
          "--about-marquee-duration": `${Math.max(4, overflowDistance / 24)}s`,
        }
      : {}),
  };

  return (
    <span
      ref={containerRef}
      className="about-highlight-value mt-1 block w-full text-lg font-bold font-editorial focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={style}
      tabIndex={overflowDistance > 0 ? 0 : undefined}
    >
      <span
        ref={textRef}
        contentEditable={editable}
        suppressContentEditableWarning
        role={editable ? "textbox" : undefined}
        aria-label={editable ? ariaLabel : undefined}
        onBlur={(event) => {
          if (!editable) return;
          const nextValue = event.currentTarget.textContent?.trim() ?? "";
          if (nextValue !== value) onSave(nextValue);
        }}
        className={`about-highlight-value__text${overflowDistance > 0 ? " is-overflowing" : ""}`}
      >
        {value}
      </span>
    </span>
  );
}

export function AboutBlock({
  section,
  theme,
  archetypeId = "canva-editorial",
  avatarUrl,
  avatarAlt,
  educationInfo,
  profileOwner,
  learningGoals,
  portfolioObjective,
  editable = false,
  sectionIndex,
}: AboutBlockProps) {
  const swapAboutLayout = usePortfolioStore((s) => s.swapAboutLayout);
  const reorderAboutCards = usePortfolioStore((s) => s.reorderAboutCards);
  const updateSection = usePortfolioStore((s) => s.updateSection);
  const freeGridRef = useRef<HTMLDivElement | null>(null);
  const { setNodeRef: setFreeGridDropRef } = useDroppable({
    id: "about-free-grid",
  });

  const updateAbout = (patch: Partial<AboutSection>) => {
    if (sectionIndex === undefined) return;
    updateSection(sectionIndex, { ...section, ...patch });
  };

  const getCardPosition = (cardId: string): AboutCardPosition =>
    section.cardPositions?.[cardId] ??
    DEFAULT_ABOUT_CARD_POSITIONS[cardId] ?? {
      column: 0,
      row: 0,
      width: 4,
      height: 3,
    };

  const resizeAboutCard = (
    cardId: string,
    dimension: "width" | "height",
    delta: number,
  ) => {
    const positions = {
      ...DEFAULT_ABOUT_CARD_POSITIONS,
      ...section.cardPositions,
    };
    const current = positions[cardId] ?? getCardPosition(cardId);
    const nextSize = Math.max(
      1,
      Math.min(dimension === "width" ? 12 : 12, current[dimension] + delta),
    );
    const nextPosition = {
      ...current,
      [dimension]: nextSize,
    };
    if (dimension === "width") {
      nextPosition.column = Math.min(
        nextPosition.column,
        12 - nextPosition.width,
      );
    }

    const resolvedPositions = { ...positions, [cardId]: nextPosition };
    const placedPositions: Record<string, AboutCardPosition> = {
      [cardId]: nextPosition,
    };
    for (const otherId of cardOrder.filter((id) => id !== cardId)) {
      const candidate = { ...resolvedPositions[otherId] };
      let attempts = 0;
      while (
        Object.values(placedPositions).some(
          (placed) =>
            candidate.column < placed.column + placed.width &&
            candidate.column + candidate.width > placed.column &&
            candidate.row < placed.row + placed.height &&
            candidate.row + candidate.height > placed.row,
        ) &&
        attempts < 100
      ) {
        candidate.row += 1;
        attempts += 1;
      }
      placedPositions[otherId] = candidate;
    }

    updateAbout({ cardPositions: placedPositions });
  };

  const [activeTab, setActiveTab] = useState<
    "bio" | "contact" | "education" | "goals"
  >("bio");

  const cardDec = getCardDecoration(archetypeId, theme);
  const tokens = getThemeTokens(theme);
  const isMinimal =
    archetypeId === "framer-minimal" || archetypeId === "minimal-chic";
  const isTerminal = archetypeId === "tech-developer";
  const isGrowth = archetypeId === "growth-marketer";
  const isCreative =
    archetypeId === "creative-showcase" || archetypeId === "creative-bold";
  const isWarmEditorial = archetypeId === "warm-editorial";
  const isOrganic =
    archetypeId === "artistic-organic" || section.variant === "organic";
  const isAcademic =
    archetypeId === "academic-presentation" || section.variant === "timeline";

  // Resolved Profile Values
  const effectiveAvatarUrl = profileOwner?.avatarUrl || avatarUrl;
  const effectiveAvatarName =
    profileOwner?.fullName || avatarAlt || section.title || "Student Portrait";
  const effectiveFrameStyle =
    profileOwner?.frameStyle ||
    (archetypeId === "canva-editorial" ? "arch-window" : "rounded-rect");
  const effectiveAspectRatio = profileOwner?.aspectRatio || "3/4";


  // Resolved Profile Values
  // INF2501 Rubric Content Resolution
  const resolvedLearningGoals =
    learningGoals || section.learningGoals || profileOwner?.learningGoals;
  const resolvedPortfolioObjective =
    portfolioObjective ||
    section.portfolioObjective ||
    profileOwner?.portfolioObjective;

  const eduSchool =
    section.educationSchool ||
    educationInfo?.school ||
    section.highlights.find((h) =>
      /trường|đại học|học viện|education|school/i.test(h.label),
    )?.value ||
    "Trường ĐH Sư phạm Nghệ thuật TW";
  const eduDegree =
    section.educationDegree ||
    educationInfo?.degree ||
    section.highlights.find((h) =>
      /ngành|khoa|chuyên ngành|degree|major/i.test(h.label),
    )?.value ||
    "Sư phạm Âm nhạc & Công nghệ Giáo dục";
  const updateContactInfo = (
    field: "email" | "phone" | "location" | "website",
    value: string,
  ) => {
    updateAbout({
      contactInfo: {
        ...section.contactInfo,
        [field]: value || undefined,
      },
    });
  };
  const updateEducationInfo = (
    field: "educationSchool" | "educationDegree" | "educationPeriod",
    value: string,
  ) => updateAbout({ [field]: value });
  const updateHighlight = (
    index: number,
    patch: Partial<AboutSection["highlights"][number]>,
  ) => {
    const highlights = [...section.highlights];
    const current = highlights[index];
    if (!current) return;
    highlights[index] = { ...current, ...patch };
    updateAbout({ highlights });
  };
  const cardTitle = (
    id: "contact" | "education" | "learningGoals" | "portfolioObjective",
    fallback: string,
  ) => section.cardTitles?.[id] || fallback;
  const customCardFrame =
    section.cardFrame && section.cardFrame !== "template"
      ? section.cardFrame
      : undefined;
  const cardFrameClass = customCardFrame
    ? ABOUT_CARD_FRAME_PRESETS[customCardFrame]
    : undefined;
  const cardFrameStyle: React.CSSProperties = customCardFrame
    ? {
        backgroundColor:
          customCardFrame === "glass"
            ? `color-mix(in srgb, ${theme.surfaceColor} 78%, transparent)`
            : theme.surfaceColor,
        borderColor:
          customCardFrame === "outline" || customCardFrame === "dashed"
            ? theme.primaryColor
            : tokens.borderSubtle,
        borderLeftColor:
          customCardFrame === "editorial" ? theme.primaryColor : undefined,
      }
    : {};
  const cardBodyFontStyle: React.CSSProperties = section.cardBodyFont
    ? {
        fontFamily: `"${section.cardBodyFont.replaceAll('"', "")}", sans-serif`,
      }
    : {};
  const cardHeadingFontStyle: React.CSSProperties = section.cardHeadingFont
    ? {
        fontFamily: `"${section.cardHeadingFont.replaceAll('"', "")}", sans-serif`,
      }
    : {};

  // Inverted layout check
  const isInverted = Boolean(
    section.layoutInverted ?? section.mediaPosition === "left",
  );

  // Card order resolution
  const visibleCardIds = new Set(["contact", "education", "learningGoals"]);
  const configuredCardOrder = (
    section.cardOrder && section.cardOrder.length > 0
      ? section.cardOrder
      : ["contact", "education", "learningGoals"]
  ).filter((cardId) => visibleCardIds.has(cardId));
  const cardOrder =
    configuredCardOrder.length > 0
      ? configuredCardOrder
      : ["contact", "education", "learningGoals"];
  const activeLayout =
    section.variant === "story-card" ||
    section.variant === "bento-facts" ||
    section.variant === "editorial-poster" ||
    section.variant === "profile-dashboard" ||
    section.variant === "spotlight" ||
    section.variant === "cards" ||
    section.variant === "grid" ||
    section.variant === "tabs" ||
    section.variant === "organic" ||
    section.variant === "timeline" ||
    section.variant === "two-column-bio"
      ? section.variant
      : "cards";
  const isFreeLayout = Boolean(section.cardPositions);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cardOrder.indexOf(String(active.id));
    const newIndex = cardOrder.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderAboutCards(oldIndex, newIndex);
    }
  };

  const setFreeGridRef = (node: HTMLDivElement | null) => {
    freeGridRef.current = node;
    setFreeGridDropRef(node);
  };

  const handleFreeDragEnd = (event: DragEndEvent) => {
    const cardId = String(event.active.id);
    const initialRect = event.active.rect.current.initial;
    const gridRect = freeGridRef.current?.getBoundingClientRect();
    if (!initialRect || !gridRect) return;

    const currentPosition = getCardPosition(cardId);
    const centerX = initialRect.left + event.delta.x + initialRect.width / 2;
    const centerY = initialRect.top + event.delta.y + initialRect.height / 2;
    const columnWidth = gridRect.width / 12;
    const nextPosition: AboutCardPosition = {
      ...currentPosition,
      column: Math.max(
        0,
        Math.min(
          12 - currentPosition.width,
          Math.floor(
            (centerX - gridRect.left) / columnWidth - currentPosition.width / 2,
          ),
        ),
      ),
      row: Math.max(
        0,
        Math.min(
          100 - currentPosition.height,
          Math.floor(
            (centerY - gridRect.top) / 64 - currentPosition.height / 2,
          ),
        ),
      ),
    };

    const positions = {
      ...DEFAULT_ABOUT_CARD_POSITIONS,
      ...section.cardPositions,
    };
    let attempts = 0;
    while (
      Object.entries(positions).some(([otherId, other]) => {
        if (otherId === cardId) return false;
        return (
          nextPosition.column < other.column + other.width &&
          nextPosition.column + nextPosition.width > other.column &&
          nextPosition.row < other.row + other.height &&
          nextPosition.row + nextPosition.height > other.row
        );
      }) &&
      attempts < 100
    ) {
      nextPosition.row += 1;
      attempts += 1;
    }
    nextPosition.row = Math.min(100 - nextPosition.height, nextPosition.row);
    updateAbout({ cardPositions: { ...positions, [cardId]: nextPosition } });
  };

  // Card Renderers
  const renderCardById = (cardId: string) => {
    switch (cardId) {
      case "contact":
        return (
          <div
            data-about-frame={customCardFrame ?? "template"}
            className={`h-full ${
              cardFrameClass ??
              `rounded-2xl border p-5 transition hover:shadow-md ${
                isCreative
                  ? "border-2 border-black bg-white shadow-[4px_4px_0px_#000]"
                  : isMinimal
                    ? "border-[1px] border-[var(--primary)]/20"
                    : isOrganic
                      ? "rounded-[2rem] border-[var(--primary)]/20"
                      : ""
              }`
            }`}
            style={{
              ...cardFrameStyle,
              ...(customCardFrame
                ? cardBodyFontStyle
                : {
                    backgroundColor: isCreative
                      ? "#FFFFFF"
                      : theme.backgroundColor,
                    borderColor: isCreative ? undefined : tokens.borderSubtle,
                    ...cardBodyFontStyle,
                  }),
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: theme.primaryColor }}
              >
                1
              </span>
              <h4
                className="font-editorial text-base font-bold"
                style={cardHeadingFontStyle}
              >
                <InlineAboutText
                  value={cardTitle("contact", "Thông tin liên hệ")}
                  editable={editable}
                  ariaLabel="Tiêu đề ô liên hệ"
                  onSave={(value) =>
                    updateAbout({
                      cardTitles: { ...section.cardTitles, contact: value },
                    })
                  }
                />
              </h4>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              {(section.contactInfo.email || editable) && (
                <a
                  href={
                    section.contactInfo.email
                      ? `mailto:${section.contactInfo.email}`
                      : undefined
                  }
                  onClick={(event) => {
                    if (editable) event.preventDefault();
                  }}
                  className="flex items-center gap-2 truncate opacity-85 hover:underline"
                >
                  <Mail
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: theme.primaryColor }}
                  />
                  <InlineAboutText
                    value={section.contactInfo.email ?? "Thêm email"}
                    editable={editable}
                    ariaLabel="Email trong ô liên hệ"
                    className="truncate"
                    onSave={(value) => updateContactInfo("email", value)}
                  />
                </a>
              )}
              {(section.contactInfo.phone || editable) && (
                <div className="flex items-center gap-2 opacity-85">
                  <Phone
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: theme.primaryColor }}
                  />
                  <InlineAboutText
                    value={section.contactInfo.phone ?? "Thêm số điện thoại"}
                    editable={editable}
                    ariaLabel="Số điện thoại trong ô liên hệ"
                    onSave={(value) => updateContactInfo("phone", value)}
                  />
                </div>
              )}
              {(section.contactInfo.location || editable) && (
                <div className="flex items-center gap-2 opacity-85">
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: theme.primaryColor }}
                  />
                  <InlineAboutText
                    value={section.contactInfo.location ?? "Thêm địa điểm"}
                    editable={editable}
                    ariaLabel="Địa điểm trong ô liên hệ"
                    onSave={(value) => updateContactInfo("location", value)}
                  />
                </div>
              )}
              {(section.contactInfo.website || editable) && (
                <a
                  href={section.contactInfo.website || undefined}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => {
                    if (editable) event.preventDefault();
                  }}
                  className="flex items-center gap-2 opacity-85 hover:underline"
                >
                  <Globe
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: theme.primaryColor }}
                  />
                  <InlineAboutText
                    value={section.contactInfo.website ?? "Portfolio Web"}
                    editable={editable}
                    ariaLabel="Liên kết website trong ô liên hệ"
                    onSave={(value) => updateContactInfo("website", value)}
                  />
                  <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                </a>
              )}
            </div>
          </div>
        );

      case "education":
        return (
          <div
            data-about-frame={customCardFrame ?? "template"}
            className={`h-full ${
              cardFrameClass ??
              `rounded-2xl border p-5 transition hover:shadow-md ${
                isCreative
                  ? "border-2 border-black bg-white shadow-[4px_4px_0px_#000]"
                  : isMinimal
                    ? "border-[1px] border-[var(--primary)]/20"
                    : isOrganic
                      ? "rounded-[2rem] border-[var(--primary)]/20"
                      : ""
              }`
            }`}
            style={{
              ...cardFrameStyle,
              ...(customCardFrame
                ? cardBodyFontStyle
                : {
                    backgroundColor: isCreative
                      ? "#FFFFFF"
                      : theme.backgroundColor,
                    borderColor: isCreative ? undefined : tokens.borderSubtle,
                    ...cardBodyFontStyle,
                  }),
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: theme.primaryColor }}
              >
                2
              </span>
              <h4
                className="font-editorial text-base font-bold"
                style={cardHeadingFontStyle}
              >
                <InlineAboutText
                  value={cardTitle("education", "Học vấn & Đào tạo")}
                  editable={editable}
                  ariaLabel="Tiêu đề ô học vấn"
                  onSave={(value) =>
                    updateAbout({
                      cardTitles: { ...section.cardTitles, education: value },
                    })
                  }
                />
              </h4>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <GraduationCap
                  className="h-4 w-4 shrink-0 mt-0.5"
                  style={{ color: theme.primaryColor }}
                />
                <div>
                  <p className="font-bold">
                    <InlineAboutText
                      value={eduSchool}
                      editable={editable}
                      ariaLabel="Tên trường trong ô học vấn"
                      onSave={(value) =>
                        updateEducationInfo("educationSchool", value)
                      }
                    />
                  </p>
                  <p className="opacity-75">
                    <InlineAboutText
                      value={eduDegree}
                      editable={editable}
                      ariaLabel="Ngành học trong ô học vấn"
                      onSave={(value) =>
                        updateEducationInfo("educationDegree", value)
                      }
                    />
                  </p>
                </div>
              </div>
              <p className="pt-1 text-[11px] font-semibold text-stone-500">
                <InlineAboutText
                  value={
                    section.educationPeriod ?? "Khoá K18 • Học phần INF2501"
                  }
                  editable={editable}
                  ariaLabel="Thông tin khóa học trong ô học vấn"
                  onSave={(value) =>
                    updateEducationInfo("educationPeriod", value)
                  }
                />
              </p>
            </div>
          </div>
        );

      case "learningGoals":
        return (
          <div
            data-about-frame={customCardFrame ?? "template"}
            className={`h-full ${
              cardFrameClass ??
              `rounded-2xl border p-5 transition hover:shadow-md ${
                isCreative
                  ? "border-2 border-black bg-white shadow-[4px_4px_0px_#000]"
                  : isMinimal
                    ? "border-[1px] border-[var(--primary)]/20"
                    : isOrganic
                      ? "rounded-[2rem] border-[var(--primary)]/20"
                      : ""
              }`
            }`}
            style={{
              ...cardFrameStyle,
              ...(customCardFrame
                ? cardBodyFontStyle
                : {
                    backgroundColor: isCreative
                      ? "#FFFFFF"
                      : theme.backgroundColor,
                    borderColor: isCreative ? undefined : tokens.borderSubtle,
                    ...cardBodyFontStyle,
                  }),
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target
                  className="h-4 w-4"
                  style={{ color: theme.primaryColor }}
                />
                <h4
                  className="font-editorial text-base font-bold"
                  style={cardHeadingFontStyle}
                >
                  <InlineAboutText
                    value={cardTitle(
                      "learningGoals",
                      "Mục tiêu học tập & phát triển (INF2501)",
                    )}
                    editable={editable}
                    ariaLabel="Tiêu đề mục tiêu học tập"
                    onSave={(value) =>
                      updateAbout({
                        cardTitles: {
                          ...section.cardTitles,
                          learningGoals: value,
                        },
                      })
                    }
                  />
                </h4>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Rubric
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed opacity-85">
              <InlineAboutText
                value={
                  resolvedLearningGoals ||
                  "Vận dụng thành thạo AI tạo sinh và thiết kế số vào giảng dạy thực tiễn."
                }
                editable={editable}
                ariaLabel="Mục tiêu học tập"
                onSave={(value) => updateAbout({ learningGoals: value })}
              />
            </p>
            <div
              className="mt-4 border-t pt-3"
              style={{ borderColor: tokens.borderSubtle }}
            >
              <h5
                className="font-editorial text-xs font-bold text-amber-800"
                style={cardHeadingFontStyle}
              >
                <InlineAboutText
                  value={cardTitle(
                    "portfolioObjective",
                    "Mục tiêu của Portfolio",
                  )}
                  editable={editable}
                  ariaLabel="Tiêu đề mục tiêu Portfolio"
                  onSave={(value) =>
                    updateAbout({
                      cardTitles: {
                        ...section.cardTitles,
                        portfolioObjective: value,
                      },
                    })
                  }
                />
              </h5>
              <p className="mt-1 text-xs opacity-85">
                <InlineAboutText
                  value={
                    resolvedPortfolioObjective ||
                    "Tổng hợp toàn bộ học liệu, bài tập và minh chứng năng lực ứng dụng AI."
                  }
                  editable={editable}
                  ariaLabel="Mục tiêu Portfolio"
                  onSave={(value) => updateAbout({ portfolioObjective: value })}
                />
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCardLayout = (layout: Exclude<typeof activeLayout, "tabs">) => {
    const layoutTitle = {
      "story-card": "Tiểu sử dạng câu chuyện",
      "bento-facts": "Bento thông tin",
      "editorial-poster": "Editorial Poster",
      "profile-dashboard": "Profile Dashboard",
      spotlight: "Spotlight Profile",
      cards: "Thông tin cá nhân dạng thẻ",
      grid: "Tổng quan dạng lưới",
      organic: "Bố cục tự do",
      timeline: "Dòng thời gian hồ sơ",
      "two-column-bio": "Tiểu sử 2 cột",
    }[layout];

    const containerClassName = {
      "story-card": "grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]",
      "bento-facts": "grid grid-cols-1 gap-4 md:grid-cols-6",
      "editorial-poster": "grid grid-cols-1 gap-4 md:grid-cols-12",
      "profile-dashboard": "grid grid-cols-1 gap-4 md:grid-cols-12",
      spotlight: "grid grid-cols-1 gap-4 md:grid-cols-12",
      cards: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
      grid: "grid grid-cols-1 gap-4 md:grid-cols-6",
      organic: "grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_0.8fr]",
      timeline: "relative space-y-5",
      "two-column-bio": "grid grid-cols-1 gap-5 md:grid-cols-2",
    }[layout];

    const getItemClassName = (index: number) => {
      if (layout === "story-card" && index === 0) {
        return "lg:row-span-2";
      }
      if (layout === "editorial-poster") {
        return index === 0
          ? "md:col-span-8 md:row-span-2"
          : index === 1
            ? "md:col-span-4"
            : "md:col-span-12";
      }
      if (layout === "profile-dashboard") {
        return index === 0
          ? "md:col-span-6"
          : index === 1
            ? "md:col-span-3"
            : "md:col-span-3";
      }
      if (layout === "spotlight") {
        return index === 0 ? "md:col-span-12" : "md:col-span-6";
      }
      if (layout === "bento-facts") {
        return index === 0
          ? "md:col-span-2"
          : index === 1
            ? "md:col-span-4"
            : "md:col-span-6";
      }
      if (layout === "grid") {
        return index === 0 ? "md:col-span-6" : "md:col-span-3";
      }
      if (layout === "organic") {
        return index === 0
          ? "md:row-span-2 md:-rotate-1"
          : index === 1
            ? "md:translate-y-6 md:rotate-1"
            : "";
      }
      if (layout === "two-column-bio" && index === 0) {
        return "md:row-span-2";
      }
      return "";
    };

    const renderItem = (cardId: string, index: number) => {
      const itemClassName = `${layout === "timeline" ? "pl-10" : ""} ${getItemClassName(index)}`;
      const content = (
        <>
          {layout === "timeline" && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 text-[10px] font-bold"
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {renderCardById(cardId)}
        </>
      );

      return editable && isFreeLayout ? (
        <FreePositionAboutCardItem
          key={cardId}
          id={cardId}
          position={getCardPosition(cardId)}
          onResize={resizeAboutCard}
          editable={editable}
        >
          {content}
        </FreePositionAboutCardItem>
      ) : editable ? (
        <SortableAboutCardItem
          key={cardId}
          id={cardId}
          editable={editable}
          onResize={resizeAboutCard}
          className={itemClassName}
        >
          {content}
        </SortableAboutCardItem>
      ) : (
        <div
          key={cardId}
          data-testid={`about-card-${cardId}`}
          className={`relative ${itemClassName}`}
        >
          {content}
        </div>
      );
    };

    const cardItems = cardOrder.map(renderItem);
    const cardGrid = (
      <div
        ref={isFreeLayout ? setFreeGridRef : undefined}
        data-testid="about-layout-content"
        data-layout={layout}
        data-layout-positioning={isFreeLayout ? "free" : "automatic"}
        className={isFreeLayout ? "about-free-grid" : containerClassName}
        style={
          isFreeLayout
            ? {
                minHeight: `${
                  Math.max(
                    ...cardOrder.map((cardId) => {
                      const position = getCardPosition(cardId);
                      return position.row + position.height;
                    }),
                  ) *
                    64 -
                  16
                }px`,
              }
            : undefined
        }
      >
        {layout === "timeline" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-[15px] top-4 w-px"
            style={{ backgroundColor: `${theme.primaryColor}45` }}
          />
        )}
        {cardItems}
      </div>
    );

    return (
      <div
        className="space-y-4 border-t pt-4"
        style={{ borderColor: tokens.borderSubtle }}
      >
        <div className="flex items-center justify-between gap-3 pb-1">
          <span className="text-xs font-bold uppercase tracking-wider opacity-75">
            {layoutTitle}
          </span>
          {editable && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="toggle-about-free-layout"
                onClick={() =>
                  updateAbout({
                    cardPositions: isFreeLayout
                      ? undefined
                      : DEFAULT_ABOUT_CARD_POSITIONS,
                  })
                }
                className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-900 hover:bg-amber-100"
              >
                {isFreeLayout ? "Bố cục tự động" : "Bật kéo thả tự do"}
              </button>
              <span className="rounded-full bg-amber-100/70 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {isFreeLayout
                  ? "Kéo thả và W/H để chỉnh vị trí, kích thước"
                  : "Kéo thả để sắp xếp, W/H để chỉnh kích thước"}
              </span>
            </div>
          )}
        </div>
        {editable && isFreeLayout ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleFreeDragEnd}
          >
            {cardGrid}
          </DndContext>
        ) : editable ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
              {cardGrid}
            </SortableContext>
          </DndContext>
        ) : (
          cardGrid
        )}
      </div>
    );
  };

  return (
    <section
      id="about"
      className="reveal-on-scroll mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div
        className={`p-6 sm:p-10 ${cardDec.className} space-y-8 ${
          isCreative ? "border-4 border-black shadow-[8px_8px_0px_#000]" : ""
        } ${isOrganic ? "rounded-[3rem] border border-[var(--primary)]/25" : ""}`}
        style={cardDec.style}
      >
        {/* Studio Direct Canvas Toolbar */}
        {editable && (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <LayoutTemplate className="h-4 w-4 text-amber-600" />
              <span>
                Bố cục About: {section.variant || "Mặc định"}{" "}
                {isInverted ? "(Đã đảo vị trí)" : ""}
              </span>
            </div>
            <button
              type="button"
              data-testid="swap-about-layout"
              onClick={swapAboutLayout}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 font-bold text-white shadow-sm hover:bg-amber-700 transition cursor-pointer"
              title="Kéo đổi vị trí Ảnh với Tiểu sử trên Canvas"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>⇄ Đổi vị trí Ảnh / Tiểu sử</span>
            </button>
          </div>
        )}

        {/* Academic Presentation Slide Banner */}
        {isAcademic && (
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-xs text-stone-500 font-mono">
            <span>HỒ SƠ HỌC TẬP VÀ ĐỊNH HƯỚNG PHÁT TRIỂN NĂNG LỰC SỐ</span>
            <span className="rounded bg-stone-100 px-2 py-0.5 font-bold text-stone-700">
              Slide 02 • Tiểu sử
            </span>
          </div>
        )}

        {/* Top Section Grid: Bio & Avatar */}
        <div
          data-testid="about-intro-layout"
          data-layout={activeLayout}
          className={`grid grid-cols-1 items-center gap-10 ${
            activeLayout === "spotlight"
              ? "mx-auto max-w-4xl text-center"
              : "lg:grid-cols-12"
          }`}
        >
          {/* Framed Portrait Photo */}
          <div
            className={`flex justify-center ${
              activeLayout === "spotlight"
                ? "order-1"
                : activeLayout === "editorial-poster"
                  ? "lg:col-span-4 lg:order-2"
                  : activeLayout === "profile-dashboard"
                    ? "lg:col-span-4 lg:row-span-2 lg:order-2"
                    : isInverted
                      ? "lg:col-span-5 lg:order-1"
                      : "lg:col-span-5 lg:order-2"
            } ${
              activeLayout === "profile-dashboard"
                ? "rounded-3xl border border-[var(--primary)]/20 bg-white/70 p-4 shadow-lg"
                : ""
            }`}
          >
            <AvatarFrame
              avatar={{
                url: effectiveAvatarUrl,
                frameStyle: effectiveFrameStyle,
                aspectRatio: effectiveAspectRatio,
              }}
              alt={effectiveAvatarName}
              fullName={profileOwner?.fullName || avatarAlt}
              primaryColor={theme.primaryColor}
              secondaryColor={theme.secondaryColor}
              surfaceColor={theme.surfaceColor}
              enableTilt={theme.effects?.enableTilt}
              enableGlow={theme.effects?.enableGlow}
              className="w-full max-w-[320px] sm:max-w-[350px]"
            />
          </div>

          {/* Bio Column */}
          <div
            className={`space-y-5 ${
              activeLayout === "spotlight"
                ? "order-2 text-center"
                : activeLayout === "editorial-poster"
                  ? "lg:col-span-8 lg:order-1"
                  : activeLayout === "profile-dashboard"
                    ? "lg:col-span-8 lg:order-1"
                    : isInverted
                      ? "lg:col-span-7 lg:order-2"
                      : "lg:col-span-7 lg:order-1"
            } ${
              activeLayout === "editorial-poster"
                ? "rounded-3xl border-l-4 border-[var(--primary)] bg-white/70 p-6 sm:p-8"
                : activeLayout === "profile-dashboard"
                  ? "rounded-3xl border border-[var(--primary)]/15 bg-white/60 p-6 shadow-sm sm:p-8"
                  : ""
            }`}
          >
            <div>
              <span
                className={`text-xs font-bold uppercase tracking-[0.2em] ${
                  isTerminal ? "font-mono" : ""
                } ${isCreative ? "rounded-md border-2 border-black bg-amber-300 px-2.5 py-1 text-black shadow-[2px_2px_0px_#000]" : ""}`}
                style={isCreative ? undefined : { color: theme.primaryColor }}
              >
                {formatSectionEyebrow(archetypeId, "01", "Profile Story")}
              </span>
              <h2 className="mt-1 font-editorial text-3xl font-bold sm:text-4xl">
                <InlineAboutText
                  value={section.title}
                  editable={editable}
                  ariaLabel="Tiêu đề About"
                  onSave={(value) => updateAbout({ title: value })}
                />
              </h2>
            </div>

            <p className="text-base leading-relaxed opacity-85">
              <InlineAboutText
                value={section.biography}
                editable={editable}
                ariaLabel="Nội dung giới thiệu bản thân"
                onSave={(value) => updateAbout({ biography: value })}
              />
            </p>

            {/* Highlights Chips */}
            {section.highlights.length > 0 && (
              <div className="grid auto-rows-[88px] grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {section.highlights.map((item, idx) => {
                  const width = Math.max(1, Math.min(4, item.width ?? 1));
                  const height = Math.max(1, Math.min(3, item.height ?? 1));
                  const widthClass =
                    {
                      1: "col-span-1",
                      2: "col-span-2",
                      3: "col-span-2 sm:col-span-3",
                      4: "col-span-2 sm:col-span-4",
                    }[width] ?? "col-span-1";
                  return (
                    <div
                      key={idx}
                      data-testid={`about-highlight-${idx}`}
                      data-highlight-width={width}
                      style={{
                        gridRow: `span ${height}`,
                        minHeight: `${height * 88}px`,
                        ...(isCreative
                          ? {}
                          : {
                              backgroundColor: theme.backgroundColor,
                              borderColor: tokens.borderSubtle,
                            }),
                      }}
                      className={`relative rounded-xl border p-3 ${widthClass} ${
                        isCreative
                          ? "border-2 border-black bg-white shadow-[3px_3px_0px_#000]"
                          : ""
                      }`}
                    >
                      {editable && (
                        <div className="mb-1 flex flex-wrap justify-end gap-0.5">
                          <button
                            type="button"
                            aria-label={`Thu hẹp điểm nổi bật ${idx + 1}`}
                            onClick={() =>
                              updateHighlight(idx, {
                                width: Math.max(1, width - 1),
                              })
                            }
                            className="rounded bg-white/90 px-1 text-[9px] font-bold text-stone-600 shadow-sm hover:bg-stone-100"
                          >
                            W−
                          </button>
                          <button
                            type="button"
                            aria-label={`Mở rộng điểm nổi bật ${idx + 1}`}
                            onClick={() =>
                              updateHighlight(idx, {
                                width: Math.min(4, width + 1),
                              })
                            }
                            className="rounded bg-white/90 px-1 text-[9px] font-bold text-stone-600 shadow-sm hover:bg-stone-100"
                          >
                            W+
                          </button>
                          <button
                            type="button"
                            aria-label={`Rút ngắn điểm nổi bật ${idx + 1}`}
                            onClick={() =>
                              updateHighlight(idx, {
                                height: Math.max(1, height - 1),
                              })
                            }
                            className="rounded bg-white/90 px-1 text-[9px] font-bold text-stone-600 shadow-sm hover:bg-stone-100"
                          >
                            H−
                          </button>
                          <button
                            type="button"
                            aria-label={`Kéo dài điểm nổi bật ${idx + 1}`}
                            onClick={() =>
                              updateHighlight(idx, {
                                height: Math.min(3, height + 1),
                              })
                            }
                            className="rounded bg-white/90 px-1 text-[9px] font-bold text-stone-600 shadow-sm hover:bg-stone-100"
                          >
                            H+
                          </button>
                        </div>
                      )}
                      <InlineAboutText
                        value={item.label}
                        editable={editable}
                        ariaLabel={`Nhãn điểm nổi bật ${idx + 1}`}
                        className="block text-[10px] font-medium uppercase tracking-wider opacity-65"
                        onSave={(value) =>
                          updateHighlight(idx, { label: value })
                        }
                      />
                      <AboutHighlightValue
                        value={item.value}
                        color={
                          idx % 2 === 0
                            ? theme.primaryColor
                            : theme.secondaryColor
                        }
                        editable={editable}
                        ariaLabel={`Giá trị điểm nổi bật ${idx + 1}`}
                        onSave={(value) => updateHighlight(idx, { value })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Format Layout Variant Renderers */}
        {activeLayout === "tabs" ? (
          /* Tabs Layout Variant */
          <div
            data-testid="about-layout-content"
            data-layout="tabs"
            className="space-y-4 border-t pt-4"
            style={{ borderColor: tokens.borderSubtle }}
          >
            <div
              role="tablist"
              aria-label="Thông tin About"
              className="flex flex-wrap gap-2"
            >
              {(
                [
                  { id: "bio", label: "Tổng quan" },
                  { id: "contact", label: "Liên hệ" },
                  { id: "education", label: "Học vấn" },
                  { id: "goals", label: "Mục tiêu học phần" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-amber-600 text-white shadow-sm"
                      : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="pt-2">
              {activeTab === "bio" && (
                <div className="rounded-2xl border p-6 bg-white/50 text-sm leading-relaxed">
                  <h4 className="font-editorial text-lg font-bold mb-2">
                    Đôi nét về bản thân
                  </h4>
                  <p>{section.biography}</p>
                </div>
              )}
              {activeTab === "contact" && renderCardById("contact")}
              {activeTab === "education" && renderCardById("education")}
              {activeTab === "goals" && renderCardById("learningGoals")}
            </div>
          </div>
        ) : (
          renderCardLayout(activeLayout)
        )}
      </div>
    </section>
  );
}
