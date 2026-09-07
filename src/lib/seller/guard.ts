import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/supabase/auth";

export async function requireSeller(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/seller&role=seller");
  if (user.role !== "seller") redirect("/");
  return user;
}
