'use client';

import React from 'react';
import type { TemplateId, ThemeConfig } from '@/schema/portfolio.schema';
import { getArchetypeProfile, getThemeTokens } from './archetypeStyles';

export function ArchetypeDivider({
  archetypeId,
  theme,
}: {
  archetypeId: TemplateId;
  theme: ThemeConfig;
}) {
  const profile = getArchetypeProfile(archetypeId);
  const tokens = getThemeTokens(theme);

  switch (profile.dividerVariant) {
    case 'sparkles':
      return (
        <div className="mt-10 space-y-5" aria-hidden="true">
          <div className="flex items-center justify-center gap-12 sm:gap-24" style={{ color: 'var(--primary, #735340)' }}>
            <svg viewBox="0 0 64 64" fill="currentColor" className="h-6 w-6">
              <path d="M32 2C34.5 21 43 29.5 62 32C43 34.5 34.5 43 32 62C29.5 43 21 34.5 2 32C21 29.5 29.5 21 32 2Z" />
            </svg>
            <svg viewBox="0 0 64 64" fill="currentColor" className="h-7 w-7">
              <path d="M32 2C34.5 21 43 29.5 62 32C43 34.5 34.5 43 32 62C29.5 43 21 34.5 2 32C21 29.5 29.5 21 32 2Z" />
            </svg>
            <svg viewBox="0 0 64 64" fill="currentColor" className="h-6 w-6">
              <path d="M32 2C34.5 21 43 29.5 62 32C43 34.5 34.5 43 32 62C29.5 43 21 34.5 2 32C21 29.5 29.5 21 32 2Z" />
            </svg>
          </div>
          <div className="border-b" style={{ borderColor: tokens.borderMedium }} />
        </div>
      );
    case 'bento-dots':
      return (
        <div className="mt-12 flex items-center gap-3 opacity-60" aria-hidden="true">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: theme.primaryColor }} />
          <div className="h-px flex-1" style={{ backgroundColor: tokens.borderMedium }} />
          <span
            className="h-2.5 w-2.5 rotate-45 border"
            style={{ borderColor: theme.secondaryColor }}
          />
          <div className="h-px flex-1" style={{ backgroundColor: tokens.borderMedium }} />
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: theme.secondaryColor }} />
        </div>
      );
    case 'hairline':
      return (
        <div
          className="mt-14 border-t"
          style={{ borderColor: tokens.borderSubtle }}
          aria-hidden="true"
        />
      );
    case 'exhibit-bar':
      return (
        <div className="mt-12 flex items-center gap-3" aria-hidden="true">
          <div
            className="h-[3px] w-16 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ borderColor: `${theme.primaryColor}50`, color: theme.primaryColor }}
          >
            ◆ Showcase
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: tokens.borderMedium }} />
        </div>
      );
    case 'kpi-rule':
      return (
        <div className="mt-12 flex items-center gap-2.5 opacity-80" aria-hidden="true">
          <div className="h-1 w-8 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: theme.primaryColor }}
          >
            Strategy • Execution • Impact
          </span>
          <div
            className="h-px flex-1"
            style={{
              background: `linear-gradient(to right, ${theme.primaryColor}55, transparent)`,
            }}
          />
        </div>
      );
    case 'code-comment':
      return (
        <div
          className="mt-12 flex items-center gap-3 font-mono text-[11px] opacity-65"
          style={{ color: theme.primaryColor }}
          aria-hidden="true"
        >
          <span>/*</span>
          <div
            className="h-px flex-1 border-t border-dashed"
            style={{ borderColor: `${theme.primaryColor}55` }}
          />
          <span>module::ready</span>
          <div
            className="h-px flex-1 border-t border-dashed"
            style={{ borderColor: `${theme.primaryColor}55` }}
          />
          <span>*/</span>
        </div>
      );
  }
}
