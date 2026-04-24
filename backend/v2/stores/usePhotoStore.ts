"use client";

/**
 * Legacy compat store for photo pages. Wraps {@link StoryService.getPhotos}.
 */

import { create } from "zustand";
import { StoryService } from "../services";
import { useAuthStore } from "./useAuthStore";
import { PhotoInfoSchema } from "../models";
import type { z } from "zod";

type PhotoInfo = z.infer<typeof PhotoInfoSchema>;

interface PhotoState {
	photos: PhotoInfo[];
	currentPhoto: PhotoInfo | null;
	total: number;
	can_delete: boolean;
	isLoading: boolean;
	error: string | null;

	fetchPhotos: (options: {
		limit?: number;
		offset?: number;
		searchQuery?: string | null;
	}) => Promise<void>;
	fetchPhotoDetail: (id: string) => Promise<void>;
	createPhoto: (payload: unknown) => Promise<boolean>;
	deletePhoto: (id: string) => Promise<boolean>;
}

const notWired = (feature: string) =>
	`${feature} is not wired to the v2 backend yet.`;

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const usePhotoStore = create<PhotoState>((set) => ({
	photos: [],
	currentPhoto: null,
	total: 0,
	can_delete: false,
	isLoading: false,
	error: null,

	fetchPhotos: async (options) => {
		set({ isLoading: true, error: null });
		try {
			const photos = await StoryService.getPhotos({
				limit: options.limit,
				offset: options.offset,
				searchQuery: options.searchQuery || undefined,
			});
			set({ photos, total: photos.length, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	fetchPhotoDetail: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const photo = await StoryService.getPhotoById(id);
			const profile = useAuthStore.getState().profile();
			const canDelete = Boolean(
				profile &&
					(profile.is_admin || photo.uploader_id === profile.id),
			);
			set({
				currentPhoto: photo as unknown as PhotoInfo,
				can_delete: canDelete,
				isLoading: false,
			});
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	createPhoto: async () => {
		set({ error: notWired("Photo upload") });
		return false;
	},

	deletePhoto: async () => {
		set({ error: notWired("Photo deletion") });
		return false;
	},
}));
