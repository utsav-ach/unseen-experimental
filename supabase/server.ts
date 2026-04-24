/**
 * File: supabase/ssr-utils.ts
 *
 * This file is used to create a Supabase client for server-side operations.
 * It uses the createServerClient function from the @supabase/ssr package.
 *
 * @returns {Promise<SupabaseClient>} - The Supabase client
 */

import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export async function ssrClient() {
	// Dynamic import keeps `next/headers` out of client-component bundles when
	// this module is pulled transitively via SupabaseServiceV2.
	const { cookies } = await import("next/headers");
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_BACKEND_URL!, // the url
		process.env.NEXT_PUBLIC_BACKEND_PASSWORD!, // the anon key
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						);
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing user sessions.
					}
				},
			},
		},
	);
}

export async function callRpcArray<T>(
	supabase: SupabaseClient,
	fn: string,
	schema: z.ZodType<T>,
	params?: unknown,
): Promise<T[]> {
	const { data, error } = await supabase.rpc(fn, params);

	if (error) throw error;

	const parsed = z.array(schema).safeParse(data);

	if (!parsed.success) {
		console.error(`Error parsing data from RPC ${fn}:`, parsed.error);
		throw new Error(`Failed to parse data from RPC ${fn}`);
	}

	return parsed.data;
}

export async function callRpc<T>(
	supabase: SupabaseClient,
	fn: string,
	schema: z.ZodType<T>,
	params?: unknown,
): Promise<T> {
	const { data, error } = await supabase.rpc(fn, params);

	if (error) throw error;

	const parsed = schema.safeParse(data);
	if (!parsed.success) {
		console.error(`Error parsing data from RPC ${fn}:`, parsed.error);
		throw new Error(`Failed to parse data from RPC ${fn}`);
	}

	return parsed.data;
}

/**
 * Tolerant variant of {@link callRpcArray}: on any failure (missing RPC, schema
 * mismatch, network error) returns an empty array instead of throwing. Use this
 * only for non-critical read paths (e.g. homepage "featured" strips) where a
 * missing DB contract should degrade gracefully rather than crash SSR.
 */
export async function callRpcArraySafe<T>(
	supabase: SupabaseClient,
	fn: string,
	schema: z.ZodType<T>,
	params?: unknown,
): Promise<T[]> {
	try {
		return await callRpcArray(supabase, fn, schema, params);
	} catch (err) {
		console.warn(`[callRpcArraySafe] ${fn} failed; returning []`, err);
		return [];
	}
}
