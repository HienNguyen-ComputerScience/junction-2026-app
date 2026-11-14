import type { Metadata } from "next";

import { EarlyWarning } from "@/components/home/early-warning";
import { HUS_FULL } from "@/components/pathway/wording";
import { RankingList } from "@/components/ranking/ranking-list";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { FrameFooter, FramePanel } from "@/components/ui/frame";
import {
  formatPct,
  getNationalValue,
  getRanking,
  getUnrankedCounties,
  GP_WAIT_ID,
  REFERRAL_ID,
} from "@/lib/ranking";

export const metadata: Metadata = { title: "Compare all 22 areas | FirstLine" };

/** The ranking of every area, moved off the home page: longest GP waits, and the areas getting worse fastest. */
export default function ComparePage() {
  const rows = getRanking();
  const unranked = getUnrankedCounties();
  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  const nationalReferral = getNationalValue(REFERRAL_ID);

  if (!nationalGpWait || !nationalReferral || rows.length === 0) {
    throw new Error("Snapshot is missing the national or county values for the ranking.");
  }

  const totalAreas = rows.length + unranked.length;

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:pt-6">
      <header className="flex flex-col gap-2">
        <h1 className="type-page">Compare all {totalAreas} areas</h1>
        <p className="max-w-[52rem] type-caption text-pretty text-muted-foreground">
          Referrals: &ldquo;HUS-wide&rdquo; is one shared figure from {HUS_FULL} for four Uusimaa areas;
          &ldquo;City units only&rdquo; means Helsinki&apos;s own units, while most of its referrals go to HUS.
        </p>
      </header>

      <section aria-label="Ranking of the areas" className="flex flex-col gap-2">
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
              Referrals: share processed within 3 days, higher is better; Finland {formatPct(nationalReferral.value)}{" "}
              (Sotkanet {REFERRAL_ID}). &ldquo;Worse&rdquo; means worse than Finland&apos;s level,
              &ldquo;Better&rdquo; at or better than Finland&apos;s level.
            </span>
          </p>
        </FrameFooter>
      </section>
    </main>
  );
}
