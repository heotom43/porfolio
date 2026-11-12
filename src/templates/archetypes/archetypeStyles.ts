import type React from 'react';
import type { TemplateId, ThemeConfig } from '@/schema/portfolio.schema';
import { isDarkColor, type MediaFrameVariant } from '@/components/visual-primitives';

export type ArchetypeNavVariant =
  | 'canva-pills'
  | 'minimal-bar'
  | 'terminal-bar'
  | 'badge-bar';

export type ArchetypeDividerVariant =
  | 'sparkles'
  | 'bento-dots'
  | 'hairline'
  | 'exhibit-bar'
  | 'kpi-rule'
  | 'code-comment';

export interface ArchetypeProfile {
  id: TemplateId;
  badgeLabel: string;
  frameVariant: MediaFrameVariant;
  navVariant: ArchetypeNavVariant;
  showSlideNumbers: boolean;
  slideLabelPrefix: string;
  dividerVariant: ArchetypeDividerVariant;
  wrapperClassName: string;
  alternateProjectMedia: boolean;
  heroLayoutMode: 'editorial' | 'bento' | 'minimal' | 'exhibit' | 'growth' | 'terminal';
}

export const ARCHETYPE_PROFILES: Record<TemplateId, ArchetypeProfile> = {
  'canva-editorial': {
    id: 'canva-editorial',
    badgeLabel: 'Editorial',
    frameVariant: 'rounded-card',
    navVariant: 'canva-pills',
    showSlideNumbers: false,
    slideLabelPrefix: 'Slide',
    dividerVariant: 'sparkles',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'editorial',
  },
  'bento-grid': {
    id: 'bento-grid',
    badgeLabel: 'Bento',
    frameVariant: 'rounded-card',
    navVariant: 'badge-bar',
    showSlideNumbers: false,
    slideLabelPrefix: 'Module',
    dividerVariant: 'bento-dots',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'bento',
  },
  'framer-minimal': {
    id: 'framer-minimal',
    badgeLabel: 'Minimal',
    frameVariant: 'rounded-card',
    navVariant: 'minimal-bar',
    showSlideNumbers: false,
    slideLabelPrefix: 'Section',
    dividerVariant: 'hairline',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'minimal',
  },
  'creative-showcase': {
    id: 'creative-showcase',
    badgeLabel: 'Showcase',
    frameVariant: 'polaroid',
    navVariant: 'canva-pills',
    showSlideNumbers: true,
    slideLabelPrefix: 'Exhibit',
    dividerVariant: 'exhibit-bar',
    wrapperClassName: '',
    alternateProjectMedia: true,
    heroLayoutMode: 'exhibit',
  },
  'growth-marketer': {
    id: 'growth-marketer',
    badgeLabel: 'Growth KPI',
    frameVariant: 'macbook-mockup',
    navVariant: 'badge-bar',
    showSlideNumbers: false,
    slideLabelPrefix: 'Case',
    dividerVariant: 'kpi-rule',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'growth',
  },
  'tech-developer': {
    id: 'tech-developer',
    badgeLabel: '~/dev',
    frameVariant: 'macbook-mockup',
    navVariant: 'terminal-bar',
    showSlideNumbers: false,
    slideLabelPrefix: 'Module',
    dividerVariant: 'code-comment',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'terminal',
  },
  'warm-editorial': {
    id: 'warm-editorial',
    badgeLabel: 'Warm Editorial',
    frameVariant: 'arch-window',
    navVariant: 'canva-pills',
    showSlideNumbers: false,
    slideLabelPrefix: 'Slide',
    dividerVariant: 'sparkles',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'editorial',
  },
  'creative-bold': {
    id: 'creative-bold',
    badgeLabel: 'Creative Bold',
    frameVariant: 'polaroid',
    navVariant: 'canva-pills',
    showSlideNumbers: false,
    slideLabelPrefix: 'Project',
    dividerVariant: 'sparkles',
    wrapperClassName: '',
    alternateProjectMedia: true,
    heroLayoutMode: 'editorial',
  },
  'minimal-chic': {
    id: 'minimal-chic',
    badgeLabel: 'Minimal Chic',
    frameVariant: 'rounded-card',
    navVariant: 'minimal-bar',
    showSlideNumbers: false,
    slideLabelPrefix: 'Section',
    dividerVariant: 'hairline',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'minimal',
  },
  'vibrant-student': {
    id: 'vibrant-student',
    badgeLabel: 'Vibrant Student',
    frameVariant: 'arch-window',
    navVariant: 'canva-pills',
    showSlideNumbers: false,
    slideLabelPrefix: 'Project',
    dividerVariant: 'sparkles',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'editorial',
  },
  'artistic-organic': {
    id: 'artistic-organic',
    badgeLabel: 'Artistic Organic',
    frameVariant: 'cutout-blob',
    navVariant: 'canva-pills',
    showSlideNumbers: false,
    slideLabelPrefix: 'Project',
    dividerVariant: 'sparkles',
    wrapperClassName: '',
    alternateProjectMedia: true,
    heroLayoutMode: 'editorial',
  },
  'academic-presentation': {
    id: 'academic-presentation',
    badgeLabel: 'Academic Presentation',
    frameVariant: 'rounded-card',
    navVariant: 'badge-bar',
    showSlideNumbers: true,
    slideLabelPrefix: 'Slide',
    dividerVariant: 'hairline',
    wrapperClassName: '',
    alternateProjectMedia: false,
    heroLayoutMode: 'editorial',
  },
};

export function getArchetypeProfile(archetypeId?: TemplateId): ArchetypeProfile {
  return ARCHETYPE_PROFILES[archetypeId ?? 'canva-editorial'] ?? ARCHETYPE_PROFILES['canva-editorial'];
}

export function getFontStack(fontName?: string): string {
  switch (fontName) {
    case 'Playfair Display':
      return 'var(--font-heading), "Playfair Display", Georgia, serif';
    case 'Lora':
      return 'var(--font-lora), "Lora", Georgia, serif';
    case 'Merriweather':
      return '"Merriweather", var(--font-lora), Georgia, serif';
    case 'Plus Jakarta Sans':
      return 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif';
    case 'Space Grotesk':
      return '"Space Grotesk", var(--font-jakarta), sans-serif';
    default:
      return 'var(--font-body), "Be Vietnam Pro", system-ui, sans-serif';
  }
}

export interface ThemeTokens {
  isDarkBg: boolean;
  isDarkSurface: boolean;
  borderSubtle: string;
  borderMedium: string;
  positiveAccent: string;
  positiveBg: string;
  mutedTextClass: string;
  cssVariables: Record<string, string>;
  bgClass: string;
  textClass: string;
  cardClass: string;
  accentClass: string;
}

export function getThemeTokens(theme?: Partial<ThemeConfig> | null): ThemeTokens {
  // Respect user theme while preserving canonical Canva Editorial defaults if properties are missing
  const primary = theme?.primaryColor || '#735340';
  const secondary = theme?.secondaryColor || '#5D4037';
  const bg = theme?.backgroundColor || '#FFF3E6';
  const surface = theme?.surfaceColor || '#FFF8F0';
  const text = theme?.textColor || '#3E2723';
  const headingFont = theme?.headingFont || 'Playfair Display';
  const bodyFont = theme?.bodyFont || 'Be Vietnam Pro';

  const isDarkBg = isDarkColor(bg);
  const isDarkSurface = isDarkColor(surface);

  const cssVariables: Record<string, string> = {
    '--primary': primary,
    '--secondary': secondary,
    '--bg': bg,
    '--surface': surface,
    '--text': text,
    '--font-heading': getFontStack(headingFont),
    '--font-body': getFontStack(bodyFont),
  };

  return {
    isDarkBg,
    isDarkSurface,
    borderSubtle: `${text}1A`,
    borderMedium: `${text}2E`,
    positiveAccent: isDarkSurface ? '#34D399' : '#047857',
    positiveBg: isDarkSurface
      ? 'rgba(52, 211, 153, 0.12)'
      : 'rgba(16, 185, 129, 0.10)',
    mutedTextClass: isDarkSurface ? 'text-slate-300' : 'text-stone-600',
    cssVariables,
    bgClass: 'bg-[var(--bg)]',
    textClass: 'text-[var(--text)]',
    cardClass: 'bg-[var(--surface)] text-[var(--text)]',
    accentClass: 'text-[var(--primary)]',
  };
}

export function getRadiusClass(
  borderRadius: ThemeConfig['borderRadius'],
  archetypeId: TemplateId
): string {
  if (borderRadius === 'none') return 'rounded-none';
  if (borderRadius === 'sm' || archetypeId === 'framer-minimal') return 'rounded-xl';
  if (borderRadius === 'md') return 'rounded-2xl';
  if (borderRadius === 'full') return 'rounded-[32px]';
  switch (archetypeId) {
    case 'canva-editorial':
    case 'warm-editorial':
    case 'vibrant-student':
      return 'rounded-[28px]';
    case 'artistic-organic':
      return 'rounded-[32px]';
    case 'minimal-chic':
      return 'rounded-2xl';
    case 'academic-presentation':
      return 'rounded-xl';
    case 'bento-grid':
      return 'rounded-3xl';
    case 'creative-showcase':
    case 'creative-bold':
      return 'rounded-2xl';
    case 'growth-marketer':
    case 'tech-developer':
      return 'rounded-2xl';
    default:
      return 'rounded-3xl';
  }
}

export function getCardDecoration(
  archetypeId: TemplateId,
  theme: ThemeConfig
): { className: string; style: React.CSSProperties } {
  const radius = getRadiusClass(theme.borderRadius, archetypeId);
  const tokens = getThemeTokens(theme);

  switch (archetypeId) {
    case 'bento-grid':
      return {
        className: `${radius} border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: tokens.borderSubtle,
          boxShadow: '0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        },
      };
    case 'framer-minimal':
      return {
        className: `${radius} border transition-colors duration-200`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: tokens.borderSubtle,
        },
      };
    case 'creative-showcase':
      return {
        className: `${radius} border-2 transition-transform duration-300 hover:-translate-y-0.5`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: `${theme.textColor}26`,
          boxShadow: `6px 6px 0px ${theme.primaryColor}26`,
        },
      };
    case 'creative-bold':
      return {
        className: `${radius} border-2 transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-0.5deg]`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: `${theme.primaryColor}40`,
          boxShadow: `4px 4px 0px ${theme.primaryColor}26`,
        },
      };
    case 'minimal-chic':
      return {
        className: `${radius} border transition-colors duration-200 hover:border-slate-400`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: tokens.borderSubtle,
        },
      };
    case 'vibrant-student':
      return {
        className: `${radius} border shadow-sm transition-all duration-200 hover:shadow-md`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: `${theme.primaryColor}2E`,
          borderLeftWidth: '4px',
          borderLeftColor: theme.primaryColor,
        },
      };
    case 'artistic-organic':
      return {
        className: `${radius} border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: `${theme.primaryColor}2B`,
          boxShadow: '0 8px 24px -6px rgba(62, 0, 12, 0.08)',
        },
      };
    case 'academic-presentation':
      return {
        className: `${radius} border shadow-sm transition-all duration-200 hover:shadow-md`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: `${theme.primaryColor}33`,
          borderTopWidth: '3px',
          borderTopColor: theme.primaryColor,
        },
      };
    case 'warm-editorial':
      return {
        className: `${radius} border transition-all duration-200 hover:shadow-sm`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: tokens.borderSubtle,
        },
      };
    case 'growth-marketer':
      return {
        className: `${radius} border shadow-sm transition-shadow duration-200 hover:shadow-md`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: tokens.borderSubtle,
          borderTopWidth: '4px',
          borderTopColor: theme.primaryColor,
        },
      };
    case 'tech-developer':
      return {
        className: `${radius} border transition-all duration-200 hover:shadow-lg`,
        style: {
          backgroundColor: theme.surfaceColor,
          borderColor: `${theme.primaryColor}3D`,
          boxShadow: `0 0 0 1px ${theme.primaryColor}12, 0 10px 30px -15px rgba(0,0,0,0.45)`,
        },
      };
    case 'canva-editorial':
    default:
      return {
        className: 'bg-transparent',
        style: {
          backgroundColor: 'transparent',
        },
      };
  }
}

export function getBackdropStyle(
  archetypeId: TemplateId,
  theme: ThemeConfig
): React.CSSProperties {
  switch (archetypeId) {
    case 'bento-grid':
      return {
        backgroundImage: `radial-gradient(${theme.textColor}14 1.2px, transparent 1.2px)`,
        backgroundSize: '22px 22px',
      };
    case 'creative-showcase':
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}1A 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px',
      };
    case 'growth-marketer':
      return {
        backgroundImage: `linear-gradient(to right, ${theme.primaryColor}0D 1px, transparent 1px), linear-gradient(to bottom, ${theme.primaryColor}0D 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      };
    case 'tech-developer':
      return {
        backgroundImage: `linear-gradient(to right, ${theme.primaryColor}14 1px, transparent 1px), linear-gradient(to bottom, ${theme.primaryColor}14 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      };
    case 'warm-editorial':
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}14 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
      };
    case 'creative-bold':
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}1F 1.5px, transparent 1.5px)`,
        backgroundSize: '26px 26px',
      };
    case 'vibrant-student':
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}1A 1.2px, transparent 1.2px)`,
        backgroundSize: '20px 20px',
      };
    case 'artistic-organic':
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}10 2px, transparent 2px)`,
        backgroundSize: '30px 30px',
      };
    case 'academic-presentation':
      return {
        backgroundImage: `linear-gradient(to right, ${theme.primaryColor}0D 1px, transparent 1px), linear-gradient(to bottom, ${theme.primaryColor}0D 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      };
    case 'minimal-chic':
    case 'framer-minimal':
    case 'canva-editorial':
    default:
      return {};
  }
}

export function formatSectionEyebrow(
  archetypeId: TemplateId,
  indexLabel: string,
  text: string
): string {
  switch (archetypeId) {
    case 'bento-grid':
      return `${indexLabel} // ${text}`;
    case 'framer-minimal':
      return `${indexLabel} — ${text}`;
    case 'creative-showcase':
      return `EXHIBIT • ${text}`;
    case 'growth-marketer':
      return `CASE METRICS • ${text}`;
    case 'tech-developer':
      return `// ${indexLabel}. ${text.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    case 'warm-editorial':
      return `${indexLabel}. ${text}`;
    case 'creative-bold':
      return `★ ${text}`;
    case 'minimal-chic':
      return `${indexLabel} — ${text}`;
    case 'vibrant-student':
      return `PROJECT ${indexLabel} // ${text}`;
    case 'artistic-organic':
      return `~ ${text} ~`;
    case 'academic-presentation':
      return `RESEARCH ${indexLabel} • ${text}`;
    case 'canva-editorial':
    default:
      return text;
  }
}
