import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { MainNav, NavLinks } from "@/components/site-nav";
import { buttonVariants } from "@/components/ui/button";
import { counties } from "@/lib/data";
import { getRanking } from "@/lib/ranking";

/**
 * FirstLine mark: an F built from the product's own chart. The stem is the Finland line; the
 * two arms are bars measured from it. All Forest Ink. Flat, no tile. Decorative.
 */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="3" y="2" width="2.5" height="20" className="fill-forest-ink" />
      <rect x="7.5" y="4" width="14" height="5.5" rx="1" className="fill-brand" />
      <rect x="7.5" y="12" width="8.5" height="5.5" rx="1" className="fill-brand" />
    </svg>
  );
}

export function SiteHeader() {
  const areaIds = counties.map((county) => county.id);
  const defaultArea = getRanking()[0]?.county.id ?? areaIds[0];
  return (
    <header className="border-b border-frame-border bg-background print:hidden">
      <div className="page-container flex min-h-16 items-center justify-between gap-3 py-2 sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex h-11 w-fit shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <LogoMark />
            <span className="font-display text-2xl leading-none font-light text-forest-ink">
              FirstLine
            </span>
          </Link>
          <p className="hidden truncate border-l border-border pl-3 type-caption text-muted-foreground md:block">
            For county directors: where early cancer care slows, and what to do
          </p>
        </div>
        {/* The guided briefing is built on its own branch; this is its one entry point in the header. */}
        <Link href="/briefing" className={buttonVariants({ variant: "default", size: "default", className: "shrink-0" })}>
          <span className="sm:hidden">Guided briefing</span>
          <span className="hidden sm:inline">Start the guided briefing</span>
          <ArrowRight aria-hidden strokeWidth={1.75} />
        </Link>
      </div>
      <div className="border-t border-frame-border">
        <Suspense fallback={<NavLinks pathname={null} defaultArea={defaultArea} areaIds={areaIds} />}>
          <MainNav defaultArea={defaultArea} areaIds={areaIds} />
        </Suspense>
      </div>
    </header>
  );
}
