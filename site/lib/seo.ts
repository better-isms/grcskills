import type { Metadata } from 'next';
import { meta } from './content';

// One place for page metadata, so every page carries the full Open Graph and
// Twitter set (title, description, url, site name, image) and a canonical.
// Paths are relative; metadataBase in app/layout.tsx makes them absolute.
export const SITE_NAME = 'grcskills';
export const HOME_TITLE = 'grcskills: open GRC skills for AI agents';
export const DEFAULT_IMAGE = '/og.png';
export const HOME_DESCRIPTION = `Open GRC skills for AI agents: ${meta.count} Agent Skills for Claude Code, Codex and Cursor. Paste one prompt; your agent reviews your GRC setup and writes a 30-day plan.`;

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  absoluteTitle?: boolean;
  noindex?: boolean;
};

export function pageMeta({ title, description, path, image = DEFAULT_IMAGE, imageAlt, type = 'website', absoluteTitle = false, noindex = false }: PageMeta): Metadata {
  const full = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const alt = imageAlt ?? full;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: SITE_NAME, title: full, description, url: path, locale: 'en', images: [{ url: image, width: 1200, height: 630, alt }] },
    twitter: { card: 'summary_large_image', title: full, description, images: [{ url: image, alt }] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
