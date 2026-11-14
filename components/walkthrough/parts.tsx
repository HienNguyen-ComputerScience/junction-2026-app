import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// The few building blocks of the page, in the cream-paper language: Forest Ink headings and
// links, light serif statements, charcoal body text at 16px or more, 14px corners, no shadow.

/** A large forward link at the end of the page. */
export function ForwardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[3.25rem] items-center justify-between gap-2.5 rounded-[14px] border border-forest-ink bg-cream-paper px-[21px] py-[13px] text-base leading-6 font-semibold text-forest-ink transition-colors hover:bg-mint-veil focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-ink"
    >
      <span>{children}</span>
      <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
    </Link>
  );
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "13 May 2026" from an ISO date, or "not stated". */
export function longDate(iso: string | null): string {
  if (!iso) return "not stated";
  return DATE.format(new Date(`${iso}T00:00:00Z`));
}
