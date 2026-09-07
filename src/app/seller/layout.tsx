import Link from "next/link";
import { requireSeller } from "@/lib/seller/guard";
import { Logomark } from "@/components/logomark";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireSeller();

  return (
    <div className="bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Link
            href="/seller"
            className="flex items-center gap-1.5 font-heading text-base font-semibold text-ink"
          >
            <Logomark className="size-5 text-brand" />
            My listings
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/seller" className="hover:text-ink">
              Listings
            </Link>
            <Link href="/seller/test-rides" className="hover:text-ink">
              Test rides
            </Link>
            <Link href="/seller/notifications" className="hover:text-ink">
              Notifications
            </Link>
          </nav>
          <Link href="/" className="ml-auto text-sm text-muted hover:text-ink">
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
