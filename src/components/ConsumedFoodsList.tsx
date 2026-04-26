import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Utensils } from "lucide-react";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { consumedFoodService, type ConsumedFoodWithDetails } from "@/services/consumedFoodService";
import { FoodImagePreview } from "@/components/FoodImagePreview";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

interface ConsumedFoodsListProps {
  selectedDate: string;
  onFoodDeleted: () => void;
}

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "🌅",
  snack: "🍎",
  lunch: "🍽️",
  afternoon_snack: "🥤",
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

export function ConsumedFoodsList({ selectedDate, onFoodDeleted }: ConsumedFoodsListProps) {
  const [foods, setFoods] = useState<ConsumedFoodWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFood, setEditingFood] = useState<ConsumedFoodWithDetails | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);
  const { toast } = useToast();

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
    const daysAgo = (food.food as any)?.days_ago;
    if (daysAgo === undefined || daysAgo === null || daysAgo === 0) return null;

    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - daysAgo);
    const dateStr = format(lastDate, "d.M.yyyy", { locale: sk });
    const dayName = format(lastDate, "EEEE", { locale: sk });

    if (daysAgo === 1) return `včera - ${dayName} (${dateStr})`;
    if (daysAgo === 2) return `predvčerom - ${dayName} (${dateStr})`;
    return `pred ${daysAgo} dňami - ${dayName} (${dateStr})`;
  };

  const renderNutrient = (label: string, value: string) => {
    const numValue = parseFloat(value);
    const valueClass = numValue > 0 ? "text-blue-600 font-medium" : "";
    return (
      <span>{label}: <span className={valueClass}>{value}g</span></span>
    );
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
                    className="p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors shadow-sm"
                  >
                    {/* Top Row: Meal Type, Time, Edit */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Utensils className="h-4 w-4" />
                        <span>{MEAL_TYPE_LABELS[food.meal_type]}</span>
                        <span>·</span>
                        <span>{food.time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-700"
                        onClick={() => setEditingFood(food)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Second Row: Food Name and Delete */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {food.food?.photo_url ? (
                          <img
                            src={food.food.photo_url}
                            alt={food.food?.name || ""}
                            className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview({
                                url: food.food!.photo_url!,
                                name: food.food!.name,
                              });
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center text-2xl bg-muted rounded-lg">
                            {food.food?.emoji || "🍽️"}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {food.food.name}
                            {food.food.daily_limit && ` - Limit ${food.food.daily_limit} ${food.food.unit}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {food.amount}{food.food.unit} • {food.meal_type} • {food.time}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 -mt-2"
                        onClick={() => {
                          onFoodDeleted();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Third Row: Amount and Badge */}
                    <div className="flex items-center gap-2 mt-2 mb-3">
                      <span className="text-muted-foreground">
                        {food.amount}{food.food?.unit === "ml" ? "ml" : "g"}
                      </span>
                      {food.meal_type !== "coffee" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-normal rounded-md">
                          {food.day_number === 1 ? "1. deň" : `${food.day_number}. deň po sebe`}
                        </Badge>
                      )}
                    </div>

                    {/* Fourth Row: Calories */}
                    <div className="text-emerald-600 font-semibold mb-2">
                      {nutrients.kcal} kcal
                    </div>

                    {/* Fifth/Sixth Row: Nutrients */}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {renderNutrient("Vláknina", nutrients.fiber)}
                        {renderNutrient("Cukry", nutrients.sugar)}
                        {renderNutrient("Tuky", nutrients.fats)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {renderNutrient("Bielkoviny", nutrients.protein)}
                        {renderNutrient("Sacharidy", nutrients.carbs)}
                        {renderNutrient("Soľ", nutrients.salt)}
                      </div>
                    </div>

                    {/* Last Consumed */}
                    {lastConsumed && (
                      <div className="text-sm text-purple-600 mt-2">
                        Naposledy: {lastConsumed}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

      <FoodImagePreview
        open={!!imagePreview}
        onOpenChange={() => setImagePreview(null)}
        imageUrl={imagePreview?.url || null}
        foodName={imagePreview?.name || ""}
      />
    </div>
  );
}