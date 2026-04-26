import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Heart, Plus, Search, Star, Trash2, Upload, LinkIcon, Download, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { foodService, type FoodWithLastConsumed, type CreateFoodInput } from "@/services/foodService";
import { consumedFoodService, type ConsumedFoodWithDetails } from "@/services/consumedFoodService";
import { openFoodFactsService, type OpenFoodFactsProduct } from "@/services/openFoodFactsService";
import { storageService } from "@/services/storageService";
import { emojiService } from "@/services/emojiService";
import { FoodImagePreview } from "@/components/FoodImagePreview";

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  editingFood?: ConsumedFoodWithDetails | null;
  onSuccess: () => void;
}

const MEAL_TYPES = ["raňajky", "desiata", "obed", "olovrant", "večera", "káva", "iné"] as const;
const REACTIONS = ["v pohode", "ľahké problémy", "stredné problémy", "veľké problémy"] as const;

const mapMealTypeToDb = (mealType: string): "breakfast" | "snack" | "lunch" | "afternoon_snack" | "dinner" | "coffee" => {
  const mapping: Record<string, "breakfast" | "snack" | "lunch" | "afternoon_snack" | "dinner" | "coffee"> = {
    "raňajky": "breakfast",
    "desiata": "snack",
    "obed": "lunch",
    "olovrant": "afternoon_snack",
    "večera": "dinner",
    "káva": "coffee",
    "iné": "coffee"
  };
  return mapping[mealType] || "lunch";
};

const mapMealTypeFromDb = (dbMealType: string): string => {
  const mapping: Record<string, string> = {
    "breakfast": "raňajky",
    "snack": "desiata",
    "lunch": "obed",
    "afternoon_snack": "olovrant",
    "dinner": "večera",
    "coffee": "káva"
  };
  return mapping[dbMealType] || "obed";
};

const mapReactionToDb = (reaction: string): "good" | "neutral" | "bad" => {
  const mapping: Record<string, "good" | "neutral" | "bad"> = {
    "v pohode": "good",
    "ľahké problémy": "neutral",
    "stredné problémy": "bad",
    "veľké problémy": "bad"
  };
  return mapping[reaction] || "good";
};

const mapReactionFromDb = (dbReaction: string): string => {
  const mapping: Record<string, string> = {
    "good": "v pohode",
    "neutral": "ľahké problémy",
    "bad": "stredné problémy"
  };
  return mapping[dbReaction] || "v pohode";
};

export function AddFoodDialog({ open, onOpenChange, date, editingFood, onSuccess }: AddFoodDialogProps) {
  const [foods, setFoods] = useState<FoodWithLastConsumed[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState<string>("100");
  const [mealType, setMealType] = useState<string>("lunch");
  const [reaction, setReaction] = useState<string>("");
  const [time, setTime] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Refs for auto-focus
  const newFoodNameInputRef = useRef<HTMLInputElement>(null);
  const selectedFoodCardRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  
  // OFF State
  const [showOffDialog, setShowOffDialog] = useState(false);
  const [offSearchQuery, setOffSearchQuery] = useState("");
  const [offResults, setOffResults] = useState<OpenFoodFactsProduct[]>([]);
  const [isSearchingOff, setIsSearchingOff] = useState(false);

  // Create food form state
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodKcal, setNewFoodKcal] = useState("");
  const [newFoodFiber, setNewFoodFiber] = useState("");
  const [newFoodSugar, setNewFoodSugar] = useState("");
  const [newFoodCarbs, setNewFoodCarbs] = useState("");
  const [newFoodFats, setNewFoodFats] = useState("");
  const [newFoodProtein, setNewFoodProtein] = useState("");
  const [newFoodSalt, setNewFoodSalt] = useState("");
  const [newFoodPhotoUrl, setNewFoodPhotoUrl] = useState<string | null>(null);
  const [newFoodPhotoUrlInput, setNewFoodPhotoUrlInput] = useState("");
  const [uploadingNewFoodPhoto, setUploadingNewFoodPhoto] = useState(false);
  const [newFoodDailyLimit, setNewFoodDailyLimit] = useState("");
  const [newFoodNotes, setNewFoodNotes] = useState("");
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);

  // Toast
  const { toast } = useToast();

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
      setSelectedFood({
        ...editingFood.food,
        unit: editingFood.food.unit as "g" | "ml",
      });
      setAmount(editingFood.amount.toString());
      setMealType(mapMealTypeFromDb(editingFood.meal_type));
      setReaction(mapReactionFromDb(editingFood.reaction));
      setTime(editingFood.time);
    } else if (!open) {
      resetForm();
    }
  }, [editingFood, open]);

  // Auto-focus on new food name input when create dialog opens
  useEffect(() => {
    if (showCreateDialog && newFoodNameInputRef.current) {
      setTimeout(() => {
        newFoodNameInputRef.current?.focus();
      }, 100);
    }
  }, [showCreateDialog]);

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
    setAmount("100");
    setMealType("lunch");
    setReaction("");
    setTime("");
  };

  const handleSelectFood = (food: FoodWithLastConsumed) => {
    setSelectedFood(food);
    setAmount(food.unit === "ml" ? "250" : "100");
    
    // Auto-select 'káva' if food name contains káva or kava
    const foodName = food.name.toLowerCase();
    if (foodName.includes("káva") || foodName.includes("kava")) {
      setMealType("káva");
    }

    // Scroll to selected food card and focus amount input
    setTimeout(() => {
      selectedFoodCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      amountInputRef.current?.focus();
      amountInputRef.current?.select();
    }, 100);
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

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Chyba",
        description: "Zadajte platné množstvo",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Chyba",
        description: "Zadajte čas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate consecutive days for this specific food and date
      const dayNumber = await consumedFoodService.getConsecutiveDaysForFood(
        selectedFood.id,
        date
      );

      // If meal type is coffee, get the current coffee count for today
      let coffeeCount: number | undefined;
      if (mealType === "káva") {
        const currentCount = await consumedFoodService.getTodayCoffeeCount(date);
        coffeeCount = currentCount + 1;
      }

      if (editingFood) {
        await consumedFoodService.updateConsumedFood(editingFood.id, {
          food_id: selectedFood.id,
          date,
          time,
          amount: parseFloat(amount),
          meal_type: mapMealTypeToDb(mealType),
          reaction: mapReactionToDb(reaction),
          day_number: dayNumber,
          coffee_count: coffeeCount,
        });
        toast({
          title: "Úspech",
          description: "Záznam aktualizovaný",
        });
      } else {
        await consumedFoodService.createConsumedFood({
          food_id: selectedFood.id,
          date,
          time,
          amount: parseFloat(amount),
          meal_type: mapMealTypeToDb(mealType),
          reaction: mapReactionToDb(reaction),
          day_number: dayNumber,
          coffee_count: coffeeCount,
        });
        toast({
          title: "Úspech",
          description: "Potravina pridaná",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to add food:", error);
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať potravinu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    
    setNewFoodName(openFoodFactsService.getDisplayName(product));
    setNewFoodKcal(nutrients.kcal.toString());
    setNewFoodFiber(nutrients.fiber.toString());
    setNewFoodSugar(nutrients.sugar.toString());
    setNewFoodCarbs(nutrients.carbs.toString());
    setNewFoodFats(nutrients.fats.toString());
    setNewFoodProtein(nutrients.protein.toString());
    setNewFoodSalt(nutrients.salt.toString());
    setNewFoodPhotoUrl(openFoodFactsService.getImageUrl(product));
    
    setShowOffDialog(false);
    setShowCreateDialog(true);
  };

  const handleNewFoodPhotoUrlChange = (url: string) => {
    setNewFoodPhotoUrlInput(url);
    setNewFoodPhotoUrl(url || null);
  };

  const handleNewFoodPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingNewFoodPhoto(true);
    try {
      const url = await storageService.uploadFoodPhoto(file);
      setNewFoodPhotoUrl(url);
      setNewFoodPhotoUrlInput(url);
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
      setUploadingNewFoodPhoto(false);
    }
  };

  const handleRemoveNewFoodPhoto = async () => {
    if (newFoodPhotoUrl && newFoodPhotoUrl.includes("food-photos")) {
      try {
        await storageService.deleteFoodPhoto(newFoodPhotoUrl);
      } catch (error) {
        console.error("Failed to delete photo:", error);
      }
    }
    setNewFoodPhotoUrl(null);
    setNewFoodPhotoUrlInput("");
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
      const foodData: CreateFoodInput = {
        name: newFoodName.trim(),
        unit: "g",
        kcal: parseFloat(newFoodKcal) || 0,
        fiber: parseFloat(newFoodFiber) || 0,
        sugar: parseFloat(newFoodSugar) || 0,
        carbs: parseFloat(newFoodCarbs) || 0,
        fats: parseFloat(newFoodFats) || 0,
        protein: parseFloat(newFoodProtein) || 0,
        salt: parseFloat(newFoodSalt) || 0,
        photo_url: newFoodPhotoUrl,
        emoji: emojiService.getFoodEmoji(newFoodName.trim()),
        daily_limit: newFoodDailyLimit ? parseFloat(newFoodDailyLimit) : null,
        notes: newFoodNotes.trim() || null,
      };
      
      const createdFood = await foodService.createFood(foodData);
      toast({
        title: "Úspech",
        description: "Nová potravina vytvorená",
      });
      
      // Auto-select the newly created food
      const foodWithLastConsumed: FoodWithLastConsumed = {
        id: createdFood.id,
        user_id: createdFood.user_id,
        name: createdFood.name,
        unit: createdFood.unit,
        kcal: createdFood.kcal,
        fiber: createdFood.fiber,
        sugar: createdFood.sugar,
        carbs: createdFood.carbs,
        fats: createdFood.fats,
        protein: createdFood.protein,
        salt: createdFood.salt,
        is_favorite: createdFood.is_favorite,
        emoji: createdFood.emoji,
        photo_url: createdFood.photo_url,
        daily_limit: createdFood.daily_limit,
        created_at: createdFood.created_at,
        last_consumed_at: null,
        days_ago: null,
      };
      setSelectedFood(foodWithLastConsumed);
      setAmount("100");
      
      // Reset form
      setNewFoodName("");
      setNewFoodKcal("");
      setNewFoodFiber("");
      setNewFoodSugar("");
      setNewFoodCarbs("");
      setNewFoodFats("");
      setNewFoodProtein("");
      setNewFoodSalt("");
      setNewFoodPhotoUrl(null);
      setNewFoodPhotoUrlInput("");
      setNewFoodDailyLimit("");
      setNewFoodNotes("");
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

  const recentlyConsumed = [...foods]
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOffDialog(true)}
                      title="Import z Open Food Facts"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewFoodName("");
                        setNewFoodKcal("");
                        setNewFoodFiber("");
                        setNewFoodSugar("");
                        setNewFoodCarbs("");
                        setNewFoodFats("");
                        setNewFoodProtein("");
                        setNewFoodSalt("");
                        setNewFoodPhotoUrl(null);
                        setNewFoodDailyLimit("");
                        setNewFoodNotes("");
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nová
                    </Button>
                  </div>
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
                            onClick={() => {
                              setSelectedFood(food);
                              setAmount("100");
                            }}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          >
                            {food.photo_url ? (
                              <img
                                src={food.photo_url}
                                alt={food.name}
                                className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImagePreview({ url: food.photo_url!, name: food.name });
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center text-2xl bg-muted rounded-lg">
                                {food.emoji || "🍽️"}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">
                                {food.name}
                                {food.daily_limit && ` - Limit ${food.daily_limit} ${food.unit}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {food.kcal} kcal • {food.fiber}g vláknina • {food.sugar}g cukry
                              </p>
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
                        <div className="space-y-2">
                          {favoriteFoods.map((food) => (
                            <div
                              key={food.id}
                              onClick={() => {
                                setSelectedFood(food);
                                setAmount("100");
                              }}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            >
                              <img
                                src={
                                  food.photo_url || 
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                                }
                                alt={food.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {food.name}
                                  {food.daily_limit && ` - Limit ${food.daily_limit} ${food.unit}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {food.kcal} kcal • {food.fiber}g vláknina • {food.sugar}g cukry
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="recent" className="mt-4">
                    <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                      {recentlyConsumed.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Žiadne nedávno konzumované potraviny
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {recentlyConsumed.map((food) => (
                            <div
                              key={food.id}
                              onClick={() => {
                                setSelectedFood(food);
                                setAmount("100");
                              }}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            >
                              <img
                                src={
                                  food.photo_url || 
                                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                                }
                                alt={food.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {food.name}
                                  {food.daily_limit && ` - Limit ${food.daily_limit} ${food.unit}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {food.kcal} kcal • Naposledy: {food.days_ago === 0 ? "Dnes" : `pred ${food.days_ago} dňami`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {selectedFood && (
              <div className="space-y-4 pt-4 border-t" ref={selectedFoodCardRef}>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  {selectedFood.photo_url ? (
                    <img
                      src={selectedFood.photo_url}
                      alt={selectedFood.name}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setImagePreview({ url: selectedFood.photo_url!, name: selectedFood.name })}
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center text-4xl bg-background rounded-lg">
                      {selectedFood.emoji || "🍽️"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium mb-1">Vybraná potravina:</div>
                    <div className="font-semibold text-lg">{selectedFood.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedFood.kcal} kcal/{selectedFood.unit === "ml" ? "100ml" : "100g"} • V: {selectedFood.fiber}g • C: {selectedFood.sugar}g • T: {selectedFood.fats}g
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFood(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Množstvo ({selectedFood.unit}) *</Label>
                    <Input
                      ref={amountInputRef}
                      id="amount"
                      type="number"
                      step="0.1"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100"
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

            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušiť
              </Button>
              <Button type="submit" disabled={loading || !selectedFood}>
                {loading ? "Ukladám..." : editingFood ? "Uložiť zmeny" : "Pridať záznam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
            
            {offResults && offResults.length > 0 ? (
              offResults.map((product) => {
                const displayName = openFoodFactsService.getDisplayName(product);
                const imageUrl = openFoodFactsService.getImageUrl(product);
                const nutrients = openFoodFactsService.extractNutrients(product);
                
                return (
                  <div
                    key={product.code}
                    onClick={() => handleImportOff(product)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={displayName}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xl">
                        🍽️
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.brands && `${product.brands} • `}
                        {nutrients.kcal} kcal • {nutrients.fiber}g vláknina • {nutrients.sugar}g cukry
                      </p>
                    </div>
                  </div>
                );
              })
            ) : offSearchQuery && !isSearchingOff ? (
              <p className="text-center text-muted-foreground py-8">Žiadne výsledky</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Food Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vytvoriť novú potravinu</DialogTitle>
            <DialogDescription>
              Zadajte nutričné hodnoty na 100g potraviny
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFood} className="space-y-4">
            {/* Photo Section */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label>Obrázok potraviny</Label>
              
              {newFoodPhotoUrl && (
                <div className="flex justify-center">
                  <div className="relative">
                    <img src={newFoodPhotoUrl} alt="Náhľad" className="w-32 h-32 rounded-lg object-cover shadow-sm" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveNewFoodPhoto}
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
                    value={newFoodPhotoUrlInput}
                    onChange={(e) => handleNewFoodPhotoUrlChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vložte URL obrázka (napr. z Google Photos alebo iného zdroja)
                  </p>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleNewFoodPhotoUpload}
                    disabled={uploadingNewFoodPhoto}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximálna veľkosť: 5MB. Podporované formáty: JPG, PNG, WebP
                  </p>
                  {uploadingNewFoodPhoto && (
                    <p className="text-sm text-blue-600">Nahráva sa...</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-food-name">Názov potraviny *</Label>
              <div className="flex gap-2">
                <Input
                  ref={newFoodNameInputRef}
                  id="new-food-name"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  placeholder="napr. Jablko"
                  required
                />
                {!newFoodPhotoUrl && (
                  <div className="w-10 h-10 border rounded-md flex items-center justify-center bg-muted text-xl flex-shrink-0" title="Automatický emotikon">
                    {newFoodName.trim() ? emojiService.getFoodEmoji(newFoodName.trim()) : "🍽️"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-daily-limit">Limit</Label>
              <Input
                id="new-daily-limit"
                type="number"
                step="0.01"
                min="0"
                value={newFoodDailyLimit}
                onChange={(e) => setNewFoodDailyLimit(e.target.value)}
                placeholder="0.00"
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
                <Label htmlFor="new-sugar">Sukríny/100g (g)</Label>
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
                <Label htmlFor="new-carbs">Sústava/100g (g)</Label>
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
                <Label htmlFor="new-protein">Bielek/100g (g)</Label>
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

              <div className="space-y-2">
                <Label htmlFor="new-salt">Sůl/100g (g)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="new-notes">Poznámky</Label>
              <Textarea
                id="new-notes"
                value={newFoodNotes}
                onChange={(e) => setNewFoodNotes(e.target.value)}
                placeholder="napr. zelenina, cukorová čajová číška, ..."
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <FoodImagePreview
        open={!!imagePreview}
        onOpenChange={() => setImagePreview(null)}
        imageUrl={imagePreview?.url || null}
        foodName={imagePreview?.name || ""}
      />
    </>
  );
}