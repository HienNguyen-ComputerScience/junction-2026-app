"use client";

import { useId, useState, type ReactNode } from "react";

import { SECONDARY_BUTTON } from "@/components/briefing/ui";

export type ButtonPanel = {
  id: string;
  /** The button while its panel is closed: says what pressing it shows. */
  show: string;
  /** The button while its panel is open. */
  hide: string;
  content: ReactNode;
};

/**
 * The buttons inside a step for the questions a director asks ("Show me the source",
 * "Compare with another area"). Each opens one panel under the row; pressing it again closes
 * it, and opening another replaces it, so the step never grows a second and third layer.
 * The panels are in the page from the start (hidden, not absent), nothing depends on hover,
 * and each button says whether its panel is open.
 */
export function ButtonPanels({ items }: { items: ButtonPanel[] }) {
  const base = useId();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-expanded={open === item.id}
            aria-controls={`${base}-${item.id}`}
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className={SECONDARY_BUTTON}
          >
            {open === item.id ? item.hide : item.show}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${base}-${item.id}`}
          hidden={open !== item.id}
          className="bf-rise rounded-[14px] bg-keylime-wash p-[21px] sm:p-[28px]"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
