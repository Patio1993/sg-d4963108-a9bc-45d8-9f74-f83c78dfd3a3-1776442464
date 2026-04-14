<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Medicine = Tables<"medicines">;
export type MedicineLog = Tables<"medicine_logs">;

export interface MedicineLogWithDetails extends MedicineLog {
  medicine: Medicine;
}

export interface CreateMedicineData {
  name: string;
  diagnosis?: string;
  dosage?: string;
}

export const medicineService = {
  async createMedicine(data: CreateMedicineData): Promise<Medicine> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: medicine, error } = await supabase
      .from("medicines")
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return medicine;
  },

  async updateMedicine(id: string, data: Partial<CreateMedicineData>): Promise<Medicine> {
    const { data: medicine, error } = await supabase
      .from("medicines")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return medicine;
  },

  async deleteMedicine(id: string): Promise<void> {
    const { error } = await supabase
      .from("medicines")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getAllMedicines(): Promise<Medicine[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async logMedicine(medicineId: string, date: string, time: string): Promise<MedicineLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("medicine_logs")
      .insert({
        user_id: user.id,
        medicine_id: medicineId,
        date,
        time,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDailyMedicineLogs(date: string): Promise<MedicineLogWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("medicine_logs")
      .select("*, medicine:medicines(*)")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deleteMedicineLog(id: string): Promise<void> {
    const { error } = await supabase
      .from("medicine_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
</medicineService.ts>
