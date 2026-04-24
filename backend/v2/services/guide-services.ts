import { z } from "zod";
import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  GuideInfoSchema,
  GuideReviewSchema,
  SuspendedGuideSchema,
  type GuideInfo,
  type GuideReview,
  type SuspendedGuide,
} from "../models/guide-models";
import { Uuid } from "../schemas/field-types";

export class GuideService extends SupabaseServiceV2 {
  async listAvailableGuides(): Promise<GuideInfo[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.from("available_guides").select("*");
    const raw = this.handle(data, error, "listAvailableGuides");
    return z.array(GuideInfoSchema).parse(raw);
  }

  async getGuide(id: string): Promise<GuideInfo> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("fetch_guide_profile", {
      target_id: Uuid.parse(id),
    });
    const raw = this.handle(data, error, "getGuide");
    return GuideInfoSchema.parse(raw);
  }

  async reviewGuide(
    guideId: string,
    rating: number,
    reviewText?: string,
  ): Promise<string> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("review_guide", {
      guide_id: guideId,
      rating,
      review_text: reviewText ?? null,
    });
    return this.handle<string>(data as string, error, "reviewGuide");
  }

  async listReviews(guideId: string): Promise<GuideReview[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("guide_reviews")
      .select("*")
      .eq("guide_id", guideId)
      .order("created_at", { ascending: false });
    const raw = this.handle(data, error, "listReviews");
    return z.array(GuideReviewSchema).parse(raw);
  }

  async getGuidesForDestination(
    latitude: number,
    longitude: number,
    limit = 20,
  ): Promise<GuideInfo[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("get_guides_for_destination", {
      lat: latitude,
      lon: longitude,
      result_limit: limit,
    });
    const raw = this.handle(data, error, "getGuidesForDestination");
    return z.array(GuideInfoSchema).parse(raw);
  }

  async getSuspendedGuides(): Promise<SuspendedGuide[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("get_suspended_guides");
    const raw = this.handle(data, error, "getSuspendedGuides");
    return z.array(SuspendedGuideSchema).parse(raw);
  }
}

export const guideService = new GuideService();
