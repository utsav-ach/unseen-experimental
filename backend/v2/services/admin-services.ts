import { z } from "zod";
import { SupabaseServiceV2 } from "./supabase-service-v2";
import {
  AdminAnalyticsSchema,
  AdminSystemOverviewSchema,
  type AdminAnalytics,
  type AdminSystemOverview,
} from "../models/admin-models";

export class AdminService extends SupabaseServiceV2 {
  async getSystemOverview(): Promise<AdminSystemOverview> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("admin_system_overview")
      .select("*")
      .single();
    const raw = this.handle(data, error, "getSystemOverview");
    return AdminSystemOverviewSchema.parse(raw);
  }

  async buildAnalyticsPayload(days = 30): Promise<AdminAnalytics> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc(
      "build_admin_analytics_payload",
      { days },
    );
    const raw = this.handle(data, error, "buildAnalyticsPayload");
    return AdminAnalyticsSchema.parse(raw);
  }

  async listPendingGuideApplications(): Promise<unknown[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("admin_pending_guide_applications")
      .select("*");
    const raw = this.handle(data, error, "listPendingGuideApplications");
    return z.array(z.unknown()).parse(raw);
  }

  async listPendingUnsuspensionRequests(): Promise<unknown[]> {
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from("admin_pending_unsuspension_requests")
      .select("*");
    const raw = this.handle(data, error, "listPendingUnsuspensionRequests");
    return z.array(z.unknown()).parse(raw);
  }

  async changeGuideApplicationStatus(
    applicationId: string,
    status: "approved" | "rejected" | "revision_requested",
    feedback?: string,
  ): Promise<unknown> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc(
      "change_guide_application_status",
      { application_id: applicationId, new_status: status, feedback: feedback ?? null },
    );
    return this.handle(data, error, "changeGuideApplicationStatus");
  }

  async changeGuideSuspendStatus(
    guideId: string,
    suspend: boolean,
    reason?: string,
  ): Promise<unknown> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("change_guide_suspend_status", {
      guide_id: guideId,
      suspend,
      reason: reason ?? null,
    });
    return this.handle(data, error, "changeGuideSuspendStatus");
  }

  // Destination CRUD (admin-only)
  async createDestination(payload: Record<string, unknown>): Promise<string> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc(
      "admin_create_base_destination",
      payload,
    );
    return this.handle<string>(data as string, error, "createDestination");
  }

  async updateDestination(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("admin_update_base_destination", {
      target_id: id,
      ...payload,
    });
    if (error) throw new Error(`[AdminService.updateDestination] ${error.message}`);
  }

  async deleteDestination(id: string): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("admin_delete_base_destination", {
      target_id: id,
    });
    if (error) throw new Error(`[AdminService.deleteDestination] ${error.message}`);
  }

  // Activity CRUD
  async createActivity(payload: Record<string, unknown>): Promise<string> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc("admin_create_activity", payload);
    return this.handle<string>(data as string, error, "createActivity");
  }

  async updateActivity(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("admin_update_activity", {
      target_id: id,
      ...payload,
    });
    if (error) throw new Error(`[AdminService.updateActivity] ${error.message}`);
  }

  async deleteActivity(id: string): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("admin_delete_activity", {
      target_id: id,
    });
    if (error) throw new Error(`[AdminService.deleteActivity] ${error.message}`);
  }

  // Package CRUD
  async createTravelPackage(payload: Record<string, unknown>): Promise<string> {
    const supabase = await this.createClient();
    const { data, error } = await supabase.rpc(
      "admin_create_travel_package",
      payload,
    );
    return this.handle<string>(data as string, error, "createTravelPackage");
  }

  async updateTravelPackage(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("admin_update_travel_package", {
      target_id: id,
      ...payload,
    });
    if (error)
      throw new Error(`[AdminService.updateTravelPackage] ${error.message}`);
  }

  async deleteTravelPackage(id: string): Promise<void> {
    const supabase = await this.createClient();
    const { error } = await supabase.rpc("admin_delete_travel_package", {
      target_id: id,
    });
    if (error)
      throw new Error(`[AdminService.deleteTravelPackage] ${error.message}`);
  }
}

export const adminService = new AdminService();
