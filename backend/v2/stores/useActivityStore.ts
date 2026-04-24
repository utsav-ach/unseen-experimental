"use client";

/**
 * Legacy compat store for activity discovery pages. Wraps
 * {@link DestinationService.getActivities}.
 */

import { create } from "zustand";
import { DestinationService } from "../services";
import type { Activity, Destination } from "../models";

interface ActivityState {
	activities: Activity[];
	destinationsByActivity: Destination[];
	selectedActivity: Activity | null;
	isLoading: boolean;
	error: string | null;

	fetchActivities: () => Promise<void>;
	fetchDestinationsByActivity: (activityId: string) => Promise<void>;
	clearDetailState: () => void;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useActivityStore = create<ActivityState>((set, get) => ({
	activities: [],
	destinationsByActivity: [],
	selectedActivity: null,
	isLoading: false,
	error: null,

	fetchActivities: async () => {
		set({ isLoading: true, error: null });
		try {
			const activities = await DestinationService.getActivities();
			set({ activities, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	fetchDestinationsByActivity: async (activityId) => {
		set({ isLoading: true, error: null });
		try {
			const selected =
				get().activities.find((a) => a.id === activityId) ?? null;
			// No dedicated RPC in the v2 service yet — surface an empty list so
			// the detail page renders without data while the endpoint lands.
			set({
				selectedActivity: selected,
				destinationsByActivity: [],
				isLoading: false,
			});
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	clearDetailState: () =>
		set({ selectedActivity: null, destinationsByActivity: [] }),
}));
