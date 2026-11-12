import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPortfolioBySlug } from '@/services/export/portfolio-repository';
import { PublicPortfolioClient } from './PublicPortfolioClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { portfolioSlug: string };
}): Promise<Metadata> {
  const doc = getPortfolioBySlug(params.portfolioSlug);
  if (!doc) {
    return { title: 'Portfolio Not Found' };
  }
  return {
    title: doc.seo.title,
    description: doc.seo.description,
    openGraph: {
      title: doc.seo.title,
      description: doc.seo.description,
      images: doc.seo.ogImage ? [doc.seo.ogImage] : undefined,
    },
  };
}

export default function PublicPortfolioPage({
  params,
}: {
  params: { portfolioSlug: string };
}) {
  const doc = getPortfolioBySlug(params.portfolioSlug);
  if (!doc) {
    notFound();
  }

  return <PublicPortfolioClient document={doc} />;
}
