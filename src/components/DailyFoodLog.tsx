import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodEntryCard } from "./FoodEntryCard";
import type { FoodEntry, MealType } from "@/services/foodService";
import { Utensils } from "lucide-react";

interface DailyFoodLogProps {
  entries: FoodEntry[];
  onDeleteEntry: (id: string) => void;
}

const MEAL_ORDER: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

export function DailyFoodLog({ entries, onDeleteEntry }: DailyFoodLogProps) {
  const groupedEntries = entries.reduce((acc, entry) => {
    const meal = entry.meal_type as MealType;
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push(entry);
    return acc;
  }, {} as Record<MealType, FoodEntry[]>);

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils className="h-6 w-6" />
              <div>
                <h3 className="text-sm font-medium opacity-90">Today's Total</h3>
                <p className="text-3xl font-bold">{totalCalories} cal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">{entries.length} entries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Utensils className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No entries yet</h3>
            <p className="text-sm text-muted-foreground">Start tracking your meals using the form above</p>
          </CardContent>
        </Card>
      ) : (
        MEAL_ORDER.map((mealType) => {
          const mealEntries = groupedEntries[mealType];
          if (!mealEntries || mealEntries.length === 0) return null;

          const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

          return (
            <div key={mealType} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{mealType}</h3>
                <span className="text-sm font-medium text-muted-foreground">{mealCalories} cal</span>
              </div>
              <div className="space-y-2">
                {mealEntries.map((entry) => (
                  <FoodEntryCard key={entry.id} entry={entry} onDelete={onDeleteEntry} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}