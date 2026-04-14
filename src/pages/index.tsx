import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { FoodEntryForm } from "@/components/FoodEntryForm";
import { DailyFoodLog } from "@/components/DailyFoodLog";
import { AuthDialog } from "@/components/AuthDialog";
import { foodService, type FoodEntry } from "@/services/foodService";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";

export default function Home() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserEmail(user?.email || null);
    setLoading(false);

    if (user) {
      loadEntries();
    }
  };

  const loadEntries = async () => {
    try {
      const data = await foodService.getTodayEntries();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await foodService.deleteEntry(id);
      setEntries(entries.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setEntries([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <>
        <SEO 
          title="Food Tracker - Track Your Daily Nutrition"
          description="Simple, intuitive food tracking app for monitoring your daily meals and calories"
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Food Tracker</h1>
              <p className="text-muted-foreground">Track your meals and stay on top of your nutrition goals</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-md space-y-4">
              <p className="text-sm text-muted-foreground">Sign in to start tracking your food</p>
              <Button className="w-full" onClick={() => setShowAuthDialog(true)}>
                Sign In / Sign Up
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
        title="Food Tracker - Track Your Daily Nutrition"
        description="Simple, intuitive food tracking app for monitoring your daily meals and calories"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Food Tracker</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {userEmail}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 max-w-4xl">
          <div className="space-y-8">
            <FoodEntryForm onEntryAdded={loadEntries} />
            <DailyFoodLog entries={entries} onDeleteEntry={handleDeleteEntry} />
          </div>
        </main>
      </div>
    </>
  );
}