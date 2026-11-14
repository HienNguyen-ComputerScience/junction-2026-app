import type { ReactNode } from "react";
import { cn } from "cn";

import { Disclosure } from "@/components/motion";
import { TextLink } from "@/components/ui/text-link";

/** The framed unit every source and limitation on /sources uses: cream, 14px corners, a Border Mist hairline. */
export const SOURCE_FRAME = "rounded-[14px] border border-frame-border bg-cream-paper p-[21px]";

/**
 * One source as a compact framed unit: what it is, who publishes it, the years covered and the
 * official link, always visible. Anything longer sits behind one plainly labelled "Show …" button
 * that opens in place (and is open on paper).
 *
 * `focus`: the card takes part in the page's FocusGroup, which then draws its surface.
 */
export function SourceCard({
  title,
  publisher,
  years,
  href,
  linkLabel,
  note,
  detail,
  detailLabel,
  focus = false,
  headingLevel = "h4",
}: {
  title: ReactNode;
  publisher: string;
  years?: string;
  href: string;
  /** A separate link under the text. Without it, the title itself is the link. */
  linkLabel?: string;
  /** One line under the title, e.g. the indicator's main limitation. */
  note?: ReactNode;
  detail?: ReactNode;
  /** Lower case: "definition and scope" → "Show definition and scope". */
  detailLabel?: string;
  focus?: boolean;
  headingLevel?: "h3" | "h4";
}) {
  const Heading = headingLevel;
  return (
    <article
      data-focus-item={focus ? "" : undefined}
      className={cn("print-keep flex h-full flex-col gap-2", !focus && SOURCE_FRAME)}
    >
      <Heading className="text-lg leading-7 font-semibold text-pretty text-forest-ink">
        {linkLabel ? (
          title
        ) : (
          // Inline, so the arrow follows the last word of a name of any length.
          <TextLink kind="external" inline href={href} className="text-lg font-semibold text-pretty">
            {title}
          </TextLink>
        )}
      </Heading>
      {note && <p className="max-w-[44rem] text-base text-pretty text-foreground">{note}</p>}
      <p className="text-base text-pretty text-muted-foreground">
        {publisher}
        {years && (
          <>
            {" · "}
            <span className="tabular-nums">{years}</span>
          </>
        )}
      </p>
      {(linkLabel || (detail && detailLabel)) && (
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          {linkLabel && (
            <TextLink kind="external" href={href} className="text-base">
              {linkLabel}
            </TextLink>
          )}
          {detail && detailLabel && (
            <Disclosure label={detailLabel} tone="quiet" className="basis-full">
              {detail}
            </Disclosure>
          )}
        </div>
      )}
    </article>
  );
}

/**
 * One limitation as a framed one-liner. The line is always visible; the detail sits behind
 * "Show detail" and is open on paper.
 */
export function LimitationItem({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <li className="print-keep flex flex-col gap-1 rounded-[14px] border border-sage-mist bg-keylime-wash p-[21px]">
      <p className="text-base font-semibold text-pretty text-foreground">{title}</p>
      {children && (
        <Disclosure show="Show detail" hide="Hide detail" tone="quiet">
          <div className="flex max-w-[44rem] flex-col gap-2 text-base leading-relaxed text-pretty text-foreground">{children}</div>
        </Disclosure>
      )}
    </li>
  );
}
