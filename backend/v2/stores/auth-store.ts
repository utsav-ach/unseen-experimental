"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../models/user-models";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (user: User | null, profile: Profile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setSession: (user, profile) => set({ user, profile, isLoading: false }),
  clear: () => set({ user: null, profile: null, isLoading: false }),
}));
