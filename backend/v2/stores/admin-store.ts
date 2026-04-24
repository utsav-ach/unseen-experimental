import { create } from "zustand";
import { ServiceFailure } from "@/supabase/services/supabaseServicev2";
import { AdminService } from "../services";
import {
	ChangeGuideApplicationStatusParams,
	ChangeGuideApplicationStatusResult,
	ChangeGuideSuspendStatusParams,
	ChangeGuideSuspendStatusResult,
} from "../models";

type AdminStoreError = {
	type: "VALIDATION" | "SUPABASE" | "PARSING" | "UNKNOWN";
	message: string;
	context?: string;
	originalError?: unknown;
};

interface AdminStoreState {
	lastGuideApplicationStatusChange: ChangeGuideApplicationStatusResult | null;
	lastGuideSuspendStatusChange: ChangeGuideSuspendStatusResult | null;
	isLoading: boolean;
	error: AdminStoreError | null;

	changeGuideApplicationStatus: (
		params: ChangeGuideApplicationStatusParams,
	) => Promise<ChangeGuideApplicationStatusResult | null>;
	changeGuideSuspendStatus: (
		params: ChangeGuideSuspendStatusParams,
	) => Promise<ChangeGuideSuspendStatusResult | null>;
	clearError: () => void;
	resetMutationState: () => void;
}

const toStoreError = (error: unknown): AdminStoreError => {
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

export const useV2AdminStore = create<AdminStoreState>((set) => ({
	lastGuideApplicationStatusChange: null,
	lastGuideSuspendStatusChange: null,
	isLoading: false,
	error: null,

	changeGuideApplicationStatus: async (params) => {
		set({ isLoading: true, error: null });

		try {
			const updatedGuideApplication =
				await AdminService.changeGuideApplicationStatus(params);
			set({
				lastGuideApplicationStatusChange: updatedGuideApplication,
				isLoading: false,
			});
			return updatedGuideApplication;
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
			return null;
		}
	},

	changeGuideSuspendStatus: async (params) => {
		set({ isLoading: true, error: null });

		try {
			const updatedGuideSuspendState =
				await AdminService.changeGuideSuspendStatus(params);
			set({
				lastGuideSuspendStatusChange: updatedGuideSuspendState,
				isLoading: false,
			});
			return updatedGuideSuspendState;
		} catch (error) {
			set({ error: toStoreError(error), isLoading: false });
			return null;
		}
	},

	clearError: () => set({ error: null }),
	resetMutationState: () =>
		set({
			lastGuideApplicationStatusChange: null,
			lastGuideSuspendStatusChange: null,
		}),
}));
