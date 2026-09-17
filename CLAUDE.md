# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs first

Before generating or modifying any code, always check the `/docs` directory for a relevant docs file and follow its standards. If no relevant doc exists, use your best judgment and consider whether one should be added.

- `docs/ui.md` — UI standards. Consult before writing or modifying any UI code.
- `docs/data-fetching.md` — data fetching standards. Consult before writing or modifying any code that fetches or mutates data (Server Components, Server Actions, database helpers).
- `docs/auth.md` — authentication standards. Consult before writing or modifying any auth-related code.
- `docs/data-mutations.md` — data mutation standards. Consult before writing or modifying any code that mutates data.

## Project state

This is a freshly bootstrapped `create-next-app` project (Next.js 16, React 19, TypeScript, Tailwind CSS v4). The only application code is the default boilerplate at `src/app/page.tsx` and `src/app/layout.tsx` — no meal-tracking features have been implemented yet despite the project name.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)

There is no test runner configured yet.

## Architecture

- Uses the Next.js **App Router** (`src/app/`), not the Pages Router.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Styling is Tailwind CSS v4 via `@tailwindcss/postcss` (config lives in `postcss.config.mjs`; no separate `tailwind.config.*` file — v4 uses CSS-based configuration in `src/app/globals.css`).
- TypeScript strict mode is enabled.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
