/**
 * Curated Background Illustration Presets for Creative & Academic Portfolios.
 * Supports preset IDs configured in BackgroundIllustrationConfig.presetId.
 */

export interface BackgroundPreset {
  id:
    | 'canva-musical'
    | 'botanical-leaves'
    | 'cyber-mesh'
    | 'geometric-dots'
    | 'abstract-blobs'
    | 'celestial-sparkles'
    | 'vintage-parchment'
    | 'minimalist-contour'
    | 'halftone-field'
    | 'editorial-arcs'
    | 'soft-paper-waves'
    | 'quiet-starburst';
  name: string;
  nameVi: string;
  description: string;
  category: 'musical' | 'nature' | 'tech' | 'geometry' | 'organic' | 'celestial' | 'vintage' | 'minimal' | 'editorial' | 'paper';
  rawSvg: string;
  svgDataUri: string;
  patternSize?: string;
}

function svgToDataUri(svg: string): string {
  const cleaned = svg.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

// 1. Canva Musical: Musical staff ribbons, clef curves, rhythmic notes & starry accents
const RAW_SVG_CANVA_MUSICAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <defs>
    <linearGradient id="musicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="currentColor" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="currentColor" stop-opacity="0.08"/>
    </linearGradient>
  </defs>
  <!-- Curving Staff Ribbons -->
  <g opacity="0.45" stroke-width="1.5">
    <path d="M-50,220 C250,150 450,320 850,240 C1050,200 1150,260 1250,230" />
    <path d="M-50,238 C250,168 450,338 850,258 C1050,218 1150,278 1250,248" />
    <path d="M-50,256 C250,186 450,356 850,276 C1050,236 1150,296 1250,266" />
    <path d="M-50,274 C250,204 450,374 850,294 C1050,254 1150,314 1250,284" />
    <path d="M-50,292 C250,222 450,392 850,312 C1050,272 1150,332 1250,302" />
  </g>
  <!-- Lower Floating Counter Staff -->
  <g opacity="0.3" stroke-width="1.2">
    <path d="M-20,620 C300,680 600,520 950,640 C1100,700 1180,670 1240,650" />
    <path d="M-20,636 C300,696 600,536 950,656 C1100,716 1180,686 1240,666" />
    <path d="M-20,652 C300,712 600,552 950,672 C1100,732 1180,702 1240,682" />
    <path d="M-20,668 C300,728 600,568 950,688 C1100,748 1180,718 1240,698" />
    <path d="M-20,684 C300,744 600,584 950,704 C1100,764 1180,734 1240,714" />
  </g>
  <!-- Musical Notes & Treble Flourish -->
  <g fill="currentColor" stroke="none" opacity="0.5">
    <ellipse cx="280" cy="204" rx="14" ry="10" transform="rotate(-25 280 204)" />
    <rect x="290" y="140" width="3" height="64" />
    <path d="M293,140 C320,150 330,175 320,195 C315,180 305,170 293,165 Z" />

    <ellipse cx="490" cy="330" rx="13" ry="9" transform="rotate(-22 490 330)" />
    <rect x="500" y="270" width="3" height="60" />

    <ellipse cx="570" cy="315" rx="13" ry="9" transform="rotate(-22 570 315)" />
    <rect x="580" y="255" width="3" height="60" />
    <polygon points="500,270 583,255 583,263 500,278" />

    <ellipse cx="880" cy="250" rx="14" ry="10" transform="rotate(-25 880 250)" />
    <rect x="890" y="190" width="3" height="60" />

    <ellipse cx="1060" cy="235" rx="12" ry="8" transform="rotate(-25 1060 235)" />
    <rect x="1069" y="175" width="3" height="60" />
    <path d="M1072,175 C1095,185 1105,205 1098,220 C1093,210 1084,200 1072,196 Z" />
  </g>
  <!-- 4-point Sparkle Stars -->
  <g fill="currentColor" opacity="0.45">
    <path d="M150,110 Q165,125 180,125 Q165,125 150,140 Q150,125 135,125 Q150,125 150,110 Z" />
    <path d="M720,160 Q732,172 744,172 Q732,172 720,184 Q720,172 708,172 Q720,172 720,160 Z" />
    <path d="M1020,410 Q1035,425 1050,425 Q1035,425 1020,440 Q1020,425 1005,425 Q1020,425 1020,410 Z" />
    <path d="M420,610 Q430,620 440,620 Q430,620 420,630 Q420,620 410,620 Q420,620 420,610 Z" />
  </g>
</svg>`;

// 2. Botanical Leaves: Organic monstera silhouettes, fern fronds & gentle botanical contour vines
const RAW_SVG_BOTANICAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <!-- Top-Right Foliage Cluster -->
  <g opacity="0.38" stroke-width="2">
    <path d="M1250,-50 Q1050,120 980,320" />
    <path d="M980,320 Q920,240 880,180 Q960,190 980,320" fill="currentColor" fill-opacity="0.12" />
    <path d="M1020,260 Q1010,170 980,120 Q1040,150 1020,260" fill="currentColor" fill-opacity="0.12" />
    <path d="M1060,200 Q1080,110 1070,60 Q1110,100 1060,200" fill="currentColor" fill-opacity="0.12" />
    <path d="M1110,130 Q1140,50 1150,0 Q1170,50 1110,130" fill="currentColor" fill-opacity="0.12" />
    <!-- Monstera Outline Cutouts -->
    <path d="M1180,180 C1140,220 1080,240 1060,300 C1040,360 1060,420 1110,460 C1170,500 1220,480 1250,420" stroke-width="2.5" />
    <path d="M1100,280 C1070,290 1045,280 1030,260" />
    <path d="M1080,330 C1045,345 1025,335 1010,315" />
    <path d="M1085,385 C1055,405 1035,400 1020,380" />
  </g>
  <!-- Bottom-Left Organic Leaves & Fern Stem -->
  <g opacity="0.35" stroke-width="2">
    <path d="M-50,850 Q180,680 310,480" />
    <path d="M310,480 Q250,430 220,370 Q280,390 310,480" fill="currentColor" fill-opacity="0.1" />
    <path d="M250,550 Q180,510 130,470 Q200,480 250,550" fill="currentColor" fill-opacity="0.1" />
    <path d="M190,620 Q120,600 70,570 Q140,560 190,620" fill="currentColor" fill-opacity="0.1" />
    <path d="M130,690 Q70,680 20,670 Q80,650 130,690" fill="currentColor" fill-opacity="0.1" />
    <!-- Delicate Vine Twig with Berries -->
    <path d="M50,820 Q180,760 260,680 Q320,620 380,600" stroke-width="1.5" stroke-dasharray="4 4" />
    <circle cx="210" cy="740" r="5" fill="currentColor" />
    <circle cx="280" cy="660" r="4" fill="currentColor" />
    <circle cx="340" cy="610" r="5" fill="currentColor" />
  </g>
</svg>`;

// 3. Cyber Mesh: High-tech isometric grid, circuit traces, glowing nodes & crosshair indicators
const RAW_SVG_CYBER_MESH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <!-- Isometric Matrix Grid -->
  <g opacity="0.25" stroke-width="1">
    <path d="M0,100 L1200,100 M0,200 L1200,200 M0,300 L1200,300 M0,400 L1200,400 M0,500 L1200,500 M0,600 L1200,600 M0,700 L1200,700" stroke-dasharray="2 6" />
    <path d="M150,0 L150,800 M300,0 L300,800 M450,0 L450,800 M600,0 L600,800 M750,0 L750,800 M900,0 L900,800 M1050,0 L1050,800" stroke-dasharray="2 6" />
  </g>
  <!-- Cyber Circuit Traces & Bus Lines -->
  <g opacity="0.45" stroke-width="2">
    <path d="M60,120 L220,120 L280,180 L440,180 L490,230 L700,230" />
    <circle cx="60" cy="120" r="4" fill="currentColor" />
    <circle cx="280" cy="180" r="3" fill="currentColor" />
    <circle cx="700" cy="230" r="5" fill="currentColor" />

    <path d="M1140,680 L980,680 L920,620 L760,620 L710,570 L520,570" />
    <circle cx="1140" cy="680" r="4" fill="currentColor" />
    <circle cx="920" cy="620" r="3" fill="currentColor" />
    <circle cx="520" cy="570" r="5" fill="currentColor" />

    <!-- Corner Target Crosshairs -->
    <g transform="translate(1080, 100)">
      <circle cx="0" cy="0" r="28" stroke-width="1.5" />
      <circle cx="0" cy="0" r="14" stroke-width="1" stroke-dasharray="3 3" />
      <line x1="-36" y1="0" x2="36" y2="0" stroke-width="1.5" />
      <line x1="0" y1="-36" x2="0" y2="36" stroke-width="1.5" />
      <circle cx="0" cy="0" r="3" fill="currentColor" />
    </g>
    <g transform="translate(120, 700)">
      <rect x="-24" y="-24" width="48" height="48" stroke-width="1.5" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke-width="1" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke-width="1" />
      <circle cx="0" cy="0" r="3" fill="currentColor" />
    </g>
  </g>
</svg>`;

// 4. Geometric Dots: Bauhaus dot grid pattern, coordinate labels & geometric accents
const RAW_SVG_GEOMETRIC_DOTS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <defs>
    <pattern id="bauhausDots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="30" cy="30" r="2.2" fill="currentColor" opacity="0.32" />
      <circle cx="60" cy="60" r="1.4" fill="currentColor" opacity="0.18" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bauhausDots)" />
  <!-- Accent Framing Corners & Swiss Typography Accents -->
  <g opacity="0.4" stroke-width="2">
    <path d="M40,80 L40,40 L80,40" />
    <path d="M1120,40 L1160,40 L1160,80" />
    <path d="M40,720 L40,760 L80,760" />
    <path d="M1120,760 L1160,760 L1160,720" />
    <!-- Center Minimalist Concentric Circles -->
    <circle cx="600" cy="400" r="120" stroke-width="1" stroke-dasharray="6 6" opacity="0.25" />
    <circle cx="600" cy="400" r="240" stroke-width="1" opacity="0.15" />
  </g>
</svg>`;

// 5. Abstract Blobs: Fluid morphing organic gradients & soft layered watercolor curves
const RAW_SVG_ABSTRACT_BLOBS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <defs>
    <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="currentColor" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="currentColor" stop-opacity="0.03"/>
    </linearGradient>
    <linearGradient id="blobGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="currentColor" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <!-- Blob 1: Top-Right Giant Fluid -->
  <path d="M780,-80 C950,-100 1120,-40 1220,90 C1320,220 1280,390 1190,510 C1100,630 960,670 850,620 C740,570 680,430 670,300 C660,170 610,-60 780,-80 Z" fill="url(#blobGrad1)" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.28" />
  <!-- Blob 2: Bottom-Left Liquid -->
  <path d="M-60,420 C60,380 180,440 280,510 C380,580 440,680 430,780 C420,880 330,940 210,950 C90,960 -30,920 -110,840 C-190,760 -180,460 -60,420 Z" fill="url(#blobGrad2)" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.22" />
  <!-- Small Floating Droplets -->
  <circle cx="560" cy="180" r="18" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-width="1" stroke-opacity="0.2" />
  <circle cx="680" cy="620" r="26" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-width="1" stroke-opacity="0.2" />
  <circle cx="320" cy="240" r="12" fill="currentColor" fill-opacity="0.07" />
</svg>`;

// 6. Celestial Sparkles: Constellations, 4-point and 8-point stars, crescent moon arcs
const RAW_SVG_CELESTIAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <!-- Crescent Moon in Top Right -->
  <path d="M1040,120 A 60 60 0 1 0 1080,220 A 48 48 0 1 1 1040,120 Z" fill="currentColor" fill-opacity="0.16" stroke-width="1.5" stroke-opacity="0.4" />
  <!-- Constellation Connecting Lines -->
  <g opacity="0.35" stroke-width="1.2" stroke-dasharray="3 4">
    <line x1="140" y1="180" x2="260" y2="120" />
    <line x1="260" y1="120" x2="380" y2="190" />
    <line x1="380" y1="190" x2="480" y2="150" />
    <line x1="480" y1="150" x2="560" y2="240" />

    <line x1="780" y1="580" x2="880" y2="650" />
    <line x1="880" y1="650" x2="1000" y2="600" />
    <line x1="1000" y1="600" x2="1080" y2="670" />
  </g>
  <!-- Constellation Nodes & Sparkling Stars -->
  <g fill="currentColor" opacity="0.5">
    <circle cx="140" cy="180" r="4" />
    <circle cx="260" cy="120" r="5" />
    <circle cx="380" cy="190" r="4" />
    <circle cx="480" cy="150" r="6" />
    <circle cx="560" cy="240" r="4.5" />

    <circle cx="780" cy="580" r="4.5" />
    <circle cx="880" cy="650" r="4" />
    <circle cx="1000" cy="600" r="6" />
    <circle cx="1080" cy="670" r="4" />

    <!-- 8-Point Diamond Sparkles -->
    <path d="M220,380 L226,396 L242,402 L226,408 L220,424 L214,408 L198,402 L214,396 Z" />
    <path d="M920,320 L927,337 L944,344 L927,351 L920,368 L913,351 L896,344 L913,337 Z" />
    <path d="M620,680 L625,695 L640,700 L625,705 L620,720 L615,705 L600,700 L615,695 Z" />
  </g>
</svg>`;

// 7. Vintage Parchment: Antique filigree border corners, ornamental flourishes & Victorian line art
const RAW_SVG_VINTAGE_PARCHMENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <!-- Double Ornamental Border -->
  <g opacity="0.32" stroke-width="1.5">
    <rect x="36" y="36" width="1128" height="728" rx="8" />
    <rect x="46" y="46" width="1108" height="708" rx="4" stroke-width="0.8" stroke-dasharray="6 3" />
  </g>
  <!-- Top-Left Antique Filigree Corner -->
  <g transform="translate(46, 46)" opacity="0.55" stroke-width="1.6">
    <path d="M0,0 L70,0 C50,20 40,40 40,70 L0,70 Z" fill="currentColor" fill-opacity="0.08" />
    <path d="M0,35 C20,35 35,20 35,0" />
    <path d="M10,80 C30,70 60,70 80,40 C70,60 70,90 40,100" />
    <circle cx="20" cy="20" r="3" fill="currentColor" />
  </g>
  <!-- Top-Right Antique Filigree Corner -->
  <g transform="translate(1154, 46) scale(-1, 1)" opacity="0.55" stroke-width="1.6">
    <path d="M0,0 L70,0 C50,20 40,40 40,70 L0,70 Z" fill="currentColor" fill-opacity="0.08" />
    <path d="M0,35 C20,35 35,20 35,0" />
    <path d="M10,80 C30,70 60,70 80,40 C70,60 70,90 40,100" />
    <circle cx="20" cy="20" r="3" fill="currentColor" />
  </g>
  <!-- Bottom-Left Antique Filigree Corner -->
  <g transform="translate(46, 754) scale(1, -1)" opacity="0.55" stroke-width="1.6">
    <path d="M0,0 L70,0 C50,20 40,40 40,70 L0,70 Z" fill="currentColor" fill-opacity="0.08" />
    <path d="M0,35 C20,35 35,20 35,0" />
    <path d="M10,80 C30,70 60,70 80,40 C70,60 70,90 40,100" />
    <circle cx="20" cy="20" r="3" fill="currentColor" />
  </g>
  <!-- Bottom-Right Antique Filigree Corner -->
  <g transform="translate(1154, 754) scale(-1, -1)" opacity="0.55" stroke-width="1.6">
    <path d="M0,0 L70,0 C50,20 40,40 40,70 L0,70 Z" fill="currentColor" fill-opacity="0.08" />
    <path d="M0,35 C20,35 35,20 35,0" />
    <path d="M10,80 C30,70 60,70 80,40 C70,60 70,90 40,100" />
    <circle cx="20" cy="20" r="3" fill="currentColor" />
  </g>
</svg>`;

// 8. Minimalist Contour: Topographic contour lines, gentle wave elevations & architectural wire contours
const RAW_SVG_MINIMALIST_CONTOUR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <g opacity="0.3" stroke-width="1.5">
    <path d="M-50,150 C200,80 350,220 600,180 C850,140 1000,260 1250,200" />
    <path d="M-50,210 C180,140 330,280 580,240 C830,200 980,320 1250,260" />
    <path d="M-50,270 C160,200 310,340 560,300 C810,260 960,380 1250,320" />
    <path d="M-50,330 C140,260 290,400 540,360 C790,320 940,440 1250,380" />
    <path d="M-50,390 C120,320 270,460 520,420 C770,380 920,500 1250,440" />

    <path d="M-50,560 C250,650 480,500 750,570 C1020,640 1150,550 1250,590" />
    <path d="M-50,620 C230,710 460,560 730,630 C1000,700 1130,610 1250,650" />
    <path d="M-50,680 C210,770 440,620 710,690 C980,760 1110,670 1250,710" />
  </g>
  <!-- Minimalist Elevation Index Marks -->
  <g fill="currentColor" opacity="0.4" font-family="monospace" font-size="10">
    <text x="610" y="175">+120m</text>
    <text x="590" y="235">+140m</text>
    <text x="570" y="295">+160m</text>
    <text x="760" y="565">-40m</text>
    <text x="740" y="625">-60m</text>
  </g>
</svg>`;

// 9. Halftone Field: a gently fading editorial dot screen with open space at center
const RAW_SVG_HALFTONE_FIELD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none">
  <defs>
    <pattern id="halftoneDots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.25" fill="currentColor" />
    </pattern>
    <linearGradient id="halftoneFade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="white" stop-opacity="0.8" />
      <stop offset="0.52" stop-color="white" stop-opacity="0.35" />
      <stop offset="1" stop-color="white" stop-opacity="0.04" />
    </linearGradient>
    <mask id="halftoneMask">
      <rect width="1200" height="800" fill="url(#halftoneFade)" />
    </mask>
  </defs>
  <rect width="1200" height="800" fill="url(#halftoneDots)" mask="url(#halftoneMask)" opacity="0.42" />
</svg>`;

// 10. Editorial Arcs: fine, offset circular strokes that frame rather than fill the page
const RAW_SVG_EDITORIAL_ARCS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <g opacity="0.26" stroke-width="1.4">
    <circle cx="1120" cy="40" r="150" />
    <circle cx="1120" cy="40" r="184" />
    <circle cx="1120" cy="40" r="218" />
    <path d="M920,0 A200,200 0 0 1 1200,200" stroke-width="3" opacity="0.52" />
    <circle cx="948" cy="210" r="3" fill="currentColor" stroke="none" />
    <circle cx="1020" cy="252" r="2" fill="currentColor" stroke="none" />
  </g>
  <g opacity="0.2" stroke-width="1.2">
    <circle cx="55" cy="770" r="120" />
    <circle cx="55" cy="770" r="151" />
    <path d="M0,610 A160,160 0 0 1 215,800" stroke-width="2.5" />
  </g>
</svg>`;

// 11. Soft Paper Waves: quiet flowing lines with a sparse, deterministic paper-grain texture
const RAW_SVG_SOFT_PAPER_WAVES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <defs>
    <pattern id="paperGrain" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="12" r="0.7" fill="currentColor" stroke="none" opacity="0.18" />
      <circle cx="31" cy="35" r="0.55" fill="currentColor" stroke="none" opacity="0.14" />
      <circle cx="43" cy="5" r="0.45" fill="currentColor" stroke="none" opacity="0.12" />
    </pattern>
  </defs>
  <rect width="1200" height="800" fill="url(#paperGrain)" stroke="none" opacity="0.34" />
  <g opacity="0.2" stroke-width="1.35">
    <path d="M-40,620 C180,540 330,690 560,620 S930,540 1240,635" />
    <path d="M-40,650 C180,570 330,720 560,650 S930,570 1240,665" />
    <path d="M-40,680 C180,600 330,750 560,680 S930,600 1240,695" />
    <path d="M-40,710 C180,630 330,780 560,710 S930,630 1240,725" />
  </g>
  <g opacity="0.15" stroke-width="1">
    <path d="M-30,105 C190,42 360,155 560,102 S930,45 1230,125" />
    <path d="M-30,130 C190,67 360,180 560,127 S930,70 1230,150" />
  </g>
</svg>`;

// 12. Quiet Starburst: a restrained sun-ray accent kept to the outer corners
const RAW_SVG_QUIET_STARBURST = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none" stroke="currentColor">
  <g transform="translate(1010 145)" opacity="0.24" stroke-width="1.4">
    <path d="M0,-132 L0,-72 M0,72 L0,132 M-132,0 L-72,0 M72,0 L132,0 M-93,-93 L-51,-51 M51,51 L93,93 M93,-93 L51,-51 M-51,51 L-93,93" />
    <path d="M-28,-110 L-15,-59 M28,110 L15,59 M-110,28 L-59,15 M110,-28 L59,-15 M-78,-78 L-42,-42 M78,78 L42,42 M78,-78 L42,-42 M-78,78 L-42,42" opacity="0.65" />
    <circle r="42" stroke-dasharray="2 7" />
    <path d="M0,-17 L5,-5 L17,0 L5,5 L0,17 L-5,5 L-17,0 L-5,-5 Z" fill="currentColor" stroke="none" opacity="0.58" />
  </g>
  <g transform="translate(170 680) scale(0.52)" opacity="0.15" stroke-width="1.8">
    <path d="M0,-100 L0,-52 M0,52 L0,100 M-100,0 L-52,0 M52,0 L100,0 M-71,-71 L-37,-37 M71,71 L37,37 M71,-71 L37,-37 M-71,71 L-37,37" />
    <circle r="30" stroke-dasharray="2 6" />
  </g>
</svg>`;

export const BACKGROUND_PRESETS: Record<BackgroundPreset['id'], BackgroundPreset> = {
  'canva-musical': {
    id: 'canva-musical',
    name: 'Canva Musical Staff & Sparkles',
    nameVi: 'Khuông nhạc & Ngôi sao Canva',
    description: 'Musical staff lines, treble clef, eighth notes and sparkling stars inspired by Tu Thi Van Anh Canva portfolio',
    category: 'musical',
    rawSvg: RAW_SVG_CANVA_MUSICAL,
    svgDataUri: svgToDataUri(RAW_SVG_CANVA_MUSICAL),
  },
  'botanical-leaves': {
    id: 'botanical-leaves',
    name: 'Botanical Leaves & Foliage',
    nameVi: 'Lá cây & Thực vật hữu cơ',
    description: 'Organic monstera silhouettes, curving fern leaves, and gentle botanical vines',
    category: 'nature',
    rawSvg: RAW_SVG_BOTANICAL,
    svgDataUri: svgToDataUri(RAW_SVG_BOTANICAL),
  },
  'cyber-mesh': {
    id: 'cyber-mesh',
    name: 'Cyber Mesh & Circuit Grid',
    nameVi: 'Lưới ma trận Cyber & Mạch điện tử',
    description: 'High-tech isometric grid, circuit traces, glowing nodes, and coordinate crosshairs',
    category: 'tech',
    rawSvg: RAW_SVG_CYBER_MESH,
    svgDataUri: svgToDataUri(RAW_SVG_CYBER_MESH),
  },
  'geometric-dots': {
    id: 'geometric-dots',
    name: 'Geometric Bauhaus Dot Matrix',
    nameVi: 'Ma trận chấm hình học Bauhaus',
    description: 'Modern Swiss dot grid pattern with alternating densities and minimalist corner anchors',
    category: 'geometry',
    rawSvg: RAW_SVG_GEOMETRIC_DOTS,
    svgDataUri: svgToDataUri(RAW_SVG_GEOMETRIC_DOTS),
  },
  'abstract-blobs': {
    id: 'abstract-blobs',
    name: 'Abstract Fluid Blobs',
    nameVi: 'Hình khối hữu cơ & Giọt lỏng',
    description: 'Soft layered watercolor blobs with fluid contour edges and floating droplets',
    category: 'organic',
    rawSvg: RAW_SVG_ABSTRACT_BLOBS,
    svgDataUri: svgToDataUri(RAW_SVG_ABSTRACT_BLOBS),
  },
  'celestial-sparkles': {
    id: 'celestial-sparkles',
    name: 'Celestial Sparkles & Constellations',
    nameVi: 'Bầu trời đêm & Chòm sao lấp lánh',
    description: 'Night sky constellations, crescent moon silhouette, and radiant 4-point and 8-point stars',
    category: 'celestial',
    rawSvg: RAW_SVG_CELESTIAL,
    svgDataUri: svgToDataUri(RAW_SVG_CELESTIAL),
  },
  'vintage-parchment': {
    id: 'vintage-parchment',
    name: 'Vintage Parchment & Filigree',
    nameVi: 'Họa tiết cổ điển & Khung viền chỉ',
    description: 'Victorian ornamental corner flourishes, antique double borders, and refined scrollwork',
    category: 'vintage',
    rawSvg: RAW_SVG_VINTAGE_PARCHMENT,
    svgDataUri: svgToDataUri(RAW_SVG_VINTAGE_PARCHMENT),
  },
  'minimalist-contour': {
    id: 'minimalist-contour',
    name: 'Minimalist Topographic Contour',
    nameVi: 'Đường đồng mức Địa hình Tối giản',
    description: 'Continuous architectural elevation lines and modern wave landscape contours',
    category: 'minimal',
    rawSvg: RAW_SVG_MINIMALIST_CONTOUR,
    svgDataUri: svgToDataUri(RAW_SVG_MINIMALIST_CONTOUR),
  },
  'halftone-field': {
    id: 'halftone-field',
    name: 'Fading Editorial Halftone',
    nameVi: 'Chấm Halftone Biên tập Mờ dần',
    description: 'A fine dot screen that softly fades toward open space for a light editorial texture',
    category: 'editorial',
    rawSvg: RAW_SVG_HALFTONE_FIELD,
    svgDataUri: svgToDataUri(RAW_SVG_HALFTONE_FIELD),
    patternSize: 'min(480px, 68vw) auto',
  },
  'editorial-arcs': {
    id: 'editorial-arcs',
    name: 'Editorial Corner Arcs',
    nameVi: 'Cung tròn Góc Biên tập',
    description: 'Fine offset arcs and tiny accents that frame page corners without crowding content',
    category: 'editorial',
    rawSvg: RAW_SVG_EDITORIAL_ARCS,
    svgDataUri: svgToDataUri(RAW_SVG_EDITORIAL_ARCS),
  },
  'soft-paper-waves': {
    id: 'soft-paper-waves',
    name: 'Soft Paper & Waves',
    nameVi: 'Giấy Mềm & Đường Sóng',
    description: 'A lightweight sparse grain with quiet flowing lines at the page edges',
    category: 'paper',
    rawSvg: RAW_SVG_SOFT_PAPER_WAVES,
    svgDataUri: svgToDataUri(RAW_SVG_SOFT_PAPER_WAVES),
    patternSize: 'min(720px, 92vw) auto',
  },
  'quiet-starburst': {
    id: 'quiet-starburst',
    name: 'Quiet Corner Starburst',
    nameVi: 'Tia sáng Nhẹ ở Góc',
    description: 'A subtle hand-drawn sunburst accent, anchored away from the main content area',
    category: 'editorial',
    rawSvg: RAW_SVG_QUIET_STARBURST,
    svgDataUri: svgToDataUri(RAW_SVG_QUIET_STARBURST),
  },
};

export const BACKGROUND_PRESET_LIST: BackgroundPreset[] = Object.values(BACKGROUND_PRESETS);

export function getBackgroundPreset(presetId?: string): BackgroundPreset | undefined {
  if (!presetId || presetId === 'none') return undefined;
  return BACKGROUND_PRESETS[presetId as BackgroundPreset['id']];
}
