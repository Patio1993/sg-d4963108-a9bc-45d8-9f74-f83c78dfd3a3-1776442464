import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus, X, Pencil } from "lucide-react";
import { medicineService, type Medicine, type UserMedicineWithDetails } from "@/services/medicineService";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MedicinesManagerProps {
  date: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MedicinesManager({ date, open, onOpenChange }: MedicinesManagerProps) {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [userMedicines, setUserMedicines] = useState<UserMedicineWithDetails[]>([]);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineDosage, setNewMedicineDosage] = useState("");
  const [newMedicineDiagnosis, setNewMedicineDiagnosis] = useState("");

  useEffect(() => {
    loadMedicines();
    loadUserMedicines();
  }, [date]);

  useEffect(() => {
    if (open !== undefined) {
      setShowSelectDialog(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setShowSelectDialog(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      setSelectedMedicine(null);
      setTime("");
    }
  };

  useEffect(() => {
    if (showSelectDialog) {
      const now = new Date();
      setTime(now.toTimeString().slice(0, 5));
    }
  }, [showSelectDialog]);

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
      const data = await medicineService.getDailyMedicines(date);
      setUserMedicines(data);
    } catch (error) {
      console.error("Failed to load user medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
  };

  const handleAddMedicine = async () => {
    if (!selectedMedicine || !time) {
      toast({
        title: "Chyba",
        description: "Vyberte liek a zadajte čas",
        variant: "destructive",
      });
      return;
    }

    try {
      await medicineService.addUserMedicine(selectedMedicine.id, date, time);
      toast({
        title: "Úspech",
        description: "Liek pridaný",
      });
      await loadUserMedicines();
      setShowSelectDialog(false);
      setSelectedMedicine(null);
      setTime("");
    } catch (error) {
      console.error("Failed to add medicine:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať liek",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreate = () => {
    setNewMedicineName("");
    setNewMedicineDosage("");
    setNewMedicineDiagnosis("");
    setEditingMedicine(null);
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (medicine: Medicine) => {
    setNewMedicineName(medicine.name);
    setNewMedicineDosage(medicine.dosage || "");
    setNewMedicineDiagnosis(medicine.diagnosis || "");
    setEditingMedicine(medicine);
    setShowCreateDialog(true);
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMedicine) {
        await medicineService.updateMedicine(editingMedicine.id, {
          name: newMedicineName,
          dosage: newMedicineDosage || null,
          diagnosis: newMedicineDiagnosis || null,
        });
        toast({ title: "Úspech", description: "Liek aktualizovaný" });
      } else {
        await medicineService.createMedicine(
          newMedicineName,
          newMedicineDosage,
          newMedicineDiagnosis
        );
        toast({ title: "Úspech", description: "Liek vytvorený" });
      }
      setShowCreateDialog(false);
      setNewMedicineName("");
      setNewMedicineDosage("");
      setNewMedicineDiagnosis("");
      setEditingMedicine(null);
      loadMedicines();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicineClick = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicineToDelete) return;

    try {
      await medicineService.deleteMedicine(medicineToDelete.id);
      toast({
        title: "Úspech",
        description: "Liek odstránený",
      });
      setShowDeleteConfirm(false);
      setMedicineToDelete(null);
      await loadMedicines();
      await loadUserMedicines();
    } catch (error) {
      console.error("Failed to delete medicine:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť liek",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUserMedicine = async (id: string) => {
    try {
      await medicineService.deleteUserMedicine(id);
      toast({
        title: "Úspech",
        description: "Liek odstránený z dňa",
      });
      await loadUserMedicines();
    } catch (error) {
      console.error("Failed to delete user medicine:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť liek",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">💊 Lieky</CardTitle>
        <Button size="sm" onClick={() => setShowSelectDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Pridať
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Načítavam...</p>
        ) : userMedicines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žiadne lieky</p>
        ) : (
          <div className="space-y-2">
            {userMedicines.map((um) => (
              <div key={um.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{um.medicine?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {um.medicine?.dosage} • {um.time}
                  </div>
                  {um.medicine?.diagnosis && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {um.medicine.diagnosis}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUserMedicine(um.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Select Medicine Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pridať liek</DialogTitle>
            <DialogDescription>
              Vyberte liek zo zoznamu alebo vytvorte nový
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Input
                placeholder="Vyhľadať liek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleOpenCreate}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Vytvoriť nový liek
              </Button>
            </div>

            {/* Medicine List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {medicines
                  .filter(med => 
                    searchQuery.trim() === "" || 
                    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    med.dosage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    med.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((medicine) => (
                    <div
                      key={medicine.id}
                      className={`flex items-start justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMedicine?.id === medicine.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelectMedicine(medicine)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{medicine.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Dávkovanie: {medicine.dosage}
                        </div>
                        {medicine.diagnosis && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Diagnóza: {medicine.diagnosis}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMedicineToDelete(medicine);
                            setShowDeleteConfirm(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(medicine);
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSelectDialog(false);
                  setSelectedMedicine(null);
                  setTime("");
                }}
              >
                Zrušiť
              </Button>
              <Button onClick={handleAddMedicine} disabled={!selectedMedicine || !time}>
                Pridať
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Medicine Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedicine ? "Upraviť liek" : "Vytvoriť nový liek"}</DialogTitle>
            <DialogDescription>
              {editingMedicine ? "Upravte údaje o lieku" : "Zadajte údaje o novom lieku"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateMedicine} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicine-name">Názov lieku *</Label>
              <Input
                id="medicine-name"
                value={newMedicineName}
                onChange={(e) => setNewMedicineName(e.target.value)}
                placeholder="napr. Aspirin, Ibalgin..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicine-dosage">Dávkovanie *</Label>
              <Input
                id="medicine-dosage"
                value={newMedicineDosage}
                onChange={(e) => setNewMedicineDosage(e.target.value)}
                placeholder="napr. 400mg, 2x denne..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicine-diagnosis">Diagnóza (voliteľné)</Label>
              <Textarea
                id="medicine-diagnosis"
                value={newMedicineDiagnosis}
                onChange={(e) => setNewMedicineDiagnosis(e.target.value)}
                placeholder="napr. Bolesť hlavy, Teplota..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setNewMedicineName("");
                setNewMedicineDosage("");
                setNewMedicineDiagnosis("");
              }}>
                Zrušiť
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Ukladá sa..." : editingMedicine ? "Uložiť zmeny" : "Vytvoriť"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť liek?</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete odstrániť liek "{medicineToDelete?.name}" zo zoznamu? Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false);
              setMedicineToDelete(null);
            }}>
              Zrušiť
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Odstrániť
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}