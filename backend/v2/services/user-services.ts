import z from "zod";
import { SupabaseServiceV2 } from "@/supabase/services/supabaseServicev2";
import { Validator } from "@/supabase/services/validator";
import {
	AuthProfile,
	AuthProfileSchema,
	OnboardingParam,
	OnboardingParamSchema,
	UserInfo,
	UserInfoSchema,
} from "../models";

export type UserListOptions = {
	searchQuery?: string;
	onlyGuides?: boolean;
	limit?: number;
	offset?: number;
};

export class UserService extends SupabaseServiceV2 {
	public static async fetchProfile(targetId?: string): Promise<AuthProfile> {
		return await this.callRpc("fetch_profile", AuthProfileSchema, {
			target_id: targetId,
		});
	}

	public static async isUsernameAvailable(
		username: string,
	): Promise<boolean> {
		const normalized = username.trim();
		if (!normalized) {
			return false;
		}

		return await this.callRpc("is_username_available", z.boolean(), {
			p_username: normalized,
		});
	}

	public static async completeOnboarding(
		params: OnboardingParam,
	): Promise<AuthProfile> {
		const payload = Validator.validateAgainstSchema(
			params,
			OnboardingParamSchema,
			"OnboardingParamSchema",
		);

		return await this.callRpc(
			"complete_onbording",
			AuthProfileSchema,
			payload,
		);
	}

	public static async getUsers(
		options?: UserListOptions,
	): Promise<UserInfo[]> {
		const supabase = await this.getClient();

		let query = supabase.from("user_info").select("*");

		if (options?.searchQuery) {
			query = query.or(
				`full_name.ilike.%${options.searchQuery}%,username.ilike.%${options.searchQuery}%`,
			);
		}

		if (options?.onlyGuides) {
			query = query.eq("is_guide", true);
		}

		query = query.order("full_name", { ascending: true });

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
			z.array(UserInfoSchema),
			"GET_USERS",
		);
	}

	public static async getUserById(id: string): Promise<UserInfo> {
		const supabase = await this.getClient();

		return await this.query(
			() => supabase.from("user_info").select("*").eq("id", id).single(),
			UserInfoSchema,
			"GET_USER_BY_ID",
		);
	}
}
