"use client";

import { create } from "zustand";
import type { ApplyGuideApplicationInput } from "../models/application-models";

type Draft = Partial<ApplyGuideApplicationInput>;

interface ApplicationState {
  step: number;
  draft: Draft;
  errors: Record<string, string>;
  setStep: (step: number) => void;
  update: (patch: Draft) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  step: 0,
  draft: {},
  errors: {},
  setStep: (step) => set({ step }),
  update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setErrors: (errors) => set({ errors }),
  reset: () => set({ step: 0, draft: {}, errors: {} }),
}));
