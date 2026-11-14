import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const QUIET_TAG =
  "border-border bg-transparent font-normal text-muted-foreground [a]:hover:border-foreground/30 [a]:hover:text-foreground"

const PROVENANCE =
  "gap-1.5 px-0 font-normal text-muted-foreground before:size-1.5 before:shrink-0 before:rounded-[1.5px] before:content-['']"

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
        // Provenance: where a piece of content comes from. Quiet text with a 6px mark and no
        // box: hollow for content nobody has checked ("Found live — unverified"), solid for
        // content the team checked or computed ("Source checked", "Precomputed from the
        // snapshot").
        unverified: `${PROVENANCE} before:border before:border-current`,
        checked: `${PROVENANCE} before:bg-current`,
        // Alias of `unverified`: a provenance tag is unchecked unless it says `checked`.
        provenance: `${PROVENANCE} before:border before:border-current`,
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
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
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
