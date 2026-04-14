<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DailySummary = Tables<"daily_summary">;

export interface UpdateDailySummaryData {
  exercise?: boolean;
  walk_minutes?: number;
  restaurant?: boolean;
}

export interface NutritionGoalStatus {
  fiber: "low" | "good" | "high";
  sugar: "low" | "good" | "high";
  fats: "low" | "good" | "high";
}

export const dailySummaryService = {
  async getOrCreateDailySummary(date: string): Promise<DailySummary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: existing } = await supabase
      .from("daily_summary")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .single();

    if (existing) return existing;

    const { data, error } = await supabase
      .from("daily_summary")
      .insert({
        user_id: user.id,
        date,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDailySummary(date: string, data: UpdateDailySummaryData): Promise<DailySummary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    await this.getOrCreateDailySummary(date);

    const { data: summary, error } = await supabase
      .from("daily_summary")
      .update(data)
      .eq("user_id", user.id)
      .eq("date", date)
      .select()
      .single();

    if (error) throw error;
    return summary;
  },

  evaluateNutritionGoals(fiber: number, sugar: number, fats: number): NutritionGoalStatus {
    return {
      fiber: fiber < 25 ? "low" : fiber > 30 ? "high" : "good",
      sugar: sugar < 30 ? "low" : sugar > 50 ? "high" : "good",
      fats: fats < 50 ? "low" : fats > 60 ? "high" : "good",
    };
  },

  async getLastRestaurantVisit(currentDate: string): Promise<{ date: string; days_ago: number } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("daily_summary")
      .select("date")
      .eq("user_id", user.id)
      .eq("restaurant", true)
      .lt("date", currentDate)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!data) return null;

    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    const last = new Date(data.date);
    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      date: data.date,
      days_ago: diffDays,
    };
  },
};
</dailySummaryService.ts>
