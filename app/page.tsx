import { AskBox } from "@/components/exa/ask-box";
import { NationalNews } from "@/components/exa/national-news";
import { EarlyWarning } from "@/components/home/early-warning";
import { HomeTool } from "@/components/home/home-tool";
import { RankingList } from "@/components/ranking/ranking-list";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
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

  return (
    <main className="page-container flex flex-col gap-6 pt-3 sm:pt-6">
      {/* A short headline, then the tool: pick an area, see where its pathway breaks and what to
          do first. The ranking is further down, for comparing. */}
      <header className="flex flex-col gap-1.5">
        <p className="flex items-center gap-2.5 text-sm leading-6 font-medium text-foreground sm:text-[0.9375rem]">
          <span aria-hidden className="h-4 w-0.5 shrink-0 bg-foreground" />
          First step to early cancer care: getting to a GP
        </p>
        <h1 className="type-display text-[1.75rem] text-foreground sm:text-[2.25rem] lg:text-[2.375rem]">
          In Finland, where you live decides how fast you get to see a GP
        </h1>
      </header>

      <HomeTool rows={rows} unranked={unranked} />

      <EarlyWarning
        areas={[...rows.map((row) => row.county), ...unranked]}
        sourceId={nationalGpWait.source_id}
      />

      <Frame id="ranking" aria-labelledby="ranking-heading" className="scroll-mt-4">
        <FrameHeader>
          <FrameTitle id="ranking-heading" className="type-title">
            Compare all {totalAreas} areas
          </FrameTitle>
          <FrameDescription className="max-w-none">
            Longest GP waits first. 21 wellbeing services counties and the City of Helsinki. Select
            an area to see where its delay sits.
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
            </span>
          </p>
        </FrameFooter>
      </Frame>

      <AskBox />

      <NationalNews />
    </main>
  );
}
