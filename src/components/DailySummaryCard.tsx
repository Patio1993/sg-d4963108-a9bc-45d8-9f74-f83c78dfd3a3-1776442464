import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { Salad } from "lucide-react";

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
    if (value < min) return "bg-orange-500"; // Below min - orange
    if (value > max) return "bg-red-500";    // Above max - red
    return "bg-green-400";                    // In range - lighter green
  };

  const getProgressTextColor = (value: number, min: number, max: number) => {
    if (value < min) return "text-orange-700"; // Below min - dark orange
    if (value > max) return "text-red-700";    // Above max - dark red
    return "text-green-600";                    // In range - lighter green text
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Salad className="h-5 w-5 text-primary" />
          Denný súhrn
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Main Kcal Display */}
        <div className="text-center">
          <div className="text-6xl font-bold">{nutrition.total_kcal}</div>
          <div className="text-sm opacity-90 mt-1">kcal dnes</div>
        </div>

        {/* Top 3 Nutrients */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center cursor-pointer hover:bg-white/30 transition-colors" onClick={() => onNutrientClick("protein")}>
            <div className="text-2xl font-bold">{nutrition.total_protein}g</div>
            <div className="text-sm opacity-90">Bielkoviny</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center cursor-pointer hover:bg-white/30 transition-colors" onClick={() => onNutrientClick("carbs")}>
            <div className="text-2xl font-bold">{nutrition.total_carbs}g</div>
            <div className="text-sm opacity-90">Sacharidy</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center cursor-pointer hover:bg-white/30 transition-colors" onClick={() => onNutrientClick("salt")}>
            <div className="text-2xl font-bold">{nutrition.total_salt}g</div>
            <div className="text-sm opacity-90">Soľ</div>
          </div>
        </div>

        {/* Daily Goals */}
        <div className="space-y-3">
          <div className="text-center text-sm opacity-90 font-medium">Denné ciele:</div>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`${getGoalCardBg(goals.fiber)} rounded-xl p-4 text-center cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => onNutrientClick("fiber")}
            >
              <div className="text-3xl mb-1">{getGoalEmoji(goals.fiber)}</div>
              <div className="text-2xl font-bold">{nutrition.total_fiber}g</div>
              <div className="text-sm opacity-90 mt-1">Vláknina</div>
              <div className="text-xs opacity-75 mt-1">25-30g</div>
            </div>

            <div
              className={`${getGoalCardBg(goals.sugar)} rounded-xl p-4 text-center cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => onNutrientClick("sugar")}
            >
              <div className="text-3xl mb-1">{getGoalEmoji(goals.sugar)}</div>
              <div className="text-2xl font-bold">{nutrition.total_sugar}g</div>
              <div className="text-sm opacity-90 mt-1">Cukry</div>
              <div className="text-xs opacity-75 mt-1">30-50g</div>
            </div>

            <div
              className={`${getGoalCardBg(goals.fats)} rounded-xl p-4 text-center cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => onNutrientClick("fats")}
            >
              <div className="text-3xl mb-1">{getGoalEmoji(goals.fats)}</div>
              <div className="text-2xl font-bold">{nutrition.total_fats}g</div>
              <div className="text-sm opacity-90 mt-1">Tuky</div>
              <div className="text-xs opacity-75 mt-1">50-60g</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onActivityClick}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/30 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1">🚶</div>
            <div className="text-xs opacity-90">Aktivity</div>
            {activityCount > 0 && (
              <div className="text-sm font-semibold mt-1">{activityCount}x</div>
            )}
          </button>
          
          <button
            onClick={onMedicineClick}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/30 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1">💊</div>
            <div className="text-xs opacity-90">Lieky</div>
            {medicineCount > 0 && (
              <div className="text-sm font-semibold mt-1">{medicineCount}x</div>
            )}
          </button>
          
          <button
            onClick={onWCClick}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/30 transition-colors cursor-pointer"
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
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="exercise"
                checked={exercise}
                onCheckedChange={onExerciseChange}
                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-600"
              />
              <Label htmlFor="exercise" className="text-sm cursor-pointer">
                🏋️ Cvičenie
              </Label>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
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
                className="h-8 bg-white/30 border-white/50 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="restaurant"
                  checked={restaurant}
                  onCheckedChange={onRestaurantChange}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-600"
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
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-3xl font-bold">{waterTotal}ml</div>
            <div className="text-sm opacity-90">💧 Voda</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-3xl font-bold">{coffeeCount}x</div>
            <div className="text-sm opacity-90">☕ Káva</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}