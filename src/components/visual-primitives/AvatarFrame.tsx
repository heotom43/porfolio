"use client";

import React from "react";
import { isDarkColor } from "./colorUtils";

export interface AvatarFrameProps {
  avatar?: {
    url?: string;
    frameStyle?:
      | "arch-window"
      | "cutout-blob"
      | "polaroid"
      | "geometric-badge"
      | "circle-ring"
      | "clean-card"
      | "circle"
      | "rounded-rect"
      | "none"
      | string;
    aspectRatio?: "3/4" | "1/1" | "4/5" | "none" | string;
    sourceType?: string;
  } | null;
  alt?: string;
  fullName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  surfaceColor?: string;
  enableTilt?: boolean;
  enableGlow?: boolean;
  className?: string;
}

function getMonogramInitials(name?: string, alt?: string): string {
  const raw = (name || alt || "").trim();
  if (!raw) return "✦";
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  const first = words[0].charAt(0).toUpperCase();
  const last = words[words.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
}

export function AvatarFrame({
  avatar,
  alt = "Profile Portrait",
  fullName,
  primaryColor = "#A96B54",
  secondaryColor = "#304254",
  surfaceColor = "#FFFFFF",
  enableTilt = false,
  enableGlow = false,
  className = "",
}: AvatarFrameProps) {
  const rawStyle = avatar?.frameStyle || "arch-window";
  // Normalize style aliases
  const style =
    rawStyle === "circle"
      ? "circle-ring"
      : rawStyle === "rounded-rect"
        ? "clean-card"
        : rawStyle;

  const rawAspect = avatar?.aspectRatio || "3/4";
  const aspectStyle: React.CSSProperties =
    rawAspect === "none"
      ? {}
      : {
          aspectRatio: rawAspect,
        };

  const displayName = fullName || alt;
  const initials = getMonogramInitials(fullName, alt);
  const darkSurface = isDarkColor(surfaceColor);
  const hasUrl = Boolean(avatar?.url && avatar.url.trim() !== "");

  // Render Image or Monogram Fallback
  const renderContent = () => {
    if (hasUrl) {
      return (
        <img
          src={avatar!.url}
          alt={displayName}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out hover:scale-105"
        />
      );
    }

    // Monogram Fallback
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-extrabold tracking-widest text-white shadow-inner backdrop-blur-sm sm:h-28 sm:w-28 sm:text-4xl">
          <span>{initials}</span>
          <span className="absolute -right-1 -top-1 text-sm text-amber-300">
            ✦
          </span>
        </div>
        <p className="mt-4 line-clamp-1 max-w-[200px] text-xs font-bold uppercase tracking-wider text-white/90">
          {displayName}
        </p>
      </div>
    );
  };

  // 1. Arch Window Frame
  if (style === "arch-window") {
    return (
      <div className={`relative mx-auto w-full max-w-[340px] ${className}`}>
        {/* Offset decorative arch backdrop */}
        <div
          className="absolute -bottom-3 -right-3 inset-0 rounded-t-[999px] rounded-b-3xl opacity-25"
          style={{ backgroundColor: primaryColor }}
          aria-hidden="true"
        />
        <div
          className="relative overflow-hidden rounded-t-[999px] rounded-b-3xl border-[3px] shadow-xl"
          style={{
            ...aspectStyle,
            borderColor: secondaryColor,
            backgroundColor: surfaceColor,
          }}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  // 2. Cutout Blob Frame
  if (style === "cutout-blob") {
    return (
      <div className={`relative mx-auto w-full max-w-[340px] ${className}`}>
        <div
          className="absolute -inset-2 opacity-25 blur-sm"
          style={{
            backgroundColor: primaryColor,
            borderRadius: "62% 38% 46% 54% / 56% 42% 58% 44%",
          }}
          aria-hidden="true"
        />
        <div
          className="relative overflow-hidden border-4 shadow-xl"
          style={{
            ...aspectStyle,
            borderColor: surfaceColor,
            borderRadius: "58% 42% 48% 52% / 52% 44% 56% 48%",
            backgroundColor: surfaceColor,
          }}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  // 3. Polaroid Frame (-2deg tilt with authentic masking tape)
  if (style === "polaroid") {
    return (
      <div
        className={`${enableTilt ? "hover-tilt" : ""} relative mx-auto w-full max-w-[320px] -rotate-2 rounded-sm p-3.5 pb-12 shadow-2xl ring-1 transition-all ${
          darkSurface ? "ring-white/15" : "ring-black/10"
        } ${className}`}
        style={{ backgroundColor: surfaceColor }}
      >
        {/* Masking tape on top center */}
        <div
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 opacity-85 shadow-sm"
          style={{
            backgroundColor: "#F3DEC0",
            border: "1px solid rgba(160, 120, 80, 0.2)",
          }}
          aria-hidden="true"
        />
        <div
          className="overflow-hidden rounded-sm bg-stone-100 shadow-inner"
          style={aspectStyle}
        >
          {renderContent()}
        </div>
        <p
          className={`mt-3 truncate text-center font-editorial text-sm italic ${
            darkSurface ? "text-stone-200" : "text-stone-600"
          }`}
        >
          {displayName}
        </p>
      </div>
    );
  }

  // 4. Geometric Badge Frame
  if (style === "geometric-badge") {
    return (
      <div className={`relative mx-auto w-full max-w-[330px] p-2 ${className}`}>
        {/* Offset geometric shadow backdrop */}
        <div
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 opacity-30"
          style={{
            backgroundColor: primaryColor,
            clipPath:
              "polygon(14% 0%, 86% 0%, 100% 14%, 100% 86%, 86% 100%, 14% 100%, 0% 86%, 0% 14%)",
          }}
          aria-hidden="true"
        />
        <div
          className="relative overflow-hidden border-2 shadow-xl"
          style={{
            ...aspectStyle,
            borderColor: secondaryColor,
            backgroundColor: surfaceColor,
            clipPath:
              "polygon(14% 0%, 86% 0%, 100% 14%, 100% 86%, 86% 100%, 14% 100%, 0% 86%, 0% 14%)",
          }}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  // 5. Circle Ring Frame (concentric double ring)
  if (style === "circle-ring") {
    return (
      <div
        className={`relative mx-auto aspect-square w-full max-w-[320px] p-2.5 ${className}`}
      >
        {/* Outer concentric dashed ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed opacity-45"
          style={{ borderColor: primaryColor }}
          aria-hidden="true"
        />
        {/* Inner solid circular photo frame */}
        <div
          className="relative h-full w-full overflow-hidden rounded-full border-4 shadow-xl"
          style={{
            borderColor: secondaryColor,
            backgroundColor: surfaceColor,
          }}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  // 6. Clean Card Frame (rounded modern card with glow/border)
  if (style === "clean-card") {
    return (
      <div
        className={`${enableGlow ? "card-glow" : ""} relative mx-auto w-full max-w-[340px] overflow-hidden rounded-3xl border-2 shadow-xl ${className}`}
        style={{
          ...aspectStyle,
          borderColor: primaryColor,
          backgroundColor: surfaceColor,
        }}
      >
        {renderContent()}
      </div>
    );
  }

  // 7. None / Unadorned
  return (
    <div
      className={`relative mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl shadow-md ${className}`}
      style={{
        ...aspectStyle,
        backgroundColor: surfaceColor,
      }}
    >
      {renderContent()}
    </div>
  );
}
