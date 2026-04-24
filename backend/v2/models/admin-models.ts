import { z } from "zod";
import { Uuid, Timestamp } from "../schemas/field-types";

export const AdminAnalyticsSchema = z.object({
  id: Uuid,
  type: z.string(),
  payload: z.record(z.unknown()),
  captured_at: Timestamp,
});
export type AdminAnalytics = z.infer<typeof AdminAnalyticsSchema>;

export const AdminSystemOverviewSchema = z.object({
  total_users: z.number().int().min(0),
  total_guides: z.number().int().min(0),
  pending_guide_applications: z.number().int().min(0),
  active_bookings: z.number().int().min(0),
  pending_payment_reviews: z.number().int().min(0),
  suspended_guides: z.number().int().min(0),
});
export type AdminSystemOverview = z.infer<typeof AdminSystemOverviewSchema>;
