import { z } from "zod";

export const HiringProposalStatus = z.enum([
  "sent_by_tourist",
  "offered_by_guide",
  "rejected_by_guide",
  "cancelled_by_tourist",
  "accepted_by_tourist",
]);
export type HiringProposalStatus = z.infer<typeof HiringProposalStatus>;

export const BookingStatus = z.enum([
  "pending_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const PaymentStatus = z.enum([
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const GuideApplicationStatus = z.enum([
  "pending",
  "approved",
  "rejected",
  "revision_requested",
]);
export type GuideApplicationStatus = z.infer<typeof GuideApplicationStatus>;

export const UnsuspensionRequestStatus = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export type UnsuspensionRequestStatus = z.infer<
  typeof UnsuspensionRequestStatus
>;

export const TravelPackageType = z.enum(["destination", "activity"]);
export type TravelPackageType = z.infer<typeof TravelPackageType>;

export const StoryVisibility = z.enum(["public", "unlisted", "archived"]);
export type StoryVisibility = z.infer<typeof StoryVisibility>;
