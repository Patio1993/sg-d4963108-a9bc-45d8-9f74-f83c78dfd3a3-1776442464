<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ConsumedFood = Tables<"consumed_foods">;

export interface ConsumedFoodWithDetails extends ConsumedFood {
  food: Tables<"foods">;
  calculated_kcal: number;
  calculated_fiber: number;
  calculated_sugar: number;
  calculated_carbs: number;
  calculated_fats: number;
  calculated_protein: number;
  calculated_salt: number;
}

export interface CreateConsumedFoodData {
  food_id: string;
  date: string;
  time: string;
  amount: number;
  meal_type: "breakfast" | "snack" | "lunch" | "afternoon_snack" | "dinner" | "coffee";
  reaction?: "good" | "neutral" | "bad";
  day_number: number;
  coffee_count?: number;
}

export interface DailyNutritionSummary {
  total_kcal: number;
  total_fiber: number;
  total_sugar: number;
  total_carbs: number;
  total_fats: number;
  total_protein: number;
  total_salt: number;
}

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("consumed_foods")
      .select("*, food:foods(*)")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;

    return (data || []).map(item => {
      const food = item.food as Tables<"foods">;
      const multiplier = item.amount / 100;

      return {
        ...item,
        food,
        calculated_kcal: parseFloat((food.kcal * multiplier).toFixed(2)),
        calculated_fiber: parseFloat((food.fiber * multiplier).toFixed(2)),
        calculated_sugar: parseFloat((food.sugar * multiplier).toFixed(2)),
        calculated_carbs: parseFloat((food.carbs * multiplier).toFixed(2)),
        calculated_fats: parseFloat((food.fats * multiplier).toFixed(2)),
        calculated_protein: parseFloat((food.protein * multiplier).toFixed(2)),
        calculated_salt: parseFloat((food.salt * multiplier).toFixed(2)),
      };
    });
  },

  async getDailyNutritionSummary(date: string): Promise<DailyNutritionSummary> {
    const foods = await this.getDailyConsumedFoods(date);

    return foods.reduce(
      (acc, item) => ({
        total_kcal: parseFloat((acc.total_kcal + item.calculated_kcal).toFixed(2)),
        total_fiber: parseFloat((acc.total_fiber + item.calculated_fiber).toFixed(2)),
        total_sugar: parseFloat((acc.total_sugar + item.calculated_sugar).toFixed(2)),
        total_carbs: parseFloat((acc.total_carbs + item.calculated_carbs).toFixed(2)),
        total_fats: parseFloat((acc.total_fats + item.calculated_fats).toFixed(2)),
        total_protein: parseFloat((acc.total_protein + item.calculated_protein).toFixed(2)),
        total_salt: parseFloat((acc.total_salt + item.calculated_salt).toFixed(2)),
      }),
      {
        total_kcal: 0,
        total_fiber: 0,
        total_sugar: 0,
        total_carbs: 0,
        total_fats: 0,
        total_protein: 0,
        total_salt: 0,
      }
    );
  },

  async getNextDayNumber(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("consumed_foods")
      .select("day_number")
      .eq("user_id", user.id)
      .order("day_number", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? data.day_number + 1 : 1;
  },

  async getTodayCoffeeCount(date: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("consumed_foods")
      .select("coffee_count")
      .eq("user_id", user.id)
      .eq("date", date)
      .eq("meal_type", "coffee")
      .order("coffee_count", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.coffee_count || 0;
  },
};
</consumedFoodService.ts>
