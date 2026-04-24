"use client";

/**
 * LEGACY SHIM: useFeaturedDestinationStore
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

type FeaturedDestinationStoreState = {
	currentDestinationDetails: any;
	destinations: any;
	error: any;
	isLoading: any;
	clearCurrentDetails: (...args: any[]) => Promise<any>;
	fetchByAreas: (...args: any[]) => Promise<any>;
	fetchDestinationDetails: (...args: any[]) => Promise<any>;
	fetchDestinations: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: FeaturedDestinationStoreState = {
	currentDestinationDetails: null,
	destinations: null,
	error: null,
	isLoading: null,
	clearCurrentDetails: async (..._args: any[]) => undefined,
	fetchByAreas: async (..._args: any[]) => undefined,
	fetchDestinationDetails: async (..._args: any[]) => undefined,
	fetchDestinations: async (..._args: any[]) => undefined,
};

export const useFeaturedDestinationStore = create<FeaturedDestinationStoreState>(() => initialState);
