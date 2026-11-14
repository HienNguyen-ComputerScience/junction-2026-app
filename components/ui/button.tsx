import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Two buttons, and no others: `default` (primary) and `outline` (secondary). The third level of
// an action is a text link: `TextLink` in text-link.tsx.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-base font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary: the solid accent, at most one per viewport. Disabled, it is a flat neutral
        // block with faint text and no edge: clearly switched off, never a dim accent.
        default:
          "bg-primary text-primary-foreground hover:bg-forest-shadow disabled:bg-foreground/10 disabled:text-faint disabled:opacity-100",
        // Secondary: a neutral outline on the raised surface.
        outline:
          "border-forest-ink bg-cream-paper text-forest-ink hover:bg-mint-veil aria-expanded:bg-mint-veil disabled:border-input disabled:text-faint disabled:opacity-100",
      },
      size: {
        default:
          "min-h-11 gap-2 px-4 py-2 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3",
        lg: "min-h-[3.25rem] gap-2.5 rounded-lg px-[1.3125rem] py-3.5 text-[1.0625rem] has-data-[icon=inline-end]:pr-[1.125rem] has-data-[icon=inline-start]:pl-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
