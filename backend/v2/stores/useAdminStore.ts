"use client";

/**
 * Legacy compat store for admin CRUD surfaces. Legitimate shared-state store
 * per AGENTS.md — admin panels share optimistic list state across tabs and
 * need coordinated invalidation after mutations.
 *
 * Wraps {@link AdminService}, {@link DestinationService}, {@link StoryService},
 * and {@link ApplicationService}. Non-admin RPCs are used as read fallbacks
 * where dedicated admin endpoints don't yet exist.
 */

import { create } from "zustand";
import { createBrowserClient } from "@/supabase/client";
import {
	AdminService,
	ApplicationService,
	DestinationService,
	StoryService,
} from "../services";
import type {
	Activity,
	AdminBookingNegotiationQueueItem,
	AdminPackageBookingRequest,
	AdminPendingGuideApplication,
	AdminSystemOverview,
	Destination,
	DestinationPackage,
	GuideApplication,
	Story,
} from "../models";
import { PhotoInfoSchema } from "../models";
import type { z } from "zod";

type PhotoInfo = z.infer<typeof PhotoInfoSchema>;

type AdminUser = Record<string, unknown> & { id: string; is_admin?: boolean };

interface AdminDashboard {
	overview: AdminSystemOverview | null;
}

interface BookingOps {
	negotiations: AdminBookingNegotiationQueueItem[];
	packageRequests: AdminPackageBookingRequest[];
}

interface AdminState {
	// global
	isLoading: boolean;
	error: string | null;

	// dashboard
	dashboard: AdminDashboard | null;
	fetchDashboard: () => Promise<void>;

	// users
	users: AdminUser[];
	fetchUsers: (
		limit?: number,
		offset?: number,
		query?: string | null,
	) => Promise<void>;
	setUserAdminStatus: (userId: string, isAdmin: boolean) => Promise<boolean>;

	// guide applications
	guideApplications: AdminPendingGuideApplication[] | GuideApplication[];
	fetchGuideApplications: (
		status?: string,
	) => Promise<void>;
	reviewGuideApplication: (
		applicationId: string,
		decision: "approved" | "rejected",
		feedback?: string,
	) => Promise<boolean>;

	// stories
	stories: Story[];
	fetchStories: () => Promise<void>;
	deleteStory: (id: string) => Promise<boolean>;

	// photos
	photos: PhotoInfo[];
	fetchPhotos: () => Promise<void>;
	deletePhoto: (id: string) => Promise<boolean>;

	// destinations
	destinations: Destination[];
	fetchDestinations: (limit?: number, offset?: number) => Promise<void>;
	createDestination: (payload: Record<string, unknown>) => Promise<boolean>;
	updateDestination: (
		id: string,
		payload: Record<string, unknown>,
	) => Promise<boolean>;
	deleteDestination: (id: string) => Promise<boolean>;

	// packages
	packages: DestinationPackage[];
	fetchPackages: () => Promise<void>;
	deletePackage: (id: string) => Promise<boolean>;

	// activities
	activities: Activity[];
	fetchActivities: (limit?: number, offset?: number) => Promise<void>;
	createActivity: (payload: Record<string, unknown>) => Promise<boolean>;
	updateActivity: (
		id: string,
		payload: Record<string, unknown>,
	) => Promise<boolean>;
	deleteActivity: (id: string) => Promise<boolean>;

	// bookings
	bookingOps: BookingOps;
	fetchBookingOperations: () => Promise<void>;
}

const toMessage = (err: unknown) =>
	err instanceof Error ? err.message : "Unexpected error";

export const useAdminStore = create<AdminState>((set, get) => ({
	isLoading: false,
	error: null,

	dashboard: null,
	fetchDashboard: async () => {
		set({ isLoading: true, error: null });
		try {
			const overview = await AdminService.getSystemOverview();
			set({ dashboard: { overview }, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},

	users: [],
	fetchUsers: async (limit = 50, offset = 0, query = null) => {
		set({ isLoading: true, error: null });
		try {
			const supabase = createBrowserClient();
			let q = supabase
				.from("profiles")
				.select("*")
				.order("created_at", { ascending: false })
				.range(offset, offset + limit - 1);
			if (query) {
				q = q.or(
					`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`,
				);
			}
			const { data, error } = await q;
			if (error) throw error;
			set({ users: (data ?? []) as AdminUser[], isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	setUserAdminStatus: async (userId, isAdmin) => {
		try {
			const supabase = createBrowserClient();
			const { error } = await supabase
				.from("profiles")
				.update({ is_admin: isAdmin })
				.eq("id", userId);
			if (error) throw error;
			set({
				users: get().users.map((u) =>
					u.id === userId ? { ...u, is_admin: isAdmin } : u,
				),
			});
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	guideApplications: [],
	fetchGuideApplications: async (status) => {
		set({ isLoading: true, error: null });
		try {
			if (!status || status === "pending") {
				const guideApplications = await AdminService.getPendingGuideApplications();
				set({ guideApplications, isLoading: false });
			} else {
				const guideApplications = await ApplicationService.getGuideApplications(
					{
						status: status === "all" ? undefined : (status as "approved" | "rejected"),
					},
				);
				set({ guideApplications, isLoading: false });
			}
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	reviewGuideApplication: async (applicationId, decision, feedback) => {
		try {
			await AdminService.changeGuideApplicationStatus({
				p_application_id: applicationId,
				p_status: decision,
				p_admin_feedback: feedback ?? "",
			});
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	stories: [],
	fetchStories: async () => {
		set({ isLoading: true, error: null });
		try {
			const stories = await StoryService.getStories({ includeArchived: true });
			set({ stories, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	deleteStory: async (id) => {
		try {
			const supabase = createBrowserClient();
			const { error } = await supabase.from("stories").delete().eq("id", id);
			if (error) throw error;
			set({ stories: get().stories.filter((s) => s.id !== id) });
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	photos: [],
	fetchPhotos: async () => {
		set({ isLoading: true, error: null });
		try {
			const photos = await StoryService.getPhotos();
			set({ photos, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	deletePhoto: async (id) => {
		try {
			const supabase = createBrowserClient();
			const { error } = await supabase.from("photos").delete().eq("id", id);
			if (error) throw error;
			set({ photos: get().photos.filter((p) => p.id !== id) });
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	destinations: [],
	fetchDestinations: async (limit, offset) => {
		set({ isLoading: true, error: null });
		try {
			const destinations = await DestinationService.getDestinations({
				limit,
				offset,
			});
			set({ destinations, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	createDestination: async (payload) => {
		try {
			await AdminService.createBaseDestination(
				payload as Parameters<typeof AdminService.createBaseDestination>[0],
			);
			await get().fetchDestinations();
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},
	updateDestination: async (id, payload) => {
		try {
			await AdminService.updateBaseDestination({
				p_destination_id: id,
				p_name: null,
				p_radius: null,
				p_description: null,
				p_feature_image: null,
				...payload,
			} as Parameters<typeof AdminService.updateBaseDestination>[0]);
			await get().fetchDestinations();
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},
	deleteDestination: async (id) => {
		try {
			await AdminService.deleteBaseDestination({
				p_destination_id: id,
			});
			set({ destinations: get().destinations.filter((d) => d.id !== id) });
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	packages: [],
	fetchPackages: async () => {
		set({ isLoading: true, error: null });
		try {
			const packages = (await DestinationService.getPackages({
				type: "destination",
			})) as DestinationPackage[];
			set({ packages, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	deletePackage: async (id) => {
		try {
			await AdminService.deleteTravelPackage({
				p_package_id: id,
			});
			set({ packages: get().packages.filter((p) => p.id !== id) });
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	activities: [],
	fetchActivities: async (limit, offset) => {
		set({ isLoading: true, error: null });
		try {
			const activities = await DestinationService.getActivities({
				limit,
				offset,
			});
			set({ activities, isLoading: false });
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
	createActivity: async (payload) => {
		try {
			await AdminService.createActivity(
				payload as Parameters<typeof AdminService.createActivity>[0],
			);
			await get().fetchActivities();
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},
	updateActivity: async (id, payload) => {
		try {
			await AdminService.updateActivity({
				p_activity_id: id,
				p_name: null,
				p_description: null,
				...payload,
			} as Parameters<typeof AdminService.updateActivity>[0]);
			await get().fetchActivities();
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},
	deleteActivity: async (id) => {
		try {
			await AdminService.deleteActivity({
				p_activity_id: id,
			});
			set({ activities: get().activities.filter((a) => a.id !== id) });
			return true;
		} catch (err) {
			set({ error: toMessage(err) });
			return false;
		}
	},

	bookingOps: { negotiations: [], packageRequests: [] },
	fetchBookingOperations: async () => {
		set({ isLoading: true, error: null });
		try {
			const [negotiations, packageRequests] = await Promise.all([
				AdminService.getBookingNegotiationQueue(),
				AdminService.getPackageBookingRequests(),
			]);
			set({
				bookingOps: { negotiations, packageRequests },
				isLoading: false,
			});
		} catch (err) {
			set({ error: toMessage(err), isLoading: false });
		}
	},
}));
