"use client";

/**
 * Legacy compat store for package discovery pages. Wraps
 * {@link DestinationService.getPackages}.
 */

import { create } from "zustand";
import { DestinationService } from "../services";
import type { DestinationPackage } from "../models";

interface PackageState {
	featuredPackages: DestinationPackage[];
	currentPackage: DestinationPackage | null;
	isLoading: boolean;
	error: string | null;

	fetchFeaturedPackages: () => Promise<void>;
	fetchPackageDetails: (id: string) => Promise<void>;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const usePackageStore = create<PackageState>((set, get) => ({
	featuredPackages: [],
	currentPackage: null,
	isLoading: false,
	error: null,

	fetchFeaturedPackages: async () => {
		set({ isLoading: true, error: null });
		try {
			const featuredPackages =
				(await DestinationService.getPackages({
					type: "destination",
				})) as DestinationPackage[];
			set({ featuredPackages, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	fetchPackageDetails: async (id) => {
		set({ isLoading: true, error: null });
		try {
			let pkg = get().featuredPackages.find((p) => p.id === id) ?? null;
			if (!pkg) {
				const list = (await DestinationService.getPackages({
					type: "destination",
				})) as DestinationPackage[];
				set({ featuredPackages: list });
				pkg = list.find((p) => p.id === id) ?? null;
			}
			set({ currentPackage: pkg, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
}));
