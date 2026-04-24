"use client";

/**
 * Legacy compat store for the guide-application wizard. Wraps
 * {@link ApplicationService}. Legitimate shared-state store — onboarding
 * status is read from multiple layouts/guards.
 */

import { create } from "zustand";
import { ApplicationService } from "../services";
import { useAuthStore } from "./useAuthStore";
import { storyService } from "../services/storyService";
import type { GuideApplication } from "../models";

interface ApplicationState {
	myApplications: GuideApplication[];
	isLoading: boolean;
	error: string | null;
	signedUrls: Record<string, string>;

	fetchMyApplications: () => Promise<void>;
	loadProofUrl: (applicationId: string, url: string) => Promise<string | null>;
	clearHistory: () => void;
	submitApplication: (
		fields: {
			nid_document_type: string;
			nid_number: string;
			description?: string;
			previous_experience?: string;
			known_languages?: string[];
			service_areas?: unknown[];
		},
		nidPhoto: File | null,
	) => Promise<boolean>;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useGuideApplicationStore = create<ApplicationState>((set, get) => ({
	myApplications: [],
	isLoading: false,
	error: null,
	signedUrls: {},

	loadProofUrl: async (applicationId, url) => {
		const existing = get().signedUrls[applicationId];
		if (existing) return existing;
		set({ signedUrls: { ...get().signedUrls, [applicationId]: url } });
		return url;
	},

	clearHistory: () => set({ myApplications: [], signedUrls: {}, error: null }),

	fetchMyApplications: async () => {
		set({ isLoading: true, error: null });
		try {
			const profileId = useAuthStore.getState().profile()?.id;
			if (!profileId) {
				set({ myApplications: [], isLoading: false });
				return;
			}
			const myApplications = await ApplicationService.getGuideApplications(
				{ userId: profileId },
			);
			set({ myApplications, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	submitApplication: async (fields, nidPhoto) => {
		set({ isLoading: true, error: null });
		try {
			const profile = useAuthStore.getState().profile();
			if (!profile) {
				throw new Error("Must be signed in to apply as a guide.");
			}

			let photoUrl = "";
			if (nidPhoto instanceof File) {
				const path = `guide-applications/${profile.id}-${Date.now()}-${nidPhoto.name}`;
				const uploaded = await storyService.uploadPublicFile(
					"public-assets",
					path,
					nidPhoto,
				);
				if (!uploaded?.publicUrl) {
					throw new Error("Failed to upload ID photo.");
				}
				photoUrl = uploaded.publicUrl;
			}

			await ApplicationService.applyGuideApplication({
				p_nid_document_type: fields.nid_document_type as Parameters<
					typeof ApplicationService.applyGuideApplication
				>[0]["p_nid_document_type"],
				p_nid_number: fields.nid_number,
				p_nid_photo_url: photoUrl,
				p_description: fields.description ?? null,
				p_previous_experience: fields.previous_experience ?? null,
				p_known_languages: fields.known_languages ?? [],
				p_service_areas: (fields.service_areas ?? []) as Parameters<
					typeof ApplicationService.applyGuideApplication
				>[0]["p_service_areas"],
			});
			set({ isLoading: false });
			return true;
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
			return false;
		}
	},
}));
