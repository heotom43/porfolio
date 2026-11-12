'use client';

import React from 'react';
import type { ProjectMediaItem } from '@/schema/portfolio.schema';
import { ImageSourceBadge } from './ImageSourceBadge';
import { isDarkColor } from './colorUtils';

export type MediaFrameVariant =
  | 'arch-window'
  | 'cutout-blob'
  | 'polaroid'
  | 'macbook-mockup'
  | 'rounded-card';

export interface MediaFrameProps {
  media: ProjectMediaItem;
  variant?: MediaFrameVariant;
  aspectClass?: string;
  radiusClass?: string;
  primaryColor?: string;
  secondaryColor?: string;
  surfaceColor?: string;
  editable?: boolean;
  isGenerating?: boolean;
  compactBadge?: boolean;
  onClick?: () => void;
  onRegenerateAiImage?: () => void;
  onSwitchToDocx?: () => void;
  className?: string;
}

export function MediaFrame({
  media,
  variant = 'rounded-card',
  aspectClass = 'aspect-[4/3]',
  radiusClass = 'rounded-2xl',
  primaryColor = '#A96B54',
  secondaryColor = '#304254',
  surfaceColor = '#FFFFFF',
  editable = false,
  isGenerating = false,
  compactBadge = false,
  onClick,
  onRegenerateAiImage,
  onSwitchToDocx,
  className = '',
}: MediaFrameProps) {
  const darkSurface = isDarkColor(surfaceColor);
  const badgeNode = (
    <div className="pointer-events-none absolute left-3 top-3 z-20">
      <ImageSourceBadge
        sourceType={media.sourceType}
        editable={editable}
        isGenerating={isGenerating}
        compact={compactBadge}
        onRegenerateAiImage={onRegenerateAiImage}
        onSwitchToDocx={onSwitchToDocx}
      />
    </div>
  );

  const loadingOverlay = isGenerating ? (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-stone-900/60 text-white backdrop-blur-sm">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-amber-300" />
      <span className="text-xs font-medium tracking-wide">
        AI đang vẽ ảnh minh họa...
      </span>
    </div>
  ) : null;

  if (variant === 'macbook-mockup') {
    return (
      <div className={`group relative ${className}`}>
        <div
          className={`overflow-hidden rounded-2xl border bg-stone-900 p-2 shadow-2xl ${
            darkSurface ? 'border-white/15' : 'border-stone-800/80'
          }`}
        >
          {/* Browser / MacBook top bar */}
          <div className="mb-1.5 flex items-center gap-1.5 px-2 pt-0.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
            <span className="ml-2 truncate text-[10px] text-stone-400">
              {media.caption || 'assignment-preview'}
            </span>
          </div>
          <div
            className={`relative overflow-hidden rounded-lg bg-stone-100 ${aspectClass} ${onClick ? 'cursor-zoom-in' : ''}`}
            onClick={onClick}
          >
            {badgeNode}
            {loadingOverlay}
            <img
              src={media.url}
              alt={media.caption || 'Assignment mockup'}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
        {/* Laptop base lip */}
        <div
          className={`mx-auto h-2 w-11/12 rounded-b-xl shadow-inner ${
            darkSurface ? 'bg-slate-700' : 'bg-stone-300'
          }`}
        />
      </div>
    );
  }

  if (variant === 'polaroid') {
    return (
      <div
        className={`group relative rounded-md p-3 pb-8 shadow-lg ring-1 transition hover:shadow-xl ${
          darkSurface ? 'ring-white/15' : 'ring-black/10'
        } ${className}`}
        style={{ backgroundColor: surfaceColor }}
      >
        {/* Corner masking tape */}
        <div
          className="absolute -top-2.5 right-6 z-10 h-5 w-16 rotate-6 opacity-85 shadow-sm"
          style={{ backgroundColor: '#F3DEC0' }}
          aria-hidden="true"
        />
        <div
          className={`relative overflow-hidden rounded-sm bg-stone-100 ${aspectClass} ${onClick ? 'cursor-zoom-in' : ''}`}
          onClick={onClick}
        >
          {badgeNode}
          {loadingOverlay}
          <img
            src={media.url}
            alt={media.caption || 'Project visual'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        {media.caption && (
          <p
            className={`mt-2.5 truncate text-center text-xs font-medium ${
              darkSurface ? 'text-stone-300' : 'text-stone-600'
            }`}
          >
            {media.caption}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'arch-window') {
    return (
      <div className={`group relative ${className}`}>
        <div
          className="absolute -bottom-2.5 -right-2.5 inset-0 rounded-t-[140px] rounded-b-2xl opacity-20"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />
        {badgeNode}
        <div
          className={`relative overflow-hidden rounded-t-[140px] rounded-b-2xl border-2 shadow-lg ${aspectClass} ${onClick ? 'cursor-zoom-in' : ''}`}
          style={{ borderColor: secondaryColor, backgroundColor: surfaceColor }}
          onClick={onClick}
        >
          {loadingOverlay}
          <img
            src={media.url}
            alt={media.caption || 'Project visual'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </div>
    );
  }

  if (variant === 'cutout-blob') {
    return (
      <div className={`group relative ${className}`}>
        {badgeNode}
        <div
          className={`relative overflow-hidden border-2 shadow-lg ${aspectClass} ${onClick ? 'cursor-zoom-in' : ''}`}
          style={{
            borderColor: primaryColor,
            backgroundColor: surfaceColor,
            borderRadius: '48% 52% 42% 58% / 44% 48% 52% 56%',
          }}
          onClick={onClick}
        >
          {loadingOverlay}
          <img
            src={media.url}
            alt={media.caption || 'Project visual'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </div>
    );
  }

  // rounded-card default
  return (
    <div
      className={`group relative overflow-hidden border shadow-md transition hover:shadow-xl ${radiusClass} ${
        darkSurface ? 'border-white/15' : 'border-black/10'
      } ${aspectClass} ${onClick ? 'cursor-zoom-in' : ''} ${className}`}
      style={{ backgroundColor: surfaceColor }}
      onClick={onClick}
    >
      {badgeNode}
      {loadingOverlay}
      <img
        src={media.url}
        alt={media.caption || 'Project visual'}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      {media.caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3.5 pb-2.5 pt-6">
          <p className="truncate text-xs font-medium text-white">
            {media.caption}
          </p>
        </div>
      )}
    </div>
  );
}
