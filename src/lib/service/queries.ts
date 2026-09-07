import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export interface NextServiceSlot {
  date: string;
  slotsAvailable: number;
}

/** Screen 8's "next-available" panel — the earliest future date with real
 *  capacity left in service_slots, not a hardcoded placeholder. */
export async function getNextServiceSlot(supabase: Client): Promise<NextServiceSlot | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("service_slots")
    .select("date, slots_available")
    .gte("date", today)
    .gt("slots_available", 0)
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? { date: data.date, slotsAvailable: data.slots_available } : null;
}
