import { create } from "zustand";
import { ServiceFailure } from "@/supabase/services/supabaseServicev2";
import { AuthService } from "../services";
import { AuthProfile, OnboardingParam } from "../models";

type AuthStoreError = {
	type: "VALIDATION" | "SUPABASE" | "PARSING" | "UNKNOWN";
	message: string;
	context?: string;
	originalError?: unknown;
};

interface AuthStoreState {
	profile: AuthProfile | null;
	isLoading: boolean;
	isInitializing: boolean;
	error: AuthStoreError | null;

	isLoggedIn: () => boolean;
	isEmailVerified: () => boolean;
	isOnboardingDone: () => boolean;

	initialize: () => Promise<void>;
	refreshProfile: () => Promise<void>;
	login: (email: string, password: string) => Promise<boolean>;
	signup: (email: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
	loginWithGoogle: () => Promise<boolean>;
	completeOnboarding: (params: OnboardingParam) => Promise<boolean>;
	isUsernameAvailable: (username: string) => Promise<boolean>;

	setProfile: (profile: AuthProfile | null) => void;
	clearError: () => void;
}

const toStoreError = (error: unknown): AuthStoreError => {
	if (error instanceof ServiceFailure) {
		return {
			type: error.type,
			message: error.message,
			context: error.context,
			originalError: error.originalError,
		};
	}

	if (error instanceof Error) {
		return {
			type: "UNKNOWN",
			message: error.message,
			originalError: error,
		};
	}

	return {
		type: "UNKNOWN",
		message: "Unknown error",
		originalError: error,
	};
};

export const useV2AuthStore = create<AuthStoreState>((set, get) => ({
	profile: null,
	isLoading: false,
	isInitializing: true,
	error: null,

	isLoggedIn: () => get().profile?.profile !== null,
	isEmailVerified: () => get().profile?.is_auth_verified ?? false,
	isOnboardingDone: () => get().profile?.is_onboarding_done ?? false,

	initialize: async () => {
		set({ isInitializing: true, error: null });

		try {
			const profile = await AuthService.fetchProfile();
			set({ profile, isInitializing: false });
		} catch (error) {
			set({
				error: toStoreError(error),
				profile: null,
				isInitializing: false,
			});
		}
	},

	refreshProfile: async () => {
		set({ isLoading: true, error: null });

		try {
			const profile = await AuthService.fetchProfile();
			set({ profile, isLoading: false });
		} catch (error) {
			set({
				error: toStoreError(error),
				isLoading: false,
			});
		}
	},

	login: async (email, password) => {
		set({ isLoading: true, error: null });

		try {
			const profile = await AuthService.login(email, password);
			set({ profile, isLoading: false });
			return true;
		} catch (error) {
			set({
				error: toStoreError(error),
				isLoading: false,
			});
			return false;
		}
	},

	signup: async (email, password) => {
		set({ isLoading: true, error: null });

		try {
			const profile = await AuthService.signup(email, password);
			set({ profile, isLoading: false });
			return true;
		} catch (error) {
			set({
				error: toStoreError(error),
				isLoading: false,
			});
			return false;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });

		try {
			await AuthService.logout();
			set({ profile: null, isLoading: false });
		} catch (error) {
			set({
				error: toStoreError(error),
				isLoading: false,
			});
		}
	},

	loginWithGoogle: async () => {
		set({ isLoading: true, error: null });

		try {
			await AuthService.loginWithGoogle();
			set({ isLoading: false });
			return true;
		} catch (error) {
			set({
				error: toStoreError(error),
				isLoading: false,
			});
			return false;
		}
	},

	completeOnboarding: async (params) => {
		set({ isLoading: true, error: null });

		try {
			const profile = await AuthService.completeOnboarding(params);
			set({ profile, isLoading: false });
			return true;
		} catch (error) {
			set({
				error: toStoreError(error),
				isLoading: false,
			});
			return false;
		}
	},

	isUsernameAvailable: async (username) => {
		set({ error: null });

		try {
			return await AuthService.isUsernameAvailable(username);
		} catch (error) {
			set({ error: toStoreError(error) });
			return false;
		}
	},

	setProfile: (profile) => set({ profile }),
	clearError: () => set({ error: null }),
}));
