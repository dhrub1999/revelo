"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bicycle } from "@phosphor-icons/react/dist/ssr/Bicycle";
import { Sliders } from "@phosphor-icons/react/dist/ssr/Sliders";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import type { BikeRow } from "@/lib/bikes/query";
import { filtersToSearchParams } from "@/lib/bikes/query";
import { DEFAULT_FILTERS, type BikeFilters } from "@/lib/bikes/types";
import { BikeCard } from "@/components/bike-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FilterBar } from "./filter-bar";
import { QuickFilterChips } from "./quick-filter-chips";

interface MarketplaceProps {
  initialFilters: BikeFilters;
  initialBikes: BikeRow[];
  initialTotal: number;
  marketplaceTotal: number;
  filterOptions: { brands: string[]; years: number[] };
}

export function Marketplace({
  initialFilters,
  initialBikes,
  initialTotal,
  marketplaceTotal,
  filterOptions,
}: MarketplaceProps) {
  const router = useRouter();

  const [filters, setFilters] = useState<BikeFilters>(initialFilters);
  const [searchDraft, setSearchDraft] = useState(initialFilters.q);
  const [bikes, setBikes] = useState(initialBikes);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const skipNextFetch = useRef(true);

  // Debounce free-text search into the committed filter set.
  useEffect(() => {
    if (searchDraft === filters.q) return;
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: searchDraft }));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  // Refetch whenever the committed filter set changes (skip the very first
  // render, since initial data already matches initialFilters from SSR).
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = filtersToSearchParams(filters);
    fetch(`/api/bikes?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { bikes: BikeRow[]; total: number }) => {
        if (cancelled) return;
        setBikes(data.bikes);
        setTotal(data.total);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    router.replace(params.toString() ? `/?${params.toString()}` : "/", {
      scroll: false,
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  function updateFilters(partial: Partial<BikeFilters>) {
    setFilters((prev) => ({ ...prev, ...partial }));
  }

  function resetFilters() {
    setSearchDraft("");
    setFilters(DEFAULT_FILTERS);
  }

  async function loadMore() {
    setLoadingMore(true);
    const params = filtersToSearchParams(filters);
    params.set("offset", String(bikes.length));
    const res = await fetch(`/api/bikes?${params.toString()}`);
    const data: { bikes: BikeRow[]; total: number } = await res.json();
    setBikes((prev) => [...prev, ...data.bikes]);
    setTotal(data.total);
    setLoadingMore(false);
  }

  const hasMore = bikes.length < total;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-h5 font-semibold tracking-tight sm:text-h3">
        <span className="text-brand">{marketplaceTotal}</span> inspected
        e-bikes, battery health on every one.
      </h1>

      {/* Mobile: search + Filters button */}
      <div className="mt-5 flex gap-2 sm:hidden">
        <div className="relative flex-1">
          <MagnifyingGlass
            weight="bold"
            className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted"
          />
          <Input
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search bikes"
            className="h-10 rounded-control pl-9 focus-visible:border-brand focus-visible:ring-brand-ring/30"
          />
        </div>

        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" />}
            className="h-10 shrink-0 gap-1.5 rounded-control border-line bg-surface px-4 text-sm font-medium text-ink"
          >
            <Sliders weight="bold" className="size-4" />
            Filters
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] rounded-t-card">
            <SheetHeader className="border-b border-line">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FilterBar
                filters={filters}
                onChange={updateFilters}
                brands={filterOptions.brands}
                years={filterOptions.years}
                stacked
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-3 sm:hidden">
        <QuickFilterChips filters={filters} onChange={updateFilters} />
      </div>

      {/* Desktop filter row */}
      <div className="mt-5 hidden sm:block">
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          brands={filterOptions.brands}
          years={filterOptions.years}
        />
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {loading ? "Updating…" : `${total} bike${total === 1 ? "" : "s"} match your filters`}
      </p>

      {bikes.length === 0 && !loading ? (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-line p-10 text-center text-muted">
          <Bicycle className="size-10 text-line" weight="light" />
          <p className="mt-3">No bikes match your filters.</p>
          <Button
            variant="link"
            onClick={resetFilters}
            className="mt-1 h-auto p-0 text-sm text-brand"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {bikes.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
          ))}
        </div>
      )}

      {bikes.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          {hasMore ? (
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
              className="h-10 rounded-control border-line px-4 font-medium text-ink hover:border-brand hover:bg-transparent hover:text-brand"
            >
              {loadingMore
                ? "Loading…"
                : `${bikes.length} of ${total} · load more`}
            </Button>
          ) : (
            <p>
              {bikes.length} of {total}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
