"use client";

/**
 * LEGACY SHIM: useTrekDaiStore
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

type TrekDaiStoreState = {
	error: any;
	guides: any;
	isLoading: any;
	query: any;
	sortBy: any;
	total: any;
	fetchTrekDaiData: (...args: any[]) => Promise<any>;
	loadMore: (...args: any[]) => Promise<any>;
	setQuery: (...args: any[]) => Promise<any>;
	setSortBy: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: TrekDaiStoreState = {
	error: null,
	guides: null,
	isLoading: null,
	query: null,
	sortBy: null,
	total: null,
	fetchTrekDaiData: async (..._args: any[]) => undefined,
	loadMore: async (..._args: any[]) => undefined,
	setQuery: async (..._args: any[]) => undefined,
	setSortBy: async (..._args: any[]) => undefined,
};

export const useTrekDaiStore = create<TrekDaiStoreState>(() => initialState);
