"use client";

/**
 * LEGACY SHIM: useGuideStore
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

type GuideStoreState = {
	currentGuide: any;
	dashboardRequests: any;
	error: any;
	isLoading: any;
	isLoadingDashboard: any;
	selectedRequest: any;
	fetchDashboardRequests: (...args: any[]) => Promise<any>;
	fetchGuideDetail: (...args: any[]) => Promise<any>;
	fetchRequestDetails: (...args: any[]) => Promise<any>;
	respondToRequest: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: GuideStoreState = {
	currentGuide: null,
	dashboardRequests: null,
	error: null,
	isLoading: null,
	isLoadingDashboard: null,
	selectedRequest: null,
	fetchDashboardRequests: async (..._args: any[]) => undefined,
	fetchGuideDetail: async (..._args: any[]) => undefined,
	fetchRequestDetails: async (..._args: any[]) => undefined,
	respondToRequest: async (..._args: any[]) => undefined,
};

export const useGuideStore = create<GuideStoreState>(() => initialState);
