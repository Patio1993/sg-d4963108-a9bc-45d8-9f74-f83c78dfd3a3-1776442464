import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { foodService, type MealType } from "@/services/foodService";
import { Plus } from "lucide-react";

interface FoodEntryFormProps {
  onEntryAdded: () => void;
}

export function FoodEntryForm({ onEntryAdded }: FoodEntryFormProps) {
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [foodName, setFoodName] = useState("");
  const [portion, setPortion] = useState("");
  const [calories, setCalories] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !portion || !calories) return;

    setIsSubmitting(true);
    try {
      await foodService.createEntry({
        meal_type: mealType,
        food_name: foodName,
        portion,
        calories: parseInt(calories),
      });

      setFoodName("");
      setPortion("");
      setCalories("");
      onEntryAdded();
    } catch (error) {
      console.error("Failed to add entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Food Entry
        </CardTitle>
        <CardDescription>Log what you ate today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
                <SelectTrigger id="meal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="food-name">Food Name</Label>
              <Input
                id="food-name"
                placeholder="e.g., Grilled chicken"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portion">Portion</Label>
              <Input
                id="portion"
                placeholder="e.g., 200g, 1 cup"
                value={portion}
                onChange={(e) => setPortion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                placeholder="e.g., 250"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding..." : "Add Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}