import { supabase } from "@/integrations/supabase/client";

export const storageService = {
  async uploadFoodPhoto(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("food-photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("food-photos")
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteFoodPhoto(photoUrl: string): Promise<void> {
    if (!photoUrl.includes("food-photos")) return;

    try {
      // Extract path from URL (remove cache busting params)
      const urlParts = photoUrl.split("?")[0].split("/food-photos/");
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from("food-photos")
        .remove([filePath]);

      if (error) console.error("Error deleting photo:", error);
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  },
};