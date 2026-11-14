import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "cn";

/**
 * The one back-link pattern: an arrow icon and a label, no button chrome, so the text starts
 * on the page's left edge. 36px tall for touch.
 */
export function BackLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex h-9 w-fit items-center gap-1.5 rounded-sm type-caption font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
      {children}
    </Link>
  );
}
