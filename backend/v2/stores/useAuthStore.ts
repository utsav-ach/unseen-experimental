"use client";

/**
 * LEGACY SHIM: useAuthStore
 *
 * Part of the v1 -> v2 migration. Intentionally minimal / loose-typed.
 * It exists only to keep the UI compiling until pages are refactored to call
 * backend/v2 services directly.
 *
 * DO NOT expand this shim. When you refactor a consuming page:
 *   1. Replace usage of this store with a direct call to the relevant
 *      backend/v2/services/*.ts service (SSR preferred).
 *   2. Delete this file once no consumer remains.
 *
 * See AGENTS.md (Store Creation Rule).
 */

import { create } from "zustand";

type AuthStoreState = {
	currentUser: any;
	error: any;
	isEmailVerified: any;
	isInitializing: any;
	isLoading: any;
	is_logged_in: any;
	is_onboarding_done: any;
	profile: any;
	profileData: any;
	checkUsername: (...args: any[]) => Promise<any>;
	getPostLoginRoute: (...args: any[]) => Promise<any>;
	initialize: (...args: any[]) => Promise<any>;
	login: (...args: any[]) => Promise<any>;
	loginWithGoogle: (...args: any[]) => Promise<any>;
	logout: (...args: any[]) => Promise<any>;
	onboarding: (...args: any[]) => Promise<any>;
	resendVerificationEmail: (...args: any[]) => Promise<any>;
	setRedirectPage: (...args: any[]) => Promise<any>;
	signUp: (...args: any[]) => Promise<any>;
	uploadAvatar: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: AuthStoreState = {
	currentUser: null,
	error: null,
	isEmailVerified: null,
	isInitializing: null,
	isLoading: null,
	is_logged_in: null,
	is_onboarding_done: null,
	profile: null,
	profileData: null,
	checkUsername: async (..._args: any[]) => undefined,
	getPostLoginRoute: async (..._args: any[]) => undefined,
	initialize: async (..._args: any[]) => undefined,
	login: async (..._args: any[]) => undefined,
	loginWithGoogle: async (..._args: any[]) => undefined,
	logout: async (..._args: any[]) => undefined,
	onboarding: async (..._args: any[]) => undefined,
	resendVerificationEmail: async (..._args: any[]) => undefined,
	setRedirectPage: async (..._args: any[]) => undefined,
	signUp: async (..._args: any[]) => undefined,
	uploadAvatar: async (..._args: any[]) => undefined,
};

export const useAuthStore = create<AuthStoreState>(() => initialState);
