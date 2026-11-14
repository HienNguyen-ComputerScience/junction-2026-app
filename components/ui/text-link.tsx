import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * The one text link: accent text, no underline until hover, and an icon that says where it goes.
 *  - "jump": to a place further down this page (arrow down).
 *  - "nav": to another page of the app (arrow right).
 *  - "external": to another site, in a new tab (the small up-right arrow the source chips use).
 * 36px tall for touch; `inline` sets it in running text or a list of long labels, where it wraps.
 */
export function TextLink({
  kind,
  href,
  children,
  inline = false,
  className,
}: {
  kind: "jump" | "nav" | "external";
  href: string;
  children: ReactNode;
  /** Wraps like text, with the icon after the last word. */
  inline?: boolean;
  className?: string;
}) {
  const classes = cn(
    "rounded-sm font-medium text-brand-ink underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
    inline ? "inline" : "inline-flex min-h-9 w-fit items-center gap-1.5",
    className,
  );
  const icon = inline ? "ml-1 inline-block align-[-2px]" : "shrink-0";

  if (kind === "external") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <ArrowUpRight aria-hidden strokeWidth={1.75} className={cn("size-3.5 opacity-80", icon)} />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  if (kind === "jump") {
    return (
      <a href={href} className={classes}>
        {children}
        <ArrowDown aria-hidden strokeWidth={1.75} className={cn("size-4", icon)} />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
      <ArrowRight aria-hidden strokeWidth={1.75} className={cn("size-4", icon)} />
    </Link>
  );
}
