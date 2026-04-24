# Changelog

## 2026-04-24

### Added
- Initial v2 scaffold: Next.js 14 + TypeScript + Tailwind + shadcn/ui + bun.
- Route groups `(public)`, `(protected)`, `(auth)`, `(admin)` with SSR auth
  guards.
- `backend/v2/` with models, Zod schemas, services, and stores for all 7
  modules (users, destinations, guides, stories, bookings, applications,
  admin).
- `sql/` module with schema, views, RPCs, RLS, triggers, and the admin-only
  counterparts. Bundler in `sql/sql-gen.dart` + Bash fallback.
- Supabase SSR cookies plumbing (browser, server, middleware clients).
- 3 Zustand stores: `auth-store`, `application-store`, `admin-store`.
- Placeholder pages for every documented route, each with metadata.
- `AGENTS.md`, `ARCHITECTURE.md`, `README.md`, `api-docs.md`, `.env.local.example`.

### Docs
- Established engineering rules in `AGENTS.md` and architecture detail in
  `ARCHITECTURE.md`.
