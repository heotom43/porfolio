import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  FileText,
  Sparkles,
  Factory,
  Layers,
  ArrowRight,
  Image as ImageIcon,
  Download,
} from 'lucide-react';

export default function HomePage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/nguyenngocdiepportfolio#projects');
  }

  return (
    <div className="min-h-screen bg-[#FFF3E6] text-[#3E2723]">
      <header className="border-b border-[#3E2723]/10 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A96B54] font-editorial text-sm font-bold text-white shadow">
              PF
            </span>
            <div>
              <p className="font-editorial text-base font-bold leading-none">
                AI Portfolio Factory
              </p>
              <p className="text-[11px] opacity-65">
                DOCX Assignment-to-Portfolio Builder
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2.5">
            <Link
              href="/tuthivananhportfolio"
              className="hidden rounded-full border border-[#3E2723]/20 bg-white px-4 py-2 text-xs font-semibold hover:bg-stone-50 sm:inline-flex"
            >
              Xem mẫu Canva
            </Link>
            <Link
              href="/batch"
              className="rounded-full border border-[#3E2723]/20 bg-white px-4 py-2 text-xs font-semibold hover:bg-stone-50"
            >
              Sản xuất Hàng loạt
            </Link>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#A96B54] px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90"
            >
              <span>Mở Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A96B54]/30 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A96B54]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TNT Lab Edition • Dual Image Pipeline</span>
          </div>

          <h1 className="mt-5 font-editorial text-4xl font-extrabold leading-tight sm:text-6xl">
            Biến file <span className="text-[#A96B54]">.docx bài tập</span> thành
            Website Portfolio chuẩn Canva
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg">
            Kéo thả 1 hoặc nhiều file Word bài tập thực hành. Hệ thống tự động bóc ảnh
            nhúng gốc, tóm tắt thành Case Study Đề bài – Giải pháp – Kết quả, và tự vẽ
            ảnh AI theo chủ đề cho các bài chưa có hình minh họa.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full bg-[#A96B54] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              <Layers className="h-4 w-4" />
              <span>Bắt đầu tạo Portfolio (/studio)</span>
            </Link>
            <Link
              href="/batch"
              className="inline-flex items-center gap-2 rounded-full bg-[#304254] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              <Factory className="h-4 w-4" />
              <span>Sản xuất hàng loạt cả lớp (/batch)</span>
            </Link>
            <Link
              href="/tuthivananhportfolio"
              className="inline-flex items-center gap-2 rounded-full border border-[#3E2723]/25 bg-white px-6 py-3.5 text-sm font-semibold transition hover:bg-stone-50"
            >
              <span>Xem Portfolio Mẫu Từ Thị Vân Anh</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[#3E2723]/10 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A96B54]/15 text-[#A96B54]">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-editorial text-xl font-bold">
              Tách & Tóm tắt Bài tập DOCX
            </h2>
            <p className="mt-2 text-sm leading-relaxed opacity-75">
              Tự động nhận diện nhiều bài tập trong cùng một file Word, cô đọng thành thẻ
              dự án chuyên nghiệp kèm trích xuất chỉ số và kỹ năng.
            </p>
          </div>

          <div className="rounded-3xl border border-[#3E2723]/10 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#304254]/15 text-[#304254]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-editorial text-xl font-bold">
              Cơ chế Hình ảnh Kép (DOCX + AI)
            </h2>
            <p className="mt-2 text-sm leading-relaxed opacity-75">
              Giữ nguyên ảnh chụp màn hình/biểu đồ trong <code>word/media/*</code> hoặc
              bấm 1 nút để AI vẽ ảnh minh họa đồng bộ tông màu Canva.
            </p>
          </div>

          <div className="rounded-3xl border border-[#3E2723]/10 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700/15 text-emerald-700">
              <Download className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-editorial text-xl font-bold">
              Xuất ZIP Độc lập & Public URL
            </h2>
            <p className="mt-2 text-sm leading-relaxed opacity-75">
              Đóng gói HTML/CSS + toàn bộ ảnh nội bộ vào file <code>.zip</code> mở offline
              không lỗi ảnh, hoặc xuất PDF Slide Deck chất lượng cao.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
