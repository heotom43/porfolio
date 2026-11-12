'use client';

import React from 'react';
import { TemplateShell, ArchetypeTemplateProps } from './TemplateShell';

export function TechDeveloperTemplate(props: ArchetypeTemplateProps) {
  return (
    <TemplateShell
      {...props}
      archetypeId="tech-developer"
      frameVariant="macbook-mockup"
      showSlideNumbers={false}
      navVariant="terminal-bar"
    />
  );
}
