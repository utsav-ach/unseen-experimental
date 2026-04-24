import { z } from "zod";
import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  DestinationSchema,
  DestinationReviewSchema,
  ActivitySchema,
  TravelPackageSchema,
  type Destination,
  type DestinationReview,
  type Activity,
  type TravelPackage,
} from "../models/destination-models";

export class DestinationService extends SupabaseServiceV2 {
  async listDestinations(): Promise<Destination[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.from("destinations").select("*");
    const raw = this.handle(data, error, "listDestinations");
    return z.array(DestinationSchema).parse(raw);
  }

  async getDestination(id: string): Promise<Destination> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .single();
    const raw = this.handle(data, error, "getDestination");
    return DestinationSchema.parse(raw);
  }

  async listReviews(destinationId: string): Promise<DestinationReview[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("destination_reviews")
      .select("*")
      .eq("destination_id", destinationId)
      .order("created_at", { ascending: false });
    const raw = this.handle(data, error, "listReviews");
    return z.array(DestinationReviewSchema).parse(raw);
  }

  async listActivities(): Promise<Activity[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("available_activities")
      .select("*");
    const raw = this.handle(data, error, "listActivities");
    return z.array(ActivitySchema).parse(raw);
  }

  async listDestinationPackages(): Promise<TravelPackage[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("destination_packages")
      .select("*");
    const raw = this.handle(data, error, "listDestinationPackages");
    return z.array(TravelPackageSchema).parse(raw);
  }

  async listActivityPackages(): Promise<TravelPackage[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("activities_packages")
      .select("*");
    const raw = this.handle(data, error, "listActivityPackages");
    return z.array(TravelPackageSchema).parse(raw);
  }

  async getPackage(id: string): Promise<TravelPackage> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("destination_packages")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) return TravelPackageSchema.parse(data);
    const { data: activityPkg, error: activityErr } = await supabase
      .from("activities_packages")
      .select("*")
      .eq("id", id)
      .single();
    const raw = this.handle(activityPkg, activityErr ?? error, "getPackage");
    return TravelPackageSchema.parse(raw);
  }
}

export const destinationService = new DestinationService();
