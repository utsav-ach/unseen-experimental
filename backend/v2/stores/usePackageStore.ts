"use client";

/**
 * LEGACY SHIM: usePackageStore
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

type PackageStoreState = {
	currentPackage: any;
	error: any;
	featuredPackages: any;
	isLoading: any;
	fetchFeaturedPackages: (...args: any[]) => Promise<any>;
	fetchPackageDetails: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: PackageStoreState = {
	currentPackage: null,
	error: null,
	featuredPackages: null,
	isLoading: null,
	fetchFeaturedPackages: async (..._args: any[]) => undefined,
	fetchPackageDetails: async (..._args: any[]) => undefined,
};

export const usePackageStore = create<PackageStoreState>(() => initialState);
