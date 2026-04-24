import z from "zod";
import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import {
	Photo,
	PhotoInfoSchema,
	PhotoSchema,
	Story,
	StoryComment,
	StoryCommentSchema,
	StoryInfoSchema,
	StoryLike,
	StoryLikeSchema,
} from "../models";

export type StoryListOptions = {
	uploaderId?: string;
	searchQuery?: string;
	category?: string;
	tags?: string[];
	includeArchived?: boolean;
	sortBy?: "created_at" | "likes_count" | "comments_count";
	limit?: number;
	offset?: number;
};

export type PhotoListOptions = {
	uploaderId?: string;
	searchQuery?: string;
	sortBy?: "created_at" | "location_name";
	limit?: number;
	offset?: number;
};

export class StoryService extends SupabaseServiceV2 {
	public static async getStories(
		options?: StoryListOptions,
	): Promise<Story[]> {
		const supabase = await this.getClient();
		let query = supabase.from("stories_info").select("*");

		if (options?.uploaderId) {
			query = query.eq("uploader_id", options.uploaderId);
		}

		if (!options?.includeArchived) {
			query = query.eq("is_archived", false);
		}

		if (options?.category) {
			query = query.eq("categories", options.category);
		}

		if (options?.tags && options.tags.length > 0) {
			query = query.contains("tags", options.tags);
		}

		if (options?.searchQuery) {
			query = query.or(
				`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`,
			);
		}

		switch (options?.sortBy) {
			case "likes_count":
				query = query.order("likes_count", { ascending: false });
				break;
			case "comments_count":
				query = query.order("comments_count", { ascending: false });
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
			z.array(StoryInfoSchema),
			"GET_STORIES",
		);
	}

	public static async getStoryById(id: string): Promise<Story> {
		const supabase = await this.getClient();

		return await this.query(
			() =>
				supabase.from("stories_info").select("*").eq("id", id).single(),
			StoryInfoSchema,
			"GET_STORY_BY_ID",
		);
	}

	public static async getPhotos(
		options?: PhotoListOptions,
	): Promise<z.infer<typeof PhotoInfoSchema>[]> {
		const supabase = await this.getClient();
		let query = supabase.from("photos_info").select("*");

		if (options?.uploaderId) {
			query = query.eq("uploader_id", options.uploaderId);
		}

		if (options?.searchQuery) {
			query = query.or(
				`description.ilike.%${options.searchQuery}%,location_name.ilike.%${options.searchQuery}%`,
			);
		}

		switch (options?.sortBy) {
			case "location_name":
				query = query.order("location_name", {
					ascending: true,
					nullsFirst: false,
				});
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
			z.array(PhotoInfoSchema),
			"GET_PHOTOS",
		);
	}

	public static async getStoryLikes(storyId: string): Promise<StoryLike[]> {
		const supabase = await this.getClient();

		return await this.query(
			() =>
				supabase
					.from("story_likes")
					.select("*")
					.eq("story_id", storyId)
					.order("created_at", { ascending: false }),
			z.array(StoryLikeSchema),
			"GET_STORY_LIKES",
		);
	}

	public static async getStoryComments(
		storyId: string,
	): Promise<StoryComment[]> {
		const supabase = await this.getClient();

		return await this.query(
			() =>
				supabase
					.from("story_comments")
					.select("*")
					.eq("story_id", storyId)
					.order("created_at", { ascending: false }),
			z.array(StoryCommentSchema),
			"GET_STORY_COMMENTS",
		);
	}

	public static async getPhotoById(id: string): Promise<Photo> {
		const supabase = await this.getClient();

		return await this.query(
			() => supabase.from("photos").select("*").eq("id", id).single(),
			PhotoSchema,
			"GET_PHOTO_BY_ID",
		);
	}
}
