import z from "zod";
import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import { Validator } from "@/supabase/services/validator";
import {
	ApplyGuideApplicationParams,
	ApplyGuideApplicationParamsSchema,
	ApplyGuideApplicationResultSchema,
	ChangeGuideApplicationStatusParams,
	ChangeGuideApplicationStatusParamsSchema,
	ChangeGuideApplicationStatusResultSchema,
	GuideApplication,
	GuideApplicationSchema,
	GuideServiceAreaApplication,
	GuideServiceAreaApplicationSchema,
	UnsuspensionRequest,
	UnsuspensionRequestSchema,
} from "../models";
import { fe } from "../schemas";

export type GuideApplicationListOptions = {
	userId?: string;
	status?: z.infer<typeof fe.guideApplicationStatus>;
	limit?: number;
	offset?: number;
};

export type UnsuspensionRequestListOptions = {
	guideId?: string;
	status?: z.infer<typeof fe.guideApplicationStatus>;
	limit?: number;
	offset?: number;
};

export class ApplicationService extends SupabaseServiceV2 {
	public static async applyGuideApplication(
		params: ApplyGuideApplicationParams,
	): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			ApplyGuideApplicationParamsSchema,
			"ApplyGuideApplicationParamsSchema",
		);
		return await this.callRpc(
			"apply_guide_application",
			ApplyGuideApplicationResultSchema,
			payload,
		);
	}

	public static async changeGuideApplicationStatus(
		params: ChangeGuideApplicationStatusParams,
	): Promise<GuideApplication> {
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

	public static async getGuideApplications(
		options?: GuideApplicationListOptions,
	): Promise<GuideApplication[]> {
		const supabase = await this.getClient();
		let query = supabase.from("guide_applications").select("*");

		if (options?.userId) {
			query = query.eq("user_id", options.userId);
		}

		if (options?.status) {
			query = query.eq("status", options.status);
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
			z.array(GuideApplicationSchema),
			"GET_GUIDE_APPLICATIONS",
		);
	}

	public static async getGuideApplicationById(
		applicationId: string,
	): Promise<GuideApplication> {
		const supabase = await this.getClient();
		return await this.query(
			() =>
				supabase
					.from("guide_applications")
					.select("*")
					.eq("application_id", applicationId)
					.single(),
			GuideApplicationSchema,
			"GET_GUIDE_APPLICATION_BY_ID",
		);
	}

	public static async getGuideApplicationServiceAreas(
		applicationId: string,
	): Promise<GuideServiceAreaApplication[]> {
		const supabase = await this.getClient();
		return await this.query(
			() =>
				supabase
					.from("guide_service_areas_applications")
					.select("*")
					.eq("application_id", applicationId)
					.order("created_at", { ascending: false }),
			z.array(GuideServiceAreaApplicationSchema),
			"GET_GUIDE_APPLICATION_SERVICE_AREAS",
		);
	}

	public static async getUnsuspensionRequests(
		options?: UnsuspensionRequestListOptions,
	): Promise<UnsuspensionRequest[]> {
		const supabase = await this.getClient();
		let query = supabase.from("unsuspension_requests").select("*");

		if (options?.guideId) {
			query = query.eq("guide_id", options.guideId);
		}

		if (options?.status) {
			query = query.eq("status", options.status);
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
			z.array(UnsuspensionRequestSchema),
			"GET_UNSUSPENSION_REQUESTS",
		);
	}
}
