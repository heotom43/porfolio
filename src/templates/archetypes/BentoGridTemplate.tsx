'use client';

import React from 'react';
import { TemplateShell, ArchetypeTemplateProps } from './TemplateShell';

export function BentoGridTemplate(props: ArchetypeTemplateProps) {
  return (
    <TemplateShell
      {...props}
      archetypeId="bento-grid"
      frameVariant="rounded-card"
      showSlideNumbers={false}
      navVariant="badge-bar"
    />
  );
}
