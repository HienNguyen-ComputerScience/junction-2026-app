"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import { LiveMark, LoadingRows, ResultList, Unavailable } from "./result-list";
import { isItemsResponse, TOO_MANY, type ItemsResponse } from "./types";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; data: ItemsResponse }
  | { kind: "error"; limited: boolean };

// actionTitle is sent as free text; the route also accepts preset keys, but action ids are not presets.
export function EvidenceFinder({ actionId, actionTitle }: { actionId: string; actionTitle: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const ctrlRef = useRef<AbortController | null>(null);
  const panelId = `exa-evidence-${actionId}`;

  useEffect(() => () => ctrlRef.current?.abort(), []);

  function run() {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setState({ kind: "loading" });
    fetch(`/api/evidence?action=${encodeURIComponent(actionTitle)}`, { signal: ctrl.signal })
      .then(async (res) => {
        const json: unknown = await res.json();
        setState(res.ok && isItemsResponse(json) ? { kind: "done", data: json } : { kind: "error", limited: res.status === 429 });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error", limited: false });
      });
  }

  const loading = state.kind === "loading";
  const data = state.kind === "done" ? state.data : null;
  const limited = state.kind === "error" && state.limited;
  const unavailable = (state.kind === "error" && !state.limited) || data?.freshness === "unavailable";
  const showResults = loading || (data !== null && !unavailable);

  return (
    <section aria-label={`Live evidence search for: ${actionTitle}`} className="flex w-full flex-col gap-2">
      {/* A secondary action: the action's own checked source comes first. */}
      <Button
        type="button"
        variant="outline"
        onClick={run}
        disabled={loading}
        aria-expanded={state.kind !== "idle"}
        aria-controls={panelId}
        className="w-fit text-[0.8125rem]"
      >
        <Search aria-hidden strokeWidth={1.75} className="size-4" />
        {state.kind === "idle" ? "Find more evidence live" : loading ? "Searching…" : "Search again"}
      </Button>

      <div id={panelId} className="empty:hidden">
        {showResults && (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-input bg-muted/40 p-4">
            <LiveMark result={data} />
            {data?.freshness === "stale-cache" && data.message && (
              <p className="text-sm text-muted-foreground">{data.message}</p>
            )}
            <div className="border-t border-border pt-3">
              {loading && <LoadingRows label="Searching for more evidence with Exa" rows={2} />}
              {data && data.items.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing found for this action.</p>
              )}
              {data && data.items.length > 0 && <ResultList items={data.items} />}
            </div>
          </div>
        )}
        {limited && (
          <p role="status" className="rounded-lg border border-input bg-muted px-4 py-3 text-sm text-foreground">
            {TOO_MANY}
          </p>
        )}
        {unavailable && <Unavailable />}
      </div>
    </section>
  );
}
