import { supabase } from "@/integrations/supabase/client";
import { storageService } from "./storageService";
import JSZip from "jszip";

export interface BackupData {
  version: string;
  timestamp: string;
  userId: string;
  data: {
    profile: any;
    foods: any[];
    consumedFoods: any[];
    activities: any[];
    userActivities: any[];
    medicines: any[];
    userMedicines: any[];
    wcEntries: any[];
    waterIntake: any[];
    dailySummary: any[];
  };
  files: {
    [key: string]: string; // filename: base64 data
  };
}

class BackupService {
  async exportBackup(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch all user data
      const [
        profileData,
        foodsData,
        consumedFoodsData,
        activitiesData,
        userActivitiesData,
        medicinesData,
        userMedicinesData,
        wcEntriesData,
        waterIntakeData,
        dailySummaryData,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("foods").select("*").eq("user_id", user.id),
        supabase.from("consumed_foods").select("*").eq("user_id", user.id),
        supabase.from("activities").select("*"),
        supabase.from("user_activities").select("*").eq("user_id", user.id),
        supabase.from("medicines").select("*").eq("user_id", user.id),
        supabase.from("user_medicines").select("*").eq("user_id", user.id),
        supabase.from("wc_entries").select("*").eq("user_id", user.id),
        supabase.from("water_intake").select("*").eq("user_id", user.id),
        supabase.from("daily_summary").select("*").eq("user_id", user.id),
      ]);

      // Collect all photo URLs from foods
      const photoUrls: string[] = [];
      foodsData.data?.forEach((food) => {
        if (food.photo_url) photoUrls.push(food.photo_url);
      });

      // Download images and convert to base64
      const files: { [key: string]: string } = {};
      for (const url of photoUrls) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          const filename = url.split("/").pop() || "";
          files[filename] = base64;
        } catch (error) {
          console.error(`Failed to download image: ${url}`, error);
        }
      }

      const backup: BackupData = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        userId: user.id,
        data: {
          profile: profileData.data,
          foods: foodsData.data || [],
          consumedFoods: consumedFoodsData.data || [],
          activities: activitiesData.data || [],
          userActivities: userActivitiesData.data || [],
          medicines: medicinesData.data || [],
          userMedicines: userMedicinesData.data || [],
          wcEntries: wcEntriesData.data || [],
          waterIntake: waterIntakeData.data || [],
          dailySummary: dailySummaryData.data || [],
        },
        files,
      };

      // Create ZIP file
      const zip = new JSZip();
      zip.file("backup.json", JSON.stringify(backup, null, 2));

      // Add images to zip
      for (const [filename, base64] of Object.entries(files)) {
        zip.file(`images/${filename}`, base64, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      
      // Download file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `ibs-diary-backup-${timestamp}.zip`;
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Export backup error:", error);
      throw error;
    }
  }

  async importBackup(file: File): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Read backup.json
      const backupFile = contents.file("backup.json");
      if (!backupFile) throw new Error("Invalid backup file");
      
      const backupJson = await backupFile.async("string");
      const backup: BackupData = JSON.parse(backupJson);

      // Restore images first
      const imageFolder = contents.folder("images");
      if (imageFolder) {
        for (const [filename, zipEntry] of Object.entries(imageFolder.files)) {
          if (zipEntry.dir) continue;
          
          const base64 = await zipEntry.async("base64");
          const blob = this.base64ToBlob(base64);
          const file = new File([blob], filename.split("/").pop() || "", {
            type: "image/png",
          });
          
          try {
            await storageService.uploadFile(file, user.id);
          } catch (error) {
            console.error(`Failed to upload image: ${filename}`, error);
          }
        }
      }

      // Restore profile
      if (backup.data.profile) {
        await supabase
          .from("profiles")
          .upsert({ ...backup.data.profile, id: user.id });
      }

      // Restore foods
      for (const food of backup.data.foods) {
        await supabase
          .from("foods")
          .upsert({ ...food, user_id: user.id }, { onConflict: "id" });
      }

      // Restore consumed foods
      for (const consumedFood of backup.data.consumedFoods) {
        await supabase
          .from("consumed_foods")
          .upsert({ ...consumedFood, user_id: user.id }, { onConflict: "id" });
      }

      // Restore user activities
      for (const activity of backup.data.userActivities) {
        await supabase
          .from("user_activities")
          .upsert({ ...activity, user_id: user.id }, { onConflict: "id" });
      }

      // Restore medicines
      for (const medicine of backup.data.medicines) {
        await supabase
          .from("medicines")
          .upsert({ ...medicine, user_id: user.id }, { onConflict: "id" });
      }

      // Restore user medicines
      for (const userMedicine of backup.data.userMedicines) {
        await supabase
          .from("user_medicines")
          .upsert({ ...userMedicine, user_id: user.id }, { onConflict: "id" });
      }

      // Restore WC entries
      for (const wcEntry of backup.data.wcEntries) {
        await supabase
          .from("wc_entries")
          .upsert({ ...wcEntry, user_id: user.id }, { onConflict: "id" });
      }

      // Restore water intake
      for (const water of backup.data.waterIntake) {
        await supabase
          .from("water_intake")
          .upsert({ ...water, user_id: user.id }, { onConflict: "id" });
      }

      // Restore daily summary
      for (const summary of backup.data.dailySummary) {
        await supabase
          .from("daily_summary")
          .upsert({ ...summary, user_id: user.id }, { onConflict: "id" });
      }
    } catch (error) {
      console.error("Import backup error:", error);
      throw error;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/png" });
  }
}

export const backupService = new BackupService();