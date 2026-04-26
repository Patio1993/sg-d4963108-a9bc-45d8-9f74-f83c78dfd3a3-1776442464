import { Dialog, DialogContent } from "@/components/ui/dialog";

interface FoodImagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  foodName: string;
}

export function FoodImagePreview({
  open,
  onOpenChange,
  imageUrl,
  foodName,
}: FoodImagePreviewProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="relative">
          <img
            src={imageUrl}
            alt={foodName}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white font-semibold text-lg">{foodName}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}