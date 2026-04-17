import { put } from '@vercel/blob'
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  const supabase = createClient(
    process.env.VITE_PUBLIC_SUPABASE_URL!,
    process.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
  const {
    data: { user },
  } = await supabase.auth.getUser(token)

  if (!user || user.id !== process.env.VITE_PUBLIC_ADMIN_USER_ID) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const filename = req.query.filename as string
  if (!filename) {
    return res.status(400).json({ error: 'Missing filename query parameter' })
  }

  const blob = await put(`blog/${filename}`, req, { access: 'public', addRandomSuffix: true })

  return res.status(200).json(blob)
}
