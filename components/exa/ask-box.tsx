"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoadingRows, ResultList, Unavailable } from "./result-list";
import { isAskResponse, statusText, TOO_MANY, type AskResponse } from "./types";

const MAX_QUESTION = 300;

const EXAMPLES = [
  "Did Denmark's cancer fast-track pathways shorten diagnosis times?",
  "How long do people wait to see a GP in Vantaa?",
  "Onko Kainuussa lääkäripula?",
];

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; data: AskResponse }
  | { kind: "error"; message: string };

export function AskBox() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const ctrlRef = useRef<AbortController | null>(null);
  const loading = state.kind === "loading";

  useEffect(() => () => ctrlRef.current?.abort(), []);

  function ask(text: string) {
    const q = text.trim();
    if (q.length < 3 || loading) return;
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setState({ kind: "loading" });
    fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: q }),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        const json: unknown = await res.json();
        if (res.ok && isAskResponse(json)) setState({ kind: "done", data: json });
        else if (res.status === 429) setState({ kind: "error", message: TOO_MANY });
        else if (res.status === 400) setState({ kind: "error", message: "Type a question about health care in Finland." });
        else setState({ kind: "error", message: "" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error", message: "" });
      });
  }

  const data = state.kind === "done" ? state.data : null;
  const unavailable = data?.freshness === "unavailable" || (state.kind === "error" && state.message === "");
  const answered = data?.answer && data.answer.sentences.length > 0;

  return (
    <Card aria-labelledby="ask-box-title">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle id="ask-box-title">Ask a question</CardTitle>
          <Badge variant="secondary">Found live — unverified</Badge>
          <span className="text-xs text-muted-foreground">via Exa</span>
        </div>
        <CardDescription>
          Answered only from live Exa search results, with a numbered source for every sentence. Decision support, not medical advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <label htmlFor="ask-box-input" className="sr-only">
            Your question about health care access in Finland
          </label>
          <input
            id="ask-box-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={MAX_QUESTION}
            disabled={loading}
            placeholder="e.g. Is GP access getting better in Kainuu this year?"
            autoComplete="off"
            className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          />
          <Button type="submit" disabled={loading || question.trim().length < 3}>
            {loading ? "Searching…" : "Ask"}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Example questions">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuestion(ex);
                ask(ex);
              }}
              className="rounded-full border px-3 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="min-h-24" aria-live="polite">
          {loading && <LoadingRows label="Searching and writing an answer from the results" rows={2} />}
          {state.kind === "error" && state.message !== "" && <p className="text-sm text-muted-foreground">{state.message}</p>}
          {unavailable && <Unavailable />}
          {data && data.freshness !== "unavailable" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {statusText(data) !== null && <Badge variant="outline">{statusText(data)}</Badge>}
                <span className="text-xs text-muted-foreground">Answered only from these Exa results.</span>
              </div>

              {answered && data.answer && (
                <div className="space-y-2 rounded-lg border border-dashed bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Not checked by the team. Written by AI from the live results below; read the sources before relying on it.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.answer.sentences.map((s, i) => (
                      <span key={i}>
                        {s.text}{" "}
                        {s.sources.map((n, j) => (
                          <sup key={`${n}-${j}`} className="mr-0.5">
                            {Number.isInteger(n) && n >= 1 && n <= data.items.length ? (
                              <a
                                href={`#ask-src-${n}`}
                                aria-label={`Source ${n}`}
                                className="text-primary underline-offset-2 hover:underline"
                              >
                                [{n}]
                              </a>
                            ) : (
                              <span>[{n}]</span>
                            )}
                          </sup>
                        ))}{" "}
                      </span>
                    ))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Numbers here come from the web sources cited and can measure something different from the dashboard&apos;s
                    indicators (share of GP visits waiting more than 7 days).
                  </p>
                </div>
              )}

              {!answered && data.nothingFound && (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  {data.message?.startsWith("Nothing found")
                    ? data.message
                    : `Nothing found. ${data.message || "The live results did not answer this question."}`}
                </p>
              )}

              {!answered && !data.nothingFound && data.message && (
                <p className="text-sm text-muted-foreground">{data.message}</p>
              )}

              {data.items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sources</h3>
                  <ResultList items={data.items} numbered idPrefix="ask-src" />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
