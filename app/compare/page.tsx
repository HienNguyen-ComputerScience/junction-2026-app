import type { Metadata } from "next";

import { EarlyWarning } from "@/components/home/early-warning";
import { HUS_FULL } from "@/components/pathway/wording";
import { RankingList } from "@/components/ranking/ranking-list";
import { Disclosure } from "@/components/ui/disclosure";
import { FramePanel } from "@/components/ui/frame";
import { BarKey } from "@/components/ui/measure-bar";
import { TextLink } from "@/components/ui/text-link";
import { getNationalValue, getRanking, getUnrankedCounties, GP_WAIT_ID, REFERRAL_ID } from "@/lib/ranking";

export const metadata: Metadata = { title: "Compare all 22 areas | FirstLine" };

/** The ranking of every area by the longest GP waits, then the areas getting worse fastest. */
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
      <div className="flex flex-col items-start gap-1">
        <h1 className="type-page">Compare all {totalAreas} areas</h1>
        <TextLink kind="jump" href="#worsening-heading">
          Getting worse fastest
        </TextLink>
      </div>

      <section aria-labelledby="ranking-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="ranking-heading" className="type-title">
            Longest GP waits
          </h2>
          <p className="max-w-[52rem] type-caption text-pretty text-muted-foreground">
            Areas ranked by the share of non-urgent GP visits waiting over 7 days. Click an area for its pathway.
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <BarKey items={["finland", "red", "amber"]} />
          {/* The rest of the marks, and the two labels that need a word of explanation. */}
          <Disclosure
            summary={`More marks: ${HUS_FULL}, City units only, no public data`}
            summaryClassName="text-[0.75rem] font-normal text-muted-foreground"
          >
            <div className="flex flex-col gap-2 pb-2 pl-[1.375rem]">
              <BarKey items={["short", "shared", "no_data"]} />
              <p className="max-w-[40rem] type-note text-pretty text-muted-foreground">
                &ldquo;HUS-wide&rdquo; is one shared figure for four Uusimaa areas. &ldquo;City units only&rdquo; means
                Helsinki&apos;s own units; most of its referrals go to HUS.
              </p>
            </div>
          </Disclosure>
        </div>
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

      <section aria-labelledby="worsening-heading" className="flex flex-col gap-3">
        <h2 id="worsening-heading" className="type-title scroll-mt-20">
          Getting worse fastest
        </h2>
        <EarlyWarning areas={[...rows.map((row) => row.county), ...unranked]} sourceId={nationalGpWait.source_id} />
      </section>
    </main>
  );
}
