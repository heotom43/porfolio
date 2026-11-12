import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DOCX_DIRECTORY = path.resolve(process.cwd(), "data/docx-files");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json({ error: "Hãy chọn một file .docx." }, { status: 400 });
    }
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: "File DOCX vượt quá giới hạn 30 MB." }, { status: 413 });
    }

    const id = randomUUID();
    await mkdir(DOCX_DIRECTORY, { recursive: true });
    await writeFile(path.join(DOCX_DIRECTORY, `${id}.docx`), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({
      id,
      url: `/api/docx-files?id=${id}&name=${encodeURIComponent(file.name)}`,
      fileName: file.name,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể lưu file DOCX." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "File DOCX không hợp lệ." }, { status: 400 });
  }
  try {
    const data = await readFile(path.join(DOCX_DIRECTORY, `${id}.docx`));
    const rawName = request.nextUrl.searchParams.get("name") ?? `${id}.docx`;
    const safeName = rawName.replace(/[\r\n"\\/]/g, "_").slice(0, 180) || `${id}.docx`;
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(safeName)}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy file DOCX." }, { status: 404 });
  }
}
