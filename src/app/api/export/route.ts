import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDocumentSchema } from '@/schema/portfolio.schema';
import { sanitizeSlug } from '@/services/export/portfolio-repository';
import {
  exportBulkPortfoliosZip,
  exportSinglePortfolioZip,
  renderStandaloneHtml,
} from '@/services/export/zip-exporter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const format: string = body.format || 'zip';

    if (Array.isArray(body.documents)) {
      if (body.documents.length === 0) {
        return NextResponse.json(
          { error: 'Danh sách Portfolio cần xuất không được rỗng.' },
          { status: 400 }
        );
      }
      const docs = body.documents.map((d: unknown) =>
        PortfolioDocumentSchema.parse(d)
      );
      const buffer = await exportBulkPortfoliosZip(docs);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="portfolio-batch-export.zip"',
        },
      });
    }

    const doc = PortfolioDocumentSchema.parse(body.document ?? body);
    const safeFileBase = sanitizeSlug(doc.slug);

    if (format === 'html') {
      const html = renderStandaloneHtml(doc, new Map(), true);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeFileBase}.html"`,
        },
      });
    }

    const buffer = await exportSinglePortfolioZip(doc);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeFileBase}.zip"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 400 }
    );
  }
}
