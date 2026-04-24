import z from "zod";
import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import { Validator } from "@/supabase/services/validator";
import {
	AcceptHiringProposalAndCreateBookingParamsSchema,
	AcceptHiringProposalAndCreateBookingResultSchema,
	CancelHiringProposalParamsSchema,
	CreateHiringProposalParamsSchema,
	CreateHiringProposalResultSchema,
	CreatePackageBookingParamsSchema,
	CreatePackageBookingResultSchema,
	GuideBookingInfo,
	GuideBookingInfoSchema,
	GuideBookingRequest,
	GuideBookingRequestSchema,
	PackageBookingInfo,
	PackageBookingInfoSchema,
	RejectHiringProposalParamsSchema,
	SubmitGuideOfferParamsSchema,
} from "../models";

export type GuideBookingRequestListOptions = {
	touristId?: string;
	guideId?: string;
	status?: "pending" | "approved" | "rejected" | "confirmed" | "cancelled";
	sortBy?: "created_at" | "updated_at";
	limit?: number;
	offset?: number;
};

export type GuideBookingInfoListOptions = {
	touristId?: string;
	guideId?: string;
	status?: "confirmed" | "completed" | "cancelled";
	sortBy?: "hired_at";
	limit?: number;
	offset?: number;
};

export type PackageBookingInfoListOptions = {
	touristId?: string;
	packageId?: string;
	status?: "confirmed" | "completed" | "cancelled";
	sortBy?: "created_at";
	limit?: number;
	offset?: number;
};

export class BookingService extends SupabaseServiceV2 {
	public static async getGuideBookingRequests(
		options?: GuideBookingRequestListOptions,
	): Promise<GuideBookingRequest[]> {
		const supabase = await this.getClient();
		let query = supabase.from("guide_booking_requests").select("*");

		if (options?.touristId) {
			query = query.eq("tourist_id", options.touristId);
		}

		if (options?.guideId) {
			query = query.eq("guide_id", options.guideId);
		}

		if (options?.status) {
			query = query.eq("status", options.status);
		}

		switch (options?.sortBy) {
			case "updated_at":
				query = query.order("updated_at", { ascending: false });
				break;
			case "created_at":
			default:
				query = query.order("created_at", { ascending: false });
		}

		if (options?.limit && options.limit > 0) {
			query = query.limit(options.limit);
		}

		if (options?.offset !== undefined && options.offset >= 0) {
			const effectiveLimit =
				options.limit && options.limit > 0 ? options.limit : 20;
			query = query.range(
				options.offset,
				options.offset + effectiveLimit - 1,
			);
		}

		return await this.query(
			() => query,
			z.array(GuideBookingRequestSchema),
			"GET_GUIDE_BOOKING_REQUESTS",
		);
	}

	public static async getGuideBookingsInfo(
		options?: GuideBookingInfoListOptions,
	): Promise<GuideBookingInfo[]> {
		const supabase = await this.getClient();
		let query = supabase.from("guide_bookings_info").select("*");

		if (options?.touristId) {
			query = query.eq("tourist_id", options.touristId);
		}

		if (options?.guideId) {
			query = query.eq("guide_id", options.guideId);
		}

		if (options?.status) {
			query = query.eq("status", options.status);
		}

		query = query.order("hired_at", { ascending: false });

		if (options?.limit && options.limit > 0) {
			query = query.limit(options.limit);
		}

		if (options?.offset !== undefined && options.offset >= 0) {
			const effectiveLimit =
				options.limit && options.limit > 0 ? options.limit : 20;
			query = query.range(
				options.offset,
				options.offset + effectiveLimit - 1,
			);
		}

		return await this.query(
			() => query,
			z.array(GuideBookingInfoSchema),
			"GET_GUIDE_BOOKINGS_INFO",
		);
	}

	public static async getPackageBookingsInfo(
		options?: PackageBookingInfoListOptions,
	): Promise<PackageBookingInfo[]> {
		const supabase = await this.getClient();
		let query = supabase.from("package_bookings_info").select("*");

		if (options?.touristId) {
			query = query.eq("tourist_id", options.touristId);
		}

		if (options?.packageId) {
			query = query.eq("package_id", options.packageId);
		}

		if (options?.status) {
			query = query.eq("booking_status", options.status);
		}

		query = query.order("created_at", { ascending: false });

		if (options?.limit && options.limit > 0) {
			query = query.limit(options.limit);
		}

		if (options?.offset !== undefined && options.offset >= 0) {
			const effectiveLimit =
				options.limit && options.limit > 0 ? options.limit : 20;
			query = query.range(
				options.offset,
				options.offset + effectiveLimit - 1,
			);
		}

		return await this.query(
			() => query,
			z.array(PackageBookingInfoSchema),
			"GET_PACKAGE_BOOKINGS_INFO",
		);
	}

	public static async createHiringProposal(params: {
		p_guide_id: string;
		p_destinations: string;
		p_people_count: number;
		p_duration_days: number;
		p_additional_details?: string | null;
		p_tourist_remarks?: string | null;
	}): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			CreateHiringProposalParamsSchema,
			"CreateHiringProposalParamsSchema",
		);

		return await this.callRpc(
			"create_hiring_proposal",
			CreateHiringProposalResultSchema,
			payload,
		);
	}

	public static async submitGuideOffer(params: {
		p_proposal_id: string;
		p_total_quoted_price: number;
		p_prepay_required: number;
		p_guide_remarks: string;
	}): Promise<void> {
		const payload = Validator.validateAgainstSchema(
			params,
			SubmitGuideOfferParamsSchema,
			"SubmitGuideOfferParamsSchema",
		);
		await this.callRpc("submit_guide_offer", z.null(), payload);
	}

	public static async rejectHiringProposal(params: {
		p_proposal_id: string;
		p_guide_remarks?: string | null;
		p_tourist_remarks?: string | null;
	}): Promise<void> {
		const payload = Validator.validateAgainstSchema(
			params,
			RejectHiringProposalParamsSchema,
			"RejectHiringProposalParamsSchema",
		);
		await this.callRpc("reject_hiring_proposal", z.null(), payload);
	}

	public static async cancelHiringProposal(params: {
		p_proposal_id: string;
		p_tourist_remarks?: string | null;
	}): Promise<void> {
		const payload = Validator.validateAgainstSchema(
			params,
			CancelHiringProposalParamsSchema,
			"CancelHiringProposalParamsSchema",
		);
		await this.callRpc("cancel_hiring_proposal", z.null(), payload);
	}

	public static async acceptHiringProposalAndCreateBooking(params: {
		p_proposal_id: string;
		p_tourist_remarks?: string | null;
		p_payment_provider?:
			| "esewa"
			| "khalti"
			| "stripe"
			| "paypal"
			| "card"
			| "cash";
		p_paid_amount?: number | null;
		p_provider_txn_id?: string | null;
		p_raw_response?: Record<string, unknown>;
	}) {
		const payload = Validator.validateAgainstSchema(
			params,
			AcceptHiringProposalAndCreateBookingParamsSchema,
			"AcceptHiringProposalAndCreateBookingParamsSchema",
		);
		return await this.callRpc(
			"accept_hiring_proposal_and_create_booking",
			AcceptHiringProposalAndCreateBookingResultSchema,
			payload,
		);
	}

	public static async createPackageBooking(params: {
		p_package_id: string;
		p_payment_provider?:
			| "esewa"
			| "khalti"
			| "stripe"
			| "paypal"
			| "card"
			| "cash";
		p_paid_amount?: number | null;
		p_participant_count?: number;
		p_provider_txn_id?: string | null;
		p_raw_response?: Record<string, unknown>;
	}) {
		const payload = Validator.validateAgainstSchema(
			params,
			CreatePackageBookingParamsSchema,
			"CreatePackageBookingParamsSchema",
		);
		return await this.callRpc(
			"create_package_booking",
			CreatePackageBookingResultSchema,
			payload,
		);
	}
}
