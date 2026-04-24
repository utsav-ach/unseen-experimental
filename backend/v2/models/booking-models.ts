import { z } from "zod";
import { Uuid, Timestamp, Money, PositiveInt } from "../schemas/field-types";
import {
  HiringProposalStatus,
  BookingStatus,
  PaymentStatus,
} from "../schemas/enums";

export const HiringProposalSchema = z.object({
  id: Uuid,
  tourist_id: Uuid,
  guide_id: Uuid,
  destinations: z.array(Uuid),
  people_count: PositiveInt,
  duration_days: PositiveInt,
  total_quoted_price: Money.nullable(),
  prepay_required: Money.nullable(),
  status: HiringProposalStatus,
  tourist_remarks: z.string().nullable(),
  guide_remarks: z.string().nullable(),
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type HiringProposal = z.infer<typeof HiringProposalSchema>;

export const GuideBookingSchema = z.object({
  id: Uuid,
  proposal_id: Uuid,
  tourist_id: Uuid,
  guide_id: Uuid,
  final_amount: Money,
  prepay_amount: Money,
  paid_amount: Money,
  status: BookingStatus,
  trip_start_date: Timestamp.nullable(),
  hired_at: Timestamp,
});
export type GuideBooking = z.infer<typeof GuideBookingSchema>;

export const PackageBookingSchema = z.object({
  id: Uuid,
  package_id: Uuid,
  tourist_id: Uuid,
  people_count: PositiveInt,
  total_amount: Money,
  paid_amount: Money,
  status: BookingStatus,
  trip_start_date: Timestamp.nullable(),
  created_at: Timestamp,
});
export type PackageBooking = z.infer<typeof PackageBookingSchema>;

export const PaymentLogSchema = z.object({
  id: Uuid,
  guide_booking_id: Uuid.nullable(),
  package_booking_id: Uuid.nullable(),
  tourist_id: Uuid,
  provider: z.string(),
  provider_txn_id: z.string(),
  amount: Money,
  currency: z.string(),
  status: PaymentStatus,
  raw_response: z.unknown().nullable(),
  created_at: Timestamp,
});
export type PaymentLog = z.infer<typeof PaymentLogSchema>;

export const CreateHiringProposalInputSchema = z.object({
  guide_id: Uuid,
  destinations: z.array(Uuid).min(1),
  people_count: PositiveInt,
  duration_days: PositiveInt,
  tourist_remarks: z.string().optional(),
});
export type CreateHiringProposalInput = z.infer<
  typeof CreateHiringProposalInputSchema
>;

export const SubmitGuideOfferInputSchema = z.object({
  proposal_id: Uuid,
  total_quoted_price: Money,
  prepay_required: Money,
  guide_remarks: z.string().optional(),
});
export type SubmitGuideOfferInput = z.infer<typeof SubmitGuideOfferInputSchema>;
