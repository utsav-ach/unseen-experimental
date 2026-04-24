"use client";

/**
 * LEGACY SHIM: useActivityStore
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

type ActivityStoreState = {
	activities: any;
	destinationsByActivity: any;
	selectedActivity: any;
	isLoading: any;
	error: any;
	fetchActivities: (...args: any[]) => Promise<any>;
	fetchDestinationsByActivity: (...args: any[]) => Promise<any>;
	clearDetailState: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: ActivityStoreState = {
	activities: null,
	destinationsByActivity: null,
	selectedActivity: null,
	isLoading: null,
	error: null,
	fetchActivities: async (..._args: any[]) => undefined,
	fetchDestinationsByActivity: async (..._args: any[]) => undefined,
	clearDetailState: async (..._args: any[]) => undefined,
};

export const useActivityStore = create<ActivityStoreState>(() => initialState);
