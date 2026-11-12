import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPortfolioBySlug } from '@/services/export/portfolio-repository';
import type { ProjectItem, ProjectsSection } from '@/schema/portfolio.schema';
import { ProjectDetailClientView } from './ProjectDetailClientView';
import { findProjectBySlug } from './projectSlugHelper';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { portfolioSlug: string; projectSlug: string };
}): Promise<Metadata> {
  const doc = getPortfolioBySlug(params.portfolioSlug);
  if (!doc) {
    return { title: 'Project Not Found' };
  }
  const projectsSec = doc.sections.find(
    (s): s is ProjectsSection => s.type === 'projects'
  );
  const projects = projectsSec?.projects ?? [];
  const found = findProjectBySlug(projects, params.projectSlug);
  if (!found) {
    return { title: 'Project Not Found' };
  }

  const { project } = found;
  const firstMedia = project.media[0];

  return {
    title: `${project.title} | ${doc.seo.title}`,
    description: project.summary || doc.seo.description,
    openGraph: {
      title: `${project.title} | ${doc.seo.title}`,
      description: project.summary || doc.seo.description,
      images: firstMedia?.url ? [firstMedia.url] : undefined,
    },
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: { portfolioSlug: string; projectSlug: string };
}) {
  const doc = getPortfolioBySlug(params.portfolioSlug);
  if (!doc) {
    notFound();
  }

  const projectsSec = doc.sections.find(
    (s): s is ProjectsSection => s.type === 'projects'
  );
  const projects = projectsSec?.projects ?? [];
  const found = findProjectBySlug(projects, params.projectSlug);
  if (!found) {
    notFound();
  }

  return (
    <ProjectDetailClientView
      portfolioDoc={doc}
      portfolioSlug={params.portfolioSlug}
      project={found.project}
      projectIndex={found.index}
      allProjects={projects}
      navigationLoop={projectsSec?.navigationLoop ?? true}
    />
  );
}
