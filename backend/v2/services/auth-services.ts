import { SupabaseServiceV2 } from "./supabase-service-v2";

export class AuthService extends SupabaseServiceV2 {
  async getSessionUser() {
    const supabase = await this.createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async signInWithPassword(email: string, password: string) {
    const supabase = await this.createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data.user;
  }

  async signUpWithPassword(email: string, password: string) {
    const supabase = await this.createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data.user;
  }

  async signOut() {
    const supabase = await this.createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
}

export const authService = new AuthService();
