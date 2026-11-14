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
import { LATEST_YEAR } from "@/lib/data";
import {
  formatPct,
  getNationalValue,
  getRanking,
  getUnrankedCounties,
  GP_WAIT_ID,
  REFERRAL_ID,
} from "@/lib/ranking";

export default function CountyRankingPage() {
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

      <HomeTool rows={rows} unranked={unranked} />
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
