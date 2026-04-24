import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import { Validator } from "@/supabase/services/validator";
import z from "zod";
import { f } from "../schemas";
import {
	AdminBookingNegotiationQueueItem,
	AdminBookingNegotiationQueueItemSchema,
	AdminCreateActivityParams,
	AdminCreateActivityParamsSchema,
	AdminCreateBaseDestinationParams,
	AdminCreateBaseDestinationParamsSchema,
	AdminCreateTravelPackageParams,
	AdminCreateTravelPackageParamsSchema,
	AdminDeleteActivityParams,
	AdminDeleteActivityParamsSchema,
	AdminDeleteBaseDestinationParams,
	AdminDeleteBaseDestinationParamsSchema,
	AdminDeleteResult,
	AdminDeleteResultSchema,
	AdminDeleteTravelPackageParams,
	AdminDeleteTravelPackageParamsSchema,
	AdminJsonbRowResult,
	AdminJsonbRowResultSchema,
	AdminPackageBookingRequest,
	AdminPackageBookingRequestSchema,
	AdminPackageHealthQueueItem,
	AdminPackageHealthQueueItemSchema,
	AdminPaymentReviewQueueItem,
	AdminPaymentReviewQueueItemSchema,
	AdminPendingGuideApplication,
	AdminPendingGuideApplicationSchema,
	AdminPendingUnsuspensionRequest,
	AdminPendingUnsuspensionRequestSchema,
	AdminSystemOverview,
	AdminSystemOverviewSchema,
	AdminUpdateActivityParams,
	AdminUpdateActivityParamsSchema,
	AdminUpdateBaseDestinationParams,
	AdminUpdateBaseDestinationParamsSchema,
	AdminUpdateTravelPackageParams,
	AdminUpdateTravelPackageParamsSchema,
	BuildAdminAnalyticsPayloadParams,
	BuildAdminAnalyticsPayloadParamsSchema,
	BuildAdminAnalyticsPayloadResult,
	BuildAdminAnalyticsPayloadResultSchema,
	CaptureAdminAnalyticsSnapshotParams,
	CaptureAdminAnalyticsSnapshotParamsSchema,
	CaptureAllAdminAnalyticsSnapshotsResult,
	CaptureAllAdminAnalyticsSnapshotsResultSchema,
	ChangeGuideApplicationStatusParams,
	ChangeGuideApplicationStatusParamsSchema,
	ChangeGuideApplicationStatusResult,
	ChangeGuideApplicationStatusResultSchema,
	ChangeGuideSuspendStatusParams,
	ChangeGuideSuspendStatusParamsSchema,
	ChangeGuideSuspendStatusResult,
	ChangeGuideSuspendStatusResultSchema,
} from "../models";

export class AdminService extends SupabaseServiceV2 {
	private static applyPagination<
		TQuery extends {
			limit: (
				count: number,
				options?: { foreignTable?: string; referencedTable?: string },
			) => TQuery;
			range: (
				from: number,
				to: number,
				options?: { foreignTable?: string; referencedTable?: string },
			) => TQuery;
		},
	>(query: TQuery, options?: { limit?: number; offset?: number }): TQuery {
		const limit = options?.limit;
		const offset = options?.offset;

		if (limit && limit > 0) {
			query = query.limit(limit);
		}

		if (offset !== undefined && offset >= 0) {
			const effectiveLimit = limit && limit > 0 ? limit : 20;
			query = query.range(offset, offset + effectiveLimit - 1);
		}

		return query;
	}

	public static async getPendingGuideApplications(options?: {
		limit?: number;
		offset?: number;
	}): Promise<AdminPendingGuideApplication[]> {
		const supabase = await this.getClient();
		let query = supabase
			.from("admin_pending_guide_applications")
			.select("*")
			.order("created_at", { ascending: true });

		query = this.applyPagination(query, options);

		return this.query(
			() => query,
			z.array(AdminPendingGuideApplicationSchema),
			"GET_ADMIN_PENDING_GUIDE_APPLICATIONS",
		);
	}

	public static async getPendingUnsuspensionRequests(options?: {
		limit?: number;
		offset?: number;
	}): Promise<AdminPendingUnsuspensionRequest[]> {
		const supabase = await this.getClient();
		let query = supabase
			.from("admin_pending_unsuspension_requests")
			.select("*")
			.order("created_at", { ascending: true });

		query = this.applyPagination(query, options);

		return this.query(
			() => query,
			z.array(AdminPendingUnsuspensionRequestSchema),
			"GET_ADMIN_PENDING_UNSUSPENSION_REQUESTS",
		);
	}

	public static async getBookingNegotiationQueue(options?: {
		limit?: number;
		offset?: number;
	}): Promise<AdminBookingNegotiationQueueItem[]> {
		const supabase = await this.getClient();
		let query = supabase
			.from("admin_booking_negotiation_queue")
			.select("*")
			.order("created_at", { ascending: false });

		query = this.applyPagination(query, options);

		return this.query(
			() => query,
			z.array(AdminBookingNegotiationQueueItemSchema),
			"GET_ADMIN_BOOKING_NEGOTIATION_QUEUE",
		);
	}

	public static async getPaymentReviewQueue(options?: {
		limit?: number;
		offset?: number;
	}): Promise<AdminPaymentReviewQueueItem[]> {
		const supabase = await this.getClient();
		let query = supabase
			.from("admin_payment_review_queue")
			.select("*")
			.order("created_at", { ascending: false });

		query = this.applyPagination(query, options);

		return this.query(
			() => query,
			z.array(AdminPaymentReviewQueueItemSchema),
			"GET_ADMIN_PAYMENT_REVIEW_QUEUE",
		);
	}

	public static async getPackageHealthQueue(options?: {
		limit?: number;
		offset?: number;
	}): Promise<AdminPackageHealthQueueItem[]> {
		const supabase = await this.getClient();
		let query = supabase
			.from("admin_package_health_queue")
			.select("*")
			.order("updated_at", { ascending: false });

		query = this.applyPagination(query, options);

		return this.query(
			() => query,
			z.array(AdminPackageHealthQueueItemSchema),
			"GET_ADMIN_PACKAGE_HEALTH_QUEUE",
		);
	}

	public static async getPackageBookingRequests(options?: {
		status?: "confirmed" | "completed" | "cancelled";
		packageId?: string;
		limit?: number;
		offset?: number;
	}): Promise<AdminPackageBookingRequest[]> {
		const supabase = await this.getClient();
		let query = supabase.from("admin_package_booking_requests").select("*");

		if (options?.status) {
			query = query.eq("status", options.status);
		}

		if (options?.packageId) {
			query = query.eq("package_id", options.packageId);
		}

		query = query.order("created_at", { ascending: false });
		query = this.applyPagination(query, options);

		return this.query(
			() => query,
			z.array(AdminPackageBookingRequestSchema),
			"GET_ADMIN_PACKAGE_BOOKING_REQUESTS",
		);
	}

	public static async getSystemOverview(): Promise<AdminSystemOverview> {
		const supabase = await this.getClient();

		return this.query(
			() => supabase.from("admin_system_overview").select("*").single(),
			AdminSystemOverviewSchema,
			"GET_ADMIN_SYSTEM_OVERVIEW",
		);
	}

	public static async changeGuideApplicationStatus(
		params: ChangeGuideApplicationStatusParams,
	): Promise<ChangeGuideApplicationStatusResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			ChangeGuideApplicationStatusParamsSchema,
			"ChangeGuideApplicationStatusParamsSchema",
		);
		return await this.callRpc(
			"change_guide_application_status",
			ChangeGuideApplicationStatusResultSchema,
			payload,
		);
	}

	public static async changeGuideSuspendStatus(
		params: ChangeGuideSuspendStatusParams,
	): Promise<ChangeGuideSuspendStatusResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			ChangeGuideSuspendStatusParamsSchema,
			"ChangeGuideSuspendStatusParamsSchema",
		);
		return await this.callRpc(
			"change_guide_suspend_status",
			ChangeGuideSuspendStatusResultSchema,
			payload,
		);
	}

	public static async createBaseDestination(
		params: AdminCreateBaseDestinationParams,
	): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminCreateBaseDestinationParamsSchema,
			"AdminCreateBaseDestinationParamsSchema",
		);

		return this.callRpc("admin_create_base_destination", f.uuid(), {
			...payload,
		});
	}

	public static async updateBaseDestination(
		params: AdminUpdateBaseDestinationParams,
	): Promise<AdminJsonbRowResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminUpdateBaseDestinationParamsSchema,
			"AdminUpdateBaseDestinationParamsSchema",
		);

		return this.callRpc(
			"admin_update_base_destination",
			AdminJsonbRowResultSchema,
			payload,
		);
	}

	public static async deleteBaseDestination(
		params: AdminDeleteBaseDestinationParams,
	): Promise<AdminDeleteResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminDeleteBaseDestinationParamsSchema,
			"AdminDeleteBaseDestinationParamsSchema",
		);

		return this.callRpc(
			"admin_delete_base_destination",
			AdminDeleteResultSchema,
			payload,
		);
	}

	public static async createActivity(
		params: AdminCreateActivityParams,
	): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminCreateActivityParamsSchema,
			"AdminCreateActivityParamsSchema",
		);

		return this.callRpc("admin_create_activity", f.uuid(), payload);
	}

	public static async updateActivity(
		params: AdminUpdateActivityParams,
	): Promise<AdminJsonbRowResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminUpdateActivityParamsSchema,
			"AdminUpdateActivityParamsSchema",
		);

		return this.callRpc(
			"admin_update_activity",
			AdminJsonbRowResultSchema,
			payload,
		);
	}

	public static async deleteActivity(
		params: AdminDeleteActivityParams,
	): Promise<AdminDeleteResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminDeleteActivityParamsSchema,
			"AdminDeleteActivityParamsSchema",
		);

		return this.callRpc(
			"admin_delete_activity",
			AdminDeleteResultSchema,
			payload,
		);
	}

	public static async createTravelPackage(
		params: AdminCreateTravelPackageParams,
	): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminCreateTravelPackageParamsSchema,
			"AdminCreateTravelPackageParamsSchema",
		);

		return this.callRpc("admin_create_travel_package", f.uuid(), payload);
	}

	public static async updateTravelPackage(
		params: AdminUpdateTravelPackageParams,
	): Promise<AdminJsonbRowResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminUpdateTravelPackageParamsSchema,
			"AdminUpdateTravelPackageParamsSchema",
		);

		return this.callRpc(
			"admin_update_travel_package",
			AdminJsonbRowResultSchema,
			payload,
		);
	}

	public static async deleteTravelPackage(
		params: AdminDeleteTravelPackageParams,
	): Promise<AdminDeleteResult> {
		const payload = Validator.validateAgainstSchema(
			params,
			AdminDeleteTravelPackageParamsSchema,
			"AdminDeleteTravelPackageParamsSchema",
		);

		return this.callRpc(
			"admin_delete_travel_package",
			AdminDeleteResultSchema,
			payload,
		);
	}

	public static async buildAdminAnalyticsPayload(
		params?: BuildAdminAnalyticsPayloadParams,
	): Promise<BuildAdminAnalyticsPayloadResult> {
		const payload = params
			? Validator.validateAgainstSchema(
					params,
					BuildAdminAnalyticsPayloadParamsSchema,
					"BuildAdminAnalyticsPayloadParamsSchema",
				)
			: undefined;

		return this.callRpc(
			"build_admin_analytics_payload",
			BuildAdminAnalyticsPayloadResultSchema,
			payload,
		);
	}

	public static async captureAdminAnalyticsSnapshot(
		params: CaptureAdminAnalyticsSnapshotParams,
	): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			CaptureAdminAnalyticsSnapshotParamsSchema,
			"CaptureAdminAnalyticsSnapshotParamsSchema",
		);

		return this.callRpc(
			"capture_admin_analytics_snapshot",
			f.uuid(),
			payload,
		);
	}

	public static async captureAllAdminAnalyticsSnapshots(): Promise<CaptureAllAdminAnalyticsSnapshotsResult> {
		return this.callRpc(
			"capture_all_admin_analytics_snapshots",
			CaptureAllAdminAnalyticsSnapshotsResultSchema,
		);
	}

	public static async runAdminAnalyticsMidnightJob(): Promise<void> {
		await this.callRpc("run_admin_analytics_midnight_job", z.null());
	}

	public static async scheduleAdminAnalyticsMidnightJob(): Promise<string> {
		return this.callRpc(
			"schedule_admin_analytics_midnight_job",
			z.string(),
		);
	}
}
