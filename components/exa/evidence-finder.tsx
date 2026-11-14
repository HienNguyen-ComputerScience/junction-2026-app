"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { LoadingRows, ResultList, Unavailable } from "./result-list";
import { isItemsResponse, STATUS_LABEL, TOO_MANY, type ItemsResponse } from "./types";

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

  const data = state.kind === "done" ? state.data : null;
  const limited = state.kind === "error" && state.limited;
  const unavailable = (state.kind === "error" && !state.limited) || data?.freshness === "unavailable";

  return (
    <section aria-label={`Live evidence search for: ${actionTitle}`} className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={run}
          disabled={state.kind === "loading"}
          aria-expanded={state.kind !== "idle"}
          aria-controls={panelId}
        >
          {state.kind === "idle" ? "Find more evidence live" : state.kind === "loading" ? "Searching…" : "Search again"}
        </Button>
        {state.kind !== "idle" && (
          <>
            <Badge variant="secondary">Found live — unverified</Badge>
            <span className="text-xs text-muted-foreground">via Exa</span>
          </>
        )}
        {data && !unavailable && <Badge variant="outline">{STATUS_LABEL[data.freshness]}</Badge>}
      </div>
      <div id={panelId}>
        {state.kind === "loading" && <LoadingRows label="Searching for more evidence with Exa" rows={2} />}
        {limited && <p role="status" className="text-sm text-muted-foreground">{TOO_MANY}</p>}
        {unavailable && <Unavailable />}
        {data && !unavailable && (
          <div className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              Not checked by the team, unlike this action&apos;s own source. Read before relying on it.
            </p>
            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing found.</p>
            ) : (
              <ResultList items={data.items} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
