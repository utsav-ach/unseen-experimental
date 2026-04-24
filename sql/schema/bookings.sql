CREATE TYPE proposal_status AS ENUM (
  'sent_by_tourist',
  'offered_by_guide',
  'rejected_by_guide',
  'cancelled_by_tourist',
  'accepted_by_tourist'
);

CREATE TYPE guide_booking_status AS ENUM ('confirmed', 'completed', 'cancelled');
CREATE TYPE package_booking_status AS ENUM ('confirmed', 'completed', 'cancelled');
CREATE TYPE payment_provider AS ENUM ('esewa', 'khalti', 'stripe', 'paypal', 'card', 'cash');
CREATE TYPE payment_log_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE public.hiring_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE RESTRICT,

  destinations text NOT NULL CHECK (length(trim(destinations)) > 0),
  people_count integer NOT NULL DEFAULT 1 CHECK (people_count > 0),
  duration_days integer NOT NULL CHECK (duration_days > 0),

  -- the tourist gives some extra details about the trip in the proposal,  
  additional_details text,

  total_quoted_price numeric(12, 2) CHECK (total_quoted_price IS NULL OR total_quoted_price >= 0),
  prepay_required numeric(12, 2) CHECK (prepay_required IS NULL OR prepay_required >= 0),
  
  -- these are the remarks the tourist gave on approval
  -- if tourist approves then this is must be set else the tourist_cancellation_remarks must be set
  -- these remarks can be null in pending staus but onnce the proposal is accepted or cancelled by tourist, one of these must be set
  tourist_approval_remarks text,
  tourist_cancellation_remarks text,

  -- simialr to the above guide can also give remarks on rejection why he rejected the tourists proposal,
  -- if he accepts the proposal then it will be stored in the guide_terms field
  -- but if he  rejects then it is stored in the guide_rejection_remarks field, 
  -- and if he hasnt responded yet then both will be null
  guide_cancellation_remarks text,

  -- these are the terms offered by the guide in response to the proposal,  
  -- can be null if guide rejects or hasn't responded yet
  guide_terms text,  
  status proposal_status NOT NULL DEFAULT 'sent_by_tourist',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT hiring_proposals_price_guard
    CHECK (
      prepay_required IS NULL
      OR total_quoted_price IS NULL
      OR prepay_required <= total_quoted_price
    )
);

CREATE TABLE public.guide_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid UNIQUE NOT NULL REFERENCES public.hiring_proposals(id) ON DELETE RESTRICT,
  tourist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE RESTRICT,

  final_amount numeric(12, 2) NOT NULL CHECK (final_amount >= 0),
  prepay_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (prepay_amount >= 0),
  paid_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),

  status guide_booking_status NOT NULL DEFAULT 'confirmed',

  trip_start_date date,
  hired_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT guide_bookings_prepay_lte_final CHECK (prepay_amount <= final_amount),
  CONSTRAINT guide_bookings_paid_lte_final CHECK (paid_amount <= final_amount)
);


CREATE TABLE public.package_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.travel_packages(id) ON DELETE RESTRICT,
  tourist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  final_amount numeric(12, 2) NOT NULL CHECK (final_amount >= 0),
  paid_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  participant_count integer NOT NULL DEFAULT 1 CHECK (participant_count > 0),

  status package_booking_status NOT NULL DEFAULT 'confirmed',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT package_bookings_paid_lte_final CHECK (paid_amount <= final_amount)
);

CREATE INDEX idx_package_bookings_tourist ON public.package_bookings(tourist_id, created_at DESC);
CREATE INDEX idx_package_bookings_package ON public.package_bookings(package_id, created_at DESC);
CREATE INDEX idx_package_bookings_status ON public.package_bookings(status);

/*
Meant for admin only and not even admin can edit them

They are supposed to come via WEBHooks from the payment providers and we just store them for record and future references
and also to have the payment status updated in our system in case the provider sends us the update

Rls should be like
if the user is admin or either of tourist or guide releted to the log then he can see them but update is impossible
*/
CREATE TABLE public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_booking_id uuid REFERENCES public.guide_bookings(id) ON DELETE SET NULL,
  package_booking_id uuid REFERENCES public.package_bookings(id) ON DELETE SET NULL,

  tourist_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  provider payment_provider NOT NULL,
  provider_txn_id text,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'NPR',
  status payment_log_status NOT NULL DEFAULT 'pending',
  raw_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT payment_logs_target_guard CHECK (
    (guide_booking_id IS NOT NULL AND package_booking_id IS NULL)
    OR (guide_booking_id IS NULL AND package_booking_id IS NOT NULL)
  )
);

CREATE INDEX idx_payment_logs_tourist ON public.payment_logs(tourist_id, created_at DESC);
CREATE INDEX idx_payment_logs_guide_booking ON public.payment_logs(guide_booking_id, created_at DESC);
CREATE INDEX idx_payment_logs_package_booking ON public.payment_logs(package_booking_id, created_at DESC);
CREATE INDEX idx_payment_logs_provider_txn_id ON public.payment_logs(provider_txn_id);


 CREATE UNIQUE INDEX idx_hiring_proposals_active_pair
  ON public.hiring_proposals(tourist_id, guide_id)
  WHERE status IN ('sent_by_tourist', 'offered_by_guide');

CREATE INDEX idx_hiring_proposals_tourist ON public.hiring_proposals(tourist_id, created_at DESC);
CREATE INDEX idx_hiring_proposals_guide ON public.hiring_proposals(guide_id, created_at DESC);
CREATE INDEX idx_hiring_proposals_status ON public.hiring_proposals(status);
CREATE INDEX idx_guide_bookings_tourist ON public.guide_bookings(tourist_id, created_at DESC);
CREATE INDEX idx_guide_bookings_guide ON public.guide_bookings(guide_id, created_at DESC);
CREATE INDEX idx_guide_bookings_status ON public.guide_bookings(status);

