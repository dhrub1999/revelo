import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Revélo
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/" className="hover:text-ink">
            Bikes
          </Link>
          <Link href="/service" className="hover:text-ink">
            Service
          </Link>
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
        </nav>

        <div className="ml-auto hidden flex-1 max-w-md md:block">
          <input
            type="search"
            placeholder='Search brand, model or "cargo"'
            className="w-full rounded-control border border-line bg-paper px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-ink"
          />
        </div>

        <Link
          href="/sell"
          className="ml-auto shrink-0 rounded-control border border-ink px-4 py-2 text-sm font-medium md:ml-0"
        >
          Sell your bike
        </Link>
      </div>
    </header>
  );
}
