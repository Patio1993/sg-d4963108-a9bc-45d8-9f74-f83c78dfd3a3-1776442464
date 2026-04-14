import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Clock } from "lucide-react";
import type { ConsumedFoodWithDetails } from "@/services/consumedFoodService";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";

interface ConsumedFoodsListProps {
  date: string;
  foods: ConsumedFoodWithDetails[];
  sortedBy?: string;
  onDelete: (id: string) => Promise<void>;
  onEdit: (food: ConsumedFoodWithDetails) => void;
}

export function ConsumedFoodsList({ date, foods, sortedBy, onDelete, onEdit }: ConsumedFoodsListProps) {
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

  const formatLastConsumed = (daysAgo: number | null | undefined, foodDate: string) => {
    if (daysAgo === null || daysAgo === undefined) return null;

    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - daysAgo);
    const dateStr = format(lastDate, "d.MM.yyyy", { locale: sk });
    const dayName = format(lastDate, "EEEE", { locale: sk });

    if (daysAgo === 0) return null; // Today - don't show
    if (daysAgo === 1) return `Včera - ${dayName} (${dateStr})`;
    if (daysAgo === 2) return `Predvčerom - ${dayName} (${dateStr})`;
    return `Pred ${daysAgo} dňami - ${dayName} (${dateStr})`;
  };

  // Group foods by meal type
  const groupedFoods = foods.reduce((acc, food) => {
    const type = food.meal_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(food);
    return acc;
  }, {} as Record<string, ConsumedFoodWithDetails[]>);

  const mealOrder = ["breakfast", "snack", "lunch", "afternoon_snack", "dinner", "coffee"];

  if (foods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skonzumované potraviny</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Žiadne záznamy za tento deň
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skonzumované potraviny</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mealOrder.map((mealType) => {
          const mealFoods = groupedFoods[mealType];
          if (!mealFoods || mealFoods.length === 0) return null;

          return (
            <div key={mealType} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {mealTypeLabels[mealType as keyof typeof mealTypeLabels]}
                <Badge variant="secondary" className="text-xs">
                  {mealFoods.length}
                </Badge>
              </h3>
              <div className="space-y-2">
                {mealFoods.map((food) => {
                  const ratio = food.amount / 100;
                  const calculatedKcal = food.food ? Math.round(food.food.kcal * ratio * 100) / 100 : 0;
                  const calculatedFiber = food.food ? Math.round(food.food.fiber * ratio * 100) / 100 : 0;
                  const calculatedSugar = food.food ? Math.round(food.food.sugar * ratio * 100) / 100 : 0;
                  const calculatedCarbs = food.food ? Math.round(food.food.carbs * ratio * 100) / 100 : 0;
                  const calculatedFats = food.food ? Math.round(food.food.fats * ratio * 100) / 100 : 0;
                  const calculatedProtein = food.food ? Math.round(food.food.protein * ratio * 100) / 100 : 0;
                  const calculatedSalt = food.food ? Math.round(food.food.salt * ratio * 100) / 100 : 0;

                  const lastConsumedText = formatLastConsumed(food.days_ago, food.date);

                  return (
                    <div
                      key={food.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-lg">{food.food?.name}</span>
                            <span className="text-xl">{reactionEmoji[food.reaction]}</span>
                            {food.coffee_count && (
                              <Badge variant="outline" className="text-xs">
                                {food.coffee_count}. káva
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span>{food.time}</span>
                            <span>•</span>
                            <span>{food.amount}{food.food?.unit}</span>
                          </div>
                          {lastConsumedText && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs bg-muted">
                                <Clock className="h-3 w-3 mr-1" />
                                {lastConsumedText}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(food)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(food.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="text-center">
                          <div className={calculatedKcal > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedKcal}
                          </div>
                          <div className="text-xs text-muted-foreground">Kcal</div>
                        </div>
                        <div className="text-center">
                          <div className={calculatedFiber > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedFiber}g
                          </div>
                          <div className="text-xs text-muted-foreground">Vláknina</div>
                        </div>
                        <div className="text-center">
                          <div className={calculatedSugar > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedSugar}g
                          </div>
                          <div className="text-xs text-muted-foreground">Cukor</div>
                        </div>
                        <div className="text-center">
                          <div className={calculatedCarbs > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedCarbs}g
                          </div>
                          <div className="text-xs text-muted-foreground">Sacharidy</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <div className={calculatedFats > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedFats}g
                          </div>
                          <div className="text-xs text-muted-foreground">Tuky</div>
                        </div>
                        <div className="text-center">
                          <div className={calculatedProtein > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedProtein}g
                          </div>
                          <div className="text-xs text-muted-foreground">Bielkoviny</div>
                        </div>
                        <div className="text-center">
                          <div className={calculatedSalt > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                            {calculatedSalt}g
                          </div>
                          <div className="text-xs text-muted-foreground">Soľ</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}