/**
 * Legacy compat alias. Thin bridge over the real v2 {@link UserService}.
 * Returns the `{ isSuccess, backendError }` shape the pre-migration pages
 * consume. Prefer UserService directly for new work.
 */

import { createBrowserClient } from "@/supabase/client";
import { UserService } from "./user-services";
import type { AuthProfile } from "../models";

type Result<T> = {
	isSuccess: boolean;
	data?: T;
	backendError?: unknown;
};

async function updateUserProfile(
	userId: string,
	payload: Record<string, unknown>,
): Promise<Result<unknown>> {
	try {
		const supabase = createBrowserClient();
		const { data, error } = await supabase
			.from("profiles")
			.update(payload)
			.eq("id", userId)
			.select()
			.maybeSingle();
		if (error) return { isSuccess: false, backendError: error };
		return { isSuccess: true, data };
	} catch (err) {
		return { isSuccess: false, backendError: err };
	}
}

async function uploadAndReplaceFile(
	userId: string,
	field: string,
	file: File,
): Promise<Result<string>> {
	try {
		const supabase = createBrowserClient();
		const path = `users/${userId}/${field}-${Date.now()}-${file.name}`;
		const { error: upErr } = await supabase.storage
			.from("public-assets")
			.upload(path, file, { upsert: true });
		if (upErr) return { isSuccess: false, backendError: upErr };
		const { data } = supabase.storage
			.from("public-assets")
			.getPublicUrl(path);
		const update = await updateUserProfile(userId, {
			[field]: data.publicUrl,
		});
		if (!update.isSuccess) return { isSuccess: false, backendError: update.backendError };
		return { isSuccess: true, data: data.publicUrl };
	} catch (err) {
		return { isSuccess: false, backendError: err };
	}
}

export const profileService = {
	async fetchProfile(targetId?: string): Promise<AuthProfile | null> {
		try {
			return await UserService.fetchProfile(targetId);
		} catch {
			return null;
		}
	},

	async update(
		userId: string,
		payload: Record<string, unknown>,
	): Promise<Result<unknown>> {
		return await updateUserProfile(userId, payload);
	},

	async updateWithFiles(
		userId: string,
		payload: Record<string, unknown>,
		files: { public?: Record<string, File> },
	): Promise<Result<unknown>> {
		const base = await updateUserProfile(userId, payload);
		if (!base.isSuccess) return base;

		if (files?.public) {
			for (const [field, file] of Object.entries(files.public)) {
				if (!(file instanceof File)) continue;
				const uploaded = await uploadAndReplaceFile(userId, field, file);
				if (!uploaded.isSuccess) return uploaded;
			}
		}
		return { isSuccess: true };
	},
};
