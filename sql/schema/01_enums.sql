-- Platform-wide enums. Keep in sync with backend/v2/schemas/enums.ts.

do $$ begin
  create type hiring_proposal_status as enum (
    'sent_by_tourist',
    'offered_by_guide',
    'rejected_by_guide',
    'cancelled_by_tourist',
    'accepted_by_tourist'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum (
    'pending_payment',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum (
    'pending',
    'succeeded',
    'failed',
    'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type guide_application_status as enum (
    'pending',
    'approved',
    'rejected',
    'revision_requested'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type unsuspension_request_status as enum (
    'pending',
    'approved',
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type travel_package_type as enum ('destination', 'activity');
exception when duplicate_object then null; end $$;

do $$ begin
  create type story_visibility as enum ('public', 'unlisted', 'archived');
exception when duplicate_object then null; end $$;
