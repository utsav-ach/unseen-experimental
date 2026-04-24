import { z } from "zod";
import { f, fe, fn } from "../schemas";

/**
 * Applications module schemas
 * Includes guide applications + related application tables and RPC contracts.
 */

export const GuideApplicationSchema = z.object({
	application_id: f.uuid(),
	user_id: f.uuid(),
	nid_document_type: fe.nidType,
	nid_number: f.name(),
	nid_photo_url: f.url(),
	description: fn.name(),
	previous_experience: fn.name(),
	known_languages: f.stringArray().default([]),
	status: fe.guideApplicationStatus,
	admin_feedback: fn.name(),
	created_at: f.datetime(),
	updated_at: f.datetime(),
});

export type GuideApplication = z.infer<typeof GuideApplicationSchema>;

export const GuideServiceAreaApplicationSchema = z.object({
	id: f.uuid(),
	application_id: f.uuid(),
	location: f.gis(),
	radius_meters: f.positiveNumber(),
	location_name: fn.name(),
	created_at: f.datetime(),
});

export type GuideServiceAreaApplication = z.infer<
	typeof GuideServiceAreaApplicationSchema
>;

export const UnsuspensionRequestSchema = z.object({
	id: f.uuid(),
	guide_id: f.uuid(),
	clarification: fn.name(),
	status: fe.guideApplicationStatus,
	admin_feedback: fn.name(),
	reviewed_by: fn.uuid(),
	reviewed_at: fn.datetime(),
	created_at: f.datetime(),
	updated_at: f.datetime(),
});

export type UnsuspensionRequest = z.infer<typeof UnsuspensionRequestSchema>;

/**
 * RPC params/results
 */

export const GuideServiceAreasInputSchema = z.array(
	z.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
		radius_meters: z.number().positive().optional(),
		location_name: z.string().trim().optional(),
	}),
);

export const ApplyGuideApplicationParamsSchema = z.object({
	p_nid_document_type: fe.nidType,
	p_nid_number: f.name(),
	p_nid_photo_url: f.url(),
	p_description: fn.name(),
	p_previous_experience: fn.name(),
	p_known_languages: f.stringArray().default([]),
	p_service_areas: GuideServiceAreasInputSchema.default([]),
});

export type ApplyGuideApplicationParams = z.infer<
	typeof ApplyGuideApplicationParamsSchema
>;

export const ApplyGuideApplicationResultSchema = f.uuid();

export const ChangeGuideApplicationStatusParamsSchema = z.object({
	p_application_id: f.uuid(),
	p_status: fe.guideApplicationStatus,
	p_admin_feedback: f.name(),
});

export type ChangeGuideApplicationStatusParams = z.infer<
	typeof ChangeGuideApplicationStatusParamsSchema
>;

export const ChangeGuideApplicationStatusResultSchema = GuideApplicationSchema;
