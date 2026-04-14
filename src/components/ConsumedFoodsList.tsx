import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import type { ConsumedFoodWithDetails } from "@/services/consumedFoodService";

interface ConsumedFoodsListProps {
  foods: ConsumedFoodWithDetails[];
  sortedBy: string;
  onDelete: (id: string) => void;
  onEdit: (food: ConsumedFoodWithDetails) => void;
}

export function ConsumedFoodsList({ foods, sortedBy, onDelete, onEdit }: ConsumedFoodsListProps) {
  const mealTypeLabels = {
    breakfast: "Raňajky",
    snack: "Desiata",
    lunch: "Obed",
    afternoon_snack: "Olovrant",
    dinner: "Večera",
    coffee: "Káva",
  };

  const reactionEmoji = {
    good: "🙂",
    neutral: "😐",
    bad: "🙁",
  };

  const groupedFoods = foods.reduce((acc, food) => {
    const type = food.meal_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(food);
    return acc;
  }, {} as Record<string, ConsumedFoodWithDetails[]>);

  const mealOrder = ["breakfast", "snack", "lunch", "afternoon_snack", "dinner", "coffee"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sortedBy ? `Zoradené podľa: ${sortedBy}` : "Skonzumované potraviny"}</CardTitle>
      </CardHeader>
      <CardContent>
        {foods.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Žiadne záznamy za tento deň</p>
        ) : (
          <div className="space-y-6">
            {mealOrder.map((mealType) => {
              const mealFoods = groupedFoods[mealType];
              if (!mealFoods || mealFoods.length === 0) return null;

              return (
                <div key={mealType} className="space-y-2">
                  <h3 className="font-semibold text-lg">{mealTypeLabels[mealType as keyof typeof mealTypeLabels]}</h3>
                  <div className="space-y-2">
                    {mealFoods.map((food) => (
                      <div key={food.id} className="p-4 bg-card border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{food.time}</span>
                              <span className="font-medium">{food.food.name}</span>
                              {food.reaction && <span>{reactionEmoji[food.reaction]}</span>}
                              {food.meal_type === "coffee" && food.coffee_count && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  {food.coffee_count}. káva
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {food.amount}
                              {food.food.unit}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onEdit(food)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(food.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-sm">
                          <div className={food.calculated_kcal > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_kcal} kcal
                          </div>
                          <div className={food.calculated_fiber > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_fiber}g vl
                          </div>
                          <div className={food.calculated_sugar > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_sugar}g cu
                          </div>
                          <div className={food.calculated_carbs > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_carbs}g sa
                          </div>
                          <div className={food.calculated_fats > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_fats}g tu
                          </div>
                          <div className={food.calculated_protein > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_protein}g bi
                          </div>
                          <div className={food.calculated_salt > 0 ? "text-blue-600" : "text-muted-foreground"}>
                            {food.calculated_salt}g so
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}