"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "County ranking", short: "Ranking", match: (p: string) => p === "/" || p.startsWith("/county") },
  { href: "/#ask", label: "Ask the evidence", short: "Ask", match: () => false },
  { href: "/sources", label: "Sources & limitations", short: "Sources", match: (p: string) => p.startsWith("/sources") },
] as const;

/**
 * Presentational nav: plain text links, the current page marked with an ink underline.
 * `pathname` null renders no active state (prerender fallback). Phones get short labels so
 * the header stays one 56px row; the full label is still read by screen readers.
 */
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="shrink-0">
      <ul className="-mr-2 flex items-center gap-1 sm:-mr-2.5 sm:gap-2">
        {LINKS.map((link) => {
          const active = pathname !== null && link.match(pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-14 items-center px-2 type-caption font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-2.5 ${
                  active
                    ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-foreground after:content-[''] sm:after:inset-x-2.5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="sm:hidden" aria-hidden>
                  {link.short}
                </span>
                <span className="sr-only sm:not-sr-only">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MainNav() {
  return <NavLinks pathname={usePathname()} />;
}
