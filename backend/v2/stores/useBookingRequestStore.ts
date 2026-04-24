"use client";

/**
 * LEGACY SHIM: useBookingRequestStore
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

type BookingRequestStoreState = {
	currentRequest: any;
	error: any;
	isLoading: any;
	myRequests: any;
	temporaryRemarks: any;
	createPackageBooking: (...args: any[]) => Promise<any>;
	fetchMyRequests: (...args: any[]) => Promise<any>;
	fetchRequestDetailForTourist: (...args: any[]) => Promise<any>;
	finalizeRequest: (...args: any[]) => Promise<any>;
	setTemporaryRemarks: (...args: any[]) => Promise<any>;
	startRequest: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: BookingRequestStoreState = {
	currentRequest: null,
	error: null,
	isLoading: null,
	myRequests: null,
	temporaryRemarks: null,
	createPackageBooking: async (..._args: any[]) => undefined,
	fetchMyRequests: async (..._args: any[]) => undefined,
	fetchRequestDetailForTourist: async (..._args: any[]) => undefined,
	finalizeRequest: async (..._args: any[]) => undefined,
	setTemporaryRemarks: async (..._args: any[]) => undefined,
	startRequest: async (..._args: any[]) => undefined,
};

export const useBookingRequestStore = create<BookingRequestStoreState>(() => initialState);
