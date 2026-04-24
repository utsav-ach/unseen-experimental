import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import {
	Activity,
	ActivitySchema,
	ActivityPackageSchema,
	ActivityPackage,
	Destination,
	DestinationSchema,
	DestinationPackage,
	DestinationPackagesViewSchema,
	DestinationReview,
	DestinationReviewSchema,
	DestinationReviewSortOptions,
	DestinationSortOption,
	PackageSortOption,
} from "../models";
import z from "zod";

export type DestinationListOptions = {
	sortBy?: DestinationSortOption;
	searchQuery?: string;
	limit?: number;
	offset?: number;
	minRating?: number;
};

export type DestinationPackageListOptions = {
	type?: "destination" | "activity";
	sortBy?: PackageSortOption;
	searchQuery?: string;
	limit?: number;
	offset?: number;
};

export type DestinationReviewListOptions = {
	destinationId?: string;
	sortBy?: DestinationReviewSortOptions;
	minRating?: number;
	limit?: number;
	offset?: number;
};

export class DestinationService extends SupabaseServiceV2 {
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

	public static async getDestinations(options?: {
		sortBy?: DestinationSortOption;
		searchQuery?: string;
		limit?: number;
		offset?: number;
		minRating?: number;
	}): Promise<Destination[]> {
		const supabase = await SupabaseServiceV2.getClient();

		let query = supabase.from("destinations").select("*");

		// search
		if (options?.searchQuery) {
			query = query.or(
				`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`,
			);
		}

		// rating filter
		if (options?.minRating !== undefined) {
			query = query.gte("avg_rating", options.minRating);
		}

		// sorting
		switch (options?.sortBy) {
			case "name":
				query = query.order("name", { ascending: true });
				break;

			case "avg_rating":
				query = query.order("avg_rating", {
					ascending: false,
					nullsFirst: false,
				});
				break;

			default:
				// default sort (trending)
				query = query
					.order("avg_rating", {
						ascending: false,
						nullsFirst: false,
					})
					.order("name", { ascending: true });
		}

		query = this.applyPagination(query, options);

		return this.query<Destination[]>(
			() => query,
			z.array(DestinationSchema),
			"GET_DESTINATIONS",
		);
	}

	public static async getDestinationById(id: string): Promise<Destination> {
		const supabase = await SupabaseServiceV2.getClient();

		return this.query<Destination>(
			() =>
				supabase.from("destinations").select("*").eq("id", id).single(),
			DestinationSchema,
			"GET_DESTINATION_BY_ID",
		);
	}

	public static async getActivities(options?: {
		searchQuery?: string;
		limit?: number;
		offset?: number;
	}): Promise<Activity[]> {
		const supabase = await SupabaseServiceV2.getClient();

		let query = supabase.from("available_activities").select("*");

		if (options?.searchQuery) {
			query = query.or(
				`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`,
			);
		}

		query = query.order("name", { ascending: true });
		query = this.applyPagination(query, options);

		return this.query<Activity[]>(
			() => query,
			z.array(ActivitySchema),
			"GET_AVAILABLE_ACTIVITIES",
		);
	}

	// overloads
	public static async getPackages(options: {
		type: "activity";
		sortBy?: PackageSortOption;
		searchQuery?: string;
		limit?: number;
		offset?: number;
	}): Promise<ActivityPackage[]>;

	public static async getPackages(options?: {
		type?: "destination";
		sortBy?: PackageSortOption;
		searchQuery?: string;
		limit?: number;
		offset?: number;
	}): Promise<DestinationPackage[]>;

	// 🔹 implementation
	public static async getPackages(options?: {
		type?: "destination" | "activity";
		sortBy?: PackageSortOption;
		searchQuery?: string;
		limit?: number;
		offset?: number;
	}): Promise<ActivityPackage[] | DestinationPackage[]> {
		const supabase = await SupabaseServiceV2.getClient();

		const isActivity = options?.type === "activity";

		const table = isActivity
			? "activities_packages"
			: "destination_packages";

		let query = supabase.from(table).select("*");

		// search
		if (options?.searchQuery) {
			query = query.ilike("name", `%${options.searchQuery}%`);
		}

		//  sorting
		switch (options?.sortBy) {
			case "actual_price":
				query = query.order("actual_price", { ascending: true });
				break;

			case "discounted_price":
				query = query.order("discounted_price", { ascending: true });
				break;

			case "expiration_date":
				query = query.order("expiration_date", { ascending: true });
				break;

			default:
				query = query.order("discounted_price", { ascending: true });
		}

		// pagination
		query = this.applyPagination(query, options);

		if (isActivity) {
			return await this.query<ActivityPackage[]>(
				() => query,
				z.array(ActivityPackageSchema),
				"GET_PACKAGES",
			);
		}

		return await this.query<DestinationPackage[]>(
			() => query,
			z.array(DestinationPackagesViewSchema),
			"GET_PACKAGES",
		);
	}

	public static async getDestinationReviews(options?: {
		destinationId?: string;
		sortBy?: DestinationReviewSortOptions;
		minRating?: number;
		limit?: number;
		offset?: number;
	}): Promise<DestinationReview[]> {
		const supabase = await SupabaseServiceV2.getClient();

		let query = supabase.from("destination_reviews").select("*");

		if (options?.destinationId) {
			query = query.eq("destination_id", options.destinationId);
		}

		if (options?.minRating !== undefined) {
			query = query.gte("rating", options.minRating);
		}

		switch (options?.sortBy) {
			case "rating":
				query = query.order("rating", { ascending: false });
				break;

			case "created_at":
				query = query.order("created_at", { ascending: false });
				break;

			default:
				query = query.order("rating", { ascending: false });
		}

		query = this.applyPagination(query, options);

		return this.query<DestinationReview[]>(
			() => query,
			z.array(DestinationReviewSchema),
			"GET_DESTINATION_REVIEWS",
		);
	}
}
