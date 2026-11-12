'use client';

import React from 'react';
import type { PortfolioDocument } from '@/schema/portfolio.schema';
import {
  CanvaEditorialTemplate,
  BentoGridTemplate,
  FramerMinimalTemplate,
  CreativeShowcaseTemplate,
  GrowthMarketerTemplate,
  TechDeveloperTemplate,
  TemplateShell,
} from '@/templates/archetypes';

export interface PortfolioRendererProps {
  document: PortfolioDocument;
  editable?: boolean;
  activeSectionIndex?: number | null;
  onSelectSection?: (index: number) => void;
  onRegenerateProjectImage?: (
    projectId: string,
    customPrompt?: string
  ) => Promise<void>;
  onSwitchProjectImageSource?: (
    projectId: string,
    mode: 'docx' | 'ai'
  ) => void;
  generatingProjectId?: string | null;
}

export function PortfolioRenderer({
  document,
  editable = false,
  activeSectionIndex = null,
  onSelectSection,
  onRegenerateProjectImage,
  onSwitchProjectImageSource,
  generatingProjectId = null,
}: PortfolioRendererProps) {
  const sharedProps = {
    document,
    editable,
    activeSectionIndex,
    onSelectSection,
    onRegenerateProjectImage,
    onSwitchProjectImageSource,
    generatingProjectId,
  };

  switch (document.templateId) {
    case 'canva-editorial':
      return <CanvaEditorialTemplate {...sharedProps} />;
    case 'bento-grid':
      return <BentoGridTemplate {...sharedProps} />;
    case 'framer-minimal':
      return <FramerMinimalTemplate {...sharedProps} />;
    case 'creative-showcase':
      return <CreativeShowcaseTemplate {...sharedProps} />;
    case 'growth-marketer':
      return <GrowthMarketerTemplate {...sharedProps} />;
    case 'tech-developer':
      return <TechDeveloperTemplate {...sharedProps} />;
    case 'warm-editorial':
    case 'creative-bold':
    case 'minimal-chic':
    case 'vibrant-student':
    case 'artistic-organic':
    case 'academic-presentation':
      return <TemplateShell {...sharedProps} archetypeId={document.templateId} />;
    default:
      return <CanvaEditorialTemplate {...sharedProps} />;
  }
}
