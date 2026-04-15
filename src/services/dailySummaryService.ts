import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DailySummary = Tables<"daily_summary">;

export type NutritionGoalStatus = {
  fiber: "good" | "warning" | "danger" | "neutral";
  sugar: "good" | "warning" | "danger" | "neutral";
  fats: "good" | "warning" | "danger" | "neutral";
};

export const dailySummaryService = {
  async getOrCreateDailySummary(date: string): Promise<DailySummary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: initialData, error } = await supabase
      .from("daily_summary")
      .select("*")
      .eq("date", date)
      .eq("user_id", user.id)
      .single();

    let data = initialData;

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      const { data: newSummary, error: createError } = await supabase
        .from("daily_summary")
        .insert({
          user_id: user.id,
          date,
          exercise: false,
          walk_minutes: 0,
          restaurant: false,
        })
        .select()
        .single();

      if (createError) throw createError;
      data = newSummary;
    }

    return data;
  },

  async updateDailySummary(
    date: string,
    updates: Partial<Pick<DailySummary, "exercise" | "walk_minutes" | "restaurant">>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("daily_summary")
      .update(updates)
      .eq("date", date)
      .eq("user_id", user.id);

    if (error) throw error;
  },

  async getLastRestaurantVisit(): Promise<{ date: string; days_ago: number } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_summary")
      .select("date")
      .eq("user_id", user.id)
      .eq("restaurant", true)
      .lt("date", today)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!data) return null;

    const lastDate = new Date(data.date + "T00:00:00");
    const todayDate = new Date(today + "T00:00:00");
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      date: data.date,
      days_ago: diffDays,
    };
  },

  evaluateNutritionGoals(fiber: number, sugar: number, fats: number): NutritionGoalStatus {
    const evaluateNutrient = (
      value: number,
      min: number,
      max: number
    ): "good" | "warning" | "danger" | "neutral" => {
      if (value === 0) return "neutral";
      if (value >= min && value <= max) return "good";
      if (value < min) return "warning";
      return "danger";
    };

    return {
      fiber: evaluateNutrient(fiber, 25, 30),
      sugar: evaluateNutrient(sugar, 30, 50),
      fats: evaluateNutrient(fats, 50, 60),
    };
  },
};
