import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailyNutritionSummary } from "@/services/consumedFoodService";
import type { NutritionGoalStatus } from "@/services/dailySummaryService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { Salad, Droplets } from "lucide-react";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}

function CircularProgress({ value, max, size = 60, strokeWidth = 6, color }: CircularProgressProps) {
  const validMax = max > 0 ? max : 1;
  const percentage = Math.min((value / validMax) * 100, 100);
  const actualPercentage = (value / validMax) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke={color} 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          className="transition-all duration-500" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color }}>
          {Math.round(actualPercentage)}%
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

  // Define default values if goals are not set
  const nutrients = [
    { label: "Bielkoviny", value: nutrition.total_protein, max: 80 },
    { label: "Sacharidy", value: nutrition.total_carbs, max: 220 },
    { label: "Tuky", value: nutrition.total_fats, max: goals?.limits?.fats || 60 },
    { label: "Vláknina", value: nutrition.total_fiber, max: goals?.limits?.fiber || 30 },
    { label: "Cukry", value: nutrition.total_sugar, max: goals?.limits?.sugar || 50 },
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
    <Card className="bg-[#FAF9F6] border-primary/20 shadow-sm">
      <CardHeader className="pb-3 border-b bg-white/50 rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <Salad className="h-5 w-5 text-primary" />
          Denný súhrn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        {/* Kcal Box */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="text-4xl font-extrabold text-foreground">
            {Math.round(nutrition.total_kcal)}
          </div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">kcal dnes</div>
        </div>

        {/* Nutrients Box with Circular Charts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-sm mb-5 text-foreground flex items-center justify-between">
            <span>Nutrienty</span>
          </h3>
          <div className="grid grid-cols-3 gap-y-7 gap-x-2">
            {nutrients.map((item, idx) => {
              const color = getNutrientColor(item.value, item.max);
              return (
                <div key={idx} className="flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors" onClick={() => onNutrientClick(item.label.toLowerCase())}>
                  <span className="text-[12px] font-bold text-foreground mb-1.5">{item.label}</span>
                  <span className="text-[13px] font-bold mb-2.5" style={{ color }}>{item.value.toFixed(1)} g</span>
                  <CircularProgress value={item.value} max={item.max} size={56} strokeWidth={4.5} color={color} />
                  <span className="text-[11px] text-muted-foreground mt-2 font-medium">z {item.max.toFixed(1)} g</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Water with Circular Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
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
          <button onClick={onActivityClick} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🚶</span>
            <span className="text-[10px] font-semibold text-foreground">Aktivity</span>
            {activityCount > 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{activityCount}x</span>}
          </button>
          <button onClick={onMedicineClick} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">💊</span>
            <span className="text-[10px] font-semibold text-foreground">Lieky</span>
            {medicineCount > 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{medicineCount}x</span>}
          </button>
          <button onClick={onWCClick} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🚽</span>
            <span className="text-[10px] font-semibold text-foreground">WC</span>
            {wcCount > 0 && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{wcCount}x</span>}
          </button>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5">
            <span className="text-2xl">☕</span>
            <span className="text-[10px] font-semibold text-foreground">Káva</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{coffeeCount}x</span>
          </div>
        </div>

        {/* Tracking Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
            <Label htmlFor="exercise" className="text-xs font-semibold cursor-pointer flex items-center gap-2">
              <span>🏋️</span> Cvičenie
            </Label>
            <Checkbox
              id="exercise"
              checked={exercise}
              onCheckedChange={onExerciseChange}
              className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white h-5 w-5"
            />
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
            <Label htmlFor="walk" className="text-xs font-semibold whitespace-nowrap flex items-center gap-2">
              <span>🚶</span> Chôdza
            </Label>
            <div className="flex items-center gap-1">
              <Input
                id="walk"
                type="number"
                min="0"
                value={walkMinutes}
                onChange={(e) => onWalkMinutesChange(parseInt(e.target.value) || 0)}
                className="h-7 w-12 text-center px-1 py-0 text-[13px] border-gray-200 font-medium"
              />
              <span className="text-[10px] text-muted-foreground font-bold">min</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col justify-center hover:bg-gray-50 transition-colors">
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

      </CardContent>
    </Card>
  );
}