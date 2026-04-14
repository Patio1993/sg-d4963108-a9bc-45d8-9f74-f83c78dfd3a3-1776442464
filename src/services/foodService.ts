import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Food = Tables<"foods">;

export type FoodWithLastConsumed = Food & {
  days_ago?: number | null;
};

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

  async searchFoods(query: string): Promise<FoodWithLastConsumed[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .ilike("name", `%${query}%`)
      .order("name");

    if (error) throw error;

    // Calculate days_ago for each food from TODAY (not from any specific date)
    const today = new Date().toISOString().split("T")[0];
    const foodsWithLastConsumed = await Promise.all(
      (data || []).map(async (food) => {
        // Get last consumption of this food BEFORE today (excluding today)
        const { data: lastConsumed } = await supabase
          .from("consumed_foods")
          .select("date")
          .eq("food_id", food.id)
          .lt("date", today)
          .order("date", { ascending: false })
          .limit(1)
          .single();

        let days_ago: number | null = null;
        if (lastConsumed) {
          const lastDate = new Date(lastConsumed.date + "T00:00:00");
          const todayDate = new Date(today + "T00:00:00");
          const diffTime = todayDate.getTime() - lastDate.getTime();
          days_ago = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          ...food,
          days_ago,
        };
      })
    );

    return foodsWithLastConsumed;
  },

  async getFavoriteFoods(): Promise<FoodWithLastConsumed[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .order("name");

    if (error) throw error;

    // Calculate days_ago for each food from TODAY
    const today = new Date().toISOString().split("T")[0];
    const foodsWithLastConsumed = await Promise.all(
      (data || []).map(async (food) => {
        // Get last consumption of this food BEFORE today (excluding today)
        const { data: lastConsumed } = await supabase
          .from("consumed_foods")
          .select("date")
          .eq("food_id", food.id)
          .lt("date", today)
          .order("date", { ascending: false })
          .limit(1)
          .single();

        let days_ago: number | null = null;
        if (lastConsumed) {
          const lastDate = new Date(lastConsumed.date + "T00:00:00");
          const todayDate = new Date(today + "T00:00:00");
          const diffTime = todayDate.getTime() - lastDate.getTime();
          days_ago = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          ...food,
          days_ago,
        };
      })
    );

    return foodsWithLastConsumed;
  },

  async getAllFoods(): Promise<FoodWithLastConsumed[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order("name");

    if (error) throw error;

    // Calculate days_ago for each food from TODAY
    const today = new Date().toISOString().split("T")[0];
    const foodsWithLastConsumed = await Promise.all(
      (data || []).map(async (food) => {
        // Get last consumption of this food BEFORE today (excluding today)
        const { data: lastConsumed } = await supabase
          .from("consumed_foods")
          .select("date")
          .eq("food_id", food.id)
          .lt("date", today)
          .order("date", { ascending: false })
          .limit(1)
          .single();

        let days_ago: number | null = null;
        if (lastConsumed) {
          const lastDate = new Date(lastConsumed.date + "T00:00:00");
          const todayDate = new Date(today + "T00:00:00");
          const diffTime = todayDate.getTime() - lastDate.getTime();
          days_ago = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
          ...food,
          days_ago,
        };
      })
    );

    return foodsWithLastConsumed;
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
