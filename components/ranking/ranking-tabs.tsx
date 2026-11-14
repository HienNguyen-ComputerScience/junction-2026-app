"use client";

import { cn } from "cn";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Two orders of the same areas, as tabs over one panel: "Longest GP waits" and "Getting worse
 * fastest". Only the selected list is rendered, so a row link is never present twice. WAI-ARIA
 * tabs: arrow keys move and select.
 */
export function RankingTabs({ tabs, label }: { tabs: { id: string; label: string; panel: ReactNode }[]; label: string }) {
  const baseId = useId();
  const [selected, setSelected] = useState(tabs[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(tabs[next].id);
    refs.current[next]?.focus();
  }

  const current = tabs.find((tab) => tab.id === selected) ?? tabs[0];

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label={label} className="flex w-fit gap-1 border-b border-border">
        {tabs.map((tab, index) => {
          const isSelected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative -mb-px min-h-10 rounded-t-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isSelected
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${current.id}`}>
        {current.panel}
      </div>
    </div>
  );
}
