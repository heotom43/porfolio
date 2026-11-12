'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';
import type { ExperienceSection, TemplateId, ThemeConfig } from '@/schema/portfolio.schema';
import {
  formatSectionEyebrow,
  getCardDecoration,
  getThemeTokens,
} from '@/templates/archetypes/archetypeStyles';

export interface ExperienceBlockProps {
  section: ExperienceSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
}

export function ExperienceBlock({
  section,
  theme,
  archetypeId = 'canva-editorial',
}: ExperienceBlockProps) {
  const isCanvaEditorial = archetypeId === 'canva-editorial';
  const cardDec = getCardDecoration(archetypeId, theme);
  const tokens = getThemeTokens(theme);
  const isTerminal = archetypeId === 'tech-developer';
  const isTimeline = section.variant === 'vertical-timeline';
  const isCompactList = section.variant === 'compact-list';

  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span
          className={`text-xs font-bold uppercase tracking-[0.2em] ${
            isTerminal ? 'font-mono' : ''
          }`}
          style={{
            color: theme.primaryColor,
          }}
        >
          {formatSectionEyebrow(archetypeId, '03', 'Experience Timeline')}
        </span>
        <h2 className="mt-1 font-editorial text-3xl font-bold">{section.title}</h2>
      </div>

      <div
        className={
          isTimeline
            ? 'relative space-y-6 border-l-2 pl-6'
            : isCompactList
            ? 'space-y-4'
            : 'grid grid-cols-1 gap-6 md:grid-cols-2'
        }
        style={
          isTimeline
            ? {
                borderColor: `${theme.primaryColor}45`,
              }
            : undefined
        }
      >
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`relative ${
              isCanvaEditorial && !isTimeline
                ? 'border-l-2 pl-5 py-2'
                : `p-6 ${cardDec.className}`
            }`}
            style={
              isCanvaEditorial && !isTimeline
                ? { borderColor: theme.primaryColor }
                : cardDec.style
            }
          >
            {isTimeline && (
              <span
                className="absolute -left-[31px] top-7 h-3.5 w-3.5 rounded-full border-2"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderColor: theme.backgroundColor,
                }}
                aria-hidden="true"
              />
            )}

            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{item.role}</h3>
                  <p className="text-xs font-medium opacity-70">{item.organization}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  isTerminal ? 'font-mono' : ''
                }`}
                style={{
                  backgroundColor: `${theme.primaryColor}1A`,
                  color: theme.primaryColor,
                }}
              >
                {item.period}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed opacity-85">{item.description}</p>

            {item.achievements.length > 0 && (
              <ul
                className="mt-3 space-y-1.5 border-t pt-3 text-xs"
                style={{ borderColor: tokens.borderSubtle }}
              >
                {item.achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-start gap-2 opacity-85">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
