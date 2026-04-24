import z from "zod";
import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import { Validator } from "@/supabase/services/validator";
import {
	GuideInfo,
	GuideInfoSchema,
	GuideProfile,
	GuideProfileSchema,
	GuideReviewParamsSchema,
} from "../models";
import { f } from "../schemas";

export type GuideListOptions = {
	onlyAvailable?: boolean;
	searchQuery?: string;
	minRating?: number;
	sortBy?: "avg_rating" | "full_name";
	limit?: number;
	offset?: number;
};

export class GuideService extends SupabaseServiceV2 {
	public static async getGuides(
		options?: GuideListOptions,
	): Promise<GuideInfo[]> {
		const supabase = await this.getClient();
		const table = options?.onlyAvailable
			? "available_guides"
			: "guide_info";

		let query = supabase.from(table).select("*");

		if (options?.searchQuery) {
			query = query.or(
				`full_name.ilike.%${options.searchQuery}%,username.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`,
			);
		}

		if (options?.minRating !== undefined) {
			query = query.gte("avg_rating", options.minRating);
		}

		switch (options?.sortBy) {
			case "full_name":
				query = query.order("full_name", { ascending: true });
				break;
			case "avg_rating":
			default:
				query = query
					.order("avg_rating", {
						ascending: false,
						nullsFirst: false,
					})
					.order("full_name", { ascending: true });
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
			z.array(GuideInfoSchema),
			"GET_GUIDES",
		);
	}

	public static async getGuideById(
		id: string,
		options?: { onlyAvailable?: boolean },
	): Promise<GuideInfo> {
		const supabase = await this.getClient();
		const table = options?.onlyAvailable
			? "available_guides"
			: "guide_info";

		return await this.query(
			() => supabase.from(table).select("*").eq("id", id).single(),
			GuideInfoSchema,
			"GET_GUIDE_BY_ID",
		);
	}

	public static async getGuideDiscoveryCards(options?: {
		searchQuery?: string;
		minRating?: number;
		limit?: number;
		offset?: number;
	}): Promise<GuideInfo[]> {
		return this.getGuides({
			onlyAvailable: true,
			searchQuery: options?.searchQuery,
			minRating: options?.minRating,
			sortBy: "avg_rating",
			limit: options?.limit,
			offset: options?.offset,
		});
	}

	public static async fetchGuideProfile(
		targetId?: string,
	): Promise<GuideProfile> {
		return await this.callRpc("fetch_guide_profile", GuideProfileSchema, {
			target_id: targetId,
		});
	}

	public static async reviewGuide(params: {
		p_guide_id: string;
		p_rating: number;
		p_review_text?: string | null;
	}): Promise<string> {
		const payload = Validator.validateAgainstSchema(
			params,
			GuideReviewParamsSchema,
			"GuideReviewParamsSchema",
		);

		return await this.callRpc("review_guide", f.uuid(), payload);
	}

	public static async getGuidesForDestination(params: {
		p_lat: number;
		p_lon: number;
		p_limit?: number;
	}): Promise<GuideInfo[]> {
		return await this.callRpcArray(
			"get_guides_for_destination",
			GuideInfoSchema,
			params,
		);
	}
}
