"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const sp = new URLSearchParams();
    if (query.trim()) sp.set("q", query.trim());
    router.push(sp.toString() ? `/?${sp.toString()}` : "/");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <MagnifyingGlass
        weight="bold"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder='Search brand, model or "cargo"'
        className="h-9 rounded-control bg-paper pl-9 focus-visible:border-brand focus-visible:ring-brand-ring/30"
      />
    </form>
  );
}
