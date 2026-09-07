import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBikeByIdAdmin } from "@/lib/admin/queries";
import { BikeForm } from "@/components/admin/bike-form";

export default async function EditBikePage(props: PageProps<"/admin/inventory/[id]/edit">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const bike = await getBikeByIdAdmin(supabase, id);

  if (!bike) notFound();

  return (
    <div className="max-w-3xl">
      <BikeForm bike={bike} />
    </div>
  );
}
