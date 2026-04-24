# Changelog

## 2026-04-22 19:13

### Changed

- Migrated root and protected UI auth bootstrap contract from v1 schema typing to v2 auth typing:
	- [app/layout.tsx](app/layout.tsx)
	- [app/(protected)/layout.tsx](app/(protected)/layout.tsx)
	- [components/auth/auth-initializer.tsx](components/auth/auth-initializer.tsx)

### Fixed

- Fixed protected route-group rendering regression in [app/(protected)/layout.tsx](app/(protected)/layout.tsx) by returning the SSR-gated layout tree instead of leaving a non-returned JSX fragment.
- Removed client-only wrapper dependency from root layout in [app/layout.tsx](app/layout.tsx) so route-group layouts remain the primary SSR surface for navbar/footer and auth-group rendering behavior.

## 2026-04-20 21:47

### Fixed

- Fixed remaining PostgreSQL function signature default-ordering issue (`42P13`) in [sql/admin/rpc/admin-destination-rpc.sql](sql/admin/rpc/admin-destination-rpc.sql) for `public.admin_create_travel_package(...)` by ensuring all parameters after the first defaulted parameter also have defaults.

### Changed

- Regenerated SQL bundles after admin RPC signature correction:
	- [sql/full-rpc.sql](sql/full-rpc.sql)
	- [sql/full-copy-paste.sql](sql/full-copy-paste.sql)

## 2026-04-20 21:43

### Fixed

- Fixed PostgreSQL function signature error (`42P13`) in [sql/rpc/app-rpc.sql](sql/rpc/app-rpc.sql) for `public.complete_onbording(...)` by adding defaults to parameters that come after defaulted ones.

### Changed

- Regenerated SQL bundles after RPC signature correction:
	- [sql/full-rpc.sql](sql/full-rpc.sql)
	- [sql/full-copy-paste.sql](sql/full-copy-paste.sql)

## 2026-04-20 21:35

### Fixed

- Fixed invalid suspended guides RPC source in [sql/schema/guides.sql](sql/schema/guides.sql):
	- replaced invalid SQL-body `PERFORM public.enforce_admin()` usage,
	- converted `public.get_suspended_guides()` to valid `plpgsql` function,
	- added explicit admin authorization guard (`42501`) and stable JSON response.

### Changed

- Regenerated SQL bundles after source fix:
	- [sql/full-schema.sql](sql/full-schema.sql)
	- [sql/full-copy-paste.sql](sql/full-copy-paste.sql)

### Docs

- Synced contract docs in [api-docs.md](api-docs.md) by adding `public.get_suspended_guides()` under Guides RPCs with admin-only authorization note.

## 2026-04-20 21:28

### Fixed

- Hardened RPC drop-signature generation in [sql/sql-gen.dart](sql/sql-gen.dart) by stripping SQL line/block comments from function parameter lists before type extraction.
- Resolved malformed `DROP FUNCTION` output for commented signatures such as `complete_onbording(...)` that previously leaked inline comments into generated type lists.

### Changed

- Regenerated SQL bundles after parser hardening:
	- [sql/full-rpc.sql](sql/full-rpc.sql)
	- [sql/full-copy-paste.sql](sql/full-copy-paste.sql)

Generated drop signature now correctly emits:
`public.complete_onbording(text, text, text, text, text, text, text, text, text)`.

## 2026-04-20 21:21

### Fixed

- Fixed SQL generator RPC drop-signature parsing in [sql/sql-gen.dart](sql/sql-gen.dart) so multi-word parameter types (for example `double precision`) are emitted correctly in `DROP FUNCTION` statements.
- Improved argument parsing reliability in [sql/sql-gen.dart](sql/sql-gen.dart) by introducing safer SQL argument splitting and default-clause stripping before type extraction.

### Changed

- Regenerated bundles after parser fix:
	- [sql/full-rpc.sql](sql/full-rpc.sql)
	- [sql/full-copy-paste.sql](sql/full-copy-paste.sql)

The failing signature is now generated as `public.get_guides_for_destination(double precision, double precision, integer)` instead of the invalid `precision, precision` form.

## 2026-04-20 21:12

### Added

- Expanded v2 admin client contracts in [backend/v2/models/admin-models.ts](backend/v2/models/admin-models.ts) for backend parity:
	- Admin helper view response schemas (`admin_pending_guide_applications`, `admin_pending_unsuspension_requests`, `admin_booking_negotiation_queue`, `admin_payment_review_queue`, `admin_package_health_queue`, `admin_package_booking_requests`, `admin_system_overview`).
	- Admin destination/activity/package RPC request schemas for create/update/delete flows.
	- Admin analytics RPC schemas for payload build and snapshot capture methods.

### Changed

- Extended [backend/v2/services/admin-services.ts](backend/v2/services/admin-services.ts) with pure v2 service methods that reflect backend contracts:
	- Admin helper view query methods with pagination support.
	- Admin destination/activity/package management RPC methods.
	- Admin analytics capture/scheduling RPC methods.

### Docs

- Synced changelog for v2 schema/service parity work against current backend SQL contracts.

## 2026-04-20 20:55

### Added

- Added admin destination/package management RPC module [sql/admin/rpc/admin-destination-rpc.sql](sql/admin/rpc/admin-destination-rpc.sql) with admin-only methods:
	- `public.admin_create_base_destination(...)`
	- `public.admin_update_base_destination(...)`
	- `public.admin_delete_base_destination(...)`
	- `public.admin_create_activity(...)`
	- `public.admin_update_activity(...)`
	- `public.admin_delete_activity(...)`
	- `public.admin_create_travel_package(...)`
	- `public.admin_update_travel_package(...)`
	- `public.admin_delete_travel_package(...)`
- Added admin package booking helper view `public.admin_package_booking_requests` in [sql/admin/views/admin-helper-views.sql](sql/admin/views/admin-helper-views.sql).

### Changed

- Updated [sql/rls/bookings-rls.sql](sql/rls/bookings-rls.sql) so package booking rows are admin-only for `SELECT`.
- Extended admin analytics payload in [sql/rpc/app-rpc.sql](sql/rpc/app-rpc.sql) with `money_flow` aggregates for guide bookings, package bookings, and payment logs (including window-based net/succeeded/refunded amounts).

### Docs

- Updated [api-docs.md](api-docs.md) Admin module to include new admin helper view and admin destination/package RPC contracts.
- Updated [api-docs.md](api-docs.md) Bookings module RLS notes and summary matrix to reflect admin-only package booking read access.

## 2026-04-20 20:41

### Added

- Added admin-only helper views module at [sql/admin/views/admin-helper-views.sql](sql/admin/views/admin-helper-views.sql) with dedicated operational queues:
	- `public.admin_pending_guide_applications`
	- `public.admin_pending_unsuspension_requests`
	- `public.admin_booking_negotiation_queue`
	- `public.admin_payment_review_queue`
	- `public.admin_package_health_queue`
	- `public.admin_system_overview`

### Changed

- Updated [sql/sql-gen.dart](sql/sql-gen.dart) so SQL bundles also include admin modular SQL sources from `sql/admin/<type>/` folders.

### Docs

- Updated [api-docs.md](api-docs.md) Admin module views section and TOC with the new `admin_*` helper views.

## 2026-04-20 20:26

### Docs

- Updated [AGENTS.md](AGENTS.md) changelog policy: never overwrite old logs, always prepend new entries above existing history.
- Updated [AGENTS.md](AGENTS.md) changelog heading rule to require timestamp precision (`YYYY-MM-DD HH:MM`).
- Added strict admin SQL isolation rule in [AGENTS.md](AGENTS.md): admin contracts must live under `sql/admin/` modular files and admin-only SQL object names must use `admin_` prefix.

## 2026-04-20

### Docs

	- views for public read contracts
	- RPC for role checks, deep nesting, and business logic

### Added

- Added modular SQL schema file [sql/schema/admin-analytics.sql](sql/schema/admin-analytics.sql) with new enum `admin_analytics_type` (`daily`, `triday`, `weekly`) and table `public.admin_analytics`.
- Added strict RLS module [sql/rls/admin-analytics-rls.sql](sql/rls/admin-analytics-rls.sql) to allow admin-only read access with no direct write policies.
- Added admin analytics RPC workflow in [sql/rpc/app-rpc.sql](sql/rpc/app-rpc.sql):
	- `public.build_admin_analytics_payload(...)`
	- `public.capture_admin_analytics_snapshot(...)`
	- `public.capture_all_admin_analytics_snapshots()`
	- `public.run_admin_analytics_midnight_job()`
	- `public.schedule_admin_analytics_midnight_job()`

### Changed

- Enabled `pg_cron` in [sql/schema/extensions.sql](sql/schema/extensions.sql) for midnight analytics scheduling.
- Updated SQL generation priority in [sql/sql-gen.dart](sql/sql-gen.dart) to include `admin-analytics` schema module.

