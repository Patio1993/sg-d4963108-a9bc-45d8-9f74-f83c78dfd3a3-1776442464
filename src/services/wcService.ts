import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type WCEntry = Tables<"wc_entries">;

export interface CreateWCEntryData {
  date: string;
  time: string;
  note?: string;
}

export const wcService = {
  async createEntry(data: CreateWCEntryData): Promise<WCEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: entry, error } = await supabase
      .from("wc_entries")
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return entry;
  },

  async updateEntry(id: string, data: Partial<CreateWCEntryData>): Promise<WCEntry> {
    const { data: entry, error } = await supabase
      .from("wc_entries")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return entry;
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from("wc_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDailyEntries(date: string): Promise<WCEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("wc_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("time", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
