import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Medicine = Tables<"medicines">;
export type UserMedicine = Tables<"medicine_logs">;

export type UserMedicineWithDetails = UserMedicine & {
  medicine: Medicine | null;
};

export const medicineService = {
  async getAllMedicines(): Promise<Medicine[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async createMedicine(
    name: string,
    dosage: string,
    diagnosis?: string
  ): Promise<Medicine> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("medicines")
      .insert({
        user_id: user.id,
        name,
        dosage,
        diagnosis: diagnosis || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMedicine(id: string): Promise<void> {
    const { error } = await supabase
      .from("medicines")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDailyMedicines(date: string): Promise<UserMedicineWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("medicine_logs")
      .select(`
        *,
        medicine:medicines(*)
      `)
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return data as unknown as UserMedicineWithDetails[];
  },

  async addUserMedicine(medicineId: string, date: string, time: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("medicine_logs")
      .insert({
        user_id: user.id,
        medicine_id: medicineId,
        date,
        time,
      });

    if (error) throw error;
  },

  async deleteUserMedicine(id: string): Promise<void> {
    const { error } = await supabase
      .from("medicine_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
