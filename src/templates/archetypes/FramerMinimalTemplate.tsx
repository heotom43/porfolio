'use client';

import React from 'react';
import { TemplateShell, ArchetypeTemplateProps } from './TemplateShell';

export function FramerMinimalTemplate(props: ArchetypeTemplateProps) {
  return (
    <TemplateShell
      {...props}
      archetypeId="framer-minimal"
      frameVariant="rounded-card"
      showSlideNumbers={false}
      navVariant="minimal-bar"
    />
  );
}
