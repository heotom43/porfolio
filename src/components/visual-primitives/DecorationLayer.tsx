'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import type { VisualDecoration } from '@/schema/portfolio.schema';

export interface DecorationLayerProps {
  decorations: VisualDecoration[];
  primaryColor?: string;
  secondaryColor?: string;
}

export function DecorationLayer({
  decorations,
  primaryColor = '#A96B54',
  secondaryColor = '#304254',
}: DecorationLayerProps) {
  if (!decorations || decorations.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {decorations.map((dec) => {
        const style: React.CSSProperties = {
          top: dec.position.top,
          left: dec.position.left,
          right: dec.position.right,
          bottom: dec.position.bottom,
          transform: `rotate(${dec.position.rotate ?? 0}deg)`,
          zIndex: dec.position.zIndex ?? 1,
        };

        if (dec.type === 'floating-tag' || dec.type === 'badge') {
          return (
            <div
              key={dec.id}
              style={{
                ...style,
                borderColor: `${primaryColor}55`,
                color: secondaryColor,
              }}
              className="absolute hidden items-center gap-1.5 rounded-full border bg-white/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide shadow-md backdrop-blur-sm md:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} />
              <span>{dec.label || 'Portfolio Highlight'}</span>
            </div>
          );
        }

        if (dec.type === 'sticker' && dec.assetUrl) {
          return (
            <img
              key={dec.id}
              src={dec.assetUrl}
              alt=""
              style={style}
              className="absolute h-16 w-16 object-contain opacity-90"
            />
          );
        }

        if (dec.type === 'shape') {
          return (
            <div
              key={dec.id}
              style={{ ...style, backgroundColor: `${primaryColor}22` }}
              className="absolute h-24 w-24 rounded-full blur-md"
            />
          );
        }

        if (dec.type === 'frame') {
          return (
            <div
              key={dec.id}
              style={{ ...style, borderColor: `${primaryColor}45` }}
              className="absolute hidden h-20 w-20 rounded-2xl border-2 border-dashed md:block"
            />
          );
        }

        if (dec.type === 'grid-pattern') {
          return (
            <div
              key={dec.id}
              style={{
                ...style,
                backgroundImage: `radial-gradient(${primaryColor}35 1.5px, transparent 1.5px)`,
                backgroundSize: '10px 10px',
              }}
              className="absolute hidden h-24 w-24 opacity-60 md:block"
            />
          );
        }

        return null;
      })}
    </div>
  );
}
