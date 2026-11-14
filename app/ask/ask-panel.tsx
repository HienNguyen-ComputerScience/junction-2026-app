"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CloseButton, LiveMark, LoadingRows, ResultList, Unavailable } from "@/components/exa/result-list";
import { isAskResponse, TOO_MANY, type AskResponse } from "@/components/exa/types";
import { Button } from "@/components/ui/button";

const MAX_QUESTION = 300;

/** The keylime card every unit on the page sits in (the /how-to-read and /sources card). */
export const ASK_CARD = "flex flex-col gap-5 rounded-[14px] border border-sage-mist bg-keylime-wash p-[21px] sm:p-7";

// `query` is what is sent to /api/ask and is the demo-cache key: never reword it.
// `label` is what the button and the input show; without one, the query itself is shown.
const EXAMPLES: { query: string; label?: string; fi?: boolean }[] = [
  {
    query: "How long do people wait to see a GP in Vantaa?",
    label: "How long is the wait for a non-urgent GP visit in Vantaa?",
  },
  { query: "Did Denmark's cancer fast-track pathways shorten diagnosis times?" },
  { query: "Onko Kainuussa lääkäripula?", fi: true },
];

const EMPTY = "Type a question about health care in Finland, or pick an example.";

/** A suggestion's display label maps back to its query, so the input can show the label. */
function toQuery(text: string): string {
  return EXAMPLES.find((ex) => ex.label === text)?.query ?? text;
}

/**
 * The dashboard sentence comes from the API. Comparisons on this site always name "Finland
 * overall"; this display guard covers a bare "above Finland" until the API wording changes.
 */
function finlandOverall(text: string): string {
  return text.replace(/\b(above|below|than) Finland\b(?! overall)/g, "$1 Finland overall");
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; data: AskResponse }
  | { kind: "error"; message: string };

/**
 * /ask: one card with the question box and three example questions, then the answer in a card
 * of its own. Same request, cache keys and honesty labels as the shared AskBox; laid out for the
 * page: a visible label, an Ask button that always answers, examples that step aside while an
 * answer is open so it sits right under the box, and focus moved to the answer when it lands.
 */
export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const ctrlRef = useRef<AbortController | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const loading = state.kind === "loading";

  useEffect(() => () => ctrlRef.current?.abort(), []);

  // When an answer (or a message) lands, take keyboard and screen-reader focus to it. While it
  // loads, only if focus was lost (the example button that started it has stepped aside).
  useEffect(() => {
    if (state.kind === "idle") return;
    const active = document.activeElement;
    if (state.kind !== "loading" || !active || active === document.body) headingRef.current?.focus();
  }, [state.kind]);

  function ask(text: string) {
    const q = toQuery(text.trim());
    if (loading) return;
    if (q.length < 3) {
      setState({ kind: "error", message: EMPTY });
      return;
    }
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
        else if (res.status === 400) setState({ kind: "error", message: EMPTY });
        else setState({ kind: "error", message: "" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ kind: "error", message: "" });
      });
  }

  function close() {
    ctrlRef.current?.abort();
    setState({ kind: "idle" });
  }

  const data = state.kind === "done" ? state.data : null;
  const unavailable = data?.freshness === "unavailable" || (state.kind === "error" && state.message === "");
  const answered = data?.answer && data.answer.sentences.length > 0;
  const reason = data?.mainReason && Array.isArray(data.mainReason.sources) ? data.mainReason : null;
  const open = state.kind !== "idle";

  return (
    <div className="flex flex-col gap-3">
      <section aria-label="Ask a question" className={ASK_CARD} data-needs-js>
        <form
          className="flex flex-col gap-3 print:hidden"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <label htmlFor="ask-input" className="type-heading text-forest-ink">
            Your question
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="ask-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={MAX_QUESTION}
              readOnly={loading}
              aria-busy={loading}
              placeholder="e.g. Is GP access improving in Kainuu?"
              autoComplete="off"
              className="h-13 w-full min-w-0 flex-1 rounded-lg border border-input bg-cream-paper px-4 text-base text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 read-only:opacity-70"
            />
            <Button type="submit" size="lg" className="h-13 px-6" aria-disabled={loading}>
              {loading ? "Searching…" : "Ask"}
              {!loading && <ArrowRight aria-hidden data-icon="inline-end" className="size-5" />}
            </Button>
          </div>
        </form>

        {!open && (
          <div className="flex flex-col gap-3">
            <h2 id="ask-examples" className="text-base font-semibold text-forest-ink">
              Or start with an example
            </h2>
            <ul aria-labelledby="ask-examples" className="flex flex-col items-start gap-2">
              {EXAMPLES.map((ex) => (
                <li key={ex.query} className="max-w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setQuestion(ex.label ?? ex.query);
                      ask(ex.query);
                    }}
                    className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-forest-ink/40 bg-cream-paper px-4 py-2 text-left text-base text-foreground transition-colors outline-none hover:border-forest-ink hover:bg-mint-veil focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="min-w-0 text-pretty">
                      {ex.label ?? ex.query}
                      {ex.fi ? <span className="text-muted-foreground"> (in Finnish)</span> : null}
                    </span>
                    <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-forest-ink" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {open && (
        <section aria-labelledby="ask-answer" aria-live="polite" className={`${ASK_CARD} print:hidden`}>
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <h2 id="ask-answer" ref={headingRef} tabIndex={-1} className="type-title text-forest-ink outline-none">
              {loading ? "Searching the web" : "Answer"}
            </h2>
            <div className="flex items-center gap-3">
              {data && !data.offTopic && <LiveMark result={data} className="hidden sm:flex" />}
              <CloseButton onClick={close} label={loading ? "Cancel the search" : "Close the answer"} />
            </div>
          </div>
          {data && !data.offTopic && <LiveMark result={data} className="-mt-2 sm:hidden" />}

          {loading && <LoadingRows label="Finding sources and writing a short answer from them" rows={2} />}
          {state.kind === "error" && state.message !== "" && <p className="text-base text-foreground">{state.message}</p>}

          {/* From the snapshot, not the search: shown first, and also when the live search is down. */}
          {reason && (
            <div className="flex flex-col gap-2 rounded-lg bg-cream-paper p-4 sm:p-5">
              <p className="type-eyebrow">
                Our dashboard{data?.county ? `, ${data.county.name}` : ""} · not from the web
              </p>
              <p className="text-base leading-relaxed text-pretty text-foreground">
                {finlandOverall(reason.text.replace(/^Main reason: /, ""))}
              </p>
              <p className="flex flex-wrap gap-2">
                {reason.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${source.label} (opens in a new tab)`}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-keylime-wash px-3 text-base whitespace-nowrap text-forest-ink transition-colors outline-none hover:border-forest-ink focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {source.label}
                    <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
                  </a>
                ))}
              </p>
            </div>
          )}

          {unavailable && <Unavailable />}

          {data && data.freshness !== "unavailable" && (
            <>
              {answered && data.answer && (
                <div className="flex flex-col gap-3 rounded-lg border border-dashed border-input p-4 sm:p-5">
                  <p className="type-eyebrow">Written by AI from the web sources below</p>
                  <p className="text-base leading-relaxed text-pretty text-foreground">
                    {data.answer.sentences.map((s, i) => (
                      <span key={i}>
                        {s.text}{" "}
                        {s.sources.map((n, j) =>
                          Number.isInteger(n) && n >= 1 && n <= data.items.length ? (
                            <a
                              key={`${n}-${j}`}
                              href={`#ask-src-${n}`}
                              aria-label={`Source ${n}`}
                              className="mr-1 rounded-sm font-semibold text-forest-ink tabular-nums underline decoration-forest-ink/40 underline-offset-2 outline-none hover:decoration-forest-ink focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              [{n}]
                            </a>
                          ) : (
                            <span key={`${n}-${j}`} className="mr-1 tabular-nums">
                              [{n}]
                            </span>
                          ),
                        )}{" "}
                      </span>
                    ))}
                  </p>
                  <p className="text-base text-pretty text-muted-foreground">
                    Read the sources before relying on it. Their numbers can measure something different from the
                    dashboard&apos;s (share of GP visits waiting more than 7 days).
                  </p>
                </div>
              )}

              {!answered && data.nothingFound && (
                <p className="text-base text-foreground">
                  {data.message?.startsWith("Nothing found") || (typeof data.dropped === "number" && data.dropped > 0)
                    ? data.message
                    : `Nothing found. ${data.message || "The live results did not answer this question."}`}
                </p>
              )}

              {!answered && !data.nothingFound && data.message && (
                <p className="text-base text-foreground">{data.message}</p>
              )}

              {data.items.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="type-heading text-forest-ink">Web sources</h3>
                  <ResultList items={data.items} numbered idPrefix="ask-src" />
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
