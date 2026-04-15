# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Swaino Records — sito ufficiale dell'etichetta discografica. Next.js 16 con App Router, TypeScript strict, Tailwind CSS v4.

## Commands

```bash
npm run dev       # dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint
npx prettier --write .   # format all files
npx tsc --noEmit  # typecheck without building
```

No test suite configured yet.

## Architecture

- **`src/app/`** — App Router. Every folder is a route segment. `layout.tsx` wraps all pages; `page.tsx` is the route entry point.
- **`src/app/globals.css`** — Tailwind base import and global CSS variables.
- Path alias `@/*` maps to `src/*`.

### Conventions
- Tailwind v4 — uses `@tailwindcss/postcss`, no `tailwind.config.js`. Customize via CSS variables in `globals.css`.
- ESLint + Prettier are integrated: Prettier rules override ESLint formatting via `eslint-config-prettier`.
- TypeScript strict mode is on — no implicit `any`, no loose null checks.
- Fonts are loaded via `next/font/google` in `layout.tsx` and exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`).
