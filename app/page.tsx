import type { Metadata } from "next";
import { Suspense } from "react";

import { AskBox } from "@/components/exa/ask-box";
import { NationalNews } from "@/components/exa/national-news";
import { EarlyWarning } from "@/components/home/early-warning";
import { HomeTool } from "@/components/home/home-tool";
import { RankingList } from "@/components/ranking/ranking-list";
import { SourceChip } from "@/components/source-chip";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getCounty, LATEST_YEAR, type County } from "@/lib/data";
import {
  formatPct,
  getNationalValue,
  getRanking,
  getUnrankedCounties,
  GP_WAIT_ID,
  REFERRAL_ID,
  type RankingRow,
} from "@/lib/ranking";

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

export default function CountyRankingPage({ searchParams }: PageProps<"/">) {
  const rows = getRanking();
  const unranked = getUnrankedCounties();
  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  const nationalReferral = getNationalValue(REFERRAL_ID);

  if (!nationalGpWait || !nationalReferral || rows.length === 0) {
    throw new Error("Snapshot is missing the national or county values for the ranking.");
  }

  const totalAreas = rows.length + unranked.length;
  // The h1's two numbers: the shortest and the longest 2025 GP wait share across the areas.
  const waitValues = rows.map((row) => row.gpWait.value);
  const lowestWait = Math.min(...waitValues);
  const highestWait = Math.max(...waitValues);

  return (
    <main className="page-container flex flex-col gap-10 pt-3 sm:gap-14 sm:pt-6">
      {/* A short headline, then the tool: pick an area, see where its pathway breaks and what to
          do first. The ranking is further down, for comparing. */}
      <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="type-display text-[1.375rem] text-foreground sm:text-[1.75rem] lg:whitespace-nowrap">
          In Finland, your area decides how long a non-urgent GP visit waits
        </h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-base text-pretty text-muted-foreground">
          <span>
            From <span className="figure">{formatPct(lowestWait)}</span> to{" "}
            <span className="figure">{formatPct(highestWait)}</span> of non-urgent GP visits wait over 7 days,
            depending on the area
          </span>
          <SourceChip sourceId={nationalGpWait.source_id} year={LATEST_YEAR} />
        </p>
      </header>

      {/* The one request-time part: the server render of /?area=<id> already shows that area. The
          rest of the page is prerendered. */}
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
      </div>

      <EarlyWarning
        areas={[...rows.map((row) => row.county), ...unranked]}
        sourceId={nationalGpWait.source_id}
      />

      <Frame id="ranking" aria-labelledby="ranking-heading" className="scroll-mt-4">
        <FrameHeader>
          <FrameTitle id="ranking-heading" className="type-title">
            Compare all {totalAreas} areas
          </FrameTitle>
          <FrameDescription>
            Longest GP waits first. 21 wellbeing services counties and the City of Helsinki. Gaps to Finland are in percentage points (pts).
          </FrameDescription>
        </FrameHeader>
        <FramePanel padding="none">
          <RankingList
            rows={rows}
            unranked={unranked}
            nationalGpWait={nationalGpWait.value}
            nationalReferral={nationalReferral.value}
            gpWaitSourceId={nationalGpWait.source_id}
            referralSourceId={nationalReferral.source_id}
          />
        </FramePanel>
        {/* No key here: each group names its colour, each row its gap, and the column header
            the Finland line. The page has one key, under the map in the tool above. */}
        <FrameFooter>
          <p className="max-w-[52rem] text-pretty">
            Waits are counted from the day the need for care was assessed, for GP (physician)
            visits in primary care.
            <span className="lg:hidden">
              {" "}
              Referrals: the share processed within 3 days (Sotkanet {REFERRAL_ID}). Higher is
              faster; Finland {formatPct(nationalReferral.value)}.
            </span>{" "}
            HUS-wide: one shared figure for the hospital district (HUS) that serves these areas.
          </p>
        </FrameFooter>
      </Frame>

      <AskBox />

      <NationalNews />
    </main>
  );
}
