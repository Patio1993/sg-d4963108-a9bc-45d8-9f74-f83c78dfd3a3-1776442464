import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { ConsumedFoodsList } from "@/components/ConsumedFoodsList";
import { consumedFoodService, type ConsumedFoodWithDetails, type DailyNutritionSummary } from "@/services/consumedFoodService";
import { dailySummaryService, type NutritionGoalStatus } from "@/services/dailySummaryService";
import { waterService } from "@/services/waterService";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [foods, setFoods] = useState<ConsumedFoodWithDetails[]>([]);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary>({
    total_kcal: 0, total_fiber: 0, total_sugar: 0, total_carbs: 0,
    total_fats: 0, total_protein: 0, total_salt: 0
  });
  const [goals, setGoals] = useState<NutritionGoalStatus>({ fiber: "low", sugar: "good", fats: "good" });
  const [exercise, setExercise] = useState(false);
  const [walkMinutes, setWalkMinutes] = useState(0);
  const [restaurant, setRestaurant] = useState(false);
  const [waterTotal, setWaterTotal] = useState(0);
  const [lastRestaurant, setLastRestaurant] = useState<{date: string, days_ago: number} | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userEmail) {
      loadDailyData();
    }
  }, [userEmail, date]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserEmail(user?.email || null);
    setLoading(false);
  };

  const loadDailyData = async () => {
    try {
      // Foods
      const fetchedFoods = await consumedFoodService.getDailyConsumedFoods(date);
      setFoods(fetchedFoods);
      
      // Nutrition
      const fetchedNutrition = await consumedFoodService.getDailyNutritionSummary(date);
      setNutrition(fetchedNutrition);

      // Water
      const fetchedWater = await waterService.getDailyWaterIntake(date);
      setWaterTotal(fetchedWater);

      // Daily summary (goals, exercise, etc.)
      let summary = await dailySummaryService.getDailySummary(date);
      if (!summary) {
         summary = await dailySummaryService.createDailySummary(date);
      }
      setExercise(summary.exercise || false);
      setWalkMinutes(summary.walk_minutes || 0);
      setRestaurant(summary.restaurant || false);

      const newGoals = dailySummaryService.evaluateGoals(fetchedNutrition);
      setGoals(newGoals);

      const lastRest = await dailySummaryService.getLastRestaurantDate();
      setLastRestaurant(lastRest);
    } catch (error) {
      console.error("Failed to load daily data:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Načítavam...</p></div>;

  if (!userEmail) {
    return (
      <>
        <SEO title="Food Tracker - Prihlásenie" />
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md text-center space-y-6">
            <h1 className="text-4xl font-bold text-primary">Food Tracker</h1>
            <p className="text-muted-foreground">Komplexná nutričná aplikácia pre sledovanie dennej spotreby a cieľov.</p>
            <div className="p-6 bg-card rounded-lg shadow-sm border space-y-4">
              <Button className="w-full" onClick={() => setShowAuthDialog(true)}>
                Prihlásiť sa / Registrovať
              </Button>
            </div>
          </div>
        </div>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={checkAuth} />
      </>
    );
  }

  return (
    <>
      <SEO title="Food Tracker - Dashboard" />
      <div className="min-h-screen bg-background pb-20">
        <header className="border-b bg-card shadow-sm sticky top-0 z-10">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Food Tracker</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-2">
                <User className="h-4 w-4"/> {userEmail}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Odhlásiť sa
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 max-w-4xl space-y-8">
          <DailySummaryCard
            nutrition={nutrition}
            goals={goals}
            exercise={exercise}
            walkMinutes={walkMinutes}
            restaurant={restaurant}
            waterTotal={waterTotal}
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
              const lastRest = await dailySummaryService.getLastRestaurantDate();
              setLastRestaurant(lastRest);
            }}
            onNutrientClick={(nutrient) => {
              console.log("Sort by", nutrient);
            }}
          />
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Skonzumované jedlá</h2>
            <Button>Pridať jedlo</Button>
          </div>

          <ConsumedFoodsList
            foods={foods}
            sortedBy=""
            onDelete={async (id) => { 
              await consumedFoodService.deleteConsumedFood(id); 
              loadDailyData(); 
            }}
            onEdit={(food) => {
              console.log("Edit", food);
            }}
          />
        </main>
      </div>
    </>
  );
}