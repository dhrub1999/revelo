"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "__all__", label: "All statuses" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export function InventoryFilters({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (q) sp.set("q", q);
      else sp.delete("q");
      router.replace(sp.toString() ? `/admin/inventory?${sp.toString()}` : "/admin/inventory", {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function handleStatusChange(next: string | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (!next || next === "__all__") sp.delete("status");
    else sp.set("status", next);
    router.replace(sp.toString() ? `/admin/inventory?${sp.toString()}` : "/admin/inventory", {
      scroll: false,
    });
  }

  return (
    <div className="flex gap-3">
      <div className="relative flex-1 max-w-sm">
        <MagnifyingGlass
          weight="bold"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search brand / model"
          className="h-9 rounded-control pl-9 focus-visible:border-brand focus-visible:ring-brand-ring/30"
        />
      </div>
      <Select value={initialStatus || "__all__"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40 bg-surface">
          <SelectValue>
            {(current: string) =>
              STATUS_OPTIONS.find((o) => o.value === current)?.label ?? current
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
