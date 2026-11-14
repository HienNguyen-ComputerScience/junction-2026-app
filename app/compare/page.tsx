import type { Metadata } from "next";

import { EarlyWarning } from "@/components/home/early-warning";
import { RankingList } from "@/components/ranking/ranking-list";
import { FramePanel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { getNationalValue, getRanking, getUnrankedCounties, GP_WAIT_ID, REFERRAL_ID } from "@/lib/ranking";

export const metadata: Metadata = { title: "Compare all 22 areas | FirstLine" };

/** The areas getting worse fastest, then the ranking of every area by the longest GP waits. */
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
    <main className="page-container flex flex-col gap-8 pt-4 sm:pt-6">
      <h1 className="type-page">Compare all {totalAreas} areas</h1>

      <section aria-labelledby="worsening-heading" className="flex flex-col gap-3">
        <h2 id="worsening-heading" className="type-title">
          Getting worse fastest
        </h2>
        <EarlyWarning areas={[...rows.map((row) => row.county), ...unranked]} sourceId={nationalGpWait.source_id} />
      </section>

      <section aria-labelledby="ranking-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="ranking-heading" className="type-title">
            Longest GP waits
          </h2>
          <p className="max-w-[52rem] type-caption text-pretty text-muted-foreground">
            Areas ranked by the share of non-urgent GP visits waiting over 7 days. Click an area for its pathway.
          </p>
        </div>
        <BarKey items={["finland", "red", "short", "amber", "shared", "no_data"]} />
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
      </section>
    </main>
  );
}
