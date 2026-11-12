'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import type { SkillsSection, TemplateId, ThemeConfig } from '@/schema/portfolio.schema';
import {
  formatSectionEyebrow,
  getCardDecoration,
  getThemeTokens,
} from '@/templates/archetypes/archetypeStyles';
import { CanvaFourPointStar } from './CanvaOrnaments';

export interface SkillsBlockProps {
  section: SkillsSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
}

export function SkillsBlock({
  section,
  theme,
  archetypeId = 'canva-editorial',
}: SkillsBlockProps) {
  const isCanvaEditorial = archetypeId === 'canva-editorial';
  const cardDec = getCardDecoration(archetypeId, theme);
  const tokens = getThemeTokens(theme);
  const isMinimal = archetypeId === 'framer-minimal';
  const isTerminal = archetypeId === 'tech-developer';

  const showBars =
    section.variant === 'progress-bars' || section.variant === 'canva-visual-grid';

  const renderIconBadges = (
    skills: SkillsSection['categories'][number]['skills']
  ) => (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {skills.map((skill, idx) => (
        <div
          key={idx}
          className="flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium"
          style={{
            borderColor: tokens.borderSubtle,
            backgroundColor: theme.surfaceColor,
          }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg text-white"
            style={{ backgroundColor: idx % 2 === 0 ? theme.primaryColor : theme.secondaryColor }}
          >
            {skill.iconUrl ? (
              <img src={skill.iconUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 break-words">{skill.name}</span>
        </div>
      ))}
    </div>
  );

  if (isCanvaEditorial) {
    return (
      <section id="skills" className="reveal-on-scroll mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-7">
          {/* Decorative stars remain separate from user-managed skill items. */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="font-editorial text-4xl font-extrabold tracking-tight sm:text-5xl"
                style={{ color: 'var(--text, #3E2723)' }}
              >
                {section.title}
              </h2>
            </div>

            <div className="ml-2 hidden items-center gap-3 sm:flex">
              <CanvaFourPointStar className="h-5 w-5" color="var(--primary, #735340)" />
              <CanvaFourPointStar className="h-6 w-6" color="var(--primary, #735340)" />
              <CanvaFourPointStar className="h-5 w-5" color="var(--primary, #735340)" />
            </div>
          </div>

          {/* Unboxed editorial columns directly on paper */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {section.categories.map((cat, idx) => (
              <div
                key={idx}
                className="reveal-on-scroll space-y-4 border-t pt-4"
                style={{
                  borderColor: 'var(--primary, #735340)',
                  transitionDelay: `${idx * 100}ms`,
                }}
              >
                <h3
                  className="font-editorial text-lg font-bold"
                  style={{ color: 'var(--text, #3E2723)' }}
                >
                  {cat.name}
                </h3>

                {section.variant === 'icon-badges' ? (
                  renderIconBadges(cat.skills)
                ) : showBars ? (
                  <div className="space-y-3">
                    {cat.skills.map((skill, sIdx) => {
                      const pct = skill.level ?? 85;
                      return (
                        <div key={sIdx} className="hover-lift rounded-lg px-1 py-1">
                          <div
                            className="mb-1 flex items-center justify-between text-xs font-medium"
                            style={{ color: 'var(--text, #3E2723)' }}
                          >
                            <span>{skill.name}</span>
                            <span style={{ color: 'var(--primary, #735340)' }}>{pct}%</span>
                          </div>
                          <div
                            className="h-[2px] w-full"
                            style={{ backgroundColor: 'var(--primary, #735340)', opacity: 0.2 }}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: 'var(--primary, #735340)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="hover-lift rounded-full border px-3 py-1 text-xs font-medium"
                        style={{
                          borderColor: 'var(--primary, #735340)',
                          color: 'var(--text, #3E2723)',
                          backgroundColor: 'var(--surface, #FFF8F0)',
                        }}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
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
    <section id="skills" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span
          className={`text-xs font-bold uppercase tracking-[0.2em] ${
            isTerminal ? 'font-mono' : ''
          }`}
          style={{ color: theme.primaryColor }}
        >
          {formatSectionEyebrow(archetypeId, '02', 'Capabilities & Tools')}
        </span>
        <h2 className="mt-1 font-editorial text-3xl font-bold">
          {section.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.categories.map((cat, idx) => (
          <div
            key={idx}
            className={`reveal-on-scroll p-6 ${cardDec.className}`}
            style={{
              ...cardDec.style,
              transitionDelay: `${idx * 100}ms`,
            }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center text-white ${
                  isTerminal || isMinimal ? 'rounded-lg' : 'rounded-xl'
                }`}
                style={{
                  backgroundColor:
                    idx % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
                }}
              >
                <Layers className="h-4 w-4" />
              </div>
              <h3 className={`text-base font-bold ${isTerminal ? 'font-mono text-sm' : ''}`}>
                {cat.name}
              </h3>
            </div>

            {section.variant === 'icon-badges' ? (
              renderIconBadges(cat.skills)
            ) : showBars ? (
              <div className="space-y-3.5">
                {cat.skills.map((skill, sIdx) => {
                  const pct = skill.level ?? 85;
                  return (
                    <div key={sIdx} className="hover-lift rounded-lg px-1 py-1">
                      <div className="mb-1 flex items-center justify-between text-xs font-medium">
                        <span>{skill.name}</span>
                        <span className={`opacity-65 ${isTerminal ? 'font-mono' : ''}`}>
                          {pct}%
                        </span>
                      </div>
                      <div
                        className={`w-full overflow-hidden rounded-full ${
                          isMinimal ? 'h-1' : 'h-2'
                        }`}
                        style={{ backgroundColor: `${theme.textColor}15` }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              idx % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className={`hover-lift border px-3 py-1.5 text-xs font-medium ${
                      isTerminal ? 'rounded-md font-mono' : isMinimal ? 'rounded-md' : 'rounded-full'
                    }`}
                    style={{
                      backgroundColor: theme.backgroundColor,
                      borderColor: tokens.borderSubtle,
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
