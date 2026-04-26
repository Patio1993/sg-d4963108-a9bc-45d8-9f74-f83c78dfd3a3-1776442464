import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, format, eachDayOfInterval } from "date-fns";

export interface CaloriesDataPoint {
  date: string;
  calories: number;
  goal: number;
}

export const caloriesStatsService = {
  async getCaloriesData(range: "week" | "month" | "3months" | "year"): Promise<CaloriesDataPoint[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date();
    let startDate: Date;

    switch (range) {
      case "week":
        startDate = subDays(today, 7);
        break;
      case "month":
        startDate = subMonths(today, 1);
        break;
      case "3months":
        startDate = subMonths(today, 3);
        break;
      case "year":
        startDate = subMonths(today, 12);
        break;
      default:
        startDate = subDays(today, 7);
    }

    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(today, "yyyy-MM-dd");

    // Get all consumed foods in the date range
    const { data: consumedFoods, error } = await supabase
      .from("consumed_foods")
      .select(`
        date,
        amount,
        food:foods(kcal)
      `)
      .eq("user_id", user.id)
      .gte("date", startDateStr)
      .lte("date", endDateStr)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching calories data:", error);
      return [];
    }

    // Group by date and sum calories
    const caloriesByDate = new Map<string, number>();
    
    if (consumedFoods) {
      consumedFoods.forEach((entry) => {
        if (!entry.food) return;
        const kcal = (entry.food.kcal * entry.amount) / 100;
        const current = caloriesByDate.get(entry.date) || 0;
        caloriesByDate.set(entry.date, current + kcal);
      });
    }

    // Get all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: today });

    // Build result with goal
    const result: CaloriesDataPoint[] = allDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const calories = caloriesByDate.get(dateStr) || 0;
      return {
        date: dateStr,
        calories: Math.round(calories),
        goal: 2000, // Default goal
      };
    });

    // Filter out days with 0 calories (optional - keep all days for better visualization)
    return result;
  },
};