import { z } from "zod";
import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  ProfileSchema,
  MinimalUserSchema,
  CompleteOnboardingInputSchema,
  type CompleteOnboardingInput,
  type Profile,
  type MinimalUser,
} from "../models/user-models";

export class UserService extends SupabaseServiceV2 {
  async fetchProfile(targetId?: string): Promise<Profile> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("fetch_profile", {
      target_id: targetId ?? null,
    });
    const raw = this.handle(data, error, "fetchProfile");
    return ProfileSchema.parse(raw);
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("is_username_available", {
      username,
    });
    return this.handle<boolean>(data as boolean, error, "isUsernameAvailable");
  }

  async completeOnboarding(input: CompleteOnboardingInput): Promise<Profile> {
    const parsed = CompleteOnboardingInputSchema.parse(input);
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("complete_onbording", parsed);
    const raw = this.handle(data, error, "completeOnboarding");
    return ProfileSchema.parse(raw);
  }

  async listMinimalUsers(ids: string[]): Promise<MinimalUser[]> {
    if (ids.length === 0) return [];
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("minimal_user")
      .select("*")
      .in("id", ids);
    const raw = this.handle(data, error, "listMinimalUsers");
    return z.array(MinimalUserSchema).parse(raw);
  }
}

export const userService = new UserService();
