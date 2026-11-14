"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type NavItem = {
  key: string;
  label: string;
  /** Phones get the short label; the full one is still read by screen readers. */
  short: string;
  match: (pathname: string) => boolean;
};

const ITEMS: NavItem[] = [
  {
    key: "areas",
    label: "Areas",
    short: "Areas",
    match: (p) => p === "/" || p.startsWith("/compare") || (p.startsWith("/county") && !p.endsWith("/act")),
  },
  { key: "actions", label: "Actions", short: "Actions", match: (p) => p.startsWith("/county") && p.endsWith("/act") },
  { key: "ask", label: "Ask the evidence", short: "Ask", match: (p) => p.startsWith("/ask") },
  { key: "sources", label: "Sources & limitations", short: "Sources", match: (p) => p.startsWith("/sources") },
];

/** The area id in /county/<id> or /county/<id>/act, else null. */
function countyOf(pathname: string | null): string | null {
  return pathname?.match(/^\/county\/([^/]+)/)?.[1] ?? null;
}

/**
 * Presentational nav: plain text links, the current page marked with an accent underline.
 * `pathname` null renders no active state (prerender fallback). "Actions" goes to the act page
 * of the area in view: the home page's ?area=, the county page's own area, else `defaultArea`
 * (the area that leads the ranking). Phones get short labels so the header stays one 56px row.
 */
export function NavLinks({
  pathname,
  areaParam = null,
  defaultArea,
  areaIds,
}: {
  pathname: string | null;
  areaParam?: string | null;
  defaultArea: string;
  areaIds: string[];
}) {
  const fromUrl = pathname === "/" && areaParam && areaIds.includes(areaParam) ? areaParam : null;
  const actionsArea = countyOf(pathname) ?? fromUrl ?? defaultArea;
  const hrefs: Record<string, string> = {
    areas: "/",
    actions: `/county/${actionsArea}/act`,
    ask: "/ask",
    sources: "/sources",
  };
  return (
    <nav aria-label="Main" className="shrink-0">
      <ul className="-mr-2 flex items-center gap-0.5 sm:-mr-2.5 sm:gap-2">
        {ITEMS.map((item) => {
          const active = pathname !== null && item.match(pathname);
          return (
            <li key={item.key}>
              <Link
                href={hrefs[item.key]}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-14 items-center px-1.5 type-caption font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-2.5 ${
                  active
                    ? "text-foreground after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:bg-brand after:content-[''] sm:after:inset-x-2.5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="sm:hidden" aria-hidden>
                  {item.short}
                </span>
                <span className="sr-only sm:not-sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MainNav({ defaultArea, areaIds }: { defaultArea: string; areaIds: string[] }) {
  const areaParam = useSearchParams().get("area");
  return <NavLinks pathname={usePathname()} areaParam={areaParam} defaultArea={defaultArea} areaIds={areaIds} />;
}
