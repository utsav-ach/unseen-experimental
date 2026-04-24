// Legacy compat re-exports - thin shim over backend/v2/models during v1->v2 migration.
// Do not add new types here; extend backend/v2/models/* instead.
import { z } from "zod";

export * from "@/backend/v2/models";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "revoked";

// ---------------------------------------------------------------------------
// Loose compat types referenced by legacy pages. Real definitions live in
// backend/v2/models — these are stubs to let the UI compile. Replace with the
// v2 equivalents as pages are migrated.
// ---------------------------------------------------------------------------

export type Profile = Record<string, any>;
export type PrivateProfileData = Record<string, any>;
export type Guide = Record<string, any>;
export type CompletePhotoData = Record<string, any>;
export type FeaturedDestination = Record<string, any> & {
	id: string;
	coordinates?: { lat: number; lng: number } | null;
};
export type FeaturedPackageItem = Record<string, any>;
export type MinimalDestination = Record<string, any> & { id: string };
export type TopTrendingPackage = Record<string, any> & { id: string };
export type TopTrendingStory = Record<string, any> & { id: string };
export type AdminChartPoint = { label: string; value: number } & Record<string, any>;
export type AdminLabelCount = { label: string; count: number } & Record<string, any>;
export type AdminStatusCount = { status: string; count: number } & Record<string, any>;
export type AdminMetricSnapshot = Record<string, any>;

export const MinimalDestinationSchema = z.any();
export const TopTrendingPackageSchema = z.any();
export const TopTrendingStorySchema = z.any();
