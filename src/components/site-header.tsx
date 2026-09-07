import Link from "next/link";
import { Suspense } from "react";
import { HeaderSearch } from "@/components/header-search";
import { MobileNav } from "@/components/mobile-nav";
import { Logomark } from "@/components/logomark";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase/auth";
import { signOut } from "@/lib/supabase/actions";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-heading text-lg font-semibold tracking-tight text-ink"
        >
          <Logomark className="size-6 text-brand" />
          <span>
            Rev<span className="text-brand">é</span>lo
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/" className="transition-colors hover:text-ink">
            Bikes
          </Link>
          <Link href="/service" className="transition-colors hover:text-ink">
            Service
          </Link>
          <Link href="/about" className="transition-colors hover:text-ink">
            About
          </Link>
        </nav>

        <div className="ml-auto hidden flex-1 max-w-md md:block">
          <Suspense fallback={<div className="h-9" />}>
            <HeaderSearch />
          </Suspense>
        </div>

        <div className="hidden items-center gap-3 text-sm text-muted md:flex">
          {user ? (
            <>
              {user.role === "seller" && (
                <Link href="/seller" className="transition-colors hover:text-ink">
                  My listings
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin" className="transition-colors hover:text-ink">
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <button type="submit" className="transition-colors hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="transition-colors hover:text-ink">
              Sign in
            </Link>
          )}
        </div>

        <Button
          render={<Link href="/sell" />}
          nativeButton={false}
          size="lg"
          className="ml-auto h-9 shrink-0 rounded-control bg-brand-fill text-white hover:bg-brand-fill-hover md:ml-0"
        >
          Sell your bike
        </Button>

        <MobileNav user={user} />
      </div>
    </header>
  );
}
