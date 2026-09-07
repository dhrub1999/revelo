import Link from "next/link";
import { requireLoggedIn } from "@/lib/buyer/guard";
import { Logomark } from "@/components/logomark";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  await requireLoggedIn("/messages");

  return (
    <div className="bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Link
            href="/messages"
            className="flex items-center gap-1.5 font-heading text-base font-semibold text-ink"
          >
            <Logomark className="size-5 text-brand" />
            My account
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/messages" className="hover:text-ink">
              Messages
            </Link>
            <Link href="/test-rides" className="hover:text-ink">
              Test rides
            </Link>
            <Link href="/offers" className="hover:text-ink">
              Offers
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
