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

**Entry flow:** `index.html` → `src/main.tsx` (creates React root in StrictMode, wrapped in Redux `Provider`, `AuthProvider`, `ThemeProvider`, and `BrowserRouter`) → `src/App.tsx` (router shell) → page components.

**SEO / Meta tags:** Two layers. **Client-side:** React 19's native `<title>` and `<meta>` tag hoisting — page components render tags inline and React hoists them to `<head>`. `PostDetail` sets title + description (from excerpt) + OG article tags; `PageDetail` sets title + OG title; `Home` sets title when filtered by category, otherwise falls back to "Catri.us". All per-page titles use the `"Page | Catri.us"` suffix pattern. Fallback defaults live in `index.html`. **Server-side (for crawlers):** `api/og.ts` is a Vercel serverless function that intercepts `/posts/:slug`, `/pages/:slug`, and `/categories/:slug` requests (via `vercel.json` rewrites), fetches data from Supabase, and injects OG meta tags into `dist/index.html` before serving it. This ensures Facebook, X, and other social crawlers see correct meta tags without executing JavaScript.

**Routing:** Client-side routing via `react-router` v7. Routes defined in `App.tsx`: `/` → `Home`, `/search` → `Search` (full-text search with `?q=` param), `/tags` → `TagsIndex` (browse all tags with counts), `/tags/:tag` → `TagPosts` (posts filtered by tag), `/categories/:categorySlug` → `Home` (filtered), `/posts/:slug` → `PostDetail`, `/pages/:slug` → `PageDetail`. Admin routes (lazy-loaded, guarded by `AdminRoute`): `/admin` → `AdminDashboard` (hub with counts/links), `/admin/posts` → `AdminPosts`, `/admin/posts/new` → `AdminPostNew`, `/admin/posts/:id/edit` → `AdminPostEdit`, `/admin/pages` → `AdminPages`, `/admin/pages/new` → `AdminPageNew`, `/admin/pages/:id/edit` → `AdminPageEdit`.

**State management:** RTK Query (`@reduxjs/toolkit/query`) handles all Supabase data fetching and caching. API slice defined in `src/store/api.ts`, store in `src/store/store.ts`. Page components consume auto-generated hooks (`useGetPostsQuery`, `useGetPostsByTagQuery`, `useGetAllTagsQuery`, `useSearchPostsQuery`, `useGetPostQuery`, `useGetRelatedPostsQuery`, `useGetCategoriesQuery`, `useGetPostCountsQuery`, `useGetPagesQuery`, `useGetPageQuery`, `useGetPostByIdQuery`, `useGetAdminPostsQuery`, `useCreatePostMutation`, `useUpdatePostMutation`, `useDeletePostMutation`, `useGetPageByIdQuery`, `useGetAdminPagesQuery`, `useCreatePageMutation`, `useUpdatePageMutation`, `useDeletePageMutation`). Local `useState` is used only for UI state (e.g., category filter selection, sidebar toggle).

**Auth:** Supabase Google OAuth managed via `AuthProvider` (`src/lib/AuthContext.tsx`). Provider wraps the app; `useAuth()` hook (`src/hooks/useAuth.ts`) exposes `session`, `user`, `isAdmin`, `isLoading`, `signInWithGoogle()`, `signOut()`. Admin identity is checked client-side against `VITE_PUBLIC_ADMIN_USER_ID` env var; server-side enforcement uses Supabase RLS policies on the `post` table.

**Supabase:** Full-stack backend via `@supabase/supabase-js`. Client initialized in `src/lib/supabase.ts` (typed with generated `Database` type). Requires `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `VITE_PUBLIC_ADMIN_USER_ID` env vars (see `.env.example`). Schema has `post`, `category`, and `page` tables; types are generated via `npm run update-database` into `src/types/database.ts`. The `post` table has a generated `fts` tsvector column (weighted: title A, excerpt B, content C) with a GIN index for full-text search, a generated `reading_time_minutes` int column (word count / 250, minimum 1), and a `tags text[]` column with a GIN index (`idx_post_tags`). Tags are auto-generated on insert/update by a `BEFORE` trigger (`trg_generate_post_tags`) that extracts the top 5 most frequent non-stop-words from title (A), excerpt (B), and content (C) using `to_tsvector('simple', ...)` with `english_stem` stop-word filtering. A `related_posts(p_id, p_tags, max_results)` SQL function returns posts ranked by tag-overlap count (used for "Related Posts" on `PostDetail`). Google OAuth is enabled for admin login; RLS policies on `post` restrict mutations to the admin user.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin. `@tailwindcss/typography` plugin for prose styling (used in `PostDetail` for rendered Markdown). Dark mode uses class-based strategy (`@custom-variant dark` in `index.css`) with a `ThemeContext` (`src/lib/ThemeContext.tsx`) managing light/dark/system preference persisted to `localStorage`. A FOUC-prevention inline script in `index.html` applies the `dark` class before React hydrates. The `ThemeToggle` component appears in the Header (desktop) and Sidebar (mobile). All styling is done with Tailwind utility classes.

**Image uploads:** Admin post and page editors support image uploads via Vercel Blob. Images can be added via the toolbar camera button, clipboard paste, or drag-and-drop. The upload is handled by a Vercel serverless function (`api/upload.ts`) that verifies the Supabase auth token and streams the file to Blob storage. Requires `BLOB_READ_WRITE_TOKEN` env var (provided automatically by Vercel Blob store integration).

**Assets:** SVG icon sprite sheet in `public/icons.svg` referenced via `<use href>`.

**Git hooks:** Husky pre-commit hook (`.husky/pre-commit`) runs `npm run lint && npx tsc -b` before every commit.

## File Inventory

### Source (`src/`)

| File | Purpose |
|---|---|
| `main.tsx` | Entry point. Mounts `<App />` inside `<StrictMode>`, Redux `<Provider>`, `<AuthProvider>`, `<ThemeProvider>`, and `<BrowserRouter>` on `#root`. Imports global styles. |
| `App.tsx` | Router shell. Defines public routes (`/`, `/search`, `/categories/:categorySlug`, `/posts/:slug`, `/pages/:slug`) and lazy-loaded admin routes (`/admin`, `/admin/posts`, `/admin/posts/new`, `/admin/posts/:id/edit`, `/admin/pages`, `/admin/pages/new`, `/admin/pages/:id/edit`) guarded by `AdminRoute`. Wrapped in shared `Header`/`Footer` layout. |
| `index.css` | Tailwind CSS imports, typography plugin, and class-based dark mode custom variant. |
| `pages/Home.tsx` | Home page. Uses `useGetPostsQuery`, `useGetCategoriesQuery`, and `useGetPostCountsQuery` hooks, renders `NavBar` + `PostList`. Supports filtering by category via URL param. Infinite scroll via offset pagination. Sets `<title>` to category name when filtered, otherwise "Catri.us". |
| `pages/Search.tsx` | Full-text search page. Uses `useSearchPostsQuery` with debounced `?q=` URL param. Renders search input + `PostList` with infinite scroll. PostgreSQL websearch syntax via Supabase `.textSearch()` on the `fts` tsvector column. |
| `pages/TagsIndex.tsx` | Browse all tags page. Uses `useGetAllTagsQuery`, renders tag pills with post counts linking to `/tags/:tag`. |
| `pages/TagPosts.tsx` | Posts filtered by tag. Uses `useGetPostsByTagQuery` with infinite scroll via `PostList`. |
| `pages/PostDetail.tsx` | Single post page. Uses `useGetPostQuery` and `useGetRelatedPostsQuery` hooks, renders Markdown content via `react-markdown` with prose styling. Shows "Related Posts" section (tag-overlap ranked) below the article. Sets `<title>`, description (from excerpt), and OG article tags. Shows Edit/Delete buttons when admin is logged in (hybrid admin controls). |
| `pages/PageDetail.tsx` | Static page view. Uses `useGetPageQuery` hook, renders Markdown content with prose styling. Sets `<title>` and OG title. |
| `pages/admin/AdminDashboard.tsx` | Admin hub page. Shows post/page counts with links to `/admin/posts` and `/admin/pages`. Uses `useGetAdminPostsQuery` and `useGetAdminPagesQuery` for counts. |
| `pages/admin/AdminPosts.tsx` | Admin post list table with New/Edit/Delete actions. Uses `useGetAdminPostsQuery`, `useGetCategoriesQuery`, and `useDeletePostMutation`. |
| `pages/admin/AdminPages.tsx` | Admin page list table with New/Edit/Delete actions. Uses `useGetAdminPagesQuery` and `useDeletePageMutation`. |
| `pages/admin/AdminPostNew.tsx` | Create post page. Renders `PostForm`, calls `useCreatePostMutation`, navigates to `/admin` on success. |
| `pages/admin/AdminPostEdit.tsx` | Edit post page. Fetches post by ID via `useGetPostByIdQuery`, renders `PostForm`, calls `useUpdatePostMutation`. |
| `pages/admin/AdminPageNew.tsx` | Create page. Renders `PostForm` with `variant="page"`, calls `useCreatePageMutation`, navigates to `/admin` on success. |
| `pages/admin/AdminPageEdit.tsx` | Edit page. Fetches page by ID via `useGetPageByIdQuery`, renders `PostForm` with `variant="page"`, calls `useUpdatePageMutation`. |
| `pages/PostList.tsx` | Presentational component. Renders a responsive grid of post cards with infinite scroll (IntersectionObserver sentinel). |
| `components/NavBar.tsx` | Category filter bar (desktop only, `hidden md:block`). Horizontal Swiper of pill buttons with post counts. On mobile, categories are in the Sidebar instead. |
| `components/Header.tsx` | Site header with logo, page-link Swiper (desktop), search icon button (desktop), theme toggle (desktop), auth controls (Sign in/Admin/Sign out), and hamburger menu button (mobile). Manages Sidebar open/close state. |
| `components/Footer.tsx` | Site footer with copyright and social links (GitHub, X, Bluesky, Discord). |
| `components/Sidebar.tsx` | Full-screen mobile sidebar (slides from right). Contains search link, page links, category navigation, theme toggle, and auth controls. Hidden on `md+` screens. |
| `components/ThemeToggle.tsx` | Three-way theme toggle (light/dark/system) with sun, moon, and monitor icons. Used in Header and Sidebar. |
| `components/AdminRoute.tsx` | Route guard for admin pages. Checks `useAuth()`, renders `<Outlet />` if admin, redirects to `/` otherwise. |
| `components/admin/ContentEditor.tsx` | Markdown content editor with image upload support. Wraps `@uiw/react-md-editor` with dark/light mode, mobile edit/preview toggle, and image upload (toolbar button, paste, drag-and-drop → Vercel Blob). |
| `components/admin/PostForm.tsx` | Shared post/page create/edit form. Accepts `variant` prop (`'post'` default, `'page'`). Post variant shows title, slug, excerpt, category, and `ContentEditor`. Page variant omits excerpt and category. |
| `components/admin/DeleteConfirmDialog.tsx` | Modal dialog for confirming item deletion. Accepts `itemTitle` and `itemType` props (defaults to "post"). Uses native `<dialog>` element. |
| `store/api.ts` | RTK Query API slice. Queries: `getPosts` (paginated), `searchPosts` (full-text search, paginated), `getPost` (by slug), `getRelatedPosts` (tag-overlap ranked via RPC), `getPostById`, `getAdminPosts`, `getCategories`, `getPostCounts`, `getPages`, `getPage`, `getPageById`, `getAdminPages`. Mutations: `createPost`, `updatePost`, `deletePost`, `createPage`, `updatePage`, `deletePage`. All use Supabase client via `queryFn`. Exports auto-generated hooks. |
| `store/store.ts` | Redux store. Configures store with RTK Query reducer and middleware. |
| `types/database.ts` | Auto-generated Supabase database types (via `npm run update-database`). Defines `post`, `category`, and `page` table types and helper generics (`Tables`, `TablesInsert`, `TablesUpdate`). |
| `env.d.ts` | Vite env type declarations for `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `VITE_PUBLIC_ADMIN_USER_ID`. |
| `constants.ts` | Shared constants. Exports `SITE_NAME` (`'Catri.us'`). |
| `lib/supabase.ts` | Supabase typed client singleton. Validates env vars at import time. |
| `lib/AuthContext.tsx` | Auth provider component for Supabase Google OAuth. Wraps children in `AuthContext`. |
| `lib/ThemeContext.tsx` | Theme provider component. Manages light/dark/system preference, persists to `localStorage`, toggles `.dark` class on `<html>`. |
| `hooks/useAuth.ts` | `useAuth()` hook and `AuthContext` creation. Exposes `session`, `user`, `isAdmin`, `isLoading`, `signInWithGoogle()`, `signOut()`. |
| `hooks/useTheme.ts` | `useTheme()` hook and `ThemeContext` creation. Exposes `theme` and `setTheme()`. |

### Public (`public/`)

| File | Purpose |
|---|---|
| `favicon.ico` | Browser favicon (multi-size ICO: 16, 32, 48px). |
| `icon-192.png` | PWA icon 192×192. |
| `icon-512.png` | PWA icon 512×512. |
| `apple-touch-icon.png` | Apple touch icon 180×180. |
| `manifest.json` | Web app manifest for PWA support. |
| `icons.svg` | SVG sprite sheet. Icons: `documentation-icon`, `social-icon`, `github-icon`, `discord-icon`, `x-icon`, `bluesky-icon`. Referenced via `<use href="#id">`. |

### API (`api/`)

| File | Purpose |
|---|---|
| `og.ts` | Vercel serverless function. Intercepts `/posts/:slug`, `/pages/:slug`, and `/categories/:slug` requests. Fetches data from Supabase, injects OG meta tags into `dist/index.html`, and serves it so social crawlers see correct metadata. |
| `sitemap.ts` | Vercel serverless function. Serves `/sitemap.xml`. Fetches all posts, pages, and categories from Supabase and generates a standard XML sitemap for search engine indexing. Cached for 1 hour via `s-maxage`. |
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

**Do not use `// eslint-disable` comments.** Fix the underlying code to satisfy the rule instead. `// eslint-disable` should only be used as an absolute last resort when no code change can resolve the warning.

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

<!-- last-indexed: a1a4814 -->
