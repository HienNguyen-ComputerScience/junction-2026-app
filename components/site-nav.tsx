"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "County ranking", short: "County ranking", match: (p: string) => p === "/" || p.startsWith("/county") },
  { href: "/#ask", label: "Ask the evidence", short: "Ask the evidence", match: () => false },
  { href: "/sources", label: "Sources & limitations", short: "Sources", match: (p: string) => p.startsWith("/sources") },
] as const;

/** Presentational nav. `pathname` null renders no active state (prerender fallback). */
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="w-full sm:w-auto">
      <ul className="flex w-full items-center gap-0.5 rounded-full border border-border/80 bg-muted/80 p-1 sm:w-auto">
        {LINKS.map((link) => {
          const active = pathname !== null && link.match(pathname);
          return (
            <li key={link.href} className="flex-1 sm:flex-none">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-8 sm:px-3.5 ${
                  active
                    ? "bg-card text-foreground shadow-[0_1px_2px_oklch(0.2_0.03_262/0.08),0_0_0_1px_var(--border)]"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                }`}
              >
                {link.short === link.label ? (
                  link.label
                ) : (
                  <>
                    <span className="sm:hidden" aria-hidden>
                      {link.short}
                    </span>
                    <span className="sr-only sm:not-sr-only">{link.label}</span>
                  </>
                )}
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
