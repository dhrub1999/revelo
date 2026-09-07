"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { Logomark } from "@/components/logomark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function MobileNav() {
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
          >
            Bikes
          </SheetClose>
          <SheetClose
            render={
              <Link href="/service" className="border-b border-line-subtle py-3" />
            }
          >
            Service
          </SheetClose>
          <SheetClose render={<Link href="/about" className="py-3" />}>
            About
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
