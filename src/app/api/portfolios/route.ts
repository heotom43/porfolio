import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDocumentSchema } from '@/schema/portfolio.schema';
import {
  getPortfolioBySlug,
  listSavedPortfolios,
  savePortfolioDocument,
} from '@/services/export/portfolio-repository';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (slug) {
    const found = getPortfolioBySlug(slug);
    if (!found) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    return NextResponse.json(found);
  }
  return NextResponse.json({ portfolios: listSavedPortfolios() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doc = PortfolioDocumentSchema.parse(body);
    const saved = savePortfolioDocument(doc);
    return NextResponse.json({ ok: true, portfolio: saved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Invalid portfolio document',
      },
      { status: 400 }
    );
  }
}
