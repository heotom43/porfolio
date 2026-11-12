'use client';

import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import tuthivananhPreset from '@/data/presets/tuthivananh-sample.json';
import {
  PortfolioDocumentSchema,
  type PortfolioDocument,
  type PortfolioSection,
  type ProjectItem,
  type ProjectMediaItem,
  type TemplateId,
  type ThemeConfig,
  type VisualStyle,
  type ProfileOwner,
  type VisualEffectsConfig,
  type BackgroundIllustrationConfig,
  type HeroSection,
  type AboutSection,
  type SkillsSection,
} from '@/schema/portfolio.schema';
import type { SummarizeAssignmentsResponse } from '@/schema/docx-ingestion.schema';
import { THEME_PRESETS, resolveThemeFromContext } from '@/schema/theme.schema';

const PARSED_PRESET_DOC = PortfolioDocumentSchema.parse(tuthivananhPreset);

/**
 * Fixed Canva reference theme from https://tntlab.my.canva.site/tuthivananhportfolio/
 * (#FFF3E6 cream background, #3E2723 espresso text, #735340 & #5D4037 cocoa accents).
 */
export const CANVA_REFERENCE_THEME: ThemeConfig = {
  ...PARSED_PRESET_DOC.theme,
  primaryColor: '#735340',
  secondaryColor: '#5D4037',
  backgroundColor: '#FFF3E6',
  surfaceColor: '#FFFFFF',
  textColor: '#3E2723',
};

const heroSecForInitial = PARSED_PRESET_DOC.sections.find(
  (s): s is HeroSection => s.type === 'hero'
);

const INITIAL_DOC: PortfolioDocument = {
  ...PARSED_PRESET_DOC,
  templateId: 'canva-editorial',
  theme: { ...CANVA_REFERENCE_THEME },
  profileOwner: PARSED_PRESET_DOC.profileOwner ?? {
    fullName: heroSecForInitial?.fullName ?? 'Từ Thị Vân Anh',
    roleTitle: heroSecForInitial?.roleTitle ?? 'Sinh viên Sư phạm Âm nhạc',
    avatarUrl: heroSecForInitial?.avatar.url ?? '',
    avatarSourceType: heroSecForInitial?.avatar.sourceType ?? 'user-uploaded',
    frameStyle: (heroSecForInitial?.avatar.frameStyle as ProfileOwner['frameStyle']) ?? 'arch-window',
    aspectRatio: (heroSecForInitial?.avatar.aspectRatio as ProfileOwner['aspectRatio']) ?? '3/4',
    bioSnippet: heroSecForInitial?.shortBio,
  },
};

function extractDocxPoolFromDoc(
  doc: PortfolioDocument
): Record<string, ProjectMediaItem[]> {
  const pool: Record<string, ProjectMediaItem[]> = {};
  for (const sec of doc.sections) {
    if (sec.type !== 'projects') continue;
    for (const proj of sec.projects) {
      const docxMedia = proj.media.filter(
        (m) => m.sourceType === 'docx-extracted'
      );
      if (docxMedia.length > 0) {
        pool[proj.id] = docxMedia;
      }
    }
  }
  return pool;
}

const INITIAL_DOCX_POOL = extractDocxPoolFromDoc(INITIAL_DOC);

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface PortfolioStoreState {
  document: PortfolioDocument;
  history: PortfolioDocument[];
  future: PortfolioDocument[];
  activeSectionIndex: number | null;
  selectedProjectId: string | null;
  viewportMode: ViewportMode;
  generatingProjectId: string | null;
  docxExtractedPool: Record<string, ProjectMediaItem[]>;
  isSaving: boolean;
  lastSavedAt: string | null;

  setDocument: (doc: PortfolioDocument) => void;
  setActiveSectionIndex: (index: number | null) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  setViewportMode: (mode: ViewportMode) => void;

  updateTheme: (partial: Partial<ThemeConfig>) => void;
  applyThemePreset: (presetId: string) => void;
  setTemplateId: (templateId: TemplateId) => void;
  setSlugAndSeo: (slug: string, title?: string) => void;

  reorderSections: (oldIndex: number, newIndex: number) => void;
  reorderProjects: (sectionIndex: number, oldIndex: number, newIndex: number) => void;
  reorderSkills: (
    sectionIndex: number,
    oldIndex: number,
    newIndex: number,
    categoryIndex?: number
  ) => void;
  reorderHighlights: (sectionIndex: number, oldIndex: number, newIndex: number) => void;
  reorderProjectMedia: (
    projectId: string,
    oldIndex: number,
    newIndex: number
  ) => void;
  reorderAboutCards: (oldIndex: number, newIndex: number) => void;
  swapHeroLayout: () => void;
  swapAboutLayout: () => void;
  swapProjectLayout: (projectId: string) => void;
  updateSectionVariant: (sectionIndex: number, variant: string) => void;
  updateProfileOwner: (owner: Partial<ProfileOwner>) => void;
  updateThemeEffects: (effects: Partial<VisualEffectsConfig>) => void;
  updateBackgroundIllustration: (bg: Partial<BackgroundIllustrationConfig>) => void;
  updateProjectItem: (
    sectionIndex: number,
    projectIndex: number,
    item: Partial<ProjectItem>
  ) => void;

  updateSection: (index: number, nextSection: PortfolioSection) => void;
  updateProject: (projectId: string, partial: Partial<ProjectItem>) => void;
  setProjectMedia: (projectId: string, media: ProjectMediaItem[]) => void;

  applyDocxSummaryToPortfolio: (params: {
    summary: SummarizeAssignmentsResponse;
    studentAvatarUrl?: string;
    studentEmail?: string;
    imageMode: 'docx-extract' | 'hybrid-auto' | 'ai-generate-all';
    visualStyle: VisualStyle;
    docxImagesPool?: Record<string, ProjectMediaItem[]>;
  }) => void;

  regenerateProjectAiImage: (
    projectId: string,
    customPrompt?: string,
    visualStyleOverride?: VisualStyle
  ) => Promise<void>;
  switchProjectImageSource: (projectId: string, mode: 'docx' | 'ai') => void;
  savePortfolioToServer: () => Promise<{ ok: boolean; slug: string; error?: string }>;

  undo: () => void;
  redo: () => void;
  resetToPreset: () => void;
  restoreCanvaOriginal: () => void;
}

let lastEditKey = '';
let lastEditTimestamp = 0;

function pushHistory(
  state: PortfolioStoreState,
  nextDoc: PortfolioDocument,
  coalesceKey?: string
): Partial<PortfolioStoreState> {
  const now = Date.now();
  const shouldCoalesce =
    Boolean(coalesceKey) &&
    coalesceKey === lastEditKey &&
    now - lastEditTimestamp < 800 &&
    state.history.length > 0;

  lastEditKey = coalesceKey ?? '';
  lastEditTimestamp = coalesceKey ? now : 0;

  if (shouldCoalesce) {
    return {
      future: [],
      document: nextDoc,
    };
  }

  return {
    history: [...state.history.slice(-39), state.document],
    future: [],
    document: nextDoc,
  };
}

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  document: INITIAL_DOC,
  history: [],
  future: [],
  activeSectionIndex: 0,
  selectedProjectId:
    INITIAL_DOC.sections.find((s) => s.type === 'projects')?.projects[0]?.id ??
    null,
  viewportMode: 'desktop',
  generatingProjectId: null,
  docxExtractedPool: INITIAL_DOCX_POOL,
  isSaving: false,
  lastSavedAt: null,

  setDocument: (doc) =>
    set((state) => pushHistory(state, doc)),

  setActiveSectionIndex: (index) => set({ activeSectionIndex: index }),

  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

  setViewportMode: (mode) => set({ viewportMode: mode }),

  updateTheme: (partial) =>
    set((state) =>
      pushHistory(
        state,
        {
          ...state.document,
          theme: { ...state.document.theme, ...partial },
        },
        `theme:${Object.keys(partial).sort().join(',')}`
      )
    ),

  applyThemePreset: (presetId) =>
    set((state) => {
      const preset = THEME_PRESETS.find((p) => p.id === presetId);
      if (!preset) return state;
      const nextTheme =
        preset.id === 'canva-editorial-pastel'
          ? { ...CANVA_REFERENCE_THEME }
          : { ...preset.theme };
      return pushHistory(state, {
        ...state.document,
        templateId: preset.templateId,
        imageGenerationConfig: {
          ...state.document.imageGenerationConfig,
          visualStyle: preset.recommendedVisualStyle,
        },
        theme: nextTheme,
      });
    }),

  setTemplateId: (templateId) =>
    set((state) => {
      const matchingPreset = THEME_PRESETS.find((p) => p.templateId === templateId);
      const nextTheme =
        templateId === 'canva-editorial'
          ? { ...CANVA_REFERENCE_THEME }
          : matchingPreset
          ? { ...matchingPreset.theme }
          : state.document.theme;
      return pushHistory(state, {
        ...state.document,
        templateId,
        theme: nextTheme,
      });
    }),

  setSlugAndSeo: (slug, title) =>
    set((state) =>
      pushHistory(
        state,
        {
          ...state.document,
          slug:
            slug
              .toLowerCase()
              .replace(/[^a-z0-9-_]/g, '') || state.document.slug,
          seo: {
            ...state.document.seo,
            title: title ?? state.document.seo.title,
          },
        },
        'slugAndSeo'
      )
    ),

  reorderSections: (oldIndex, newIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return state;
      const nextSections = arrayMove(state.document.sections, oldIndex, newIndex);
      return {
        ...pushHistory(state, {
          ...state.document,
          sections: nextSections,
        }),
        activeSectionIndex: newIndex,
      };
    }),

  reorderProjects: (sectionIndex, oldIndex, newIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return state;
      const targetSec = state.document.sections[sectionIndex];
      if (!targetSec || targetSec.type !== 'projects') return state;
      const nextProjects = arrayMove(targetSec.projects, oldIndex, newIndex);
      const nextSections = [...state.document.sections];
      nextSections[sectionIndex] = {
        ...targetSec,
        projects: nextProjects,
      };
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `reorderProjects:${sectionIndex}`
      );
    }),

  reorderSkills: (sectionIndex, oldIndex, newIndex, categoryIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return state;
      const targetSec = state.document.sections[sectionIndex];
      if (!targetSec || targetSec.type !== 'skills') return state;

      const nextSections = [...state.document.sections];
      if (categoryIndex !== undefined) {
        const cat = targetSec.categories[categoryIndex];
        if (!cat) return state;
        const nextSkills = arrayMove(cat.skills, oldIndex, newIndex);
        const nextCategories = [...targetSec.categories];
        nextCategories[categoryIndex] = { ...cat, skills: nextSkills };
        nextSections[sectionIndex] = { ...targetSec, categories: nextCategories };
      } else {
        const nextCategories = arrayMove(targetSec.categories, oldIndex, newIndex);
        nextSections[sectionIndex] = { ...targetSec, categories: nextCategories };
      }

      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `reorderSkills:${sectionIndex}:${categoryIndex ?? 'cats'}`
      );
    }),

  reorderHighlights: (sectionIndex, oldIndex, newIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return state;
      const targetSec = state.document.sections[sectionIndex];
      if (!targetSec || targetSec.type !== 'about') return state;
      const nextHighlights = arrayMove(targetSec.highlights, oldIndex, newIndex);
      const nextSections = [...state.document.sections];
      nextSections[sectionIndex] = {
        ...targetSec,
        highlights: nextHighlights,
      };
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `reorderHighlights:${sectionIndex}`
      );
    }),

  reorderProjectMedia: (projectId, oldIndex, newIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return state;
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'projects') return sec;
        const nextProjects = sec.projects.map((proj) => {
          if (proj.id !== projectId) return proj;
          return {
            ...proj,
            media: arrayMove(proj.media, oldIndex, newIndex),
          };
        });
        return { ...sec, projects: nextProjects };
      });
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `reorderProjectMedia:${projectId}`
      );
    }),

  reorderAboutCards: (oldIndex, newIndex) =>
    set((state) => {
      if (oldIndex === newIndex) return state;
      const targetSec = state.document.sections.find(
        (s): s is AboutSection => s.type === 'about'
      );
      if (!targetSec) return state;
      const currentOrder = targetSec.cardOrder ?? [
        'contact',
        'education',
        'learningGoals',
      ];
      const visibleOrder = currentOrder.filter((cardId) =>
        ['contact', 'education', 'learningGoals'].includes(cardId)
      );
      const nextOrder = arrayMove(visibleOrder, oldIndex, newIndex);
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'about') return sec;
        return { ...sec, cardOrder: nextOrder };
      });
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        'reorderAboutCards'
      );
    }),

  swapHeroLayout: () =>
    set((state) => {
      const targetSec = state.document.sections.find(
        (s): s is HeroSection => s.type === 'hero'
      );
      if (!targetSec) return state;
      const nextInverted = !(targetSec.layoutInverted ?? false);
      const nextPosition: 'left' | 'right' =
        targetSec.mediaPosition === 'left' ? 'right' : 'left';
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'hero') return sec;
        return {
          ...sec,
          layoutInverted: nextInverted,
          mediaPosition: nextPosition,
        };
      });
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        'swapHeroLayout'
      );
    }),

  swapAboutLayout: () =>
    set((state) => {
      const targetSec = state.document.sections.find(
        (s): s is AboutSection => s.type === 'about'
      );
      if (!targetSec) return state;
      const nextInverted = !(targetSec.layoutInverted ?? false);
      const nextPosition: 'left' | 'right' =
        targetSec.mediaPosition === 'left' ? 'right' : 'left';
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'about') return sec;
        return {
          ...sec,
          layoutInverted: nextInverted,
          mediaPosition: nextPosition,
        };
      });
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        'swapAboutLayout'
      );
    }),

  swapProjectLayout: (projectId) =>
    set((state) => {
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'projects') return sec;
        const nextProjects = sec.projects.map((proj) => {
          if (proj.id !== projectId) return proj;
          const nextInverted = !(proj.layoutInverted ?? false);
          const nextPosition: 'left' | 'right' =
            proj.mediaPosition === 'left' ? 'right' : 'left';
          return {
            ...proj,
            layoutInverted: nextInverted,
            mediaPosition: nextPosition,
          };
        });
        return { ...sec, projects: nextProjects };
      });
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `swapProjectLayout:${projectId}`
      );
    }),

  updateSectionVariant: (sectionIndex, variant) =>
    set((state) => {
      const targetSec = state.document.sections[sectionIndex];
      if (!targetSec || !('variant' in targetSec)) return state;
      const nextSections = [...state.document.sections];
      nextSections[sectionIndex] = {
        ...targetSec,
        variant,
      } as PortfolioSection;
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `updateSectionVariant:${sectionIndex}`
      );
    }),

  updateProfileOwner: (owner) =>
    set((state) => {
      const heroSec = state.document.sections.find((s): s is HeroSection => s.type === 'hero');
      const aboutSec = state.document.sections.find((s): s is AboutSection => s.type === 'about');

      const currentOwner: ProfileOwner = state.document.profileOwner ?? {
        fullName: heroSec?.fullName ?? 'Từ Thị Vân Anh',
        roleTitle: heroSec?.roleTitle ?? 'Sinh viên Sư phạm Âm nhạc',
        avatarUrl: heroSec?.avatar.url ?? '',
        avatarSourceType: heroSec?.avatar.sourceType ?? 'user-uploaded',
        frameStyle: (heroSec?.avatar.frameStyle as ProfileOwner['frameStyle']) ?? 'arch-window',
        aspectRatio: (heroSec?.avatar.aspectRatio as ProfileOwner['aspectRatio']) ?? '3/4',
        bioSnippet: heroSec?.shortBio,
        learningGoals: aboutSec?.learningGoals,
        portfolioObjective: aboutSec?.portfolioObjective,
        introVideoUrl: aboutSec?.introVideoUrl,
      };

      const nextOwner: ProfileOwner = {
        ...currentOwner,
        ...owner,
      };

      // Synchronize with hero section and about section for backward compatibility
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type === 'hero') {
          return {
            ...sec,
            fullName: nextOwner.fullName ?? sec.fullName,
            roleTitle: nextOwner.roleTitle ?? sec.roleTitle,
            shortBio: nextOwner.bioSnippet ?? sec.shortBio,
          };
        }
        if (sec.type === 'about') {
          return {
            ...sec,
            learningGoals: nextOwner.learningGoals ?? sec.learningGoals,
            portfolioObjective: nextOwner.portfolioObjective ?? sec.portfolioObjective,
            introVideoUrl: nextOwner.introVideoUrl ?? sec.introVideoUrl,
          };
        }
        return sec;
      });

      return pushHistory(
        state,
        {
          ...state.document,
          profileOwner: nextOwner,
          sections: nextSections,
        },
        `profileOwner:${Object.keys(owner).sort().join(',')}`
      );
    }),

  updateThemeEffects: (effects) =>
    set((state) => {
      const currentEffects: VisualEffectsConfig = state.document.theme.effects ?? {
        enableFloat: false,
        enableGlow: false,
        enableTilt: false,
        enableSparkles: true,
        revealVariant: 'fade-up',
        enableParallax: false,
      };
      const nextEffects: VisualEffectsConfig = {
        ...currentEffects,
        ...effects,
      };
      return pushHistory(
        state,
        {
          ...state.document,
          theme: {
            ...state.document.theme,
            effects: nextEffects,
          },
        },
        `themeEffects:${Object.keys(effects).sort().join(',')}`
      );
    }),

  updateBackgroundIllustration: (bg) =>
    set((state) => {
      const currentBg: BackgroundIllustrationConfig = state.document.theme.backgroundIllustration ?? {
        mode: 'none',
        presetId: 'none',
        opacity: 0.15,
        blur: 0,
        position: 'cover',
      };
      const nextBg: BackgroundIllustrationConfig = {
        ...currentBg,
        ...bg,
      };
      return pushHistory(
        state,
        {
          ...state.document,
          theme: {
            ...state.document.theme,
            backgroundIllustration: nextBg,
          },
        },
        `backgroundIllustration:${Object.keys(bg).sort().join(',')}`
      );
    }),

  updateProjectItem: (sectionIndex, projectIndex, item) =>
    set((state) => {
      const targetSec = state.document.sections[sectionIndex];
      if (!targetSec || targetSec.type !== 'projects') return state;
      const targetProject = targetSec.projects[projectIndex];
      if (!targetProject) return state;

      const nextProjects = [...targetSec.projects];
      nextProjects[projectIndex] = {
        ...targetProject,
        ...item,
      };

      const nextSections = [...state.document.sections];
      nextSections[sectionIndex] = {
        ...targetSec,
        projects: nextProjects,
      };

      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `projectItem:${sectionIndex}:${projectIndex}:${Object.keys(item).sort().join(',')}`
      );
    }),

  updateSection: (index, nextSection) =>
    set((state) => {
      const nextSections = [...state.document.sections];
      nextSections[index] = nextSection;
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `section:${index}:${nextSection.type}`
      );
    }),

  updateProject: (projectId, partial) =>
    set((state) => {
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'projects') return sec;
        return {
          ...sec,
          projects: sec.projects.map((p) =>
            p.id === projectId ? { ...p, ...partial } : p
          ),
        };
      });
      return pushHistory(
        state,
        {
          ...state.document,
          sections: nextSections,
        },
        `project:${projectId}:${Object.keys(partial).sort().join(',')}`
      );
    }),

  setProjectMedia: (projectId, media) =>
    set((state) => {
      const nextSections = state.document.sections.map((sec) => {
        if (sec.type !== 'projects') return sec;
        return {
          ...sec,
          projects: sec.projects.map((p) =>
            p.id === projectId ? { ...p, media } : p
          ),
        };
      });
      return pushHistory(state, {
        ...state.document,
        sections: nextSections,
      });
    }),

  applyDocxSummaryToPortfolio: ({
    summary,
    studentAvatarUrl,
    studentEmail,
    imageMode,
    visualStyle,
    docxImagesPool = {},
  }) =>
    set((state) => {
      const slugBase = summary.fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const nextSlug = slugBase ? `${slugBase}portfolio` : INITIAL_DOC.slug;

      // Always map from INITIAL_DOC.sections so section order, variants, decorations,
      // ctaButtons, and Canva cover headline ("Digital Portfolio") stay 100% locked
      const nextSections = INITIAL_DOC.sections.map((refSec) => {
        if (refSec.type === 'hero') {
          return {
            ...refSec,
            variant: refSec.variant,
            headline: 'Digital Portfolio',
            fullName: summary.fullName,
            roleTitle: summary.roleTitle,
            shortBio: summary.shortBio,
            quickTags: summary.quickTags,
            ctaButtons: refSec.ctaButtons,
            decorations: refSec.decorations,
            avatar: studentAvatarUrl
              ? {
                  ...refSec.avatar,
                  url: studentAvatarUrl,
                  sourceType: 'user-uploaded' as const,
                }
              : refSec.avatar,
          };
        }
        if (refSec.type === 'about') {
          return {
            ...refSec,
            variant: refSec.variant,
            biography: summary.biography,
            highlights: summary.highlights,
            contactInfo: studentEmail
              ? { ...refSec.contactInfo, email: studentEmail }
              : refSec.contactInfo,
          };
        }
        if (refSec.type === 'skills') {
          return {
            ...refSec,
            variant: refSec.variant,
            categories: summary.skills,
          };
        }
        if (refSec.type === 'projects') {
          return {
            ...refSec,
            variant: refSec.variant,
            projects: summary.projects,
          };
        }
        return refSec;
      });

      const projectsSecIdx = nextSections.findIndex((s) => s.type === 'projects');

      const studentTheme: ThemeConfig =
        summary.suggestedTheme ||
        resolveThemeFromContext([
          summary.roleTitle,
          ...summary.quickTags,
          ...summary.projects.map((p) => p.category),
          ...summary.projects.map((p) => p.title),
        ]);

      return {
        ...pushHistory(state, {
          ...INITIAL_DOC,
          id: state.document.id,
          slug: nextSlug,
          templateId: 'canva-editorial',
          theme: studentTheme,
          imageGenerationConfig: {
            mode: imageMode,
            visualStyle,
          },
          seo: {
            ...INITIAL_DOC.seo,
            title: `${summary.fullName} | Digital Portfolio`,
            description: summary.shortBio,
          },
          sections: nextSections,
        }),
        docxExtractedPool: {
          ...state.docxExtractedPool,
          ...docxImagesPool,
        },
        selectedProjectId: summary.projects[0]?.id ?? null,
        activeSectionIndex: projectsSecIdx >= 0 ? projectsSecIdx : 0,
      };
    }),

  regenerateProjectAiImage: async (
    projectId,
    customPrompt,
    visualStyleOverride
  ) => {
    const { document } = get();
    const projectSection = document.sections.find((s) => s.type === 'projects');
    if (!projectSection || projectSection.type !== 'projects') return;
    const project = projectSection.projects.find((p) => p.id === projectId);
    if (!project) return;

    set({ generatingProjectId: projectId });
    try {
      const resolvedPrompt =
        customPrompt?.trim() ||
        project.suggestedAiImagePrompt?.trim() ||
        undefined;
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: project.title,
          assignmentSummary: project.summary,
          customPrompt: resolvedPrompt,
          visualStyle:
            visualStyleOverride ||
            project.preferredImageStyle ||
            document.imageGenerationConfig.visualStyle,
          themeColors: {
            primaryColor: document.theme.primaryColor,
            backgroundColor: document.theme.backgroundColor,
          },
          aspectRatio: '4:3',
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        url: string;
        promptUsed: string;
      };

      const newMediaItem: ProjectMediaItem = {
        id: `ai-${Date.now()}`,
        url: data.url,
        caption: `Ảnh AI minh họa: ${project.title}`,
        sourceType: 'ai-generated',
        aiPromptUsed: data.promptUsed,
      };

      // Keep any existing DOCX images in secondary slots, place fresh AI image first
      const existingDocx = project.media.filter(
        (m) => m.sourceType === 'docx-extracted'
      );
      get().setProjectMedia(projectId, [newMediaItem, ...existingDocx]);
    } finally {
      set({ generatingProjectId: null });
    }
  },

  switchProjectImageSource: (projectId, mode) => {
    const state = get();
    const projectsSecIdx = state.document.sections.findIndex(
      (s) => s.type === 'projects'
    );
    const projectSection =
      projectsSecIdx >= 0 ? state.document.sections[projectsSecIdx] : undefined;
    if (!projectSection || projectSection.type !== 'projects') return;
    const project = projectSection.projects.find((p) => p.id === projectId);
    if (!project) return;

    const poolDocx = state.docxExtractedPool[projectId] ?? [];
    const currentMedia = project.media;

    if (mode === 'docx') {
      const docxItems = currentMedia.filter(
        (m) => m.sourceType === 'docx-extracted'
      );
      const mergedDocx = [
        ...docxItems,
        ...poolDocx.filter((p) => !docxItems.some((d) => d.url === p.url)),
      ];
      if (mergedDocx.length > 0) {
        const others = currentMedia.filter(
          (m) => m.sourceType !== 'docx-extracted'
        );
        // Rotate to next DOCX image if the lead image is already DOCX and multiple exist
        const orderedDocx =
          currentMedia[0]?.sourceType === 'docx-extracted' &&
          mergedDocx.length > 1
            ? [...mergedDocx.slice(1), mergedDocx[0]]
            : mergedDocx;
        state.setProjectMedia(projectId, [...orderedDocx, ...others]);
      } else {
        set({
          selectedProjectId: projectId,
          activeSectionIndex:
            projectsSecIdx >= 0 ? projectsSecIdx : state.activeSectionIndex,
        });
      }
    } else {
      const aiItems = currentMedia.filter((m) => m.sourceType === 'ai-generated');
      if (aiItems.length > 0) {
        const others = currentMedia.filter(
          (m) => m.sourceType !== 'ai-generated'
        );
        state.setProjectMedia(projectId, [...aiItems, ...others]);
      } else {
        void state.regenerateProjectAiImage(projectId);
      }
    }
  },

  savePortfolioToServer: async () => {
    const { document } = get();
    set({ isSaving: true });
    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      if (!res.ok) {
        const err = await res.text();
        return { ok: false, slug: document.slug, error: err };
      }
      set({ lastSavedAt: new Date().toISOString() });
      return { ok: true, slug: document.slug };
    } catch (error) {
      return {
        ok: false,
        slug: document.slug,
        error: error instanceof Error ? error.message : 'Save error',
      };
    } finally {
      set({ isSaving: false });
    }
  },

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      lastEditKey = '';
      const previous = state.history[state.history.length - 1];
      const clampedIndex =
        state.activeSectionIndex !== null
          ? Math.min(state.activeSectionIndex, Math.max(previous.sections.length - 1, 0))
          : null;
      return {
        document: previous,
        history: state.history.slice(0, -1),
        future: [state.document, ...state.future],
        activeSectionIndex: clampedIndex,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      lastEditKey = '';
      const next = state.future[0];
      const clampedIndex =
        state.activeSectionIndex !== null
          ? Math.min(state.activeSectionIndex, Math.max(next.sections.length - 1, 0))
          : null;
      return {
        document: next,
        history: [...state.history, state.document],
        future: state.future.slice(1),
        activeSectionIndex: clampedIndex,
      };
    }),

  resetToPreset: () =>
    set((state) => ({
      ...pushHistory(state, INITIAL_DOC),
      activeSectionIndex: 0,
      selectedProjectId:
        INITIAL_DOC.sections.find((s) => s.type === 'projects')?.projects[0]
          ?.id ?? null,
      docxExtractedPool: {
        ...state.docxExtractedPool,
        ...INITIAL_DOCX_POOL,
      },
    })),

  restoreCanvaOriginal: () =>
    set((state) => {
      const restoredSections: PortfolioSection[] = INITIAL_DOC.sections.map(
        (refSec) => {
          const currentSec = state.document.sections.find(
            (s) => s.type === refSec.type
          );
          if (!currentSec) return refSec;

          if (refSec.type === 'hero' && currentSec.type === 'hero') {
            return {
              ...refSec,
              headline: 'Digital Portfolio',
              fullName: currentSec.fullName,
              roleTitle: currentSec.roleTitle,
              shortBio: currentSec.shortBio,
              quickTags: currentSec.quickTags,
              avatar: {
                ...refSec.avatar,
                url: currentSec.avatar.url,
                sourceType: currentSec.avatar.sourceType,
              },
            };
          }
          if (refSec.type === 'about' && currentSec.type === 'about') {
            return {
              ...refSec,
              biography: currentSec.biography,
              highlights: currentSec.highlights,
              contactInfo: currentSec.contactInfo,
            };
          }
          if (refSec.type === 'skills' && currentSec.type === 'skills') {
            return {
              ...refSec,
              categories: currentSec.categories,
            };
          }
          if (refSec.type === 'projects' && currentSec.type === 'projects') {
            return {
              ...refSec,
              projects: currentSec.projects,
            };
          }
          if (refSec.type === 'experience' && currentSec.type === 'experience') {
            return {
              ...refSec,
              items: currentSec.items,
            };
          }
          if (refSec.type === 'education' && currentSec.type === 'education') {
            return {
              ...refSec,
              items: currentSec.items,
            };
          }
          if (refSec.type === 'contact' && currentSec.type === 'contact') {
            return {
              ...refSec,
              subtitle: currentSec.subtitle,
              thankYouMessage: currentSec.thankYouMessage,
            };
          }
          return refSec;
        }
      );

      return {
        ...pushHistory(state, {
          ...state.document,
          templateId: 'canva-editorial',
          imageGenerationConfig: {
            ...state.document.imageGenerationConfig,
            visualStyle: 'canva-pastel-graphic',
          },
          theme: { ...CANVA_REFERENCE_THEME },
          sections: restoredSections,
        }),
        activeSectionIndex: 0,
      };
    }),
}));
