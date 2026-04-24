import { z } from "zod";
import { Uuid, Timestamp, Rating, Money, NonEmptyString } from "../schemas/field-types";
import { GeoPoint } from "../schemas/gis-types";
import { TravelPackageType } from "../schemas/enums";

export const BaseDestinationSchema = z.object({
  id: Uuid,
  name: NonEmptyString,
  coordinates: GeoPoint,
  radius: z.number().positive(),
  avg_rating: Rating,
  tags: z.array(z.string()),
  description: z.string(),
  feature_image: z.string().nullable(),
  additional_images: z.array(z.string()),
  possible_activities: z.array(Uuid),
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type BaseDestination = z.infer<typeof BaseDestinationSchema>;

export const DestinationSchema = BaseDestinationSchema.extend({
  activities: z
    .array(
      z.object({
        id: Uuid,
        name: NonEmptyString,
        icon: z.string().nullable(),
      }),
    )
    .default([]),
});
export type Destination = z.infer<typeof DestinationSchema>;

export const DestinationReviewSchema = z.object({
  id: Uuid,
  destination_id: Uuid,
  reviewer_id: Uuid,
  rating: Rating,
  review_text: z.string().nullable(),
  created_at: Timestamp,
  reviewer_username: z.string().nullable(),
  reviewer_avatar_url: z.string().nullable(),
});
export type DestinationReview = z.infer<typeof DestinationReviewSchema>;

export const ActivitySchema = z.object({
  id: Uuid,
  name: NonEmptyString,
  icon: z.string().nullable(),
  description: z.string().nullable(),
  feature_image: z.string().nullable(),
  created_at: Timestamp,
});
export type Activity = z.infer<typeof ActivitySchema>;

export const TravelPackageSchema = z.object({
  id: Uuid,
  name: NonEmptyString,
  type: TravelPackageType,
  actual_price: Money,
  discounted_price: Money.nullable(),
  discount_deadline: Timestamp.nullable(),
  expiration_date: Timestamp.nullable(),
  featured_image: z.string().nullable(),
  additional_images: z.array(z.string()),
  total_days: z.number().int().positive(),
  travel_routes: z.array(z.string()),
  description: z.string(),
  destinations_covered: z.array(Uuid),
  included_activities: z.array(Uuid),
  main_activity: Uuid.nullable(),
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type TravelPackage = z.infer<typeof TravelPackageSchema>;
