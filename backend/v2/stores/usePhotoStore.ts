"use client";

/**
 * LEGACY SHIM: usePhotoStore
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

type PhotoStoreState = {
	can_delete: any;
	currentPhoto: any;
	error: any;
	isLoading: any;
	photos: any;
	total: any;
	createPhoto: (...args: any[]) => Promise<any>;
	deletePhoto: (...args: any[]) => Promise<any>;
	fetchPhotoDetail: (...args: any[]) => Promise<any>;
	fetchPhotos: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: PhotoStoreState = {
	can_delete: null,
	currentPhoto: null,
	error: null,
	isLoading: null,
	photos: null,
	total: null,
	createPhoto: async (..._args: any[]) => undefined,
	deletePhoto: async (..._args: any[]) => undefined,
	fetchPhotoDetail: async (..._args: any[]) => undefined,
	fetchPhotos: async (..._args: any[]) => undefined,
};

export const usePhotoStore = create<PhotoStoreState>(() => initialState);
