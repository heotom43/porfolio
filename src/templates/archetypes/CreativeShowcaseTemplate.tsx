'use client';

import React from 'react';
import { TemplateShell, ArchetypeTemplateProps } from './TemplateShell';

export function CreativeShowcaseTemplate(props: ArchetypeTemplateProps) {
  return (
    <TemplateShell
      {...props}
      archetypeId="creative-showcase"
      frameVariant="polaroid"
      showSlideNumbers={true}
      navVariant="canva-pills"
    />
  );
}
