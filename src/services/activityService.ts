import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Activity = Tables<"activities">;
export type UserActivity = Tables<"user_activities">;

export type UserActivityWithDetails = UserActivity & {
  activity: Activity | null;
};

export const activityService = {
  async getAllActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async createActivity(name: string): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDailyActivities(date: string): Promise<UserActivityWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("user_activities")
      .select(`
        *,
        activity:activities(*)
      `)
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addUserActivity(activityId: string, date: string, time: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("user_activities")
      .insert({
        user_id: user.id,
        activity_id: activityId,
        date,
        time,
      });

    if (error) throw error;
  },

  async deleteUserActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from("user_activities")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
