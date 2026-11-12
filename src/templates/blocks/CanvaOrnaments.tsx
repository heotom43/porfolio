'use client';

import React, { useId } from 'react';

/**
 * 4-point Canva sparkle star matching Slide 1, Slide 2, Slide 3, Slide 7, and Slide 8.
 */
export function CanvaFourPointStar({
  className = 'h-7 w-7',
  color = 'var(--primary, #735340)',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 2C34.5 21 43 29.5 62 32C43 34.5 34.5 43 32 62C29.5 43 21 34.5 2 32C21 29.5 29.5 21 32 2Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Top-left sweeping musical staff with beamed notes (Slide 1 Cover).
 */
export function CanvaCoverStaffTopLeft({
  className = '',
  stroke = 'var(--text, #1C1412)',
  noteFill = 'var(--text, #16100E)',
}: {
  className?: string;
  stroke?: string;
  noteFill?: string;
}) {
  return (
    <svg
      viewBox="0 0 360 360"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* 5 curved staff lines */}
      {[0, 12, 24, 36, 48].map((offset, idx) => (
        <path
          key={idx}
          d={`M ${88 + offset * 0.9} -10 C ${118 + offset * 0.7} 135, ${78 + offset * 0.5} 235, -10 ${245 + offset * 0.75}`}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M 165 -6 C 210 2, 260 10, 315 22"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Top eighth note */}
      <g transform="translate(115, 22) rotate(12)">
        <ellipse cx="0" cy="0" rx="13" ry="8.5" transform="rotate(-24)" fill={noteFill} />
        <path d="M 10 -4 L 10 56" stroke={noteFill} strokeWidth="3.5" />
        <path d="M 10 18 L 42 50" stroke={noteFill} strokeWidth="3.2" />
      </g>

      {/* Beamed sixteenth notes */}
      <g transform="translate(72, 128) rotate(-42)">
        <rect x="0" y="0" width="42" height="7" fill={noteFill} />
        <rect x="0" y="12" width="42" height="5" fill={noteFill} />
        <path d="M 3 4 L 3 50 M 39 4 L 39 50" stroke={noteFill} strokeWidth="3.5" />
        <ellipse cx="-3" cy="51" rx="9" ry="6.5" transform="rotate(-20 -3 51)" fill={noteFill} />
        <ellipse cx="33" cy="51" rx="9" ry="6.5" transform="rotate(-20 33 51)" fill={noteFill} />
      </g>

      {/* Lower stem notes */}
      <g transform="translate(88, 205) rotate(16)">
        <ellipse cx="0" cy="0" rx="10" ry="7" transform="rotate(-22)" fill={noteFill} />
        <path d="M 8 -3 L 8 44" stroke={noteFill} strokeWidth="3" />
      </g>
      <g transform="translate(46, 265) rotate(-18)">
        <path d="M 0 0 L 28 14 L 24 44 L -4 30 Z" stroke={noteFill} strokeWidth="3.5" fill="none" />
      </g>
    </svg>
  );
}

/**
 * Bottom-right sweeping musical staff with clefs & notes (Slide 1 Cover).
 */
export function CanvaCoverStaffBottomRight({
  className = '',
  stroke = 'var(--text, #1C1412)',
  noteFill = 'var(--text, #16100E)',
}: {
  className?: string;
  stroke?: string;
  noteFill?: string;
}) {
  return (
    <svg
      viewBox="0 0 360 320"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {[0, 12, 24, 36, 48].map((offset, idx) => (
        <path
          key={idx}
          d={`M ${70 + offset * 0.85} 325 C ${95 + offset * 0.7} 210, ${205 + offset * 0.45} 145, 365 ${78 + offset * 0.9}`}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}

      {/* Stylized G-clef curve */}
      <path
        d="M 105 292 C 138 292, 152 268, 134 256 C 118 246, 102 262, 114 276 C 128 290, 178 274, 168 256 C 160 242, 140 250, 146 266"
        stroke={noteFill}
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bass clef dots */}
      <path
        d="M 192 252 C 216 244, 224 270, 200 282"
        stroke={noteFill}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="204" cy="288" r="3.5" fill={noteFill} />
      <circle cx="215" cy="281" r="3.5" fill={noteFill} />

      {/* Half note */}
      <ellipse
        cx="236"
        cy="222"
        rx="14"
        ry="10"
        transform="rotate(-32 236 222)"
        stroke={noteFill}
        strokeWidth="3.5"
        fill="none"
      />

      {/* Upper beamed notes */}
      <g transform="translate(178, 178) rotate(-32)">
        <ellipse cx="0" cy="36" rx="10" ry="7" fill={noteFill} />
        <path d="M 8 36 L 8 0 L 28 12" stroke={noteFill} strokeWidth="3.5" fill="none" />
      </g>
      <g transform="translate(274, 118) rotate(-25)">
        <rect x="0" y="0" width="36" height="6" fill={noteFill} />
        <path d="M 3 3 L 3 40 M 33 3 L 33 40" stroke={noteFill} strokeWidth="3.2" />
        <ellipse cx="-2" cy="40" rx="9" ry="6.5" fill={noteFill} />
        <ellipse cx="28" cy="40" rx="9" ry="6.5" fill={noteFill} />
      </g>
    </svg>
  );
}

/**
 * Hero Cover centerpiece: "Digital" + oversized outlined "Portfolio" + "2026" (Slide 1).
 */
export function CanvaPortfolioDisplayTitle({
  textColor = 'var(--text, #1E120E)',
  strokeColor = 'var(--primary, #4B3128)',
  fillColor = 'var(--primary, #927869)',
  className = '',
}: {
  textColor?: string;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto flex max-w-4xl flex-col items-center justify-center py-6 sm:py-10 ${className}`}>
      <div className="relative w-full max-w-[780px]">
        {/* "Digital" tucked above "ort" */}
        <span
          className="absolute left-[25%] top-[2%] z-10 font-editorial text-lg font-extrabold tracking-tight sm:left-[26%] sm:top-[4%] sm:text-3xl md:text-4xl"
          style={{ color: textColor }}
        >
          Digital
        </span>

        {/* Tilted "Portfolio" SVG outlined typography matching Slide 1 */}
        <svg
          viewBox="0 0 880 300"
          className="w-full overflow-visible drop-shadow-[0_2px_0_rgba(62,39,35,0.08)]"
          aria-hidden="true"
        >
          <g transform="rotate(-2.2 440 155)">
            <text
              x="440"
              y="222"
              textAnchor="middle"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="4.2"
              strokeLinejoin="round"
              style={{
                fontFamily: 'var(--font-heading), "Playfair Display", Georgia, serif',
                fontSize: '205px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              Portfolio
            </text>
          </g>
        </svg>

        {/* "2026" tucked below "lio" */}
        <span
          className="absolute bottom-[3%] right-[19%] z-10 font-editorial text-base font-extrabold tracking-wider sm:bottom-[5%] sm:right-[19%] sm:text-2xl md:text-3xl"
          style={{ color: textColor }}
        >
          2026
        </span>
      </div>
    </div>
  );
}

/**
 * Vertical wavy musical ribbon for the right margin of About me (mobile-full.png Slide 2).
 */
export function CanvaVerticalMusicRibbon({
  className = '',
  stroke = 'var(--text, #2A1C18)',
  noteFill = 'var(--text, #2A1C18)',
}: {
  className?: string;
  stroke?: string;
  noteFill?: string;
}) {
  return (
    <svg
      viewBox="0 0 180 420"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {[0, 9, 18, 27, 36].map((offset, idx) => (
        <path
          key={idx}
          d={`M ${42 + offset} 0 C ${112 + offset} 95, ${24 + offset} 185, ${96 + offset} 285 C ${134 + offset} 340, ${88 + offset} 388, ${56 + offset} 420`}
          stroke={stroke}
          strokeWidth="1.2"
          strokeOpacity="0.72"
        />
      ))}
      {[
        { x: 64, y: 78, rot: -18 },
        { x: 96, y: 158, rot: 14 },
        { x: 58, y: 235, rot: -12 },
        { x: 112, y: 318, rot: 22 },
      ].map((n, i) => (
        <g key={i} transform={`translate(${n.x}, ${n.y}) rotate(${n.rot})`}>
          <ellipse cx="0" cy="0" rx="6.5" ry="4.5" fill={noteFill} />
          <path d="M 5.5 0 L 5.5 -24 L 16 -18" stroke={noteFill} strokeWidth="2.2" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Hand-sketched concentric ink vinyl record (Slide 3 flanking "project" & Slide 4 corner).
 */
export function CanvaVinylSketchSvg({
  className = 'h-24 w-24',
  stroke = 'var(--text, #3E2723)',
  strokeSecondary = 'var(--primary, #5D4037)',
}: {
  className?: string;
  stroke?: string;
  strokeSecondary?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="74" stroke={stroke} strokeWidth="1.5" strokeDasharray="110 14 70 10" />
      <circle cx="80" cy="80" r="68" stroke={stroke} strokeWidth="1.2" strokeDasharray="85 20 55 18" />
      <circle cx="80" cy="80" r="62" stroke={strokeSecondary} strokeWidth="1" strokeDasharray="55 24 90 12" />
      <circle cx="80" cy="80" r="55" stroke={stroke} strokeWidth="1.3" strokeDasharray="120 18 40 22" />
      <circle cx="80" cy="80" r="48" stroke={strokeSecondary} strokeWidth="0.9" strokeDasharray="45 15 65 20" />
      <circle cx="80" cy="80" r="41" stroke={stroke} strokeWidth="1.1" strokeDasharray="70 28 38 14" />
      <circle cx="80" cy="80" r="34" stroke={strokeSecondary} strokeWidth="0.9" strokeDasharray="38 12 52 18" />
      <circle cx="80" cy="80" r="24" stroke={stroke} strokeWidth="1.4" />
      <circle cx="80" cy="80" r="17" stroke={strokeSecondary} strokeWidth="0.8" strokeDasharray="24 8" />
      <circle cx="80" cy="80" r="4.5" stroke={stroke} strokeWidth="1.3" />
    </svg>
  );
}

/**
 * Swirling spiral musical staff behind "Conclusion" (Slide 8).
 */
export function CanvaSpiralMusicStaff({
  className = '',
  stroke = 'var(--text, #2E1D18)',
  noteFill = 'var(--text, #2E1D18)',
}: {
  className?: string;
  stroke?: string;
  noteFill?: string;
}) {
  return (
    <svg
      viewBox="0 0 360 320"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer to inner spiral staff arcs */}
      <path
        d="M 22 68 C 72 8, 224 4, 272 86 C 314 156, 266 254, 186 258 C 118 262, 74 210, 82 148 C 90 98, 138 74, 182 88 C 218 100, 232 142, 212 174 C 194 202, 152 204, 136 178 C 122 156, 136 128, 160 128 C 178 128, 188 144, 178 160 C 170 170, 156 168, 154 156"
        stroke={stroke}
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <path
        d="M 14 82 C 68 18, 234 16, 284 98 C 328 172, 278 270, 190 274 C 112 278, 60 220, 70 148 C 80 88, 138 62, 190 78 C 232 92, 248 144, 224 182 C 202 216, 150 218, 128 186"
        stroke={stroke}
        strokeWidth="1.1"
        strokeOpacity="0.65"
      />
      <path
        d="M 32 54 C 82 -2, 216 -4, 262 74 C 302 140, 256 238, 182 242 C 124 244, 88 198, 96 146"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity="0.55"
      />

      {/* Notes dotted around spiral */}
      {[
        { x: 56, y: 40 },
        { x: 118, y: 18 },
        { x: 204, y: 24 },
        { x: 274, y: 74 },
        { x: 288, y: 164 },
        { x: 244, y: 238 },
        { x: 146, y: 256 },
        { x: 88, y: 204 },
        { x: 110, y: 112 },
      ].map((pt, i) => (
        <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
          <circle cx="0" cy="0" r="4" fill={noteFill} />
          <path d="M 3.5 0 L 3.5 -16 L 10 -12" stroke={stroke} strokeWidth="1.6" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Vintage tilted "Rota" music sheet sticker with fluttering notes (Slide 9 top-left of mocha box).
 */
export function CanvaRotaSheetSticker({
  className = '',
  paperBg = '#FFFDF8',
  stroke = 'var(--text, #2E1D18)',
  noteFill = 'var(--text, #2E1D18)',
  accentColor = '#C93B2B',
}: {
  className?: string;
  paperBg?: string;
  stroke?: string;
  noteFill?: string;
  accentColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Tilted sheet paper */}
      <g transform="translate(18, 38) rotate(-12)">
        <rect
          x="0"
          y="0"
          width="148"
          height="190"
          rx="3"
          fill={paperBg}
          stroke={stroke}
          strokeWidth="1.8"
        />
        <text
          x="74"
          y="30"
          textAnchor="middle"
          fill={noteFill}
          style={{
            fontFamily: 'var(--font-heading), "Playfair Display", Georgia, serif',
            fontSize: '20px',
            fontStyle: 'italic',
            fontWeight: 700,
          }}
        >
          ~ Rota ~
        </text>
        {/* 4 mini music staff blocks */}
        {[46, 82, 118, 154].map((topY, blockIdx) => (
          <g key={blockIdx}>
            {[0, 4, 8, 12, 16].map((dy, lineIdx) => (
              <line
                key={lineIdx}
                x1="14"
                y1={topY + dy}
                x2="134"
                y2={topY + dy}
                stroke={stroke}
                strokeWidth="0.9"
                strokeOpacity="0.7"
              />
            ))}
            {[28, 52, 78, 104, 120].map((nx, nIdx) => (
              <g key={nIdx}>
                <circle
                  cx={nx}
                  cy={topY + ((nIdx * 3 + blockIdx * 2) % 14)}
                  r="2.2"
                  fill={noteFill}
                />
                <line
                  x1={nx + 2}
                  y1={topY + ((nIdx * 3 + blockIdx * 2) % 14)}
                  x2={nx + 2}
                  y2={topY + ((nIdx * 3 + blockIdx * 2) % 14) - 10}
                  stroke={stroke}
                  strokeWidth="1.1"
                />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* Fluttering notes escaping top-right */}
      <g transform="translate(175, 22)">
        <circle cx="8" cy="36" r="4" fill={noteFill} />
        <path d="M 11.5 36 L 11.5 14 L 24 10 L 24 32" stroke={stroke} strokeWidth="2.2" />
        <circle cx="21" cy="32" r="4" fill={noteFill} />

        <circle cx="46" cy="24" r="3.8" fill={noteFill} />
        <path d="M 49.5 24 L 49.5 4 L 62 0 L 62 20" stroke={stroke} strokeWidth="2.2" />
        <circle cx="59" cy="20" r="3.8" fill={noteFill} />

        {/* Accent note */}
        <circle cx="28" cy="68" r="4.5" fill={accentColor} />
        <path d="M 32 68 L 32 45 L 42 50" stroke={accentColor} strokeWidth="2.3" />

        <circle cx="46" cy="84" r="3.5" fill={noteFill} />
        <path d="M 49 84 L 49 66 L 58 70" stroke={stroke} strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/**
 * Left-edge halftone dotted vinyl disc (Slide 10 Thank You!).
 */
export function CanvaHalftoneVinylLeft({
  className = '',
  dotColor = '#1C1613',
  ringColor = 'var(--bg, #FFF3E6)',
  centerColor = 'var(--bg, #FFF3E6)',
}: {
  className?: string;
  dotColor?: string;
  ringColor?: string;
  centerColor?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const patternId = `halftone-left-${uid}`;

  return (
    <svg
      viewBox="0 0 260 440"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.1" fill={dotColor} />
        </pattern>
      </defs>
      <circle cx="20" cy="220" r="212" fill={`url(#${patternId})`} opacity="0.88" />
      <circle cx="20" cy="220" r="145" stroke={ringColor} strokeWidth="3" strokeOpacity="0.45" />
      <circle cx="20" cy="220" r="68" fill={centerColor} fillOpacity="0.7" />
      <circle cx="20" cy="220" r="56" fill={`url(#${patternId})`} opacity="0.35" />
    </svg>
  );
}

/**
 * Top-right paired halftone vinyl discs + bright yellow 7-point starburst (Slide 10 Thank You!).
 */
export function CanvaThankYouVinylBurst({
  className = '',
  dotColor = '#1E1815',
  starburstColor = '#DFB634',
  discBackdrop = '#EAE4DB',
  discCenter = '#ECE6DD',
}: {
  className?: string;
  dotColor?: string;
  starburstColor?: string;
  discBackdrop?: string;
  discCenter?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const patternId = `halftone-right-${uid}`;

  return (
    <svg
      viewBox="0 0 360 280"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.7" fill={dotColor} />
        </pattern>
      </defs>

      {/* Subtle paper cutout backdrop */}
      <circle cx="152" cy="116" r="102" fill={discBackdrop} />
      <circle cx="270" cy="100" r="100" fill={discBackdrop} />

      {/* Left vinyl disc */}
      <circle cx="152" cy="116" r="88" fill={`url(#${patternId})`} />
      <circle cx="152" cy="116" r="32" fill={discCenter} />
      <circle cx="152" cy="116" r="6" fill={dotColor} />

      {/* Right vinyl disc */}
      <circle cx="270" cy="100" r="88" fill={`url(#${patternId})`} />
      <circle cx="270" cy="100" r="32" fill={discCenter} />
      <circle cx="270" cy="100" r="6" fill={dotColor} />

      {/* Golden yellow irregular starburst overlapping both discs */}
      <polygon
        points="214,34 226,105 288,82 246,138 308,214 234,174 206,246 196,174 128,194 178,136 144,78 202,110"
        fill={starburstColor}
      />
    </svg>
  );
}
