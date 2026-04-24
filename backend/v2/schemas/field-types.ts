/// Simple helpers to avoid repetition in the schemas below
///

import z, { negative, number } from "zod";
import { enumSchemas } from "./enums";
import { gisToObjectSchema, objectToGisSchema } from "./gis-types";

/// useful for dx and less boilerplate code

/**
 * These are the only fields that our schemas use
 * The schemas should never ever use the direct zod types
 *
 * this makes code cleaner and changing in one place can change the whole app
 *
 * If in  future more fields or types are needed we can add them here.
 */
const baseFieldTypes = {
	uuid: () => z.string().uuid(),
	username: () =>
		z
			.string()
			.trim()
			.min(3)
			.max(30)
			.regex(
				/^[a-z0-9_\.]{3,30}$/i,
				"Username can only contain letters, numbers, underscores, and dots.",
			),
	email: () => z.string().email(),

	phone: () =>
		z
			.string()
			.trim()
			.regex(
				/^\+[1-9][0-9]{7,14}$/,
				"Phone number must have country code assigned (e.g., +1234567890)",
			),
	name: () =>
		z
			.string()
			.trim()
			.min(2)
			.max(100)
			.regex(
				/^[a-zA-Z\s-]+$/,
				"Name can only contain letters, spaces and hyphens.",
			),
	bool: () => z.boolean(),
	money: () =>
		z.number().refine((val) => val > 0, "Money must be a positive number"), // example money field must pass +ve regex and have no limit

	// number releted fields
	positiveNumber: () =>
		z.number().refine((val) => val > 0, "Value must be a positive number"), // example positive number field must be greater than 0

	negativeNumber: () =>
		z.number().refine((val) => val < 0, "Value must be a negative number"), // example negative number field must be less than 0

	ratings: () =>
		z
			.number()
			.refine(
				(val) => val >= 0 && val <= 5,
				"Rating must be between 0 and 5",
			), // example rating field must be between 0 and 5

	url: () => z.string().url(),
	tags: (max: number = 10) =>
		z
			.array(z.string().trim())
			.max(max, `Cannot have more than ${max} tags`), // example tags field is an array of strings with a max limit

	/// special text field which postgres gis expects
	gis: () => gisToObjectSchema,
	gisInput: () => objectToGisSchema,

	/// datetime fields must be in ISO format and we can add more validation if needed
	/// Expected format is "2024-01-01T00:00:00.000Z"
	datetime: () =>
		z
			.string()
			.refine(
				(val) => !isNaN(Date.parse(val)),
				"Invalid datetime format, must be ISO string",
			),

	/// array of strings
	stringArray: (max: number = 10) => z.array(z.string().trim()).max(max),

	/// Special password field which must be at least 8 characters, contain at least one one number or one special character
	password: () =>
		z
			.string()
			.trim()
			.min(8, "Password must be at least 8 characters long")
			.regex(
				/(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/,
				"Password must contain at least one number or one special character",
			),
};

type FieldFactory = () => z.ZodTypeAny;

type MakeNullable<T extends Record<string, FieldFactory>> = {
	[K in keyof T]: () => z.ZodNullable<ReturnType<T[K]>>;
};

export function makeNullable<T extends Record<string, FieldFactory>>(
	fields: T,
): MakeNullable<T> {
	const result = {} as MakeNullable<T>;

	for (const key in fields) {
		result[key] = (() =>
			fields[key]().nullable()) as MakeNullable<T>[typeof key];
	}

	return result;
}

export const nullableFieldTypes = makeNullable(baseFieldTypes);

/**
 * F stands for fields
 * they are the zod schemas for basic fields like name, email, phone, etc
 * We will use these in our app too much
 */

export const f = baseFieldTypes;

/**
 * These are just the Nullable versions of above fields
 *
 * You can use fn.email() to get a nullable email field
 *
 * Or even you can chain the .nullable() to get a nullable version of any field like f.email().nullable()
 *
 * But for a consistent codebase and to avoid confusion we will use fn for nullable fields and f for non-nullable fields
 *
 */
export const fn = makeNullable(baseFieldTypes);
