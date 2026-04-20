import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE_NAME = 'Catri.us';
const SITE_DESCRIPTION = `${SITE_NAME} — a personal blog`;

const supabase = createClient(process.env.VITE_PUBLIC_SUPABASE_URL!, process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildMetaTags(meta: { title: string; description: string; type: string }): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDescription = escapeHtml(meta.description);
  return [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.type)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
  ].join('\n    ');
}

function injectMeta(html: string, tags: string): string {
  return html
    .replace(/<title>.*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*\/>/, '')
    .replace('</head>', `    ${tags}\n  </head>`);
}

async function getPostMeta(slug: string) {
  const { data } = await supabase.from('post').select('title, excerpt').eq('slug', slug).single();

  if (!data) return null;
  return {
    title: `${data.title} | ${SITE_NAME}`,
    description: data.excerpt,
    type: 'article',
  };
}

async function getPageMeta(slug: string) {
  const { data } = await supabase.from('page').select('title').eq('slug', slug).single();

  if (!data) return null;
  return {
    title: `${data.title} | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    type: 'website',
  };
}

async function getCategoryMeta(slug: string) {
  const { data } = await supabase.from('category').select('name').eq('slug', slug).single();

  if (!data) return null;
  return {
    title: `${data.name} | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    type: 'website',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url ?? '/';

  let meta: { title: string; description: string; type: string } | null = null;

  const postMatch = path.match(/^\/posts\/([^/?#]+)/);
  const pageMatch = path.match(/^\/pages\/([^/?#]+)/);
  const categoryMatch = path.match(/^\/categories\/([^/?#]+)/);

  if (postMatch) {
    meta = await getPostMeta(decodeURIComponent(postMatch[1]));
  } else if (pageMatch) {
    meta = await getPageMeta(decodeURIComponent(pageMatch[1]));
  } else if (categoryMatch) {
    meta = await getCategoryMeta(decodeURIComponent(categoryMatch[1]));
  }

  const htmlPath = join(process.cwd(), 'dist', 'index.html');
  let html = readFileSync(htmlPath, 'utf-8');

  if (meta) {
    html = injectMeta(html, buildMetaTags(meta));
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
