"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Sparkles, Terminal, Mail } from "lucide-react";
import type {
  ContactSection,
  ProfileOwner,
  TemplateId,
  ThemeConfig,
} from "@/schema/portfolio.schema";
import {
  getRadiusClass,
  getThemeTokens,
} from "@/templates/archetypes/archetypeStyles";
import {
  CanvaFourPointStar,
  CanvaHalftoneVinylLeft,
  CanvaRotaSheetSticker,
  CanvaSpiralMusicStaff,
  CanvaThankYouVinylBurst,
} from "./CanvaOrnaments";

export interface ContactBlockProps {
  section: ContactSection;
  theme: ThemeConfig;
  archetypeId?: TemplateId;
  editable?: boolean;
  sectionIndex?: number;
  ownerEmail?: string;
  ownerName?: string;
  ownerRole?: string;
  projects?: Array<{ id: string; title: string; category?: string }>;
  profileOwner?: ProfileOwner;
}

const CONCLUSION_PILLS = [
  {
    num: "(01)",
    label: "TRẢI NGHIỆM & CẢM NHẬN VỀ DỰ ÁN",
  },
  {
    num: "(02)",
    label: "KIẾN THỨC & KỸ NĂNG CỐT LÕI ĐẠT ĐƯỢC",
  },
  {
    num: "(03)",
    label: "TÂM ĐẮC & THÁCH THỨC KHI XÂY DỰNG PORTFOLIO",
  },
];

function ContactStar({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      fill="currentColor"
      className={className}
    >
      <path d="M20 0c2.4 11.2 6.8 15.6 20 20-13.2 4.4-17.6 8.8-20 20C17.6 28.8 13.2 24.4 0 20 13.2 15.6 17.6 11.2 20 0Z" />
    </svg>
  );
}

function ContactDotCircle({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none rounded-full ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle, currentColor 1.35px, transparent 1.55px)",
        backgroundSize: "9px 9px",
        maskImage: "radial-gradient(circle, #000 56%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle, #000 56%, transparent 72%)",
      }}
    />
  );
}

export function ContactBlock({
  section,
  theme,
  archetypeId = "canva-editorial",
  editable = false,
  sectionIndex,
  ownerEmail,
  ownerName,
  ownerRole,
  projects = [],
  profileOwner,
}: ContactBlockProps) {
  const [sent, setSent] = useState(false);
  const tokens = getThemeTokens(theme);
  const isCanvaEditorial = archetypeId === "canva-editorial";
  const isTerminal = archetypeId === "tech-developer";
  const isMinimal =
    archetypeId === "framer-minimal" || archetypeId === "minimal-chic";
  const isCreative =
    archetypeId === "creative-showcase" || archetypeId === "creative-bold";
  const isGrowth = archetypeId === "growth-marketer";
  const isAcademic = archetypeId === "academic-presentation";
  const isOrganic = archetypeId === "artistic-organic";

  const contactVariant = section.variant || "full-banner";

  const courseInfo = section.courseInfo;

  const reflection = section.personalReflection;
  const studentName =
    courseInfo?.studentName ||
    profileOwner?.fullName ||
    ownerName ||
    "Sinh viên";
  const studentNamePosition = courseInfo?.studentNamePosition || "left";
  const studentId = courseInfo?.studentId || "";
  const studentClass = courseInfo?.studentClass || "";
  const courseCode = courseInfo?.courseCode || "INF2501";
  const courseName =
    courseInfo?.courseName ||
    "Nhập môn Công nghệ số và ứng dụng trí tuệ nhân tạo";
  const institution =
    courseInfo?.institution || "Trường ĐH Sư phạm Nghệ thuật TW";

  const renderCourseFooter = () => (
    <footer
      data-testid="rubric-course-footer"
      className="mt-8 border-t border-stone-200 bg-stone-900 px-6 py-4 text-xs text-stone-300"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1"
          style={{
            justifyContent:
              studentNamePosition === "center"
                ? "center"
                : studentNamePosition === "right"
                  ? "flex-end"
                  : "flex-start",
          }}
        >
          <span className="font-bold text-white text-sm">{studentName}</span>
          {studentId && (
            <span className="rounded bg-stone-800 px-2 py-0.5 font-mono text-stone-300">
              MSSV: {studentId}
            </span>
          )}
          {studentClass && (
            <span className="text-stone-400">Lớp: {studentClass}</span>
          )}
        </div>

        <div className="text-right text-[11px] text-stone-400 sm:text-xs">
          <p className="font-semibold text-stone-200">
            {courseCode} - {courseName}
          </p>
          <p className="opacity-80">{institution}</p>
        </div>
      </div>
    </footer>
  );

  if (isCanvaEditorial && contactVariant === "full-banner") {
    return (
      <section
        id="contact"
        className="reveal-on-scroll relative overflow-hidden pt-10"
      >
        {/* Slide 8: Conclusion with spiral music staff & 3 mocha pills */}
        <div className="reveal-on-scroll relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <CanvaSpiralMusicStaff
            className="pointer-events-none -left-16 -top-8 hidden h-64 w-72 opacity-85 md:absolute md:block"
            stroke="var(--text, #2E1D18)"
            noteFill="var(--text, #2E1D18)"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              <CanvaFourPointStar
                className="h-7 w-7 sm:h-9 sm:w-9"
                color="var(--primary, #735340)"
              />
              <h2
                className="font-editorial text-4xl font-extrabold tracking-tight sm:text-6xl"
                style={{ color: "var(--text, #3E2723)" }}
              >
                Conclusion
              </h2>
              <CanvaFourPointStar
                className="h-7 w-7 sm:h-9 sm:w-9"
                color="var(--primary, #735340)"
              />
            </div>

            <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
              {CONCLUSION_PILLS.map((pill) => (
                <div
                  key={pill.num}
                  className="flex flex-col items-center gap-2.5"
                >
                  <span
                    className="text-lg font-extrabold"
                    style={{ color: "var(--text, #3E2723)" }}
                  >
                    {pill.num}
                  </span>
                  <div
                    className="flex min-h-[68px] w-full items-center justify-center rounded-full px-5 py-3 text-center text-xs font-semibold uppercase leading-snug tracking-wide shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{
                      backgroundColor: "var(--primary, #735340)",
                      color: "var(--bg, #FFF3E6)",
                    }}
                  >
                    {pill.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Reflection body narrative */}
            <div className="mt-8 max-w-3xl text-center">
              <p
                className="text-base leading-relaxed sm:text-[17px]"
                style={{ color: "var(--text, #3E2723)", opacity: 0.9 }}
              >
                Hành trình thực hiện các dự án đã trang bị cho tôi nền tảng vững
                chắc về tư duy giải pháp, năng lực ứng dụng AI sáng tạo và khả
                năng hoàn thiện sản phẩm theo chuẩn mực chất lượng cao.
              </p>
            </div>
          </div>

          {/* Slide 9: Large rounded Mocha block with floating Rota sheet music & exercise links */}
          <div className="reveal-on-scroll relative mx-auto mt-14 max-w-5xl">
            <CanvaRotaSheetSticker
              className="pointer-events-none -left-14 -top-12 z-20 hidden h-56 w-56 sm:absolute sm:block"
              paperBg="var(--surface, #FFFDF8)"
              stroke="var(--text, #2E1D18)"
              noteFill="var(--text, #2E1D18)"
            />

            <div
              className="relative z-10 rounded-[44px] px-7 py-10 shadow-xl sm:rounded-[64px] sm:px-14 sm:py-12 sm:pl-48"
              style={{
                backgroundColor: "var(--primary, #735340)",
                color: "var(--bg, #FFF3E6)",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                {section.title || "Tổng kết & Định hướng"}
              </p>
              <p className="mt-3 text-sm leading-relaxed opacity-95 sm:text-base">
                {section.subtitle ||
                  "Dưới đây là liên kết nhanh đến từng bài tập và báo cáo chi tiết trong hồ sơ năng lực."}
              </p>

              {/* TỔNG HỢP CÁC ĐƯỜNG LIÊN KẾT DẪN TỚI CÁC BÀI TẬP */}
              <div className="mt-6 border-t border-white/20 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-85">
                  TỔNG HỢP CÁC ĐƯỜNG LIÊN KẾT DẪN TỚI CÁC BÀI TẬP
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {projects.length > 0
                    ? projects.map((proj, idx) => (
                        <a
                          key={proj.id || idx}
                          href={`#project-item-${idx}`}
                          className="flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-1.5 text-xs font-medium transition hover:bg-white hover:text-stone-900"
                        >
                          <span className="font-bold opacity-75">
                            0{idx + 1}.
                          </span>
                          <span className="truncate">{proj.title}</span>
                        </a>
                      ))
                    : [
                        "Bài tập 01: Nghiên cứu & Định vị",
                        "Bài tập 02: Kịch bản & Prompt AI",
                        "Bài tập 03: Thiết kế Bộ nhận diện",
                        "Bài tập 04: Sản xuất Nội dung Đa kênh",
                        "Bài tập 05: Tối ưu Hóa Chuyển đổi",
                        "Bài tập 06: Báo cáo & Đánh giá Kết quả",
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-medium"
                        >
                          <span className="font-bold opacity-75">
                            0{idx + 1}.
                          </span>
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                </div>
              </div>

              {ownerEmail && (
                <p className="mt-5 text-sm font-medium">
                  Liên hệ trực tiếp:{" "}
                  <a
                    href={`mailto:${ownerEmail}`}
                    className="underline underline-offset-4 hover:opacity-80"
                  >
                    {ownerEmail}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Clean paper Contact Form */}
          {section.showContactForm && (
            <div
              className="reveal-on-scroll mx-auto mt-12 max-w-2xl rounded-3xl border p-6 shadow-md"
              style={{
                borderColor: "var(--primary, #735340)",
                backgroundColor: "var(--surface, #FFF8F0)",
                color: "var(--text, #3E2723)",
              }}
            >
              {sent ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2
                    className="h-10 w-10"
                    style={{ color: "var(--primary, #735340)" }}
                  />
                  <h3 className="mt-2 text-base font-bold">
                    Đã ghi nhận lời nhắn!
                  </h3>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--secondary, #5D4037)" }}
                  >
                    Cảm ơn bạn đã liên hệ qua Portfolio.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-3 rounded-full border px-4 py-1.5 text-xs font-semibold transition"
                    style={{
                      borderColor: "var(--primary, #735340)",
                      color: "var(--text, #3E2723)",
                    }}
                  >
                    Gửi lời nhắn khác
                  </button>
                </div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={{ color: "var(--primary, #735340)" }}
                  >
                    Gửi lời nhắn kết nối
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="Họ tên của bạn"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition"
                      style={{
                        borderColor: "var(--primary, #735340)",
                        backgroundColor: "var(--bg, #FFF3E6)",
                        color: "var(--text, #3E2723)",
                      }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email liên hệ"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition"
                      style={{
                        borderColor: "var(--primary, #735340)",
                        backgroundColor: "var(--bg, #FFF3E6)",
                        color: "var(--text, #3E2723)",
                      }}
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Nội dung trao đổi hoặc lời mời hợp tác..."
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition"
                    style={{
                      borderColor: "var(--primary, #735340)",
                      backgroundColor: "var(--bg, #FFF3E6)",
                      color: "var(--text, #3E2723)",
                    }}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      backgroundColor: "var(--primary, #735340)",
                      color: "var(--bg, #FFF3E6)",
                    }}
                  >
                    <Send className="h-4 w-4" />
                    <span>Gửi tin nhắn ngay</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Slide 10: Thank You ! + Halftone Vinyls + Yellow Starburst */}
        <div className="reveal-on-scroll relative mt-12 overflow-hidden py-16 sm:py-24">
          <CanvaHalftoneVinylLeft
            className="pointer-events-none absolute -left-2 bottom-2 top-2 h-full w-28 opacity-90 sm:w-44 md:w-52"
            ringColor="var(--bg, #FFF3E6)"
            centerColor="var(--bg, #FFF3E6)"
          />
          <CanvaThankYouVinylBurst className="pointer-events-none absolute right-0 top-0 h-36 w-48 opacity-95 sm:h-52 sm:w-64 md:h-64 md:w-80" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h2
              className="font-editorial text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
              style={{ color: "var(--text, #3E2723)" }}
            >
              Thank You !
            </h2>
            <p
              className="mt-5 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
              style={{ color: "var(--text, #3E2723)" }}
            >
              {[ownerName, ownerRole].filter(Boolean).join(" • ") ||
                section.thankYouMessage}
            </p>
            <p
              className="mt-1 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--secondary, #5D4037)" }}
            >
              {section.thankYouMessage}
            </p>
          </div>
        </div>

        {/* Mandatory INF2501 Course Footer Strip */}
        {renderCourseFooter()}

        {/* Bottom black Canva footer strip matching Slide 10 reference */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B0908] px-6 py-2.5 text-[11px] text-white/85">
          <div className="flex items-center gap-4">
            <span>Điều khoản và hỗ trợ</span>
            <span>Chính sách quyền riêng tư</span>
          </div>
          <span>Được thiết kế bằng Canva</span>
        </div>
      </section>
    );
  }

  const containerRadius = getRadiusClass(theme.borderRadius, archetypeId);

  const containerStyle: React.CSSProperties = isTerminal
    ? {
        backgroundColor: theme.surfaceColor,
        borderColor: `${theme.primaryColor}45`,
        color: theme.textColor,
      }
    : isMinimal
      ? {
          backgroundColor: theme.surfaceColor,
          borderColor: tokens.borderSubtle,
          color: theme.textColor,
        }
      : isCreative
        ? {
            backgroundColor: theme.secondaryColor,
            borderColor: theme.textColor,
            color: "#FFFFFF",
            boxShadow: `8px 8px 0px ${theme.primaryColor}`,
          }
        : {
            backgroundColor: theme.secondaryColor,
            borderColor: theme.secondaryColor,
            color: "#FFFFFF",
            borderTopWidth: isGrowth ? "5px" : undefined,
            borderTopColor: isGrowth ? theme.primaryColor : undefined,
          };

  const usesDarkOrColoredContainer = !isTerminal && !isMinimal;

  const renderContactFormElement = () => (
    <div className="rounded-3xl bg-white p-6 text-stone-900 shadow-xl border border-stone-200">
      {sent ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h3 className="mt-3 text-lg font-bold">Đã ghi nhận lời nhắn!</h3>
          <p className="mt-1 text-xs text-stone-500">
            Cảm ơn bạn đã liên hệ qua Portfolio.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 rounded-full border border-stone-200 px-4 py-1.5 text-xs font-semibold hover:bg-stone-50"
          >
            Gửi lời nhắn khác
          </button>
        </div>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              placeholder="Họ tên của bạn"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
            />
            <input
              type="email"
              required
              placeholder="Email liên hệ"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
            />
          </div>
          <textarea
            rows={3}
            required
            placeholder="Nội dung trao đổi hoặc lời mời hợp tác..."
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Send className="h-4 w-4" />
            <span>Gửi tin nhắn ngay</span>
          </button>
        </form>
      )}
    </div>
  );

  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8"
    >
      {contactVariant === "minimal-card" ? (
        <div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border p-8 text-center shadow-sm sm:p-14"
          style={{
            backgroundColor: theme.surfaceColor,
            borderColor: `${theme.primaryColor}35`,
            color: theme.textColor,
          }}
        >
          <ContactDotCircle className="absolute -right-10 -top-14 h-44 w-44 text-[var(--primary)] opacity-25 sm:-right-4 sm:-top-16 sm:h-56 sm:w-56" />
          <ContactStar className="absolute left-7 top-8 h-5 w-5 text-[var(--primary)] sm:left-12 sm:top-12 sm:h-7 sm:w-7" />
          <div className="relative mx-auto max-w-xl">
            <p
              className="text-xs font-bold uppercase tracking-[0.24em]"
              style={{ color: theme.primaryColor }}
            >
              {section.thankYouMessage}
            </p>
            <h2 className="mt-4 font-editorial text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
              {section.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed opacity-75 sm:text-base">
              {section.subtitle}
            </p>
            {ownerEmail && (
              <a
                href={`mailto:${ownerEmail}`}
                className="mt-7 inline-flex max-w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{ownerEmail}</span>
              </a>
            )}
            {section.showContactForm && (
              <div className="mt-8 text-left">{renderContactFormElement()}</div>
            )}
          </div>
        </div>
      ) : contactVariant === "footer-widget" ? (
        <div
          className="relative overflow-hidden rounded-[2rem] p-6 shadow-xl sm:p-10"
          style={{
            backgroundColor: theme.textColor,
            color: theme.surfaceColor,
          }}
        >
          <ContactDotCircle className="absolute -right-12 -top-16 h-56 w-56 opacity-15 sm:h-72 sm:w-72" />
          <div className="relative grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-10">
            <div className="space-y-4 md:col-span-5">
              <div className="flex items-center gap-3">
                <ContactStar className="h-5 w-5 shrink-0 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                  {section.thankYouMessage}
                </span>
              </div>
              <h2 className="font-editorial text-3xl font-medium leading-tight sm:text-4xl">
                {section.title}
              </h2>
              <p className="max-w-md text-sm leading-relaxed opacity-75">
                {section.subtitle}
              </p>
              {ownerEmail && (
                <a
                  href={`mailto:${ownerEmail}`}
                  className="inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {ownerEmail}
                </a>
              )}
            </div>
            <div className="space-y-2 border-t border-white/15 pt-5 text-xs opacity-80 md:col-span-3 md:border-l md:border-t-0 md:pl-6 md:pt-1">
              <p className="font-bold uppercase tracking-wider opacity-70">
                Học phần
              </p>
              <p className="font-semibold">
                {courseCode}
                {courseName ? ` • ${courseName}` : ""}
              </p>
              {institution && <p>{institution}</p>}
              {(studentId || studentClass) && (
                <p>
                  {[studentName, studentId, studentClass]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
            </div>
            <div className="md:col-span-4">
              {section.showContactForm ? (
                renderContactFormElement()
              ) : (
                <div className="rounded-2xl border border-white/20 bg-white/5 p-5 text-sm leading-relaxed">
                  {section.thankYouMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : contactVariant === "split-form" ? (
        <div
          className="relative overflow-hidden rounded-[2rem] border shadow-lg"
          style={{
            backgroundColor: theme.surfaceColor,
            borderColor: `${theme.primaryColor}35`,
            color: theme.textColor,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative flex min-h-[300px] flex-col justify-center overflow-hidden p-7 sm:p-11 lg:p-14">
              <ContactDotCircle className="absolute -bottom-16 -left-16 h-56 w-56 text-[var(--primary)] opacity-20 sm:h-72 sm:w-72" />
              <ContactStar className="absolute right-8 top-8 h-6 w-6 text-[var(--primary)] sm:right-12 sm:top-12 sm:h-8 sm:w-8" />
              <div className="relative max-w-lg">
                <p
                  className="text-xs font-bold uppercase tracking-[0.22em]"
                  style={{ color: theme.primaryColor }}
                >
                  {section.thankYouMessage}
                </p>
                <h2 className="mt-5 font-editorial text-4xl font-medium leading-tight sm:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed opacity-75 sm:text-base">
                  {section.subtitle}
                </p>
                {ownerEmail && (
                  <a
                    href={`mailto:${ownerEmail}`}
                    className="mt-7 inline-flex max-w-full items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:opacity-75"
                    style={{
                      borderColor: `${theme.primaryColor}65`,
                      color: theme.primaryColor,
                    }}
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="break-all">{ownerEmail}</span>
                  </a>
                )}
              </div>
            </div>
            <div
              className="relative flex items-center border-t p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10"
              style={{
                borderColor: `${theme.primaryColor}25`,
                backgroundColor: `${theme.primaryColor}0A`,
              }}
            >
              <ContactStar className="absolute right-8 top-7 hidden h-4 w-4 opacity-50 sm:block" />
              {section.showContactForm ? (
                <div className="w-full">{renderContactFormElement()}</div>
              ) : (
                <div
                  className="w-full rounded-2xl border bg-white/70 p-6 text-center"
                  style={{ borderColor: `${theme.primaryColor}25` }}
                >
                  <Mail
                    className="mx-auto h-6 w-6"
                    style={{ color: theme.primaryColor }}
                  />
                  <p className="mt-3 text-sm font-semibold">
                    {section.thankYouMessage}
                  </p>
                  {ownerEmail && (
                    <a
                      href={`mailto:${ownerEmail}`}
                      className="mt-2 inline-block break-all text-sm underline underline-offset-4"
                      style={{ color: theme.primaryColor }}
                    >
                      {ownerEmail}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative overflow-hidden border px-6 py-12 text-center shadow-lg sm:px-12 sm:py-16 ${containerRadius} ${
            isCreative ? "border-4 border-black shadow-[8px_8px_0px_#000]" : ""
          }`}
          style={containerStyle}
        >
          <ContactDotCircle
            className={`absolute -left-16 -top-12 h-52 w-52 opacity-20 sm:-left-10 sm:-top-16 sm:h-72 sm:w-72 ${usesDarkOrColoredContainer ? "text-white" : "text-[var(--primary)]"}`}
          />
          <ContactDotCircle
            className={`absolute -bottom-20 -right-14 h-48 w-48 opacity-15 sm:h-64 sm:w-64 ${usesDarkOrColoredContainer ? "text-white" : "text-[var(--primary)]"}`}
          />
          <ContactStar className="absolute right-8 top-8 h-6 w-6 text-amber-300 sm:right-14 sm:top-12 sm:h-8 sm:w-8" />
          <div className="relative mx-auto max-w-3xl">
            <div
              className={`mx-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                isTerminal ? "font-mono" : ""
              } ${isCreative ? "border-2 border-black bg-amber-300 text-black shadow-[2px_2px_0px_#000]" : ""}`}
              style={
                isCreative
                  ? undefined
                  : usesDarkOrColoredContainer
                    ? {
                        backgroundColor: "rgba(255,255,255,0.16)",
                        color: "#FFFFFF",
                      }
                    : {
                        backgroundColor: `${theme.primaryColor}18`,
                        color: theme.primaryColor,
                      }
              }
            >
              {isTerminal ? (
                <Terminal className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{section.thankYouMessage}</span>
            </div>
            <h2 className="mt-5 font-editorial text-4xl font-medium leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              {section.title}
            </h2>
            <p
              className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base ${usesDarkOrColoredContainer ? "text-white/85" : "opacity-75"}`}
            >
              {section.subtitle}
            </p>
            {ownerEmail && (
              <a
                href={`mailto:${ownerEmail}`}
                className="mt-7 inline-flex max-w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: usesDarkOrColoredContainer
                    ? theme.surfaceColor
                    : theme.primaryColor,
                  color: usesDarkOrColoredContainer
                    ? theme.textColor
                    : "#FFFFFF",
                }}
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{ownerEmail}</span>
              </a>
            )}
            {section.showContactForm && (
              <div className="mx-auto mt-9 max-w-2xl text-left">
                {renderContactFormElement()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory INF2501 Course Footer Strip */}
      {renderCourseFooter()}
    </section>
  );
}
