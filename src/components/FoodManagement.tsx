import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Star, Plus, Search } from "lucide-react";
import { foodService, type Food } from "@/services/foodService";
import { useToast } from "@/hooks/use-toast";

export function FoodManagement() {
  const { toast } = useToast();
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"g" | "ml">("g");
  const [kcal, setKcal] = useState("");
  const [fiber, setFiber] = useState("");
  const [sugar, setSugar] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [protein, setProtein] = useState("");
  const [salt, setSalt] = useState("");

  useEffect(() => {
    loadFoods();
  }, [searchQuery]);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const data = await foodService.searchFoods(searchQuery);
      // Filter only user's custom foods
      setFoods(data.filter(f => f.user_id !== null));
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setUnit("g");
    setKcal("");
    setFiber("");
    setSugar("");
    setCarbs("");
    setFats("");
    setProtein("");
    setSalt("");
    setEditingFood(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setUnit(food.unit as "g" | "ml");
    setKcal(food.kcal.toString());
    setFiber(food.fiber.toString());
    setSugar(food.sugar.toString());
    setCarbs(food.carbs.toString());
    setFats(food.fats.toString());
    setProtein(food.protein.toString());
    setSalt(food.salt.toString());
    setShowCreateDialog(true);
  };

  const validateNumber = (value: string): number => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return 0;
    return Math.round(num * 100) / 100; // 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Chyba",
        description: "Názov je povinný",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const foodData = {
        name: name.trim(),
        unit,
        kcal: validateNumber(kcal),
        fiber: validateNumber(fiber),
        sugar: validateNumber(sugar),
        carbs: validateNumber(carbs),
        fats: validateNumber(fats),
        protein: validateNumber(protein),
        salt: validateNumber(salt),
      };

      if (editingFood) {
        await foodService.updateFood(editingFood.id, foodData);
        toast({
          title: "Úspech",
          description: "Potravina aktualizovaná",
        });
      } else {
        await foodService.createFood(foodData);
        toast({
          title: "Úspech",
          description: "Potravina vytvorená",
        });
      }

      setShowCreateDialog(false);
      resetForm();
      loadFoods();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa uložiť potravinu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj chcete odstrániť túto potravinu?")) return;

    try {
      await foodService.deleteFood(id);
      toast({
        title: "Úspech",
        description: "Potravina odstránená",
      });
      loadFoods();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odstrániť potravinu",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (food: Food) => {
    try {
      await foodService.toggleFavorite(food.id, !food.is_favorite);
      loadFoods();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa aktualizovať obľúbenú",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať potraviny..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Pridať potravinu
        </Button>
      </div>

      {loading && foods.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Načítavam...</p>
      ) : foods.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "Nenašli sa žiadne potraviny" : "Nemáte žiadne vlastné potraviny"}
            </p>
            <Button variant="link" onClick={handleOpenCreate} className="mt-2">
              Vytvoriť prvú potravinu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {foods.map((food) => (
            <Card key={food.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{food.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleToggleFavorite(food)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            food.is_favorite ? "fill-accent text-accent" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      na 100{food.unit === "g" ? "g" : "ml"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(food)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(food.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kcal:</span> {food.kcal}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vláknina:</span> {food.fiber}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cukor:</span> {food.sugar}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sacharidy:</span> {food.carbs}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tuky:</span> {food.fats}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bielkoviny:</span> {food.protein}g
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Soľ:</span> {food.salt}g
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFood ? "Upraviť potravinu" : "Nová potravina"}</DialogTitle>
            <DialogDescription>
              Všetky nutričné hodnoty sú na 100g alebo 100ml
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Názov *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Napr. Jablko"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Jednotka *</Label>
              <RadioGroup value={unit} onValueChange={(v) => setUnit(v as "g" | "ml")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="g" id="g" />
                  <Label htmlFor="g" className="font-normal cursor-pointer">
                    Gramy (g)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ml" id="ml" />
                  <Label htmlFor="ml" className="font-normal cursor-pointer">
                    Mililitre (ml)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kcal">Kalórie (kcal)</Label>
                <Input
                  id="kcal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiber">Vláknina (g)</Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sugar">Cukor (g)</Label>
                <Input
                  id="sugar"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbs">Sacharidy (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.01"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fats">Tuky (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein">Bielkoviny (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.01"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salt">Soľ (g)</Label>
                <Input
                  id="salt"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salt}
                  onChange={(e) => setSalt(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                Zrušiť
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Ukladám..." : editingFood ? "Uložiť" : "Vytvoriť"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}