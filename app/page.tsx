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
 * Home: the guided briefing's opening as one composition. On a laptop the headline sits over the
 * area list and the Start button in the left column, with the briefing's step 1 for that area
 * beside them; on a phone they stack in that order. Under it, "Or look through the data
 * yourself" with the two places the nav doesn't name. The page is a grid, so the streamed tool's
 * parts take their own cells and the headline stays in the static shell.
 */
export default function HomePage({ searchParams }: PageProps<"/">) {
  const rows = getRanking();
  const unranked = getUnrankedCounties();

  if (rows.length === 0) {
    throw new Error("Snapshot is missing the county values for the home page.");
  }

  return (
    <main className="page-container grid gap-5 pt-3 sm:pt-6 lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:grid-rows-[auto_1fr_auto] lg:gap-x-8">
      <h1 className="type-page max-w-[34ch] lg:col-start-1 lg:row-start-1 lg:pt-1">
        In Finland, your area decides how long a <span className="whitespace-nowrap">non-urgent</span> GP visit
        waits
      </h1>

      {/* The one request-time part: the server render of /?area=<id> already shows that area. Until
          it lands (and for good without JavaScript) the static shell holds the whole tool for the
          default area, so the page is complete and the layout doesn't jump. */}
      <Suspense fallback={<HomeTool rows={rows} unranked={unranked} />}>
        <Tool searchParams={searchParams} rows={rows} unranked={unranked} />
      </Suspense>
    </main>
  );
}
