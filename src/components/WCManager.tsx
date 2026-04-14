import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Edit } from "lucide-react";
import { wcService, type WCEntry } from "@/services/wcService";
import { useToast } from "@/hooks/use-toast";

interface WCManagerProps {
  date: string;
  onWCAdded?: () => void;
}

export function WCManager({ date, onWCAdded }: WCManagerProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WCEntry[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WCEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    loadEntries();
  }, [date]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await wcService.getEntriesForDate(date);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load WC entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const now = new Date();
    setTime(now.toTimeString().slice(0, 5));
    setNote("");
    setEditingEntry(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleOpenEdit = (entry: WCEntry) => {
    setEditingEntry(entry);
    setTime(entry.time);
    setNote(entry.note || "");
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEntry) {
        await wcService.updateEntry(editingEntry.id, {
          time,
          note: note.trim() || undefined,
        });
        toast({
          title: "Úspech",
          description: "WC záznam aktualizovaný",
        });
      } else {
        await wcService.createEntry({
          date,
          time,
          note: note.trim() || undefined,
        });
        toast({
          title: "Úspech",
          description: "WC záznam vytvorený",
        });
      }
      setShowDialog(false);
      resetForm();
      loadEntries();
      onWCAdded?.();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa uložiť záznam",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj chcete odstrániť tento záznam?")) return;

    try {
      await wcService.deleteEntry(id);
      toast({
        title: "Úspech",
        description: "WC záznam odstránený",
      });
      loadEntries();
      onWCAdded?.();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odstrániť záznam",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>WC Záznamy</CardTitle>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Pridať
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Načítavam...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Žiadne záznamy</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{entry.time}</p>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Upraviť záznam" : "Nový WC záznam"}</DialogTitle>
            <DialogDescription>
              {editingEntry ? "Upravte WC záznam" : "Pridajte WC záznam"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="note">Poznámka (voliteľné)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Voliteľná poznámka..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Zrušiť
              </Button>
              <Button type="submit">
                {editingEntry ? "Uložiť" : "Vytvoriť"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}