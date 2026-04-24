/**
 * Legacy compat alias. Thin bridge over the real v2 {@link GuideService}.
 * Returns the `{ isSuccess, backendError }` shape pre-migration pages
 * consume. Prefer GuideService directly for new work.
 */

import { createBrowserClient } from "@/supabase/client";
import type { GuideProfile } from "../models";

type Result<T> = {
	isSuccess: boolean;
	data?: T;
	backendError?: unknown;
};

export const guideService = {
	async getByUserId(userId: string): Promise<GuideProfile | null> {
		try {
			const supabase = createBrowserClient();
			const { data, error } = await supabase
				.from("guides")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle();
			if (error) return null;
			return (data as GuideProfile | null) ?? null;
		} catch {
			return null;
		}
	},

	async updateGuide(
		guideId: string,
		payload: Record<string, unknown>,
	): Promise<Result<unknown>> {
		try {
			const supabase = createBrowserClient();
			const { data, error } = await supabase
				.from("guides")
				.update(payload)
				.eq("id", guideId)
				.select()
				.maybeSingle();
			if (error) return { isSuccess: false, backendError: error };
			return { isSuccess: true, data };
		} catch (err) {
			return { isSuccess: false, backendError: err };
		}
	},
};
