import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  ApplyGuideApplicationInputSchema,
  GuideApplicationSchema,
  type ApplyGuideApplicationInput,
  type GuideApplication,
} from "../models/application-models";

export class ApplicationService extends SupabaseServiceV2 {
  async applyAsGuide(input: ApplyGuideApplicationInput): Promise<string> {
    const parsed = ApplyGuideApplicationInputSchema.parse(input);
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("apply_guide_application", parsed);
    return this.handle<string>(data as string, error, "applyAsGuide");
  }

  async getMyApplication(): Promise<GuideApplication | null> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("guide_applications")
      .select("*, service_areas:guide_service_areas_applications(*)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`[ApplicationService.getMyApplication] ${error.message}`);
    if (!data) return null;
    return GuideApplicationSchema.parse(data);
  }
}

export const applicationService = new ApplicationService();
