import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(env.BACKEND_URL, env.BACKEND_PASSWORD, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Component: can't set cookies. Middleware will refresh.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Server Component: can't set cookies. Middleware will refresh.
        }
      },
    },
  });
}

export function createSupabaseServiceClient() {
  if (!env.BACKEND_SERVICE_KEY) {
    throw new Error("BACKEND_SERVICE_KEY is required for service client");
  }
  return createServerClient(env.BACKEND_URL, env.BACKEND_SERVICE_KEY, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {},
    },
  });
}
