"use client";

/**
 * LEGACY SHIM: useProfileStore
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

type ProfileStoreState = {
	isLoading: any;
	myPrivateData: any;
	error: any;
	fetchMyPrivateData: (...args: any[]) => Promise<any>;
	updateWithFiles: (...args: any[]) => Promise<any>;
	getByUserId: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: ProfileStoreState = {
	isLoading: null,
	myPrivateData: null,
	error: null,
	fetchMyPrivateData: async (..._args: any[]) => undefined,
	updateWithFiles: async (..._args: any[]) => undefined,
	getByUserId: async (..._args: any[]) => undefined,
};

export const useProfileStore = create<ProfileStoreState>(() => initialState);
