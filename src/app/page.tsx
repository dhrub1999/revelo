import { createClient } from "@/lib/supabase/server";
import {
  getFilterOptions,
  getMarketplaceTotalCount,
  listBikes,
  searchParamsToFilters,
} from "@/lib/bikes/query";
import { PAGE_SIZE } from "@/lib/bikes/types";
import { Marketplace } from "@/components/marketplace/marketplace";

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const filters = searchParamsToFilters(searchParams);

  const supabase = await createClient();
  const [{ bikes, total }, marketplaceTotal, filterOptions] =
    await Promise.all([
      listBikes(supabase, filters, { offset: 0, limit: PAGE_SIZE }),
      getMarketplaceTotalCount(supabase),
      getFilterOptions(supabase),
    ]);

  return (
    <Marketplace
      initialFilters={filters}
      initialBikes={bikes}
      initialTotal={total}
      marketplaceTotal={marketplaceTotal}
      filterOptions={filterOptions}
    />
  );
}
