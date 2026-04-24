import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Base class for all v2 services. Each service extends this and calls
 * `this.createClient()` to get a Supabase client bound to the current
 * request's auth state.
 *
 * Services must:
 *  - read through views (preferred) or RPC
 *  - write through RPC only (no direct inserts/updates/deletes from frontend)
 *  - validate all outputs with Zod schemas
 */
export abstract class SupabaseServiceV2 {
  protected async createClient(): Promise<SupabaseClient> {
    return createSupabaseServerClient();
  }

  protected handle<T>(
    data: T | null,
    error: { message: string } | null,
    context: string,
  ): T {
    if (error) {
      throw new Error(`[${this.constructor.name}.${context}] ${error.message}`);
    }
    if (data === null || data === undefined) {
      throw new Error(`[${this.constructor.name}.${context}] empty response`);
    }
    return data;
  }
}
