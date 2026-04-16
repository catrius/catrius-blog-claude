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

## Supabase CLI (remote database)

To run SQL against the linked remote Supabase database, use `npx supabase db query --linked`:

```bash
npx supabase db query --linked "SELECT * FROM category;"
```

The project is already linked (project ID `tjfhuqfoswtmsdmmepcd`). After schema changes, regenerate types with `npm run update-database`.

## Architecture

This is a React 19 + TypeScript + Vite 8 single-page application, scaffolded from the Vite React template.

**React Compiler** is enabled via `@rolldown/plugin-babel` with `reactCompilerPreset()` in `vite.config.ts`. This automatically optimizes memoization — avoid manual `useMemo`/`useCallback` unless there's a specific reason.

**Entry flow:** `index.html` → `src/main.tsx` (creates React root in StrictMode, wrapped in Redux `Provider` and `BrowserRouter`) → `src/App.tsx` (router shell) → page components.

**Routing:** Client-side routing via `react-router` v7. Routes defined in `App.tsx`: `/` → `Home`, `/categories/:categorySlug` → `Home` (filtered), `/posts/:slug` → `PostDetail`, `/pages/:slug` → `PageDetail`.

**State management:** RTK Query (`@reduxjs/toolkit/query`) handles all Supabase data fetching and caching. API slice defined in `src/store/api.ts`, store in `src/store/store.ts`. Page components consume auto-generated hooks (`useGetPostsQuery`, `useGetPostQuery`, `useGetCategoriesQuery`, `useGetPostCountsQuery`, `useGetPagesQuery`, `useGetPageQuery`). Local `useState` is used only for UI state (e.g., category filter selection, sidebar toggle).

**Supabase:** Full-stack backend via `@supabase/supabase-js`. Client initialized in `src/lib/supabase.ts` (typed with generated `Database` type). Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars (see `.env.example`). Schema has `post`, `category`, and `page` tables; types are generated via `npm run update-database` into `src/types/database.ts`.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. `@tailwindcss/typography` plugin for prose styling (used in `PostDetail` for rendered Markdown). `src/index.css` contains only Tailwind imports — all styling is done with Tailwind utility classes.

**Assets:** SVG icon sprite sheet in `public/icons.svg` referenced via `<use href>`.

**Git hooks:** Husky pre-commit hook (`.husky/pre-commit`) runs `npm run lint && npx tsc -b` before every commit.

## File Inventory

### Source (`src/`)

| File | Purpose |
|---|---|
| `main.tsx` | Entry point. Mounts `<App />` inside `<StrictMode>`, Redux `<Provider>`, and `<BrowserRouter>` on `#root`. Imports global styles. |
| `App.tsx` | Router shell. Defines `Routes`: `/` → `Home`, `/categories/:categorySlug` → `Home`, `/posts/:slug` → `PostDetail`, `/pages/:slug` → `PageDetail`. Wrapped in shared `Header`/`Footer` layout. |
| `index.css` | Tailwind CSS imports only (`@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`). |
| `pages/Home.tsx` | Home page. Uses `useGetPostsQuery`, `useGetCategoriesQuery`, and `useGetPostCountsQuery` hooks, renders `NavBar` + `PostList`. Supports filtering by category via URL param. Infinite scroll via offset pagination. |
| `pages/PostDetail.tsx` | Single post page. Uses `useGetPostQuery` hook, renders Markdown content via `react-markdown` with prose styling. |
| `pages/PageDetail.tsx` | Static page view. Uses `useGetPageQuery` hook, renders Markdown content with prose styling. |
| `pages/PostList.tsx` | Presentational component. Renders a responsive grid of post cards with infinite scroll (IntersectionObserver sentinel). |
| `components/NavBar.tsx` | Category filter bar (desktop only, `hidden md:block`). Horizontal Swiper of pill buttons with post counts. On mobile, categories are in the Sidebar instead. |
| `components/Header.tsx` | Site header with logo, page-link Swiper (desktop), and hamburger menu button (mobile). Manages Sidebar open/close state. |
| `components/Footer.tsx` | Site footer with copyright and social links (GitHub, X, Bluesky, Discord). |
| `components/Sidebar.tsx` | Full-screen mobile sidebar (slides from right). Contains page links and category navigation. Hidden on `md+` screens. |
| `store/api.ts` | RTK Query API slice. Defines `getPosts` (paginated), `getPost`, `getCategories`, `getPostCounts`, `getPages`, and `getPage` endpoints using Supabase client via `queryFn`. Exports auto-generated hooks. |
| `store/store.ts` | Redux store. Configures store with RTK Query reducer and middleware. |
| `types/database.ts` | Auto-generated Supabase database types (via `npm run update-database`). Defines `post`, `category`, and `page` table types and helper generics (`Tables`, `TablesInsert`, `TablesUpdate`). |
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
| `eslint.config.js` | ESLint v9 flat config. Extends JS recommended, typescript-eslint, react-hooks, react-refresh, tailwindcss. Lints `*.{ts,tsx}`, ignores `dist/`. |
| `.env.example` | Template for required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Copy to `.env.local`. |
| `package.json` | Private ESM package. Runtime deps: `react`, `react-dom` (^19.2.4), `@reduxjs/toolkit`, `react-redux`, `@supabase/supabase-js`, `react-router`, `react-markdown`, `swiper`, `@tailwindcss/typography`, `tailwindcss`. Key devDeps: `vite` 8, `typescript` ~6.0, `husky` 9, `babel-plugin-react-compiler` 1.0, `eslint-plugin-tailwindcss` 4.0 beta, `supabase` CLI. |

## TypeScript

- Target: ES2023, JSX: react-jsx, bundler module resolution
- Strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports

## ESLint

Flat config format (ESLint v9). Extends: JS recommended, typescript-eslint recommended, react-hooks, react-refresh, tailwindcss (classnames-order, enforces-negative-arbitrary-values, enforces-shorthand, no-contradicting-classname, no-unnecessary-arbitrary-value). Uses `config: {}` to work around TW v4 config resolution in the plugin's worker thread. Only lints `**/*.{ts,tsx}`.

## Self-Maintenance

**IMPORTANT — Update this file as part of every task that changes the items below.** Do not defer updates to a later step; make them inline as you work.

Update CLAUDE.md when any of these happen:
- **New or removed source file** → add/remove its row in the File Inventory table.
- **New or removed route** → update the Routing line and the `App.tsx` row.
- **New or removed RTK Query endpoint/hook** → update the State management line and the `store/api.ts` row.
- **New Supabase table** → update the Supabase line and `types/database.ts` row.
- **New runtime dependency** → update the `package.json` row.
- **Build/config change** → update the Commands section or relevant config row.
- **Architecture change** (e.g., new layout component, responsive strategy) → update the Architecture section.

Keep updates minimal and targeted — only touch the lines affected by your change.

After updating, bump the last-indexed hash at the bottom of this file to the current HEAD.

For a broad catch-up, run `git diff <last-indexed-hash>..HEAD --stat`, read only the changed files, and update accordingly.

<!-- last-indexed: 5906547 -->
