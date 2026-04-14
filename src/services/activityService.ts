<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Activity = Tables<"activities">;
export type UserActivity = Tables<"user_activities">;

export interface UserActivityWithDetails extends UserActivity {
  activity: Activity;
}

export const activityService = {
  async getAllActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addUserActivity(activityId: string, date: string, time: string): Promise<UserActivity> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("user_activities")
      .insert({
        user_id: user.id,
        activity_id: activityId,
        date,
        time,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDailyActivities(date: string): Promise<UserActivityWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("user_activities")
      .select("*, activity:activities(*)")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deleteUserActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from("user_activities")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
</activityService.ts>
