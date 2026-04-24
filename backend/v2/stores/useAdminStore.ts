"use client";

/**
 * LEGACY SHIM: useAdminStore
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

type AdminStoreState = {
	activities: any;
	bookingOps: any;
	dashboard: any;
	destinations: any;
	guideApplications: any;
	isLoading: any;
	error: any;
	packages: any;
	photos: any;
	stories: any;
	users: any;
	createActivity: (...args: any[]) => Promise<any>;
	createDestination: (...args: any[]) => Promise<any>;
	deleteActivity: (...args: any[]) => Promise<any>;
	deleteDestination: (...args: any[]) => Promise<any>;
	deletePackage: (...args: any[]) => Promise<any>;
	deletePhoto: (...args: any[]) => Promise<any>;
	deleteStory: (...args: any[]) => Promise<any>;
	fetchActivities: (...args: any[]) => Promise<any>;
	fetchBookingOperations: (...args: any[]) => Promise<any>;
	fetchDashboard: (...args: any[]) => Promise<any>;
	fetchDestinations: (...args: any[]) => Promise<any>;
	fetchGuideApplications: (...args: any[]) => Promise<any>;
	fetchPackages: (...args: any[]) => Promise<any>;
	fetchPhotos: (...args: any[]) => Promise<any>;
	fetchStories: (...args: any[]) => Promise<any>;
	fetchUsers: (...args: any[]) => Promise<any>;
	reviewGuideApplication: (...args: any[]) => Promise<any>;
	setStoryArchived: (...args: any[]) => Promise<any>;
	setUserAdminStatus: (...args: any[]) => Promise<any>;
	updateActivity: (...args: any[]) => Promise<any>;
	updateDestination: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: AdminStoreState = {
	activities: null,
	bookingOps: null,
	dashboard: null,
	destinations: null,
	guideApplications: null,
	isLoading: null,
	error: null,
	packages: null,
	photos: null,
	stories: null,
	users: null,
	createActivity: async (..._args: any[]) => undefined,
	createDestination: async (..._args: any[]) => undefined,
	deleteActivity: async (..._args: any[]) => undefined,
	deleteDestination: async (..._args: any[]) => undefined,
	deletePackage: async (..._args: any[]) => undefined,
	deletePhoto: async (..._args: any[]) => undefined,
	deleteStory: async (..._args: any[]) => undefined,
	fetchActivities: async (..._args: any[]) => undefined,
	fetchBookingOperations: async (..._args: any[]) => undefined,
	fetchDashboard: async (..._args: any[]) => undefined,
	fetchDestinations: async (..._args: any[]) => undefined,
	fetchGuideApplications: async (..._args: any[]) => undefined,
	fetchPackages: async (..._args: any[]) => undefined,
	fetchPhotos: async (..._args: any[]) => undefined,
	fetchStories: async (..._args: any[]) => undefined,
	fetchUsers: async (..._args: any[]) => undefined,
	reviewGuideApplication: async (..._args: any[]) => undefined,
	setStoryArchived: async (..._args: any[]) => undefined,
	setUserAdminStatus: async (..._args: any[]) => undefined,
	updateActivity: async (..._args: any[]) => undefined,
	updateDestination: async (..._args: any[]) => undefined,
};

export const useAdminStore = create<AdminStoreState>(() => initialState);
