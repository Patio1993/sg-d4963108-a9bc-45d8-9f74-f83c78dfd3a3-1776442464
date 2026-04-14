import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Droplet, Plus, Trash2 } from "lucide-react";
import { waterService, type WaterIntake } from "@/services/waterService";
import { useToast } from "@/hooks/use-toast";

interface WaterIntakeManagerProps {
  date: string;
  onWaterAdded?: () => void;
}

export function WaterIntakeManager({ date, onWaterAdded }: WaterIntakeManagerProps) {
  const { toast } = useToast();
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [dailyTotal, setDailyTotal] = useState(0);

  useEffect(() => {
    loadWaterIntakes();
  }, [date]);

  const loadWaterIntakes = async () => {
    setLoading(true);
    try {
      const data = await waterService.getDailyWaterIntakes(date);
      setWaterIntakes(data);
      
      const total = await waterService.getDailyTotal(date);
      setDailyTotal(total);
    } catch (error) {
      console.error("Failed to load water intakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Chyba",
        description: "Zadajte platné množstvo väčšie ako 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const time = new Date().toTimeString().slice(0, 5);
      await waterService.addWaterIntake(date, amountNum, time);
      toast({
        title: "Úspech",
        description: `Pridané ${amountNum}ml vody`,
      });
      setAmount("");
      setShowAddDialog(false);
      await loadWaterIntakes();
      onWaterAdded?.();
    } catch (error) {
      console.error("Failed to add water intake:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať záznam",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await waterService.deleteWaterIntake(id);
      toast({
        title: "Úspech",
        description: "Záznam odstránený",
      });
      await loadWaterIntakes();
      onWaterAdded?.();
    } catch (error) {
      console.error("Failed to delete water intake:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť záznam",
        variant: "destructive",
      });
    }
  };

  const quickAddPresets = [250, 500, 750, 1000];

  const handleQuickAdd = async (ml: number) => {
    try {
      const time = new Date().toTimeString().slice(0, 5);
      await waterService.addWaterIntake(date, ml, time);
      toast({
        title: "Úspech",
        description: `Pridané ${ml}ml vody`,
      });
      await loadWaterIntakes();
      onWaterAdded?.();
    } catch (error) {
      console.error("Failed to add water intake:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať záznam",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Pitný režim</CardTitle>
          <Badge variant="secondary" className="text-blue-600">
            {dailyTotal}ml
          </Badge>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Pridať
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Načítavam...</p>
        ) : waterIntakes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žiadne záznamy</p>
        ) : (
          <div className="space-y-2">
            {waterIntakes.map((intake) => (
              <div key={intake.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="font-medium">{intake.amount}ml</span>
                    <span className="text-sm text-muted-foreground ml-2">{intake.time}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(intake.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Water Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pridať vodu</DialogTitle>
            <DialogDescription>Zadajte množstvo vypitej vody v ml</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {quickAddPresets.map((ml) => (
                <Button
                  key={ml}
                  variant="outline"
                  onClick={() => {
                    handleQuickAdd(ml);
                    setShowAddDialog(false);
                  }}
                >
                  <Droplet className="h-4 w-4 mr-2" />
                  {ml}ml
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">alebo vlastné</span>
              </div>
            </div>

            <form onSubmit={handleAddWater} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Množstvo (ml) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="napr. 350"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setAmount("");
                }}>
                  Zrušiť
                </Button>
                <Button type="submit">
                  Pridať
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}