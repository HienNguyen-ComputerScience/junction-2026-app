import type { Metadata } from "next";
import { Suspense } from "react";

import { AskBox } from "@/components/exa/ask-box";
import { NationalNews } from "@/components/exa/national-news";
import { EarlyWarning } from "@/components/home/early-warning";
import { HomeTool } from "@/components/home/home-tool";
import { HUS_FULL } from "@/components/pathway/wording";
import { RankingList } from "@/components/ranking/ranking-list";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getCounty, type County } from "@/lib/data";
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

  return (
    <main className="page-container flex flex-col gap-10 pt-3 sm:gap-14 sm:pt-6">
      {/* A short headline, then the tool: pick an area, see where its pathway breaks and what to
          do first. The ranking is further down, for comparing. */}
      <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="type-display text-[1.375rem] text-foreground sm:text-[1.75rem] lg:whitespace-nowrap">
          In Finland, your area decides how long a non-urgent GP visit waits
        </h1>
        <p className="text-base text-pretty text-muted-foreground">
          For wellbeing services county directors: see where the path to early cancer care is slow, and what
          to do about it.
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

      <Frame id="ranking" aria-labelledby="ranking-heading" className="scroll-mt-4">
        <FrameHeader>
          <FrameTitle id="ranking-heading" className="type-title">
            Compare all {totalAreas} areas
          </FrameTitle>
          <FrameDescription>
            Four Uusimaa areas share one referral figure from {HUS_FULL}.
          </FrameDescription>
        </FrameHeader>
        <RankingTabs
          label="Order of the areas"
          tabs={[
            {
              id: "longest",
              label: "Longest GP waits",
              panel: (
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
              ),
            },
            {
              id: "worsening",
              label: "Getting worse fastest",
              panel: (
                <EarlyWarning
                  areas={[...rows.map((row) => row.county), ...unranked]}
                  sourceId={nationalGpWait.source_id}
                />
              ),
            },
          ]}
        />
        <FrameFooter>
          <p className="max-w-[52rem] text-pretty">
            Waits count from the day the need for care was assessed, in public primary care.
            <span className="lg:hidden">
              {" "}
              Referrals: share processed within 3 days, higher is better; Finland{" "}
              {formatPct(nationalReferral.value)} (Sotkanet {REFERRAL_ID}).
            </span>
          </p>
        </FrameFooter>
      </Frame>

      <AskBox />

      <NationalNews />
    </main>
  );
}
