"use client";

/**
 * LEGACY SHIM: useGuideApplicationStore
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

type GuideApplicationStoreState = {
	error: any;
	isLoading: any;
	myApplications: any;
	signedUrls: any;
	clearHistory: (...args: any[]) => Promise<any>;
	fetchMyApplications: (...args: any[]) => Promise<any>;
	loadProofUrl: (...args: any[]) => Promise<any>;
	submitApplication: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: GuideApplicationStoreState = {
	error: null,
	isLoading: null,
	myApplications: null,
	signedUrls: null,
	clearHistory: async (..._args: any[]) => undefined,
	fetchMyApplications: async (..._args: any[]) => undefined,
	loadProofUrl: async (..._args: any[]) => undefined,
	submitApplication: async (..._args: any[]) => undefined,
};

export const useGuideApplicationStore = create<GuideApplicationStoreState>(() => initialState);
