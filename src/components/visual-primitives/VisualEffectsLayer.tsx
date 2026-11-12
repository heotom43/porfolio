"use client";

import React from "react";
import type { VisualEffectsConfig } from "@/schema/portfolio.schema";

export interface VisualEffectsLayerProps {
  effects?: VisualEffectsConfig;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

interface SparkleItem {
  id: number;
  top: string;
  left?: string;
  right?: string;
  size: number;
  delay: string;
  duration: string;
  colorType: "primary" | "secondary" | "gold";
}

const STATIC_SPARKLES: SparkleItem[] = [
  {
    id: 1,
    top: "12%",
    left: "8%",
    size: 22,
    delay: "0s",
    duration: "3.6s",
    colorType: "primary",
  },
  {
    id: 2,
    top: "22%",
    right: "10%",
    size: 18,
    delay: "0.9s",
    duration: "4.2s",
    colorType: "secondary",
  },
  {
    id: 3,
    top: "45%",
    left: "5%",
    size: 16,
    delay: "1.8s",
    duration: "3.2s",
    colorType: "gold",
  },
  {
    id: 4,
    top: "58%",
    right: "7%",
    size: 24,
    delay: "0.4s",
    duration: "4.8s",
    colorType: "primary",
  },
  {
    id: 5,
    top: "78%",
    left: "12%",
    size: 20,
    delay: "2.3s",
    duration: "3.9s",
    colorType: "secondary",
  },
  {
    id: 6,
    top: "88%",
    right: "14%",
    size: 16,
    delay: "1.2s",
    duration: "3.4s",
    colorType: "gold",
  },
];

export function VisualEffectsLayer({
  effects,
  primaryColor = "#A96B54",
  secondaryColor = "#304254",
  className = "",
}: VisualEffectsLayerProps) {
  if (!effects) return null;

  const { enableFloat, enableGlow, enableSparkles } = effects;

  if (!enableFloat && !enableGlow && !enableSparkles) {
    return null;
  }

  const resolveColor = (type: SparkleItem["colorType"]) => {
    switch (type) {
      case "primary":
        return primaryColor;
      case "secondary":
        return secondaryColor;
      case "gold":
        return "#F59E0B";
    }
  };

  return (
    <div
      className={`portfolio-parallax-layer pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
      data-testid="portfolio-visual-effects"
      aria-hidden="true"
    >
      {/* 1. Ambient Floating Orbs (when enableFloat is active) */}
      {enableFloat && (
        <>
          {/* Top-Left Floating Orb */}
          <div
            className="animate-float absolute -left-20 -top-20 h-96 w-96 rounded-full opacity-35 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${primaryColor}40 0%, ${primaryColor}00 70%)`,
              animationDuration: "6s",
              animationDelay: "0s",
            }}
          />

          {/* Top-Right Floating Orb */}
          <div
            className="animate-float absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${secondaryColor}35 0%, ${secondaryColor}00 70%)`,
              animationDuration: "7.5s",
              animationDelay: "1.5s",
            }}
          />

          {/* Bottom-Left Floating Orb */}
          <div
            className="animate-float absolute bottom-20 left-1/3 h-80 w-80 rounded-full opacity-25 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${primaryColor}30 0%, ${primaryColor}00 70%)`,
              animationDuration: "5.2s",
              animationDelay: "2.5s",
            }}
          />
        </>
      )}

      {/* 2. Ambient Glow Spots (when enableGlow is active) */}
      {enableGlow && (
        <>
          <div
            className="animate-glow absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full opacity-25 blur-[100px]"
            style={{
              background: `radial-gradient(circle, ${primaryColor}55 0%, transparent 65%)`,
            }}
          />
          <div
            className="animate-glow absolute left-1/6 bottom-1/4 h-[450px] w-[450px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: `radial-gradient(circle, ${secondaryColor}45 0%, transparent 65%)`,
              animationDelay: "1.6s",
            }}
          />
        </>
      )}

      {/* 3. Animated Sparkle Particles (when enableSparkles is active) */}
      {enableSparkles &&
        STATIC_SPARKLES.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle-particles absolute"
            style={{
              top: sparkle.top,
              left: sparkle.left,
              right: sparkle.right,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animationDelay: sparkle.delay,
              animationDuration: sparkle.duration,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={resolveColor(sparkle.colorType)}
              className="h-full w-full drop-shadow-sm"
              aria-hidden="true"
            >
              <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
            </svg>
          </div>
        ))}
    </div>
  );
}
