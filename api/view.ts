import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slug = req.query.slug as string;
  if (!slug) {
    return res.status(400).json({ error: 'Missing slug query parameter' });
  }

  const supabase = createClient(
    process.env.VITE_PUBLIC_SUPABASE_URL!,
    process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { error } = await supabase.rpc('increment_post_view', { p_slug: slug });
  if (error) {
    return res.status(500).json({ error: 'Failed to record view' });
  }

  return res.status(204).end();
}
