import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Styled native disclosure (no client JS): a chevron that turns when open, instead of the
 * browser's default triangle. `summary` is the always-visible label.
 */
export function Disclosure({
  summary,
  children,
  className,
  summaryClassName,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
}) {
  return (
    <details className={cn("group/disc", className)}>
      <summary
        className={cn(
          "flex min-h-9 w-fit cursor-pointer items-center gap-1.5 rounded-sm type-caption font-medium text-foreground outline-none select-none hover:underline hover:underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50",
          summaryClassName,
        )}
      >
        <ChevronRight
          aria-hidden
          strokeWidth={1.75}
          className="size-4 shrink-0 transition-transform duration-150 group-open/disc:rotate-90"
        />
        {summary}
      </summary>
      {children}
    </details>
  );
}
