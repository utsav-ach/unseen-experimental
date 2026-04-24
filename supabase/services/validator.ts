import z from "zod";
import { ServiceFailure } from "./supabaseServicev2";

export class Validator {
	/**
	 *this method is not intended for partial validation for partial validation refer to partiallyValidateAgainstSchema
	 *
	 *
	 * @param data the data to be validated
	 * @param schema the main schema against which the data needs to be validated
	 *
	 * @param readableName this is optional but just for the developer experience it adds the name of the schema in the error message so that it is easier to debug which schema is causing the issue
	 * @returns the standard result if validation is successful otherwise it throws a ServiceFailure with the details of the validation error
	 *
	 */
	static validateAgainstSchema<T>(
		data: unknown,
		schema: z.ZodType<T>,
		name = "UnknownSchema",
	): T {
		const parsed = schema.safeParse(data);

		if (!parsed.success) {
			throw new ServiceFailure(
				"VALIDATION",
				`Validation failed for ${name}`,
				parsed.error,
				name,
			);
		}

		return parsed.data;
	}

	static validateAgainstSchemaArray<T>(
		data: unknown,
		schema: z.ZodType<T>,
		name = "UnknownSchema",
	): T[] {
		const parsed = z.array(schema).safeParse(data);

		if (!parsed.success) {
			throw new ServiceFailure(
				"VALIDATION",
				`Validation failed for ${name}`,
				parsed.error,
				name,
			);
		}

		return parsed.data;
	}
}
