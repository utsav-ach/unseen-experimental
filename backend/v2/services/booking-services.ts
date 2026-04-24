import { z } from "zod";
import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  HiringProposalSchema,
  GuideBookingSchema,
  PackageBookingSchema,
  CreateHiringProposalInputSchema,
  SubmitGuideOfferInputSchema,
  type HiringProposal,
  type GuideBooking,
  type PackageBooking,
  type CreateHiringProposalInput,
  type SubmitGuideOfferInput,
} from "../models/booking-models";

export class BookingService extends SupabaseServiceV2 {
  async listMyProposals(): Promise<HiringProposal[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("guide_booking_requests")
      .select("*")
      .order("created_at", { ascending: false });
    const raw = this.handle(data, error, "listMyProposals");
    return z.array(HiringProposalSchema).parse(raw);
  }

  async getProposal(id: string): Promise<HiringProposal> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("guide_booking_requests")
      .select("*")
      .eq("id", id)
      .single();
    const raw = this.handle(data, error, "getProposal");
    return HiringProposalSchema.parse(raw);
  }

  async createProposal(input: CreateHiringProposalInput): Promise<string> {
    const parsed = CreateHiringProposalInputSchema.parse(input);
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("create_hiring_proposal", parsed);
    return this.handle<string>(data as string, error, "createProposal");
  }

  async submitGuideOffer(input: SubmitGuideOfferInput): Promise<void> {
    const parsed = SubmitGuideOfferInputSchema.parse(input);
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("submit_guide_offer", parsed);
    if (error)
      throw new Error(`[BookingService.submitGuideOffer] ${error.message}`);
  }

  async rejectProposal(proposalId: string, remarks?: string): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("reject_hiring_proposal", {
      proposal_id: proposalId,
      guide_remarks: remarks ?? null,
    });
    if (error)
      throw new Error(`[BookingService.rejectProposal] ${error.message}`);
  }

  async cancelProposal(proposalId: string): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("cancel_hiring_proposal", {
      proposal_id: proposalId,
    });
    if (error)
      throw new Error(`[BookingService.cancelProposal] ${error.message}`);
  }

  async acceptAndCreateBooking(
    proposalId: string,
    prepayAmount: number,
  ): Promise<string> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc(
      "accept_hiring_proposal_and_create_booking",
      { proposal_id: proposalId, prepay_amount: prepayAmount },
    );
    return this.handle<string>(
      data as string,
      error,
      "acceptAndCreateBooking",
    );
  }

  async createPackageBooking(
    packageId: string,
    peopleCount: number,
    tripStartDate: string,
  ): Promise<string> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("create_package_booking", {
      package_id: packageId,
      people_count: peopleCount,
      trip_start_date: tripStartDate,
    });
    return this.handle<string>(data as string, error, "createPackageBooking");
  }

  async listMyGuideBookings(): Promise<GuideBooking[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("guide_bookings_info")
      .select("*")
      .order("hired_at", { ascending: false });
    const raw = this.handle(data, error, "listMyGuideBookings");
    return z.array(GuideBookingSchema).parse(raw);
  }

  async listMyPackageBookings(): Promise<PackageBooking[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("package_bookings_info")
      .select("*")
      .order("created_at", { ascending: false });
    const raw = this.handle(data, error, "listMyPackageBookings");
    return z.array(PackageBookingSchema).parse(raw);
  }
}

export const bookingService = new BookingService();
