"use client";

/**
 * Legacy compat store for the Trek-Dai guide discovery page. Wraps
 * {@link GuideService.getGuides}.
 */

import { create } from "zustand";
import { GuideService } from "../services";
import type { GuideInfo } from "../models";

interface TrekDaiState {
	guides: GuideInfo[];
	total: number;
	isLoading: boolean;
	error: string | null;
	query: string;
	sortBy: string;

	fetchTrekDaiData: () => Promise<void>;
	loadMore: () => Promise<void>;
	setQuery: (q: string) => void;
	setSortBy: (s: string) => void;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useTrekDaiStore = create<TrekDaiState>((set, get) => ({
	guides: [],
	total: 0,
	isLoading: false,
	error: null,
	query: "",
	sortBy: "rating",

	fetchTrekDaiData: async () => {
		const { query, sortBy } = get();
		set({ isLoading: true, error: null });
		try {
			const guides = await GuideService.getGuides({
				onlyAvailable: true,
				searchQuery: query || undefined,
				sortBy:
					sortBy === "name"
						? "full_name"
						: ("avg_rating" as const),
			});
			set({ guides, total: guides.length, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	loadMore: async () => {
		// List endpoint is already unpaginated server-side; loadMore is a no-op.
		await get().fetchTrekDaiData();
	},

	setQuery: (query) => {
		set({ query });
		void get().fetchTrekDaiData();
	},

	setSortBy: (sortBy) => {
		set({ sortBy });
		void get().fetchTrekDaiData();
	},
}));
