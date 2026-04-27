import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { Salad, Droplets, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { dailySummaryService } from "@/services/dailySummaryService";
import { profileService } from "@/services/profileService";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  color?: string;
}

function CircularProgress({ value, max, size = 60, strokeWidth = 6, showPercentage = true, color }: CircularProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  // Color logic: green if within range (80-110%), orange if below, red if above
  const getColor = () => {
    if (color) return color; // use explicitly provided color
    if (percentage >= 80 && percentage <= 110) return "#8BC34A"; // green
    if (percentage < 80) return "#FF9800"; // orange
    return "#F44336"; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke={getColor()} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          className="transition-all duration-500" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color: getColor() }}>
          {showPercentage ? Math.round(percentage) + "%" : ""}
        </span>
      </div>
    </div>
  );
}

const getNutrientColor = (value: number, max: number) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  if (percentage >= 80 && percentage <= 110) return "#8BC34A"; // Green (in range)
  if (percentage > 110) return "#F44336"; // Red (over limit)
  return "#FFB300"; // Yellow/Orange (under limit)
};

interface DailySummaryCardProps {
  date: string;
  nutrition: DailyNutritionSummary;
  goals: NutritionGoalStatus;
  exercise: boolean;
  walkMinutes: number;
  weight: number | null;
  restaurant: boolean;
  waterTotal: number;
  coffeeCount: number;
  activityCount: number;
  medicineCount: number;
  wcCount: number;
  lastRestaurant: { date: string; days_ago: number } | null;
  onExerciseChange: (checked: boolean) => void;
  onWalkMinutesChange: (value: number) => void;
  onWeightChange: (value: number | null) => void;
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
  weight,
  restaurant,
  waterTotal,
  coffeeCount,
  activityCount,
  medicineCount,
  wcCount,
  lastRestaurant,
  onExerciseChange,
  onWalkMinutesChange,
  onWeightChange,
  onRestaurantChange,
  onNutrientClick,
  onActivityClick,
  onMedicineClick,
  onWCClick,
}: DailySummaryCardProps) {
  const [showWaterDetails, setShowWaterDetails] = useState(false);
  const [walkMinutesState, setWalkMinutes] = useState(walkMinutes.toString());
  const [weightState, setWeightState] = useState(weight ? weight.toString() : "");

  useEffect(() => {
    setWalkMinutes(walkMinutes.toString());
  }, [walkMinutes]);

  useEffect(() => {
    setWeightState(weight !== null ? weight.toString() : "");
  }, [weight]);

  const handleToggle = (field: "exercise" | "restaurant", value: boolean) => {
    if (field === "exercise") onExerciseChange(value);
    if (field === "restaurant") onRestaurantChange(value);
  };

  const handleWalkUpdate = () => {
    const minutes = parseInt(walkMinutesState) || 0;
    onWalkMinutesChange(minutes);
  };

  const handleWeightUpdate = () => {
    const w = parseFloat(weightState);
    onWeightChange(isNaN(w) ? null : w);
  };

  // Define default values if goals are not set
  const nutrients = [
    { label: "Bielkoviny", value: nutrition.total_protein, max: 80 },
    { label: "Sacharidy", value: nutrition.total_carbs, max: 220 },
    { label: "Tuky", value: nutrition.total_fats, max: 60 },
    { label: "Vláknina", value: nutrition.total_fiber, max: 30 },
    { label: "Cukry", value: nutrition.total_sugar, max: 50 },
    { label: "Soľ", value: nutrition.total_salt, max: 5 },
  ];

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
    <Card className="bg-green-50/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Denný súhrn
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {format(new Date(date), "EEEE, d. MMMM yyyy", { locale: sk })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calories */}
        <div 
          className="bg-green-50 rounded-lg p-4 border cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => onNutrientClick && onNutrientClick("kcal")}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <div className="font-medium">Kalórie</div>
                <div className="text-xs text-muted-foreground">Denný príjem</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <CircularProgress value={nutrition.total_kcal} max={2000} size={70} strokeWidth={7} />
            <div className="flex flex-col">
              <div className="text-2xl font-bold">{Math.round(nutrition.total_kcal)} kcal</div>
              <div className="text-sm text-muted-foreground">z 2000 kcal</div>
            </div>
          </div>
        </div>

        {/* Nutrients Box with Circular Charts */}
        <div className="bg-green-50 rounded-lg p-4 border">
          <h3 className="font-semibold text-sm mb-5 text-foreground flex items-center justify-between">
            <span>Nutrienty</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {nutrients.map((nutrient) => {
              const percentage = nutrient.max > 0 ? (nutrient.value / nutrient.max) * 100 : 0;
              const inRange = percentage >= 80 && percentage <= 110;
              const belowRange = percentage < 80;
              const aboveRange = percentage > 110;

              // Map Slovak labels to English nutrient types
              const nutrientTypeMap: Record<string, string> = {
                "Bielkoviny": "protein",
                "Sacharidy": "carbs",
                "Tuky": "fats",
                "Vláknina": "fiber",
                "Cukry": "sugar",
                "Soľ": "salt",
              };

              return (
                <div
                  key={nutrient.label}
                  className="bg-green-50 rounded-lg p-3 border cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => onNutrientClick && onNutrientClick(nutrientTypeMap[nutrient.label])}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs font-medium text-muted-foreground">{nutrient.label}</div>
                    <CircularProgress value={nutrient.value} max={nutrient.max} size={50} strokeWidth={5} />
                    <div className={cn(
                      "text-sm font-semibold",
                      inRange && "text-green-700",
                      belowRange && "text-orange-700",
                      aboveRange && "text-red-700"
                    )}>
                      {nutrient.value.toFixed(1)}g
                    </div>
                    <div className="text-xs text-muted-foreground">z {nutrient.max}g</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Water with Circular Chart */}
        <div className="bg-blue-50 rounded-lg p-4 border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
              <Droplets className="h-6 w-6 fill-current opacity-80" />
            </div>
            <div>
              <div className="font-bold text-[15px] text-foreground">Pitný režim</div>
              <div className="text-[12px] font-medium text-muted-foreground mt-0.5">Cieľ: 2000 ml</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-bold text-[15px]" style={{ color: getNutrientColor(waterTotal, 2000) }}>
                {waterTotal} ml
              </div>
            </div>
            <CircularProgress value={waterTotal} max={2000} size={50} strokeWidth={4.5} color={getNutrientColor(waterTotal, 2000)} />
          </div>
        </div>

        {/* Quick Actions & Coffee */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={onActivityClick} className="bg-green-50 rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🚶</span>
            <span className="text-[10px] font-semibold text-foreground">Aktivity</span>
            {activityCount > 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{activityCount}x</span>}
          </button>
          <button onClick={onMedicineClick} className="bg-green-50 rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">💊</span>
            <span className="text-[10px] font-semibold text-foreground">Lieky</span>
            {medicineCount > 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{medicineCount}x</span>}
          </button>
          <button onClick={onWCClick} className="bg-green-50 rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🚽</span>
            <span className="text-[10px] font-semibold text-foreground">WC</span>
            {wcCount > 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{wcCount}x</span>}
          </button>
          <div className="bg-green-50 rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5">
            <span className="text-2xl">☕</span>
            <span className="text-[10px] font-semibold text-foreground">Káva</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{coffeeCount}x</span>
          </div>
        </div>

        {/* Tracking Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-green-50 rounded-lg p-4 border">
            <Label htmlFor="exercise" className="text-xs font-semibold cursor-pointer flex items-center gap-2">
              <span>🏋️</span> Cvičenie
            </Label>
            <Checkbox
              id="exercise"
              checked={exercise}
              onCheckedChange={onExerciseChange}
              className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white h-5 w-5 mt-2"
            />
          </div>

          <div className="bg-green-50 rounded-lg p-4 border">
            <Label htmlFor="walk" className="text-xs font-semibold whitespace-nowrap flex items-center gap-2 mb-2">
              <span>🚶</span> Chôdza
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="0"
                value={walkMinutesState}
                onChange={(e) => setWalkMinutes(e.target.value)}
                onBlur={handleWalkUpdate}
                className="w-20 text-center"
              />
              <span className="text-[10px] text-muted-foreground font-bold">min</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border">
            <Label htmlFor="weight" className="text-xs font-semibold whitespace-nowrap flex items-center gap-2 mb-2">
              <span>⚖️</span> Váha
            </Label>
            <div className="flex items-center gap-1">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weightState}
                onChange={(e) => setWeightState(e.target.value)}
                className="h-7 w-16 text-center px-1 py-0 text-[13px] border-gray-200 font-medium"
              />
              <span className="text-[10px] text-muted-foreground font-bold">kg</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <Label htmlFor="restaurant" className="text-xs font-semibold cursor-pointer flex items-center gap-2">
                <span>🍽️</span> Reštika
              </Label>
              <Checkbox
                id="restaurant"
                checked={restaurant}
                onCheckedChange={onRestaurantChange}
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white h-5 w-5"
              />
            </div>
            {lastRestaurantText && (
              <p className="text-[9.5px] text-muted-foreground mt-1.5 font-medium leading-tight">
                Naposledy: {lastRestaurantText}
              </p>
            )}
          </div>
        </div>

        {/* Nutrients with Progress */}
        <div className="grid grid-cols-3 gap-3">
        </div>

      </CardContent>
    </Card>
  );
}