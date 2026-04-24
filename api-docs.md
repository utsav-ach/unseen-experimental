# API contracts

This document tracks the SQL contracts the frontend depends on. Update it in
the same PR that changes any view, RPC, or RLS policy.

## Views (reads)

| View                              | Used by                                    |
| --------------------------------- | ------------------------------------------ |
| `user_info`                       | `UserService`, profile pages               |
| `minimal_user`                    | `UserService.listMinimalUsers`             |
| `destinations`                    | `DestinationService.listDestinations`      |
| `destination_reviews`             | `DestinationService.listReviews`           |
| `available_activities`            | `DestinationService.listActivities`        |
| `destination_packages`            | `DestinationService.listDestinationPackages` |
| `activities_packages`             | `DestinationService.listActivityPackages`  |
| `guide_info`                      | `GuideService.getGuide`                    |
| `available_guides`                | `GuideService.listAvailableGuides`         |
| `stories_info`                    | `StoryService.listStories`                 |
| `photos_info`                     | `StoryService.listPhotos`                  |
| `guide_booking_requests`          | `BookingService.listMyProposals`           |
| `guide_bookings_info`             | `BookingService.listMyGuideBookings`       |
| `package_bookings_info`           | `BookingService.listMyPackageBookings`     |
| `admin_pending_guide_applications`| `AdminService.listPendingGuideApplications`|
| `admin_pending_unsuspension_requests` | `AdminService.listPendingUnsuspensionRequests` |
| `admin_booking_negotiation_queue` | Admin bookings queue                       |
| `admin_payment_review_queue`      | Admin payments queue                       |
| `admin_package_health_queue`      | Admin packages queue                       |
| `admin_package_booking_requests`  | Admin packages queue                       |
| `admin_system_overview`           | `AdminService.getSystemOverview`           |

## RPCs (writes)

### Users
- `fetch_profile(target_id uuid default null) returns jsonb`
- `is_username_available(username text) returns boolean`
- `complete_onbording(first_name, last_name, username, …) returns jsonb`

### Guides
- `fetch_guide_profile(target_id uuid default null) returns jsonb`
- `review_guide(guide_id, rating, review_text) returns uuid`
- `get_guides_for_destination(lat, lon, result_limit) returns setof guide_info`
- `get_suspended_guides() returns jsonb`

### Bookings (3-step negotiation)
- `create_hiring_proposal(guide_id, destinations, people_count, duration_days, tourist_remarks?) returns uuid`
- `submit_guide_offer(proposal_id, total_quoted_price, prepay_required, guide_remarks?) returns void`
- `reject_hiring_proposal(proposal_id, guide_remarks?) returns void`
- `cancel_hiring_proposal(proposal_id) returns void`
- `accept_hiring_proposal_and_create_booking(proposal_id, prepay_amount) returns uuid`
- `create_package_booking(package_id, people_count, trip_start_date) returns uuid`

### Applications
- `apply_guide_application(description, known_languages, service_areas jsonb, previous_experience?) returns uuid`

### Admin
- `admin_create_base_destination(…) returns uuid`
- `admin_update_base_destination(target_id, …) returns void`
- `admin_delete_base_destination(target_id) returns void`
- `admin_create_activity(…) returns uuid`
- `admin_update_activity(target_id, …) returns void`
- `admin_delete_activity(target_id) returns void`
- `admin_create_travel_package(…) returns uuid`
- `admin_update_travel_package(target_id, …) returns void`
- `admin_delete_travel_package(target_id) returns void`
- `change_guide_application_status(application_id, new_status, feedback?) returns jsonb`
- `change_guide_suspend_status(guide_id, suspend boolean, reason?) returns jsonb`

### Analytics
- `build_admin_analytics_payload(days default 30) returns jsonb`
- `capture_admin_analytics_snapshot(type, days default 30) returns uuid`
- `capture_all_admin_analytics_snapshots() returns jsonb`
- `run_admin_analytics_midnight_job() returns void`
- `schedule_admin_analytics_midnight_job() returns text`
