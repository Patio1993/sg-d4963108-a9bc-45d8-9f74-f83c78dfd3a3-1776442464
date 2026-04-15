import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Trash2, Plus, X } from "lucide-react";
import { activityService, type Activity, type UserActivityWithDetails } from "@/services/activityService";
import { useToast } from "@/hooks/use-toast";

interface ActivitiesManagerProps {
  date: string;
  onActivityAdded?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ActivitiesManager({ date, onActivityAdded, open, onOpenChange }: ActivitiesManagerProps) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivityWithDetails[]>([]);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");

  useEffect(() => {
    loadActivities();
    loadUserActivities();
  }, [date]);

  useEffect(() => {
    if (open !== undefined) {
      setShowSelectDialog(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setShowSelectDialog(newOpen);
    onOpenChange?.(newOpen);
  };

  const loadActivities = async () => {
    try {
      const data = await activityService.getAllActivities();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    }
  };

  const loadUserActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getDailyActivities(date);
      setUserActivities(data);
    } catch (error) {
      console.error("Failed to load user activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (activityId: string) => {
    try {
      const time = new Date().toTimeString().slice(0, 5);
      await activityService.addUserActivity(activityId, date, time);
      toast({
        title: "Úspech",
        description: "Aktivita pridaná",
      });
      await loadUserActivities();
      setShowSelectDialog(false);
      onActivityAdded?.();
    } catch (error) {
      console.error("Failed to add activity:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať aktivitu",
        variant: "destructive",
      });
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;

    try {
      await activityService.createActivity(newActivityName.trim());
      toast({
        title: "Úspech",
        description: "Nová aktivita vytvorená",
      });
      setNewActivityName("");
      setShowCreateDialog(false);
      await loadActivities();
    } catch (error) {
      console.error("Failed to create activity:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vytvoriť aktivitu",
        variant: "destructive",
      });
    }
  };

  const handleDeleteActivityClick = (activity: Activity) => {
    setActivityToDelete(activity);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;

    try {
      await activityService.deleteActivity(activityToDelete.id);
      toast({
        title: "Úspech",
        description: "Aktivita odstránená",
      });
      setShowDeleteConfirm(false);
      setActivityToDelete(null);
      await loadActivities();
      await loadUserActivities();
    } catch (error) {
      console.error("Failed to delete activity:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť aktivitu",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUserActivity = async (id: string) => {
    try {
      await activityService.deleteUserActivity(id);
      toast({
        title: "Úspech",
        description: "Aktivita odstránená z dňa",
      });
      await loadUserActivities();
    } catch (error) {
      console.error("Failed to delete user activity:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť aktivitu",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Aktivity</CardTitle>
        <Button size="sm" onClick={() => setShowSelectDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Pridať
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Načítavam...</p>
        ) : userActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žiadne aktivity</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userActivities.map((ua) => (
              <Badge key={ua.id} variant="secondary" className="px-3 py-1">
                {ua.activity?.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 p-0"
                  onClick={() => handleDeleteUserActivity(ua.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Select Activity Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pridať aktivitu</DialogTitle>
            <DialogDescription>Vyberte aktivitu zo zoznamu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => {
                setShowSelectDialog(false);
                setShowCreateDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-1" />
                Nová aktivita
              </Button>
            </div>
            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{activity.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddActivity(activity.id)}
                    >
                      Pridať
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteActivityClick(activity)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Activity Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vytvoriť novú aktivitu</DialogTitle>
            <DialogDescription>Zadajte názov novej aktivity</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-name">Názov aktivity *</Label>
              <Input
                id="activity-name"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="napr. Jogging, Plávanie..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setNewActivityName("");
              }}>
                Zrušiť
              </Button>
              <Button type="submit">
                Vytvoriť
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť aktivitu?</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete odstrániť aktivitu "{activityToDelete?.name}" zo zoznamu? Táto akcia sa nedá vrátiť späť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false);
              setActivityToDelete(null);
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