import { NextResponse, type NextRequest } from "next/server";

import { writeAnswer, type Answer } from "@/lib/exa/answer";
import { askTtl, shouldCacheAsk, type AskTtl } from "@/lib/exa/ask-cache";
import {
  cacheGet,
  cacheSet,
  search,
  searchCached,
  simulateOutage,
  isoDaysAgo,
  type Freshness,
  type Item,
  type SearchOptions,
  type SearchRequest,
} from "@/lib/exa/client";
import { ASK_DOMAINS, ASK_EXAMPLES, COUNTIES, GOV_FI, TTL } from "@/lib/exa/config";
import { demoCacheGet } from "@/lib/exa/demo-cache";
import { clientIp, hit, limitedReply, type LimitedReply } from "@/lib/exa/rate-limit";
import { detectCounty, filterRelevant, isOnTopic, namesOtherCountry } from "@/lib/exa/relevance";
import { getMainReason, reasonLinks } from "@/lib/main-reason";

// POST /api/ask  { "question": "..." }
// Answers only from Exa results. Each answer sentence cites items by 1-based index;
// unsupported sentences are dropped by the validator. Otherwise: a clean "nothing found".
// Relevance (lib/exa/relevance.ts):
//   - off-topic questions (no health-care term, no known area) → nothingFound, no Exa call;
//   - a named area (fi/en, e.g. "Vantaa", "Kainuussa", "Espoo") → that county's query terms and
//     domains, last 12 months only;
//   - other questions → health-care domains only, framed "Finland, health care";
//   - results with no topic term and no question word are dropped; none left → nothingFound.
// Order: 400s and the off-topic gate (free), then the answer cache (free), then the in-flight merge
// (free), then the work. The venue shares one IP; a room of judges clicking the same example chips
// must never see a 429.
// Rate limit: a request is counted only just before it spends, at most once: before a live Exa search
// (search-cache miss), else before the Claude call. A search-cache hit that leaves nothing to answer
// spends nothing and is not counted. Limited at either step: the expired cached answer if there is
// one, else the 429.
// In-flight merge: identical asks (same normalised question) arriving while one is being computed
// await that computation and get its outcome as their own response (header `x-ask-shared: 1`); only
// the first (the leader) is counted and spends, so if the leader is limited they all are. Per server
// instance, like the cache and the limiter: on Vercel each instance merges only its own requests.
// Simulated-outage requests bypass the merge.
// Cache: answers keep TTL.ask (24 h); every nothing-found keeps TTL.askNothingFound (5 min) and then
// re-runs the search too; "unavailable" is never cached (lib/exa/ask-cache.ts).

const MAX_QUESTION = 300;
const RECENCY = /\b(now|current(ly)?|latest|today|this (week|month|year)|recent(ly)?|nyt|nykyään|tällä hetkellä|uusin|uusimmat|viime aikoina)\b/i;
const AREAS = [...COUNTIES.values()];
const normalise = (q: string) => q.toLowerCase().replace(/\s+/g, " ").trim();
const PINNED = new Set(ASK_EXAMPLES.map(normalise));
const ASK_TTL: AskTtl = { answer: TTL.ask, nothingFound: TTL.askNothingFound };

type AskResponse = {
  question: string;
  items: Item[];
  answer: Answer | null;
  nothingFound: boolean;
  message?: string;
  freshness: Freshness;
  /** Optional: the area the question was scoped to. */
  county?: { id: string; name: string };
  /** Optional, with `county`: the area's main reason sentence from the snapshot, and its source links. */
  mainReason?: { text: string; sources: { label: string; url: string }[] };
  /** Optional: YYYY-MM-DD when served from a cache. */
  retrievedAt?: string;
  /** Set only on the off-topic gate reply: no search ran, so the UI hides the freshness badge. */
  offTopic?: true;
  /** Sentences the checker removed because their numbers weren't in the cited source. */
  dropped?: number;
};

/**
 * What a computation produces, as plain data: a Response body is single-use, so each merged request
 * builds its own response from this.
 */
type Outcome = { body: AskResponse | LimitedReply["body"]; init?: { status: number; headers: Record<string, string> } };

/** Computations in progress, by answer-cache key. Per server instance (see the header comment). */
const inflight = new Map<string, Promise<Outcome>>();

const respond = (o: Outcome, shared = false) =>
  NextResponse.json(o.body, shared ? { ...o.init, headers: { ...o.init?.headers, "x-ask-shared": "1" } } : o.init);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send JSON: { \"question\": \"...\" }" }, { status: 400 });
  }
  const raw = typeof body === "object" && body !== null && "question" in body ? body.question : undefined;
  const question = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim().slice(0, MAX_QUESTION) : "";
  if (!/\p{L}{3,}/u.test(question)) {
    return NextResponse.json({ error: "Type a question." }, { status: 400 });
  }

  const countyId = detectCounty(question, AREAS);
  const county = countyId ? COUNTIES.get(countyId) : undefined;
  // A named area: its main reason sentence from the snapshot (data, not search) goes with every
  // reply for it, separate from `answer`, so the checker never sees it and it survives an outage.
  const reason = county ? getMainReason(county.id) : null;
  const scope = county
    ? {
        county: { id: county.id, name: county.name },
        ...(reason && reason.kind !== "no_data" && { mainReason: { text: reason.text, sources: reasonLinks(reason) } }),
      }
    : {};

  // Off-topic or junk: answer "nothing found" without spending an Exa call.
  if (!isOnTopic(question, countyId)) {
    return NextResponse.json({
      question,
      items: [],
      answer: null,
      nothingFound: true,
      message: "Ask about health care in Finland, for example GP waits or cancer care.",
      freshness: "live",
      offTopic: true,
    } satisfies AskResponse);
  }

  const outage = simulateOutage(request);
  const key = normalise(question);
  const pin = PINNED.has(key);
  const cacheKey = `ask:${key}`;
  const cached = cacheGet<AskResponse>(cacheKey, TTL.ask);
  // The TTL depends on what the entry holds (answer vs nothing-found), so it is applied here.
  const ttlMs = cached ? askTtl(cached.value, ASK_TTL) : TTL.ask;
  if (cached && cached.ageMs < ttlMs) {
    return NextResponse.json({ ...cached.value, ...scope, freshness: "cache", retrievedAt: cached.retrievedAt });
  }
  if (outage) return respond(await compute());
  const running = inflight.get(cacheKey);
  if (running) return respond(await running, true);
  // Set synchronously after the cache lookup (no await in between), so concurrent duplicates find it.
  const computation = compute();
  inflight.set(cacheKey, computation);
  try {
    return respond(await computation);
  } finally {
    // Always cleared once settled (answer, nothing-found, unavailable, limited or a thrown error), so a
    // failure never wedges a question: the next ask starts a new computation.
    inflight.delete(cacheKey);
  }

  async function compute(): Promise<Outcome> {
    // Only an expired *answer* is worth serving again. An expired nothing-found may have come from an
    // older prompt or thinner sources: never re-serve it, so the request falls through to the saved
    // demo sources (outage) or the 429 (limited).
    const stale = (): Outcome | null =>
      cached && !cached.value.nothingFound ? { body: { ...cached.value, ...scope, freshness: "stale-cache", retrievedAt: cached.retrievedAt } } : null;

    // Counts this request once, just before it first spends. Returns what to send if over the limit.
    let counted = false;
    const overLimit = (): Outcome | null => {
      if (counted) return null;
      counted = true;
      const retryAfter = hit("ask", clientIp(request));
      return retryAfter === null ? null : (stale() ?? limitedReply(retryAfter));
    };

    const since = isoDaysAgo(365);
    const [searchBody, searchOpts]: [SearchRequest, SearchOptions] = county
      ? [
          {
            // The question keeps its meaning; the county's Finnish query terms pull local sources.
            query: `${question} — ${county.query}`,
            type: "auto",
            numResults: 6,
            userLocation: "FI",
            startPublishedDate: since,
            includeDomains: [...new Set([...county.includeDomains, ...GOV_FI])],
            contents: { highlights: { maxCharacters: 800 } },
          },
          { ttlMs, simulateOutage: outage, snippetChars: 800, cacheKey: `askq:${county.id}:${key}`, pin },
        ]
      : [
          {
            // Keep retrieval on topic: "GP queue in Kainuu" alone returns gaming sites (probe F4).
            query: `${question} — ${namesOtherCountry(question) ? "health care" : "Finland, health care"}`,
            type: "auto",
            numResults: 6,
            userLocation: "FI",
            includeDomains: ASK_DOMAINS,
            contents: { highlights: { maxCharacters: 800 } },
          },
          { ttlMs, simulateOutage: outage, snippetChars: 800, cacheKey: `askq:${key}`, pin },
        ];
    // A live Exa call spends: count it now (a simulated outage counts too: the call is attempted).
    if (!searchCached(searchBody, searchOpts)) {
      const limited = overLimit();
      if (limited) return limited;
    }
    const result = await search(searchBody, searchOpts);

    const reply = (r: Omit<AskResponse, "question" | "freshness">): Outcome => {
      const response: AskResponse = {
        question,
        freshness: result.freshness,
        ...scope,
        ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
        ...r,
      };
      if (shouldCacheAsk(result.freshness, r)) cacheSet(cacheKey, response, pin);
      return { body: response };
    };

    // Exa is down: serve the expired answer if there is one, rather than paying Claude again per click.
    if (result.freshness === "unavailable" || result.freshness === "stale-cache") {
      const old = stale();
      if (old) return old;
    }
    if (result.freshness === "unavailable") {
      const saved = demoCacheGet("ask", key);
      if (saved) {
        const body: AskResponse = {
          question,
          items: saved.items,
          answer: null,
          nothingFound: false,
          message: `Live search unavailable. Showing saved sources from ${saved.retrievedAt}, without a written answer.`,
          freshness: "stale-cache",
          retrievedAt: saved.retrievedAt,
          ...scope,
        };
        return { body };
      }
      return reply({ items: [], answer: null, nothingFound: false, message: "Live search unavailable." });
    }

    const items = filterRelevant(question, result.items, countyId);
    if (items.length === 0) {
      const message = county ? `Nothing found for ${county.name} in the last 12 months.` : "Nothing found.";
      return reply({ items: [], answer: null, nothingFound: true, message });
    }

    const twoYearsAgo = isoDaysAgo(730);
    if (!county && RECENCY.test(question) && !items.some((i) => i.publishedDate && i.publishedDate >= twoYearsAgo)) {
      return reply({ items, answer: null, nothingFound: true, message: "No recent results found." });
    }

    // The Claude call spends: count it now, unless the live search above was already counted.
    const limitedAtClaude = overLimit();
    if (limitedAtClaude) return limitedAtClaude;
    const written = await writeAnswer(question, items);
    switch (written.status) {
      case "answered":
        return reply({ items, answer: written.answer, nothingFound: false });
      case "nothing-found": {
        const n = written.dropped;
        if (n > 0) {
          const message = `The checker removed ${n} sentence${n === 1 ? "" : "s"} from the written answer: ${n === 1 ? "its numbers were" : "their numbers were"} not in the sources they cited. Read the sources below directly.`;
          return reply({ items, answer: null, nothingFound: true, dropped: n, message });
        }
        return reply({ items, answer: null, nothingFound: true, message: "Nothing found in the sources." });
      }
      case "unavailable":
        console.warn(`[ask] answer unavailable: ${written.reason}`);
        return {
          body: {
            question,
            items,
            answer: null,
            nothingFound: false,
            message: "Sources only: the written answer is unavailable.",
            freshness: result.freshness,
            ...scope,
            ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
          },
        };
    }
  }
}
