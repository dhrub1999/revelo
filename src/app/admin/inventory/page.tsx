import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { listInventory, type BikeRow, type InventoryStatusFilter } from "@/lib/admin/queries";
import { formatPrice, formatKm } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryFilters } from "@/components/admin/inventory-filters";
import { DeleteBikeButton } from "@/components/admin/delete-bike-button";

const STATUS_LABEL: Record<BikeRow["status"], string> = {
  in_workshop: "Draft",
  photographed: "Draft",
  live: "Live",
  reserved: "Reserved",
  sold: "Sold",
  delivered: "Sold",
  paid_out: "Sold",
};

const VALID_STATUSES: InventoryStatusFilter[] = ["live", "draft", "reserved", "sold"];

export default async function AdminInventoryPage(props: PageProps<"/admin/inventory">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : "";
  const status: InventoryStatusFilter = VALID_STATUSES.includes(
    statusParam as InventoryStatusFilter,
  )
    ? (statusParam as InventoryStatusFilter)
    : "";

  const supabase = await createClient();
  const { bikes, liveCount, draftCount } = await listInventory(supabase, { q, status });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-h4 font-semibold tracking-tight">
          Inventory <span className="text-muted">·</span> {liveCount} live{" "}
          <span className="text-muted">·</span> {draftCount} drafts
        </h1>
        <Button
          render={<Link href="/admin/inventory/new" />}
          className="h-9 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover"
        >
          + Add bike
        </Button>
      </div>

      <div className="mt-5">
        <InventoryFilters initialQ={q} initialStatus={status} />
      </div>

      <div className="mt-4 rounded-card border border-line bg-surface">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Bike</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Batt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bikes.map((bike) => (
              <TableRow key={bike.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-control bg-line">
                      {bike.photos[0] && (
                        <Image
                          src={bike.photos[0]}
                          alt={`${bike.brand} ${bike.model}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ink">
                        {bike.brand} {bike.model}
                      </p>
                      <p className="text-xs text-muted">
                        {bike.year} · {formatKm(bike.km)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatPrice(bike.price)}</TableCell>
                <TableCell className="text-battery font-medium">
                  {bike.battery_percent !== null ? `${bike.battery_percent}%` : "—"}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">{STATUS_LABEL[bike.status]}</span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      render={<Link href={`/admin/inventory/${bike.id}/edit`} />}
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-control border-line"
                    >
                      Edit
                    </Button>
                    <DeleteBikeButton bikeId={bike.id} label={`${bike.brand} ${bike.model}`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {bikes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted">
                  No bikes match this search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
