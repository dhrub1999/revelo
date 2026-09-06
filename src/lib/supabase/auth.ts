import "server-only";
import { createClient } from "./server";
import type { Role } from "./types";

export interface CurrentUser {
  id: string;
  email: string | null;
  role: Role;
}

/** Server-side helper: the logged-in user plus their role, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { id: user.id, email: user.email ?? null, role: profile.role };
}
