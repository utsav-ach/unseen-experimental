"use client";

/**
 * Legacy compat store for destination discovery pages. Thin Zustand wrapper
 * over {@link DestinationService}. Keep methods narrow — any new feature
 * should call the service directly from an SSR page per AGENTS.md.
 */

import { create } from "zustand";
import { DestinationService } from "../services";
import type { Destination } from "../models";
import type { SelectionPin } from "@/components/map/selection-map";

interface FeaturedDestinationState {
	destinations: Destination[];
	currentDestinationDetails: Destination | null;
	isLoading: boolean;
	error: string | null;

	fetchDestinations: (options?: {
		limit?: number;
		offset?: number;
		searchQuery?: string;
	}) => Promise<void>;
	fetchByAreas: (pins: SelectionPin[]) => Promise<void>;
	fetchDestinationDetails: (id: string) => Promise<void>;
	clearCurrentDetails: () => void;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useFeaturedDestinationStore = create<FeaturedDestinationState>(
	(set) => ({
		destinations: [],
		currentDestinationDetails: null,
		isLoading: false,
		error: null,

		fetchDestinations: async (options) => {
			set({ isLoading: true, error: null });
			try {
				const destinations = await DestinationService.getDestinations(
					options,
				);
				set({ destinations, isLoading: false });
			} catch (err) {
				set({ error: toMessage(err), isLoading: false });
			}
		},

		fetchByAreas: async (_pins) => {
			// Area-based filtering not exposed on the v2 service yet — fall back
			// to the full list so the map search UI keeps working.
			set({ isLoading: true, error: null });
			try {
				const destinations = await DestinationService.getDestinations();
				set({ destinations, isLoading: false });
			} catch (err) {
				set({ error: toMessage(err), isLoading: false });
			}
		},

		fetchDestinationDetails: async (id) => {
			set({ isLoading: true, error: null });
			try {
				const destination = await DestinationService.getDestinationById(
					id,
				);
				set({
					currentDestinationDetails: destination,
					isLoading: false,
				});
			} catch (err) {
				set({ error: toMessage(err), isLoading: false });
			}
		},

		clearCurrentDetails: () => set({ currentDestinationDetails: null }),
	}),
);
