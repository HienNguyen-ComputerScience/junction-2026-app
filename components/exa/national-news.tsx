"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoadingRows, ResultList, Unavailable } from "./result-list";
import { isItemsResponse, STATUS_LABEL, statusText, type ItemsResponse } from "./types";

type State = { kind: "loading" } | { kind: "done"; data: ItemsResponse } | { kind: "error" };

const MAX_ITEMS = 4;

// Compact national strip for the ranking page. Client-side fetch, so it never delays first render.
export function NationalNews() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/national-news", { signal: ctrl.signal })
      .then(async (res) => {
        const json: unknown = await res.json();
        setState(res.ok && isItemsResponse(json) ? { kind: "done", data: json } : { kind: "error" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error" });
      });
    return () => ctrl.abort();
  }, []);

  const data = state.kind === "done" ? state.data : null;
  const unavailable = state.kind === "error" || data?.freshness === "unavailable";

  return (
    <Card aria-labelledby="national-news-title" className="min-h-48">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle id="national-news-title">Finland, this month</CardTitle>
          <Badge variant="secondary">Found live — unverified</Badge>
          <span className="text-xs text-muted-foreground">via Exa</span>
          {data && !unavailable && <Badge variant="outline">{statusText(data)}</Badge>}
          {unavailable && <Badge variant="outline">{STATUS_LABEL.unavailable}</Badge>}
        </div>
        <CardDescription>
          Recent national news on the cancer care pathway. Not checked by the team.
          {data?.freshness === "stale-cache" && data.message ? ` ${data.message}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.kind === "loading" && <LoadingRows label="Searching national news with Exa" />}
        {unavailable && <Unavailable />}
        {data && !unavailable && data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">No national news found this month.</p>
        )}
        {data && !unavailable && data.items.length > 0 && <ResultList items={data.items.slice(0, MAX_ITEMS)} />}
      </CardContent>
    </Card>
  );
}
