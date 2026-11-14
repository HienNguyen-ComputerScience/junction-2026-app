import { ChevronRight } from "lucide-react";
import Link from "next/link";

/**
 * The act page's one way back: "Areas / <area> / Actions". The parents are links, the last item
 * is the current page. 36px tall for touch, starting on the page's left edge.
 */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 type-caption font-medium">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-x-1">
            {index > 0 ? (
              <ChevronRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-faint" />
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex h-9 items-center rounded-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="inline-flex h-9 items-center text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
