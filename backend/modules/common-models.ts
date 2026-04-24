// Legacy compat re-exports - thin shim over backend/v2/models during v1->v2 migration.
// Do not add new types here; extend backend/v2/models/* instead.
import { z } from "zod";

export * from "@/backend/v2/models";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "revoked";

// Loose compat types referenced by legacy pages. Real definitions live in
// backend/v2/models — these are stubs to let the UI compile. Replace with the
// v2 equivalents as pages are migrated.
type Loose = Record<string, unknown>;

export type Profile = Loose;
export type PrivateProfileData = Loose;
export type Guide = Loose;
export type CompletePhotoData = Loose;
export type FeaturedDestination = Loose & {
	id: string;
	coordinates?: { lat: number; lng: number } | null;
};
export type FeaturedPackageItem = Loose;
export type MinimalDestination = Loose & { id: string };
export type TopTrendingPackage = Loose & { id: string };
export type TopTrendingStory = Loose & { id: string };
export type AdminChartPoint = { label: string; value: number } & Loose;
export type AdminLabelCount = { label: string; count: number } & Loose;
export type AdminStatusCount = { status: string; count: number } & Loose;
export type AdminMetricSnapshot = Loose;

export const MinimalDestinationSchema = z.unknown();
export const TopTrendingPackageSchema = z.unknown();
export const TopTrendingStorySchema = z.unknown();
