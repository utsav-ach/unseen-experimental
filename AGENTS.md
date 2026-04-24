# Unseen Nepal – Current Engineering Guide (2026)

This document is the source of truth for agents and contributors.
If implementation and this guide conflict, update implementation or update this guide immediately.

---

## 1) Product + Stack Snapshot

Unseen Nepal is a travel platform built with:

- Frontend: Next.js App Router, Tailwind, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Storage, RPC)
- Validation: Zod
- State (when needed): Zustand

---

## 2) Core Architectural Direction

### A. SSR first, always

Priority order:

1. SSR correctness
2. Performance / fast first paint
3. SEO stability
4. Client interactivity

Public and protected route decisions must not depend on client-store hydration.

### B. Minimalism over abstraction

- Do not introduce layers unless they remove real complexity.
- Do not create stores by default.
- Prefer clear, direct service calls for local flows.

### C. v2 is the active backend contract

- New backend work must target backend/v2/*.
- supabase/services/supabaseServicev2.ts is the canonical service base.
- Do not add new dependencies on v1 modules.

---

## 3) Route Group Security Model (Mandatory)

### (public)

- Accessible without login.
- SSR content first.

### (protected)

- Must gate on server in layout-level checks.
- Fetch profile in layout and branch to SSR fallback pages:
  - needs login
  - needs verification
  - needs onboarding
- Do not use client auth store as primary gate at route-group boundary.

### (auth)

- Special auth pages (/login, /signup, /auth/*).
- Immune to protected-group checks.
- Navbar/footer should be hidden for this group.

### (admin)

- Only visible to admins
- For other then admin it should show a dummy error 404 page
- it has its own ui and seperate asethetics

### Role resolution contract (Mandatory)

User role/state checks must come from server-fetched profile data (never guessed from client hydration):

- Source contract: `fetch_profile` rpc (or v2 equivalent service server-safe equivalent)
- Role/state separation:
  - guest: no profile
  - authenticated-unverified: profile exists + `is_auth_verified = false`
  - authenticated-needs-onboarding: verified + `is_onboarding_done = false`
  - authenticated-user: verified + onboarding complete
  - admin: authenticated-user + `is_admin = true`

Route-group layout should branch using these states for first paint.

### Client guard policy

- Client guards can still exist for local UX safety.
- But they are secondary and never the primary security gate for protected route groups.

---

## 4) Layering Rules

Preferred flow:

UI -> Service
UI -> Store -> Service (only when shared client state is truly needed)

### UI

Allowed:

- Render
- Local interaction state
- Call service directly for page-local data/mutations

Not allowed:

- Direct Supabase client queries/writes bypassing service layer
- Business-rule duplication already owned by SQL RPC/service

### Store (Strict — read this before adding any store)

Stores are only for **real shared client state**. Never use them as a data-fetching wrapper or a "per-module" habit.

Create a store only if **both** are true:

1. State is consumed by **multiple unrelated components** across the tree (e.g. navbar, guards, modals).
2. It cannot be expressed as a simple server component that re-renders on nav/refresh.

Examples that justify a store:

- **auth**: navbar shows user state; route guards need it; multiple client components react to it.
- **application** (multi-step form): draft state shared across steps before submit.
- **admin**: cross-section orchestration / queues.

Examples that do **not** justify a store (call the service directly from the server/client component):

- Listing destinations, guides, packages, stories, photos, bookings.
- Fetching a single record for a detail page.
- One-off mutation triggered from a single component (call service, re-fetch, done).
- "I want to cache this" — use Next.js cache or SWR locally; don't invent a store.

If a component needs to refresh data after a mutation, it calls the service directly and re-renders (server component: `revalidatePath` / `router.refresh`; client component: local `useState` + re-call). No store wrapper required.

### Service

- Encapsulates Supabase/RPC/view access
- Handles schema parsing / error shaping
- Uses SupabaseServiceV2 helpers

---

## 5) Current v2 Store Policy

Minimal required stores in v2 currently include:

- auth store
- application store
- admin store

Additional stores are allowed only with explicit need (shared client state/orchestration).

---

## 6) SQL Contract Policy (Current)

### Primary documentation source

- `api-docs.md` is the primary source of truth for backend contract behavior.
- Any SQL-side contract change must also update `api-docs.md` in the same task.

### Canonical RPC source

- sql/rpc/app-rpc.sql is the canonical RPC layer.
- Legacy per-module RPC files are removed from active generation.

### Read strategy

- Prefer sql/views/all-views.sql for simple reads/listing/filtering.
- Use RPC for business workflows, permissions, transactional writes, and deeper logic.

### Contract motto (Strict)

- Views for actual public read contracts.
- RPC for role checks, deep nesting, and business logic workflows.

### Write strategy

- Writes must go through RPC.
- No direct frontend inserts/updates to business tables.

### SQL generation

- Use Dart generator (sql/sql-gen.dart) as primary.
- Generated full-* files are outputs; edit modular SQL files instead.

### Admin SQL isolation policy (Strict)

- Admin is a special separated entity in SQL architecture.
- All admin SQL contracts must live under `sql/admin/` as modular source files.
- Use clear modular grouping inside `sql/admin/` as needed (for example: `schema/`, `views/`, `rpc/`, `rls/`, `triggers/`).
- Do not place new admin-only contracts in mixed non-admin SQL modules.
- Every admin-only SQL object/function/view/type/policy name must be prefixed with `admin_`.
- Admin-only behavior must be obvious by both location (`sql/admin/...`) and naming (`admin_*`).

---

## 7) Validation + Types

- No any in new code.
- Validate service IO with Zod schemas.
- UI should validate form inputs before calling store/service.
- Keep error surfaces user-readable (inline + toast + useful console context).

---

## 8) SEO + Rendering Rules

- Use semantic structure (main, section, article) where appropriate.
- Keep metadata in server contexts (layout.tsx / server page exports).
- Never put page metadata inside client components.
- Avoid client-only data waterfalls for first paint.

### First paint rule (Strict)

- First paint for each page must render from server.
- Heavy initial loading should happen on server whenever possible.
- Client-side data fetch should be used for in-page refresh/update flows without full page reload.

### SSR performance rule (Strict)

- Use `Promise.all(...)` for independent server fetches.
- Avoid sequential awaits for independent requests.
- Keep route-group auth checks early and lightweight.

### Error handling rule for SSR + client

- Show clean, human-readable error message in UI.
- For client-side interactions, also show error toast.
- Keep console errors structured with enough context for debugging.

---

## 9) UI System Rules

- Prefer existing shadcn/ui primitives.
- Reuse existing project components before creating new ones.
- No hardcoded theme-breaking colors (bg-white, text-black, etc.).
- Keep language simple, direct, and product-focused.

---

## 10) Migration Rules (v1 -> v2)

- New features/fixes should target v2 path first.
- During safe migration, remove v1 references once v2 equivalent is in place.
- Do not build new compatibility layers for old UI unless explicitly requested.

---

## 11) Agent Execution Checklist (Every Change)

1. Confirm SSR impact first (especially route-group/layout changes).
2. Keep changes minimal and scoped.
3. Reuse existing components/services/schemas.
4. Update changelog.md.
5. Run diagnostics and resolve introduced errors.

---

## 12) Manifest Sync + Documentation Rules (Strict)

### Where to write change history

- Do not place manifest sync logs inside `AGENTS.md`.
- Put implementation history only in `changelog.md`.

### Changelog format quality

- Changelog updates must use readable Markdown structure.
- Avoid dumping one long paragraph.
- Never overwrite or delete previous changelog history; always prepend newest entry above older entries.
- Changelog heading must include date and time (hours + minutes), not date alone.
- Preferred heading format: `## YYYY-MM-DD HH:MM`.
- Prefer sections when possible, for example:
  - `## YYYY-MM-DD HH:MM`
  - `### Added`
  - `### Changed`
  - `### Fixed`
  - `### Docs`

### SQL-change documentation requirement

- If SQL changes are needed, edit modular SQL files directly under `sql/`.
- Explain SQL edits clearly in `changelog.md` (what changed + why).
- Sync `api-docs.md` for any SQL contract change (views, RPC params/returns, behavior).

---

## 13) Hard Anti-Patterns

Never do the following:

- Primary auth gating via client store in protected route-group layout.
- UI bypassing service layer to call Supabase directly.
- Direct DB writes from frontend outside RPC workflows.
- Store-per-module by default without need.
- Adding new v1 dependencies.
- Ignoring SSR/SEO for first paint.
