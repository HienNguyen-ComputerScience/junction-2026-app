import Link from "next/link";
import { Suspense } from "react";

import { MainNav, NavLinks } from "@/components/site-nav";

/**
 * FirstLine mark: an F built from the product's own chart. The stem is the Finland line, in the
 * same off-white as on every bar; the two arms are bars measured from it, in the accent (the one
 * place the accent is a mark of its own). Flat, no tile. Decorative.
 */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="3" y="2" width="2.5" height="20" className="fill-foreground" />
      <rect x="7.5" y="4" width="14" height="5.5" rx="1" className="fill-brand" />
      <rect x="7.5" y="12" width="8.5" height="5.5" rx="1" className="fill-brand" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="page-container flex h-14 items-center justify-between gap-4 sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex h-11 w-fit shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <LogoMark />
            <span className="font-display text-[1.125rem] leading-none font-[560] tracking-[-0.02em]">
              FirstLine
            </span>
          </Link>
          <p className="hidden truncate border-l border-border pl-3 type-caption text-muted-foreground lg:block">
            Where early cancer care breaks down, county by county
          </p>
        </div>
        <Suspense fallback={<NavLinks pathname={null} />}>
          <MainNav />
        </Suspense>
      </div>
    </header>
  );
}
