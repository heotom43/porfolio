import type { ProjectItem } from '@/schema/portfolio.schema';

export function getProjectSlug(project: ProjectItem, index: number): string {
  if (project.slug && project.slug.trim()) {
    return project.slug.trim();
  }
  if (project.id && project.id.trim()) {
    return project.id.trim();
  }
  return `proj-${index + 1}`;
}

export function findProjectBySlug(
  projects: ProjectItem[],
  slugParam: string
): { project: ProjectItem; index: number } | null {
  if (!projects || projects.length === 0 || !slugParam) return null;
  const decoded = decodeURIComponent(slugParam).trim().toLowerCase();

  // 1. Exact match by slug or id
  const exactIdx = projects.findIndex(
    (p) =>
      (p.slug && p.slug.toLowerCase() === decoded) ||
      p.id.toLowerCase() === decoded
  );
  if (exactIdx !== -1) return { project: projects[exactIdx], index: exactIdx };

  // 2. Title-slug match
  const sanitize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const titleIdx = projects.findIndex((p) => sanitize(p.title) === decoded);
  if (titleIdx !== -1) return { project: projects[titleIdx], index: titleIdx };

  // 3. 1-based index (e.g. "proj-1", "project-1", "bai-1", "bai-tap-1", "1")
  const numMatch = decoded.match(/^(?:proj(?:ect)?-|bai(?:-tap)?-)?(\d+)$/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const zeroBased = num - 1;
    if (zeroBased >= 0 && zeroBased < projects.length) {
      return { project: projects[zeroBased], index: zeroBased };
    }
  }

  // 4. Substring fallback match
  const subIdx = projects.findIndex(
    (p) =>
      p.id.toLowerCase().includes(decoded) ||
      p.title.toLowerCase().includes(decoded)
  );
  if (subIdx !== -1) return { project: projects[subIdx], index: subIdx };

  return null;
}
