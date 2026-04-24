import { z } from "zod";
import { Uuid, Timestamp, NonEmptyString } from "../schemas/field-types";
import { GeoPoint } from "../schemas/gis-types";

export const ProfileSchema = z.object({
  id: Uuid,
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  username: NonEmptyString,
  phone_number: z.string().nullable(),
  emergency_contact: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_admin: z.boolean(),
  is_guide: z.boolean(),
  is_guide_applicantion_pending: z.boolean(),
  is_onboarding_complete: z.boolean(),
  home_location: GeoPoint.nullable(),
  home_location_name: z.string().nullable(),
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type Profile = z.infer<typeof ProfileSchema>;

export const MinimalUserSchema = z.object({
  id: Uuid,
  username: NonEmptyString,
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
});
export type MinimalUser = z.infer<typeof MinimalUserSchema>;

export const CompleteOnboardingInputSchema = z.object({
  first_name: NonEmptyString,
  middle_name: z.string().nullable().optional(),
  last_name: NonEmptyString,
  username: NonEmptyString,
  phone_number: z.string().nullable().optional(),
  emergency_contact: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  home_location: GeoPoint.nullable().optional(),
  home_location_name: z.string().nullable().optional(),
});
export type CompleteOnboardingInput = z.infer<
  typeof CompleteOnboardingInputSchema
>;
