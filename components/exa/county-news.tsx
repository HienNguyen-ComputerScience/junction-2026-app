"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoadingRows, ResultList, Unavailable } from "./result-list";
import { isItemsResponse, STATUS_LABEL, statusText, type ItemsResponse } from "./types";

type State = { kind: "loading" } | { kind: "done"; data: ItemsResponse } | { kind: "error" };

// Loads on mount: the route answers in about a second (fast search, cached for a while),
// so a "Search live" button would only add a click to the demo.
export function CountyNews({ countyId }: { countyId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/county-news?county=${encodeURIComponent(countyId)}`, { signal: ctrl.signal })
      .then(async (res) => {
        const json: unknown = await res.json();
        setState(res.ok && isItemsResponse(json) ? { kind: "done", data: json } : { kind: "error" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error" });
      });
    return () => ctrl.abort();
  }, [countyId]);

  const data = state.kind === "done" ? state.data : null;
  const unavailable = state.kind === "error" || data?.freshness === "unavailable";

  return (
    <Card aria-labelledby="county-news-title" className="min-h-48">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle id="county-news-title">Last 12 months</CardTitle>
          <Badge variant="secondary">Found live — unverified</Badge>
          <span className="text-xs text-muted-foreground">via Exa</span>
          {data && !unavailable && <Badge variant="outline">{statusText(data)}</Badge>}
          {unavailable && <Badge variant="outline">{STATUS_LABEL.unavailable}</Badge>}
        </div>
        <CardDescription>Finnish news and county pages about access to a doctor. Not checked by the team.</CardDescription>
      </CardHeader>
      <CardContent>
        {state.kind === "loading" && <LoadingRows label="Searching local news with Exa" />}
        {unavailable && <Unavailable />}
        {data && !unavailable && data.items.length === 0 && (
          <p className="text-sm text-muted-foreground">No news found for this county in the last 12 months.</p>
        )}
        {data && !unavailable && data.items.length > 0 && <ResultList items={data.items} />}
      </CardContent>
    </Card>
  );
}
