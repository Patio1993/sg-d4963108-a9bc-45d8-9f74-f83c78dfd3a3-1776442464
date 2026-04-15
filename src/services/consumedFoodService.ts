import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ConsumedFood = Tables<"consumed_foods">;
export type DailyNutritionSummary = {
  total_kcal: number;
  total_fiber: number;
  total_sugar: number;
  total_carbs: number;
  total_fats: number;
  total_protein: number;
  total_salt: number;
};

export type ConsumedFoodWithDetails = ConsumedFood & {
  food: Tables<"foods"> | null;
  days_ago?: number | null;
};

export type CreateConsumedFoodData = {
  food_id: string;
  date: string;
  time: string;
  amount: number;
  meal_type: "breakfast" | "snack" | "lunch" | "afternoon_snack" | "dinner" | "coffee";
  reaction: "good" | "neutral" | "bad";
  day_number: number;
  coffee_count?: number;
};

export const consumedFoodService = {
  async createConsumedFood(data: CreateConsumedFoodData): Promise<ConsumedFood> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: consumed, error } = await supabase
      .from("consumed_foods")
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return consumed;
  },

  async updateConsumedFood(id: string, data: Partial<CreateConsumedFoodData>): Promise<ConsumedFood> {
    const { data: consumed, error } = await supabase
      .from("consumed_foods")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return consumed;
  },

  async deleteConsumedFood(id: string): Promise<void> {
    const { error } = await supabase
      .from("consumed_foods")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDailyConsumedFoods(date: string): Promise<ConsumedFoodWithDetails[]> {
    const { data, error } = await supabase
      .from("consumed_foods")
      .select(`
        *,
        food:foods(*)
      `)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;

    // For each consumed food, calculate days_ago from TODAY (not from the displayed date)
    const today = new Date().toISOString().split("T")[0];
    const foodsWithLastConsumed = await Promise.all(
      (data || []).map(async (item) => {
        // Get last consumption of this food BEFORE today (excluding today)
        const { data: lastConsumed } = await supabase
          .from("consumed_foods")
          .select("date")
          .eq("food_id", item.food_id)
          .lt("date", today)
          .order("date", { ascending: false })
          .limit(1)
          .single();

        let days_ago: number | null = null;
        if (lastConsumed) {
          const lastDate = new Date(lastConsumed.date);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          days_ago = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          ...item,
          days_ago,
        };
      })
    );

    return foodsWithLastConsumed;
  },

  async getDailyNutritionSummary(date: string): Promise<DailyNutritionSummary> {
    const { data, error } = await supabase
      .from("consumed_foods")
      .select(`
        amount,
        food:foods(kcal, fiber, sugar, carbs, fats, protein, salt)
      `)
      .eq("date", date);

    if (error) throw error;

    const summary: DailyNutritionSummary = {
      total_kcal: 0,
      total_fiber: 0,
      total_sugar: 0,
      total_carbs: 0,
      total_fats: 0,
      total_protein: 0,
      total_salt: 0,
    };

    data?.forEach((item: any) => {
      if (item.food) {
        const ratio = item.amount / 100;
        summary.total_kcal += item.food.kcal * ratio;
        summary.total_fiber += item.food.fiber * ratio;
        summary.total_sugar += item.food.sugar * ratio;
        summary.total_carbs += item.food.carbs * ratio;
        summary.total_fats += item.food.fats * ratio;
        summary.total_protein += item.food.protein * ratio;
        summary.total_salt += item.food.salt * ratio;
      }
    });

    // Round to 2 decimal places
    Object.keys(summary).forEach((key) => {
      summary[key as keyof DailyNutritionSummary] = Math.round(summary[key as keyof DailyNutritionSummary] * 100) / 100;
    });

    return summary;
  },

  async getConsecutiveDaysForFood(foodId: string, currentDate: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let consecutiveDays = 1; // Including today
    const checkDate = new Date(currentDate + "T00:00:00");

    // Go backwards in time and count consecutive days
    while (true) {
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = checkDate.toISOString().split("T")[0];

      // Check if this food was consumed on this date
      const { data, error } = await supabase
        .from("consumed_foods")
        .select("id")
        .eq("user_id", user.id)
        .eq("food_id", foodId)
        .eq("date", dateStr)
        .limit(1);

      if (error) throw error;

      // If food was consumed on this date, increment counter
      if (data && data.length > 0) {
        consecutiveDays++;
      } else {
        // No consumption found on this date, stop counting
        break;
      }

      // Safety limit: stop after checking 365 days back
      if (consecutiveDays > 365) break;
    }

    return consecutiveDays;
  },

  async getTodayCoffeeCount(date: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("consumed_foods")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("meal_type", "coffee");

    if (error) throw error;
    return data?.length || 0;
  },
};
