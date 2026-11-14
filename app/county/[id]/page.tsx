import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CountyBrief } from "@/components/brief/county-brief";
import { CountyNews } from "@/components/exa/county-news";
import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { StageCard, StepRail, TrendStrip, type StageCardProps } from "@/components/pathway/stage-card";
import { SourceChip } from "@/components/source-chip";
import { STATUS_FIGURE, StatusBadge } from "@/components/ui/status-badge";
import { BackLink } from "@/components/ui/back-link";
import { BarKey } from "@/components/ui/measure-bar";
import { buttonVariants } from "@/components/ui/button";
import {
  Frame,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getBottleneck, STAGE_LABELS } from "@/lib/act";
import { counties, getCounty, getValue, LATEST_YEAR, type County, type Gap } from "@/lib/data";
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
  STATUS_LABEL,
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
  const keyGap = keyFigureGap(county);

  return (
    <main className="page-container flex flex-col gap-6 pt-4 sm:gap-8 sm:pt-6">
      {/* Desktop: title, verdict and the key figure on the left, the limitations box (quieter)
          beside them, so both are on the first screen. Below lg the limitations are a one-line
          disclosure right under the main action instead (the two are never displayed at the
          same width). */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_29rem] lg:items-start lg:gap-12">
        <header className="flex flex-col items-start gap-4 lg:gap-5">
          <BackLink href="/">Back to ranking</BackLink>
          <div className="flex flex-col gap-2">
            <p className="type-caption text-balance text-muted-foreground">
              Path to early cancer care
              <span className="max-sm:hidden"> · </span>
              <span className="max-sm:block">{county.name_fi}</span>
            </p>
            <h1 className="type-page lg:text-[2.75rem] lg:leading-[1.1]">{county.name}</h1>
          </div>
          <p className="max-w-[40rem] type-lede lg:max-w-[36rem] lg:text-[1.375rem] lg:leading-8">
            {getVerdict(county.id)}
          </p>
          {keyGap && <KeyFigure gap={keyGap} />}
          <Link href={`/county/${county.id}/act`} className={buttonVariants({ size: "lg" })}>
            What to do about it
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
          <LimitationsBox items={limitations} variant="disclosure" className="mt-2 w-full lg:hidden" />
        </header>

        <LimitationsBox items={limitations} className="max-lg:hidden" />
      </div>

      <Frame aria-labelledby="pathway-heading">
        <FrameHeader>
          <FrameTitle id="pathway-heading" className="type-title">
            The first steps, compared with Finland ({LATEST_YEAR})
          </FrameTitle>
        </FrameHeader>
        <FramePanel padding="none">
          <ol className="grid grid-cols-1 p-4 sm:p-6 lg:grid-cols-3 lg:gap-x-8 lg:pt-5 lg:pb-6">
            {stages.map((stage, index) => {
              const last = index === stages.length - 1;
              return (
                <li key={stage.title} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 lg:contents">
                  <StepRail step={stage.step} status={stage.status} last={last} />
                  <div className={`min-w-0 lg:contents ${last ? "" : "max-lg:pb-10"}`}>
                    <StageCard {...stage} last={last} />
                  </div>
                </li>
              );
            })}
          </ol>
          <TrendStrip stages={stages} areaName={county.name} />
        </FramePanel>
        <FrameFooter className="flex flex-col gap-3">
          <BarKey />
          {/* Same shape as a limitation row: the label on the left, the value and its source on the right. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-3">
            <p>Context, not used for colour: referrals unprocessed after 21 days in {LATEST_YEAR}</p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {lateReferrals ? (
                <span>
                  <span className="figure text-foreground">{lateReferrals.value}%</span> here
                </span>
              ) : (
                <span>no public data here</span>
              )}
              {lateReferralsFinland && (
                <span>
                  Finland <span className="figure text-foreground">{lateReferralsFinland.value}%</span>
                </span>
              )}
              <SourceChip
                sourceId={lateReferrals?.source_id ?? lateReferralsFinland?.source_id ?? "sotkanet-5033"}
                year={LATEST_YEAR}
              />
            </p>
          </div>
        </FrameFooter>
      </Frame>

      <CountyBrief countyId={county.id} />
      <CountyNews key={county.id} countyId={county.id} />
    </main>
  );
}

/** Finland's value for each year of the trend, from the same indicator (null where unpublished). */
function nationalTrend(indicatorId: string) {
  return YEARS.map((year) => ({ year, value: getNationalValue(indicatorId, year)?.value ?? null }));
}

const KEY_CAPTION: Record<Gap["stage"], string> = {
  gp_access: "of non-urgent GP visits waited more than 7 days",
  referral: "of referrals were processed within 3 days (higher is faster)",
  gp_recognition: "",
};

/**
 * The stage the first screen leads with: the worst measured stage when one is worse than
 * Finland, otherwise step 1 (getting to a GP) with its amber status.
 */
function keyFigureGap(county: County): Gap | null {
  const { focus, anyRed } = getBottleneck(county.id);
  const gp = getStageGap(county.id, "gp_access");
  const gap = anyRed ? focus[0] : gp && gp.value !== null ? gp : focus[0];
  return gap && gap.value !== null ? gap : null;
}

/** The first screen's one key number: the figure, its status and source, and what it counts. */
function KeyFigure({ gap }: { gap: Gap }) {
  if (gap.value === null) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className={`numeral text-[3.5rem] leading-none sm:text-[4rem] ${STATUS_FIGURE[gap.status]}`}>
          {formatPct(gap.value)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={gap.status} size="md">
            {STATUS_LABEL[gap.status]}
          </StatusBadge>
          <SourceChip sourceId={gap.source_id} year={gap.year} />
        </div>
      </div>
      <p className="text-sm text-pretty text-muted-foreground">
        {KEY_CAPTION[gap.stage]} · Finland <span className="figure">{formatPct(gap.national_value)}</span>
      </p>
    </div>
  );
}

function buildStages(county: County): StageCardProps[] {
  const gpGap = getStageGap(county.id, "gp_access");
  const referralGap = getStageGap(county.id, "referral");

  return [
    {
      step: 1,
      // Steps 2 and 3 take their names from lib/act; step 1 keeps the label the test checklist quotes.
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
        nationalTrend: nationalTrend(GP_WAIT_ID),
        direction: "lower is better",
      },
    },
    {
      step: 2,
      title: STAGE_LABELS.gp_recognition,
      status: "no_data",
      emptyText:
        "No public statistic shows how often GPs spot possible cancer at the first visit, in any county. Nobody can see how this step performs. That blind spot is itself a finding.",
    },
    {
      step: 3,
      title: STAGE_LABELS.referral,
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
        nationalTrend: nationalTrend(REFERRAL_ID),
        direction: "higher is faster",
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
    text: `At or better than Finland's level does not mean good. Finland's level is itself a delay${
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
