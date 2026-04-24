import { z } from "zod";
import { Uuid, Timestamp, NonEmptyString } from "../schemas/field-types";
import { GeoPoint } from "../schemas/gis-types";
import {
  GuideApplicationStatus,
  UnsuspensionRequestStatus,
} from "../schemas/enums";

export const GuideServiceAreaApplicationSchema = z.object({
  id: Uuid,
  application_id: Uuid,
  location: GeoPoint,
  radius_meters: z.number().positive(),
  location_name: NonEmptyString,
});
export type GuideServiceAreaApplication = z.infer<
  typeof GuideServiceAreaApplicationSchema
>;

export const GuideApplicationSchema = z.object({
  id: Uuid,
  applicant_id: Uuid,
  description: z.string(),
  previous_experience: z.string().nullable(),
  known_languages: z.array(z.string()),
  status: GuideApplicationStatus,
  admin_feedback: z.string().nullable(),
  created_at: Timestamp,
  updated_at: Timestamp,
  service_areas: z.array(GuideServiceAreaApplicationSchema).default([]),
});
export type GuideApplication = z.infer<typeof GuideApplicationSchema>;

export const UnsuspensionRequestSchema = z.object({
  id: Uuid,
  guide_id: Uuid,
  reason: z.string(),
  status: UnsuspensionRequestStatus,
  admin_feedback: z.string().nullable(),
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type UnsuspensionRequest = z.infer<typeof UnsuspensionRequestSchema>;

export const ApplyGuideApplicationInputSchema = z.object({
  description: NonEmptyString,
  previous_experience: z.string().optional(),
  known_languages: z.array(NonEmptyString).min(1),
  service_areas: z
    .array(
      z.object({
        location: GeoPoint,
        radius_meters: z.number().positive(),
        location_name: NonEmptyString,
      }),
    )
    .min(1),
});
export type ApplyGuideApplicationInput = z.infer<
  typeof ApplyGuideApplicationInputSchema
>;
