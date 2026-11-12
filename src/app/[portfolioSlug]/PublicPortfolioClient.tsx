'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Compass,
  Download,
  Link2,
  Loader2,
  Pencil,
  Printer,
  X,
} from 'lucide-react';
import type {
  PortfolioDocument,
  PortfolioSection,
} from '@/schema/portfolio.schema';
import { PortfolioRenderer } from '@/engine/PortfolioRenderer';
import { getThemeTokens } from '@/templates/archetypes/archetypeStyles';

const FLOATING_NAV_LABELS: Record<PortfolioSection['type'], string> = {
  hero: 'Bìa mở đầu',
  about: 'Giới thiệu',
  skills: 'Kỹ năng',
  experience: 'Kinh nghiệm',
  education: 'Học vấn',
  projects: 'Bài tập & Dự án tiêu biểu',
  contact: 'Liên hệ',
};

const PRINT_SLIDE_STYLES = `
@page {
  size: A4 landscape;
  margin: 10mm;
}
@media print {
  html, body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .public-portfolio-print-root section {
    break-inside: avoid-page;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
  }
  .public-portfolio-print-root #projects {
    break-inside: auto;
    page-break-inside: auto;
    break-after: auto;
    page-break-after: auto;
  }
  .public-portfolio-print-root #projects article {
    break-inside: avoid-page;
    page-break-inside: avoid;
    break-after: page;
    page-break-after: always;
  }
  .public-portfolio-print-root #contact {
    break-after: auto;
    page-break-after: auto;
  }
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

export function PublicPortfolioClient({
  document: portfolioDoc,
}: {
  document: PortfolioDocument;
}) {
  const [downloading, setDownloading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(() => {
    const seen = new Set<PortfolioSection['type']>();
    return portfolioDoc.sections
      .filter((sec) => {
        if (seen.has(sec.type)) return false;
        seen.add(sec.type);
        return true;
      })
      .map((sec) => ({
        id: sec.type,
        label: FLOATING_NAV_LABELS[sec.type],
      }));
  }, [portfolioDoc.sections]);

  useEffect(() => {
    const root = window.document.documentElement;
    const previousThumb = root.style.getPropertyValue('--scrollbar-thumb');
    const previousTrack = root.style.getPropertyValue('--scrollbar-track');
    root.style.setProperty('--scrollbar-thumb', portfolioDoc.theme.primaryColor);
    root.style.setProperty('--scrollbar-track', portfolioDoc.theme.backgroundColor);

    return () => {
      if (previousThumb) {
        root.style.setProperty('--scrollbar-thumb', previousThumb);
      } else {
        root.style.removeProperty('--scrollbar-thumb');
      }
      if (previousTrack) {
        root.style.setProperty('--scrollbar-track', previousTrack);
      } else {
        root.style.removeProperty('--scrollbar-track');
      }
    };
  }, [portfolioDoc.theme.backgroundColor, portfolioDoc.theme.primaryColor]);

  const [activeSection, setActiveSection] = useState<PortfolioSection['type']>(
    navItems[0]?.id ?? 'hero'
  );

  useEffect(() => {
    if (navItems.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id as PortfolioSection['type']);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.4] }
    );

    for (const item of navItems) {
      const el = window.document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [navItems]);

  const handleJumpToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: PortfolioSection['type']
  ) => {
    e.preventDefault();
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    window.document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setExportError('Không thể sao chép liên kết vào bộ nhớ tạm.');
    }
  };

  const handleDownloadZip = async () => {
    setExportError(null);
    setDownloading(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: portfolioDoc, format: 'zip' }),
      });
      if (!res.ok) {
        throw new Error('Không thể đóng gói file ZIP lúc này.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${portfolioDoc.slug}.zip`;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : 'Xuất file ZIP thất bại.'
      );
    } finally {
      setDownloading(false);
    }
  };

  const tokens = getThemeTokens(portfolioDoc.theme);
  const dockContainerClass =
    'border-[var(--primary)]/20 bg-[var(--surface)]/95 text-[var(--text)]';
  const inactiveNavItemClass =
    'text-[var(--text)] hover:bg-[var(--primary)]/10';
  const actionButtonClass =
    'text-[var(--text)] hover:bg-[var(--primary)]/10';
  const primaryActionStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary)',
    color: 'var(--bg)',
  };
  const activeNavStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary)',
    color: 'var(--bg)',
  };

  return (
    <div
      className="public-portfolio-print-root relative print:pb-0"
      style={tokens.cssVariables as React.CSSProperties}
    >
      <style>{PRINT_SLIDE_STYLES}</style>

      <PortfolioRenderer document={portfolioDoc} editable={false} />

      {/* Export Error Toast */}
      {exportError && (
        <div
          role="alert"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800 shadow-lg no-print"
        >
          <span>{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError(null)}
            aria-label="Đóng thông báo lỗi"
            className="rounded-full p-0.5 hover:bg-rose-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating Section Anchor Navigation (Bottom-Left) */}
      {navItems.length > 0 && (
        <>
          <nav
            aria-label="Điều hướng nhanh Portfolio"
            className={`fixed bottom-4 left-4 z-40 hidden items-center gap-1 rounded-full border p-1.5 shadow-xl backdrop-blur-md lg:flex no-print ${dockContainerClass}`}
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleJumpToSection(e, item.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isActive ? 'shadow-sm' : inactiveNavItemClass
                  }`}
                  style={isActive ? activeNavStyle : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </>
      )}

      {/* Desktop action dock */}
      <div
        className={`fixed bottom-4 right-4 z-40 hidden items-center gap-1.5 rounded-full border p-1.5 shadow-xl backdrop-blur-md no-print lg:flex ${dockContainerClass}`}
        style={{ display: 'none' }}
      >
        <button
          type="button"
          onClick={handleCopyLink}
          title="Sao chép liên kết Portfolio"
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:inline-flex sm:px-3 ${actionButtonClass}`}
        >
          {copiedLink ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {copiedLink ? 'Đã sao chép' : 'Sao chép link'}
          </span>
        </button>
        <Link
          href="/studio"
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:inline-flex sm:px-3 ${actionButtonClass}`}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sửa trong Studio</span>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${actionButtonClass}`}
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Xuất PDF</span>
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadZip}
          style={primaryActionStyle}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition hover:opacity-90 disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          <span>Tải ZIP</span>
        </button>
      </div>

      {/* Compact mobile dock combines navigation and actions to avoid overlap. */}
      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 flex items-center justify-start gap-2 lg:hidden no-print">
        {navItems.length > 0 ? (
          <div className="relative shrink-0">
            {mobileNavOpen && (
              <div
                className={`absolute bottom-full left-0 mb-2 flex max-h-[60vh] min-w-[210px] flex-col gap-1 overflow-y-auto rounded-2xl border p-2 shadow-2xl backdrop-blur-md ${dockContainerClass}`}
              >
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        handleJumpToSection(e, item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        isActive ? '' : inactiveNavItemClass
                      }`}
                      style={isActive ? activeNavStyle : undefined}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-expanded={mobileNavOpen}
              aria-label={
                mobileNavOpen
                  ? 'Đóng mục lục điều hướng'
                  : 'Mở mục lục điều hướng'
              }
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold shadow-xl backdrop-blur-md transition ${dockContainerClass} ${actionButtonClass}`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Mục lục</span>
            </button>
          </div>
        ) : (
          <span />
        )}

      </div>
    </div>
  );
}
