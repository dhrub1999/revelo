import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";

export default async function CheckoutPage(props: PageProps<"/checkout/[bikeId]">) {
  const { bikeId } = await props.params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/checkout/${bikeId}`);

  const supabase = await createClient();
  const { data: bike, error } = await supabase
    .from("bikes")
    .select("*")
    .eq("id", bikeId)
    .maybeSingle();
  if (error) throw error;

  const available = !!bike && bike.listing_type === "certified" && bike.status === "live";

  if (!bike || !available) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-h5 font-semibold">This bike isn&apos;t available to reserve</h1>
        <p className="mt-2 text-sm text-muted">
          {bike
            ? "It's already been reserved or sold."
            : "It may have been removed."}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
        >
          Back to bikes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <CheckoutWizard bike={bike} />
    </div>
  );
}
