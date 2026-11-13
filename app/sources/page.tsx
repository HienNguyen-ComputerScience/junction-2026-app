import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sources & limitations | FirstLine" };

const indicators = [
  { id: 6411, title: "Getting to a GP", measure: "Non-urgent primary-care physician visits waiting more than 7 days, % of appointments kept", year: "2025 in the FirstLine brief; county snapshot pending", scope: "All qualifying non-urgent visits, not cancer-specific visits. Only visits with waiting-time data are included." },
  { id: 13, title: "Referral processed quickly", measure: "Specialist-care referrals processed within 3 days, % of referrals received", year: "County year and values pending snapshot", scope: "Receipt to processing of a referral, not time to a specialist appointment or treatment." },
  { id: 5033, title: "Referral processing delay", measure: "Specialist-care referrals processed after more than 21 days, % of referrals received", year: "County year and values pending snapshot", scope: "Provider-based referrals, not a cancer-specific patient pathway. Emergency referrals are excluded." },
] as const;

export default function SourcesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">County ranking</Link>
        <span aria-hidden="true" className="mx-2"> / </span><span aria-current="page">Sources &amp; limitations</span>
      </nav>
      <header className="max-w-2xl space-y-4">
        <Badge variant="secondary">How to read FirstLine</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sources &amp; limitations</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">These public county indicators show access and referral processing, not a measured cancer journey.</p>
      </header>
      <section aria-labelledby="essential-caveat" className="mt-10 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <h2 id="essential-caveat" className="text-lg font-semibold">The essential distinction</h2>
        <p className="mt-2 leading-relaxed">THL Sotkanet 6411 (2025 in our brief) covers <strong>all non-urgent physician visits with waiting-time data</strong>, not people with suspected cancer. GP waiting time is a proxy for access, not a cancer diagnosis or referral delay. The referral indicators describe processing of specialist referrals generally, not the whole GP-to-specialist journey.</p>
      </section>
      <section aria-labelledby="indicator-sources" className="mt-12">
        <h2 id="indicator-sources" className="text-2xl font-semibold">The public indicators</h2>
        <p className="mt-2 text-muted-foreground">Publisher: Finnish Institute for Health and Welfare (THL), Sotkanet. Links open the official definitions.</p>
        <div className="mt-5 grid gap-4">
          {indicators.map((indicator) => (
            <article key={indicator.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">{indicator.title}</h3><Badge variant="outline">THL Sotkanet · {indicator.id}</Badge></div>
              <p className="mt-3">{indicator.measure}</p>
              <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Year:</strong> {indicator.year}</p>
              <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Scope:</strong> {indicator.scope}</p>
              <a className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-muted-foreground" href={"https://sotkanet.fi/rest/1.1/indicators/" + indicator.id} target="_blank" rel="noopener noreferrer">Official THL definition ↗</a>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="gaps" className="mt-12 rounded-xl bg-muted p-6">
        <h2 id="gaps" className="text-2xl font-semibold">What the map cannot tell you</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
          <li>No indicator here follows a person from first symptoms through GP assessment, cancer diagnosis and specialist treatment.</li>
          <li>Referral processing does not establish when a patient saw a specialist, whether cancer was suspected, or why a delay occurred.</li>
          <li>GP recognition of warning signs and choice of tests are not quantified here. Missing evidence stays “no public data,” not a low-risk score.</li>
          <li>County comparisons are descriptive, not causal. They cannot predict an individual prognosis or prove the effect of an intervention.</li>
        </ul>
      </section>
      <section aria-labelledby="evidence" className="mt-12 space-y-3">
        <h2 id="evidence" className="text-2xl font-semibold">Actions and live evidence</h2>
        <p className="leading-relaxed text-muted-foreground">Recommended actions need a checked precedent and linked source. The evidence table is still being assembled. Exa results are found live and unverified; a search result is not proof an intervention works in a Finnish county. The red-flag helper is decision support, not a diagnosis or substitute for local clinical guidance.</p>
      </section>
      <div className="mt-10"><Link href="/" className={buttonVariants({ variant: "outline" })}>Back to county ranking</Link></div>
    </main>
  );
}
