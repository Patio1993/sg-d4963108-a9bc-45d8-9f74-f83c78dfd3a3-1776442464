import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export interface ProfileUpdate {
  full_name?: string | null;
  nickname?: string | null;
  age?: number | null;
  weight?: number | null;
  gender?: "male" | "female" | "other" | null;
  avatar_url?: string | null;
  fiber_min?: number | null;
  fiber_max?: number | null;
  fiber_target?: number | null;
  sugar_min?: number | null;
  sugar_max?: number | null;
  sugar_target?: number | null;
  carbs_min?: number | null;
  carbs_max?: number | null;
  carbs_target?: number | null;
  fats_min?: number | null;
  fats_max?: number | null;
  fats_target?: number | null;
  protein_min?: number | null;
  protein_max?: number | null;
  protein_target?: number | null;
  salt_max?: number | null;
  kcal_min?: number | null;
  kcal_max?: number | null;
  kcal_target?: number | null;
  water_goal_ml?: number | null;
  health_goal?: "lose_weight" | "maintain" | "gain_muscle" | "improve_digestion" | null;
}

export const profileService = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  },

  async updateProfile(updates: ProfileUpdate): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Delete old avatar if exists
    await supabase.storage
      .from("avatars")
      .remove([fileName]);

    // Upload new avatar
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl.includes("avatars")) return;

    try {
      // Extract path from URL (remove cache busting params and domain)
      const urlParts = avatarUrl.split("?")[0].split("/avatars/");
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (error) console.error("Error deleting avatar:", error);
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  },

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },
};