"use client";

/**
 * LEGACY SHIM: useStoryStore
 *
 * Part of the v1 -> v2 migration. Intentionally minimal / loose-typed.
 * It exists only to keep the UI compiling until pages are refactored to call
 * backend/v2 services directly.
 *
 * DO NOT expand this shim. When you refactor a consuming page:
 *   1. Replace usage of this store with a direct call to the relevant
 *      backend/v2/services/*.ts service (SSR preferred).
 *   2. Delete this file once no consumer remains.
 *
 * See AGENTS.md (Store Creation Rule).
 */

import { create } from "zustand";

type StoryStoreState = {
	currentStory: any;
	error: any;
	isLoading: any;
	stories: any;
	total: any;
	addComment: (...args: any[]) => Promise<any>;
	createStory: (...args: any[]) => Promise<any>;
	deleteStory: (...args: any[]) => Promise<any>;
	editStory: (...args: any[]) => Promise<any>;
	fetchStoriesPage: (...args: any[]) => Promise<any>;
	fetchStoryDetail: (...args: any[]) => Promise<any>;
	getStoryPermission: (...args: any[]) => Promise<any>;
	toggleLike: (...args: any[]) => Promise<any>;
	[key: string]: any;
};

const initialState: StoryStoreState = {
	currentStory: null,
	error: null,
	isLoading: null,
	stories: null,
	total: null,
	addComment: async (..._args: any[]) => undefined,
	createStory: async (..._args: any[]) => undefined,
	deleteStory: async (..._args: any[]) => undefined,
	editStory: async (..._args: any[]) => undefined,
	fetchStoriesPage: async (..._args: any[]) => undefined,
	fetchStoryDetail: async (..._args: any[]) => undefined,
	getStoryPermission: async (..._args: any[]) => undefined,
	toggleLike: async (..._args: any[]) => undefined,
};

export const useStoryStore = create<StoryStoreState>(() => initialState);
