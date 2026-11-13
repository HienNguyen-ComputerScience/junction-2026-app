import { SourceChip } from "@/components/source-chip";

export type LimitationItem = {
  text: string;
  sourceId?: string;
};

/** Always visible, never collapsible: the caveats travel with the numbers. */
export function LimitationsBox({ items }: { items: LimitationItem[] }) {
  return (
    <section
      aria-labelledby="limitations-heading"
      className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4"
    >
      <h2 id="limitations-heading" className="text-base font-semibold">
        Limitations: read before acting on these numbers
      </h2>
      <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
        {items.map((item) => (
          <li key={item.text}>
            {item.text}
            {item.sourceId && (
              <>
                {" "}
                <SourceChip sourceId={item.sourceId} />
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
