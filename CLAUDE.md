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

**Styling:** Plain CSS with CSS nesting (handled natively by Vite). Light/dark theming via CSS custom properties defined in `src/index.css` with `prefers-color-scheme` media query. No CSS framework or CSS-in-JS.

**Assets:** SVG icon sprite sheet in `public/icons.svg` referenced via `<use href>`. Images in `src/assets/` imported as modules.

## TypeScript

- Target: ES2023, JSX: react-jsx, bundler module resolution
- Strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax` is enabled — use `import type` for type-only imports

## ESLint

Flat config format (ESLint v9). Extends: JS recommended, typescript-eslint recommended, react-hooks, react-refresh. Only lints `**/*.{ts,tsx}`.

## Self-Maintenance

When making significant changes (adding/removing files, changing architecture, adding dependencies, modifying build config), update this CLAUDE.md incrementally to reflect those changes. Keep updates minimal and targeted — do not rescan the whole repo.
