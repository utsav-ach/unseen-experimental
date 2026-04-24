import { createBrowserClient } from "../client";
import z from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseStorageService } from "./storage-service";

/**
 * The type of error
 */
export type ServiceErrorType =
	| "VALIDATION"
	| "SUPABASE"
	| "PARSING"
	| "UNKNOWN";

export class ServiceFailure extends Error {
	public type: ServiceErrorType;
	public originalError?: unknown;
	public context?: string;

	constructor(
		type: ServiceErrorType,
		message: string,
		originalError?: unknown,
		context?: string,
	) {
		super(message);
		this.name = "ServiceFailure";
		this.type = type;
		this.originalError = originalError;
		this.context = context;
	}
}

export class SupabaseServiceV2 {
	protected static isInitialized = false;
	protected static _instance: SupabaseServiceV2;

	public static storage = SupabaseStorageService;

	protected constructor() {}

	/**
	 * In browser:
	 * we can reuse one instance safely
	 * No SSR constraints there
	 */
	private static browserClient: SupabaseClient | null = null;

	/**
	 *
	 * @returns a shared client for all services
	 * The service is smart enough to know environment and give the necessarey client accordingly
	 * There is no cached client and for each request new client is made
	 * this is the standard pattern supaabse expects so it is perfectly fine
	 *
	 */
	public static async getClient(): Promise<SupabaseClient> {
		if (typeof window === "undefined") {
			// Server-side: dynamic import so next/headers isn't pulled into client bundles.
			const { ssrClient } = await import("../server");
			return await ssrClient();
		} else {
			if (!SupabaseServiceV2.browserClient) {
				SupabaseServiceV2.browserClient = createBrowserClient();
			}
			return SupabaseServiceV2.browserClient;
		}
	}

	/**
	 *
	 * THis will throw error if the result is not expected format
	 *
	 * @param result
	 * @param schema
	 * @returns
	 */
	protected static parse<T>(
		data: unknown,
		schema: z.ZodType<T>,
		context = "Parsing",
	): T {
		const parsed = schema.safeParse(data);

		if (!parsed.success) {
			throw new ServiceFailure(
				"PARSING",
				"Failed to parse response",
				parsed.error,
				context,
			);
		}

		return parsed.data;
	}

	protected static parseArray<T>(
		data: unknown,
		schema: z.ZodType<T>,
		context = "Parsing",
	): T[] {
		const parsed = z.array(schema).safeParse(data);

		if (!parsed.success) {
			throw new ServiceFailure(
				"PARSING",
				"Failed to parse response",
				parsed.error,
				context,
			);
		}

		return parsed.data;
	}

	protected static async execute<T>(
		fn: () => PromiseLike<{ data: T | null; error: any }>,
		context = "SupabaseOperation",
	): Promise<T> {
		const res = await fn();

		if (res.error) {
			throw new ServiceFailure(
				"SUPABASE",
				res.error.message || "Supabase error",
				res.error,
				context,
			);
		}

		if (res.data === null) {
			throw new ServiceFailure(
				"SUPABASE",
				"Unexpected null data",
				null,
				context,
			);
		}

		return res.data;
	}

	/**
	 *
	 * Runs either a RPC call or a query
	 * This is just for DRY code and not intended to be used directly, use the more specific methods like callRpc or executeAgainstSchema for better error context
	 *
	 * @param fn
	 * @param schema
	 * @param context
	 * @returns
	 */
	protected static async run<T>(
		fn: () => PromiseLike<{ data: unknown; error: any }>,
		schema: z.ZodType<T>,
		context: string,
	): Promise<T> {
		const raw = await this.execute(fn, context);
		return this.parse(raw, schema, context);
	}

	/**
	 *
	 *
	 * @param supabase : The  supabase client to use
	 * @param fn : the name of the rpc function to call
	 * @param schema : the schema against which the result will be validated make sure the schema is synced properly with backend
	 * @param params : the parameters to pass to the rpc function
	 * @returns :the result of the rpc call validated against the schema
	 * @throws : error if the rpc call fails or if the result does not match the schema
	 *
	 * This is a helper method to call rpc functions and validate the result against a zod schema
	 */
	public static async callRpc<T>(
		fn: string,
		schema: z.ZodType<T>,
		params?: unknown,
	): Promise<T> {
		const supabase = await this.getClient();

		return this.run(() => supabase.rpc(fn, params), schema, `RPC:${fn}`);
	}

	public static async callRpcArray<T>(
		fn: string,
		schema: z.ZodType<T>,
		params?: unknown,
	): Promise<T[]> {
		const supabase = await this.getClient();

		return this.run(
			() => supabase.rpc(fn, params),
			z.array(schema),
			`RPC:${fn}`,
		);
	}

	/**
	 * View/Table query (“against schema”)
	 *
	 * The views or table must be queried inside of this
	 * Avoidd using execute for the views or query
	 * it auto parses against the schema and throws error if the result is not in expected format
	 *
	 */
	public static async query<T>(
		fn: () => PromiseLike<{ data: unknown; error: any }>,
		schema: z.ZodType<T>,
		context = "QUERY",
	): Promise<T> {
		return this.run(fn, schema, context);
	}

	public static async delete(table: string, id: string): Promise<void> {
		const supabase = await this.getClient();

		await this.execute(
			() => supabase.from(table).delete().eq("id", id),
			`DELETE:${table}`,
		);
	}

	public static async getById<T>(
		table: string,
		id: string,
		schema: z.ZodType<T>,
	): Promise<T> {
		const supabase = await this.getClient();

		return this.query(
			() => supabase.from(table).select("*").eq("id", id).single(),
			schema,
			`GET_BY_ID:${table}`,
		);
	}

	public static async getAllByIds<T>(
		table: string,
		ids: string[],
		schema: z.ZodType<T>,
	): Promise<T[]> {
		const supabase = await this.getClient();

		return this.query(
			() => supabase.from(table).select("*").in("id", ids),
			z.array(schema),
			`GET_ALL_BY_IDS:${table}`,
		);
	}

	/**
	 * Convert coordinates to PostGIS POINT format
	 * @param longitude - The longitude
	 * @param latitude - The latitude
	 * @returns A string in the format 'POINT(longitude latitude)'
	 */
	public static convertToGeoLocationText(
		longitude: number,
		latitude: number,
	): string {
		return `POINT(${longitude} ${latitude})`;
	}
}
