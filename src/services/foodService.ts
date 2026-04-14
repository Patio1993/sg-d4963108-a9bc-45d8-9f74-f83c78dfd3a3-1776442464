import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type FoodEntry = Tables<"food_entries">;
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export interface CreateFoodEntryInput {
  meal_type: MealType;
  food_name: string;
  portion: string;
  calories: number;
  eaten_at?: string;
}

export interface UpdateFoodEntryInput {
  meal_type?: MealType;
  food_name?: string;
  portion?: string;
  calories?: number;
  eaten_at?: string;
}

export const foodService = {
  async createEntry(input: CreateFoodEntryInput): Promise<FoodEntry | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("food_entries")
      .insert({
        user_id: user.id,
        meal_type: input.meal_type,
        food_name: input.food_name,
        portion: input.portion,
        calories: input.calories,
        eaten_at: input.eaten_at || new Date().toISOString(),
      })
      .select()
      .single();

    console.log("Create entry:", { data, error });
    if (error) {
      console.error("Error creating entry:", error);
      throw error;
    }
    return data;
  },

  async getTodayEntries(): Promise<FoodEntry[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from("food_entries")
      .select("*")
      .gte("eaten_at", today.toISOString())
      .lt("eaten_at", tomorrow.toISOString())
      .order("eaten_at", { ascending: false });

    console.log("Get today entries:", { data, error });
    if (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }
    return data || [];
  },

  async updateEntry(id: string, input: UpdateFoodEntryInput): Promise<FoodEntry | null> {
    const { data, error } = await supabase
      .from("food_entries")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    console.log("Update entry:", { data, error });
    if (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
    return data;
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from("food_entries")
      .delete()
      .eq("id", id);

    console.log("Delete entry:", { error });
    if (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },
};