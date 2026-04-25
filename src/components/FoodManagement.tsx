import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Star, Plus, Search, Download, Image as ImageIcon, Upload, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { foodService, type Food, type FoodWithLastConsumed } from "@/services/foodService";
import { openFoodFactsService, type OpenFoodFactsProduct } from "@/services/openFoodFactsService";
import { storageService } from "@/services/storageService";
import { emojiService } from "@/services/emojiService";
import { useToast } from "@/hooks/use-toast";

export function FoodManagement() {
  const { toast } = useToast();
  const [foods, setFoods] = useState<FoodWithLastConsumed[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Refs for auto-focus
  const foodNameInputRef = useRef<HTMLInputElement>(null);

  // OFF State
  const [showOffDialog, setShowOffDialog] = useState(false);
  const [offSearchQuery, setOffSearchQuery] = useState("");
  const [offResults, setOffResults] = useState<OpenFoodFactsProduct[]>([]);
  const [isSearchingOff, setIsSearchingOff] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    unit: "g" as "g" | "ml",
    kcal: 0,
    fiber: 0,
    sugar: 0,
    carbs: 0,
    fats: 0,
    protein: 0,
    salt: 0,
    is_favorite: false,
    emoji: "🍽️",
    daily_limit: undefined as number | undefined,
  });
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"g" | "ml">("g");
  const [kcal, setKcal] = useState("");
  const [fiber, setFiber] = useState("");
  const [sugar, setSugar] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [protein, setProtein] = useState("");
  const [salt, setSalt] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const data = await foodService.getAllFoods();
      setFoods(data);
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      unit: "g",
      kcal: 0,
      fiber: 0,
      sugar: 0,
      carbs: 0,
      fats: 0,
      protein: 0,
      salt: 0,
      is_favorite: false,
      emoji: "🍽️",
      daily_limit: undefined,
    });
    setEditingFood(null);
    setName("");
    setUnit("g");
    setKcal("");
    setFiber("");
    setSugar("");
    setCarbs("");
    setFats("");
    setProtein("");
    setSalt("");
    setPhotoUrl(null);
    setPhotoUrlInput("");
    setDailyLimit("");
    setNotes("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setUnit(food.unit);
    setKcal(food.kcal.toString());
    setFiber(food.fiber.toString());
    setSugar(food.sugar.toString());
    setCarbs(food.carbs.toString());
    setFats(food.fats.toString());
    setProtein(food.protein.toString());
    setSalt(food.salt.toString());
    setPhotoUrl(food.photo_url || null);
    setPhotoUrlInput(food.photo_url || "");
    setDailyLimit(food.daily_limit?.toString() || "");
    setNotes(food.notes || "");
    setShowCreateDialog(true);
  };

  const handleSearchOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offSearchQuery.trim()) return;

    setIsSearchingOff(true);
    try {
      const result = await openFoodFactsService.searchProducts(offSearchQuery);
      setOffResults(result.products || []);
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vyhľadať potraviny",
        variant: "destructive",
      });
    } finally {
      setIsSearchingOff(false);
    }
  };

  const handleImportOff = (product: OpenFoodFactsProduct) => {
    const nutrients = openFoodFactsService.extractNutrients(product);
    
    resetForm();
    setName(openFoodFactsService.getDisplayName(product));
    setUnit("g");
    setKcal(nutrients.kcal.toString());
    setFiber(nutrients.fiber.toString());
    setSugar(nutrients.sugar.toString());
    setCarbs(nutrients.carbs.toString());
    setFats(nutrients.fats.toString());
    setProtein(nutrients.protein.toString());
    setSalt(nutrients.salt.toString());
    setPhotoUrl(openFoodFactsService.getImageUrl(product));
    
    setShowOffDialog(false);
    setShowCreateDialog(true);
  };

  const handlePhotoUrlChange = (url: string) => {
    setPhotoUrlInput(url);
    setPhotoUrl(url || null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Chyba",
        description: "Môžete nahrať iba obrázky",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Chyba",
        description: "Obrázok je príliš veľký (max 5MB)",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const url = await storageService.uploadFoodPhoto(file);
      setPhotoUrl(url);
      setPhotoUrlInput(url);
      toast({
        title: "Úspech",
        description: "Obrázok nahraný",
      });
    } catch (error: any) {
      console.error("Photo upload error:", error);
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa nahrať obrázok",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (photoUrl && photoUrl.includes("food-photos")) {
      try {
        await storageService.deleteFoodPhoto(photoUrl);
      } catch (error) {
        console.error("Failed to delete photo:", error);
      }
    }
    setPhotoUrl(null);
    setPhotoUrlInput("");
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
        photo_url: photoUrl,
        emoji: emojiService.getFoodEmoji(name.trim()),
        daily_limit: dailyLimit ? parseFloat(dailyLimit) : null,
        notes: notes.trim() || null,
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

      await loadFoods();
      setShowCreateDialog(false);
      resetForm();
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

  const handleEdit = (food: Food) => {
    setFormData({
      name: food.name,
      unit: food.unit,
      kcal: food.kcal,
      fiber: food.fiber,
      sugar: food.sugar,
      carbs: food.carbs,
      fats: food.fats,
      protein: food.protein,
      salt: food.salt,
      is_favorite: food.is_favorite,
      emoji: food.emoji || "🍽️",
      daily_limit: food.daily_limit || undefined,
    });
    setEditingFood(food);
    setShowCreateDialog(true);
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-focus on food name input when dialog opens for creation
  useEffect(() => {
    if (showCreateDialog && !editingFood && foodNameInputRef.current) {
      setTimeout(() => {
        foodNameInputRef.current?.focus();
      }, 150);
    }
  }, [showCreateDialog, editingFood]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať potraviny..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowOffDialog(true)} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Import OFF
          </Button>
          <Button onClick={handleOpenCreate} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Pridať
          </Button>
        </div>
      </div>

      {loading && foods.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Načítavam...</p>
      ) : filteredFoods.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Nenašli sa žiadne potraviny" : "Nemáte žiadne vlastné potraviny"}
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setShowOffDialog(true)}>
                Import z Open Food Facts
              </Button>
              <Button onClick={handleOpenCreate}>
                Vytvoriť prvú potravinu
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredFoods.map((food) => (
            <Card key={food.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {food.photo_url ? (
                      <img src={food.photo_url} alt={food.name} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-2xl">
                        {food.emoji || "🍽️"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold leading-none">{food.name}</h3>
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
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(food)}
                      className="h-8 w-8 text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(food.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                  <div>
                    <span className="text-muted-foreground">Kcal:</span> <span className="font-medium text-emerald-600">{food.kcal}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vláknina:</span> {food.fiber}g
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cukry:</span> {food.sugar}g
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
                  <div className="col-span-2 pt-1 border-t">
                    <span className="text-muted-foreground">Soľ:</span> {food.salt}g
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* OFF Search Dialog */}
      <Dialog open={showOffDialog} onOpenChange={setShowOffDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import z Open Food Facts</DialogTitle>
            <DialogDescription>
              Vyhľadajte potravinu v externej databáze (v slovenčine).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearchOff} className="flex gap-2 mt-2">
            <Input
              value={offSearchQuery}
              onChange={(e) => setOffSearchQuery(e.target.value)}
              placeholder="Napr. Rajo Tvaroh, Kofola..."
            />
            <Button type="submit" disabled={isSearchingOff || !offSearchQuery.trim()}>
              {isSearchingOff ? "Hľadám..." : "Hľadať"}
            </Button>
          </form>

          <div className="flex-1 overflow-y-auto mt-4 space-y-2">
            {offResults.length === 0 && !isSearchingOff && offSearchQuery && (
              <p className="text-center text-muted-foreground py-8">Žiadne výsledky</p>
            )}
            
            {offResults.map((product) => (
              <div key={product.code} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                {openFoodFactsService.getImageUrl(product) ? (
                  <img 
                    src={openFoodFactsService.getImageUrl(product)!} 
                    alt={openFoodFactsService.getDisplayName(product)} 
                    className="w-16 h-16 rounded object-cover bg-white" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{openFoodFactsService.getDisplayName(product)}</h4>
                  <div className="text-sm text-muted-foreground mt-1 flex gap-3">
                    <span>{product.nutriments?.["energy-kcal_100g"] || product.nutriments?.["energy-kcal"] || 0} kcal</span>
                    <span>B: {product.nutriments?.proteins_100g || 0}g</span>
                    <span>S: {product.nutriments?.carbohydrates_100g || 0}g</span>
                  </div>
                </div>
                
                <Button variant="secondary" onClick={() => handleImportOff(product)}>
                  Vybrať
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="flex gap-2">
                <Input
                  ref={foodNameInputRef}
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Napr. Jablko"
                  required
                />
                {!photoUrl && (
                  <div className="w-10 h-10 border rounded-md flex items-center justify-center bg-muted text-xl flex-shrink-0" title="Automatický emotikon">
                    {name.trim() ? emojiService.getFoodEmoji(name.trim()) : "🍽️"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_limit">Limit</Label>
              <Input
                id="daily_limit"
                type="number"
                step="0.01"
                min="0"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Photo Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label>Obrázok potraviny</Label>
              
              {photoUrl && (
                <div className="flex justify-center">
                  <div className="relative">
                    <img src={photoUrl} alt="Náhľad" className="w-32 h-32 rounded-lg object-cover shadow-sm" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemovePhoto}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Nahrať
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-2">
                  <Input
                    placeholder="https://example.com/photo.jpg alebo Google Photos URL"
                    value={photoUrlInput}
                    onChange={(e) => handlePhotoUrlChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vložte URL obrázka (napr. z Google Photos alebo iného zdroja)
                  </p>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximálna veľkosť: 5MB. Podporované formáty: JPG, PNG, WebP
                  </p>
                  {uploadingPhoto && (
                    <p className="text-sm text-blue-600">Nahráva sa...</p>
                  )}
                </TabsContent>
              </Tabs>
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
                <Label htmlFor="sugar">Cukry (g)</Label>
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

              <div className="space-y-2 col-span-2">
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

            <div className="space-y-2 pt-2">
              <Label htmlFor="notes">Poznámka</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Voliteľná poznámka k potravine..."
              />
            </div>

            <DialogFooter className="pt-4 border-t mt-4">
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}