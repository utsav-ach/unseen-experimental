Here’s your **clean, structured `ARCHITECTURE.md`**—rewritten to remove contradictions, clarify SSR vs client roles, and make it extremely usable for both humans and AI agents.

---

# 📐 Unseen Nepal – Architecture Guide

A clear, enforced architecture for building **Unseen Nepal** using **Next.js + Supabase** with SSR-first design and clean separation of concerns.

---

# 🧱 Tech Stack

## Frontend

* **Next.js (App Router, SSR-first)**
* **Tailwind CSS**
* **Shadcn UI**

## Backend

* **Supabase (PostgreSQL + Auth + Storage + RPC)**

## State Management

* **Zustand**

---

# Core Philosophy

### 1. SSR First, Client Second

* Public pages → **SSR (SEO priority)**
* Interactive updates → **Client (Zustand + browser Supabase)**

> SSR = first paint
> Client = mutations + refresh

---

### 2. Clean Separation of Concerns

```
UI → Store → Service → Supabase
```

| Layer    | Responsibility        |
| -------- | --------------------- |
| UI       | Rendering only        |
| Store    | State + orchestration |
| Service  | Backend communication |
| Supabase | DB, Auth, Storage     |

🚫 UI must NEVER:

* Call Supabase directly
* Contain business logic

---

### 3. Minimal Overengineering

* Avoid unnecessary abstraction
* Use RPC only where needed
* Prefer views for reads

---

# 🔄 Rendering Strategy (VERY IMPORTANT)

## ✅ SSR (Server Components)

Use for:

* Public pages
* SEO content
* Initial data fetch

Example:

```ts
const supabase = await createClient();
const profile = await callRpc(supabase, "fetch_profile", Schema);
```

---

## ✅ Client (Zustand + Browser Client)

Use for:

* Login / Signup
* Refresh button
* Mutations
* Real-time updates

---

## ✅ Hybrid Pattern (Recommended)

**Flow:**

1. Fetch data in SSR
2. Hydrate Zustand store
3. Let client handle future updates

```tsx
<AuthInitializer profile={profile}>
  <MainLayout>{children}</MainLayout>
</AuthInitializer>
```

---

# 🧠 State Management (Zustand)

## Rules

* One store per module:

  * `authStore`
  * `guideStore`
  * `bookingStore`

* Stores:

  * Call services
  * Manage loading/error state
  * Expose simple methods

---

## Store Responsibilities

✅ Allowed:

* Call services
* Manage state
* Coordinate flows

❌ Not allowed:

* Direct Supabase calls (except controlled browser client use)

---

# 🔌 Services Layer

Each module has its own service:

```
backend/services/
  ├── authService.ts
  ├── guideService.ts
  ├── bookingService.ts
```

## Responsibilities

* Wrap Supabase queries
* Handle errors
* Keep UI clean

---

# 🗄️ Database Strategy

## 🟢 Reads → Views (Preferred)

Use views for:

* Listing data
* Filtering
* Public queries

Example:

```sql
CREATE VIEW public.available_guides AS
SELECT ...
WHERE is_available = true;
```

👉 Then:

```ts
supabase.from("available_guides").select("*")
```

---

## 🔴 Writes → RPC ONLY (Strict Rule)

> 🚨 Golden Rule: NO direct inserts from frontend

All writes must go through RPC:

### Examples:

* onboarding
* apply guide
* review guide
* negotiation flow

---

## Why RPC for Writes?

* Centralized validation
* Security
* Business logic enforcement
* Prevents frontend bypass

---

# ⚙️ RPC Design Rules

### ✅ Good RPC

* Validates inputs
* Checks permissions
* Throws meaningful errors

### ❌ Bad RPC

* Blind inserts
* No validation
* No auth checks

---

## Example Utility Function

```sql
CREATE FUNCTION public.require_admin()
RETURNS void AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Admin required';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## DRY RPC

* Reuse functions
* Call RPC inside RPC
* Avoid duplication

---

# 🔐 RLS (Row Level Security)

* ALWAYS enabled
* Applies to:

  * Tables
  * Views

### Rules:

* Admin always has access
* Never rely only on frontend validation

---

# 📦 SQL Structure

```
sql/
├── schema/
├── rls/
├── rpc/
├── triggers/
├── sql-gen.dart
```

### Important:
There are 2 files for sql-gen, one is dart and other is sh file,
- prefer dart over sh file

sometimes extra of following files are created by the sql-gen, 
```txt

├── full-copy-paste.sql
├── full-rls.sql
├── full-rpc.sql
├── full-schema.sql
├── full-triggers.sql
├── full-views.sql
├── reset.sql

```


* ❌ Do NOT trust `full-*.sql` These are auto generated and can contain old unsynced code.
* ✅ Alwats Use modular files to change
* Run the sql-gen if the editing to modular file is completed.

---

# 🧾 Zod Schema Sync

All schemas in:

```
backend/schemas.ts
```

### Rule:

* Every RPC → must have matching Zod schema
* Keep backend + frontend in sync

---

# 🎨 UI Rules

## Design Philosophy
* Minimal
* Clean
* Readable
* Not flashy
---

## Styling Rules
Dont hardcode colors
✅ Use `bg-background` 
❌ Avoid: `bg-white`
---

## Cards

* Fully clickable
* Image at top
* No padding around image
* Square-ish layout
* Minimal content

---

## Text Rules

❌ Avoid:
* Fancy wording
* Over-professional tone

✅ Use:
* Simple English
* Clear meaning

---

# 📱 Component Structure

```
components/
├── ui/                # Shadcn components
├── destinations/
├── onboarding/
```

### Rule:

* Don’t clutter root
* Group by module

---

# 📈 SEO Rules (HIGH PRIORITY)

* Every page MUST have metadata
* Use semantic HTML:

  * `<main>`
  * `<section>`
  * `<article>`

---

## Metadata Rule

❌ Don’t put metadata in client components
✅ Use layout.tsx if needed

---

# 🔒 Protected Routes

Use `Guard` component:

```
components/auth/auth-initializer.tsx
```

### Use only when needed:

* Profile page
* Admin page
* Story creation

---

# 🖼️ Media Handling

* Separate bucket per module:

  * profile
  * stories
  * destinations

### Rules:

* Public by default
* `vault` bucket = private (sensitive files)

---

# ⚠️ Error Handling

## Rules

* Always show errors in UI
* Use:

  * `toast.error`
  * inline error messages

---

## UX Rule

User must ALWAYS know:

* What failed
* Why it failed

---

# 🚫 Anti-Patterns (STRICTLY FORBIDDEN)

* UI calling Supabase directly
* Direct DB insert from frontend
* Business logic inside UI
* Rewriting existing components unnecessarily
* Hardcoded colors
* Ignoring SSR for public pages

---

# 🧪 Dev Rules

## Package Manager

* ✅ Use `bun`
* ❌ Never use npm/npx

---

## Type Safety

* No `any`
* Must pass TypeScript check

---

## DRY Principle

* Reuse everything
* Avoid duplication

---

# 🔄 Development Workflow

## When adding a feature:

1. Design DB (table/view/RPC)
2. Add Zod schema
3. Create service method
4. Add store method
5. Use in UI

---

# 🧠 Key Takeaways

* **SSR for first paint**
* **Client for interaction**
* **Views for reads**
* **RPC for writes**
* **Zustand for state**
* **Services for abstraction**

---

Good call—this is exactly the kind of section that *breaks projects later* if it's vague. I’ve rewritten it into a **strict, non-ambiguous rulebook** with **DO / DON’T / WHY / EXAMPLES** so neither a human nor an AI can misinterpret it.

---

