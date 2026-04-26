import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, format } from "date-fns";

export interface NutrientData {
  nutrient: string;
  average: number;
  goal: number;
  percentage: number;
  color: string;
  unit: string;
}

export interface NutritionAnalysisData {
  nutrients: NutrientData[];
  dateRange: string;
}

export const nutritionAnalysisService = {
  async getNutritionAnalysis(
    range: "week" | "month" | "3months" | "year",
    mealType: "all" | "breakfast" | "lunch" | "dinner" | "snack" | "olovrant"
  ): Promise<NutritionAnalysisData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        nutrients: [],
        dateRange: "",
      };
    }

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

    // Apply meal type filter
    let query = supabase
      .from("consumed_foods")
      .select(`
        date,
        amount,
        meal_type,
        food:foods(kcal, fiber, sugar, carbs, fats, protein, salt)
      `)
      .eq("user_id", user.id)
      .gte("date", startDateStr)
      .lte("date", endDateStr);

    if (mealType !== "all") {
      // Map frontend mealType to database meal_type value
      const dbMealType = mealType === "olovrant" ? "afternoon_snack" : mealType;
      query = query.eq("meal_type", dbMealType);
    }

    const { data: consumedFoods, error } = await query;

    if (error) {
      console.error("Error fetching nutrition data:", error);
      return {
        nutrients: [],
        dateRange: `${format(startDate, "d.M.")} - ${format(today, "d.M.")}`,
      };
    }

    // Aggregate totals
    if (consumedFoods) {
      consumedFoods.forEach((entry) => {
        if (!entry.food) return;
        
        const ratio = entry.amount / 100;
        
        totals.kcal += entry.food.kcal * ratio;
        totals.protein += entry.food.protein * ratio;
        totals.carbs += entry.food.carbs * ratio;
        totals.sugar += entry.food.sugar * ratio;
        totals.fats += entry.food.fats * ratio;
        totals.fiber += entry.food.fiber * ratio;
        totals.salt += entry.food.salt * ratio;
      });
    }

    // Calculate number of days in range
    const daysDiff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const days = daysDiff > 0 ? daysDiff : 1;

    // Calculate averages
    const avgKcal = totalKcal / days;
    const avgProtein = totalProtein / days;
    const avgCarbs = totalCarbs / days;
    const avgSugar = totalSugar / days;
    const avgFats = totalFats / days;
    const avgFiber = totalFiber / days;
    const avgSalt = totalSalt / days;

    // Define goals
    const goals = {
      kcal: 2000,
      protein: 80,
      carbs: 220,
      sugar: 50,
      fats: 60,
      fiber: 30,
      salt: 5,
    };

    const nutrients: NutrientData[] = [
      {
        nutrient: "Energia",
        average: Math.round(avgKcal),
        goal: goals.kcal,
        percentage: Math.round((avgKcal / goals.kcal) * 1000) / 10,
        color: "#757575",
        unit: "kcal",
      },
      {
        nutrient: "Bielkoviny",
        average: Math.round(avgProtein * 10) / 10,
        goal: goals.protein,
        percentage: Math.round((avgProtein / goals.protein) * 1000) / 10,
        color: "#E53935",
        unit: "g",
      },
      {
        nutrient: "Sacharidy",
        average: Math.round(avgCarbs * 10) / 10,
        goal: goals.carbs,
        percentage: Math.round((avgCarbs / goals.carbs) * 1000) / 10,
        color: "#42A5F5",
        unit: "g",
      },
      {
        nutrient: "Cukry",
        average: Math.round(avgSugar * 10) / 10,
        goal: goals.sugar,
        percentage: Math.round((avgSugar / goals.sugar) * 1000) / 10,
        color: "#1565C0",
        unit: "g",
      },
      {
        nutrient: "Tuky",
        average: Math.round(avgFats * 10) / 10,
        goal: goals.fats,
        percentage: Math.round((avgFats / goals.fats) * 1000) / 10,
        color: "#FDD835",
        unit: "g",
      },
      {
        nutrient: "Vláknina",
        average: Math.round(avgFiber * 10) / 10,
        goal: goals.fiber,
        percentage: Math.round((avgFiber / goals.fiber) * 1000) / 10,
        color: "#7CB342",
        unit: "g",
      },
      {
        nutrient: "Soľ",
        average: Math.round(avgSalt * 10) / 10,
        goal: goals.salt,
        percentage: Math.round((avgSalt / goals.salt) * 1000) / 10,
        color: "#BDBDBD",
        unit: "g",
      },
    ];

    return {
      nutrients,
      dateRange: `${format(startDate, "d.M.")} - ${format(today, "d.M.")}`,
    };
  },
};