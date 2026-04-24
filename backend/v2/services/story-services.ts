import { z } from "zod";
import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  StoryInfoSchema,
  PhotoInfoSchema,
  type StoryInfo,
  type PhotoInfo,
} from "../models/story-models";

export class StoryService extends SupabaseServiceV2 {
  async listStories(): Promise<StoryInfo[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("stories_info")
      .select("*")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    const raw = this.handle(data, error, "listStories");
    return z.array(StoryInfoSchema).parse(raw);
  }

  async getStory(id: string): Promise<StoryInfo> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("stories_info")
      .select("*")
      .eq("id", id)
      .single();
    const raw = this.handle(data, error, "getStory");
    return StoryInfoSchema.parse(raw);
  }

  async listPhotos(): Promise<PhotoInfo[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("photos_info")
      .select("*")
      .order("created_at", { ascending: false });
    const raw = this.handle(data, error, "listPhotos");
    return z.array(PhotoInfoSchema).parse(raw);
  }

  async getPhoto(id: string): Promise<PhotoInfo> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("photos_info")
      .select("*")
      .eq("id", id)
      .single();
    const raw = this.handle(data, error, "getPhoto");
    return PhotoInfoSchema.parse(raw);
  }
}

export const storyService = new StoryService();
