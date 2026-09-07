import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { Logomark } from "@/components/logomark";

// Desktop only throughout, per P2 spec — no mobile admin was designed.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-w-[1024px] bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-6">
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1.5 font-heading text-base font-semibold text-ink"
          >
            <Logomark className="size-5 text-brand" />
            Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted">
            <Link href="/admin/inventory" className="hover:text-ink">
              Inventory
            </Link>
            <Link href="/admin/moderation" className="hover:text-ink">
              Moderation
            </Link>
            <Link href="/admin/consign" className="hover:text-ink">
              Consign
            </Link>
            <Link href="/admin/offers" className="hover:text-ink">
              Offers
            </Link>
          </nav>
          <Link href="/" className="ml-auto text-sm text-muted hover:text-ink">
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
