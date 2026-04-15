import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { ConsumedFoodsList } from "@/components/ConsumedFoodsList";
import { AuthDialog } from "@/components/AuthDialog";
import { AddFoodDialog } from "@/components/AddFoodDialog";
import { ActivitiesManager } from "@/components/ActivitiesManager";
import { MedicinesManager } from "@/components/MedicinesManager";
import { WCManager } from "@/components/WCManager";
import { WaterIntakeManager } from "@/components/WaterIntakeManager";
import { FoodManagement } from "@/components/FoodManagement";
import { NutrientDetailDialog } from "@/components/NutrientDetailDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { consumedFoodService, type DailyNutritionSummary, type ConsumedFoodWithDetails } from "@/services/consumedFoodService";
import { waterService } from "@/services/waterService";
import { dailySummaryService, type NutritionGoalStatus } from "@/services/dailySummaryService";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Plus, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import { activityService } from "@/services/activityService";
import { medicineService } from "@/services/medicineService";
import { wcService } from "@/services/wcService";
import type { 
  ConsumedFoodWithDetails, 
  DailyNutritionSummary,
  NutritionGoalStatus,
} from "@/services/consumedFoodService";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
  const [showNutrientDialog, setShowNutrientDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);
  const [showWCDialog, setShowWCDialog] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState<"fiber" | "sugar" | "fats" | null>(null);
  const [editingFood, setEditingFood] = useState<ConsumedFoodWithDetails | null>(null);
  
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [consumedFoods, setConsumedFoods] = useState<ConsumedFoodWithDetails[]>([]);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary>({
    total_fiber: 0,
    total_sugar: 0,
    total_fats: 0,
    total_kcal: 0,
    total_carbs: 0,
    total_proteins: 0,
    total_salt: 0,
  });
  const [waterTotal, setWaterTotal] = useState(0);
  const [exercise, setExercise] = useState(false);
  const [walkMinutes, setWalkMinutes] = useState(0);
  const [restaurant, setRestaurant] = useState(false);
  const [goals, setGoals] = useState<NutritionGoalStatus>({
    fiber: "normal",
    sugar: "normal",
    fats: "normal",
  });
  const [lastRestaurant, setLastRestaurant] = useState<{ date: string; days_ago: number } | null>(null);
  const [activityCount, setActivityCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [wcCount, setWcCount] = useState(0);

  const formatDateDisplay = (dateStr: string) => {
    const d = parseISO(dateStr);
    return format(d, "EEEE, d. MMMM yyyy", { locale: sk });
  };

  const changeDate = (days: number) => {
    const current = parseISO(date);
    const newDate = days > 0 ? addDays(current, days) : subDays(current, Math.abs(days));
    setDate(format(newDate, "yyyy-MM-dd"));
  };

  const goToToday = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
  };

  const isToday = date === format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userEmail) {
      loadDailyData();
    }
  }, [date, userEmail]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserEmail(user?.email || null);
    setLoading(false);
  };

  const loadDailyData = async () => {
    try {
      // Load consumed foods list
      const fetchedFoods = await consumedFoodService.getDailyConsumedFoods(date);
      setConsumedFoods(fetchedFoods);

      // Nutrition
      const fetchedNutrition = await consumedFoodService.getDailyNutritionSummary(date);
      setNutrition(fetchedNutrition);

      // Water
      const fetchedWater = await waterService.getDailyTotal(date);
      setWaterTotal(fetchedWater);

      // Activity, Medicine, WC counts
      const activities = await activityService.getUserActivitiesByDate(date);
      setActivityCount(activities.length);

      const medicines = await medicineService.getUserMedicinesByDate(date);
      setMedicineCount(medicines.length);

      const wcEntries = await wcService.getEntriesByDate(date);
      setWcCount(wcEntries.length);

      // Daily summary (goals, exercise, etc.)
      const summary = await dailySummaryService.getOrCreateDailySummary(date);
      setExercise(summary.exercise || false);
      setWalkMinutes(summary.walk_minutes || 0);
      setRestaurant(summary.restaurant || false);

      const newGoals = dailySummaryService.evaluateNutritionGoals(
        fetchedNutrition.total_fiber,
        fetchedNutrition.total_sugar,
        fetchedNutrition.total_fats
      );
      setGoals(newGoals);

      const lastRest = await dailySummaryService.getLastRestaurantVisit();
      setLastRestaurant(lastRest);
    } catch (error) {
      console.error("Failed to load daily data:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  const handleEditFood = (food: ConsumedFoodWithDetails) => {
    setEditingFood(food);
    setShowAddFoodDialog(true);
  };

  const handleCloseDialog = () => {
    setShowAddFoodDialog(false);
    setEditingFood(null);
  };

  const handleNutrientClick = (nutrient: string) => {
    if (nutrient === "fiber" || nutrient === "sugar" || nutrient === "fats") {
      setSelectedNutrient(nutrient);
      setShowNutrientDialog(true);
    }
  };

  // Calculate coffee count from consumed foods
  const coffeeCount = consumedFoods.filter(f => f.meal_type === "coffee").length;

  if (loading) {
    return (
      <>
        <SEO title="Food Tracker - Načítavam..." />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p>Načítavam...</p>
        </div>
      </>
    );
  }

  if (!userEmail) {
    return (
      <>
        <SEO title="Food Tracker - Prihlásenie" />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Food Tracker</h1>
            <p className="text-muted-foreground">Prihlásenie vyžadované</p>
            <Button onClick={() => setShowAuthDialog(true)}>
              <User className="h-4 w-4 mr-2" />
              Prihlásiť sa
            </Button>
          </div>
        </div>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={checkAuth} />
      </>
    );
  }

  return (
    <>
      <SEO title={`Food Tracker - ${format(parseISO(date), "d. MMMM yyyy", { locale: sk })}`} />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-sm">{userEmail}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Odhlásiť
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-6">
          {/* Centered App Title and Date Picker */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-bold text-center">Food Tracker</h1>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDate(format(subDays(parseISO(date), 1), "yyyy-MM-dd"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px]">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(parseISO(date), "d. MMMM yyyy", { locale: sk })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={parseISO(date)}
                    onSelect={(d) => d && setDate(format(d, "yyyy-MM-dd"))}
                    locale={sk}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setDate(format(addDays(parseISO(date), 1), "yyyy-MM-dd"))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="foods">Správa potravín</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              <DailySummaryCard
                date={date}
                nutrition={nutrition}
                goals={goals}
                waterTotal={waterTotal}
                coffeeCount={coffeeCount}
                activityCount={activityCount}
                medicineCount={medicineCount}
                wcCount={wcCount}
                exercise={exercise}
                walkMinutes={walkMinutes}
                restaurant={restaurant}
                lastRestaurant={lastRestaurant}
                onExerciseChange={async (v) => { 
                  setExercise(v); 
                  await dailySummaryService.updateDailySummary(date, { exercise: v }); 
                }}
                onWalkMinutesChange={async (v) => { 
                  setWalkMinutes(v); 
                  await dailySummaryService.updateDailySummary(date, { walk_minutes: v }); 
                }}
                onRestaurantChange={async (v) => { 
                  setRestaurant(v); 
                  await dailySummaryService.updateDailySummary(date, { restaurant: v }); 
                  const lastRest = await dailySummaryService.getLastRestaurantVisit();
                  setLastRestaurant(lastRest);
                }}
                onNutrientClick={handleNutrientClick}
                onActivityClick={() => setShowActivityDialog(true)}
                onMedicineClick={() => setShowMedicineDialog(true)}
                onWCClick={() => setShowWCDialog(true)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActivitiesManager 
                  date={date} 
                  open={showActivityDialog}
                  onOpenChange={setShowActivityDialog}
                />
                <MedicinesManager 
                  date={date} 
                  open={showMedicineDialog}
                  onOpenChange={setShowMedicineDialog}
                />
                <WCManager 
                  date={date} 
                  open={showWCDialog}
                  onOpenChange={setShowWCDialog}
                />
                <WaterIntakeManager date={date} onWaterAdded={loadDailyData} />
              </div>

              <ConsumedFoodsList
                date={date}
                foods={consumedFoods}
                onEdit={handleEditFood}
                onDelete={async (id) => {
                  await consumedFoodService.deleteConsumedFood(id);
                  await loadDailyData();
                }}
              />
            </TabsContent>

            <TabsContent value="foods" className="mt-6">
              <FoodManagement />
            </TabsContent>
          </Tabs>
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => {
              setEditingFood(null);
              setShowAddFoodDialog(true);
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        <AddFoodDialog
          open={showAddFoodDialog}
          onOpenChange={handleCloseDialog}
          date={date}
          editingFood={editingFood}
          onSuccess={loadDailyData}
        />

        <NutrientDetailDialog
          open={showNutrientDialog}
          onOpenChange={setShowNutrientDialog}
          nutrientType={selectedNutrient}
          foods={consumedFoods}
        />
      </div>
    </>
  );
}