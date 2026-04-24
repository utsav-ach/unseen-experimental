import { z } from "zod";
import { f, fe, fn } from "../schemas";

/**
 * Admin module schemas (RPC contracts owned by admin workflows)
 */

export const ChangeGuideApplicationStatusParamsSchema = z.object({
	p_application_id: f.uuid(),
	p_status: fe.guideApplicationStatus,
	p_admin_feedback: f.name(),
});

export type ChangeGuideApplicationStatusParams = z.infer<
	typeof ChangeGuideApplicationStatusParamsSchema
>;

export const ChangeGuideApplicationStatusResultSchema = z.object({
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

export type ChangeGuideApplicationStatusResult = z.infer<
	typeof ChangeGuideApplicationStatusResultSchema
>;

export const ChangeGuideSuspendStatusParamsSchema = z.object({
	p_guide_id: f.uuid(),
	p_status: f.bool(),
	p_reason: f.name(),
});

export type ChangeGuideSuspendStatusParams = z.infer<
	typeof ChangeGuideSuspendStatusParamsSchema
>;

export const ChangeGuideSuspendStatusResultSchema = z.object({
	guide_id: f.uuid(),
	suspended: f.bool(),
	reason: f.name(),
});

export type ChangeGuideSuspendStatusResult = z.infer<
	typeof ChangeGuideSuspendStatusResultSchema
>;

const NumericLikeSchema = z
	.union([
		z.number(),
		z
			.string()
			.trim()
			.regex(/^-?\d+(\.\d+)?$/),
	])
	.transform((v) => Number(v));

const IntLikeSchema = z
	.union([z.number().int(), z.string().trim().regex(/^\d+$/)])
	.transform((v) => Number(v));

const JsonRecordSchema = z.record(z.string(), z.unknown());

const RequestedServiceAreaSchema = z.object({
	id: f.uuid(),
	location: z.string(),
	radius_meters: NumericLikeSchema,
	location_name: fn.name(),
	created_at: f.datetime(),
});

const AdminPaymentLogLiteSchema = z.object({
	id: f.uuid(),
	status: fe.paymentLogStatus,
	provider: fe.paymentProvider,
	amount: NumericLikeSchema,
	currency: f.name(),
	created_at: f.datetime(),
});

/**
 * Admin helper view contracts
 */

export const AdminPendingGuideApplicationSchema = z.object({
	application_id: f.uuid(),
	user_id: f.uuid(),
	applicant_name: f.name(),
	applicant_username: fn.username(),
	applicant_avatar_url: fn.url(),
	nid_document_type: fe.nidType,
	nid_number: f.name(),
	nid_photo_url: f.url(),
	description: fn.name(),
	previous_experience: fn.name(),
	known_languages: f.stringArray().default([]),
	status: fe.guideApplicationStatus,
	created_at: f.datetime(),
	updated_at: f.datetime(),
	pending_for: z.string(),
	requested_service_areas: z.array(RequestedServiceAreaSchema).default([]),
});

export type AdminPendingGuideApplication = z.infer<
	typeof AdminPendingGuideApplicationSchema
>;

export const AdminPendingUnsuspensionRequestSchema = z.object({
	request_id: f.uuid(),
	guide_id: f.uuid(),
	guide_name: f.name(),
	guide_username: fn.username(),
	guide_avatar_url: fn.url(),
	clarification: fn.name(),
	status: fe.guideApplicationStatus,
	created_at: f.datetime(),
	updated_at: f.datetime(),
	pending_for: z.string(),
	suspension_id: fn.uuid(),
	latest_suspension_reason: fn.name(),
	suspended_by_admin_id: fn.uuid(),
	suspended_at: fn.datetime(),
});

export type AdminPendingUnsuspensionRequest = z.infer<
	typeof AdminPendingUnsuspensionRequestSchema
>;

export const AdminBookingNegotiationQueueItemSchema = z.object({
	proposal_id: f.uuid(),
	status: fe.proposalStatus,
	created_at: f.datetime(),
	updated_at: f.datetime(),
	age: z.string(),
	destinations: f.name(),
	people_count: IntLikeSchema,
	duration_days: IntLikeSchema,
	additional_details: fn.name(),
	total_quoted_price: fn.money(),
	prepay_required: fn.money(),
	guide_terms: fn.name(),
	guide_cancellation_remarks: fn.name(),
	tourist_approval_remarks: fn.name(),
	tourist_cancellation_remarks: fn.name(),
	tourist_id: f.uuid(),
	tourist_name: f.name(),
	tourist_username: fn.username(),
	guide_id: f.uuid(),
	guide_name: f.name(),
	guide_username: fn.username(),
});

export type AdminBookingNegotiationQueueItem = z.infer<
	typeof AdminBookingNegotiationQueueItemSchema
>;

export const AdminPaymentReviewQueueItemSchema = z.object({
	payment_log_id: f.uuid(),
	status: fe.paymentLogStatus,
	provider: fe.paymentProvider,
	provider_txn_id: fn.name(),
	amount: NumericLikeSchema,
	currency: f.name(),
	created_at: f.datetime(),
	booking_type: z.enum(["guide_booking", "package_booking", "unknown"]),
	guide_booking_id: fn.uuid(),
	package_booking_id: fn.uuid(),
	tourist_id: f.uuid(),
	tourist_name: f.name(),
	tourist_username: fn.username(),
	raw_response: JsonRecordSchema,
});

export type AdminPaymentReviewQueueItem = z.infer<
	typeof AdminPaymentReviewQueueItemSchema
>;

export const AdminPackageHealthQueueItemSchema = z.object({
	package_id: f.uuid(),
	name: f.name(),
	type: fe.packageType,
	actual_price: NumericLikeSchema,
	discounted_price: NumericLikeSchema,
	discount_deadline: fn.datetime(),
	expiration_date: fn.datetime(),
	created_at: f.datetime(),
	updated_at: f.datetime(),
	health_status: z.enum(["no_expiry", "expired", "expiring_soon", "healthy"]),
	booking_count: IntLikeSchema,
	collected_amount: NumericLikeSchema,
});

export type AdminPackageHealthQueueItem = z.infer<
	typeof AdminPackageHealthQueueItemSchema
>;

export const AdminPackageBookingRequestSchema = z.object({
	package_booking_id: f.uuid(),
	package_id: f.uuid(),
	package_name: f.name(),
	package_type: fe.packageType,
	tourist_id: f.uuid(),
	tourist_name: f.name(),
	tourist_username: fn.username(),
	status: fe.packageBookingStatus,
	participant_count: IntLikeSchema,
	final_amount: NumericLikeSchema,
	paid_amount: NumericLikeSchema,
	due_amount: NumericLikeSchema,
	created_at: f.datetime(),
	updated_at: f.datetime(),
	payment_logs: z.array(AdminPaymentLogLiteSchema).nullable().default([]),
});

export type AdminPackageBookingRequest = z.infer<
	typeof AdminPackageBookingRequestSchema
>;

export const AdminSystemOverviewSchema = z.object({
	generated_at: f.datetime(),
	pending_guide_applications: IntLikeSchema,
	pending_unsuspension_requests: IntLikeSchema,
	active_negotiations: IntLikeSchema,
	payment_review_items: IntLikeSchema,
	packages_needing_attention: IntLikeSchema,
	archived_stories: IntLikeSchema,
	currently_suspended_guides: IntLikeSchema,
});

export type AdminSystemOverview = z.infer<typeof AdminSystemOverviewSchema>;

/**
 * Admin destination/activity/package RPC contracts
 */

export const AdminCreateBaseDestinationParamsSchema = z.object({
	p_name: f.name(),
	p_lat: z.number().min(-90).max(90),
	p_lng: z.number().min(-180).max(180),
	p_radius: fn.positiveNumber().default(25),
	p_tags: f.tags().default([]),
	p_description: fn.name(),
	p_feature_image: fn.url(),
	p_additional_images: z.array(f.url()).default([]),
	p_possible_activities: z.array(f.uuid()).default([]),
});

export type AdminCreateBaseDestinationParams = z.infer<
	typeof AdminCreateBaseDestinationParamsSchema
>;

export const AdminUpdateBaseDestinationParamsSchema = z.object({
	p_destination_id: f.uuid(),
	p_name: fn.name(),
	p_lat: z.number().min(-90).max(90).nullable().optional(),
	p_lng: z.number().min(-180).max(180).nullable().optional(),
	p_radius: fn.positiveNumber(),
	p_tags: f.tags().nullable().optional(),
	p_description: fn.name(),
	p_feature_image: fn.url(),
	p_additional_images: z.array(f.url()).nullable().optional(),
	p_possible_activities: z.array(f.uuid()).nullable().optional(),
});

export type AdminUpdateBaseDestinationParams = z.infer<
	typeof AdminUpdateBaseDestinationParamsSchema
>;

export const AdminDeleteBaseDestinationParamsSchema = z.object({
	p_destination_id: f.uuid(),
});

export type AdminDeleteBaseDestinationParams = z.infer<
	typeof AdminDeleteBaseDestinationParamsSchema
>;

export const AdminCreateActivityParamsSchema = z.object({
	p_name: f.name(),
	p_description: f.name(),
});

export type AdminCreateActivityParams = z.infer<
	typeof AdminCreateActivityParamsSchema
>;

export const AdminUpdateActivityParamsSchema = z.object({
	p_activity_id: f.uuid(),
	p_name: fn.name(),
	p_description: fn.name(),
});

export type AdminUpdateActivityParams = z.infer<
	typeof AdminUpdateActivityParamsSchema
>;

export const AdminDeleteActivityParamsSchema = z.object({
	p_activity_id: f.uuid(),
});

export type AdminDeleteActivityParams = z.infer<
	typeof AdminDeleteActivityParamsSchema
>;

export const AdminCreateTravelPackageParamsSchema = z.object({
	p_name: f.name(),
	p_type: fe.packageType,
	p_actual_price: f.money(),
	p_discounted_price: f.money(),
	p_discount_deadline: fn.datetime(),
	p_expiration_date: fn.datetime(),
	p_featured_image: f.url(),
	p_additional_images: z.array(f.url()).default([]),
	p_total_days: z.number().int().positive().default(1),
	p_travel_routes: f.name(),
	p_description: fn.name(),
	p_destinations_covered: z.array(f.uuid()).default([]),
	p_included_activities: z.array(f.uuid()).default([]),
	p_main_activity: fn.uuid(),
});

export type AdminCreateTravelPackageParams = z.infer<
	typeof AdminCreateTravelPackageParamsSchema
>;

export const AdminUpdateTravelPackageParamsSchema = z.object({
	p_package_id: f.uuid(),
	p_name: fn.name(),
	p_type: fe.packageType.nullable().optional(),
	p_actual_price: fn.money(),
	p_discounted_price: fn.money(),
	p_discount_deadline: fn.datetime(),
	p_expiration_date: fn.datetime(),
	p_featured_image: fn.url(),
	p_additional_images: z.array(f.url()).nullable().optional(),
	p_total_days: z.number().int().positive().nullable().optional(),
	p_travel_routes: fn.name(),
	p_description: fn.name(),
	p_destinations_covered: z.array(f.uuid()).nullable().optional(),
	p_included_activities: z.array(f.uuid()).nullable().optional(),
	p_main_activity: fn.uuid(),
});

export type AdminUpdateTravelPackageParams = z.infer<
	typeof AdminUpdateTravelPackageParamsSchema
>;

export const AdminDeleteTravelPackageParamsSchema = z.object({
	p_package_id: f.uuid(),
});

export type AdminDeleteTravelPackageParams = z.infer<
	typeof AdminDeleteTravelPackageParamsSchema
>;

export const AdminDeleteResultSchema = z.object({
	id: f.uuid(),
	deleted: f.bool(),
});

export type AdminDeleteResult = z.infer<typeof AdminDeleteResultSchema>;

export const AdminJsonbRowResultSchema = JsonRecordSchema;
export type AdminJsonbRowResult = z.infer<typeof AdminJsonbRowResultSchema>;

/**
 * Admin analytics RPC contracts
 */

export const BuildAdminAnalyticsPayloadParamsSchema = z.object({
	p_days: z.number().int().positive().default(1),
});

export type BuildAdminAnalyticsPayloadParams = z.infer<
	typeof BuildAdminAnalyticsPayloadParamsSchema
>;

export const BuildAdminAnalyticsPayloadResultSchema = JsonRecordSchema;
export type BuildAdminAnalyticsPayloadResult = z.infer<
	typeof BuildAdminAnalyticsPayloadResultSchema
>;

export const CaptureAdminAnalyticsSnapshotParamsSchema = z.object({
	p_type: z.enum(["daily", "triday", "weekly"]),
	p_days: z.number().int().positive().nullable().optional(),
});

export type CaptureAdminAnalyticsSnapshotParams = z.infer<
	typeof CaptureAdminAnalyticsSnapshotParamsSchema
>;

export const CaptureAllAdminAnalyticsSnapshotsResultSchema = z.object({
	daily: f.uuid(),
	triday: f.uuid(),
	weekly: f.uuid(),
	captured_at: f.datetime(),
});

export type CaptureAllAdminAnalyticsSnapshotsResult = z.infer<
	typeof CaptureAllAdminAnalyticsSnapshotsResultSchema
>;
