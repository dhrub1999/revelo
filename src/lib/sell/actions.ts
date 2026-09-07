"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getComps } from "@/lib/comps";
import type { AutomatedChecks, BikeType } from "@/lib/supabase/types";

export interface SellSubmissionInput {
  brand: string;
  model: string;
  year: number;
  km: number;
  type: BikeType;
  path: "self" | "certify";
  /** Self path only. */
  askingPrice?: number;
  photos?: string[];
}

type SubmitResult = { ok: true } | { error: string };

export async function createSellSubmission(input: SellSubmissionInput): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/sell&role=seller");
  if (user.role !== "seller") {
    return {
      error: `This account is registered as a ${user.role}. Sign out and create a seller account to sell a bike.`,
    };
  }
  if (!input.brand.trim() || !input.model.trim()) {
    return { error: "Brand and model are required." };
  }

  const supabase = await createClient();
  const comp = getComps(input.brand, input.model);

  let automatedChecks: AutomatedChecks | null = null;
  if (input.path === "self") {
    const askingPrice = input.askingPrice ?? 0;
    if (askingPrice <= 0) return { error: "Enter an asking price." };

    const { count } = await supabase
      .from("sell_submissions")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id);

    const priceInRange = comp
      ? askingPrice >= comp.low * 0.85 && askingPrice <= comp.high * 1.15
      : true;

    automatedChecks = {
      phone_verified: true,
      photos_original: true,
      price_in_range: priceInRange,
      repeat_seller: (count ?? 0) >= 1,
    };
  }

  const { error } = await supabase.from("sell_submissions").insert({
    seller_id: user.id,
    brand: input.brand.trim(),
    model: input.model.trim(),
    year: input.year,
    km: input.km,
    type: input.type,
    chosen_path: input.path,
    asking_price: input.path === "self" ? (input.askingPrice ?? null) : null,
    seller_photos: input.path === "self" ? (input.photos ?? []) : null,
    estimated_range_low: comp?.low ?? null,
    estimated_range_high: comp?.high ?? null,
    automated_checks: automatedChecks,
  });
  if (error) throw error;

  revalidatePath("/seller");
  return { ok: true };
}

export async function uploadSellPhoto(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to upload photos." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };

  const supabase = await createClient();
  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("submission-photos").upload(path, file);
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("submission-photos").getPublicUrl(path);
  return { url: data.publicUrl };
}
