import Link from "next/link";
import { Suspense } from "react";

import { MainNav, NavLinks } from "@/components/site-nav";

/** FirstLine mark: an F drawn as a path with a starting point. Decorative. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={className}>
      <rect width="28" height="28" rx="8" className="fill-brand" />
      {/* An F drawn as a path: a start point, a stem, and two lines leading out. */}
      <path
        d="M10 19.5V9.5h9.5M10 14.5h6"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19.75" r="2.1" fill="white" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 px-4 py-2.5 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="flex w-fit items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <LogoMark />
          <span className="flex items-baseline gap-3">
            <span className="font-display text-[1.1875rem] font-semibold tracking-[-0.025em]">
              FirstLine
            </span>
            <span className="hidden border-l border-border pl-3 text-[0.8125rem] text-muted-foreground lg:inline">
              Where early cancer care breaks down, county by county
            </span>
          </span>
        </Link>
        <Suspense fallback={<NavLinks pathname={null} />}>
          <MainNav />
        </Suspense>
      </div>
    </header>
  );
}
