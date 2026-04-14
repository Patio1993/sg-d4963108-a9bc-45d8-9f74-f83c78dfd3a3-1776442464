import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { FoodEntry } from "@/services/foodService";

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDelete: (id: string) => void;
}

export function FoodEntryCard({ entry, onDelete }: FoodEntryCardProps) {
  const time = new Date(entry.eaten_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline gap-2">
              <h4 className="font-semibold text-foreground">{entry.food_name}</h4>
              <span className="text-xs text-muted-foreground">{time}</span>
            </div>
            <p className="text-sm text-muted-foreground">{entry.portion}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">{entry.calories}</p>
              <p className="text-xs text-muted-foreground">cal</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}