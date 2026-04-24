import { Package } from "lucide-react";
import { z } from "zod";
import { f, fe, fn } from "../schemas";

/**
 * Thsi is the reference schema
 * all the fields that reference other table follow it
 * instead of just raw uuid it returns a object in destinations modules
 */

const RefSchema = z.object({
	id: f.uuid(), // the actual reference id
	name: f.name(), // the name of the  field,
});

/**
 * Destinations module schemas
 * Includes: tables + views contracts (module has no write RPC in canonical app-rpc)
 */

/// THe sort options for the destination modules
export type DestinationSortOption =
	| "avg_rating" //
	| "name"
	| "price"
	| "expiration_date";

export type DestinationReviewSortOptions = "rating" | "created_at";

export type PackageSortOption =
	| "actual_price"
	| "discounted_price"
	| "expiration_date";

export const DestinationSchema = z.object({
	id: f.uuid(),
	name: f.name(),

	coordinates: f.gis(),
	radius: f.positiveNumber(),

	avg_rating: fn.ratings(),
	tags: f.tags().default([]),
	description: fn.name(),

	feature_image: fn.url(),
	additional_images: f.stringArray().default([]),

	possible_activities: z.array(RefSchema).default([]),
});

export type Destination = z.infer<typeof DestinationSchema>;

const ReviewerSchema = z.object({
	id: f.uuid(),
	name: f.name(),
	username: fn.username(),
	avatar: fn.url(),
	is_guide: z.boolean(),
});

export const DestinationReviewSchema = z.object({
	id: f.uuid(),
	destination_id: f.uuid(),

	rating: fn.ratings(),
	review_text: fn.name(),
	created_at: f.datetime(),

	reviewer: ReviewerSchema,
});

export type DestinationReview = z.infer<typeof DestinationReviewSchema>;

export const ActivitySchema = z.object({
	id: f.uuid(),
	name: f.name(),
	description: f.name(),
});

export type Activity = z.infer<typeof ActivitySchema>;

/**
 * View contracts
 */

export const DestinationPackagesViewSchema = z.object({
	id: f.uuid(),
	name: f.name(),

	actual_price: f.money(),
	discounted_price: f.money(),
	expiration_date: fn.datetime(),

	featured_image: f.url(),
	additional_images: f.stringArray(20),

	total_days: z.number().int().positive(),
	travel_routes: f.name(),
	description: fn.name(),

	destinations_covered: z.array(RefSchema).default([]),
	included_activities: z.array(RefSchema).default([]),

	main_activity: RefSchema.nullable(),
});

export type DestinationPackage = z.infer<typeof DestinationPackagesViewSchema>;

export const ActivityPackageSchema = z.object({
	id: f.uuid(),
	name: f.name(),

	actual_price: f.money(),
	discounted_price: f.money(),
	expiration_date: fn.datetime(),

	featured_image: f.url(),
	additional_images: f.stringArray(20),

	total_days: z.number().int().positive(),
	travel_routes: f.name(),
	description: fn.name(),

	destinations_covered: z.array(RefSchema).default([]),

	additional_activities_included: z.array(RefSchema).default([]),
	main_activity: RefSchema.nullable(),
});

export type ActivityPackage = z.infer<typeof ActivityPackageSchema>;
