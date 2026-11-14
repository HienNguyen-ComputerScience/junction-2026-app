import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { CircleDashed, Database, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

const QUIET_TAG =
  "border-border bg-transparent font-normal text-muted-foreground [a]:hover:border-foreground/30 [a]:hover:text-foreground"

const PROVENANCE = "gap-1.5 px-0 text-[0.8125rem] font-normal text-muted-foreground"

/** Provenance is an icon plus muted text, never the 8px square (that is for data status only). */
const PROVENANCE_ICON = { unverified: CircleDashed, provenance: CircleDashed, checked: ShieldCheck } as const

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-2 py-0.5 text-[0.75rem] leading-none font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Neutral text tags ("Cached", "How to read FirstLine"): regular weight, a hairline and
        // no fill, so they sit below the two real chip families (the mono source chip and the
        // coloured status badge). `default` and `brand` are the same quiet tag.
        default: QUIET_TAG,
        brand: QUIET_TAG,
        secondary: QUIET_TAG,
        // Provenance: where a piece of content comes from. A 14px icon plus 13px muted text, no
        // box: a dashed circle for content nobody has checked ("Found live — unverified"), a
        // shield (or the database, `source="snapshot"`) for content the team checked or computed
        // ("Source checked", "Precomputed from the snapshot").
        unverified: PROVENANCE,
        checked: PROVENANCE,
        // Alias of `unverified`: a provenance tag is unchecked unless it says `checked`.
        provenance: PROVENANCE,
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        // The reference tag: drawn exactly like SourceChip (components/source-chip.tsx), so a
        // source reads the same whether it is a link or a plain tag.
        outline:
          "h-7 border-border bg-muted font-mono text-[0.6875rem] font-normal tracking-normal text-muted-foreground tabular-nums [word-spacing:-0.25em] sm:h-6 [a]:hover:border-foreground/30 [a]:hover:text-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground",
        link: "text-brand-ink underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  children,
  source,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Provenance variants only: "snapshot" draws the database icon instead of the shield. */
    source?: "snapshot"
  }) {
  const Icon =
    variant === "unverified" || variant === "provenance" || variant === "checked"
      ? source === "snapshot" && variant === "checked"
        ? Database
        : PROVENANCE_ICON[variant]
      : null
  const content: ReactNode = Icon ? (
    <>
      <span aria-hidden className="inline-flex shrink-0">
        <Icon className="size-3.5" strokeWidth={1.75} />
      </span>
      {children as ReactNode}
    </>
  ) : (
    (children as ReactNode)
  )
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
        children: content,
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
