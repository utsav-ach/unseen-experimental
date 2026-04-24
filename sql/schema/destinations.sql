-- Base destination is the places where we can have travels,
-- these are the most popular places which are loved by tourists or admins
-- Think of it like in google maps, we can see our home only if we set it,  thats the same concept
CREATE TABLE public.base_destination (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,

  coordinates geography(POINT, 4326) NOT NULL,
  radius numeric DEFAULT 25 NOT NULL CHECK (radius > 0), -- Radius in KM
  
  avg_rating numeric CHECK (avg_rating >= 0 AND avg_rating <= 5),
  
  tags text[] DEFAULT '{}',
  
  description GFM,

  feature_image text, -- Single high-quality overview image
  additional_images jsonb NOT NULL DEFAULT '[]', -- other images which can be used in ui but not in featured bg or list thumbnail

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  possible_activities uuid[] DEFAULT '{}', -- Linked to activities table, list of experiences that can be had at this destination, 


  CONSTRAINT min_one_image CHECK (jsonb_array_length(additional_images) >= 1),
  CONSTRAINT max_ten_images CHECK (jsonb_array_length(additional_images) <= 10)
);

CREATE TABLE public.base_destination_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id uuid REFERENCES public.base_destination(id) ON DELETE CASCADE,
    tourist_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating numeric CHECK (rating >= 0 AND rating <= 5),
    review_text text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- The avg rating should be calculated from reviews via triggers for consistency and actualnes

/*
Activities are just labels for the types of experiences that can be had at a destination. 
They are not tied to specific guides or packages, but rather serve as a way to categorize and filter destinations experience.

*/
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name text NOT NULL UNIQUE,
  description text NOT NULL, -- Just for sake of having it in the db, not  used in the UI at all right now

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


/*
Packages are the pre-defined events for travelers to choose from.
They are directly organized by our company, so there is no need to have negotiations or anything
Just book and be ready to go.

Our company has 2 types of packages:
1. destinations_package : A package where the destination is the main focus. The activities and experiences are built around the destination.
2. activities_package : A package where the activities are the main focus. The destination is built around the activities.

Both have same structure, just the difference is the focus, 
what are we focusing,  is it the destination or the activities, 
*/

CREATE TYPE package_type AS ENUM ('destinations_package', 'activities_package');

CREATE TABLE public.travel_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  
  type package_type NOT NULL,

  -- Financials
  actual_price numeric NOT NULL CHECK (actual_price >= 0),
  discounted_price numeric NOT NULL CHECK (discounted_price >= 0),

  -- the deadline for the discount price, 
  -- after that the discount price will not be applicable,
  discount_deadline timestamptz,

  -- the expiration date of the package, after that the package will not be bookable,
  expiration_date timestamptz,

  
  featured_image text NOT NULL, -- The main image that will be usedd in lists
  additional_images jsonb NOT NULL DEFAULT '[]', -- other images which can be used in ui but not in featured bg or list thumbnail

  total_days integer NOT NULL CHECK (total_days > 0),

  travel_routes text NOT NULL, -- the textual description of the tour, e.g. "Day 1: Arrival and welcome dinner, Day 2: Trek to base camp, Day 3: Summit attempt, Day 4: Return and relaxation"
  description text, -- Main narrative or description of package, we can think it as,  destination info goes in above but here other like,  rules, what to bring,  how to prepare,  etc.
   
  -- if the routes covers any of the featured destinations then we cann link here, 
  -- this is supposed  to be empty most of the times, so in ui be careful
  destinations_covered uuid[] DEFAULT '{}', -- Linked to base_destination table, list of featured destinations that are covered in this package,  this is for the destination packages,  for activities package it can be empty most of the time,  but we keep it for the sake of flexibility and future proofing

  -- Linked to activities table, the activities that are included in this package,  e.g. trekking,  rafting,  etc.
  -- Even in activities packages it can be of many activities, 
  -- in case of travel package we can call it additional_activities_included. 
  included_activities uuid[] DEFAULT '{}', 

  -- this is for the activities_package,  to know what is the main activity of the package,  e.g. trekking,  rafting,  etc.
  -- Not supposed to be for the destinations_package,
  -- only and only for the activities_package,  
  main_activity uuid REFERENCES public.activities(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints for Quality Control
  CONSTRAINT max_twenty_images CHECK (jsonb_array_length(additional_images) <= 20)
);

-- Keep destination average rating in sync with reviews
CREATE OR REPLACE FUNCTION public.update_base_destination_avg_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_destination_id uuid;
BEGIN
  v_destination_id := COALESCE(NEW.destination_id, OLD.destination_id);

  IF v_destination_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.base_destination bd
  SET avg_rating = (
    SELECT ROUND(AVG(r.rating)::numeric, 2)
    FROM public.base_destination_reviews r
    WHERE r.destination_id = v_destination_id
  )
  WHERE bd.id = v_destination_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;



DROP TRIGGER IF EXISTS trg_update_base_destination_avg_rating ON public.base_destination_reviews;
CREATE TRIGGER trg_update_base_destination_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON public.base_destination_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_base_destination_avg_rating();


-- 4. Indexes for Performant discovery
CREATE INDEX idx_travel_packages_destinations_covered ON public.travel_packages(destinations_covered);
CREATE INDEX idx_travel_packages_type ON public.travel_packages(type);
CREATE INDEX idx_travel_packages_expiration_date ON public.travel_packages(expiration_date);
CREATE INDEX idx_travel_packages_main_activity ON public.travel_packages(main_activity);

-- Indexes
CREATE INDEX idx_base_destination_coordinates ON public.base_destination USING GIST (coordinates);
CREATE INDEX idx_base_destination_reviews_destination_id ON public.base_destination_reviews(destination_id);
CREATE INDEX idx_base_destination_possible_activities ON public.base_destination USING GIN (possible_activities);



/*
We have following modules::
1. Destinations:  
  - THey contains base destinations
  - packages

2. Guides:
  - They are the ones who provide the services to the tourists,  

3. Stories:
  - This is combine of 2 things
  - photos, stories

4. Admin::
  - While technically admin is a role we consider it as a module here
  - THese includes just admin releted works
  - Some actions or things are only for admin e.g guide application approval, suspension etc.

5. Bookings:
  - While you may consider booking as releted to guide or destination but we consider it as a module
  - it contains all the booking releted things,  e.g. booking guide,  booking packages,   etc.
  - this is the only module that should handle the money releted things,  e.g. payment, etc

6. Users:
  - This is the module for the users,  it contains all the user releted things
  - technically it is the base module around which the other modules revolves
  - but this module just contains the user and profile releted things,

7. Applications:
  - THis is the mdule for applications where different applications releted things are handled
  - while technically we can assign these to their respective modules but we decided to make it a seperate module
  - it contains guide application,  unsuspension application,  etc.

But in some entities the module classification is hard, we may get confused on where to place it, 
e.g, guide profile, it is releted to guide but it is also releted to user,  
Dont worry in such case just think and decide in which module it is deeply releted and place it there 
you are never wrong in such case.

*/
