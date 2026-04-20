import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const SITE_URL = 'https://catri.us'

const supabase = createClient(
  process.env.VITE_PUBLIC_SUPABASE_URL!,
  process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatDate(dateStr: string): string {
  return dateStr.split('T')[0]
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const [postsResult, pagesResult, categoriesResult] = await Promise.all([
    supabase.from('post').select('slug, created_at').order('created_at', { ascending: false }),
    supabase.from('page').select('slug, created_at'),
    supabase.from('category').select('slug'),
  ])

  const posts = postsResult.data ?? []
  const pages = pagesResult.data ?? []
  const categories = categoriesResult.data ?? []

  const urls = [
    `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    `  <url>
    <loc>${SITE_URL}/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`,
    `  <url>
    <loc>${SITE_URL}/tags</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ...categories.map(
      (c) => `  <url>
    <loc>${SITE_URL}/categories/${escapeXml(c.slug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    ),
    ...posts.map(
      (p) => `  <url>
    <loc>${SITE_URL}/posts/${escapeXml(p.slug)}</loc>
    <lastmod>${formatDate(p.created_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
    ...pages.map(
      (p) => `  <url>
    <loc>${SITE_URL}/pages/${escapeXml(p.slug)}</loc>
    <lastmod>${formatDate(p.created_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  return res.status(200).send(xml)
}
