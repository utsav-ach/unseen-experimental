# Unseen Nepal

A travel platform that connects tourists with local guides for authentic
experiences across Nepal. Tourists book destinations, negotiate trips with
guides through a 3-step workflow, or book curated packages directly.

This is the v2 scaffold — a minimal MVP with the full architecture (route
groups, service layer, SQL modules, RLS) wired up. Most pages are stubs
ready to be filled in.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **State**: Zustand (3 stores only: `auth`, `application`, `admin`)
- **Validation**: Zod
- **Backend**: Supabase (Postgres + PostGIS + Auth + Storage)
- **Package manager**: bun

## Quick start

```bash
bun install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_BACKEND_PASSWORD, BACKEND_SERVICE_KEY
bun run dev
```

Open http://localhost:3000. The app renders without Supabase configured —
data-backed pages show empty states until the env vars point at a real
project.

## Commands

| Script               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `bun run dev`        | Start the dev server                           |
| `bun run build`      | Production build                               |
| `bun run start`      | Run the production build                      |
| `bun run lint`       | ESLint                                         |
| `bun run typecheck`  | TypeScript strict check                        |
| `bun run sql:gen`    | Rebuild `sql/full-*.sql` bundles from modules  |
| `bash sql/sql-gen.sh`| Same as above without Dart                     |

## Supabase setup

1. Create a Supabase project.
2. Enable extensions: `postgis`, `uuid-ossp`, `pg_cron`.
3. Run `sql/full-schema.sql`, then `sql/full-views.sql`, `sql/full-rpc.sql`,
   `sql/full-triggers.sql`, `sql/full-rls.sql` (or just `sql/full-copy-paste.sql`).
4. Create storage buckets: `profile`, `stories`, `destinations`, `packages`,
   `photos` (public) and `vault` (private).
5. Copy the project URL, anon key, and service role key into `.env.local`.

## Layout

```
app/            Next.js App Router pages (grouped by auth scope)
backend/v2/     Models, schemas, services, stores
components/     Shared UI
lib/            Supabase clients, utilities, env
sql/            Modular SQL + sql-gen bundler
```

See `AGENTS.md` for the engineering rules and `ARCHITECTURE.md` for
architectural detail.
