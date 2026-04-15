import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Utensils } from "lucide-react";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import type { ConsumedFoodWithDetails } from "@/services/consumedFoodService";

interface ConsumedFoodsListProps {
  foods: ConsumedFoodWithDetails[];
  onEdit: (food: ConsumedFoodWithDetails) => void;
  onDelete: (id: string) => void;
}

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "🍳",
  snack: "🍎",
  lunch: "🍽️",
  afternoon_snack: "☕",
  dinner: "🌙",
  coffee: "☕",
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Raňajky",
  snack: "Desiata",
  lunch: "Obed",
  afternoon_snack: "Olovrant",
  dinner: "Večera",
  coffee: "Káva",
};

export function ConsumedFoodsList({ foods, onEdit, onDelete }: ConsumedFoodsListProps) {
  if (foods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skonzumované potraviny</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Žiadne záznamy</p>
        </CardContent>
      </Card>
    );
  }

  const groupedFoods = foods.reduce((acc, food) => {
    const key = food.meal_type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(food);
    return acc;
  }, {} as Record<string, ConsumedFoodWithDetails[]>);

  const calculateNutrients = (food: ConsumedFoodWithDetails) => {
    const multiplier = food.amount / 100;
    return {
      kcal: Math.round((food.food?.kcal || 0) * multiplier),
      fiber: ((food.food?.fiber || 0) * multiplier).toFixed(1),
      sugar: ((food.food?.sugar || 0) * multiplier).toFixed(1),
      carbs: ((food.food?.carbs || 0) * multiplier).toFixed(1),
      fats: ((food.food?.fats || 0) * multiplier).toFixed(1),
      protein: ((food.food?.protein || 0) * multiplier).toFixed(1),
      salt: ((food.food?.salt || 0) * multiplier).toFixed(1),
    };
  };

  const formatLastConsumed = (food: ConsumedFoodWithDetails) => {
    if (!food.food?.days_ago || food.food.days_ago === 0) return null;

    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - food.food.days_ago);
    const dateStr = format(lastDate, "d.M.yyyy", { locale: sk });
    const dayName = format(lastDate, "EEEE", { locale: sk });

    if (food.food.days_ago === 1) return `Včera - ${dayName} (${dateStr})`;
    if (food.food.days_ago === 2) return `Predvčerom - ${dayName} (${dateStr})`;
    return `pred ${food.food.days_ago} dňami - ${dayName} (${dateStr})`;
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedFoods)
        .sort(([a], [b]) => {
          const order = ["breakfast", "snack", "lunch", "afternoon_snack", "dinner", "coffee"];
          return order.indexOf(a) - order.indexOf(b);
        })
        .map(([mealType, mealFoods]) => (
          <Card key={mealType}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{MEAL_TYPE_ICONS[mealType] || "🍽️"}</span>
                <span>{MEAL_TYPE_LABELS[mealType] || mealType}</span>
                <Badge variant="secondary" className="ml-auto">
                  {mealFoods.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealFoods.map((food) => {
                const nutrients = calculateNutrients(food);
                const lastConsumed = formatLastConsumed(food);

                return (
                  <div
                    key={food.id}
                    className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                  >
                    {/* Header: Meal Type, Time, Edit, Delete */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Utensils className="h-4 w-4" />
                        <span>{MEAL_TYPE_LABELS[food.meal_type]}</span>
                        <span>•</span>
                        <span>{food.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(food)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onDelete(food.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Food Name and Amount */}
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-semibold">{food.food?.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {food.amount}{food.food?.unit === "ml" ? "ml" : "g"}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {food.day_number}. deň
                      </Badge>
                    </div>

                    {/* Calories */}
                    <div className="text-base font-medium">
                      {nutrients.kcal} kcal
                    </div>

                    {/* Nutrients - Two Lines */}
                    <div className="space-y-1 text-sm">
                      <div className="flex gap-4">
                        <span>Vláknina: <span className="font-medium">{nutrients.fiber}g</span></span>
                        <span>Cukry: <span className="font-medium">{nutrients.sugar}g</span></span>
                        <span>Tuky: <span className="font-medium">{nutrients.fats}g</span></span>
                      </div>
                      <div className="flex gap-4">
                        <span>Bielkoviny: <span className="font-medium">{nutrients.protein}g</span></span>
                        <span>Sacharidy: <span className="font-medium">{nutrients.carbs}g</span></span>
                        <span>Soľ: <span className="font-medium">{nutrients.salt}g</span></span>
                      </div>
                    </div>

                    {/* Last Consumed */}
                    {lastConsumed && (
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Naposledy: {lastConsumed}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}