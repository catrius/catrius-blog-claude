import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const supabase = createClient(
    process.env.VITE_PUBLIC_SUPABASE_URL!,
    process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user || user.id !== process.env.VITE_PUBLIC_ADMIN_USER_ID) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Missing q query parameter' });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ error: 'UNSPLASH_ACCESS_KEY not configured' });
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '12');
  url.searchParams.set('orientation', 'landscape');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Unsplash API error' });
  }

  const data = (await response.json()) as {
    results: Array<{
      id: string;
      urls: { small: string; regular: string };
      alt_description: string | null;
      user: { name: string; links: { html: string } };
    }>;
  };

  const images = data.results.map((img) => ({
    id: img.id,
    thumb: img.urls.small,
    full: img.urls.regular,
    alt: img.alt_description,
    photographer: img.user.name,
    photographerUrl: img.user.links.html,
  }));

  return res.status(200).json({ images });
}
