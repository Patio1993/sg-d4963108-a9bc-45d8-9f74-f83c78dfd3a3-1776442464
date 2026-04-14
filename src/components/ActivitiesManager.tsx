import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { activityService, type Activity, type UserActivityWithDetails } from "@/services/activityService";
import { useToast } from "@/hooks/use-toast";

interface ActivitiesManagerProps {
  date: string;
  onActivityAdded?: () => void;
}

export function ActivitiesManager({ date, onActivityAdded }: ActivitiesManagerProps) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivityWithDetails[]>([]);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivities();
    loadUserActivities();
  }, [date]);

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
      setShowSelectDialog(false);
      loadUserActivities();
      onActivityAdded?.();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa pridať aktivitu",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await activityService.deleteUserActivity(id);
      toast({
        title: "Úspech",
        description: "Aktivita odstránená",
      });
      loadUserActivities();
      onActivityAdded?.();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odstrániť aktivitu",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Aktivity</CardTitle>
          <Button size="sm" onClick={() => setShowSelectDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Pridať
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Načítavam...</p>
        ) : userActivities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Žiadne aktivity</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userActivities.map((ua) => (
              <Badge key={ua.id} variant="secondary" className="px-3 py-1">
                {ua.activity?.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-2 hover:bg-transparent"
                  onClick={() => handleDelete(ua.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Select Activity Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vybrať aktivitu</DialogTitle>
            <DialogDescription>Vyberte aktivitu, ktorú ste dnes vykonali</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-4">
            {activities.map((activity) => (
              <Button
                key={activity.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleAddActivity(activity.id)}
              >
                {activity.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}