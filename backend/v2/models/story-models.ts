import { z } from "zod";
import { Uuid, Timestamp, NonEmptyString } from "../schemas/field-types";
import { GeoPoint } from "../schemas/gis-types";
import { StoryVisibility } from "../schemas/enums";
import { MinimalUserSchema } from "./user-models";

export const StorySchema = z.object({
  id: Uuid,
  author_id: Uuid,
  title: NonEmptyString,
  content: z.string(),
  feature_image: z.string().nullable(),
  tags: z.array(z.string()),
  categories: z.array(z.string()),
  location: GeoPoint.nullable(),
  location_name: z.string().nullable(),
  visibility: StoryVisibility,
  like_count: z.number().int().min(0),
  comment_count: z.number().int().min(0),
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type Story = z.infer<typeof StorySchema>;

export const StoryInfoSchema = StorySchema.extend({
  author: MinimalUserSchema,
});
export type StoryInfo = z.infer<typeof StoryInfoSchema>;

export const StoryCommentSchema = z.object({
  id: Uuid,
  story_id: Uuid,
  author_id: Uuid,
  content: z.string(),
  created_at: Timestamp,
});
export type StoryComment = z.infer<typeof StoryCommentSchema>;

export const PhotoSchema = z.object({
  id: Uuid,
  uploader_id: Uuid,
  image_url: NonEmptyString,
  description: z.string().nullable(),
  location: GeoPoint.nullable(),
  location_name: z.string().nullable(),
  created_at: Timestamp,
});
export type Photo = z.infer<typeof PhotoSchema>;

export const PhotoInfoSchema = PhotoSchema.extend({
  uploader: MinimalUserSchema,
});
export type PhotoInfo = z.infer<typeof PhotoInfoSchema>;
