'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { EducationSection, TemplateId, ThemeConfig } from '@/schema/portfolio.schema';
import {
  formatSectionEyebrow,
  getCardDecoration,
  getThemeTokens,
} from '@/templates/archetypes/archetypeStyles';

export interface EducationBlockProps {
  section: EducationSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
}

export function EducationBlock({
  section,
  theme,
  archetypeId = 'canva-editorial',
}: EducationBlockProps) {
  const isCanvaEditorial = archetypeId === 'canva-editorial';
  const cardDec = getCardDecoration(archetypeId, theme);
  const tokens = getThemeTokens(theme);
  const isTerminal = archetypeId === 'tech-developer';
  const variant = section.variant ?? 'academic-grid';
  const isTimeline = variant === 'timeline';
  const isCompactList = variant === 'compact-list';
  const layoutClassName = isTimeline
    ? 'relative space-y-5 border-l-2 pl-6'
    : isCompactList
    ? 'divide-y'
    : variant === 'bento'
    ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
    : 'grid grid-cols-1 gap-6 md:grid-cols-2';

  if (isCanvaEditorial) {
    return (
      <section id="education" className="reveal-on-scroll mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h2
            className="font-editorial text-4xl font-extrabold tracking-tight sm:text-5xl"
            style={{ color: 'var(--text, #3E2723)' }}
          >
            {section.title}
          </h2>

          <div
            className={
              isTimeline
                ? 'relative space-y-5 border-l-2 pl-6'
                : isCompactList
                ? 'divide-y'
                : variant === 'bento'
                ? 'grid grid-cols-1 gap-6 md:grid-cols-2'
                : 'grid grid-cols-1 gap-8 md:grid-cols-2'
            }
            style={isTimeline ? { borderColor: `${theme.primaryColor}45` } : undefined}
          >
            {section.items.map((item, idx) => (
              <div
                key={idx}
                className={`relative space-y-2 transition-all duration-300 ${
                  isTimeline
                    ? 'py-2 pl-5'
                    : isCompactList
                    ? 'border-b py-4 last:border-b-0'
                    : 'border-l-2 py-2 pl-5 hover:translate-x-1'
                } ${variant === 'bento' && idx === 0 ? 'md:col-span-2' : ''}`}
                style={{
                  borderColor: 'var(--primary, #735340)',
                }}
              >
                {isTimeline && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-2"
                    style={{
                      backgroundColor: theme.primaryColor,
                      borderColor: theme.backgroundColor,
                    }}
                  />
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: 'var(--text, #3E2723)' }}
                  >
                    {item.school}
                  </h3>
                  <span
                    className="rounded-full border px-3 py-0.5 text-xs font-semibold"
                    style={{
                      borderColor: 'var(--primary, #735340)',
                      color: 'var(--secondary, #5D4037)',
                      backgroundColor: 'var(--surface, #FFF8F0)',
                    }}
                  >
                    {item.period}
                  </span>
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--secondary, #5D4037)' }}
                >
                  {item.degree}
                </p>
                {item.gpaOrHonors && (
                  <p
                    className="text-xs font-semibold"
                    style={{ color: 'var(--primary, #735340)' }}
                  >
                    ✦ {item.gpaOrHonors}
                  </p>
                )}
                {item.details && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text, #3E2723)', opacity: 0.88 }}
                  >
                    {item.details}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div
            className="border-b pt-4"
            style={{ borderColor: 'var(--primary, #735340)', opacity: 0.3 }}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span
          className={`text-xs font-bold uppercase tracking-[0.2em] ${
            isTerminal ? 'font-mono' : ''
          }`}
          style={{ color: theme.primaryColor }}
        >
          {formatSectionEyebrow(archetypeId, '04', 'Academic Background')}
        </span>
        <h2 className="mt-1 font-editorial text-3xl font-bold">{section.title}</h2>
      </div>

      <div
        className={layoutClassName}
        style={isTimeline ? { borderColor: `${theme.primaryColor}45` } : undefined}
      >
        {section.items.map((item, idx) => (
          <div
            key={idx}
            className={`relative ${
              isTimeline
                ? 'py-2 pl-5'
                : isCompactList
                ? 'border-b py-4 last:border-b-0'
                : `p-6 ${cardDec.className}`
            } ${variant === 'bento' && idx === 0 ? 'md:col-span-2' : ''}`}
            style={
              isTimeline
                ? undefined
                : isCompactList
                ? { borderColor: tokens.borderSubtle }
                : cardDec.style
            }
          >
            {isTimeline && (
              <span
                aria-hidden="true"
                className="absolute -left-[7px] top-5 h-3 w-3 rounded-full border-2"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderColor: theme.backgroundColor,
                }}
              />
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{item.school}</h3>
                  <p className="text-sm font-medium opacity-80">{item.degree}</p>
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold opacity-80 ${
                  isTerminal ? 'font-mono' : ''
                }`}
                style={{ borderColor: tokens.borderSubtle }}
              >
                {item.period}
              </span>
            </div>

            {item.gpaOrHonors && (
              <div
                className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${theme.secondaryColor}1C`,
                  color: tokens.isDarkSurface ? theme.primaryColor : theme.secondaryColor,
                }}
              >
                {item.gpaOrHonors}
              </div>
            )}

            {item.details && (
              <p className="mt-3 text-sm leading-relaxed opacity-80">{item.details}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
