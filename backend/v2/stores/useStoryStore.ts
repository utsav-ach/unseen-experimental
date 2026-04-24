"use client";

/**
 * Legacy compat store for story pages. Reads via {@link StoryService}.
 * Write operations (create/edit/delete/like/comment) are stubbed pending
 * dedicated v2 RPCs — the UI reflects failure via `error` so the user sees
 * a clean toast and no data is silently dropped.
 */

import { create } from "zustand";
import { StoryService } from "../services";
import { useAuthStore } from "./useAuthStore";
import type { Story } from "../models";

type StoryListOptions = {
	limit?: number;
	offset?: number;
	category?: string | null;
	sortBy?: string;
	searchQuery?: string;
};

interface StoryState {
	stories: Story[];
	currentStory: Story | null;
	total: number;
	isLoading: boolean;
	error: string | null;

	fetchStoriesPage: (options: StoryListOptions) => Promise<void>;
	fetchStoryDetail: (id: string) => Promise<void>;
	createStory: (
		title: string,
		content: string,
		categoriesString: string,
		tags: string[],
		featureImage: File,
	) => Promise<boolean>;
	editStory: (
		id: string,
		updates: Record<string, unknown>,
		featureImage?: File,
	) => Promise<boolean>;
	deleteStory: (id: string) => Promise<boolean>;
	toggleLike: (id: string) => Promise<void>;
	addComment: (id: string, body: string) => Promise<void>;
	getStoryPermission: (
		id: string,
	) => { canEdit: boolean; canDelete: boolean };
}

const notWired = (feature: string) =>
	`${feature} is not wired to the v2 backend yet.`;

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useStoryStore = create<StoryState>((set, get) => ({
	stories: [],
	currentStory: null,
	total: 0,
	isLoading: false,
	error: null,

	fetchStoriesPage: async (options) => {
		set({ isLoading: true, error: null });
		try {
			const sortKey =
				options.sortBy === "popular"
					? "likes_count"
					: options.sortBy === "comments"
						? "comments_count"
						: "created_at";
			const stories = await StoryService.getStories({
				limit: options.limit,
				offset: options.offset,
				searchQuery: options.searchQuery || undefined,
				category: options.category ?? undefined,
				sortBy: sortKey as "created_at" | "likes_count" | "comments_count",
			});
			set({
				stories,
				total: stories.length,
				isLoading: false,
			});
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	fetchStoryDetail: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const story = await StoryService.getStoryById(id);
			set({ currentStory: story, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	createStory: async () => {
		set({ error: notWired("Story publishing") });
		return false;
	},

	editStory: async () => {
		set({ error: notWired("Story editing") });
		return false;
	},

	deleteStory: async () => {
		set({ error: notWired("Story deletion") });
		return false;
	},

	toggleLike: async () => {
		set({ error: notWired("Story likes") });
	},

	addComment: async () => {
		set({ error: notWired("Story comments") });
	},

	getStoryPermission: (id) => {
		const story = get().currentStory;
		const profile = useAuthStore.getState().profile();
		if (!story || !profile) return { canEdit: false, canDelete: false };
		const isOwner = story.uploader_id === profile.id;
		const isAdmin = profile.is_admin === true;
		return {
			canEdit: isOwner,
			canDelete: isOwner || isAdmin,
		};
	},
}));
