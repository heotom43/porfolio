"use client";

import React from "react";
import type { BackgroundIllustrationConfig } from "@/schema/portfolio.schema";
import {
  getBackgroundPreset,
  type BackgroundPreset,
} from "@/data/background-presets";

export interface BackgroundIllustrationLayerProps {
  config?: BackgroundIllustrationConfig;
  primaryColor?: string;
  className?: string;
}

export function BackgroundIllustrationLayer({
  config,
  primaryColor = "#A96B54",
  className = "",
}: BackgroundIllustrationLayerProps) {
  if (!config || config.mode === "none") {
    return null;
  }

  const opacity = config.opacity ?? 0.15;
  const blur = config.blur ?? 0;
  const position = config.position ?? "cover";

  const filterStyle = blur > 0 ? `blur(${blur}px)` : undefined;

  // Custom User Uploaded Illustration (URL or Base64)
  if (config.mode === "custom") {
    if (!config.customUrl || config.customUrl.trim() === "") {
      return null;
    }

    if (position === "pattern-repeat") {
      return (
        <div
          className={`portfolio-parallax-layer pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
          style={{
            backgroundImage: `url(${config.customUrl})`,
            backgroundRepeat: "repeat",
            backgroundSize: "360px auto",
            opacity,
            filter: filterStyle,
          }}
          aria-hidden="true"
        />
      );
    }

    const positionClass =
      position === "top-right"
        ? "absolute top-0 right-0 w-[48%] max-w-[640px] h-auto object-contain"
        : position === "bottom-left"
          ? "absolute bottom-0 left-0 w-[48%] max-w-[640px] h-auto object-contain"
          : position === "center"
            ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[75%] max-h-[75%] object-contain"
            : "w-full h-full object-cover";

    return (
      <div
        className={`portfolio-parallax-layer pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
        aria-hidden="true"
      >
        <img
          src={config.customUrl}
          alt=""
          className={positionClass}
          style={{
            opacity,
            filter: filterStyle,
          }}
        />
      </div>
    );
  }

  // Preset Mode
  const preset = getBackgroundPreset(config.presetId);
  if (!preset) {
    return null;
  }

  if (position === "pattern-repeat") {
    return (
      <div
        className={`portfolio-parallax-layer pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
        style={{
          backgroundImage: `url("${preset.svgDataUri}")`,
          backgroundRepeat: "repeat",
          backgroundSize: preset.patternSize ?? "400px auto",
          color: primaryColor,
          opacity,
          filter: filterStyle,
        }}
        aria-hidden="true"
      />
    );
  }

  const presetPositionClass =
    position === "top-right"
      ? "absolute top-0 right-0 w-[50%] max-w-[650px] h-auto"
      : position === "bottom-left"
        ? "absolute bottom-0 left-0 w-[50%] max-w-[650px] h-auto"
        : position === "center"
          ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[800px] h-auto"
          : "w-full h-full";

  return (
    <div
      className={`portfolio-parallax-layer pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <div
        className={presetPositionClass}
        style={{
          color: primaryColor,
          opacity,
          filter: filterStyle,
        }}
        dangerouslySetInnerHTML={{ __html: preset.rawSvg }}
      />
    </div>
  );
}

export interface SectionMotifProps {
  presetId: BackgroundPreset["id"];
  primaryColor?: string;
  opacity?: number;
  blur?: number;
  position?:
    "cover" | "top-right" | "bottom-left" | "center" | "pattern-repeat";
  className?: string;
}

/**
 * Renders a preset inside its nearest positioned section instead of the viewport.
 * The owning section should be positioned and clip overflow if it needs a contained motif.
 */
export function SectionMotif({
  presetId,
  primaryColor = "#A96B54",
  opacity = 0.12,
  blur = 0,
  position = "cover",
  className = "",
}: SectionMotifProps) {
  const preset = getBackgroundPreset(presetId);
  if (!preset) return null;

  const filterStyle = blur > 0 ? `blur(${blur}px)` : undefined;

  if (position === "pattern-repeat") {
    return (
      <div
        className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
        style={{
          backgroundImage: `url("${preset.svgDataUri}")`,
          backgroundRepeat: "repeat",
          backgroundSize: preset.patternSize ?? "400px auto",
          color: primaryColor,
          opacity,
          filter: filterStyle,
        }}
        aria-hidden="true"
      />
    );
  }

  const presetPositionClass =
    position === "top-right"
      ? "absolute top-0 right-0 w-[50%] max-w-[650px] aspect-[3/2]"
      : position === "bottom-left"
        ? "absolute bottom-0 left-0 w-[50%] max-w-[650px] aspect-[3/2]"
        : position === "center"
          ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[800px] aspect-[3/2]"
          : "absolute inset-0 w-full h-full";
  const sectionSvg = preset.rawSvg.replace(
    "<svg ",
    '<svg width="100%" height="100%" ',
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <div
        className={presetPositionClass}
        style={{
          color: primaryColor,
          opacity,
          filter: filterStyle,
        }}
        dangerouslySetInnerHTML={{ __html: sectionSvg }}
      />
    </div>
  );
}
