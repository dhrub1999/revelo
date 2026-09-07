import { clsx } from "clsx";
import { SealCheck } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { Badge } from "@/components/ui/badge";
import type { ListingType } from "@/lib/supabase/types";

const LABEL: Record<ListingType, string> = {
  certified: "Certified",
  self: "Self-listed",
};

export function TierBadge({
  listingType,
  className,
}: {
  listingType: ListingType;
  className?: string;
}) {
  const certified = listingType === "certified";

  return (
    <Badge
      variant={certified ? "default" : "outline"}
      className={clsx(
        "h-auto gap-1 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        certified
          ? "bg-certified text-certified-fg"
          : "border-self bg-surface/95 text-self backdrop-blur",
        className,
      )}
    >
      {certified && <SealCheck weight="fill" className="size-3.5" />}
      {LABEL[listingType]}
    </Badge>
  );
}
