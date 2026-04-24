import z from "zod";
import {
	AuthProfile,
	AuthProfileSchema,
	LoginParams,
	LoginSchema,
	OnboardingParam,
	OnboardingParamSchema,
	SignupParams,
	SignupSchema,
} from "../models";
import {
	ServiceFailure,
	SupabaseServiceV2,
} from "@/supabase/services/supabaseServicev2";
import { Validator } from "@/supabase/services/validator";

/**
 * The main service to be used is supabaseServiceV2, it has a static method called executeAgainstSchema which takes care of executing the function, validating the result against the schema and returning the data in the expected format.
 *
 * The SupabaseServiceV2 throws ServiceFailure which we wont catch
 *
 * The store layer is responsible to wrap the whole function in a try catch and show error to the ui,
 * single try catch per method is needed
 *
 * store is just for wrapping the service and error handling and should not have any business logic,
 * all business logic should be in the service layer
 *
 *
 */
export class AuthService extends SupabaseServiceV2 {
	public static async safe<T>(fn: () => Promise<T>): Promise<T | null> {
		try {
			return await fn();
		} catch (e) {
			console.error(e);
			return null;
		}
	}

	private static async _signup(email: string, password: string) {
		return this.execute(async () => {
			const supabase = await SupabaseServiceV2.getClient();
			const res = await supabase.auth.signUp({ email, password });

			return {
				data: res.data,
				error: res.error,
			};
		});
	}

	/**
	 * THis is the  entry point for signup and login,
	 *  it will call the respective methods and return the profile of the user after successful login or signup
	 */
	public static async signup(
		email: SignupParams["email"],
		password: SignupParams["password"],
	): Promise<AuthProfile> {
		Validator.validateAgainstSchema(
			{ email, password },
			SignupSchema,
			"SignupSchema",
		);
		await this._signup(email, password);
		return this.login(email, password);
	}

	public static async login(
		email: LoginParams["email"],
		password: LoginParams["password"],
	): Promise<AuthProfile> {
		Validator.validateAgainstSchema(
			{ email, password },
			LoginSchema,
			"LoginSchema",
		);
		await this._login(email, password);

		const profile = await this.fetchProfile();

		if (!profile) {
			throw new ServiceFailure(
				"UNKNOWN",
				"Profile fetch failed after login",
				null,
				"AuthService.login",
			);
		}

		return profile;
	}

	public static async logout() {
		const supabase = await SupabaseServiceV2.getClient();
		await supabase.auth.signOut();
	}

	private static async _login(email: string, password: string) {
		const supabase = await SupabaseServiceV2.getClient();

		return await this.execute(async () => {
			const res = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			return { data: res.data, error: res.error };
		}, "AuthService.login");
	}

	public static async loginWithGoogle() {
		const supabase = await SupabaseServiceV2.getClient();

		return await this.execute(async () => {
			const res = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
					scopes: "profile email",
				},
			});

			return { data: res.data, error: res.error };
		}, "AuthService.loginWithGoogle");
	}

	public static async fetchProfile(): Promise<AuthProfile> {
		// Call the SupabaseServiceV2 to execute the fetch profile function and validate the result against the AuthProfileSchema
		return await SupabaseServiceV2.callRpc(
			"fetch_profile",
			AuthProfileSchema,
		);
	}

	public static async fetchProfileById(
		targetId: string,
	): Promise<AuthProfile> {
		return await SupabaseServiceV2.callRpc(
			"fetch_profile",
			AuthProfileSchema,
			{
				target_id: targetId,
			},
		);
	}

	public static async isUsernameAvailable(
		username: string,
	): Promise<boolean> {
		const normalized = username.trim();
		if (!normalized) {
			return false;
		}

		return await SupabaseServiceV2.callRpc(
			"is_username_available",
			z.boolean(),
			{
				p_username: normalized,
			},
		);
	}

	public static async completeOnboarding(
		params: OnboardingParam,
	): Promise<AuthProfile> {
		const payload = Validator.validateAgainstSchema(
			params,
			OnboardingParamSchema,
			"OnboardingParamSchema",
		);

		return await SupabaseServiceV2.callRpc(
			"complete_onbording",
			AuthProfileSchema,
			payload,
		);
	}

	public static async refreshSession() {
		const supabase = await SupabaseServiceV2.getClient();
		const { data, error } = await supabase.auth.refreshSession();

		if (error) {
			throw new ServiceFailure(
				"SUPABASE",
				"Failed to refresh session",
				error,
				"AuthService.refreshSession",
			);
		}

		return data;
	}
}
