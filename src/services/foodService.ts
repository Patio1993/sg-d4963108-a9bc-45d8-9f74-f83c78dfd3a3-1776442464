import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Food = Tables<"foods">;

export type FoodWithLastConsumed = Food & {
  days_ago?: number | null;
};

export type CreateFoodInput = {
  name: string;
  unit: "g" | "ml";
  kcal: number;
  fiber: number;
  sugar: number;
  carbs: number;
  fats: number;
  protein: number;
  salt: number;
  photo_url?: string | null;
  emoji?: string;
};

export type UpdateFoodInput = {
  name?: string;
  unit?: "g" | "ml";
  kcal?: number;
  fiber?: number;
  sugar?: number;
  carbs?: number;
  fats?: number;
  protein?: number;
  salt?: number;
  is_favorite?: boolean;
  photo_url?: string | null;
  emoji?: string;
};

export const foodService = {
  async getAllFoods(): Promise<FoodWithLastConsumed[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("foods")
      .select(`
        *,
        consumed_foods(date)
      `)
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;

    const today = new Date().toISOString().split("T")[0];

    const foodsWithLastConsumed = (data || []).map((food: any) => {
      const consumedDates = food.consumed_foods?.map((cf: any) => cf.date) || [];
      const lastDate = consumedDates.length > 0 
        ? consumedDates.sort().reverse()[0] 
        : null;

      let daysAgo: number | null = null;
      if (lastDate) {
        const last = new Date(lastDate + "T00:00:00");
        const todayDate = new Date(today + "T00:00:00");
        const diffTime = todayDate.getTime() - last.getTime();
        daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      const { consumed_foods, ...foodData } = food;
      return {
        ...foodData,
        days_ago: daysAgo,
      };
    });

    return foodsWithLastConsumed;
  },

  async createFood(input: CreateFoodInput): Promise<Food> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("foods")
      .insert({
        user_id: user.id,
        name: input.name,
        unit: input.unit,
        kcal: input.kcal,
        fiber: input.fiber,
        sugar: input.sugar,
        carbs: input.carbs,
        fats: input.fats,
        protein: input.protein,
        salt: input.salt,
        photo_url: input.photo_url || null,
        emoji: input.emoji || "🍽️",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFood(id: string, updates: UpdateFoodInput): Promise<Food> {
    const { data, error } = await supabase
      .from("foods")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteFood(id: string): Promise<void> {
    const { error } = await supabase
      .from("foods")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from("foods")
      .update({ is_favorite: isFavorite })
      .eq("id", id);

    if (error) throw error;
  },
};
