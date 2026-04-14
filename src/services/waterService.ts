import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type WaterIntake = Tables<"water_intake">;

export const waterService = {
  async addIntake(date: string, time: string, amount_ml: number): Promise<WaterIntake> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("water_intake")
      .insert({
        user_id: user.id,
        date,
        time,
        amount_ml,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteIntake(id: string): Promise<void> {
    const { error } = await supabase
      .from("water_intake")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDailyIntake(date: string): Promise<WaterIntake[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("water_intake")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getDailyTotal(date: string): Promise<number> {
    const intake = await this.getDailyIntake(date);
    return intake.reduce((sum, item) => sum + item.amount_ml, 0);
  },
};
