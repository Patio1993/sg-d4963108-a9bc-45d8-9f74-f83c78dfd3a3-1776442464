import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Clock, Plus } from "lucide-react";
import { foodService, type Food, type FoodWithLastConsumed } from "@/services/foodService";
import { consumedFoodService, type CreateConsumedFoodData } from "@/services/consumedFoodService";
import { useToast } from "@/hooks/use-toast";

type MealType = "Raňajky" | "Desiata" | "Obed" | "Olovrant" | "Večera" | "Káva";
type Reaction = "Dobré" | "Neutrálne" | "Zlé";

const MEAL_TYPES: MealType[] = ["Raňajky", "Desiata", "Obed", "Olovrant", "Večera", "Káva"];
const REACTIONS: { value: Reaction; emoji: string }[] = [
  { value: "Dobré", emoji: "🙂" },
  { value: "Neutrálne", emoji: "😐" },
  { value: "Zlé", emoji: "🙁" },
];

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  onSuccess: () => void;
}

export function AddFoodDialog({ open, onOpenChange, date, onSuccess }: AddFoodDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<FoodWithLastConsumed[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodWithLastConsumed | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [mealType, setMealType] = useState<MealType>("Raňajky");
  const [reaction, setReaction] = useState<Reaction>("Neutrálne");
  const [coffeeNumber, setCoffeeNumber] = useState(1);

  useEffect(() => {
    if (open) {
      loadFoods();
      // Set current time as default
      const now = new Date();
      setTime(now.toTimeString().slice(0, 5));
    }
  }, [open]);

  const loadFoods = async () => {
    try {
      const data = await foodService.searchFoods("");
      setFoods(data);
    } catch (error) {
      console.error("Failed to load foods:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const data = await foodService.searchFoods(query);
      setFoods(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleSelectFood = (food: FoodWithLastConsumed) => {
    setSelectedFood(food);
  };

  const mapMealTypeToDb = (type: string): CreateConsumedFoodData["meal_type"] => {
    switch (type) {
      case "Raňajky": return "breakfast";
      case "Desiata": return "snack";
      case "Obed": return "lunch";
      case "Olovrant": return "afternoon_snack";
      case "Večera": return "dinner";
      case "Káva": return "coffee";
      default: return "breakfast";
    }
  };

  const mapReactionToDb = (reaction: string): CreateConsumedFoodData["reaction"] => {
    switch (reaction) {
      case "Dobré": return "good";
      case "Neutrálne": return "neutral";
      case "Zlé": return "bad";
      default: return "neutral";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFood) {
      toast({
        title: "Chyba",
        description: "Vyberte potravinu",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Chyba",
        description: "Zadajte platné množstvo (> 0)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dayNumber = await consumedFoodService.getNextDayNumber();
      await consumedFoodService.createConsumedFood({
        food_id: selectedFood.id,
        date,
        time,
        amount: Math.round(amountNum * 100) / 100, // 2 decimal places
        meal_type: mapMealTypeToDb(mealType),
        reaction: mapReactionToDb(reaction),
        day_number: dayNumber,
        coffee_count: mealType === "Káva" ? coffeeNumber : undefined,
      });

      toast({
        title: "Úspech",
        description: "Potravina pridaná",
      });

      // Reset form
      setSelectedFood(null);
      setAmount("");
      setReaction("Neutrálne");
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať potravinu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const favoritesFoods = foods.filter(f => f.is_favorite);
  const otherFoods = foods.filter(f => !f.is_favorite);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Pridať potravinu</DialogTitle>
          <DialogDescription>
            Vyhľadajte a pridajte konzumovanú potravinu
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Food search and selection */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Vyhľadať potravinu..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Favorites */}
                {favoritesFoods.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      Obľúbené
                    </h3>
                    {favoritesFoods.map((food) => (
                      <Card
                        key={food.id}
                        className={`cursor-pointer transition-colors ${
                          selectedFood?.id === food.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectFood(food)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{food.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {food.kcal} kcal / 100{food.unit}
                              </p>
                            </div>
                            {food.days_ago !== null && food.days_ago !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {food.days_ago === 0
                                  ? "Dnes"
                                  : food.days_ago === 1
                                  ? "Včera"
                                  : food.days_ago === 2
                                  ? "Predvčerom"
                                  : `Pred ${food.days_ago} dňami`}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* All foods */}
                {otherFoods.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Všetky potraviny</h3>
                    {otherFoods.map((food) => (
                      <Card
                        key={food.id}
                        className={`cursor-pointer transition-colors ${
                          selectedFood?.id === food.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectFood(food)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{food.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {food.kcal} kcal / 100{food.unit}
                              </p>
                            </div>
                            {food.days_ago !== null && food.days_ago !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {food.days_ago === 0
                                  ? "Dnes"
                                  : food.days_ago === 1
                                  ? "Včera"
                                  : food.days_ago === 2
                                  ? "Predvčerom"
                                  : `Pred ${food.days_ago} dňami`}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Entry form */}
          <div className="space-y-4">
            {selectedFood ? (
              <>
                <Card className="bg-primary/5 border-primary">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{selectedFood.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Kcal:</span> {selectedFood.kcal}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vláknina:</span> {selectedFood.fiber}g
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cukor:</span> {selectedFood.sugar}g
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sacharidy:</span> {selectedFood.carbs}g
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tuky:</span> {selectedFood.fats}g
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bielkoviny:</span> {selectedFood.protein}g
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Množstvo ({selectedFood.unit})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="napr. 150"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Čas</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Typ jedla</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {MEAL_TYPES.map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={mealType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMealType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {mealType === "Káva" && (
                    <div className="space-y-2">
                      <Label htmlFor="coffee">Koľkáta káva dnes</Label>
                      <Input
                        id="coffee"
                        type="number"
                        min="1"
                        value={coffeeNumber}
                        onChange={(e) => setCoffeeNumber(parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Reakcia</Label>
                    <div className="flex gap-2">
                      {REACTIONS.map(({ value, emoji }) => (
                        <Button
                          key={value}
                          type="button"
                          variant={reaction === value ? "default" : "outline"}
                          onClick={() => setReaction(value)}
                          className="flex-1"
                        >
                          {emoji} {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? "Pridávam..." : "Pridať"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Vyberte potravinu zo zoznamu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}