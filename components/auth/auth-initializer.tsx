"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/backend/v2/stores/auth-store";

/**
 * Mounts once in the root protected layout. Hydrates the auth store from
 * the current Supabase session and keeps it in sync with auth state changes.
 *
 * Rendering this is a no-op if the public Supabase env vars are missing
 * (useful for local development without credentials).
 */
export function AuthInitializer() {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_BACKEND_URL ||
      !process.env.NEXT_PUBLIC_BACKEND_PASSWORD
    ) {
      clear();
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setSession(data.user, null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null, null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setSession, clear]);

  return null;
}
