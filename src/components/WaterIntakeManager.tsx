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
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    loadWaterIntakes();
  }, [date]);

  const loadWaterIntakes = async () => {
    setLoading(true);
    try {
      const data = await waterService.getDailyWaterIntakes(date);
      setWaterIntakes(data);
    } catch (error) {
      console.error("Failed to load water intakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    try {
      const time = new Date().toTimeString().slice(0, 5);
      await waterService.addWaterIntake(date, amount, time);
      toast({
        title: "Úspech",
        description: `Pridané ${amount}ml vody`,
      });
      await loadWaterIntakes();
      onWaterAdded?.();
    } catch (error) {
      console.error("Failed to add water:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať vodu",
        variant: "destructive",
      });
    }
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) return;

    try {
      const time = new Date().toTimeString().slice(0, 5);
      await waterService.addWaterIntake(date, amount, time);
      toast({
        title: "Úspech",
        description: `Pridané ${amount}ml vody`,
      });
      setCustomAmount("");
      setShowDialog(false);
      await loadWaterIntakes();
      onWaterAdded?.();
    } catch (error) {
      console.error("Failed to add water:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať vodu",
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">💧 Pitný režim</CardTitle>
        <Button size="sm" onClick={() => setShowDialog(true)}>
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
                    <span className="font-medium">{intake.amount_ml}ml</span>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pridať vodu</DialogTitle>
            <DialogDescription>Vyberte množstvo alebo zadajte vlastnú hodnotu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleQuickAdd(250);
                  setShowDialog(false);
                }}
              >
                250ml
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleQuickAdd(500);
                  setShowDialog(false);
                }}
              >
                500ml
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleQuickAdd(750);
                  setShowDialog(false);
                }}
              >
                750ml
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleQuickAdd(1000);
                  setShowDialog(false);
                }}
              >
                1000ml
              </Button>
            </div>

            <form onSubmit={handleCustomAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Vlastné množstvo (ml)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="napr. 350"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
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