import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { ConsumedFoodsList } from "@/components/ConsumedFoodsList";
import { AuthDialog } from "@/components/AuthDialog";
import { AddFoodDialog } from "@/components/AddFoodDialog";
import { consumedFoodService, type DailyNutritionSummary } from "@/services/consumedFoodService";
import { waterService } from "@/services/waterService";
import { dailySummaryService } from "@/services/dailySummaryService";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Plus } from "lucide-react";

export interface NutritionGoals {
  fiber: { status: "neutral" | "good" | "warning" | "danger"; min: number; max: number };
  sugar: { status: "neutral" | "good" | "warning" | "danger"; min: number; max: number };
  fats: { status: "neutral" | "good" | "warning" | "danger"; min: number; max: number };
}

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAddFoodDialog, setShowAddFoodDialog] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary>({
    total_kcal: 0,
    total_fiber: 0,
    total_sugar: 0,
    total_carbs: 0,
    total_fats: 0,
    total_proteins: 0,
    total_salt: 0,
  });
  const [waterTotal, setWaterTotal] = useState(0);
  const [exercise, setExercise] = useState(false);
  const [walkMinutes, setWalkMinutes] = useState(0);
  const [restaurant, setRestaurant] = useState(false);
  const [lastRestaurant, setLastRestaurant] = useState<{ date: string; days_ago: number } | null>(null);
  const [goals, setGoals] = useState<NutritionGoals>({
    fiber: { status: "neutral", min: 25, max: 30 },
    sugar: { status: "neutral", min: 30, max: 50 },
    fats: { status: "neutral", min: 50, max: 60 },
  });

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
      // Nutrition
      const fetchedNutrition = await consumedFoodService.getDailyNutritionSummary(date);
      setNutrition(fetchedNutrition);

      // Water
      const fetchedWater = await waterService.getDailyTotal(date);
      setWaterTotal(fetchedWater);

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

      const lastRest = await dailySummaryService.getLastRestaurantVisit(date);
      setLastRestaurant(lastRest);
    } catch (error) {
      console.error("Failed to load daily data:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Načítavam...</p>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <>
        <SEO 
          title="Food Tracker - Sledujte výživu"
          description="Komplexná aplikácia pre sledovanie dennej konzumácie potravín s nutričnými hodnotami"
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Food Tracker</h1>
              <p className="text-muted-foreground">Sledujte svoje jedlá a nutričné ciele</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-md space-y-4">
              <p className="text-sm text-muted-foreground">Prihláste sa pre začatie sledovania</p>
              <Button className="w-full" onClick={() => setShowAuthDialog(true)}>
                Prihlásiť / Registrovať
              </Button>
            </div>
          </div>
        </div>
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          onSuccess={checkAuth}
        />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Food Tracker - Sledujte výživu"
        description="Komplexná aplikácia pre sledovanie dennej konzumácie potravín s nutričnými hodnotami"
      />
      <div className="min-h-screen bg-background pb-20">
        <header className="border-b bg-card shadow-sm sticky top-0 z-10">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Food Tracker</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {userEmail}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Odhlásiť
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 max-w-5xl space-y-6">
          <DailySummaryCard
            date={date}
            nutrition={nutrition}
            goals={goals}
            waterTotal={waterTotal}
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
              const lastRest = await dailySummaryService.getLastRestaurantVisit(date);
              setLastRestaurant(lastRest);
            }}
            onNutrientClick={(nutrient) => {
              console.log("Clicked nutrient:", nutrient);
            }}
          />

          <ConsumedFoodsList
            date={date}
            onEdit={(food) => {
              console.log("Edit", food);
            }}
            onDelete={async () => {
              await loadDailyData();
            }}
          />
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setShowAddFoodDialog(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        <AddFoodDialog
          open={showAddFoodDialog}
          onOpenChange={setShowAddFoodDialog}
          date={date}
          onSuccess={loadDailyData}
        />
      </div>
    </>
  );
}