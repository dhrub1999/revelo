import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBikeByIdAdmin, getCertificationByBikeId, getDisplayNames } from "@/lib/admin/queries";
import { ConsignWorksheet } from "@/components/admin/consign-worksheet";

export default async function ConsignWorksheetPage(
  props: PageProps<"/admin/consign/[bikeId]">,
) {
  const { bikeId } = await props.params;
  const supabase = await createClient();

  const bike = await getBikeByIdAdmin(supabase, bikeId);
  if (!bike || bike.listing_type !== "certified") notFound();

  const certification = await getCertificationByBikeId(supabase, bikeId);
  if (!certification) notFound();

  const displayNames = await getDisplayNames(supabase, [bike.seller_id]);

  return (
    <ConsignWorksheet
      bike={bike}
      certification={certification}
      sellerName={displayNames.get(bike.seller_id) ?? "Seller"}
    />
  );
}
