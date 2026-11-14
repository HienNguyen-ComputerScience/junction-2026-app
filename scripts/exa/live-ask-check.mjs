// Live question set for "Ask the evidence" (POST /api/ask). Hits the network (Exa + Claude via the
// app), so it is NOT part of `npm test`. Run it against a local dev server or a deploy:
//
//   npm run exa:live-check                                   # http://localhost:3000
//   npm run exa:live-check -- https://firstline-finland.vercel.app
//   npm run exa:live-check -- http://localhost:3001 --only fi   # one group: area | fi | demo | board
//
// Pass rule, per question:
//   - HTTP 200 and not the off-topic gate;
//   - sources came back → a written answer with at least one sentence (never an empty answer);
//   - an area was detected and no sources came back → the area's main reason is still there.
// Exit code 1 if any question fails. Answers are cached by the server for 24 h, so a second run
// mostly re-reads the cache; 429s are waited out (the limit is per minute).

const argv = process.argv.slice(2);
const base = (argv.find((a) => /^https?:\/\//.test(a)) ?? "http://localhost:3000").replace(/\/$/, "");
const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

// One "why" question per area (English), as a judge would type it after looking at the map.
const AREA = [
  "Why is Central Finland red on the GP wait?",
  "Why are GP waits long in Central Ostrobothnia?",
  "Why did Central Uusimaa get worse since 2023?",
  "Why is East Uusimaa doing better than Finland?",
  "Why do Helsinki residents wait so long for a doctor?",
  "Why are referrals slow in Kainuu?",
  "Why is Kanta-Häme worse than Finland's level?",
  "Why are GP waits long in Kymenlaakso?",
  "Why is Lapland's GP wait so long?",
  "Why is North Karelia getting worse?",
  "Why are GP waits long in North Ostrobothnia?",
  "Why is North Savo red on the map?",
  "Why is Ostrobothnia worse than the benchmark?",
  "Why is Päijät-Häme the best area?",
  "Why are GP waits in Pirkanmaa worse than Finland?",
  "Why is Satakunta behind on GP access?",
  "Why is South Karelia red?",
  "Why is South Ostrobothnia had a huge spike in the benchmark",
  "Why is South Savo's GP wait long?",
  "Why are waits long in Southwest Finland?",
  "Why is the GP wait so long in Vantaa and Kerava?",
  "Why is West Uusimaa worse than Finland?",
];

// Finnish questions, the same kind a Finnish-speaking judge would ask.
const FI = [
  "Miksi Etelä-Pohjanmaalla lääkärille pääsy on huonontunut?",
  "Miksi Vantaalla joutuu odottamaan lääkäriä niin kauan?",
  "Miksi Helsingissä on pitkät jonot terveysasemille?",
  "Onko Kainuussa lääkäripula?",
];

// The demo's example chips (lib/exa/config.ts ASK_EXAMPLES) and the judge-test backups.
const DEMO = [
  "How long do people wait to see a GP in Vantaa?",
  "Did Denmark's cancer fast-track pathways shorten diagnosis times?",
  "Latest news on cancer care in Finland this week",
  "Does lung cancer detection differ between Finnish wellbeing services counties?",
];

// The board's 14 Nov live check (the ones not already above).
const BOARD = [
  "Why is South Ostrobothnia worse than before?",
  "Why are Kainuu referrals slow?",
  "Why is North Karelia worse than Finland?",
  "Why are there not enough doctors in Helsinki?",
];

const GROUPS = { area: AREA, fi: FI, demo: DEMO, board: BOARD };
const set = Object.entries(GROUPS)
  .filter(([g]) => !only || g === only)
  .flatMap(([g, qs]) => qs.map((q) => ({ group: g, q })));

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(question) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${base}/api/ask`, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ question }),
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after") ?? 60);
      process.stdout.write(`  (429, waiting ${wait}s)\n`);
      await pause((wait + 1) * 1000);
      continue;
    }
    return { status: res.status, json: await res.json().catch(() => null) };
  }
  return { status: 429, json: null };
}

function judge({ status, json }) {
  if (status !== 200 || !json) return `HTTP ${status}`;
  if (json.offTopic) return "off-topic gate (area or topic not recognised)";
  const items = Array.isArray(json.items) ? json.items.length : 0;
  const sentences = json.answer?.sentences?.length ?? 0;
  if (items > 0 && sentences === 0) return `empty answer with ${items} sources: ${json.message ?? ""}`;
  if (json.county && items === 0 && !json.mainReason) return "no sources and no main reason";
  if (items === 0 && !json.county) return `no sources: ${json.message ?? ""}`;
  return null;
}

console.log(`Live ask check against ${base}: ${set.length} questions\n`);
let passed = 0;
const failures = [];
for (const { group, q } of set) {
  const started = Date.now();
  const r = await ask(q);
  const fail = judge(r);
  const j = r.json ?? {};
  const info = `${j.freshness ?? "?"}, ${j.items?.length ?? 0} sources, ${j.answer?.sentences?.length ?? 0} sentences${j.answer?.dropped ? `, ${j.answer.dropped} dropped` : ""}${j.mainReason ? ", main reason" : ""}, ${((Date.now() - started) / 1000).toFixed(1)}s`;
  if (fail) failures.push({ group, q, fail });
  else passed++;
  console.log(`${fail ? "FAIL" : "pass"} [${group}] ${q}\n     ${fail ?? info}`);
}

console.log(`\n${passed}/${set.length} passed`);
for (const f of failures) console.log(`  FAIL [${f.group}] ${f.q}: ${f.fail}`);
process.exit(failures.length ? 1 : 0);
