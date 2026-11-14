import { NextResponse, type NextRequest } from "next/server";

import { writeAnswer, type Answer } from "@/lib/exa/answer";
import { askTtl, shouldCacheAsk, type AskTtl } from "@/lib/exa/ask-cache";
import { cacheGet, cacheSet, search, simulateOutage, isoDaysAgo, type Freshness, type Item } from "@/lib/exa/client";
import { ASK_DOMAINS, ASK_EXAMPLES, COUNTIES, GOV_FI, TTL } from "@/lib/exa/config";
import { demoCacheGet } from "@/lib/exa/demo-cache";
import { rateLimit } from "@/lib/exa/rate-limit";
import { detectCounty, filterRelevant, isOnTopic, namesOtherCountry } from "@/lib/exa/relevance";

// POST /api/ask  { "question": "..." }
// Answers only from Exa results. Each answer sentence cites items by 1-based index;
// unsupported sentences are dropped by the validator. Otherwise: a clean "nothing found".
// Relevance (lib/exa/relevance.ts):
//   - off-topic questions (no health-care term, no known area) → nothingFound, no Exa call;
//   - a named area (fi/en, e.g. "Vantaa", "Kainuussa", "Espoo") → that county's query terms and
//     domains, last 12 months only;
//   - other questions → health-care domains only, framed "Finland, health care";
//   - results with no topic term and no question word are dropped; none left → nothingFound.
// Order: 400s and the off-topic gate (free), then the answer cache (free), then the rate limit, so
// only requests that will search (and maybe call Claude) count. The venue shares one IP; a room of
// judges clicking the same example chips must never see a 429.
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
  /** Optional: YYYY-MM-DD when served from a cache. */
  retrievedAt?: string;
  /** Set only on the off-topic gate reply: no search ran, so the UI hides the freshness badge. */
  offTopic?: true;
};

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
  const scope = county ? { county: { id: county.id, name: county.name } } : {};

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
    return NextResponse.json({ ...cached.value, freshness: "cache", retrievedAt: cached.retrievedAt });
  }
  const stale = () =>
    cached && NextResponse.json({ ...cached.value, freshness: "stale-cache", retrievedAt: cached.retrievedAt });

  // Counted only from here on: this request will search, and may call Claude.
  const limited = rateLimit(request, "ask");
  if (limited) return stale() ?? limited;

  const since = isoDaysAgo(365);
  const result = county
    ? await search(
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
      )
    : await search(
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
      );

  const reply = (r: Omit<AskResponse, "question" | "freshness">) => {
    const response: AskResponse = {
      question,
      freshness: result.freshness,
      ...scope,
      ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
      ...r,
    };
    if (shouldCacheAsk(result.freshness, r)) cacheSet(cacheKey, response, pin);
    return NextResponse.json(response);
  };

  // Exa is down: serve the expired answer if there is one, rather than paying Claude again per click.
  if (result.freshness === "unavailable" || result.freshness === "stale-cache") {
    const old = stale();
    if (old) return old;
  }
  if (result.freshness === "unavailable") {
    const saved = demoCacheGet("ask", key);
    if (saved) {
      return NextResponse.json({
        question,
        items: saved.items,
        answer: null,
        nothingFound: false,
        message: `Live search unavailable. Showing saved sources from ${saved.retrievedAt}, without a written answer.`,
        freshness: "stale-cache",
        retrievedAt: saved.retrievedAt,
        ...scope,
      } satisfies AskResponse);
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

  const written = await writeAnswer(question, items);
  switch (written.status) {
    case "answered":
      return reply({ items, answer: written.answer, nothingFound: false });
    case "nothing-found":
      return reply({ items, answer: null, nothingFound: true, message: "Nothing found in the sources." });
    case "unavailable":
      console.warn(`[ask] answer unavailable: ${written.reason}`);
      return NextResponse.json({
        question,
        items,
        answer: null,
        nothingFound: false,
        message: "Sources only: the written answer is unavailable.",
        freshness: result.freshness,
        ...scope,
        ...(result.retrievedAt && { retrievedAt: result.retrievedAt }),
      } satisfies AskResponse);
  }
}
