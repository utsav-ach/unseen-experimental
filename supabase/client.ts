/**
 * File: supabase/client.ts
 *
 * This file is used to create a Supabase client for client-side operations.
 * It uses the createBrowserClient function from the @supabase/ssr package.
 *
 * @returns {Promise<SupabaseClient>} - The Supabase client
 */

import { createClient } from "@supabase/supabase-js";

export function createBrowserClient() {
	return createClient(
		process.env.NEXT_PUBLIC_BACKEND_URL!, // the url
		process.env.NEXT_PUBLIC_BACKEND_PASSWORD!, // the anon key
	);
}
