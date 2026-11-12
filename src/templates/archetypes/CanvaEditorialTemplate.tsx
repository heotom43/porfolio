'use client';

import React from 'react';
import { TemplateShell, ArchetypeTemplateProps } from './TemplateShell';

export function CanvaEditorialTemplate(props: ArchetypeTemplateProps) {
  return (
    <TemplateShell
      {...props}
      archetypeId="canva-editorial"
      frameVariant="rounded-card"
      wrapperClassName=""
      showSlideNumbers={false}
      navVariant="canva-pills"
    />
  );
}
