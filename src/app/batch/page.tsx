"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Factory,
  FileText,
  Sparkles,
  ExternalLink,
  Download,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Users,
  X,
} from "lucide-react";
import type {
  ImageMode,
  PortfolioDocument,
  TemplateId,
  VisualStyle,
} from "@/schema/portfolio.schema";

interface BatchPortfolioResult {
  slug: string;
  fullName: string;
  roleTitle: string;
  url: string;
  assignmentCount: number;
  docxImages: number;
  aiImages: number;
  document: PortfolioDocument;
}

type BatchLayout = "standard" | "projects-first";
type BatchFileOptions = {
  templateId?: TemplateId;
  layout?: BatchLayout;
  visualStyle?: VisualStyle;
};
type BatchFile = {
  id: string;
  file: File;
};

const SAMPLE_BATCH_ITEMS = [
  { id: "sample-assignments", name: "sample-assignments.docx" },
];

const TEMPLATE_OPTIONS: Array<{ id: TemplateId; label: string }> = [
  { id: "canva-editorial", label: "Canva Editorial" },
  { id: "warm-editorial", label: "Warm Editorial" },
  { id: "creative-bold", label: "Bold Creative" },
  { id: "minimal-chic", label: "Minimal Chic" },
  { id: "vibrant-student", label: "Vibrant Student" },
  { id: "artistic-organic", label: "Artistic Organic" },
  { id: "academic-presentation", label: "Academic Presentation" },
  { id: "bento-grid", label: "Bento Grid" },
  { id: "framer-minimal", label: "Framer Minimal" },
  { id: "creative-showcase", label: "Creative Showcase" },
  { id: "growth-marketer", label: "Growth Marketer" },
  { id: "tech-developer", label: "Tech Developer" },
];

export default function BatchFactoryPage() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [fileOptions, setFileOptions] = useState<
    Record<string, BatchFileOptions>
  >({});
  const [useSampleBatch, setUseSampleBatch] = useState(false);
  const [csvText, setCsvText] = useState("filename,fullName,roleTitle,email");
  const [imageMode, setImageMode] = useState<ImageMode>("hybrid-auto");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(
    "canva-pastel-graphic",
  );
  const [templateId, setTemplateId] = useState<TemplateId>("canva-editorial");
  const [layout, setLayout] = useState<BatchLayout>("standard");

  const [isRunning, setIsRunning] = useState(false);
  const [isExportingBulk, setIsExportingBulk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BatchPortfolioResult[]>([]);

  const handleFiles = (picked: FileList | null) => {
    if (!picked) return;
    const valid = Array.from(picked).filter((f) =>
      f.name.toLowerCase().endsWith(".docx"),
    );
    if (valid.length === 0) {
      setError("Vui lòng chọn các file .docx hợp lệ.");
      return;
    }
    setError(null);
    setUseSampleBatch(false);
    setFiles((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2)}`,
        file,
      })),
    ]);
  };

  const handleRunBatch = async () => {
    if (!useSampleBatch && files.length === 0) {
      setError('Vui lòng nạp ít nhất 1 file .docx hoặc chọn "Nạp lô mẫu".');
      return;
    }
    setError(null);
    setIsRunning(true);
    try {
      const formData = new FormData();
      formData.append("imageMode", imageMode);
      formData.append("visualStyle", visualStyle);
      formData.append("templateId", templateId);
      formData.append("layout", layout);
      formData.append("csvText", csvText);
      if (useSampleBatch) {
        formData.append("useSampleBatch", "true");
      } else {
        files.forEach(({ file }) => formData.append("files", file));
      }
      const optionRows = useSampleBatch
        ? SAMPLE_BATCH_ITEMS.map(({ id }) => fileOptions[id] ?? {})
        : files.map(({ id }) => fileOptions[id] ?? {});
      formData.append(
        "fileOptions",
        JSON.stringify(
          optionRows.map((options) => ({
            templateId: options.templateId ?? templateId,
            layout: options.layout ?? layout,
            visualStyle: options.visualStyle ?? visualStyle,
          })),
        ),
      );

      const res = await fetch("/api/batch", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as { portfolios: BatchPortfolioResult[] };
      setResults(data.portfolios);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể chạy sản xuất hàng loạt.",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleCsvUpload = async (picked: FileList | null) => {
    const file = picked?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const handleBulkZipExport = async () => {
    if (results.length === 0) return;
    setError(null);
    setIsExportingBulk(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: results.map((r) => r.document),
          format: "zip",
        }),
      });
      if (!res.ok) throw new Error("Bulk export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolios-batch-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xuất file Bulk ZIP.",
      );
    } finally {
      setIsExportingBulk(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] text-stone-900">
      {/* Top Bar */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Studio</span>
            </Link>
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-amber-600" />
              <h1 className="font-editorial text-xl font-bold">
                Mass-Production Portfolio Factory
              </h1>
            </div>
          </div>
          <Link
            href="/tuthivananhportfolio"
            className="text-xs font-semibold text-amber-700 hover:underline"
          >
            Xem mẫu /tuthivananhportfolio →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* Input Controls Card */}
        <section className="grid grid-cols-1 gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Bước 1 • Nạp lô file .docx học viên
              </span>
              <h2 className="mt-1 text-lg font-bold">
                Kéo thả nhiều file .docx bài tập của cả lớp
              </h2>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center hover:border-amber-500"
            >
              <Upload className="h-8 w-8 text-amber-600" />
              <p className="mt-2 text-sm font-semibold">
                Kéo thả hàng loạt file .docx (VD: Nguyen_Van_A.docx,
                Le_Thi_B.docx...)
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <label className="cursor-pointer rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800">
                  <span>Chọn nhiều file .docx</span>
                  <input
                    type="file"
                    accept=".docx"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setUseSampleBatch(true);
                    setFiles([]);
                    setError(null);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    useSampleBatch
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Users className="mr-1 inline h-3.5 w-3.5" />
                  Nạp tài liệu mẫu
                </button>
              </div>

              {(useSampleBatch || files.length > 0) && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {useSampleBatch ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                      Sẵn sàng 1 tài liệu minh họa • không gán danh tính cá nhân
                    </span>
                  ) : (
                    files.map(({ id, file }) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
                      >
                        <FileText className="h-3 w-3" />
                        <span>{file.name}</span>
                        <button
                          type="button"
                          aria-label={`Xóa ${file.name}`}
                          onClick={() =>
                            setFiles((prev) =>
                              prev.filter((item) => item.id !== id),
                            )
                          }
                          className="rounded-full p-0.5 text-amber-800 hover:bg-amber-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold text-stone-700">
                  Danh sách CSV bổ sung thông tin (tùy chọn:
                  filename,fullName,roleTitle,email)
                </label>
                <label className="cursor-pointer rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100">
                  <span>Nạp file .csv</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => void handleCsvUpload(e.target.files)}
                  />
                </label>
              </div>
              <textarea
                rows={3}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-stone-200 p-3 font-mono text-xs outline-none focus:border-amber-500"
              />
            </div>

            {(useSampleBatch || files.length > 0) && (
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800">
                    Tùy chỉnh từng file
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
                    Mặc định kế thừa cấu hình chung ở bước 2. Chỉ thay lựa chọn
                    trên những hồ sơ cần giao diện riêng.
                  </p>
                </div>
                {(useSampleBatch
                  ? SAMPLE_BATCH_ITEMS.map((item) => ({
                      ...item,
                      fileOptions: fileOptions[item.id],
                    }))
                  : files.map(({ id, file }) => ({
                      id,
                      name: file.name,
                      fileOptions: fileOptions[id],
                    }))
                ).map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-2"
                  >
                    <p className="truncate text-xs font-semibold text-stone-800 sm:col-span-2">
                      {item.name}
                    </p>
                    <label className="text-[11px] font-semibold text-stone-600">
                      Template
                      <select
                        aria-label={`Template cho ${item.name}`}
                        value={item.fileOptions?.templateId ?? templateId}
                        onChange={(e) =>
                          setFileOptions((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              templateId: e.target.value as TemplateId,
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-800"
                      >
                        {TEMPLATE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-[11px] font-semibold text-stone-600">
                      Bố cục
                      <select
                        aria-label={`Bố cục cho ${item.name}`}
                        value={item.fileOptions?.layout ?? layout}
                        onChange={(e) =>
                          setFileOptions((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              layout: e.target.value as BatchLayout,
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-800"
                      >
                        <option value="standard">Thứ tự tiêu chuẩn</option>
                        <option value="projects-first">
                          Bài tập / dự án trước
                        </option>
                      </select>
                    </label>
                    <label className="text-[11px] font-semibold text-stone-600 sm:col-span-2">
                      Phong cách ảnh
                      <select
                        aria-label={`Phong cách ảnh cho ${item.name}`}
                        value={item.fileOptions?.visualStyle ?? visualStyle}
                        onChange={(e) =>
                          setFileOptions((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              visualStyle: e.target.value as VisualStyle,
                            },
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs text-stone-800"
                      >
                        <option value="canva-pastel-graphic">
                          Canva Pastel Graphic
                        </option>
                        <option value="editorial-illustration">
                          Editorial Illustration
                        </option>
                        <option value="3d-render">3D Isometric Render</option>
                        <option value="minimal-photo">Minimalist Photo</option>
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-5 lg:col-span-5">
            <div className="space-y-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Bước 2 • Cấu hình dây chuyền
              </span>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Template mặc định cho cả lô
                </label>
                <select
                  aria-label="Template mặc định cho cả lô"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value as TemplateId)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold"
                >
                  {TEMPLATE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Bố cục mặc định cho cả lô
                </label>
                <select
                  aria-label="Bố cục mặc định cho cả lô"
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as BatchLayout)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="standard">Thứ tự tiêu chuẩn</option>
                  <option value="projects-first">Bài tập / dự án trước</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Chế độ xử lý hình ảnh
                </label>
                <select
                  aria-label="Chế độ xử lý hình ảnh"
                  value={imageMode}
                  onChange={(e) => setImageMode(e.target.value as ImageMode)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="hybrid-auto">
                    Ưu tiên ảnh trong DOCX + Tự bù bằng ảnh AI nếu thiếu
                  </option>
                  <option value="docx-extract">
                    Chỉ lấy ảnh gốc trong DOCX
                  </option>
                  <option value="ai-generate-all">
                    Tạo mới toàn bộ ảnh AI theo chủ đề
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Phong cách ảnh AI
                </label>
                <select
                  aria-label="Phong cách ảnh AI"
                  value={visualStyle}
                  onChange={(e) =>
                    setVisualStyle(e.target.value as VisualStyle)
                  }
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="canva-pastel-graphic">
                    Canva Pastel Graphic
                  </option>
                  <option value="editorial-illustration">
                    Editorial Illustration
                  </option>
                  <option value="3d-render">3D Isometric Render</option>
                  <option value="minimal-photo">Minimalist Photo</option>
                </select>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={handleRunBatch}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700 disabled:opacity-60"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý hàng loạt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Chạy sản xuất hàng loạt</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Results Table */}
        {results.length > 0 && (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold">
                  Đã xuất bản {results.length} trang Portfolio thành công!
                </h2>
              </div>

              <button
                type="button"
                disabled={isExportingBulk}
                onClick={handleBulkZipExport}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
              >
                {isExportingBulk ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>📦 Tải Bulk ZIP toàn bộ lớp</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
                    <th className="py-3 pr-4">Học viên</th>
                    <th className="py-3 pr-4">URL Portfolio</th>
                    <th className="py-3 pr-4">Số bài tập</th>
                    <th className="py-3 pr-4">Ảnh DOCX / Ảnh AI</th>
                    <th className="py-3 text-right">Xem trực tiếp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {results.map((item) => (
                    <tr key={item.slug} className="hover:bg-stone-50">
                      <td className="py-3.5 pr-4">
                        <p className="font-bold">{item.fullName}</p>
                        <p className="text-xs text-stone-500">
                          {item.roleTitle}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-amber-800">
                        {item.url}
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-semibold">
                        {item.assignmentCount} bài tập
                      </td>
                      <td className="py-3.5 pr-4 text-xs">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                          {item.docxImages} DOCX
                        </span>{" "}
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                          {item.aiImages} AI
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={item.url}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:bg-stone-100"
                        >
                          <span>Mở trang</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
