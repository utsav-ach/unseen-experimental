import { z } from "zod";
import { Uuid, Timestamp, Rating, NonEmptyString } from "../schemas/field-types";
import { GeoPoint } from "../schemas/gis-types";
import { MinimalUserSchema } from "./user-models";

export const GuideServiceAreaSchema = z.object({
  id: Uuid,
  guide_id: Uuid,
  location: GeoPoint,
  radius_meters: z.number().positive(),
  location_name: NonEmptyString,
});
export type GuideServiceArea = z.infer<typeof GuideServiceAreaSchema>;

export const GuideSchema = z.object({
  id: Uuid,
  description: z.string(),
  previous_experience: z.string().nullable(),
  known_languages: z.array(z.string()),
  admin_feedback: z.string().nullable(),
  is_available: z.boolean(),
  is_suspended: z.boolean(),
  avg_rating: Rating,
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type Guide = z.infer<typeof GuideSchema>;

export const GuideInfoSchema = GuideSchema.extend({
  user: MinimalUserSchema,
  service_areas: z.array(GuideServiceAreaSchema).default([]),
});
export type GuideInfo = z.infer<typeof GuideInfoSchema>;

export const GuideReviewSchema = z.object({
  id: Uuid,
  guide_id: Uuid,
  reviewer_id: Uuid,
  rating: Rating,
  review_text: z.string().nullable(),
  created_at: Timestamp,
});
export type GuideReview = z.infer<typeof GuideReviewSchema>;

export const SuspendedGuideSchema = z.object({
  id: Uuid,
  guide_id: Uuid,
  reason: z.string(),
  suspended_at: Timestamp,
  suspended_by: Uuid,
  lifted_at: Timestamp.nullable(),
});
export type SuspendedGuide = z.infer<typeof SuspendedGuideSchema>;
