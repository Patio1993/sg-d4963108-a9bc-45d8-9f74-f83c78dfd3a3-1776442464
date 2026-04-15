import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { Activity, Pill, Archive } from "lucide-react";

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
  const getGoalCardBg = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "danger":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getGoalIcon = (status: string) => {
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

  return (
    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Main Calories Display */}
        <div className="text-center space-y-1">
          <div className="text-6xl font-bold">{nutrition.total_kcal}</div>
          <div className="text-lg opacity-90">kcal dnes</div>
        </div>

        {/* Top 3 Nutrients */}
        <div className="grid grid-cols-3 gap-3">
          <div 
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => onNutrientClick("protein")}
          >
            <div className="text-2xl font-bold">{nutrition.total_protein}g</div>
            <div className="text-sm opacity-90">Bielkoviny</div>
          </div>
          <div 
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => onNutrientClick("carbs")}
          >
            <div className="text-2xl font-bold">{nutrition.total_carbs}g</div>
            <div className="text-sm opacity-90">Sacharidy</div>
          </div>
          <div 
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => onNutrientClick("salt")}
          >
            <div className="text-2xl font-bold">{nutrition.total_salt}g</div>
            <div className="text-sm opacity-90">Soľ</div>
          </div>
        </div>

        {/* Daily Goals Section */}
        <div className="space-y-3">
          <div className="text-center text-sm font-medium opacity-90">Denné ciele:</div>
          <div className="grid grid-cols-3 gap-3">
            {/* Fiber Goal */}
            <div 
              className={`${getGoalCardBg(goals.fiber)} rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all relative border-2`}
              onClick={() => onNutrientClick("fiber")}
            >
              <div className="absolute top-2 right-2 text-xl">{getGoalIcon(goals.fiber)}</div>
              <div className="text-2xl font-bold text-gray-800">{nutrition.total_fiber}g</div>
              <div className="text-sm font-medium text-gray-700">Vláknina</div>
              <div className="text-xs text-gray-600 mt-1">25-30g</div>
            </div>

            {/* Sugar Goal */}
            <div 
              className={`${getGoalCardBg(goals.sugar)} rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all relative border-2`}
              onClick={() => onNutrientClick("sugar")}
            >
              <div className="absolute top-2 right-2 text-xl">{getGoalIcon(goals.sugar)}</div>
              <div className="text-2xl font-bold text-gray-800">{nutrition.total_sugar}g</div>
              <div className="text-sm font-medium text-gray-700">Cukry</div>
              <div className="text-xs text-gray-600 mt-1">30-50g</div>
            </div>

            {/* Fats Goal */}
            <div 
              className={`${getGoalCardBg(goals.fats)} rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-all relative border-2`}
              onClick={() => onNutrientClick("fats")}
            >
              <div className="absolute top-2 right-2 text-xl">{getGoalIcon(goals.fats)}</div>
              <div className="text-2xl font-bold text-gray-800">{nutrition.total_fats}g</div>
              <div className="text-sm font-medium text-gray-700">Tuky</div>
              <div className="text-xs text-gray-600 mt-1">50-60g</div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons - Aktivity, Lieky, WC */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 border-0 text-white h-auto py-3"
          >
            <Activity className="h-5 w-5 mr-2" />
            Aktivity
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 border-0 text-white h-auto py-3"
          >
            <Pill className="h-5 w-5 mr-2" />
            Lieky
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 border-0 text-white h-auto py-3"
          >
            <Archive className="h-5 w-5 mr-2" />
            WC
          </Button>
        </div>

        {/* Activity Tracking Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Exercise Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exercise"
                checked={exercise}
                onCheckedChange={onExerciseChange}
                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-600"
              />
              <Label htmlFor="exercise" className="cursor-pointer text-sm font-medium">
                🏋️ Cvičenie
              </Label>
            </div>
          </div>

          {/* Walk Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="space-y-2">
              <Label htmlFor="walk" className="text-sm font-medium flex items-center gap-1">
                🚶 Chôdza (min)
              </Label>
              <Input
                id="walk"
                type="number"
                min="0"
                value={walkMinutes}
                onChange={(e) => onWalkMinutesChange(parseInt(e.target.value) || 0)}
                className="bg-white/30 border-white/50 text-white placeholder:text-white/60 h-8"
              />
            </div>
          </div>

          {/* Restaurant Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="restaurant"
                  checked={restaurant}
                  onCheckedChange={onRestaurantChange}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-600"
                />
                <Label htmlFor="restaurant" className="cursor-pointer text-sm font-medium">
                  🍽️ Reštaurácia
                </Label>
              </div>
              {lastRestaurantText && (
                <p className="text-xs opacity-80 ml-6">
                  Naposledy: {lastRestaurantText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Water Intake Display */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-3xl font-bold">{waterTotal}ml</div>
          <div className="text-sm opacity-90">💧 Voda</div>
        </div>
      </CardContent>
    </Card>
  );
}