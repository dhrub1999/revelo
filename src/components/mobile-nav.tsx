"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Logomark } from "@/components/logomark";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/actions";
import type { CurrentUser } from "@/lib/supabase/auth";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function MobileNav({ user }: { user: CurrentUser | null }) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
        className="md:hidden"
      >
        <List size={22} />
      </SheetTrigger>
      <SheetContent side="right" className="w-4/5 gap-0">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="flex items-center gap-1.5">
            <Logomark className="size-5 text-brand" />
            <span>
              Rev<span className="text-brand">é</span>lo
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-4 py-2 text-sm">
          <SheetClose
            render={<Link href="/" className="border-b border-line-subtle py-3" />}
            nativeButton={false}
          >
            Bikes
          </SheetClose>
          <SheetClose
            render={
              <Link href="/service" className="border-b border-line-subtle py-3" />
            }
            nativeButton={false}
          >
            Service
          </SheetClose>
          <SheetClose
            render={
              <Link href="/about" className="border-b border-line-subtle py-3" />
            }
            nativeButton={false}
          >
            About
          </SheetClose>
          {user ? (
            <>
              <SheetClose
                render={
                  <Link href="/messages" className="border-b border-line-subtle py-3" />
                }
                nativeButton={false}
              >
                Messages
              </SheetClose>
              <SheetClose
                render={
                  <Link href="/test-rides" className="border-b border-line-subtle py-3" />
                }
                nativeButton={false}
              >
                Test rides
              </SheetClose>
              <SheetClose
                render={
                  <Link href="/offers" className="border-b border-line-subtle py-3" />
                }
                nativeButton={false}
              >
                Offers
              </SheetClose>
              {user.role === "seller" && (
                <SheetClose
                  render={
                    <Link href="/seller" className="border-b border-line-subtle py-3" />
                  }
                  nativeButton={false}
                >
                  My listings
                </SheetClose>
              )}
              {user.role === "admin" && (
                <SheetClose
                  render={
                    <Link href="/admin" className="border-b border-line-subtle py-3" />
                  }
                  nativeButton={false}
                >
                  Admin
                </SheetClose>
              )}
              <form action={signOut}>
                <button type="submit" className="w-full py-3 text-left">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <SheetClose render={<Link href="/login" className="py-3" />} nativeButton={false}>
              Sign in
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
