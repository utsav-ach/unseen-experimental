import { z } from "zod";
import { f, fe, fn } from "../schemas";

/**
 * Bookings module schemas
 * Views
 */

export const PaymentLogSchema = z.object({
	status: z.enum(["pending", "succeeded", "failed", "refunded"]),
	provider: z.enum(["esewa", "khalti", "stripe", "paypal", "card", "cash"]),
	currency: z.string(),
	created_at: f.datetime(),
});

export const GuideBookingRequestSchema = z.object({
	id: f.uuid(),

	tourist_id: f.uuid(),
	guide_id: f.uuid(),

	destinations: z.string(),
	people_count: z.number().int().positive(),
	duration_days: z.number().int().positive(),

	additional_details: fn.name(),

	status: z.enum([
		"pending",
		"approved",
		"rejected",
		"confirmed",
		"cancelled",
	]),

	total_cost: fn.money(),
	prepay_amount: fn.money(),

	guide_remarks: fn.name(),
	tourist_remarks: fn.name(),

	created_at: f.datetime(),
	updated_at: f.datetime(),
});

export type GuideBookingRequest = z.infer<typeof GuideBookingRequestSchema>;

export const GuideBookingInfoSchema = z.object({
	id: f.uuid(),

	tourist_id: f.uuid(),
	guide_id: f.uuid(),

	trip_start_date: z.string().date().nullable(),

	total_amount: f.money(),

	message: fn.name(),

	status: z.enum(["confirmed", "completed", "cancelled"]),

	hired_at: f.datetime(),

	destination_name: z.string(),
	is_payment_received: f.bool(),
	payment_logs: z.array(PaymentLogSchema).nullable().default([]),
});
export type GuideBookingInfo = z.infer<typeof GuideBookingInfoSchema>;

export const PackageBookingInfoSchema = z.object({
	id: f.uuid(),

	tourist_id: f.uuid(),
	package_id: f.uuid(),

	participant_count: z.number().int().positive(),

	total_amount: f.money(),

	booking_status: z.enum(["confirmed", "completed", "cancelled"]),

	created_at: f.datetime(),
	updated_at: f.datetime(),

	payment_logs: z.array(PaymentLogSchema).nullable().default([]),
});

export type PackageBookingInfo = z.infer<typeof PackageBookingInfoSchema>;

/**
 * RPC params + results
 */

export const CreateHiringProposalParamsSchema = z.object({
	p_guide_id: f.uuid(),
	p_destinations: f.name(),
	p_people_count: f.positiveNumber(),
	p_duration_days: f.positiveNumber(),
	p_additional_details: fn.name(),
	p_tourist_remarks: fn.name(),
});

export const CreateHiringProposalResultSchema = f.uuid();

export const SubmitGuideOfferParamsSchema = z.object({
	p_proposal_id: f.uuid(),
	p_total_quoted_price: f.money(),
	p_prepay_required: f.money(),
	p_guide_remarks: f.name(),
});

export const RejectHiringProposalParamsSchema = z.object({
	p_proposal_id: f.uuid(),
	p_guide_remarks: fn.name(),
	p_tourist_remarks: fn.name(),
});

export const CancelHiringProposalParamsSchema = z.object({
	p_proposal_id: f.uuid(),
	p_tourist_remarks: fn.name(),
});

export const AcceptHiringProposalAndCreateBookingParamsSchema = z.object({
	p_proposal_id: f.uuid(),
	p_tourist_remarks: fn.name(),
	p_payment_provider: fe.paymentProvider.default("cash"),
	p_paid_amount: fn.money(),
	p_provider_txn_id: fn.name(),
	p_raw_response: z.record(z.string(), z.unknown()).optional(),
});

export const AcceptHiringProposalAndCreateBookingResultSchema = z.object({
	booking_id: f.uuid(),
	proposal_id: f.uuid(),
	paid_amount: f.money(),
	final_amount: f.money(),
	status: fe.guideBookingStatus,
});

export const CreatePackageBookingParamsSchema = z.object({
	p_package_id: f.uuid(),
	p_payment_provider: fe.paymentProvider.default("cash"),
	p_paid_amount: fn.money(),
	p_participant_count: z.number().int().positive().default(1),
	p_provider_txn_id: fn.name(),
	p_raw_response: z.record(z.string(), z.unknown()).optional(),
});

export const CreatePackageBookingResultSchema = z.object({
	package_booking_id: f.uuid(),
	package_id: f.uuid(),
	final_amount: f.money(),
	paid_amount: f.money(),
	status: fe.packageBookingStatus,
});
