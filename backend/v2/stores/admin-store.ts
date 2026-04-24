"use client";

import { create } from "zustand";

type MutationKind =
  | "destination.create"
  | "destination.update"
  | "destination.delete"
  | "activity.create"
  | "activity.update"
  | "activity.delete"
  | "package.create"
  | "package.update"
  | "package.delete"
  | "guide.approve"
  | "guide.reject"
  | "guide.suspend"
  | "guide.unsuspend";

interface MutationResult {
  id: string;
  kind: MutationKind;
  status: "pending" | "success" | "error";
  message?: string;
  at: number;
}

interface AdminState {
  mutations: MutationResult[];
  push: (m: Omit<MutationResult, "at">) => void;
  update: (id: string, patch: Partial<MutationResult>) => void;
  clear: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  mutations: [],
  push: (m) =>
    set((s) => ({ mutations: [{ ...m, at: Date.now() }, ...s.mutations] })),
  update: (id, patch) =>
    set((s) => ({
      mutations: s.mutations.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  clear: () => set({ mutations: [] }),
}));
