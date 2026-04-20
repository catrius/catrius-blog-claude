import { defineConfig, loadEnv, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

function apiUpload(): Plugin {
  return {
    name: 'api-upload',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')

      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const token = req.headers.authorization?.replace('Bearer ', '')
        if (!token) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Missing authorization token' }))
          return
        }

        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          env.VITE_PUBLIC_SUPABASE_URL,
          env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        )
        const {
          data: { user },
        } = await supabase.auth.getUser(token)

        if (!user || user.id !== env.VITE_PUBLIC_ADMIN_USER_ID) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }

        const url = new URL(req.url ?? '/', 'http://localhost')
        const filename = url.searchParams.get('filename')
        if (!filename) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Missing filename query parameter' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk as ArrayBuffer))
        }
        const body = Buffer.concat(chunks)

        const { put } = await import('@vercel/blob')
        const blob = await put(`blog/${filename}`, body, {
          access: 'public',
          addRandomSuffix: true,
          token: env.BLOB_READ_WRITE_TOKEN,
        })

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(blob))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    apiUpload(),
  ],
})
