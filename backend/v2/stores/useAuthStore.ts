"use client";

/**
 * Auth store — legitimate shared-state store per AGENTS.md (role/session
 * state crosses the whole app, drives navbar + guard UI, survives route
 * transitions).
 *
 * Delegates all business logic to {@link AuthService}; this layer only owns
 * store shape, selector helpers, and toast/error shaping.
 */

import { create } from "zustand";
import { ServiceFailure } from "@/supabase/services/supabaseServicev2";
import { AuthService } from "../services";
import { createBrowserClient } from "@/supabase/client";
import type { AuthProfile, BaseProfile, OnboardingParam } from "../models";

export type AuthStoreError = {
	type: "VALIDATION" | "SUPABASE" | "PARSING" | "UNKNOWN";
	message: string;
	context?: string;
	originalError?: unknown;
};

export interface AuthState {
	profileData: AuthProfile | null;
	currentUser: BaseProfile | null;
	isInitializing: boolean;
	isLoading: boolean;
	error: string | null;
	redirectPage: string | null;

	profile: () => BaseProfile | null;
	is_logged_in: () => boolean;
	isEmailVerified: () => boolean;
	is_onboarding_done: () => boolean;

	initialize: () => Promise<void>;
	login: (email: string, password: string) => Promise<boolean>;
	signUp: (email: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	loginWithGoogle: () => Promise<boolean>;
	onboarding: (params: OnboardingParam) => Promise<boolean>;
	resendVerificationEmail: () => Promise<boolean>;
	checkUsername: (username: string) => Promise<boolean>;
	uploadAvatar: (file: File) => Promise<string | null>;

	getPostLoginRoute: () => string;
	setRedirectPage: (path: string | null) => void;
	clearError: () => void;
}

const toErrorMessage = (error: unknown): string => {
	if (error instanceof ServiceFailure) return error.message;
	if (error instanceof Error) return error.message;
	return "Unknown error";
};

export const useAuthStore = create<AuthState>((set, get) => ({
	profileData: null,
	currentUser: null,
	isInitializing: true,
	isLoading: false,
	error: null,
	redirectPage: null,

	profile: () => get().profileData?.profile ?? null,
	is_logged_in: () => (get().profileData?.profile ?? null) !== null,
	isEmailVerified: () => get().profileData?.is_auth_verified ?? false,
	is_onboarding_done: () => get().profileData?.is_onboarding_done ?? false,

	initialize: async () => {
		set({ isInitializing: true, error: null });
		try {
			const profileData = await AuthService.safe(() =>
				AuthService.fetchProfile(),
			);
			set({
				profileData,
				currentUser: profileData?.profile ?? null,
				isInitializing: false,
			});
		} catch (error) {
			set({
				error: toErrorMessage(error),
				profileData: null,
				currentUser: null,
				isInitializing: false,
			});
		}
	},

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const profileData = await AuthService.login(email, password);
			set({
				profileData,
				currentUser: profileData?.profile ?? null,
				isLoading: false,
			});
			return true;
		} catch (error) {
			set({ error: toErrorMessage(error), isLoading: false });
			return false;
		}
	},

	signUp: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const profileData = await AuthService.signup(email, password);
			set({
				profileData,
				currentUser: profileData?.profile ?? null,
				isLoading: false,
			});
			return true;
		} catch (error) {
			set({ error: toErrorMessage(error), isLoading: false });
			return false;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await AuthService.logout();
			set({
				profileData: null,
				currentUser: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: toErrorMessage(error), isLoading: false });
		}
	},

	loginWithGoogle: async () => {
		set({ isLoading: true, error: null });
		try {
			await AuthService.loginWithGoogle();
			set({ isLoading: false });
			return true;
		} catch (error) {
			set({ error: toErrorMessage(error), isLoading: false });
			return false;
		}
	},

	onboarding: async (params) => {
		set({ isLoading: true, error: null });
		try {
			const profileData = await AuthService.completeOnboarding(params);
			set({
				profileData,
				currentUser: profileData?.profile ?? null,
				isLoading: false,
			});
			return true;
		} catch (error) {
			set({ error: toErrorMessage(error), isLoading: false });
			return false;
		}
	},

	resendVerificationEmail: async () => {
		set({ isLoading: true, error: null });
		try {
			const email = get().profileData?.email ?? null;
			if (!email) {
				set({ isLoading: false, error: "No email on file." });
				return false;
			}
			const supabase = createBrowserClient();
			const { error } = await supabase.auth.resend({
				type: "signup",
				email,
			});
			set({ isLoading: false });
			if (error) {
				set({ error: error.message });
				return false;
			}
			return true;
		} catch (error) {
			set({ error: toErrorMessage(error), isLoading: false });
			return false;
		}
	},

	checkUsername: async (username) => {
		try {
			return await AuthService.isUsernameAvailable(username);
		} catch (error) {
			set({ error: toErrorMessage(error) });
			return false;
		}
	},

	uploadAvatar: async (file) => {
		try {
			const supabase = createBrowserClient();
			const user = get().profileData?.profile;
			if (!user) return null;
			const path = `avatars/${user.id}-${Date.now()}-${file.name}`;
			const { error } = await supabase.storage
				.from("public-assets")
				.upload(path, file, { upsert: true });
			if (error) {
				set({ error: error.message });
				return null;
			}
			const { data } = supabase.storage
				.from("public-assets")
				.getPublicUrl(path);
			return data.publicUrl;
		} catch (error) {
			set({ error: toErrorMessage(error) });
			return null;
		}
	},

	getPostLoginRoute: () => {
		const state = get();
		if (state.redirectPage) return state.redirectPage;
		const pd = state.profileData;
		if (!pd?.profile) return "/login";
		if (!pd.is_auth_verified) return "/auth/verify-email";
		if (!pd.is_onboarding_done) return "/onboarding";
		return "/";
	},

	setRedirectPage: (path) => set({ redirectPage: path }),
	clearError: () => set({ error: null }),
}));
