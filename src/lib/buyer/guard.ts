import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/supabase/auth";

// Messaging and test rides just need a login, not a specific role — a
// seller or admin account can act as a buyer here too, unlike /seller and
// /admin which redirect non-matching roles away.
export async function requireLoggedIn(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${next}`);
  return user;
}
