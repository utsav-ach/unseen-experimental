import { create } from "zustand";
import { ServiceFailure } from "@/supabase/services/supabaseServicev2";
import { ApplicationService } from "../services";
import {
	ApplyGuideApplicationParams,
	ChangeGuideApplicationStatusParams,
	GuideApplication,
	GuideServiceAreaApplication,
	UnsuspensionRequest,
} from "../models";

type ApplicationStoreError = {
	type: "VALIDATION" | "SUPABASE" | "PARSING" | "UNKNOWN";
	message: string;
	context?: string;
	originalError?: unknown;
};

interface GuideApplicationListOptions {
	userId?: string;
	status?: GuideApplication["status"];
	limit?: number;
	offset?: number;
}

interface UnsuspensionRequestListOptions {
	guideId?: string;
	status?: UnsuspensionRequest["status"];
	limit?: number;
	offset?: number;
}

interface ApplicationStoreState {
	guideApplications: GuideApplication[];
	selectedGuideApplication: GuideApplication | null;
	selectedGuideApplicationServiceAreas: GuideServiceAreaApplication[];
	unsuspensionRequests: UnsuspensionRequest[];
	lastSubmittedApplicationId: string | null;
	isLoading: boolean;
	error: ApplicationStoreError | null;

	applyGuideApplication: (
		params: ApplyGuideApplicationParams,
	) => Promise<string | null>;
	changeGuideApplicationStatus: (
		params: ChangeGuideApplicationStatusParams,
	) => Promise<GuideApplication | null>;
	fetchGuideApplications: (
		options?: GuideApplicationListOptions,
	) => Promise<void>;
	fetchGuideApplicationById: (applicationId: string) => Promise<void>;
	fetchGuideApplicationServiceAreas: (applicationId: string) => Promise<void>;
	fetchUnsuspensionRequests: (
		options?: UnsuspensionRequestListOptions,
	) => Promise<void>;

	clearSelectedGuideApplication: () => void;
	clearError: () => void;
}

const toStoreError = (error: unknown): ApplicationStoreError => {
	if (error instanceof ServiceFailure) {
		return {
			type: error.type,
			message: error.message,
			context: error.context,
			originalError: error.originalError,
		};
	}

	if (error instanceof Error) {
		return {
			type: "UNKNOWN",
			message: error.message,
			originalError: error,
		};
	}

	return {
		type: "UNKNOWN",
		message: "Unknown error",
		originalError: error,
	};
};

export const useV2ApplicationStore = create<ApplicationStoreState>((set) => ({
	guideApplications: [],
	selectedGuideApplication: null,
	selectedGuideApplicationServiceAreas: [],
	unsuspensionRequests: [],
	lastSubmittedApplicationId: null,
	isLoading: false,
	error: null,

	applyGuideApplication: async (params) => {
		set({ isLoading: true, error: null });

		try {
			const applicationId =
				await ApplicationService.applyGuideApplication(params);
			set({
				lastSubmittedApplicationId: applicationId,
				isLoading: false,
			});
			return applicationId;
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
			return null;
		}
	},

	changeGuideApplicationStatus: async (params) => {
		set({ isLoading: true, error: null });

		try {
			const updatedApplication =
				await ApplicationService.changeGuideApplicationStatus(params);
			set((state) => ({
				selectedGuideApplication:
					state.selectedGuideApplication?.application_id ===
					updatedApplication.application_id
						? updatedApplication
						: state.selectedGuideApplication,
				guideApplications: state.guideApplications.map((application) =>
					application.application_id ===
					updatedApplication.application_id
						? updatedApplication
						: application,
				),
				isLoading: false,
			}));
			return updatedApplication;
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
			return null;
		}
	},

	fetchGuideApplications: async (options) => {
		set({ isLoading: true, error: null });

		try {
			const guideApplications =
				await ApplicationService.getGuideApplications(options);
			set({ guideApplications, isLoading: false });
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
		}
	},

	fetchGuideApplicationById: async (applicationId) => {
		set({ isLoading: true, error: null });

		try {
			const selectedGuideApplication =
				await ApplicationService.getGuideApplicationById(applicationId);
			set({ selectedGuideApplication, isLoading: false });
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
		}
	},

	fetchGuideApplicationServiceAreas: async (applicationId) => {
		set({ isLoading: true, error: null });

		try {
			const selectedGuideApplicationServiceAreas =
				await ApplicationService.getGuideApplicationServiceAreas(
					applicationId,
				);
			set({ selectedGuideApplicationServiceAreas, isLoading: false });
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
		}
	},

	fetchUnsuspensionRequests: async (options) => {
		set({ isLoading: true, error: null });

		try {
			const unsuspensionRequests =
				await ApplicationService.getUnsuspensionRequests(options);
			set({ unsuspensionRequests, isLoading: false });
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
		}
	},

	clearSelectedGuideApplication: () =>
		set({
			selectedGuideApplication: null,
			selectedGuideApplicationServiceAreas: [],
		}),
	clearError: () => set({ error: null }),
}));
