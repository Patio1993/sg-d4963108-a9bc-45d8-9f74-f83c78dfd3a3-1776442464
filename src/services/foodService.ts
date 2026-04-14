import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Food = Tables<"foods">;

export interface CreateFoodData {
  name: string;
  unit: "g" | "ml";
  kcal: number;
  fiber: number;
  sugar: number;
  carbs: number;
  fats: number;
  protein: number;
  salt: number;
  is_favorite?: boolean;
}

export interface FoodWithLastConsumed extends Food {
  last_consumed?: string | null;
  days_ago?: number | null;
}

export const foodService = {
  async createFood(data: CreateFoodData): Promise<Food> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: food, error } = await supabase
      .from("foods")
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return food;
  },

  async updateFood(id: string, data: Partial<CreateFoodData>): Promise<Food> {
    const { data: food, error } = await supabase
      .from("foods")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return food;
  },

  async deleteFood(id: string): Promise<void> {
    const { error } = await supabase
      .from("foods")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async toggleFavorite(id: string, is_favorite: boolean): Promise<void> {
    const { error } = await supabase
      .from("foods")
      .update({ is_favorite })
      .eq("id", id);

    if (error) throw error;
  },

  async searchFoods(query: string, sortBy: "favorites" | "a-z" | "z-a" = "a-z"): Promise<FoodWithLastConsumed[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let foodsQuery = supabase
      .from("foods")
      .select("*")
      .eq("user_id", user.id);

    if (query.trim()) {
      foodsQuery = foodsQuery.ilike("name", `%${query}%`);
    }

    if (sortBy === "favorites") {
      foodsQuery = foodsQuery.order("is_favorite", { ascending: false }).order("name", { ascending: true });
    } else if (sortBy === "a-z") {
      foodsQuery = foodsQuery.order("name", { ascending: true });
    } else {
      foodsQuery = foodsQuery.order("name", { ascending: false });
    }

    const { data: foods, error } = await foodsQuery;
    if (error) throw error;

    // Get last consumed dates for all foods
    const { data: lastConsumed } = await supabase
      .from("consumed_foods")
      .select("food_id, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const lastConsumedMap = new Map<string, string>();
    lastConsumed?.forEach(item => {
      if (!lastConsumedMap.has(item.food_id)) {
        lastConsumedMap.set(item.food_id, item.date);
      }
    });

    return foods.map(food => {
      const lastDate = lastConsumedMap.get(food.id);
      if (!lastDate) {
        return { ...food, last_consumed: null, days_ago: null };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const consumed = new Date(lastDate);
      const diffTime = today.getTime() - consumed.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...food,
        last_consumed: lastDate,
        days_ago: diffDays,
      };
    });
  },

  async getAllFoods(): Promise<Food[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getFoodById(id: string): Promise<Food> {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
};
