'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Wand2,
  Layers,
  UserCircle2,
} from 'lucide-react';
import type { ImageMode, ProjectMediaItem, VisualStyle } from '@/schema/portfolio.schema';
import type {
  RawDocxExtractionResult,
  SummarizeAssignmentsResponse,
} from '@/schema/docx-ingestion.schema';
import {
  CANVA_REFERENCE_THEME,
  usePortfolioStore,
} from '@/store/usePortfolioStore';

export interface DocxImportWizardProps {
  open: boolean;
  onClose: () => void;
}

const IMAGE_MODE_OPTIONS: Array<{
  value: ImageMode;
  title: string;
  badge?: string;
  desc: string;
}> = [
  {
    value: 'hybrid-auto',
    title: 'Tự động kết hợp (Khuyên dùng)',
    badge: 'Thông minh',
    desc: 'Ưu tiên lấy ảnh có sẵn trong file .docx. Bài tập nào không có ảnh sẽ tự động dùng AI vẽ ảnh minh họa theo chủ đề.',
  },
  {
    value: 'docx-extract',
    title: 'Chỉ dùng ảnh gốc trong file .docx',
    desc: 'Giữ nguyên toàn bộ ảnh chụp màn hình, biểu đồ hoặc thiết kế nhúng sẵn trong file Word.',
  },
  {
    value: 'ai-generate-all',
    title: 'Tạo mới toàn bộ ảnh bằng AI theo chủ đề',
    desc: 'AI đọc chủ đề từng bài tập và sinh bộ ảnh minh họa đồng bộ 100% với tông màu Portfolio.',
  },
];

const VISUAL_STYLE_OPTIONS: Array<{ value: VisualStyle; label: string }> = [
  { value: 'canva-pastel-graphic', label: 'Canva Pastel Graphic' },
  { value: 'editorial-illustration', label: 'Editorial Flat Illustration' },
  { value: '3d-render', label: '3D Isometric Render' },
  { value: 'minimal-photo', label: 'Minimalist Realistic Photo' },
];

export function DocxImportWizard({ open, onClose }: DocxImportWizardProps) {
  const { applyDocxSummaryToPortfolio } = usePortfolioStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [useSampleDocx, setUseSampleDocx] = useState(false);

  const [fullName, setFullName] = useState('Từ Thị Vân Anh');
  const [roleTitle, setRoleTitle] = useState('AI Content Creator & Digital Marketer');
  const [email, setEmail] = useState('tuthivananh865@gmail.com');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null);
  const [avatarPreviewError, setAvatarPreviewError] = useState(false);

  const [imageMode, setImageMode] = useState<ImageMode>('hybrid-auto');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('canva-pastel-graphic');

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extractions, setExtractions] = useState<RawDocxExtractionResult[]>([]);
  const [summaryResult, setSummaryResult] =
    useState<SummarizeAssignmentsResponse | null>(null);

  if (!open) return null;

  const handleFilePick = (picked: FileList | null) => {
    if (!picked) return;
    const valid = Array.from(picked).filter((f) =>
      f.name.toLowerCase().endsWith('.docx')
    );
    if (valid.length === 0) {
      setErrorMsg('Vui lòng chọn file định dạng .docx');
      return;
    }
    setErrorMsg(null);
    setUseSampleDocx(false);
    setFiles((prev) => [...prev, ...valid]);
  };

  const handleAvatarFilePick = (picked: FileList | null) => {
    const file = picked?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn file ảnh hợp lệ (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setErrorMsg(null);
        setAvatarPreviewError(false);
        setAvatarFileName(file.name);
        setAvatarUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file ảnh đại diện. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleRunPipeline = async () => {
    if (!useSampleDocx && files.length === 0) {
      setErrorMsg('Hãy chọn ít nhất 1 file .docx hoặc dùng file mẫu.');
      return;
    }
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // 1. Ingest DOCX files
      setStatusMessage('Đang giải nén file .docx và bóc tách văn bản + hình ảnh...');
      let ingestData: { extractions: RawDocxExtractionResult[] };

      if (useSampleDocx) {
        const res = await fetch('/api/docx-ingest?useSample=true', {
          method: 'POST',
        });
        if (!res.ok) throw new Error(await res.text());
        ingestData = await res.json();
      } else {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        const res = await fetch('/api/docx-ingest', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(await res.text());
        ingestData = await res.json();
      }

      setExtractions(ingestData.extractions);

      // 2. Summarize assignments & generate topic AI images if needed
      setStatusMessage(
        'AI đang tóm tắt các bài tập thành Case Study và xử lý hình ảnh...'
      );
      const trimmedAvatar = avatarUrl.trim();
      const sumRes = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractions: ingestData.extractions,
          studentProfile: {
            fullName: fullName.trim() || undefined,
            roleTitle: roleTitle.trim() || undefined,
            email: email.trim() || undefined,
            avatarUrl:
              trimmedAvatar && !trimmedAvatar.startsWith('data:')
                ? trimmedAvatar
                : undefined,
          },
          imageMode,
          visualStyle,
          themeColors: {
            primaryColor: CANVA_REFERENCE_THEME.primaryColor,
            backgroundColor: CANVA_REFERENCE_THEME.backgroundColor,
          },
        }),
      });

      if (!sumRes.ok) throw new Error(await sumRes.text());
      const summarized: SummarizeAssignmentsResponse = await sumRes.json();
      setSummaryResult(summarized);
      setStep(3);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý file .docx'
      );
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleApplyToCanvas = () => {
    if (!summaryResult) return;

    const pool: Record<string, ProjectMediaItem[]> = {};
    const allExtractedMedia: ProjectMediaItem[] = extractions.flatMap((ext) =>
      ext.extractedImages.map((img) => ({
        id: img.id,
        url: img.savedUrl,
        caption: `Ảnh từ ${ext.fileName}`,
        sourceType: 'docx-extracted' as const,
        originalDocxMediaName: img.originalName,
      }))
    );

    summaryResult.projects.forEach((p) => {
      const ownDocx = p.media.filter((m) => m.sourceType === 'docx-extracted');
      pool[p.id] = ownDocx.length > 0 ? ownDocx : allExtractedMedia;
    });

    applyDocxSummaryToPortfolio({
      summary: summaryResult,
      studentAvatarUrl: avatarUrl.trim() || undefined,
      studentEmail: email.trim() || undefined,
      imageMode,
      visualStyle,
      docxImagesPool: pool,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="DOCX Assignment-to-Portfolio Wizard"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white text-stone-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Sparkles className="h-4 w-4" />
              <span>DOCX Assignment-to-Portfolio Wizard</span>
            </div>
            <h2 className="mt-0.5 text-lg font-bold">
              Chuyển file .docx bài tập thành Portfolio hoàn chỉnh
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200"
            aria-label="Đóng Wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 border-b border-stone-100 bg-white px-6 py-3 text-xs font-semibold">
          {[
            { num: 1, label: '1. Nạp file .docx & Hồ sơ' },
            { num: 2, label: '2. Chế độ Ảnh & Phong cách' },
            { num: 3, label: '3. Duyệt Bài tập đã Tóm tắt' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
                step === s.num
                  ? 'bg-stone-900 text-white'
                  : step > s.num
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilePick(e.dataTransfer.files);
                }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/70 p-8 text-center transition hover:border-amber-500 hover:bg-amber-50/30"
              >
                <Upload className="h-10 w-10 text-amber-600" />
                <p className="mt-3 text-sm font-bold text-stone-800">
                  Kéo thả 1 hoặc nhiều file .docx bài tập vào đây
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Hỗ trợ cả 1 file chứa nhiều bài tập (Bài 1, Bài 2, Bài 3...) hoặc nhiều file rời nhau
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                  <label className="cursor-pointer rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800">
                    <span>Chọn file .docx từ máy</span>
                    <input
                      type="file"
                      accept=".docx"
                      multiple
                      className="hidden"
                      data-testid="docx-file-input"
                      onChange={(e) => {
                        handleFilePick(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setUseSampleDocx(true);
                      setFiles([]);
                      setErrorMsg(null);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      useSampleDocx
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    📄 Dùng file mẫu (sample-assignments.docx)
                  </button>
                </div>

                {(useSampleDocx || files.length > 0) && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {useSampleDocx && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                        <FileText className="h-3.5 w-3.5" />
                        references/sample-assignments.docx (3 bài tập + 2 ảnh)
                      </span>
                    )}
                    {files.map((f, idx) => (
                      <span
                        key={`${f.name}-${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>
                          {f.name} ({Math.round(f.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="ml-0.5 rounded-full p-0.5 hover:bg-amber-200"
                          aria-label={`Bỏ file ${f.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Quick Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Họ và tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Từ Thị Vân Anh"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Chức danh / Ngành học
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="VD: Content Marketing & AI Specialist"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Ảnh đại diện (tải từ máy hoặc nhập URL tùy chọn)
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                      {avatarUrl.trim() && !avatarPreviewError ? (
                        <img
                          src={avatarUrl}
                          alt="Xem trước ảnh đại diện"
                          data-testid="avatar-preview-img"
                          onError={() => setAvatarPreviewError(true)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserCircle2 className="h-7 w-7 text-stone-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-800 transition hover:bg-stone-100">
                          <Upload className="h-3.5 w-3.5 text-amber-600" />
                          <span>Tải ảnh từ máy</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            data-testid="avatar-file-input"
                            onChange={(e) => {
                              handleAvatarFilePick(e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {avatarFileName && (
                          <span className="max-w-[160px] truncate rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                            {avatarFileName}
                          </span>
                        )}
                        {avatarUrl.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarUrl('');
                              setAvatarFileName(null);
                              setAvatarPreviewError(false);
                            }}
                            className="text-[11px] font-medium text-rose-600 hover:underline"
                          >
                            Xóa ảnh
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        aria-label="URL Ảnh đại diện"
                        value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                        onChange={(e) => {
                          setAvatarFileName(null);
                          setAvatarPreviewError(false);
                          setAvatarUrl(e.target.value);
                        }}
                        placeholder={
                          avatarUrl.startsWith('data:')
                            ? 'Đang dùng ảnh tải từ máy (hoặc dán URL để thay thế)'
                            : 'Để trống để giữ ảnh mặc định hoặc dán URL'
                        }
                        className="w-full rounded-xl border border-stone-200 px-3 py-1.5 text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#735340]/25 bg-[#FFF3E6] px-4 py-2.5 text-xs text-[#3E2723]">
                <span>
                  🎨 <strong>Chuẩn bố cục Canva gốc:</strong> Giữ cố định thiết kế{' '}
                  <em>Canva Editorial</em> &amp; tiêu đề bìa <strong>Digital Portfolio</strong>; chỉ thay nội dung học viên, ảnh đại diện &amp; bài tập.
                </span>
                <div className="flex items-center gap-1" aria-hidden="true">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/15 bg-[#FFF3E6]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#3E2723]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#735340]" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#5D4037]" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-800">
                  Chọn cơ chế xử lý hình ảnh cho bài tập
                </h3>
                <div className="mt-3 space-y-3">
                  {IMAGE_MODE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                        imageMode === opt.value
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="imageMode"
                        value={opt.value}
                        checked={imageMode === opt.value}
                        onChange={() => setImageMode(opt.value)}
                        className="mt-1 accent-amber-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{opt.title}</span>
                          {opt.badge && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-800">
                  Phong cách ảnh AI minh họa (khi tự động bù hoặc tạo mới)
                </h3>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {VISUAL_STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setVisualStyle(style.value)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                        visualStyle === style.value
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
          )}

          {step === 3 && summaryResult && (
            <div className="space-y-5">
              {/* Summary stats banner */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-stone-900 p-4 text-white sm:grid-cols-4">
                <div>
                  <p className="text-[11px] text-stone-300">File .docx đã đọc</p>
                  <p className="text-xl font-bold">{summaryResult.stats.totalFiles}</p>
                </div>
                <div>
                  <p className="text-[11px] text-stone-300">Bài tập tách được</p>
                  <p className="text-xl font-bold text-amber-300">
                    {summaryResult.stats.totalAssignments}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-stone-300">Ảnh lấy từ DOCX</p>
                  <p className="text-xl font-bold text-emerald-300">
                    {summaryResult.stats.docxImagesFound}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-stone-300">Ảnh AI tạo theo chủ đề</p>
                  <p className="text-xl font-bold text-sky-300">
                    {summaryResult.stats.aiImagesGenerated}
                  </p>
                </div>
              </div>

              {/* Review Cards */}
              <div className="space-y-3">
                {summaryResult.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 p-4 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-4">
                      {proj.media[0] ? (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                          <img
                            src={proj.media[0].url}
                            alt={proj.title}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            {proj.media[0].sourceType === 'docx-extracted'
                              ? '📄 Ảnh từ DOCX'
                              : '✨ Ảnh AI theo chủ đề'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-stone-300 text-xs text-stone-400">
                          <ImageIcon className="mr-1.5 h-4 w-4" /> Chưa có ảnh
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold">
                          Bài #{idx + 1}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                          {proj.category}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          setSummaryResult((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  projects: prev.projects.map((p) =>
                                    p.id === proj.id ? { ...p, title: nextVal } : p
                                  ),
                                }
                              : prev
                          );
                        }}
                        className="w-full rounded-lg border border-stone-200 px-2.5 py-1 text-sm font-bold focus:border-amber-500 focus:outline-none"
                      />
                      {proj.assignmentBrief && (
                        <p className="text-xs text-stone-600">
                          <strong>Đề bài:</strong> {proj.assignmentBrief}
                        </p>
                      )}
                      <p className="text-xs leading-relaxed text-stone-700">
                        <strong>Tóm tắt:</strong> {proj.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3.5">
          {step > 1 ? (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                if (!useSampleDocx && files.length === 0) {
                  setErrorMsg('Hãy chọn ít nhất 1 file .docx hoặc dùng file mẫu.');
                  return;
                }
                setErrorMsg(null);
                setStep(2);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <span>Tiếp tục cấu hình ảnh</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleRunPipeline}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-700 disabled:opacity-60"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              <span>Phân tích & Tóm tắt Bài tập bằng AI</span>
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleApplyToCanvas}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Đổ vào Portfolio Canvas</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
