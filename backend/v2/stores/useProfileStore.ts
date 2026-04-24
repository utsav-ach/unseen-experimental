"use client";

/**
 * Legacy compat store for the profile dashboard. Reads private profile data
 * off the `profiles` table (RLS keeps it scoped to the signed-in user).
 */

import { create } from "zustand";
import { createBrowserClient } from "@/supabase/client";

type PrivateProfileData = Record<string, unknown>;

interface ProfileState {
	myPrivateData: PrivateProfileData | null;
	isLoading: boolean;
	error: string | null;
	fetchMyPrivateData: (id?: string) => Promise<void>;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useProfileStore = create<ProfileState>((set) => ({
	myPrivateData: null,
	isLoading: false,
	error: null,

	fetchMyPrivateData: async (id) => {
		if (!id) return;
		set({ isLoading: true, error: null });
		try {
			const supabase = createBrowserClient();
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", id)
				.maybeSingle();
			if (error) throw error;
			set({ myPrivateData: data ?? null, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
}));
