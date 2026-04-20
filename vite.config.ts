import { defineConfig, loadEnv, type Plugin } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { join } from 'node:path';
import type { ServerResponse } from 'node:http';

function vercelApiDev(): Plugin {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');

      // Make .env vars available as process.env.* for API handlers
      for (const [key, value] of Object.entries(env)) {
        process.env[key] ??= value;
      }

      server.middlewares.use(async (req, res, next) => {
        const parsed = new URL(req.url ?? '/', 'http://localhost');

        if (!parsed.pathname.startsWith('/api/')) {
          return next();
        }

        const handlerName = parsed.pathname.slice('/api/'.length);
        const handlerPath = join(process.cwd(), 'api', `${handlerName}.ts`);

        let mod: Record<string, unknown>;
        try {
          mod = await server.ssrLoadModule(handlerPath);
        } catch {
          return next();
        }

        const handler = mod.default;
        if (typeof handler !== 'function') {
          return next();
        }

        // Build query object from URL search params (VercelRequest.query)
        const query: Record<string, string> = {};
        for (const [key, value] of parsed.searchParams.entries()) {
          query[key] = value;
        }
        Object.assign(req, { query });

        // Add VercelResponse chainable helpers
        const vRes = res as ServerResponse & {
          status(code: number): typeof vRes;
          json(data: unknown): typeof vRes;
          send(data: unknown): typeof vRes;
        };
        vRes.status = (code: number) => {
          res.statusCode = code;
          return vRes;
        };
        vRes.json = (data: unknown) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return vRes;
        };
        vRes.send = (data: unknown) => {
          res.end(typeof data === 'string' || Buffer.isBuffer(data) ? data : String(data));
          return vRes;
        };

        try {
          await handler(req, vRes);
        } catch (err) {
          console.error(`[vercel-api-dev] Error in /api/${handlerName}:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] }), vercelApiDev()],
});
