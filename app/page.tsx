import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeTool } from "@/components/home/home-tool";
import { getCounty, type County } from "@/lib/data";
import { getRanking, getUnrankedCounties, type RankingRow } from "@/lib/ranking";

/** ?area= as a single id, or undefined. HomeTool ignores ids that are not one of the areas. */
async function areaFrom(searchParams: PageProps<"/">["searchParams"]): Promise<string | undefined> {
  const { area } = await searchParams;
  return typeof area === "string" ? area : undefined;
}

// A shared link /?area=<id> names its area in the tab title. No (or an unknown) area keeps the
// site title. Reading searchParams makes this request-time, so it streams with the tool below.
export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const county = getCounty((await areaFrom(searchParams)) ?? "");
  return county ? { title: `${county.name} · FirstLine` } : {};
}

/** The tool for the area the URL names: the one part of the page that waits for the request. */
async function Tool({
  searchParams,
  rows,
  unranked,
}: {
  searchParams: PageProps<"/">["searchParams"];
  rows: RankingRow[];
  unranked: County[];
}) {
  return <HomeTool rows={rows} unranked={unranked} initialAreaId={await areaFrom(searchParams)} />;
}

/**
 * Home: the headline and one composed block, the picker and the map on the left and the answer
 * for the chosen area on the right. The ranking of all areas is on /compare, the actions and the
 * what-if on the act page, the question box and the news on /ask.
 */
export default function HomePage({ searchParams }: PageProps<"/">) {
  const rows = getRanking();
  const unranked = getUnrankedCounties();

  if (rows.length === 0) {
    throw new Error("Snapshot is missing the county values for the home page.");
  }

  return (
    <main className="page-container flex flex-col gap-5 pt-3 sm:pt-6">
      <h1 className="type-display text-[1.375rem] text-foreground sm:text-[1.75rem] lg:whitespace-nowrap">
        In Finland, your area decides how long a non-urgent GP visit waits
      </h1>

      {/* The one request-time part: the server render of /?area=<id> already shows that area. */}
      <Suspense
        fallback={
          <div
            aria-busy
            className="min-h-[36rem] rounded-panel border border-border bg-card p-6 type-caption text-muted-foreground"
          >
            Loading the areas…
          </div>
        }
      >
        <Tool searchParams={searchParams} rows={rows} unranked={unranked} />
      </Suspense>
    </main>
  );
}
