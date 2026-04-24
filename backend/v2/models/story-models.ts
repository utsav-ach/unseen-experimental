import { z } from "zod";
import { f, fn } from "../schemas";

/**
 * Stories module includes story + photo entities.
 */
export const StoryInfoSchema = z.object({
	id: f.uuid(),
	uploader_id: f.uuid(),

	title: z.string(),
	feature_image: f.url(),

	description: z.string(), // GFM (keep as string)

	categories: fn.name(),

	tags: z.array(z.string()).default([]),

	likes_count: z.number().int().nonnegative(),
	comments_count: z.number().int().nonnegative(),

	is_archived: f.bool(),

	related_location: fn.gis(), // → { lat, lng }

	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),

	// joined uploader info
	uploader_full_name: z.string(),
	uploader_username: fn.username(),
	uploader_avatar_url: fn.url(),
	uploader_is_guide: f.bool(),
});

export type Story = z.infer<typeof StoryInfoSchema>;

export const PhotoInfoSchema = z.object({
	id: f.uuid(),
	uploader_id: f.uuid(),

	media_urls: z.array(f.url()).min(1),

	description: fn.name(),

	location_name: fn.name(),

	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),

	// joined uploader info
	uploader_full_name: z.string(),
	uploader_username: fn.username(),
	uploader_avatar_url: fn.url(),
	uploader_is_guide: f.bool(),
});

export const StoryLikeSchema = z.object({
	id: f.uuid(),
	story_id: f.uuid(),
	user_id: f.uuid(),
	created_at: f.datetime(),
});

export type StoryLike = z.infer<typeof StoryLikeSchema>;

export const StoryCommentSchema = z.object({
	id: f.uuid(),
	story_id: f.uuid(),
	user_id: f.uuid(),
	content: f.name(),
	created_at: f.datetime(),
	updated_at: f.datetime(),
});

export type StoryComment = z.infer<typeof StoryCommentSchema>;

export const PhotoSchema = z.object({
	id: f.uuid(),
	uploader_id: f.uuid(),
	media_urls: f.stringArray(50),
	description: fn.name(),
	location: fn.gis(),
	location_name: fn.name(),
	created_at: f.datetime(),
	updated_at: f.datetime(),
});

export type Photo = z.infer<typeof PhotoSchema>;
