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

**Dev server:** Do not start the dev server yourself. Check if one is already running (e.g., `lsof -ti:5173`) and use it.

**Git diffs:** Exclude `package-lock.json` from diffs when reviewing changes (use `git diff -- ':!package-lock.json'`). The lock file delta is noise — dependency changes are visible in `package.json`.

## Supabase CLI (remote database)

To run SQL against the linked remote Supabase database, use `npx supabase db query --linked`:

```bash
npx supabase db query --linked "SELECT * FROM category;"
```

The project is already linked (project ID `tjfhuqfoswtmsdmmepcd`). After schema changes, regenerate types with `npm run update-database`.

## Architecture

This is a React 19 + TypeScript + Vite 8 single-page application, scaffolded from the Vite React template.

**React Compiler** is enabled via `@rolldown/plugin-babel` with `reactCompilerPreset()` in `vite.config.ts`. This automatically optimizes memoization — avoid manual `useMemo`/`useCallback` unless there's a specific reason.

**Entry flow:** `index.html` → `src/main.tsx` (creates React root in StrictMode, wrapped in Redux `Provider`, `AuthProvider`, and `BrowserRouter`) → `src/App.tsx` (router shell) → page components.

**Routing:** Client-side routing via `react-router` v7. Routes defined in `App.tsx`: `/` → `Home`, `/categories/:categorySlug` → `Home` (filtered), `/posts/:slug` → `PostDetail`, `/pages/:slug` → `PageDetail`. Admin routes (lazy-loaded, guarded by `AdminRoute`): `/admin` → `AdminDashboard`, `/admin/posts/new` → `AdminPostNew`, `/admin/posts/:id/edit` → `AdminPostEdit`.

**State management:** RTK Query (`@reduxjs/toolkit/query`) handles all Supabase data fetching and caching. API slice defined in `src/store/api.ts`, store in `src/store/store.ts`. Page components consume auto-generated hooks (`useGetPostsQuery`, `useGetPostQuery`, `useGetCategoriesQuery`, `useGetPostCountsQuery`, `useGetPagesQuery`, `useGetPageQuery`, `useGetPostByIdQuery`, `useGetAdminPostsQuery`, `useCreatePostMutation`, `useUpdatePostMutation`, `useDeletePostMutation`). Local `useState` is used only for UI state (e.g., category filter selection, sidebar toggle).

**Auth:** Supabase Google OAuth managed via `AuthContext` (`src/lib/AuthContext.tsx`). `AuthProvider` wraps the app and exposes `session`, `user`, `isAdmin`, `isLoading`, `signInWithGoogle()`, `signOut()` via `useAuth()` hook. Admin identity is checked client-side against `VITE_PUBLIC_ADMIN_USER_ID` env var; server-side enforcement uses Supabase RLS policies on the `post` table.

**Supabase:** Full-stack backend via `@supabase/supabase-js`. Client initialized in `src/lib/supabase.ts` (typed with generated `Database` type). Requires `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `VITE_PUBLIC_ADMIN_USER_ID` env vars (see `.env.example`). Schema has `post`, `category`, and `page` tables; types are generated via `npm run update-database` into `src/types/database.ts`. Google OAuth is enabled for admin login; RLS policies on `post` restrict mutations to the admin user.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. `@tailwindcss/typography` plugin for prose styling (used in `PostDetail` for rendered Markdown). `src/index.css` contains only Tailwind imports — all styling is done with Tailwind utility classes.

**Image uploads:** Admin post editor supports image uploads via Vercel Blob. Images can be added via the toolbar camera button, clipboard paste, or drag-and-drop. The upload is handled by a Vercel serverless function (`api/upload.ts`) that verifies the Supabase auth token and streams the file to Blob storage. Requires `BLOB_READ_WRITE_TOKEN` env var (provided automatically by Vercel Blob store integration).

**Assets:** SVG icon sprite sheet in `public/icons.svg` referenced via `<use href>`.

**Git hooks:** Husky pre-commit hook (`.husky/pre-commit`) runs `npm run lint && npx tsc -b` before every commit.

## File Inventory

### Source (`src/`)

| File | Purpose |
|---|---|
| `main.tsx` | Entry point. Mounts `<App />` inside `<StrictMode>`, Redux `<Provider>`, `<AuthProvider>`, and `<BrowserRouter>` on `#root`. Imports global styles. |
| `App.tsx` | Router shell. Defines public routes (`/`, `/categories/:categorySlug`, `/posts/:slug`, `/pages/:slug`) and lazy-loaded admin routes (`/admin`, `/admin/posts/new`, `/admin/posts/:id/edit`) guarded by `AdminRoute`. Wrapped in shared `Header`/`Footer` layout. |
| `index.css` | Tailwind CSS imports only (`@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`). |
| `pages/Home.tsx` | Home page. Uses `useGetPostsQuery`, `useGetCategoriesQuery`, and `useGetPostCountsQuery` hooks, renders `NavBar` + `PostList`. Supports filtering by category via URL param. Infinite scroll via offset pagination. |
| `pages/PostDetail.tsx` | Single post page. Uses `useGetPostQuery` hook, renders Markdown content via `react-markdown` with prose styling. Shows Edit/Delete buttons when admin is logged in (hybrid admin controls). |
| `pages/PageDetail.tsx` | Static page view. Uses `useGetPageQuery` hook, renders Markdown content with prose styling. |
| `pages/admin/AdminDashboard.tsx` | Admin post list table with New/Edit/Delete actions. Uses `useGetAdminPostsQuery` and `useDeletePostMutation`. |
| `pages/admin/AdminPostNew.tsx` | Create post page. Renders `PostForm`, calls `useCreatePostMutation`, navigates to `/admin` on success. |
| `pages/admin/AdminPostEdit.tsx` | Edit post page. Fetches post by ID via `useGetPostByIdQuery`, renders `PostForm`, calls `useUpdatePostMutation`. |
| `pages/PostList.tsx` | Presentational component. Renders a responsive grid of post cards with infinite scroll (IntersectionObserver sentinel). |
| `components/NavBar.tsx` | Category filter bar (desktop only, `hidden md:block`). Horizontal Swiper of pill buttons with post counts. On mobile, categories are in the Sidebar instead. |
| `components/Header.tsx` | Site header with logo, page-link Swiper (desktop), auth controls (Sign in/Admin/Sign out), and hamburger menu button (mobile). Manages Sidebar open/close state. |
| `components/Footer.tsx` | Site footer with copyright and social links (GitHub, X, Bluesky, Discord). |
| `components/Sidebar.tsx` | Full-screen mobile sidebar (slides from right). Contains page links, category navigation, and auth controls. Hidden on `md+` screens. |
| `components/AdminRoute.tsx` | Route guard for admin pages. Checks `useAuth()`, renders `<Outlet />` if admin, redirects to `/` otherwise. |
| `components/admin/PostForm.tsx` | Shared post create/edit form with title, slug (auto-generated), excerpt, content (`@uiw/react-md-editor` with built-in preview), category select, and image upload (toolbar button, paste, drag-and-drop → Vercel Blob). |
| `components/admin/DeleteConfirmDialog.tsx` | Modal dialog for confirming post deletion. Uses native `<dialog>` element. |
| `store/api.ts` | RTK Query API slice. Queries: `getPosts` (paginated), `getPost` (by slug), `getPostById`, `getAdminPosts`, `getCategories`, `getPostCounts`, `getPages`, `getPage`. Mutations: `createPost`, `updatePost`, `deletePost`. All use Supabase client via `queryFn`. Exports auto-generated hooks. |
| `store/store.ts` | Redux store. Configures store with RTK Query reducer and middleware. |
| `types/database.ts` | Auto-generated Supabase database types (via `npm run update-database`). Defines `post`, `category`, and `page` table types and helper generics (`Tables`, `TablesInsert`, `TablesUpdate`). |
| `env.d.ts` | Vite env type declarations for `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `VITE_PUBLIC_ADMIN_USER_ID`. |
| `lib/supabase.ts` | Supabase typed client singleton. Validates env vars at import time. |
| `lib/AuthContext.tsx` | Auth context and provider for Supabase Google OAuth. Exposes `useAuth()` hook with `session`, `user`, `isAdmin`, `isLoading`, `signInWithGoogle()`, `signOut()`. |

### Public (`public/`)

| File | Purpose |
|---|---|
| `favicon.svg` | Browser favicon. |
| `icons.svg` | SVG sprite sheet. Icons: `documentation-icon`, `social-icon`, `github-icon`, `discord-icon`, `x-icon`, `bluesky-icon`. Referenced via `<use href="#id">`. |

### API (`api/`)

| File | Purpose |
|---|---|
| `upload.ts` | Vercel serverless function. Accepts POST with file body + `?filename=` query param. Verifies Supabase auth token (admin-only), uploads to Vercel Blob under `blog/` prefix, returns blob metadata. |

### Config (root)

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite config. Plugins: `vite-tsconfig-paths`, `@tailwindcss/vite`, `@vitejs/plugin-react`, `@rolldown/plugin-babel` with `reactCompilerPreset()`. |
| `tsconfig.json` | Root TS config. Composite references to `tsconfig.app.json` and `tsconfig.node.json`. |
| `tsconfig.app.json` | App TS config. Target ES2023, react-jsx, bundler resolution, strict checks, `verbatimModuleSyntax`. Path alias `@/*` → `src/*`. Includes `src/`. |
| `tsconfig.node.json` | Build-tool TS config. Same strict settings, includes only `vite.config.ts`. |
| `eslint.config.js` | ESLint v9 flat config. Extends JS recommended, typescript-eslint, react-hooks, react-refresh, better-tailwindcss recommended. Uses typescript-eslint parser with project-aware type checking. Lints `*.{ts,tsx}`, ignores `dist/`. |
| `.env.example` | Template for required env vars (`VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `VITE_PUBLIC_ADMIN_USER_ID`, `BLOB_READ_WRITE_TOKEN`). Copy to `.env.local`. |
| `package.json` | Private ESM package. Runtime deps: `react`, `react-dom` (^19.2.4), `@reduxjs/toolkit`, `react-redux`, `@supabase/supabase-js`, `react-router`, `react-markdown`, `@uiw/react-md-editor`, `swiper`, `@tailwindcss/typography`, `tailwindcss`, `@vercel/blob`. Key devDeps: `vite` 8, `typescript` ~6.0, `husky` 9, `babel-plugin-react-compiler` 1.0, `eslint-plugin-better-tailwindcss` 4.4, `supabase` CLI. |

## TypeScript

- Target: ES2023, JSX: react-jsx, bundler module resolution
- Strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports

## ESLint

Flat config format (ESLint v9). Extends: JS recommended, typescript-eslint recommended, react-hooks, react-refresh, `eslint-plugin-better-tailwindcss` recommended (stylistic + correctness rules: class ordering, line wrapping, canonical classes, duplicate/deprecated class removal, unknown/conflicting class detection). Uses typescript-eslint parser with `project: ['./tsconfig.app.json', './tsconfig.node.json']` for type-aware linting. Entry point set to `src/index.css` for TW v4 config resolution. Only lints `**/*.{ts,tsx}`.

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
