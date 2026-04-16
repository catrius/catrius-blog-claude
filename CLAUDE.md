# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start Vite dev server with HMR (http://localhost:5173)
npm run build            # Type-check (tsc -b) then build for production
npm run lint             # ESLint across the project
npm run preview          # Preview production build locally
npm run update-database  # Regenerate Supabase types from remote schema → src/types/database.ts
npm run update-claude    # Incremental CLAUDE.md update (diffs from last-indexed hash)
npm run update-claude:full  # Full repo scan and CLAUDE.md rewrite
```

No test framework is configured.

## Architecture

This is a React 19 + TypeScript + Vite 8 single-page application, scaffolded from the Vite React template.

**React Compiler** is enabled via `@rolldown/plugin-babel` with `reactCompilerPreset()` in `vite.config.ts`. This automatically optimizes memoization — avoid manual `useMemo`/`useCallback` unless there's a specific reason.

**Entry flow:** `index.html` → `src/main.tsx` (creates React root in StrictMode, wrapped in `BrowserRouter`) → `src/App.tsx` (router shell) → page components.

**Routing:** Client-side routing via `react-router` v7. Routes defined in `App.tsx`: `/` → `Home`, `/posts/:id` → `PostDetail`.

**State management:** Local only. No global state library. Page components use `useState`/`useEffect` for data fetching from Supabase.

**Supabase:** Full-stack backend via `@supabase/supabase-js`. Client initialized in `src/lib/supabase.ts` (typed with generated `Database` type). Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars (see `.env.example`). Schema has `post` and `category` tables; types are generated via `npm run update-database` into `src/types/database.ts`.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. `@tailwindcss/typography` plugin for prose styling (used in `PostDetail` for rendered Markdown). `src/index.css` contains only Tailwind imports — all styling is done with Tailwind utility classes.

**Assets:** SVG icon sprite sheet in `public/icons.svg` referenced via `<use href>`.

**Git hooks:** Husky pre-commit hook (`.husky/pre-commit`) runs `npm run lint && npx tsc -b` before every commit.

## File Inventory

### Source (`src/`)

| File | Purpose |
|---|---|
| `main.tsx` | Entry point. Mounts `<App />` inside `<StrictMode>` and `<BrowserRouter>` on `#root`. Imports global styles. |
| `App.tsx` | Router shell. Defines `Routes`: `/` → `Home`, `/posts/:id` → `PostDetail`. Wrapped in a max-width container. |
| `index.css` | Tailwind CSS imports only (`@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`). |
| `pages/Home.tsx` | Home page. Fetches posts and categories from Supabase, renders `Sidebar` + `PostList`. Supports filtering by category. |
| `pages/PostDetail.tsx` | Single post page. Fetches post by `id` param, renders Markdown content via `react-markdown` with prose styling. |
| `pages/PostList.tsx` | Presentational component. Renders a list of post cards with title, excerpt, date, and links to detail page. |
| `components/Sidebar.tsx` | Category sidebar (hidden on mobile). Shows "All Posts" + per-category buttons with post counts. Controls filtering in `Home`. |
| `types/database.ts` | Auto-generated Supabase database types (via `npm run update-database`). Defines `post` and `category` table types and helper generics (`Tables`, `TablesInsert`, `TablesUpdate`). |
| `env.d.ts` | Vite env type declarations for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| `lib/supabase.ts` | Supabase typed client singleton. Validates env vars at import time. |

### Public (`public/`)

| File | Purpose |
|---|---|
| `favicon.svg` | Browser favicon. |
| `icons.svg` | SVG sprite sheet. Icons: `documentation-icon`, `social-icon`, `github-icon`, `discord-icon`, `x-icon`, `bluesky-icon`. Referenced via `<use href="#id">`. |

### Config (root)

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite config. Plugins: `@tailwindcss/vite`, `@vitejs/plugin-react`, `@rolldown/plugin-babel` with `reactCompilerPreset()`. |
| `tsconfig.json` | Root TS config. Composite references to `tsconfig.app.json` and `tsconfig.node.json`. |
| `tsconfig.app.json` | App TS config. Target ES2023, react-jsx, bundler resolution, strict checks, `verbatimModuleSyntax`. Includes `src/`. |
| `tsconfig.node.json` | Build-tool TS config. Same strict settings, includes only `vite.config.ts`. |
| `eslint.config.js` | ESLint v9 flat config. Extends JS recommended, typescript-eslint, react-hooks, react-refresh. Lints `*.{ts,tsx}`, ignores `dist/`. |
| `.env.example` | Template for required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Copy to `.env.local`. |
| `package.json` | Private ESM package. Runtime deps: `react`, `react-dom` (^19.2.4), `@supabase/supabase-js`, `react-router`, `react-markdown`, `@tailwindcss/typography`, `tailwindcss`. Key devDeps: `vite` 8, `typescript` ~6.0, `husky` 9, `babel-plugin-react-compiler` 1.0, `supabase` CLI. |

## TypeScript

- Target: ES2023, JSX: react-jsx, bundler module resolution
- Strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports

## ESLint

Flat config format (ESLint v9). Extends: JS recommended, typescript-eslint recommended, react-hooks, react-refresh. Only lints `**/*.{ts,tsx}`.

## Self-Maintenance

When making significant changes (adding/removing files, changing architecture, adding dependencies, modifying build config), update this CLAUDE.md incrementally to reflect those changes. Keep updates minimal and targeted — do not rescan the whole repo.

When doing a broad update of CLAUDE.md, use `git diff <last-indexed-hash>..HEAD --stat` to find what changed since the last index, then only read and re-document those files. Update the hash at the bottom after.

<!-- last-indexed: 625b239 -->
