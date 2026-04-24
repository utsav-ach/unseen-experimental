import z from "zod";

export const enums = {
	userRole: ["tourist", "guide", "hotel_owner", "admin"],
	verificationStatus: ["pending", "approved", "rejected"],
	bookingStatus: [
		"pending",
		"confirmed",
		"completed",
		"cancelled",
		"reported",
	],
	bookingRequestStatus: [
		"pending",
		"approved",
		"rejected",
		"confirmed",
		"cancelled",
	],
	nidType: ["citizenship", "nid", "license", "pan", "passport", "voter_id"],
	guideApplicationStatus: ["pending", "approved", "rejected"],
	packageType: ["destinations_package", "activities_package"],
	proposalStatus: [
		"sent_by_tourist",
		"offered_by_guide",
		"rejected_by_guide",
		"cancelled_by_tourist",
		"accepted_by_tourist",
	],
	guideBookingStatus: ["confirmed", "completed", "cancelled"],
	packageBookingStatus: ["confirmed", "completed", "cancelled"],
	paymentProvider: ["esewa", "khalti", "stripe", "paypal", "card", "cash"],
	paymentLogStatus: ["pending", "succeeded", "failed", "refunded"],
} as const;

const makeEnumSchemas = <
	T extends Record<string, readonly [string, ...string[]]>,
>(
	obj: T,
): { [K in keyof T]: z.ZodType<T[K][number]> } => {
	const schemas = {} as { [K in keyof T]: z.ZodType<T[K][number]> };

	for (const key of Object.keys(obj) as Array<keyof T>) {
		const values = obj[key];
		schemas[key] = z.enum(
			values as unknown as [string, ...string[]],
		) as z.ZodType<T[typeof key][number]>;
	}

	return schemas;
};

export const enumSchemas = makeEnumSchemas(enums);

const nullableEnumSchemas = Object.fromEntries(
	Object.entries(enumSchemas).map(([key, schema]) => [
		key,
		schema.nullable(),
	]),
) as {
	[K in keyof typeof enumSchemas]: z.ZodNullable<(typeof enumSchemas)[K]>;
};
/**
 * fe,
 * and no for those science nerds its not iron
 *
 * fe, stands for field enums,  and it contains the enums used in our app
 * unlike the f and fn we dont need to invoke it as a function because they are already zod schemas and not factories
 *
 * we can use it directly like fe.userRole or fe.bookingStatus and so on
 *
 * When invoke is necessary ?
 * on chaining like fe.bookingStatus.default("pending") or fe.bookingStatus.nullable() and so on
 */
export const fe = enumSchemas;
export const fne = nullableEnumSchemas;
