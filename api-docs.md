# Unseen Nepal Backend API Documentation

This document describes the SQL backend contract in **module-based structure**.

Primary sources:
- `sql/schema/*.sql`
- `sql/views/all-views.sql`
- `sql/rpc/app-rpc.sql`
- `sql/rls/*.sql`
- `sql/triggers/*.sql`

---
- [Unseen Nepal Backend API Documentation](#unseen-nepal-backend-api-documentation)
  - [1) System Overview](#1-system-overview)
  - [2) Overview of Modules](#2-overview-of-modules)
  - [3) Users Module](#3-users-module)
    - [3.1 Tables](#31-tables)
      - [`public.profiles`](#publicprofiles)
    - [3.2 Views](#32-views)
      - [`public.user_info`](#publicuser_info)
      - [`public.minimal_user`](#publicminimal_user)
    - [3.3 RPCs](#33-rpcs)
      - [`public.fetch_profile(target_id uuid DEFAULT auth.uid())`](#publicfetch_profiletarget_id-uuid-default-authuid)
      - [`public.is_username_available(p_username text)`](#publicis_username_availablep_username-text)
      - [`public.complete_onbording(...)`](#publiccomplete_onbording)
  - [4) Destinations Module](#4-destinations-module)
    - [4.1 Tables](#41-tables)
      - [`public.base_destination`](#publicbase_destination)
      - [`public.base_destination_reviews`](#publicbase_destination_reviews)
      - [`public.activities`](#publicactivities)
      - [`public.travel_packages`](#publictravel_packages)
    - [4.2 Views](#42-views)
      - [`public.destinations`](#publicdestinations)
      - [`public.destination_reviews`](#publicdestination_reviews)
      - [`public.available_activities`](#publicavailable_activities)
      - [`public.destination_packages`](#publicdestination_packages)
      - [`public.activities_packages`](#publicactivities_packages)
    - [4.3 RPCs](#43-rpcs)
  - [5) Guides Module](#5-guides-module)
    - [5.1 Tables](#51-tables)
      - [`public.guides`](#publicguides)
      - [`public.guide_service_areas`](#publicguide_service_areas)
      - [`public.guide_reviews`](#publicguide_reviews)
      - [`public.suspended_guides`](#publicsuspended_guides)
    - [5.2 Views](#52-views)
      - [`public.guide_info`](#publicguide_info)
      - [`public.available_guides`](#publicavailable_guides)
    - [5.3 RPCs](#53-rpcs)
      - [`public.fetch_guide_profile(target_id uuid DEFAULT auth.uid())`](#publicfetch_guide_profiletarget_id-uuid-default-authuid)
      - [`public.review_guide(...)`](#publicreview_guide)
      - [`public.get_guides_for_destination(...)`](#publicget_guides_for_destination)
      - [`public.get_suspended_guides()`](#publicget_suspended_guides)
  - [6) Stories Module](#6-stories-module)
    - [6.1 Tables](#61-tables)
      - [`public.stories`](#publicstories)
      - [`public.story_likes`](#publicstory_likes)
      - [`public.story_comments`](#publicstory_comments)
      - [`public.photos`](#publicphotos)
    - [6.2 Views](#62-views)
      - [`public.stories_info`](#publicstories_info)
      - [`public.photos_info`](#publicphotos_info)
    - [6.3 RPCs](#63-rpcs)
  - [7) Admin Module](#7-admin-module)
    - [7.1 Tables](#71-tables)
      - [`public.admin_analytics`](#publicadmin_analytics)
    - [7.2 Views](#72-views)
      - [`public.admin_pending_guide_applications`](#publicadmin_pending_guide_applications)
      - [`public.admin_pending_unsuspension_requests`](#publicadmin_pending_unsuspension_requests)
      - [`public.admin_booking_negotiation_queue`](#publicadmin_booking_negotiation_queue)
      - [`public.admin_payment_review_queue`](#publicadmin_payment_review_queue)
      - [`public.admin_package_health_queue`](#publicadmin_package_health_queue)
      - [`public.admin_package_booking_requests`](#publicadmin_package_booking_requests)
      - [`public.admin_system_overview`](#publicadmin_system_overview)
    - [7.3 RPCs](#73-rpcs)
      - [`public.build_admin_analytics_payload(p_days integer DEFAULT 1)`](#publicbuild_admin_analytics_payloadp_days-integer-default-1)
      - [`public.capture_admin_analytics_snapshot(...)`](#publiccapture_admin_analytics_snapshot)
      - [`public.capture_all_admin_analytics_snapshots()`](#publiccapture_all_admin_analytics_snapshots)
      - [`public.run_admin_analytics_midnight_job()`](#publicrun_admin_analytics_midnight_job)
      - [`public.schedule_admin_analytics_midnight_job()`](#publicschedule_admin_analytics_midnight_job)
      - [`public.admin_create_base_destination(...)`](#publicadmin_create_base_destination)
      - [`public.admin_update_base_destination(...)`](#publicadmin_update_base_destination)
      - [`public.admin_delete_base_destination(...)`](#publicadmin_delete_base_destination)
      - [`public.admin_create_activity(...)`](#publicadmin_create_activity)
      - [`public.admin_update_activity(...)`](#publicadmin_update_activity)
      - [`public.admin_delete_activity(...)`](#publicadmin_delete_activity)
      - [`public.admin_create_travel_package(...)`](#publicadmin_create_travel_package)
      - [`public.admin_update_travel_package(...)`](#publicadmin_update_travel_package)
      - [`public.admin_delete_travel_package(...)`](#publicadmin_delete_travel_package)
      - [`public.change_guide_application_status(...)`](#publicchange_guide_application_status)
      - [`public.change_guide_suspend_status(...)`](#publicchange_guide_suspend_status)
  - [8) Bookings Module](#8-bookings-module)
    - [8.1 Tables](#81-tables)
      - [`public.hiring_proposals`](#publichiring_proposals)
      - [`public.guide_bookings`](#publicguide_bookings)
      - [`public.package_bookings`](#publicpackage_bookings)
      - [`public.payment_logs`](#publicpayment_logs)
    - [8.2 Views](#82-views)
      - [`public.guide_booking_requests`](#publicguide_booking_requests)
      - [`public.guide_bookings_info`](#publicguide_bookings_info)
      - [`public.package_bookings_info`](#publicpackage_bookings_info)
    - [8.3 RPCs](#83-rpcs)
      - [`public.map_proposal_status_to_legacy(v_status proposal_status)`](#publicmap_proposal_status_to_legacyv_status-proposal_status)
      - [`public.create_hiring_proposal(...)`](#publiccreate_hiring_proposal)
      - [`public.submit_guide_offer(...)`](#publicsubmit_guide_offer)
      - [`public.reject_hiring_proposal(...)`](#publicreject_hiring_proposal)
      - [`public.cancel_hiring_proposal(...)`](#publiccancel_hiring_proposal)
      - [`public.accept_hiring_proposal_and_create_booking(...)`](#publicaccept_hiring_proposal_and_create_booking)
      - [`public.create_package_booking(...)`](#publiccreate_package_booking)
  - [9) Applications Module](#9-applications-module)
    - [9.1 Tables](#91-tables)
      - [`public.guide_applications`](#publicguide_applications)
      - [`public.guide_service_areas_applications`](#publicguide_service_areas_applications)
      - [`public.unsuspension_requests`](#publicunsuspension_requests)
    - [9.2 Views](#92-views)
    - [9.3 RPCs](#93-rpcs)
      - [`public.apply_guide_application(...)`](#publicapply_guide_application)
      - [`public.change_guide_application_status(...)`](#publicchange_guide_application_status-1)
  - [10) Shared Helpers (Non-Module Bound)](#10-shared-helpers-non-module-bound)
    - [Permission helpers](#permission-helpers)
    - [Validation/normalization helpers](#validationnormalization-helpers)
    - [Trigger overview](#trigger-overview)
    - [RLS summary matrix](#rls-summary-matrix)
    - [Storage policy surface](#storage-policy-surface)

---

## 1) System Overview

Unseen Nepal is a travel platform backend on Supabase PostgreSQL.

Data access model:
1. **Tables**: source of truth
2. **Views**: read-optimized UI models
3. **RPCs**: business logic + controlled writes
4. **RLS**: data access enforcement

---

## 2) Overview of Modules

1. **Destinations**: base destinations + packages
2. **Guides**: guide profile/service/reviews
3. **Stories**: stories + photos content
4. **Admin**: privileged moderation/approval operations
5. **Bookings**: proposals, bookings, payments
6. **Users**: profile/auth-adjacent profile APIs
7. **Applications**: guide + unsuspension application flows

---

## 3) Users Module

### 3.1 Tables

#### `public.profiles`
**Purpose:** App-level user profile linked to `auth.users`.

**Columns (key):**
- `id` (PK, FK -> `auth.users.id`)
- names: `first_name`, `middle_name`, `last_name`
- `username` (unique)
- contact: `phone_number`, `emergency_contact`
- `avatar_url`
- flags: `is_admin`, `is_guide`, `is_guide_applicantion_pending`, `is_onboarding_complete`
- location: `home_location`, `home_location_name`
- `created_at`, `updated_at`

**RLS:**
- Public select
- Write: admin only

### 3.2 Views

#### `public.user_info`
**Description:** Canonical lightweight public user projection.

**Columns:**
- `id`, `full_name`, `username`, `avatar_url`, `is_guide`

**Sample JSON:**
```json
{
  "id": "uuid",
  "full_name": "Asha Rai",
  "username": "asha.rai",
  "avatar_url": "https://...",
  "is_guide": true
}
```

#### `public.minimal_user`
**Description:** Backward-compatible alias view for `user_info`.

**Columns:**
- `id`, `full_name`, `username`, `avatar_url`, `is_guide`

**Sample JSON:**
```json
{
  "id": "uuid",
  "full_name": "Asha Rai",
  "username": "asha.rai",
  "avatar_url": "https://...",
  "is_guide": true
}
```

### 3.3 RPCs

#### `public.fetch_profile(target_id uuid DEFAULT auth.uid())`
**Purpose:** Return profile + auth-derived flags.

**Parameters:**
- `target_id` (optional)

**Returns:** `jsonb`

**Example:**
```json
{
  "profile": {
    "id": "uuid",
    "first_name": "Asha",
    "middle_name": null,
    "last_name": "Rai",
    "username": "asha.rai",
    "phone_number": "+9779812378909",
    "emergency_contact": "+9779812378909",
    "avatar_url": "https://...",
    "is_admin": false,
    "home_location": "SRID=4326;POINT(85.3240 27.7172)",
    "home_location_name": "Kathmandu",
    "is_guide": true,
    "is_guide_applicantion_pending": false,
    "created_at": "2026-04-18T10:10:10.000Z",
    "updated_at": "2026-04-18T10:10:10.000Z"
  },
  "email": "user@example.com",
  "is_onboarding_done": true,
  "is_auth_verified": true
}
```

#### `public.is_username_available(p_username text)`
**Purpose:** Username availability check (case-insensitive, excluding current user).

**Parameters:**
- `p_username`

**Returns:** `boolean`

#### `public.complete_onbording(...)`
**Purpose:** Create/update onboarding profile data.

**Parameters:**
- `p_first_name`, `p_middle_name`, `p_last_name`
- `p_username`
- `p_phone_number`, `p_emergency_contact`
- `p_avatar_url`
- `p_home_location`, `p_home_location_name`

**Returns:** `jsonb` (same shape as `fetch_profile`)

---

## 4) Destinations Module

### 4.1 Tables

#### `public.base_destination`
**Purpose:** Canonical destination entities.

**Columns (key):**
- `id`, `name`
- `coordinates`, `radius`
- `avg_rating`, `tags`, `description`
- `feature_image`, `additional_images`
- `possible_activities`
- `created_at`, `updated_at`

**RLS:**
- Public select
- Write: admin only

#### `public.base_destination_reviews`
**Purpose:** User reviews for destinations.

**Columns (key):**
- `id`, `destination_id`, `tourist_id`
- `rating`, `review_text`
- `created_at`, `updated_at`

**RLS:**
- Public select
- Self-manage by `tourist_id`
- Admin full access

#### `public.activities`
**Purpose:** Destination/package activity taxonomy.

**Columns (key):**
- `id`, `name`, `description`, timestamps

**RLS:**
- Public select
- Write: admin only

#### `public.travel_packages`
**Purpose:** Commercial package definitions.

**Columns (key):**
- identity: `id`, `name`, `type`
- pricing/date: `actual_price`, `discounted_price`, `discount_deadline`, `expiration_date`
- media: `featured_image`, `additional_images`
- trip: `total_days`, `travel_routes`, `description`
- links: `destinations_covered`, `included_activities`, `main_activity`
- timestamps

**RLS:**
- Public select
- Write: admin only

### 4.2 Views

#### `public.destinations`
**Description:** Canonical destination read model used by UI; includes embedded activity objects.

**Columns:**
- `id`, `name`, `coordinates`, `radius`, `avg_rating`, `tags`, `description`, `feature_image`, `additional_images`, `possible_activities`

**Sample JSON:**
```json
{
  "id": "uuid",
  "name": "Pokhara",
  "coordinates": "SRID=4326;POINT(83.9856 28.2096)",
  "radius": 5000,
  "feature_image": "https://...",
  "additional_images": ["https://...", "https://..."],
  "avg_rating": 4.8,
  "tags": ["lake", "mountains"],
  "description": "Popular lake city",
  "possible_activities": [
    { "id": "uuid", "name": "Boating" },
    { "id": "uuid", "name": "Paragliding" }
  ]
}
```

#### `public.destination_reviews`
**Description:** Destination reviews joined with reviewer identity from `user_info`.

**Columns:**
- `id`, `destination_id`, `rating`, `review_text`, `created_at`, `reviewer`

**Sample JSON:**
```json
{
  "id": "uuid",
  "destination_id": "uuid",
  "rating": 4.5,
  "review_text": "Great place",
  "created_at": "2026-04-18T10:10:10.000Z",
  "reviewer": {
    "id": "uuid",
    "name": "Sita Lama",
    "username": "sita.lama",
    "avatar": "https://...",
    "is_guide": false
  }
}
```

#### `public.available_activities`
**Description:** Public lightweight projection of activity catalog.

**Columns:**
- `id`, `name`, `description`

**Sample JSON:**
```json
{
  "id": "uuid",
  "name": "Rafting",
  "description": "River adventure activity"
}
```

#### `public.destination_packages`
**Description:** Active destination-focused packages.

**Columns:**
- `id`, `name`, `actual_price`, `discounted_price`, `featured_image`, `additional_images`, `total_days`, `travel_routes`, `description`, `expiration_date`, `destinations_covered`, `included_activities`, `main_activity`

**Sample JSON:**
```json
{
  "id": "uuid",
  "name": "Pokhara Escape",
  "actual_price": 15000,
  "discounted_price": 12000,
  "featured_image": "https://...",
  "additional_images": ["https://..."],
  "total_days": 4,
  "travel_routes": "Day 1: ...",
  "description": "Package details",
  "expiration_date": "2026-06-01T00:00:00.000Z",
  "destinations_covered": [{ "id": "uuid", "name": "Pokhara" }],
  "included_activities": [{ "id": "uuid", "name": "Boating" }],
  "main_activity": { "id": "uuid", "name": "Boating" }
}
```

#### `public.activities_packages`
**Description:** Active activity-focused packages.

**Columns:**
- `id`, `name`, `actual_price`, `discounted_price`, `featured_image`, `additional_images`, `total_days`, `travel_routes`, `description`, `expiration_date`, `destinations_covered`, `additional_activities_included`, `main_activity`

**Sample JSON:**
```json
{
  "id": "uuid",
  "name": "Rafting Plus",
  "actual_price": 10000,
  "discounted_price": 8500,
  "featured_image": "https://...",
  "additional_images": ["https://..."],
  "total_days": 3,
  "travel_routes": "Day 1: ...",
  "description": "Activity-focused package",
  "expiration_date": "2026-06-10T00:00:00.000Z",
  "destinations_covered": [{ "id": "uuid", "name": "Trishuli" }],
  "additional_activities_included": [
    { "id": "uuid", "name": "Rafting" },
    { "id": "uuid", "name": "Camping" }
  ],
  "main_activity": { "id": "uuid", "name": "Rafting" }
}
```

### 4.3 RPCs
- No destination-specific RPC in canonical `app-rpc.sql`.

Note: legacy helper views `top_trending_destinations` and `top_trending_packages` were removed. Trending sort/filter is now handled in frontend/service helper functions over canonical module views.

---

## 5) Guides Module

### 5.1 Tables

#### `public.guides`
**Purpose:** Approved guide profile data.

**Columns (key):**
- `id`, `description`, `previous_experience`, `known_languages`
- `admin_feedback`
- `is_available`, `is_suspended`, `avg_rating`

**RLS:**
- Public select
- Self-manage
- Admin full access

#### `public.guide_service_areas`
**Purpose:** Service coverage regions.

**Columns (key):**
- `id`, `guide_id`, `location`, `radius_meters`, `location_name`, `created_at`

**RLS:**
- Public select
- Self-manage
- Admin full access

#### `public.guide_reviews`
**Purpose:** Guide rating/review rows.

**Columns (key):**
- `id`, `guide_id`, `reviewer_id`, `rating`, `review_text`, timestamps

**RLS:**
- Public select
- Self-manage
- Admin full access

#### `public.suspended_guides`
**Purpose:** Suspension history.

**Columns (key):**
- `id`, `guide_id`, `reason`, `admin_id`, `created_at`

**RLS:**
- Owner/admin select
- Admin writes

### 5.2 Views

#### `public.guide_info`
**Description:** Canonical public guide read contract (used by UI). Includes all service areas for each guide.

**Columns:**
- `id`, `full_name`, `username`, `avatar_url`, `avg_rating`, `description`, `previous_experience`, `known_languages`, `is_available`, `service_areas`

**Sample JSON:**
```json
{
  "id": "uuid",
  "full_name": "Nima Sherpa",
  "username": "nima",
  "avatar_url": "https://...",
  "avg_rating": 4.9,
  "description": "Mountain guide with local expertise",
  "previous_experience": "Everest region routes",
  "known_languages": ["en", "ne"],
  "is_available": true,
  "service_areas": [
    {
      "id": "uuid",
      "location": "SRID=4326;POINT(85.3240 27.7172)",
      "radius_meters": 15000,
      "location_name": "Kathmandu",
      "created_at": "2026-04-18T10:10:10.000Z"
    }
  ]
}
```

#### `public.available_guides`
**Description:** Availability-filtered projection from `guide_info`.

**Columns:**
- same as `guide_info`

**Sample JSON:**
```json
{
  "id": "uuid",
  "full_name": "Nima Sherpa",
  "username": "nima",
  "avatar_url": "https://...",
  "avg_rating": 4.9,
  "description": "Mountain guide with local expertise",
  "previous_experience": "Everest region routes",
  "known_languages": ["en", "ne"],
  "is_available": true,
  "service_areas": [
    {
      "id": "uuid",
      "location": "SRID=4326;POINT(85.3240 27.7172)",
      "radius_meters": 15000,
      "location_name": "Kathmandu",
      "created_at": "2026-04-18T10:10:10.000Z"
    }
  ]
}
```

### 5.3 RPCs

#### `public.fetch_guide_profile(target_id uuid DEFAULT auth.uid())`
**Purpose:** Guide profile payload for admin/self only.

**Parameters:**
- `target_id` (optional)

**Returns:** `jsonb`

**Example:**
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "Nima Sherpa",
    "username": "nima",
    "avatar_url": "https://...",
    "avg_rating": 4.8,
    "description": "Mountain guide with 7 years of experience",
    "previous_experience": "Everest region",
    "known_languages": ["en", "ne"],
    "is_available": true,
    "service_areas": [
      {
        "id": "uuid",
        "location": "SRID=4326;POINT(85.3240 27.7172)",
        "radius_meters": 15000,
        "location_name": "Kathmandu",
        "created_at": "2026-04-18T10:10:10.000Z"
      }
    ]
  },
  "admin_feedback": "Approved",
  "is_suspended": false
}
```

#### `public.review_guide(...)`
**Purpose:** Create/update guide review after completed booking.

**Parameters:**
- `p_guide_id`, `p_rating`, `p_review_text?`

**Returns:** `uuid`

#### `public.get_guides_for_destination(...)`
**Purpose:** Geospatial guide lookup by lat/lon.

**Parameters:**
- `p_lat`, `p_lon`, `p_limit?`

**Returns:** `TABLE` with same shape as `guide_info`.

#### `public.get_suspended_guides()`
**Purpose:** Admin-only RPC returning suspended guides with suspension reason and audit fields.

**Returns:** `jsonb`

**Authorization:**
- Rejects non-admin callers with `42501`.

Note: legacy helper view `guide_discovery_cards` was removed. Guide discovery cards are now derived in frontend/service helpers from `available_guides` using the same `GuideInfo` contract.

---

## 6) Stories Module

### 6.1 Tables

#### `public.stories`
**Purpose:** Story posts.

**Columns (key):**
- `id`, `uploader_id`, `title`, `feature_image`, `description`, `categories`, `tags`, counters, archive flag, location, timestamps

**RLS:**
- Public read non-archived
- Owner/admin manage

#### `public.story_likes`
**Purpose:** Story like relations.

**Columns (key):**
- `id`, `story_id`, `user_id`, `created_at`

**RLS:**
- Public read
- Owner/admin manage

#### `public.story_comments`
**Purpose:** Story comments.

**Columns (key):**
- `id`, `story_id`, `user_id`, `content`, timestamps

**RLS:**
- Public read
- Owner/admin manage

#### `public.photos`
**Purpose:** Photo posts with optional location.

**Columns (key):**
- `id`, `uploader_id`, `media_urls`, `description`, `location`, `location_name`, timestamps

**RLS:**
- Public read
- Owner/admin manage

### 6.2 Views

#### `public.stories_info`
**Description:** Story rows enriched with uploader public profile projection.

**Columns:**
- story fields + uploader projection fields:
  - `uploader_full_name`, `uploader_username`, `uploader_avatar_url`, `uploader_is_guide`

**Sample JSON:**
```json
{
  "id": "uuid",
  "title": "Sunrise at Poon Hill",
  "feature_image": "https://...",
  "description": "...",
  "categories": "trek",
  "tags": ["himalaya"],
  "is_archived": false,
  "likes_count": 120,
  "comments_count": 18,
  "uploader_id": "uuid",
  "uploader_full_name": "Asha Rai",
  "uploader_username": "asha.rai",
  "uploader_avatar_url": "https://...",
  "uploader_is_guide": false
}
```

#### `public.photos_info`
**Description:** Photo rows enriched with uploader public profile projection.

**Columns:**
- photo fields + uploader projection fields:
  - `uploader_full_name`, `uploader_username`, `uploader_avatar_url`, `uploader_is_guide`

**Sample JSON:**
```json
{
  "id": "uuid",
  "uploader_id": "uuid",
  "media_urls": ["https://..."],
  "description": "Morning ridge view",
  "location_name": "Nagarkot",
  "uploader_full_name": "Kiran",
  "uploader_username": "kiran",
  "uploader_avatar_url": "https://...",
  "uploader_is_guide": false
}
```

### 6.3 RPCs
- No dedicated stories/photos RPC in canonical `app-rpc.sql`.

---

## 7) Admin Module

### 7.1 Tables

#### `public.admin_analytics`
**Purpose:** Internal analytics snapshot store generated by scheduled jobs.

**Columns (key):**
- `id` (uuid PK)
- `data` (jsonb analytics payload)
- `type` (`daily | triday | weekly`)
- `created_at`, `updated_at`

**RLS:**
- Admin read only
- No direct insert/update/delete policy for user roles
- Snapshots are written by SECURITY DEFINER RPC/cron job path

### 7.2 Views

#### `public.admin_pending_guide_applications`
**Purpose:** Admin review queue for pending guide applications including applicant identity and requested service areas.

#### `public.admin_pending_unsuspension_requests`
**Purpose:** Admin review queue for pending unsuspension requests with latest suspension context.

#### `public.admin_booking_negotiation_queue`
**Purpose:** Operational queue for active booking negotiations (`sent_by_tourist`, `offered_by_guide`).

#### `public.admin_payment_review_queue`
**Purpose:** Payment incident/review queue (`pending`, `failed`, `refunded`) across guide and package bookings.

#### `public.admin_package_health_queue`
**Purpose:** Package lifecycle view (expired/expiring/healthy) with booking and collected amount summaries.

#### `public.admin_package_booking_requests`
**Purpose:** Admin-only package booking request list with tourist identity, status, due amount, and payment log summary.

#### `public.admin_system_overview`
**Purpose:** One-row admin operational snapshot with key pending counters.

### 7.3 RPCs

#### `public.build_admin_analytics_payload(p_days integer DEFAULT 1)`
**Purpose:** Build deep analytics JSON payload for the requested trailing window.

**Parameters:**
- `p_days` (minimum 1)

**Returns:** `jsonb` with broad internal metrics grouped by domain (`users`, `guides`, `guide_applications`, `unsuspension_requests`, `destinations`, `activities`, `travel_packages`, `stories`, `photos`, `hiring_proposals`, `guide_bookings`, `package_bookings`, `payment_logs`) and `money_flow` (booking totals, paid totals, succeeded/refunded/net payment aggregates for both all-time and requested window).

Each metric follows:
```json
{
  "total": 10,
  "data": ["uuid-1", "uuid-2"]
}
```

#### `public.capture_admin_analytics_snapshot(...)`
**Purpose:** Persist one analytics snapshot row.

**Parameters:**
- `p_type` (`daily | triday | weekly`)
- `p_days` (optional override)

**Returns:** `uuid` (new analytics row id)

#### `public.capture_all_admin_analytics_snapshots()`
**Purpose:** Capture all three snapshot types in one call (`daily`, `triday`, `weekly`).

**Returns:** `jsonb`

#### `public.run_admin_analytics_midnight_job()`
**Purpose:** Cron execution entrypoint; captures all analytics snapshot types.

**Returns:** `void`

#### `public.schedule_admin_analytics_midnight_job()`
**Purpose:** Admin-only scheduler helper that (re)registers midnight cron trigger.

**Schedule:** `0 0 * * *` (every midnight)

**Returns:** `text`

#### `public.admin_create_base_destination(...)`
**Purpose:** Admin-only destination creation RPC for featured destinations and their activity mappings.

#### `public.admin_update_base_destination(...)`
**Purpose:** Admin-only destination update RPC (name, coordinates, radius, images, tags, activities).

#### `public.admin_delete_base_destination(...)`
**Purpose:** Admin-only destination delete RPC.

#### `public.admin_create_activity(...)`
**Purpose:** Admin-only activity catalog creation RPC.

#### `public.admin_update_activity(...)`
**Purpose:** Admin-only activity update RPC.

#### `public.admin_delete_activity(...)`
**Purpose:** Admin-only activity delete RPC.

#### `public.admin_create_travel_package(...)`
**Purpose:** Admin-only package creation RPC for both destination and activity package types.

#### `public.admin_update_travel_package(...)`
**Purpose:** Admin-only package update RPC including price, schedule, route, and linked entities.

#### `public.admin_delete_travel_package(...)`
**Purpose:** Admin-only package delete RPC.

#### `public.change_guide_application_status(...)`
**Purpose:** Approve/reject guide applications.

**Parameters:**
- `p_application_id`, `p_status`, `p_admin_feedback`

**Returns:** `jsonb` (updated application row)

#### `public.change_guide_suspend_status(...)`
**Purpose:** Suspend/unsuspend guide and log reason.

**Parameters:**
- `p_guide_id`, `p_status`, `p_reason`

**Returns:** `jsonb`

**Example:**
```json
{
  "guide_id": "uuid",
  "suspended": true,
  "reason": "Policy violation"
}
```

---

## 8) Bookings Module

### 8.1 Tables

#### `public.hiring_proposals`
**Purpose:** Tourist-guide negotiation record before booking.

**Columns (key):**
- actors: `tourist_id`, `guide_id`
- trip: `destinations`, `people_count`, `duration_days`, `additional_details`
- terms: `total_quoted_price`, `prepay_required`, remarks/terms fields
- `status`, timestamps

**RLS:**
- Participant/admin read
- Write path via RPC + admin policy

#### `public.guide_bookings`
**Purpose:** Final guide booking row.

**Columns (key):**
- `proposal_id`, `tourist_id`, `guide_id`
- `final_amount`, `prepay_amount`, `paid_amount`
- `status`, `trip_start_date`, `hired_at`, timestamps

**RLS:**
- Participant/admin read
- Write path via RPC + admin policy

#### `public.package_bookings`
**Purpose:** Direct package booking row.

**Columns (key):**
- `package_id`, `tourist_id`
- `final_amount`, `paid_amount`, `participant_count`, `status`, timestamps

**RLS:**
- Admin-only read
- Write path via RPC + admin policy

#### `public.payment_logs`
**Purpose:** Payment transaction logs for guide/package bookings.

**Columns (key):**
- one target: `guide_booking_id` OR `package_booking_id`
- `tourist_id`, `provider`, `provider_txn_id`, `amount`, `currency`, `status`, `raw_response`, `created_at`

**RLS:**
- tourist/related guide/admin read
- Write path via RPC + admin policy

### 8.2 Views

#### `public.guide_booking_requests`
**Description:** Proposal requests mapped to `booking_request_status` compatibility shape.

**Columns:**
- `id`, `tourist_id`, `guide_id`, `destinations`, `people_count`, `duration_days`, `additional_details`, `status`, `total_cost`, `prepay_amount`, `guide_remarks`, `tourist_remarks`, `created_at`, `updated_at`

**Sample JSON:**
```json
{
  "id": "uuid",
  "tourist_id": "uuid",
  "guide_id": "uuid",
  "status": "approved",
  "total_cost": 15000,
  "prepay_amount": 3000
}
```

#### `public.guide_bookings_info`
**Description:** Guide booking info with aggregated payment log exposure.

**Columns:**
- booking fields + `payment_logs` JSON array

**Sample JSON:**
```json
{
  "id": "uuid",
  "tourist_id": "uuid",
  "guide_id": "uuid",
  "trip_start_date": "2026-05-10",
  "status": "confirmed",
  "total_amount": 15000,
  "destination_name": "Pokhara"
  "is_payment_received": true,
  "payment_logs": [
    {
      "status": "succeeded",
      "provider": "esewa",
      "currency": "NPR",
      "created_at": "2026-04-18T10:00:00Z"
    }
  ]
}
```

#### `public.package_bookings_info`
**Description:** Package booking info with bounded recent payment log array.

**Columns:**
- package booking fields + `payment_logs` JSON array

**Sample JSON:**
```json
{
  "id": "uuid",
  "tourist_id": "uuid",
  "package_id": "uuid",
  "participant_count": 2,
  "booking_status": "confirmed",
  "total_amount": 12000,
  "payment_logs": [
    {
      "status": "succeeded",
      "provider": "cash",
      "currency": "NPR",
      "created_at": "2026-04-18T10:00:00Z"
    }
  ]
}
```

### 8.3 RPCs

#### `public.map_proposal_status_to_legacy(v_status proposal_status)`
**Purpose:** Convert proposal status to legacy enum.

**Parameters:**
- `v_status`

**Returns:** `booking_request_status`

#### `public.create_hiring_proposal(...)`
**Purpose:** Create proposal by tourist.

**Parameters:**
- `p_guide_id`, `p_destinations`, `p_people_count`, `p_duration_days`, `p_additional_details?`, `p_tourist_remarks?`

**Returns:** `uuid`

#### `public.submit_guide_offer(...)`
**Purpose:** Guide submits quote/terms.

**Parameters:**
- `p_proposal_id`, `p_total_quoted_price`, `p_prepay_required`, `p_guide_remarks`

**Returns:** `void`

#### `public.reject_hiring_proposal(...)`
**Purpose:** Close proposal by rejection/cancel logic.

**Parameters:**
- `p_proposal_id`, `p_guide_remarks?`, `p_tourist_remarks?`

**Returns:** `void`

#### `public.cancel_hiring_proposal(...)`
**Purpose:** Tourist cancellation wrapper.

**Parameters:**
- `p_proposal_id`, `p_tourist_remarks?`

**Returns:** `void`

#### `public.accept_hiring_proposal_and_create_booking(...)`
**Purpose:** Accept offer and atomically create booking + payment log.

**Parameters:**
- `p_proposal_id`, `p_tourist_remarks?`, `p_payment_provider?`, `p_paid_amount?`, `p_provider_txn_id?`, `p_raw_response?`

**Returns:** `jsonb`

**Example:**
```json
{
  "booking_id": "uuid",
  "proposal_id": "uuid",
  "paid_amount": 2500,
  "final_amount": 15000,
  "status": "confirmed"
}
```

#### `public.create_package_booking(...)`
**Purpose:** Create package booking + payment log.

**Parameters:**
- `p_package_id`, `p_payment_provider?`, `p_paid_amount?`, `p_participant_count?`, `p_provider_txn_id?`, `p_raw_response?`

**Returns:** `jsonb`

**Example:**
```json
{
  "package_booking_id": "uuid",
  "package_id": "uuid",
  "final_amount": 12000,
  "paid_amount": 12000,
  "status": "confirmed"
}
```

---

## 9) Applications Module

### 9.1 Tables

#### `public.guide_applications`
**Purpose:** Guide applicant submission records.

**Columns (key):**
- `application_id`, `user_id`
- `nid_document_type`, `nid_number`, `nid_photo_url`
- `description`, `previous_experience`, `known_languages`
- `status`, `admin_feedback`, timestamps

**RLS:**
- Self/admin select
- Admin full management

#### `public.guide_service_areas_applications`
**Purpose:** Service area rows linked to a guide application.

**Columns (key):**
- `id`, `application_id`, `location`, `radius_meters`, `location_name`, `created_at`

**RLS:**
- Self/admin select
- Admin full management

#### `public.unsuspension_requests`
**Purpose:** Requests from suspended guides for reinstatement.

**Columns (key):**
- `id`, `guide_id`, `clarification`, `status`, `admin_feedback`, `reviewed_by`, `reviewed_at`, timestamps

**RLS:**
- Owner/admin select
- Owner insert + delete pending
- Admin full management

### 9.2 Views
- No dedicated applications view in canonical SQL modules.

### 9.3 RPCs

#### `public.apply_guide_application(...)`
**Purpose:** Submit guide application with optional service areas.

**Parameters:**
- `p_nid_document_type`, `p_nid_number`, `p_nid_photo_url`
- `p_description`, `p_previous_experience`
- `p_known_languages?`, `p_service_areas?`

**Returns:** `uuid`

#### `public.change_guide_application_status(...)`
**Purpose:** Admin approves/rejects guide application and syncs guide/profile status.

**Parameters:**
- `p_application_id`, `p_status`, `p_admin_feedback`

**Returns:** `jsonb` (updated application row)

---

## 10) Shared Helpers (Non-Module Bound)

### Permission helpers
- `current_user_is_admin() -> boolean`
- `require_authenticated_user(p_message text) -> uuid`
- `require_admin_access(p_message text) -> uuid`
- `is_admin_or_self(p_id uuid) -> boolean`
- `require_self_or_admin_access(p_id uuid, p_message text) -> uuid`

### Validation/normalization helpers
- `clean_text(p_value text, p_field_name text) -> text`
- `clean_optional_text(p_value text) -> text`
- `clean_username(p_username text) -> text`
- `validate_phone_with_country_code(p_phone text, p_field_name text) -> text`
- `validate_rating(p_rating numeric, p_field_name text) -> numeric`
- `validate_positive_int(p_value integer, p_field_name text) -> integer`
- `validate_non_negative_numeric(p_value numeric, p_field_name text) -> numeric`
- `validate_jsonb_array(p_value jsonb, p_field_name text) -> jsonb`
- `parse_point_geography(p_home_location text) -> geography`
- `profile_display_name(p_first_name text, p_last_name text, p_username text, p_fallback_name text) -> text`

### Trigger overview
- `handle_new_user()`
- `handle_updated_at_column()`
- `handle_guide_application_update()`
- `update_guide_rating()`
- `manage_story_counts()`
- `update_base_destination_avg_rating()`

### RLS summary matrix
| Table | Public Read | Owner/User Write | Admin Write |
|---|---:|---:|---:|
| profiles | Yes | No | Yes |
| base_destination | Yes | No | Yes |
| base_destination_reviews | Yes | Yes (own) | Yes |
| activities | Yes | No | Yes |
| travel_packages | Yes | No | Yes |
| guide_applications | Self/Admin | No direct general | Yes |
| guide_service_areas_applications | Self/Admin | No direct general | Yes |
| guides | Yes | Yes (own) | Yes |
| guide_service_areas | Yes | Yes (own) | Yes |
| guide_reviews | Yes | Yes (own) | Yes |
| suspended_guides | Owner/Admin | No | Yes |
| unsuspension_requests | Owner/Admin | Owner insert/delete pending | Yes |
| stories | Conditional | Yes (own) | Yes |
| story_likes | Yes | Yes (own) | Yes |
| story_comments | Yes | Yes (own) | Yes |
| photos | Yes | Yes (own) | Yes |
| hiring_proposals | Participant/Admin | RPC path expected | Yes |
| guide_bookings | Participant/Admin | RPC path expected | Yes |
| package_bookings | Admin only | RPC path expected | Yes |
| payment_logs | Participant/Admin | RPC path expected | Yes |

### Storage policy surface
Buckets:
- `profile_pics`
- `vault`
- `stories_images`
- `user-gallery`
