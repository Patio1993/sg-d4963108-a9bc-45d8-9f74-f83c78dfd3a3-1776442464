import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type WaterIntake = Tables<"water_intake">;

export const waterService = {
  async getDailyWaterIntakes(date: string): Promise<WaterIntake[]> {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("water_intake")
      .select("amount_ml")
      .eq("user_id", user.id)
      .eq("date", date);

    if (error) throw error;

    const total = data?.reduce((sum, intake) => sum + intake.amount_ml, 0) || 0;
    return total;
  },

  async addWaterIntake(date: string, amount_ml: number, time: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("water_intake")
      .insert({
        user_id: user.id,
        date,
        amount_ml,
        time,
      });

    if (error) throw error;
  },

  async deleteWaterIntake(id: string): Promise<void> {
    const { error } = await supabase
      .from("water_intake")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
