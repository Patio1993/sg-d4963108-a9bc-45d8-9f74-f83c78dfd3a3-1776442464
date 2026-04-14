import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";

interface DailySummaryCardProps {
  date: string;
  nutrition: DailyNutritionSummary;
  goals: NutritionGoalStatus;
  exercise: boolean;
  walkMinutes: number;
  restaurant: boolean;
  waterTotal: number;
  lastRestaurant: { date: string; days_ago: number } | null;
  onExerciseChange: (checked: boolean) => void;
  onWalkMinutesChange: (minutes: number) => void;
  onRestaurantChange: (checked: boolean) => void;
  onNutrientClick: (nutrient: string) => void;
}

export function DailySummaryCard({
  date,
  nutrition,
  goals,
  exercise,
  walkMinutes,
  restaurant,
  waterTotal,
  lastRestaurant,
  onExerciseChange,
  onWalkMinutesChange,
  onRestaurantChange,
  onNutrientClick,
}: DailySummaryCardProps) {
  const getStatusColor = (status: "low" | "good" | "high") => {
    switch (status) {
      case "low":
        return "text-orange-600";
      case "good":
        return "text-green-600";
      case "high":
        return "text-red-600";
    }
  };

  const getStatusEmoji = (status: "low" | "good" | "high") => {
    switch (status) {
      case "low":
        return "⚠️";
      case "good":
        return "✅";
      case "high":
        return "🔴";
    }
  };

  const formatLastRestaurant = () => {
    if (!lastRestaurant) return "";
    const days = lastRestaurant.days_ago;
    const date = new Date(lastRestaurant.date);
    const dayNames = ["nedeľa", "pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota"];
    const dayName = dayNames[date.getDay()];
    const dateStr = date.toLocaleDateString("sk-SK");

    if (days === 2) return `predvčerom – ${dayName} (${dateStr})`;
    return `pred ${days} dňami – ${dayName} (${dateStr})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Denný sumár</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNutrientClick("kcal")}
            className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
          >
            <div className="text-2xl font-bold text-green-600">{nutrition.total_kcal}</div>
            <div className="text-sm text-muted-foreground">Kcal</div>
          </button>

          <button
            onClick={() => onNutrientClick("fiber")}
            className={`p-4 bg-card border-2 rounded-lg text-center hover:bg-muted/50 transition-colors ${
              goals.fiber === "good" ? "border-green-500" : goals.fiber === "low" ? "border-orange-500" : "border-red-500"
            }`}
          >
            <div className={`text-2xl font-bold ${getStatusColor(goals.fiber)}`}>
              {nutrition.total_fiber}g {getStatusEmoji(goals.fiber)}
            </div>
            <div className="text-sm text-muted-foreground">Vláknina</div>
            <div className="text-xs text-muted-foreground">25-30g</div>
          </button>

          <button
            onClick={() => onNutrientClick("sugar")}
            className={`p-4 bg-card border-2 rounded-lg text-center hover:bg-muted/50 transition-colors ${
              goals.sugar === "good" ? "border-green-500" : goals.sugar === "low" ? "border-orange-500" : "border-red-500"
            }`}
          >
            <div className={`text-2xl font-bold ${getStatusColor(goals.sugar)}`}>
              {nutrition.total_sugar}g {getStatusEmoji(goals.sugar)}
            </div>
            <div className="text-sm text-muted-foreground">Cukor</div>
            <div className="text-xs text-muted-foreground">30-50g</div>
          </button>

          <button
            onClick={() => onNutrientClick("fats")}
            className={`p-4 bg-card border-2 rounded-lg text-center hover:bg-muted/50 transition-colors ${
              goals.fats === "good" ? "border-green-500" : goals.fats === "low" ? "border-orange-500" : "border-red-500"
            }`}
          >
            <div className={`text-2xl font-bold ${getStatusColor(goals.fats)}`}>
              {nutrition.total_fats}g {getStatusEmoji(goals.fats)}
            </div>
            <div className="text-sm text-muted-foreground">Tuky</div>
            <div className="text-xs text-muted-foreground">50-60g</div>
          </button>

          <button
            onClick={() => onNutrientClick("carbs")}
            className="p-4 bg-card border rounded-lg text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl font-bold text-primary">{nutrition.total_carbs}g</div>
            <div className="text-sm text-muted-foreground">Sacharidy</div>
          </button>

          <button
            onClick={() => onNutrientClick("protein")}
            className="p-4 bg-card border rounded-lg text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl font-bold text-primary">{nutrition.total_protein}g</div>
            <div className="text-sm text-muted-foreground">Bielkoviny</div>
          </button>

          <button
            onClick={() => onNutrientClick("salt")}
            className="p-4 bg-card border rounded-lg text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl font-bold text-primary">{nutrition.total_salt}g</div>
            <div className="text-sm text-muted-foreground">Soľ</div>
          </button>

          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{waterTotal}ml</div>
            <div className="text-sm text-muted-foreground">Voda</div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Checkbox id="exercise" checked={exercise} onCheckedChange={onExerciseChange} />
            <Label htmlFor="exercise" className="cursor-pointer">
              Cvičenie
            </Label>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="walk">Chôdza (minúty):</Label>
            <Input
              id="walk"
              type="number"
              min="0"
              value={walkMinutes || ""}
              onChange={(e) => onWalkMinutesChange(parseInt(e.target.value) || 0)}
              className="w-24"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox id="restaurant" checked={restaurant} onCheckedChange={onRestaurantChange} />
              <Label htmlFor="restaurant" className="cursor-pointer">
                Reštaurácia
              </Label>
            </div>
            {lastRestaurant && (
              <p className="text-sm text-muted-foreground ml-6">
                Naposledy: {formatLastRestaurant()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}