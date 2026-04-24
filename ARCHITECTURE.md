# Architecture

## Directory layout

```
app/
  (public)/             SEO-first pages, no auth required
    destinations/       List + [id] detail + /map
    activities/         List + details/[id]
    packages/           List + details/[id]
    stories/            List + [id] + /add + edit/[id]
    photos/             Gallery + [id]
    trek-dai/           Curated treks
  (protected)/          Server-auth-checked pages
    bookings/           My bookings + checkout + details/[id]
    guide/              Guide registration + requests/[id]
    profile/            Profile + edit + requests
    onboarding/
  (auth)/               Login / signup / verify / callback
  (admin)/admin/        Admin dashboards (dashboard, destinations, activities,
                        packages, guides, bookings, users, stories, photos,
                        settings)
  dev/                  Scratch pages for iterating on components

backend/v2/
  models/               TypeScript types per module (7 modules)
  schemas/              Zod field-types, enums, GIS types, case-mapper
  services/             SupabaseServiceV2 base + one service per module
  stores/               3 Zustand stores (auth, application, admin)

components/
  ui/                   shadcn/ui primitives (button, card, input, …)
  layouts/              navbar, footer
  auth/                 auth-initializer
  map/                  selection-map

lib/
  supabase/             browser client, server client, middleware helper
  env.ts                typed env access + asserts
  utils.ts              cn() helper

sql/
  schema/               Table definitions
  views/                Read-optimized views
  rpc/                  Business logic functions (writes go here)
  rls/                  Row-level security policies
  triggers/             updated_at + counters
  admin/                Admin-isolated schema/views/rpc/rls
  sql-gen.dart          Preferred bundler
  sql-gen.sh            Bash fallback
  full-*.sql            GENERATED — do not edit
```

## Request lifecycle

1. A request hits `middleware.ts`, which refreshes the Supabase auth cookie
   via `lib/supabase/middleware.ts`.
2. A route-group layout (`(public)`, `(protected)`, `(auth)`, `(admin)`)
   renders. Protected + admin layouts call the auth service server-side to
   guard access.
3. Server Components call services directly. Services call Supabase through
   views for reads and RPCs for writes, validating responses with Zod.
4. Client Components hydrate from server-rendered HTML and from Zustand
   stores (auth in particular, via `AuthInitializer`).

## Data strategy

Writes are **only** performed through Postgres RPC functions marked `security
definer`. The service role key is never exposed to the browser. The public
anon key is exposed, so RLS is enforced for every table that contains user or
admin data.

Views stand between tables and the client so that shape changes don't break
the frontend contracts. `destinations`, `guide_info`, `stories_info`,
`guide_bookings_info`, etc. embed joined fields (like author/user info) so
that pages can select `*` and render.

## Auth

Supabase Auth with email/password. Email verification is required. The
`/auth/callback` route exchanges the OAuth/magic-link code for a session.

The `auth-store` is hydrated by `AuthInitializer` (mounted once in the
protected layout) and kept in sync through `supabase.auth.onAuthStateChange`.

## Admin

Admin status is a boolean on `profiles.is_admin`. The `(admin)` layout
resolves the profile server-side and calls `notFound()` for non-admins,
which returns a real 404 rather than leaking the existence of admin routes.

## Extending

1. Add a table in `sql/schema/`.
2. Add a view in `sql/views/` if it's read-heavy.
3. Add write RPCs in `sql/rpc/`.
4. Regenerate `full-*.sql`.
5. Add a Zod model in `backend/v2/models/`.
6. Add a service method in `backend/v2/services/`.
7. Consume from a Server Component.

Resist adding stores. If you think you need one, re-read AGENTS.md first.
