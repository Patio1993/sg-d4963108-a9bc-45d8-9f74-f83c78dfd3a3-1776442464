import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ConsumedFoodWithDetails } from "@/services/consumedFoodService";

interface NutrientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nutrientType: "fiber" | "sugar" | "fats" | null;
  foods: ConsumedFoodWithDetails[];
}

export function NutrientDetailDialog({
  open,
  onOpenChange,
  nutrientType,
  foods,
}: NutrientDetailDialogProps) {
  if (!nutrientType) return null;

  const nutrientLabels = {
    fiber: "Vláknina",
    sugar: "Cukor",
    fats: "Tuky",
  };

  const nutrientUnits = {
    fiber: "g",
    sugar: "g",
    fats: "g",
  };

  // Calculate nutrient value for each food and sort by it (highest first)
  const foodsWithNutrient = foods
    .map((food) => {
      if (!food.food) return null;
      
      const ratio = food.amount / 100;
      let value = 0;
      
      switch (nutrientType) {
        case "fiber":
          value = food.food.fiber * ratio;
          break;
        case "sugar":
          value = food.food.sugar * ratio;
          break;
        case "fats":
          value = food.food.fats * ratio;
          break;
      }
      
      return {
        name: food.food.name,
        value: Math.round(value * 100) / 100,
      };
    })
    .filter((item): item is { name: string; value: number } => item !== null)
    .sort((a, b) => b.value - a.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Podľa {nutrientLabels[nutrientType]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {foodsWithNutrient.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Žiadne záznamy
            </p>
          ) : (
            foodsWithNutrient.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-lg font-semibold text-primary">
                  {item.value}
                  {nutrientUnits[nutrientType]}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}