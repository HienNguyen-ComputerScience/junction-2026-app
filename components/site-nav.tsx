"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

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
  lastArea = null,
  defaultArea,
  areaIds,
}: {
  pathname: string | null;
  areaParam?: string | null;
  /** The last area viewed this session, already validated; used before `defaultArea`. */
  lastArea?: string | null;
  defaultArea: string;
  areaIds: string[];
}) {
  const fromUrl = pathname === "/" && areaParam && areaIds.includes(areaParam) ? areaParam : null;
  // Home always shows an area (its ?area=, else the default), so the remembered one is not used there.
  const remembered = pathname === "/" ? null : lastArea;
  const actionsArea = countyOf(pathname) ?? fromUrl ?? remembered ?? defaultArea;
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
                className={`flex h-11 items-center rounded-sm px-2 text-[0.9375rem] whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-3 sm:text-base ${
                  active
                    ? "bg-mint-veil font-semibold text-forest-ink"
                    : "text-foreground hover:bg-keylime-wash hover:text-forest-ink"
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

const LAST_AREA_KEY = "firstline:last-area";
const LAST_AREA_EVENT = "firstline:last-area-change";

function subscribeLastArea(onChange: () => void) {
  window.addEventListener(LAST_AREA_EVENT, onChange);
  return () => window.removeEventListener(LAST_AREA_EVENT, onChange);
}

function readLastArea(): string | null {
  try {
    return window.sessionStorage.getItem(LAST_AREA_KEY);
  } catch {
    return null;
  }
}

export function MainNav({ defaultArea, areaIds }: { defaultArea: string; areaIds: string[] }) {
  const areaParam = useSearchParams().get("area");
  const pathname = usePathname();
  // Server and first client render see null (the default area); the stored value arrives after hydration.
  const stored = useSyncExternalStore(subscribeLastArea, readLastArea, () => null);
  const lastArea = stored && areaIds.includes(stored) ? stored : null;

  const seen =
    countyOf(pathname) ?? (pathname === "/" && areaParam ? areaParam : null);
  useEffect(() => {
    if (!seen || !areaIds.includes(seen)) return;
    try {
      if (window.sessionStorage.getItem(LAST_AREA_KEY) === seen) return;
      window.sessionStorage.setItem(LAST_AREA_KEY, seen);
      window.dispatchEvent(new Event(LAST_AREA_EVENT));
    } catch {
      // Storage unavailable: the nav falls back to the default area.
    }
  }, [seen, areaIds]);

  return (
    <NavLinks
      pathname={pathname}
      areaParam={areaParam}
      lastArea={lastArea}
      defaultArea={defaultArea}
      areaIds={areaIds}
    />
  );
}
