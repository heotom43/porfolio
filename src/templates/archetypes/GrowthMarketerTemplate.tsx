'use client';

import React from 'react';
import { TemplateShell, ArchetypeTemplateProps } from './TemplateShell';

export function GrowthMarketerTemplate(props: ArchetypeTemplateProps) {
  return (
    <TemplateShell
      {...props}
      archetypeId="growth-marketer"
      frameVariant="macbook-mockup"
      showSlideNumbers={false}
      navVariant="badge-bar"
    />
  );
}
