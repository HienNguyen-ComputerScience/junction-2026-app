"use client";

import { cn } from "cn";
import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type StepTab = {
  id: string;
  /** The tab's face: step name, value, status word. No links inside (it is a button). */
  tab: ReactNode;
  /** The source chip of the tab's value: a link, so it sits under the tab, never inside it. */
  chip?: ReactNode;
  /** The detail shown under the tabs when this tab is selected. */
  panel: ReactNode;
  /** Shown by `StepAside` (elsewhere on the page) while this tab is selected: the step's trend. */
  aside?: ReactNode;
};

type TabsState = { tabs: StepTab[]; selected: string | undefined; select: (id: string) => void };
const TabsContext = createContext<TabsState | null>(null);

function useTabs(): TabsState {
  const state = useContext(TabsContext);
  if (!state) throw new Error("StepTabs and StepAside must sit inside a StepTabsProvider.");
  return state;
}

// The deep link: /county/<id>?step=1|2|3 opens that step's tab (1 to 3 in pathway order). Read
// after hydration, like the home picker's ?area=, so the page stays static.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const readUrlStep = () => new URLSearchParams(window.location.search).get("step");
const noUrlStep = () => null;

/**
 * Holds which of the three steps is selected, for the tabs and for whatever else on the page
 * follows the selection (`StepAside`). The first tab shown is `defaultId`, unless the URL names a
 * step with ?step=.
 */
export function StepTabsProvider({
  tabs,
  defaultId,
  children,
}: {
  tabs: StepTab[];
  defaultId: string;
  children: ReactNode;
}) {
  const urlStep = useSyncExternalStore(subscribe, readUrlStep, noUrlStep);
  const [picked, setPicked] = useState<string | null>(null);
  const known = (id: string | null | undefined) => (id && tabs.some((tab) => tab.id === id) ? id : undefined);
  const fromUrl = urlStep && /^[1-9]$/.test(urlStep) ? tabs[Number(urlStep) - 1]?.id : undefined;
  const selected = known(picked) ?? known(fromUrl) ?? known(defaultId) ?? tabs[0]?.id;
  return <TabsContext value={{ tabs, selected, select: setPicked }}>{children}</TabsContext>;
}

/** The selected step's side content (its trend), wherever the page puts it. */
export function StepAside({ className }: { className?: string }) {
  const { tabs, selected } = useTabs();
  const tab = tabs.find((item) => item.id === selected);
  if (!tab?.aside) return null;
  return <div className={className}>{tab.aside}</div>;
}

/**
 * The three pathway steps as one segmented row of tabs, with only the selected step's detail
 * under it. Switching swaps the detail in place: no URL change, no page load. WAI-ARIA tabs with
 * automatic activation: arrow keys move and select, Home and End jump to the ends.
 */
export function StepTabs({
  label,
  footer,
  action,
}: {
  label: string;
  /** Under the detail, inside the same panel (the page's bar key). */
  footer?: ReactNode;
  /** The one button of the panel, in its top row at the right (once, whichever step is selected). */
  action?: ReactNode;
}) {
  const { tabs, selected, select } = useTabs();
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(tabs[next].id);
    refs.current[next]?.focus();
  }

  // Phone: the tabs stack (one row each) and a panel shows its own chip. From sm: one row of columns.
  const cols = { "--n": tabs.length } as CSSProperties;

  return (
    <div className="flex flex-col gap-1.5">
    <p className="text-[0.75rem] leading-4 text-muted-foreground">Pick a step</p>
    <div className="flex flex-col rounded-panel border border-border bg-card">
      <div
        role="tablist"
        aria-label={label}
        className="grid divide-y divide-border max-sm:border-b sm:grid-cols-[repeat(var(--n),minmax(0,1fr))] sm:divide-x sm:divide-y-0"
        style={cols}
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selected;
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
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "group/tab relative flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 text-left transition-colors outline-none max-sm:first:rounded-t-panel sm:flex-col sm:flex-nowrap sm:items-start sm:pt-3 sm:pb-1.5 sm:first:rounded-tl-panel sm:last:rounded-tr-panel focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-4",
                isSelected ? "bg-muted" : "hover:bg-accent/60",
              )}
            >
              {tab.tab}
            </button>
          );
        })}
      </div>
      {/* The chips, one under each tab, on the same columns. The selected column keeps its
          surface down to the accent line that marks it. */}
      <div
        className="hidden divide-x divide-border border-b border-border sm:grid sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
        style={cols}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <div
              key={tab.id}
              className={cn(
                "relative flex min-h-9 items-start px-3 pb-2.5 sm:px-4",
                isSelected && "bg-muted after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand",
              )}
            >
              {tab.chip}
            </div>
          );
        })}
      </div>
      {/* The detail of the selected step, and in its top row at the right the panel's one button. */}
      <div className="grid sm:grid-cols-[minmax(0,1fr)_auto]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={tab.id !== selected}
            tabIndex={0}
            className="px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:col-start-1 sm:row-start-1 sm:px-5"
          >
            {tab.chip ? <div className="mb-3 sm:hidden">{tab.chip}</div> : null}
            {tab.panel}
          </div>
        ))}
        {action ? (
          <div className="px-4 pb-4 sm:col-start-2 sm:row-start-1 sm:pt-3.5 sm:pr-5 sm:pb-0 sm:pl-0">{action}</div>
        ) : null}
      </div>
      {footer ? <div className="border-t border-border px-4 py-3 sm:px-5">{footer}</div> : null}
    </div>
    </div>
  );
}
