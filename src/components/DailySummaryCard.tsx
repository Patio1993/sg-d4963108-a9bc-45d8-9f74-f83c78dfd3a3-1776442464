import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";

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
  onWalkMinutesChange: (value: number) => void;
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-orange-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return "✅";
      case "warning":
        return "⚠️";
      case "danger":
        return "🔴";
      default:
        return "";
    }
  };

  const formatLastRestaurant = (lastRest: { date: string; days_ago: number } | null) => {
    if (!lastRest || lastRest.days_ago === 0) return null;

    const lastDate = parseISO(lastRest.date);
    const dateStr = format(lastDate, "d.MM.yyyy", { locale: sk });
    const dayName = format(lastDate, "EEEE", { locale: sk });

    if (lastRest.days_ago === 1) return `Včera - ${dayName} (${dateStr})`;
    if (lastRest.days_ago === 2) return `Predvčerom - ${dayName} (${dateStr})`;
    return `Pred ${lastRest.days_ago} dňami - ${dayName} (${dateStr})`;
  };

  const lastRestaurantText = formatLastRestaurant(lastRestaurant);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Denný súhrn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nutrition Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("kcal")}
          >
            <div className="text-2xl font-bold">{nutrition.total_kcal}</div>
            <div className="text-sm text-muted-foreground">Kcal</div>
          </div>

          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("fiber")}
          >
            <div className={`text-2xl font-bold ${getStatusColor(goals.fiber)}`}>
              {nutrition.total_fiber}g {getStatusIcon(goals.fiber)}
            </div>
            <div className="text-sm text-muted-foreground">Vláknina</div>
            <div className="text-xs text-muted-foreground mt-1">25-30g</div>
          </div>

          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("sugar")}
          >
            <div className={`text-2xl font-bold ${getStatusColor(goals.sugar)}`}>
              {nutrition.total_sugar}g {getStatusIcon(goals.sugar)}
            </div>
            <div className="text-sm text-muted-foreground">Cukor</div>
            <div className="text-xs text-muted-foreground mt-1">30-50g</div>
          </div>

          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("carbs")}
          >
            <div className="text-2xl font-bold">{nutrition.total_carbs}g</div>
            <div className="text-sm text-muted-foreground">Sacharidy</div>
          </div>

          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("fats")}
          >
            <div className={`text-2xl font-bold ${getStatusColor(goals.fats)}`}>
              {nutrition.total_fats}g {getStatusIcon(goals.fats)}
            </div>
            <div className="text-sm text-muted-foreground">Tuky</div>
            <div className="text-xs text-muted-foreground mt-1">50-60g</div>
          </div>

          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("protein")}
          >
            <div className="text-2xl font-bold">{nutrition.total_protein}g</div>
            <div className="text-sm text-muted-foreground">Bielkoviny</div>
          </div>

          <div
            className="text-center p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onNutrientClick("salt")}
          >
            <div className="text-2xl font-bold">{nutrition.total_salt}g</div>
            <div className="text-sm text-muted-foreground">Soľ</div>
          </div>

          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-blue-600">{waterTotal}ml</div>
            <div className="text-sm text-muted-foreground">Voda</div>
          </div>
        </div>

        {/* Activity Tracking */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exercise"
              checked={exercise}
              onCheckedChange={onExerciseChange}
            />
            <Label htmlFor="exercise" className="cursor-pointer">
              Cvičenie
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="walk">Chôdza (minúty)</Label>
            <Input
              id="walk"
              type="number"
              min="0"
              value={walkMinutes}
              onChange={(e) => onWalkMinutesChange(parseInt(e.target.value) || 0)}
              className="max-w-[200px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="restaurant"
                checked={restaurant}
                onCheckedChange={onRestaurantChange}
              />
              <Label htmlFor="restaurant" className="cursor-pointer">
                Reštaurácia
              </Label>
            </div>
            {lastRestaurantText && (
              <p className="text-sm text-muted-foreground ml-6">
                Naposledy: {lastRestaurantText}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}