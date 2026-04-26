import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, format } from "date-fns";

export interface WeightDataPoint {
  date: string;
  weight: number | null;
  goal: number | null;
}

export const weightStatsService = {
  async getWeightData(range: "week" | "month" | "3months" | "year"): Promise<WeightDataPoint[]> {
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

    // Get weight data from daily_summary
    const { data: weightData } = await supabase
      .from("daily_summary")
      .select("date, weight")
      .eq("user_id", user.id)
      .gte("date", startDateStr)
      .lte("date", endDateStr)
      .not("weight", "is", null)
      .order("date", { ascending: true });

    // Get user's goal weight from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("goal_weight")
      .eq("id", user.id)
      .maybeSingle();

    const goalWeight = profile?.goal_weight || null;

    if (!weightData || weightData.length === 0) {
      return [];
    }

    return weightData.map((entry) => ({
      date: entry.date,
      weight: entry.weight,
      goal: goalWeight,
    }));
  },
};