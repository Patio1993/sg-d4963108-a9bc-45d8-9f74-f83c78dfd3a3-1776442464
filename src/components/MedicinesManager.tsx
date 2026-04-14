import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Pill } from "lucide-react";
import { medicineService, type Medicine, type MedicineLogWithDetails } from "@/services/medicineService";
import { useToast } from "@/hooks/use-toast";

interface MedicinesManagerProps {
  date: string;
  onMedicineAdded?: () => void;
}

export function MedicinesManager({ date, onMedicineAdded }: MedicinesManagerProps) {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [userMedicines, setUserMedicines] = useState<MedicineLogWithDetails[]>([]);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create medicine form
  const [name, setName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [dosage, setDosage] = useState("");

  useEffect(() => {
    loadMedicines();
    loadUserMedicines();
  }, [date]);

  const loadMedicines = async () => {
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error("Failed to load medicines:", error);
    }
  };

  const loadUserMedicines = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getDailyMedicineLogs(date);
      setUserMedicines(data);
    } catch (error) {
      console.error("Failed to load user medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDiagnosis("");
    setDosage("");
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Chyba",
        description: "Názov lieku je povinný",
        variant: "destructive",
      });
      return;
    }

    try {
      await medicineService.createMedicine({
        name: name.trim(),
        diagnosis: diagnosis.trim() || undefined,
        dosage: dosage.trim() || undefined,
      });
      toast({
        title: "Úspech",
        description: "Liek vytvorený",
      });
      setShowCreateDialog(false);
      resetForm();
      loadMedicines();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa vytvoriť liek",
        variant: "destructive",
      });
    }
  };

  const handleAddMedicine = async (medicineId: string) => {
    try {
      const time = new Date().toTimeString().slice(0, 5);
      await medicineService.logMedicine(medicineId, date, time);
      toast({
        title: "Úspech",
        description: "Liek pridaný",
      });
      setShowSelectDialog(false);
      loadUserMedicines();
      onMedicineAdded?.();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať liek",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await medicineService.deleteMedicineLog(id);
      toast({
        title: "Úspech",
        description: "Liek odstránený",
      });
      loadUserMedicines();
      onMedicineAdded?.();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odstrániť liek",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lieky</CardTitle>
          <Button size="sm" onClick={() => setShowSelectDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Pridať
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Načítavam...</p>
        ) : userMedicines.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Žiadne lieky</p>
        ) : (
          <div className="space-y-2">
            {userMedicines.map((um) => (
              <div key={um.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{um.medicine?.name}</span>
                  </div>
                  {um.medicine?.diagnosis && (
                    <p className="text-sm text-muted-foreground">{um.medicine.diagnosis}</p>
                  )}
                  {um.medicine?.dosage && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {um.medicine.dosage}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(um.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Select Medicine Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vybrať liek</DialogTitle>
            <DialogDescription>Vyberte liek, ktorý ste dnes užili</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {medicines.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Nemáte žiadne lieky</p>
                <Button onClick={() => {
                  setShowSelectDialog(false);
                  setShowCreateDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Vytvoriť liek
                </Button>
              </div>
            ) : (
              <>
                {medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAddMedicine(medicine.id)}
                  >
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      {medicine.diagnosis && (
                        <p className="text-sm text-muted-foreground">{medicine.diagnosis}</p>
                      )}
                      {medicine.dosage && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {medicine.dosage}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setShowSelectDialog(false);
                    setShowCreateDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nový liek
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Medicine Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nový liek</DialogTitle>
            <DialogDescription>Vytvorte vlastný liek</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateMedicine} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicine-name">Názov *</Label>
              <Input
                id="medicine-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Napr. Paralen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóza / Popis (voliteľné)</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Napr. Bolesti hlavy"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dávkovanie (voliteľné)</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Napr. 500mg 2x denne"
              />
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
              <Button type="submit">Vytvoriť</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}