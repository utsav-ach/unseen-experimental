"use client";

/**
 * Legacy compat store for guide detail + guide inbox. Wraps
 * {@link GuideService} and {@link BookingService}.
 */

import { create } from "zustand";
import { GuideService, BookingService } from "../services";
import type { GuideBookingRequest, GuideInfo } from "../models";

interface GuideStoreState {
	currentGuide: GuideInfo | null;
	dashboardRequests: GuideBookingRequest[];
	selectedRequest: GuideBookingRequest | null;
	isLoading: boolean;
	isLoadingDashboard: boolean;
	error: string | null;

	fetchGuideDetail: (id: string) => Promise<void>;
	fetchDashboardRequests: (guideId: string) => Promise<void>;
	fetchRequestDetails: (requestId: string) => Promise<void>;
	respondToRequest: (
		requestId: string,
		status: "approved" | "rejected",
		payload: Record<string, unknown>,
	) => Promise<boolean>;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useGuideStore = create<GuideStoreState>((set, get) => ({
	currentGuide: null,
	dashboardRequests: [],
	selectedRequest: null,
	isLoading: false,
	isLoadingDashboard: false,
	error: null,

	fetchGuideDetail: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const guide = await GuideService.getGuideById(id);
			set({ currentGuide: guide, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	fetchDashboardRequests: async (guideId) => {
		set({ isLoadingDashboard: true, error: null });
		try {
			const requests = await BookingService.getGuideBookingRequests({
				guideId,
			});
			set({ dashboardRequests: requests, isLoadingDashboard: false });
		} catch (err) {
			set({ error: toMessage(err), isLoadingDashboard: false });
		}
	},

	fetchRequestDetails: async (requestId) => {
		set({ isLoading: true, error: null });
		try {
			const selected =
				get().dashboardRequests.find((r) => r.id === requestId) ?? null;
			set({ selectedRequest: selected, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	respondToRequest: async (requestId, status, payload) => {
		set({ isLoading: true, error: null });
		try {
			if (status === "approved") {
				await BookingService.submitGuideOffer({
					p_proposal_id: requestId,
					p_total_quoted_price: Number(payload.total_cost),
					p_prepay_required: Number(payload.prepay_amount),
					p_guide_remarks: String(payload.guide_remarks ?? ""),
				});
			} else {
				await BookingService.rejectHiringProposal({
					p_proposal_id: requestId,
					p_guide_remarks: String(payload.guide_remarks ?? ""),
				});
			}
			set({ isLoading: false });
			return true;
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
			return false;
		}
	},
}));
