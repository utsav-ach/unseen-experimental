/**
 * THis file contains the models releted to the guide module
 *
 */
import { z } from "zod";
import { f, fe, fn } from "../schemas";

/**
 * As the name suggests its internal and just contains the profile info for the current authenticated user
 *
 * Not at all intended to use in public places like cards and ui (except profile page)
 *
 */

export const GuideServiceAreaSchema = z.object({
	id: f.uuid(),

	location: f.gis(), // → { lat, lng }
	radius_meters: f.positiveNumber(),

	location_name: f.name(),
	created_at: f.datetime(),
});

export const GuideInfoSchema = z.object({
	id: f.uuid(),

	full_name: z.string(), // comes from SQL COALESCE
	username: fn.username(),
	avatar_url: fn.url(),

	avg_rating: f.ratings(),

	description: fn.name(),
	previous_experience: fn.name(),

	known_languages: z.array(z.string()).default([]),

	is_available: f.bool(),
	service_areas: z.array(GuideServiceAreaSchema).default([]),
});

export type GuideInfo = z.infer<typeof GuideInfoSchema>;

/**
 * Internal-only guide profile contract.
 * `profile` must match `GuideInfoSchema` exactly.
 */
export const GuideProfileSchema = z.object({
	profile: GuideInfoSchema,
	admin_feedback: fn.name(),
	is_suspended: f.bool(),
	suspension_reason: fn.name().optional(),
});

export type GuideProfile = z.infer<typeof GuideProfileSchema>;

/**
 * The following are the input validation schemas
 * THese are in exact format the backend or postgres expects
 *
 * It is exact and also has p_ prefix
 *
 */

export const GuideServiceAreasInputSchema = z.array(
	z.object({
		lat: z.number(),
		lng: z.number(),
		radius_meters: z.number().optional(),
		location_name: z.string().optional(),
	}),
);

export const GuideApplicationParamsSchema = z.object({
	p_nid_document_type: fe.nidType,

	p_nid_number: z.string().trim(),
	p_nid_photo_url: f.url(),

	p_description: f.name(),
	p_previous_experience: f.name(),

	p_known_languages: f.stringArray().default([]),

	p_service_areas: GuideServiceAreasInputSchema.default([]),
});

export type GuideApplicationParams = z.infer<
	typeof GuideApplicationParamsSchema
>;

export const GuideApplicationStatusChangeParamsSchema = z.object({
	p_application_id: f.uuid(),

	p_status: fe.guideApplicationStatus,

	p_admin_feedback: fn.name(),
});

export type GuideApplicationStatusChangeParams = z.infer<
	typeof GuideApplicationStatusChangeParamsSchema
>;

export const GuideSuspendStatusParamsSchema = z.object({
	p_guide_id: f.uuid(),
	p_status: f.bool(), // true = suspend, false = unsuspend
	p_reason: fn.name(),
});

export type GuideSuspendStatusParams = z.infer<
	typeof GuideSuspendStatusParamsSchema
>;

export const GuideReviewParamsSchema = z.object({
	p_guide_id: f.uuid(),
	p_rating: f.ratings(),
	p_review_text: fn.name(),
});
