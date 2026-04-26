import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, format, eachDayOfInterval } from "date-fns";

export interface WaterDataPoint {
  date: string;
  water: number;
  goal: number;
}

export const waterStatsService = {
  async getWaterData(range: "week" | "month" | "3months" | "year"): Promise<WaterDataPoint[]> {
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

    // Get all water intake records in the date range
    const { data: waterRecords, error } = await supabase
      .from("water_intake")
      .select("date, amount")
      .eq("user_id", user.id)
      .gte("date", startDateStr)
      .lte("date", endDateStr)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching water data:", error);
      return [];
    }

    // Group by date and sum amounts
    const waterByDate = new Map<string, number>();
    
    if (waterRecords) {
      waterRecords.forEach((entry) => {
        const current = waterByDate.get(entry.date) || 0;
        waterByDate.set(entry.date, current + entry.amount);
      });
    }

    // Get all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: today });

    // Build result with goal
    const result: WaterDataPoint[] = allDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const water = waterByDate.get(dateStr) || 0;
      return {
        date: dateStr,
        water: Math.round(water) / 1000, // Convert ml to liters with 1 decimal
        goal: 2.5, // Default goal: 2.5 liters
      };
    });

    return result;
  },
};