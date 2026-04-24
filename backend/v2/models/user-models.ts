import { z } from "zod";
import { f, fn } from "../schemas";

/**
 * THis is the profile model which backend uses
 * but this is incomplete and only references pfofile releted data.
 *
 * Not recommended to use in the stores at all.
 *
 * Use full profile Schema from below with more fields too
 *
 * But for other profiles like in profile cards use this instead as it dont expose sensitive data like email and phone number and many others
 */
export const BaseProfileSchema = z.object({
	id: f.uuid(),

	// Pre-onboarding rows have these null. Nullable here so SSR doesn't crash
	// for newly-signed-up users before onboarding completes.
	first_name: fn.name(),
	middle_name: fn.name(),
	last_name: fn.name(),

	username: fn.username(),

	phone_number: fn.phone(),
	emergency_contact: fn.phone(),

	avatar_url: fn.url(),

	is_admin: f.bool(),
	is_guide: f.bool(),
	is_guide_applicantion_pending: f.bool(),

	home_location: fn.gis(), // → { lat, lng } | null
	home_location_name: fn.name(),

	created_at: f.datetime(),
	updated_at: f.datetime(),
});

export type BaseProfile = z.infer<typeof BaseProfileSchema>;

/**
 * THis is the result we get frm fetch_profile rpc and it is the one that should be used in the auth store
 * as it contains auth releted data too, which is crucial to dternine the role and what routes to open
 */
export const AuthProfileSchema = z.object({
	profile: BaseProfileSchema.nullable(),

	email: fn.email(),

	is_onboarding_done: f.bool(),
	is_auth_verified: f.bool(),
});

/// an alias for auth profile
/// this is internal and should be kept private to auth store only
export type AuthProfile = z.infer<typeof AuthProfileSchema>;

/**
 * THis is the exact schema for ui and cards,
 * this contains just enough data to show in the card and nothing more so it is best for ui
 *
 * Dont use other schemas for direct ui and cards
 *
 */
export const UserInfoSchema = z.object({
	id: f.uuid(),
	full_name: f.name(),
	username: fn.username(),
	avatar_url: fn.url(),
	is_guide: f.bool().default(false),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

/**
 * The following is the paramater schema for the onbording completion rpc,
 * this contains all the data rpc needs and their types
 *
 * Make sure to validate the formdata against this before sending to the rpc.
 */
export const OnboardingParamSchema = z.object({
	p_first_name: f.name(),
	p_middle_name: fn.name(),
	p_last_name: fn.name(),

	p_username: f.username(),

	p_phone_number: f.phone(),
	p_emergency_contact: fn.phone(),

	p_avatar_url: fn.url(),

	p_home_location: f.gisInput(), // Note we use input because it is meant to be sent as param and come from formdata/ ui
	p_home_location_name: f.name(),
});

export type OnboardingParam = z.infer<typeof OnboardingParamSchema>;

/**
 * Onbording result is same as AuthProfile  because after onbording user is basically updating their profile,
 * this also saves us from re fetching again.
 */

export const LoginSchema = z.object({
	email: f.email(),
	password: f.password(),
});

export const SignupSchema = LoginSchema; // for now both are exactly same

export type LoginParams = z.infer<typeof LoginSchema>;
export type SignupParams = z.infer<typeof SignupSchema>;
