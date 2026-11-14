import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

import { Reveal } from "@/components/motion";

// The few building blocks of the page, in the cream-paper language: Forest Ink headings and
// links, light serif statements, charcoal body text at 16px or more, 14px corners, no shadow.

/** One topic: a lot of space around it, its name, then pieces that reveal as they come into view. */
export function Section({
  id,
  name,
  children,
  className,
}: {
  id: string;
  /** The topic's name: the section heading and its entry in "On this page". */
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("htr-section flex flex-col gap-8 border-t border-frame-border py-24 sm:py-32", className)}
    >
      <Reveal>
        <h2 id={`${id}-heading`} className="flex items-center gap-4 text-lg leading-7 font-semibold text-forest-ink">
          <span aria-hidden className="block h-px w-10 animate-line-in bg-forest-ink" />
          {name}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

/** The one short statement a section makes, set large in the light serif. */
export function Statement({ children, index = 1 }: { children: ReactNode; index?: number }) {
  return (
    <Reveal index={index} className="max-w-[46rem]">
      <p className="font-display text-[2rem] leading-[1.2] font-light text-pretty text-forest-ink lining-nums sm:text-[2.75rem]">
        {children}
      </p>
    </Reveal>
  );
}

/** A plain sentence: what the statement or figure means. */
export function Plain({ children, index = 0, className }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <Reveal index={index} className={cn("max-w-[44rem]", className)}>
      <p className="text-lg leading-8 text-pretty text-charcoal">{children}</p>
    </Reveal>
  );
}

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
