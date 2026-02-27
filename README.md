# CloudChef - Recipe Management System

A responsive, multi-user Recipe Management System built with Next.js, Supabase, Gemini, Tailwind, and shadcn/ui.

## Features
- Recipe CRUD: add, edit, delete recipes with ingredients, instructions, and metadata.
- Status tagging: `favorite`, `to_try`, `made_before`.
- Search + filters: name, ingredient, cuisine, prep time, difficulty, diet tags, status.
- Multi-user support: Supabase Auth + Row Level Security.
- Sharing: unlisted read-only recipe links (`/shared/[token]`).
- AI (opt-in per user): recipe draft generation, instruction summarization, substitutions.
- Extra features: cook mode step-by-step view, lightweight dashboard stats.

## Tech Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui components
- Backend: Supabase (Postgres + Auth + RLS)
- AI: Google Gemini API (`gemini-2.5-flash`)
- Testing: Vitest + Playwright
- Deployment: Netlify + Supabase

## Project Structure
- `app/` - routes, pages, and API handlers
- `components/` - reusable UI and feature components
- `lib/` - helpers, validation, Supabase and AI logic
- `supabase/migrations/` - SQL schema + RLS policies
- `tests/` - unit and e2e tests

## Run Locally
1. Install dependencies:
```bash
pnpm install
```
2. Add env vars:
```bash
cp .env.example .env.local
```
3. Set your Supabase and Gemini keys in `.env.local`.
4. Apply SQL migration:
- Run `supabase/migrations/0001_init.sql` in Supabase SQL Editor, or use Supabase CLI migration workflow.
5. Start the app:
```bash
pnpm dev
```
6. Open `http://localhost:3000`.

## Test
```bash
pnpm test
pnpm test:e2e
```

## Deployment (Netlify + Supabase)
1. Push this repo to GitHub.
2. Create a Netlify site from the repository.
3. Netlify will use `netlify.toml`:
- Build command: `pnpm build`
- Publish directory: `.next`
4. Add environment variables in Netlify:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
5. Ensure Supabase migration is applied.
6. Deploy.

## Live URL
- Set after deployment: `https://your-site-name.netlify.app`

## Notes
- AI features are blocked unless the user enables AI in Settings.
- Share links are unlisted and read-only; users can revoke links any time.
