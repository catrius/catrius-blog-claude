# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR (http://localhost:5173)
npm run build     # Type-check (tsc -b) then build for production
npm run lint      # ESLint across the project
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

This is a React 19 + TypeScript + Vite 8 single-page application, scaffolded from the Vite React template.

**React Compiler** is enabled via `@rolldown/plugin-babel` with `reactCompilerPreset()` in `vite.config.ts`. This automatically optimizes memoization — avoid manual `useMemo`/`useCallback` unless there's a specific reason.

**Entry flow:** `index.html` → `src/main.tsx` (creates React root in StrictMode) → `src/App.tsx` (single top-level component).

**Routing:** None. Single-page app with no client-side router.

**State management:** Local only. No global state library. `App.tsx` uses a single `useState` for a counter demo.

**Supabase:** Full-stack backend via `@supabase/supabase-js`. Client initialized in `src/lib/supabase.ts`. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars (see `.env.example`). Provides Auth, Database, Storage, and Realtime.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin, plus plain CSS with CSS nesting. Tailwind is imported at the top of `src/index.css`. Light/dark theming via CSS custom properties with `prefers-color-scheme` media query.

**Assets:** SVG icon sprite sheet in `public/icons.svg` referenced via `<use href>`. Images in `src/assets/` imported as modules.

**Git hooks:** Husky pre-commit hook (`.husky/pre-commit`) runs `npm run lint && npx tsc -b` before every commit.

## File Inventory

### Source (`src/`)

| File | Purpose |
|---|---|
| `main.tsx` | Entry point. Mounts `<App />` inside `<StrictMode>` on `#root`. Imports global styles. |
| `App.tsx` | Root component. Renders a landing page with a 3D hero section (layered React/Vite logos over `hero.png`), a counter button (`useState`), documentation links, and social links. No props. No custom hooks. |
| `index.css` | Global styles & theming. Defines CSS custom properties (`--text`, `--bg`, `--accent`, font families, etc.) with light/dark variants via `prefers-color-scheme`. Styles `body`, `h1`/`h2`, `p`, `code`, and `#root` container (max-width 1126px, centered flex column). |
| `App.css` | Component styles for `App.tsx`. Styles `.counter` button, `.hero` 3D perspective transforms, `#center` layout, `#next-steps` two-column docs/social grid, link hover effects, `.ticks` decorative borders, responsive breakpoints at 1024px. |
| `env.d.ts` | Vite env type declarations for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. |
| `lib/supabase.ts` | Supabase client singleton. Validates env vars at import time. |
| `assets/hero.png` | Hero background image used in the landing page. |
| `assets/react.svg` | React logo displayed in the 3D hero section. |
| `assets/vite.svg` | Vite logo displayed in the 3D hero section. |

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
| `package.json` | Private ESM package. Runtime deps: `react`, `react-dom` (^19.2.4), `@supabase/supabase-js`. Key devDeps: `vite` 8, `typescript` ~6.0, `husky` 9, `babel-plugin-react-compiler` 1.0. |

## TypeScript

- Target: ES2023, JSX: react-jsx, bundler module resolution
- Strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports

## ESLint

Flat config format (ESLint v9). Extends: JS recommended, typescript-eslint recommended, react-hooks, react-refresh. Only lints `**/*.{ts,tsx}`.

## Self-Maintenance

When making significant changes (adding/removing files, changing architecture, adding dependencies, modifying build config), update this CLAUDE.md incrementally to reflect those changes. Keep updates minimal and targeted — do not rescan the whole repo.
