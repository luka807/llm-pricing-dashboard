<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LLM Pricing Dashboard

A dashboard for comparing LLM API pricing across providers, with four tabs:

- **Pricing Comparison** — side-by-side pricing across models/providers
- **Cost Calculator** — estimate cost from usage inputs
- **Cost vs. Capability** — pricing plotted against capability/benchmark data
- **Pricing History** — pricing changes over time

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Deployed on Vercel

## Project structure

- `src/app/` — routes (App Router)
- `src/components/` — components, one per file, functional components with TypeScript
- `src/data/` — pricing/model data files

## Conventions

- Functional components only, typed with TypeScript (no class components).
- Import components/data via the `@/*` path alias (resolves to `src/*`), e.g. `@/components/Foo`, `@/data/pricing`.
