import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listBikes, searchParamsToFilters } from "@/lib/bikes/query";
import { PAGE_SIZE } from "@/lib/bikes/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters = searchParamsToFilters(searchParams);
  const offset = Number(searchParams.get("offset") ?? 0);

  const supabase = await createClient();
  const { bikes, total } = await listBikes(supabase, filters, {
    offset,
    limit: PAGE_SIZE,
  });

  return NextResponse.json({ bikes, total });
}
