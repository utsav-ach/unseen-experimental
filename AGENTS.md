# AGENTS.md — engineering rules

Follow these rules for every change. They exist to keep the codebase SSR-first,
minimal, and secure.

## Core principles (in priority order)

1. **SSR correctness.** Server Components render data on the server. If a page
   can be SSR, it must be.
2. **Performance / fast first paint.** Parallelize data fetching with
   `Promise.all`. Avoid waterfalls.
3. **SEO stability.** Every route has metadata in the server context (layout
   or page). Never in client components.
4. **Client interactivity.** Only then reach for `"use client"`, effects, or
   stores.

## Layering

```
UI → Service             (default)
UI → Store → Service     (only when truly needed)
Service → Supabase       (views for reads, RPC for writes)
```

- **UI**: Rendering, local state, direct service calls.
- **Store**: Cross-component state, persistence, complex orchestration.
- **Service**: Supabase abstraction, Zod validation, error handling.
- **Supabase**: Source of truth.

## Minimal store policy

Do **not** create Zustand stores by default. Use services directly.

A new store is allowed only if **all** of these are true:

1. Cross-component shared state is genuinely needed.
2. State must survive unmount/remount.
3. Complex multi-step orchestration is required.
4. Optimistic updates are needed.

Currently allowed stores:

- `auth-store` — cross-app auth for navbar, guards, routes.
- `application-store` — guide application multi-step workflow.
- `admin-store` — admin mutation workflows with result tracking.

## Route groups

- `(public)` — no login required, SSR first.
- `(protected)` — server-side auth check in layout; redirects to `/login`.
- `(auth)` — login/signup only. No navbar/footer.
- `(admin)` — admin-only. Returns 404 for non-admins (never redirect — don't
  leak the existence of admin routes).

## Database strategy

- **Reads**: prefer **views**. `supabase.from("available_guides").select("*")`.
- **Writes**: **RPC only**. No direct inserts/updates/deletes from the
  frontend. All writes go through `public.*` functions defined in `sql/rpc/`
  or `sql/admin/rpc/`.
- **RLS**: always on. Admins bypass via `public.is_admin()`.
- Never rely on frontend validation alone. Validate at the RPC boundary.

## Styling

- Use Tailwind utility classes.
- Use theme variables (`bg-background`, `text-foreground`, `border-border`)
  — **not** hardcoded colors like `bg-white` or `text-black`.
- Cards: clickable, image at top without padding around the image,
  square-ish, minimal content.
- Text: simple English. No fancy wording.

## Components

- Server Components preferred. Only add `"use client"` when the component
  uses hooks, event handlers, or browser APIs.
- Reuse existing components. Mirror the conventions of neighbors.
- UI primitives live under `components/ui/`.

## SQL development

1. Edit the modular file under `sql/schema/`, `sql/views/`, `sql/rpc/`,
   `sql/rls/`, `sql/triggers/`, or `sql/admin/*`.
2. Run `bun run sql:gen` (or `bash sql/sql-gen.sh`).
3. Commit both the modular file and the regenerated `full-*.sql`.
4. Update `api-docs.md` if you changed an RPC contract.
5. Add a line to `changelog.md`.

Never edit `full-*.sql` by hand.

## Code quality

- TypeScript strict mode is on. No `any`. No `getattr`/`setattr` analogs.
- Imports at the top of files.
- Zod schemas at the service boundary.
- Never embed secrets in code. Read from `lib/env.ts` (server only for
  `BACKEND_SERVICE_KEY`).
