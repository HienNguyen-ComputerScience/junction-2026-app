import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CountyBrief } from "@/components/brief/county-brief";
import { CountyNews } from "@/components/exa/county-news";
import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { StageCard, StepRail, type StageCardProps } from "@/components/pathway/stage-card";
import { SourceChip } from "@/components/source-chip";
import { BackLink } from "@/components/ui/back-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Frame,
  FrameFooter,
  FrameHeader,
  FrameMeta,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { counties, getCounty, getValue, LATEST_YEAR, type County } from "@/lib/data";
import {
  formatPct,
  getIndicator,
  getNationalValue,
  getStageGap,
  getTrend,
  getVerdict,
  GP_WAIT_ID,
  REFERRAL_ID,
  REFERRAL_LATE_ID,
  stageStatus,
  YEARS,
} from "@/lib/ranking";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export default async function CountyPathwayPage({ params }: PageProps<"/county/[id]">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const stages = buildStages(county);
  const limitations = buildLimitations(county);
  const lateReferrals = getValue(county.id, REFERRAL_LATE_ID);
  const lateReferralsFinland = getNationalValue(REFERRAL_LATE_ID);

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:gap-8 sm:pt-6">
      {/* Desktop: title and verdict on the left, the limitations box beside them, so both are
          on the first screen. Phones: the box moves below the pathway so the key number
          comes first (the wrapper is display: contents there, and `order` places the box). */}
      <div className="contents lg:grid lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-start lg:gap-10">
        <header className="flex flex-col items-start gap-4">
          <BackLink href="/">Back to ranking</BackLink>
          <div className="flex flex-col gap-2">
            <p className="type-caption text-muted-foreground">
              Path to early cancer care · {county.name_fi}
            </p>
            <h1 className="type-page">{county.name}</h1>
          </div>
          <p className="max-w-[40rem] type-lede">{getVerdict(county.id)}</p>
          <Link href={`/county/${county.id}/act`} className={buttonVariants({ size: "lg" })}>
            What to do about it
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
        </header>

        <LimitationsBox items={limitations} className="max-lg:order-1" />
      </div>

      <Frame aria-labelledby="pathway-heading">
        <FrameHeader>
          <FrameTitle id="pathway-heading" className="type-title">
            The first steps, compared with Finland ({LATEST_YEAR})
          </FrameTitle>
          <FrameMeta className="hidden sm:flex">
            <span aria-hidden className="h-3.5 w-0.5 bg-foreground" />
            Line on each bar: Finland&apos;s value
          </FrameMeta>
        </FrameHeader>
        <FramePanel padding="none">
          <ol className="grid grid-cols-1 p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:px-0 md:py-6">
            {stages.map((stage, index) => (
              <li
                key={stage.title}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 md:flex md:flex-col md:gap-4"
              >
                <StepRail
                  step={stage.step}
                  status={stage.status}
                  first={index === 0}
                  last={index === stages.length - 1}
                />
                <div className={`md:flex-1 md:px-6 ${index === stages.length - 1 ? "" : "max-md:pb-8"}`}>
                  <StageCard {...stage} />
                </div>
              </li>
            ))}
          </ol>
        </FramePanel>
        <FrameFooter className="flex flex-col gap-2">
          <p>
            Bars start at 0%. The ink line marks Finland&apos;s value; the solid red part of a bar
            is the share beyond it.
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span>
              Context: referrals left unprocessed for more than 21 days in {LATEST_YEAR}:{" "}
              {lateReferrals ? `${lateReferrals.value}%` : "no public data"}
              {lateReferralsFinland ? ` (Finland ${lateReferralsFinland.value}%)` : ""}. Too small
              everywhere to tell counties apart, so it does not set any colour.
            </span>
            <SourceChip
              sourceId={lateReferrals?.source_id ?? lateReferralsFinland?.source_id ?? "sotkanet-5033"}
              year={LATEST_YEAR}
            />
          </p>
        </FrameFooter>
      </Frame>

      <div className="contents max-lg:*:order-2">
        <CountyBrief countyId={county.id} />
        <CountyNews key={county.id} countyId={county.id} />
      </div>
    </main>
  );
}

function buildStages(county: County): StageCardProps[] {
  const gpGap = getStageGap(county.id, "gp_access");
  const referralGap = getStageGap(county.id, "referral");

  return [
    {
      step: 1,
      title: "Getting to a GP",
      status: stageStatus(county.id, "gp_access"),
      measure: gpGap && {
        value: gpGap.value,
        nationalValue: gpGap.national_value,
        caption: "of non-urgent GP visits came more than 7 days after the need for care was assessed",
        note: gpGap.note,
        sourceId: gpGap.source_id,
        year: gpGap.year,
        trend: getTrend(county.id, GP_WAIT_ID).map(({ year, value }) => ({
          year,
          value: value?.value ?? null,
        })),
      },
    },
    {
      step: 2,
      title: "GP recognises warning signs",
      status: "no_data",
      emptyText:
        "No public statistic shows how often GPs spot possible cancer at the first visit, in any county. Nobody can see how this step performs. That blind spot is itself a finding.",
    },
    {
      step: 3,
      title: "GP to specialist referral",
      status: stageStatus(county.id, "referral"),
      measure: referralGap && {
        value: referralGap.value,
        nationalValue: referralGap.national_value,
        caption: "of referrals were processed within 3 days (higher is faster)",
        note: referralGap.note,
        sourceId: referralGap.source_id,
        year: referralGap.year,
        trend: getTrend(county.id, REFERRAL_ID).map(({ year, value }) => ({
          year,
          value: value?.value ?? null,
        })),
      },
    },
  ];
}

function buildLimitations(county: County): LimitationItem[] {
  const items: LimitationItem[] = [];

  for (const indicatorId of [GP_WAIT_ID, REFERRAL_ID, REFERRAL_LATE_ID]) {
    const indicator = getIndicator(indicatorId);
    if (indicator) {
      items.push({
        text: `${indicator.short_name}: ${indicator.limitation}`,
        sourceId: indicator.source_id,
      });
    }
  }

  items.push({
    text: "GP recognition of possible cancer has no public indicator, so step 2 is grey for every county.",
  });

  if (stageStatus(county.id, "referral") === "no_data") {
    items.push({
      text: `Sotkanet publishes no county-level referral data for ${county.name}, so its referral step is grey. We cannot say whether referrals here are fast or slow.`,
    });
  } else {
    const referralYears = getTrend(county.id, REFERRAL_ID)
      .filter((point) => point.value !== null)
      .map((point) => point.year);
    if (referralYears.length > 0 && referralYears.length < YEARS.length) {
      items.push({
        text: `${county.name} has referral values for ${referralYears.join(", ")} only, so the referral trend is incomplete.`,
      });
    }
  }

  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  items.push({
    text: `Amber does not mean good. It means at or better than Finland's level, and Finland's level is itself a delay${
      nationalGpWait
        ? `: ${formatPct(nationalGpWait.value)} of non-urgent GP visits nationally come more than a week after the need for care was assessed`
        : ""
    }.`,
  });
  items.push({
    text: `Colours compare this area's ${LATEST_YEAR} value with Finland's ${LATEST_YEAR} value on the same indicator. They are not a target or a clinical standard.`,
  });

  return items;
}
