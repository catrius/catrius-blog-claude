import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
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

  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok || !imageRes.body) {
    return res.status(502).json({ error: 'Failed to fetch remote image' });
  }

  const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg';
  const ext = contentType.split('/')[1]?.split(';')[0] ?? 'jpg';
  const filename = `cover-${Date.now()}.${ext}`;

  const blob = await put(`blog/${filename}`, imageRes.body, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });

  return res.status(200).json(blob);
}
