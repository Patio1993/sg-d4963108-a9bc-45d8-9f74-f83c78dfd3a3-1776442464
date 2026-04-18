import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { Salad } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailySummaryCardProps {
  date: string;
  nutrition: DailyNutritionSummary;
  goals: NutritionGoalStatus;
  exercise: boolean;
  walkMinutes: number;
  restaurant: boolean;
  waterTotal: number;
  coffeeCount: number;
  activityCount: number;
  medicineCount: number;
  wcCount: number;
  lastRestaurant: { date: string; days_ago: number } | null;
  onExerciseChange: (checked: boolean) => void;
  onWalkMinutesChange: (value: number) => void;
  onRestaurantChange: (checked: boolean) => void;
  onNutrientClick: (nutrient: string) => void;
  onActivityClick: () => void;
  onMedicineClick: () => void;
  onWCClick: () => void;
}

export function DailySummaryCard({
  date,
  nutrition,
  goals,
  exercise,
  walkMinutes,
  restaurant,
  waterTotal,
  coffeeCount,
  activityCount,
  medicineCount,
  wcCount,
  lastRestaurant,
  onExerciseChange,
  onWalkMinutesChange,
  onRestaurantChange,
  onNutrientClick,
  onActivityClick,
  onMedicineClick,
  onWCClick,
}: DailySummaryCardProps) {
  const getGoalCardBg = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-orange-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-white/20";
    }
  };

  const getGoalEmoji = (status: string) => {
    switch (status) {
      case "good":
        return "😊";
      case "warning":
        return "😐";
      case "danger":
        return "😟";
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

  const getProgressColor = (value: number, min: number, max: number) => {
    if (value < min) return "bg-orange-500"; // Below min
    if (value > max) return "bg-red-500";   // Above max
    return "bg-primary";                     // In range
  };

  const getProgressTextColor = (value: number, min: number, max: number) => {
    if (value < min) return "text-orange-700"; // Below min
    if (value > max) return "text-red-700";   // Above max
    return "text-primary";                     // In range
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Salad className="h-5 w-5 text-primary" />
          Denný súhrn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Calories Display */}
        <div className="bg-green-100/60 rounded-lg p-4 border border-primary/20">
          <div className="text-center">
            <div className="text-5xl font-bold text-foreground">
              {Math.round(nutrition.total_kcal)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">kcal dnes</div>
          </div>
        </div>

        {/* Quick Stats - 3 columns */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(nutrition.total_protein)}g
            </div>
            <div className="text-xs text-muted-foreground mt-1">Bielkoviny</div>
          </div>
          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(nutrition.total_carbs)}g
            </div>
            <div className="text-xs text-muted-foreground mt-1">Sacharidy</div>
          </div>
          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center">
            <div className="text-2xl font-bold text-foreground">
              {nutrition.total_salt.toFixed(2)}g
            </div>
            <div className="text-xs text-muted-foreground mt-1">Soľ</div>
          </div>
        </div>

        {/* Nutrient Goals */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-center">Denné ciele:</h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Fiber */}
            <button
              onClick={() => onNutrientClick("fiber")}
              className={cn(
                "bg-green-100/60 rounded-lg p-4 text-center transition-colors border border-primary/20 hover:bg-green-100/80 cursor-pointer",
                getProgressTextColor(nutrition.total_fiber, 25, 30)
              )}
            >
              <div className="text-xl font-bold mb-1">
                {getGoalEmoji(goals.fiber)}
              </div>
              <div className="text-xl font-bold">
                {Math.round(nutrition.total_fiber)}g
              </div>
              <div className="text-xs text-muted-foreground mt-1 mb-2">
                Vláknina
              </div>
              <div className="text-xs font-medium">
                25-30g
              </div>
            </button>

            {/* Sugar */}
            <button
              onClick={() => onNutrientClick("sugar")}
              className={cn(
                "bg-green-100/60 rounded-lg p-4 text-center transition-colors border border-primary/20 hover:bg-green-100/80 cursor-pointer",
                getProgressTextColor(nutrition.total_sugar, 30, 50)
              )}
            >
              <div className="text-xl font-bold mb-1">
                {getGoalEmoji(goals.sugar)}
              </div>
              <div className="text-xl font-bold">
                {nutrition.total_sugar.toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground mt-1 mb-2">
                Cukry
              </div>
              <div className="text-xs font-medium">
                30-50g
              </div>
            </button>

            {/* Fats */}
            <button
              onClick={() => onNutrientClick("fats")}
              className={cn(
                "bg-green-100/60 rounded-lg p-4 text-center transition-colors border border-primary/20 hover:bg-green-100/80 cursor-pointer",
                getProgressTextColor(nutrition.total_fats, 50, 60)
              )}
            >
              <div className="text-xl font-bold mb-1">
                {getGoalEmoji(goals.fats)}
              </div>
              <div className="text-xl font-bold">
                {Math.round(nutrition.total_fats)}g
              </div>
              <div className="text-xs text-muted-foreground mt-1 mb-2">
                Tuky
              </div>
              <div className="text-xs font-medium">
                50-60g
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onActivityClick}
            className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center hover:bg-green-100/80 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1">🚶</div>
            <div className="text-xs opacity-90">Aktivity</div>
            {activityCount > 0 && (
              <div className="text-sm font-semibold mt-1">{activityCount}x</div>
            )}
          </button>
          
          <button
            onClick={onMedicineClick}
            className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center hover:bg-green-100/80 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1">💊</div>
            <div className="text-xs opacity-90">Lieky</div>
            {medicineCount > 0 && (
              <div className="text-sm font-semibold mt-1">{medicineCount}x</div>
            )}
          </button>
          
          <button
            onClick={onWCClick}
            className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center hover:bg-green-100/80 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1">🚽</div>
            <div className="text-xs opacity-90">WC</div>
            {wcCount > 0 && (
              <div className="text-sm font-semibold mt-1">{wcCount}x</div>
            )}
          </button>
        </div>

        {/* Tracking Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center gap-2">
              <Checkbox
                id="exercise"
                checked={exercise}
                onCheckedChange={onExerciseChange}
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
              />
              <Label htmlFor="exercise" className="text-sm cursor-pointer">
                🏋️ Cvičenie
              </Label>
            </div>
          </div>

          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20">
            <div className="space-y-1">
              <Label htmlFor="walk" className="text-xs opacity-90">
                🚶 Chôdza (min)
              </Label>
              <Input
                id="walk"
                type="number"
                min="0"
                value={walkMinutes}
                onChange={(e) => onWalkMinutesChange(parseInt(e.target.value) || 0)}
                className="h-8 bg-white/50 border-primary/30"
              />
            </div>
          </div>

          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="restaurant"
                  checked={restaurant}
                  onCheckedChange={onRestaurantChange}
                  className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white"
                />
                <Label htmlFor="restaurant" className="text-sm cursor-pointer">
                  🍽️ Reštaurácia
                </Label>
              </div>
              {lastRestaurantText && (
                <p className="text-xs opacity-75 mt-1">
                  Naposledy: {lastRestaurantText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Water & Coffee */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center">
            <div className="text-3xl font-bold">{waterTotal}ml</div>
            <div className="text-sm opacity-90">💧 Voda</div>
          </div>
          
          <div className="bg-green-100/60 rounded-lg p-3 border border-primary/20 text-center">
            <div className="text-3xl font-bold">{coffeeCount}x</div>
            <div className="text-sm opacity-90">☕ Káva</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}