'use client';

import React from 'react';
import { Sparkles, FileText, Upload, RefreshCw, Wand2, Loader2 } from 'lucide-react';
import type { MediaSourceType } from '@/schema/portfolio.schema';

export interface ImageSourceBadgeProps {
  sourceType: MediaSourceType;
  editable?: boolean;
  isGenerating?: boolean;
  onRegenerateAiImage?: () => void;
  onSwitchToDocx?: () => void;
  compact?: boolean;
}

export function ImageSourceBadge({
  sourceType,
  editable = false,
  isGenerating = false,
  onRegenerateAiImage,
  onSwitchToDocx,
  compact = false,
}: ImageSourceBadgeProps) {
  const badgeConfig =
    sourceType === 'docx-extracted'
      ? {
          icon: FileText,
          label: '📄 Ảnh từ file DOCX',
          bg: 'bg-emerald-950/85 text-emerald-50 border-emerald-400/40',
        }
      : sourceType === 'ai-generated'
      ? {
          icon: Sparkles,
          label: '✨ Ảnh tạo bởi AI',
          bg: 'bg-amber-950/85 text-amber-50 border-amber-400/40',
        }
      : {
          icon: Upload,
          label: '🖼️ Ảnh tải lên',
          bg: 'bg-slate-900/85 text-slate-50 border-slate-400/40',
        };

  if (!editable) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto flex flex-col gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-md backdrop-blur-md ${badgeConfig.bg}`}
      >
        <span>{badgeConfig.label}</span>
      </div>

      {(onRegenerateAiImage || onSwitchToDocx) && (
        <div className="flex flex-wrap gap-1.5">
          {onRegenerateAiImage && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={onRegenerateAiImage}
              className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-900 shadow-md ring-1 ring-stone-900/10 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
              title="Tạo ảnh AI mới theo chủ đề bài tập"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
              ) : (
                <Wand2 className="h-3 w-3 text-amber-600" />
              )}
              <span>{compact ? 'Ảnh AI mới' : '🎨 Tạo ảnh AI mới theo chủ đề'}</span>
            </button>
          )}

          {onSwitchToDocx && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={onSwitchToDocx}
              className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-800 shadow-md ring-1 ring-stone-900/10 transition hover:bg-emerald-50 disabled:opacity-60"
              title="Chuyển sang ảnh bóc tách từ file DOCX"
            >
              <RefreshCw className="h-3 w-3 text-emerald-700" />
              <span>{compact ? 'Ảnh DOCX' : '🔄 Đổi ảnh khác trong DOCX'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
