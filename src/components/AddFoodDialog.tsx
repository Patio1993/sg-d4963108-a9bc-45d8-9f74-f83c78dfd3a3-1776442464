import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { foodService, type FoodWithLastConsumed } from "@/services/foodService";
import { consumedFoodService, type ConsumedFoodWithDetails } from "@/services/consumedFoodService";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  editingFood?: ConsumedFoodWithDetails | null;
  onSuccess: () => void;
}

const MEAL_TYPES = ["raňajky", "desiata", "obed", "olovrant", "večera", "iné"] as const;
const REACTIONS = ["v pohode", "ľahké problémy", "stredné problémy", "veľké problémy"] as const;

export function AddFoodDialog({ open, onOpenChange, date, editingFood, onSuccess }: AddFoodDialogProps) {
  const { toast } = useToast();
  const [foods, setFoods] = useState<FoodWithLastConsumed[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodWithLastConsumed | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [mealType, setMealType] = useState<string>("obed");
  const [reaction, setReaction] = useState<string>("v pohode");
  const [time, setTime] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create food form state
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodKcal, setNewFoodKcal] = useState("");
  const [newFoodFiber, setNewFoodFiber] = useState("");
  const [newFoodSugar, setNewFoodSugar] = useState("");
  const [newFoodCarbs, setNewFoodCarbs] = useState("");
  const [newFoodFats, setNewFoodFats] = useState("");
  const [newFoodProtein, setNewFoodProtein] = useState("");
  const [newFoodSalt, setNewFoodSalt] = useState("");

  useEffect(() => {
    if (open) {
      loadFoods();
      if (!editingFood) {
        const now = new Date();
        setTime(now.toTimeString().slice(0, 5));
      }
    }
  }, [open, editingFood]);

  useEffect(() => {
    if (editingFood && open) {
      setSelectedFood(editingFood.food);
      setAmount(editingFood.amount.toString());
      setMealType(editingFood.meal_type);
      setReaction(editingFood.reaction);
      setTime(editingFood.time);
    } else if (!open) {
      resetForm();
    }
  }, [editingFood, open]);

  const loadFoods = async () => {
    try {
      const allFoods = await foodService.getAllFoods();
      setFoods(allFoods);
    } catch (error) {
      console.error("Failed to load foods:", error);
    }
  };

  const resetForm = () => {
    setSelectedFood(null);
    setSearchQuery("");
    setAmount("");
    setMealType("obed");
    setReaction("v pohode");
    setTime("");
  };

  const handleSelectFood = (food: FoodWithLastConsumed) => {
    setSelectedFood(food);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood || !amount || !time) {
      toast({
        title: "Chyba",
        description: "Vyplňte všetky povinné polia",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingFood) {
        await consumedFoodService.updateConsumedFood(
          editingFood.id,
          {
            amount: parseFloat(amount),
            meal_type: mealType as any,
            reaction: reaction as any,
            time
          }
        );
        toast({
          title: "Úspech",
          description: "Potravina upravená",
        });
      } else {
        const dayNumber = await consumedFoodService.getNextDayNumber();
        await consumedFoodService.createConsumedFood({
          food_id: selectedFood.id,
          date,
          amount: parseFloat(amount),
          meal_type: mealType as any,
          reaction: reaction as any,
          time,
          day_number: dayNumber
        });
        toast({
          title: "Úspech",
          description: "Potravina pridaná",
        });
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save food:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa uložiť potravinu",
        variant: "destructive",
      });
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) {
      toast({
        title: "Chyba",
        description: "Zadajte názov potraviny",
        variant: "destructive",
      });
      return;
    }

    try {
      await foodService.createFood({
        name: newFoodName.trim(),
        unit: "g",
        kcal: parseFloat(newFoodKcal) || 0,
        fiber: parseFloat(newFoodFiber) || 0,
        sugar: parseFloat(newFoodSugar) || 0,
        carbs: parseFloat(newFoodCarbs) || 0,
        fats: parseFloat(newFoodFats) || 0,
        protein: parseFloat(newFoodProtein) || 0,
        salt: parseFloat(newFoodSalt) || 0
      });
      toast({
        title: "Úspech",
        description: "Nová potravina vytvorená",
      });
      // Reset form
      setNewFoodName("");
      setNewFoodKcal("");
      setNewFoodFiber("");
      setNewFoodSugar("");
      setNewFoodCarbs("");
      setNewFoodFats("");
      setNewFoodProtein("");
      setNewFoodSalt("");
      setShowCreateDialog(false);
      // Reload foods
      await loadFoods();
    } catch (error) {
      console.error("Failed to create food:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vytvoriť potravinu",
        variant: "destructive",
      });
    }
  };

  const filteredFoods = searchQuery
    ? foods.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : foods;

  const favoriteFoods = foods.filter((f) => f.is_favorite === true);

  const recentFoods = [...foods]
    .filter((f) => f.days_ago !== null && f.days_ago !== undefined)
    .sort((a, b) => {
      if (a.days_ago === null || a.days_ago === undefined) return 1;
      if (b.days_ago === null || b.days_ago === undefined) return -1;
      return a.days_ago - b.days_ago;
    })
    .slice(0, 10);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFood ? "Upraviť potravinu" : "Pridať potravinu"}
            </DialogTitle>
            <DialogDescription>
              {editingFood
                ? "Upravte množstvo a typ jedla"
                : "Vyberte potravinu a zadajte množstvo"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!editingFood && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 mr-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Hľadať potravinu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nová potravina
                  </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Všetky</TabsTrigger>
                    <TabsTrigger value="favorites">Obľúbené</TabsTrigger>
                    <TabsTrigger value="recent">Naposledy</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                      {filteredFoods.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Žiadne potraviny
                        </p>
                      ) : (
                        filteredFoods.map((food) => (
                          <div
                            key={food.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedFood?.id === food.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleSelectFood(food)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {food.kcal} kcal • V: {food.fiber}g • C: {food.sugar}g • T: {food.fats}g
                                </div>
                              </div>
                              {food.is_favorite && (
                                <Badge variant="secondary" className="ml-2">⭐</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="favorites" className="mt-4">
                    <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                      {favoriteFoods.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Žiadne obľúbené potraviny
                        </p>
                      ) : (
                        favoriteFoods.map((food) => (
                          <div
                            key={food.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedFood?.id === food.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleSelectFood(food)}
                          >
                            <div className="font-medium">{food.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {food.kcal} kcal • V: {food.fiber}g • C: {food.sugar}g • T: {food.fats}g
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="recent" className="mt-4">
                    <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                      {recentFoods.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Žiadne nedávno konzumované potraviny
                        </p>
                      ) : (
                        recentFoods.map((food) => (
                          <div
                            key={food.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedFood?.id === food.id
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => handleSelectFood(food)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {food.kcal} kcal • V: {food.fiber}g • C: {food.sugar}g • T: {food.fats}g
                                </div>
                                {food.days_ago !== null && food.days_ago !== undefined && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Naposledy: pred {food.days_ago} dňami
                                  </div>
                                )}
                              </div>
                              {food.is_favorite && (
                                <Badge variant="secondary" className="ml-2">⭐</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {selectedFood && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="font-medium mb-2">Vybraná potravina:</div>
                    <div className="text-sm">{selectedFood.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedFood.kcal} kcal/{selectedFood.unit === "ml" ? "100ml" : "100g"} • V: {selectedFood.fiber}g • C: {selectedFood.sugar}g • T: {selectedFood.fats}g
                    </div>
                  </div>
                )}
              </div>
            )}

            {(selectedFood || editingFood) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Množstvo (g) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="napr. 150"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Čas *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meal-type">Typ jedla *</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger id="meal-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reaction">Reakcia *</Label>
                  <Select value={reaction} onValueChange={setReaction}>
                    <SelectTrigger id="reaction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REACTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušiť
              </Button>
              <Button type="submit" disabled={!selectedFood && !editingFood}>
                {editingFood ? "Uložiť" : "Pridať"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Food Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vytvoriť novú potravinu</DialogTitle>
            <DialogDescription>
              Zadajte nutričné hodnoty na 100g potraviny
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFood} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-food-name">Názov potraviny *</Label>
              <Input
                id="new-food-name"
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
                placeholder="napr. Jablko"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-kcal">Kcal/100g</Label>
                <Input
                  id="new-kcal"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodKcal}
                  onChange={(e) => setNewFoodKcal(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-fiber">Vláknina/100g (g)</Label>
                <Input
                  id="new-fiber"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodFiber}
                  onChange={(e) => setNewFoodFiber(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-sugar">Cukor/100g (g)</Label>
                <Input
                  id="new-sugar"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodSugar}
                  onChange={(e) => setNewFoodSugar(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-carbs">Sacharidy/100g (g)</Label>
                <Input
                  id="new-carbs"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodCarbs}
                  onChange={(e) => setNewFoodCarbs(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-fats">Tuky/100g (g)</Label>
                <Input
                  id="new-fats"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodFats}
                  onChange={(e) => setNewFoodFats(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-protein">Bielkoviny/100g (g)</Label>
                <Input
                  id="new-protein"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodProtein}
                  onChange={(e) => setNewFoodProtein(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="new-salt">Soľ/100g (g)</Label>
                <Input
                  id="new-salt"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFoodSalt}
                  onChange={(e) => setNewFoodSalt(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Zrušiť
              </Button>
              <Button type="submit">
                Vytvoriť
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}