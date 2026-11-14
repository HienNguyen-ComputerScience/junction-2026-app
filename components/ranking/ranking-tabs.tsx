"use client";

import { cn } from "cn";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

import { FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";

type Tab = { id: string; label: string; description: ReactNode; view: ReactNode };

/**
 * The ranking's two orders as tabs over one table: the longest GP wait first, or the areas
 * getting worse fastest. Both lists are server-rendered and passed in; only the open one is
 * in the page. Tabs follow the ARIA pattern (arrow keys move between them).
 */
export function RankingTabs({ title, titleId, tabs }: { title: ReactNode; titleId: string; tabs: Tab[] }) {
  const base = useId();
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (active + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setActive(next);
    document.getElementById(`${base}-tab-${next}`)?.focus();
  }

  return (
    <>
      <FrameHeader className="items-end">
        <FrameTitle id={titleId} className="type-title">
          {title}
        </FrameTitle>
        <div
          role="tablist"
          aria-label="Order of the areas"
          className="col-span-2 col-start-1 row-start-3 flex gap-5 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-end"
        >
          {tabs.map((tab, index) => {
            const selected = index === active;
            return (
              <button
                key={tab.id}
                id={`${base}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${base}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={onKey}
                className={cn(
                  "relative h-9 text-sm font-medium transition-colors outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5",
                  selected
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <FrameDescription className="row-start-2">{current.description}</FrameDescription>
      </FrameHeader>
      <FramePanel
        padding="none"
        id={`${base}-panel`}
        role="tabpanel"
        aria-labelledby={`${base}-tab-${active}`}
      >
        {current.view}
      </FramePanel>
    </>
  );
}
