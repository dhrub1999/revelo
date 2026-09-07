import { createClient } from "@/lib/supabase/server";
import { getNextServiceSlot } from "@/lib/service/queries";
import { ServiceBookingPanel } from "@/components/service/service-booking-panel";
import { AnnualCareCard } from "@/components/service/annual-care-card";

export const metadata = {
  title: "Book a repair — Revélo",
};

export default async function ServiceBookingPage() {
  const supabase = await createClient();
  const nextSlot = await getNextServiceSlot(supabase);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-h3 font-semibold tracking-tight">
        Any e-bike, any brand.
      </h1>
      <p className="mt-1 text-muted">You don&apos;t have to have bought it here.</p>

      <div className="mt-8">
        <ServiceBookingPanel initialNextSlot={nextSlot} />
      </div>

      <div className="mt-10">
        <AnnualCareCard />
      </div>
    </div>
  );
}
