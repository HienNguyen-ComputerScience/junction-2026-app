import type { Metadata } from "next";
import { Suspense } from "react";

import { EarlyWarning } from "@/components/insights/early-warning";
import { Goal3Link } from "@/components/insights/goal3-link";
import { GradingRules } from "@/components/insights/grading-rules";
import { NoWayRound } from "@/components/insights/no-way-round";
import { PathwayRow } from "@/components/insights/pathway-row";
import { StarterDataset, StarterDownload } from "@/components/insights/starter-dataset";
import { PrintButton } from "@/components/motion";
import { countBaseChange, noWayRound, pathwayAreas } from "@/lib/insights";

export const metadata: Metadata = {
  title: "What the data shows, and what to start counting | FirstLine",
  description:
    "Where a long GP wait meets few other routes to a doctor, how far to trust each figure, the whole cancer pathway for one area, early warnings, and a starter dataset a county can keep.",
};

const DEFAULT_AREA = noWayRound.robust_areas[0] ?? pathwayAreas[0].id;

async function areaFrom(searchParams: PageProps<"/insights">["searchParams"]): Promise<string> {
  const { area } = await searchParams;
  return typeof area === "string" && pathwayAreas.some((a) => a.id === area) ? area : DEFAULT_AREA;
}

/** The area picker: a plain form, so it works without script and the address can be shared. */
function AreaPicker({ selected }: { selected: string }) {
  return (
    <form action="/insights#pathway" method="get" className="flex flex-wrap items-end gap-3" data-print="hide">
      <label className="flex flex-col gap-1.5 text-base font-semibold text-forest-ink">
        Choose an area
        <select
          name="area"
          defaultValue={selected}
          className="min-h-11 min-w-[16rem] rounded-lg border border-input bg-cream-paper px-3 text-base font-normal text-charcoal"
        >
          {pathwayAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-lg border border-forest-ink bg-cream-paper px-4 py-2 text-base font-semibold text-forest-ink outline-none hover:bg-mint-veil focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Show this area&apos;s pathway
      </button>
    </form>
  );
}

async function PathwaySection({ searchParams }: { searchParams: PageProps<"/insights">["searchParams"] }) {
  const area = await areaFrom(searchParams);
  return (
    <>
      <AreaPicker selected={area} />
      <PathwayRow areaId={area} />
    </>
  );
}

/**
 * /insights: the data side of FirstLine on one page, most important first: where people have no
 * way round the GP queue; the starter dataset; how far to trust each figure; the whole pathway for
 * one area; early warnings. Every component here is self-contained for use on other pages
 * (docs/audit/insights/contract.md).
 */
export default function InsightsPage({ searchParams }: PageProps<"/insights">) {
  const gpBase = countBaseChange("6411", 2023, 2025);
  return (
    <main className="page-container flex flex-col gap-16 pt-4 pb-16 sm:pt-6">
      <header className="flex max-w-[60rem] flex-col gap-4">
        <p className="type-eyebrow">What the public data shows</p>
        <h1 className="type-page">Where getting to a doctor is hardest, and what to start counting</h1>
        <p className="type-lede text-pretty">
          Five findings from published Finnish statistics, each with its source and a plain grade for how far to trust it.
          None of them is about individual patients, and most are not about cancer alone: Finland publishes very little
          on the cancer pathway by area. The second section is the answer to that gap.
        </p>
        <nav aria-label="On this page" className="flex flex-col gap-2 text-base">
          <p className="font-semibold">On this page</p>
          <ol className="flex list-decimal flex-col gap-1 pl-6">
            <li><a className="text-forest-ink underline underline-offset-4" href="#no-way-round-heading">A long wait for a GP, and few other ways to see a doctor</a></li>
            <li><a className="text-forest-ink underline underline-offset-4" href="#starter-dataset">A starter dataset for your own cancer pathway</a></li>
            <li><a className="text-forest-ink underline underline-offset-4" href="#grades-heading">How far to trust each number</a></li>
            <li><a className="text-forest-ink underline underline-offset-4" href="#pathway">The whole pathway for one area</a></li>
            <li><a className="text-forest-ink underline underline-offset-4" href="#early-warning-heading">What has got worse</a></li>
            <li><a className="text-forest-ink underline underline-offset-4" href="#goal3-heading">The national cancer strategy&apos;s Goal 3</a></li>
          </ol>
        </nav>
        <div className="flex flex-wrap gap-3">
          <PrintButton />
          <StarterDownload />
        </div>
      </header>

      <NoWayRound />

      <StarterDataset />

      <section aria-labelledby="grades-heading" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow">Confidence grade</p>
          <h2 id="grades-heading" className="type-title scroll-mt-20">
            How far to trust each number
          </h2>
        </div>
        <p className="max-w-[60rem] text-base text-pretty">
          Every figure on this page carries a small label: Solid, Read with care (or Read the trend with care), Shared
          hospital value, or No public data, with one sentence saying why. The grades come from fixed rules, applied the
          same way to every area and year. For the GP wait, the rules matter most: the number of visits behind the
          figure changed by more than a fifth between 2023 and 2025 in {gpBase.changed} of {gpBase.compared} areas.
        </p>
        <GradingRules />
      </section>

      <section id="pathway" aria-label="The whole pathway for one area" className="flex scroll-mt-20 flex-col gap-5">
        <p className="type-eyebrow">The whole pathway in one row</p>
        <Suspense fallback={<p className="text-base">Loading the area…</p>}>
          <PathwaySection searchParams={searchParams} />
        </Suspense>
      </section>

      <EarlyWarning />

      <Goal3Link />
    </main>
  );
}
