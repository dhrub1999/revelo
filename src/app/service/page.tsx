import Link from "next/link";
import { Wrench } from "@phosphor-icons/react/dist/ssr/Wrench";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceTotalCount } from "@/lib/bikes/query";
import { SERVICE_PRICE_LIST } from "@/lib/service/pricing";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "@/components/header-search";
import { ServiceRequestForm } from "@/components/service/service-request-form";

export const metadata = {
  title: "Service — Revélo",
};

export default async function ServicePage() {
  const supabase = await createClient();
  const bikeCount = await getMarketplaceTotalCount(supabase);

  const firstColumn = SERVICE_PRICE_LIST.slice(0, 4);
  const secondColumn = SERVICE_PRICE_LIST.slice(4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 md:hidden">
        <HeaderSearch />
      </div>

      <section className="grid items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div>
          <h1 className="font-heading text-h3 font-semibold tracking-tight sm:text-h1">
            We fix e-bikes, and we sell the good ones on.
          </h1>
          <p className="mt-3 max-w-prose text-muted">
            One workshop, any brand. Book a repair or browse the certified and
            self-listed bikes we&apos;ve already put through it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              size="lg"
              className="h-11 rounded-control bg-brand-fill px-5 text-white hover:bg-brand-fill-hover"
            >
              Browse {bikeCount} used bikes →
            </Button>
            <Button
              render={<Link href="/service/book" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="h-11 rounded-control border-line px-5 text-ink"
            >
              Book a repair
            </Button>
          </div>
        </div>

        <div className="flex aspect-[4/3] items-center justify-center rounded-card border border-line bg-brand-tint">
          <div className="flex flex-col items-center gap-2 text-brand">
            <Wrench size={40} weight="light" />
            <span className="text-sm font-medium">Revélo workshop</span>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-h5 font-semibold tracking-tight">
          Straight prices, no gating.
        </h2>

        {/* Mobile: truncated 3-row list, "+ N more" expands the rest. */}
        <div className="mt-4 sm:hidden">
          <ul className="divide-y divide-line-subtle border-t border-line-subtle">
            {SERVICE_PRICE_LIST.slice(0, 3).map((row) => (
              <PriceRow key={row.label} row={row} />
            ))}
          </ul>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-1 py-3 text-sm font-medium text-brand [&::-webkit-details-marker]:hidden">
              + {SERVICE_PRICE_LIST.length - 3} more
              <CaretDown size={14} weight="bold" className="transition-transform group-open:rotate-180" />
            </summary>
            <ul className="divide-y divide-line-subtle border-t border-line-subtle">
              {SERVICE_PRICE_LIST.slice(3).map((row) => (
                <PriceRow key={row.label} row={row} />
              ))}
            </ul>
          </details>
        </div>

        {/* Desktop: two columns, eight rows. */}
        <div className="mt-4 hidden gap-x-10 sm:grid sm:grid-cols-2">
          <ul className="divide-y divide-line-subtle border-t border-line-subtle">
            {firstColumn.map((row) => (
              <PriceRow key={row.label} row={row} />
            ))}
          </ul>
          <ul className="divide-y divide-line-subtle border-t border-line-subtle">
            {secondColumn.map((row) => (
              <PriceRow key={row.label} row={row} />
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14 grid gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-ink">Come by the shop</p>
          <dl className="mt-3 flex flex-col gap-2.5 text-sm text-muted">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>Revélo Workshop, Baner Road, Pune 411045</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>Mon–Sat, 10am–7pm</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>+91 98765 43210</span>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-center rounded-card border border-line bg-line-subtle">
          <div className="flex flex-col items-center gap-1.5 text-muted">
            <MapPin size={28} weight="light" />
            <span className="text-xs">Map — Baner Road, Pune</span>
          </div>
        </div>

        <ServiceRequestForm />
      </section>
    </div>
  );
}

function PriceRow({ row }: { row: { label: string; price: string } }) {
  return (
    <li className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-ink">{row.label}</span>
      <span className="shrink-0 text-muted">{row.price}</span>
    </li>
  );
}
