import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyBikeById, listInspectionSlots } from "@/lib/seller/queries";
import { SellerBikeForm } from "@/components/seller/seller-bike-form";

export default async function EditMyBikePage(props: PageProps<"/seller/[bikeId]/edit">) {
  const { bikeId } = await props.params;
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const [bike, slots] = await Promise.all([
    getMyBikeById(supabase, user.id, bikeId),
    listInspectionSlots(supabase),
  ]);
  if (!bike) notFound();

  return <SellerBikeForm bike={bike} slots={slots} />;
}
