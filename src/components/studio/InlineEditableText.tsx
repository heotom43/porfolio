'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';

export interface InlineEditableTextProps {
  value: string;
  onSave?: (newValue: string) => void;
  editable?: boolean;
  multiline?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  ariaLabel?: string;
  maxLength?: number;
  rows?: number;
}

export function InlineEditableText({
  value,
  onSave,
  editable = true,
  multiline = false,
  as: Component = 'span',
  className = '',
  inputClassName = '',
  placeholder = 'Nhấp để nhập nội dung...',
  ariaLabel,
  maxLength,
  rows = 3,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  // Zero-overhead display mode when editing is disabled
  if (!editable) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  const handleCommit = () => {
    setIsEditing(false);
    if (draft !== value && onSave) {
      onSave(draft);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancel();
    } else if (e.key === 'Enter') {
      if (!multiline) {
        e.preventDefault();
        e.stopPropagation();
        handleCommit();
      } else if (e.ctrlKey || e.metaKey) {
        // For multiline, Ctrl+Enter or Cmd+Enter submits
        e.preventDefault();
        e.stopPropagation();
        handleCommit();
      }
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <div className="relative inline-block w-full">
          <textarea
            ref={textareaRef}
            data-testid="inline-editable-textarea"
            rows={rows}
            maxLength={maxLength}
            value={draft}
            aria-label={ariaLabel ?? placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-lg border-2 border-amber-500 bg-white/95 p-2 text-stone-900 shadow-lg outline-none ring-2 ring-amber-400/40 backdrop-blur-sm transition ${className} ${inputClassName}`}
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
            <span>Enter = dòng mới • Ctrl+Enter = lưu • Esc = hủy</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleCommit();
              }}
              className="rounded bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Lưu
            </button>
          </div>
        </div>
      );
    }

    return (
      <span className="relative inline-flex items-center">
        <input
          ref={inputRef}
          type="text"
          data-testid="inline-editable-input"
          maxLength={maxLength}
          value={draft}
          aria-label={ariaLabel ?? placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`rounded-md border-2 border-amber-500 bg-white/95 px-2 py-0.5 text-stone-900 shadow-md outline-none ring-2 ring-amber-400/40 backdrop-blur-sm transition ${className} ${inputClassName}`}
        />
      </span>
    );
  }

  const isEmpty = !value || value.trim().length === 0;

  return (
    <Component
      data-testid="inline-editable-trigger"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      title="Nhấp đúp hoặc nhấp để sửa trực tiếp"
      className={`group/inline relative cursor-pointer rounded transition-all duration-150 hover:bg-amber-50/40 hover:outline hover:outline-1 hover:outline-dashed hover:outline-amber-400 hover:ring-2 hover:ring-amber-300/30 ${
        isEmpty ? 'italic text-stone-400' : ''
      } ${className}`}
    >
      <span>{isEmpty ? placeholder : value}</span>
      <span className="ml-1.5 inline-flex align-middle opacity-0 transition-opacity duration-150 group-hover/inline:opacity-70">
        <Pencil className="h-3 w-3 text-amber-600" />
      </span>
    </Component>
  );
}
