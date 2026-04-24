"use client";

/**
 * Legacy compat store for tourist-side booking/request flows. Wraps
 * {@link BookingService}.
 */

import { create } from "zustand";
import { BookingService } from "../services";
import { useAuthStore } from "./useAuthStore";
import type {
	GuideBookingInfo,
	GuideBookingRequest,
} from "../models";

interface BookingRequestState {
	myRequests: GuideBookingRequest[];
	currentRequest: GuideBookingRequest | null;
	temporaryRemarks: string | null;
	isLoading: boolean;
	error: string | null;

	fetchMyRequests: (touristId?: string) => Promise<void>;
	fetchRequestDetailForTourist: (id: string) => Promise<void>;
	startRequest: (payload: {
		guide_id: string;
		destinations: string;
		people_count: number;
		duration_days: number;
		additional_details?: string;
		tourist_remarks?: string;
	}) => Promise<boolean>;
	finalizeRequest: (
		id: string,
		action: "approved" | "cancelled",
		payload: { remarks?: string; payment_provider?: string; paid_amount?: number },
	) => Promise<boolean | GuideBookingInfo>;
	createPackageBooking: (payload: {
		p_package_id: string;
		p_payment_provider?:
			| "esewa"
			| "khalti"
			| "stripe"
			| "paypal"
			| "card"
			| "cash";
		p_paid_amount?: number;
		p_participant_count?: number;
	}) => Promise<boolean>;
	setTemporaryRemarks: (remarks: string | null) => void;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useBookingRequestStore = create<BookingRequestState>((set) => ({
	myRequests: [],
	currentRequest: null,
	temporaryRemarks: null,
	isLoading: false,
	error: null,

	fetchMyRequests: async (touristId) => {
		set({ isLoading: true, error: null });
		try {
			const resolvedId =
				touristId ?? useAuthStore.getState().profile()?.id;
			if (!resolvedId) {
				set({ myRequests: [], isLoading: false });
				return;
			}
			const myRequests = await BookingService.getGuideBookingRequests({
				touristId: resolvedId,
			});
			set({ myRequests, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	fetchRequestDetailForTourist: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const list = await BookingService.getGuideBookingRequests({
				touristId: useAuthStore.getState().profile()?.id,
			});
			const request = list.find((r) => r.id === id) ?? null;
			set({ currentRequest: request, myRequests: list, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	startRequest: async (payload) => {
		set({ isLoading: true, error: null });
		try {
			await BookingService.createHiringProposal({
				p_guide_id: payload.guide_id,
				p_destinations: payload.destinations,
				p_people_count: payload.people_count,
				p_duration_days: payload.duration_days,
				p_additional_details: payload.additional_details ?? null,
				p_tourist_remarks: payload.tourist_remarks ?? null,
			});
			set({ isLoading: false });
			return true;
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
			return false;
		}
	},

	finalizeRequest: async (id, action, payload) => {
		set({ isLoading: true, error: null });
		try {
			if (action === "cancelled") {
				await BookingService.cancelHiringProposal({
					p_proposal_id: id,
					p_tourist_remarks: payload.remarks ?? null,
				});
				set({ isLoading: false });
				return true;
			}
			const result = await BookingService.acceptHiringProposalAndCreateBooking({
				p_proposal_id: id,
				p_tourist_remarks: payload.remarks ?? null,
				p_payment_provider:
					(payload.payment_provider as
						| "esewa"
						| "khalti"
						| "stripe"
						| "paypal"
						| "card"
						| "cash") ?? "cash",
				p_paid_amount: payload.paid_amount ?? null,
			});
			set({ isLoading: false });
			return result as unknown as GuideBookingInfo;
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
			return false;
		}
	},

	createPackageBooking: async (payload) => {
		set({ isLoading: true, error: null });
		try {
			await BookingService.createPackageBooking(payload);
			set({ isLoading: false });
			return true;
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
			return false;
		}
	},

	setTemporaryRemarks: (temporaryRemarks) => set({ temporaryRemarks }),
}));
