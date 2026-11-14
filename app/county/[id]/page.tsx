import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountyBrief } from "@/components/brief/county-brief";
import { CountyNews } from "@/components/exa/county-news";
import { LimitationsBox, type LimitationItem } from "@/components/pathway/limitations-box";
import { buildPathwaySteps } from "@/components/pathway/pathway-steps";
import { RecordingNote } from "@/components/pathway/recording-note";
import { PathwayStrip } from "@/components/pathway/pathway-strip";
import { buildStepTabs } from "@/components/pathway/step-panels";
import { PrintButton, Reveal } from "@/components/motion";
import { StepUnit } from "@/components/stat/step-unit";
import { HUS_FULL, shortReason } from "@/components/pathway/wording";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { getBottleneck, pickActions } from "@/lib/act";
import { getAreaSteps } from "@/lib/plan-model";
import { getMainReason } from "@/lib/main-reason";
import { counties, gaps, getCounty, getValue, LATEST_YEAR, type County } from "@/lib/data";
import {
  formatPct,
  getIndicator,
  getNationalValue,
  getStageGap,
  getTrend,
  GP_WAIT_ID,
  REFERRAL_ID,
  REFERRAL_LATE_ID,
  stageStatus,
  YEARS,
} from "@/lib/ranking";
import { describeVisitChange, getRecordedVisitChange, RECORDING_CHANGE_ABOVE } from "@/lib/recording";

// Counties are a fixed, known set, so a blocking route is fine here.
export const instant = false;

export function generateStaticParams() {
  return counties.map((county) => ({ id: county.id }));
}

export async function generateMetadata({ params }: PageProps<"/county/[id]">): Promise<Metadata> {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) return {};
  const title = getBottleneck(county.id).anyRed ? "where care is delayed" : "where the pathway stands";
  return { title: `${county.name}: ${title} | FirstLine` };
}

export default async function CountyPathwayPage({ params }: PageProps<"/county/[id]">) {
  const { id } = await params;
  const county = getCounty(id);
  if (!county) notFound();

  const limitations = buildLimitations(county);
  const bottleneck = getBottleneck(county.id);
  // The verdict is the main reason sentence, the same one as on the home card; the step it is
  // about is flagged as the main delay, so the two always agree.
  const reason = getMainReason(county.id);
  const reasonStage = bottleneck.anyRed ? (reason.gap?.stage ?? null) : null;
  const steps = getAreaSteps(county.id);
  // Each step's trend (2023-2025), from the same builder the old tabs used.
  const trends = new Map(buildStepTabs(county.id, buildPathwaySteps(county.id)).map((tab) => [tab.id, tab.aside]));
  const actions = pickActions(bottleneck);
  const planHref = `/county/${county.id}/plan?actions=${actions.map((action) => action.id).join(",")}`;

  return (
    <main className="page-container flex flex-col gap-12 pt-4 sm:gap-16 sm:pt-6">
      <header className="flex flex-col items-start gap-4">
        <Breadcrumb items={[{ label: "Areas", href: "/" }, { label: county.name }]} />
        <p className="type-eyebrow">{county.name_fi}</p>
        <h1 className="type-display">{county.name}</h1>
        <p className="type-lede max-w-[62ch] text-pretty text-foreground">{shortReason(reason)}</p>
        {reason.caveat && <RecordingNote caveat={reason.caveat} className="max-w-[62ch]" />}
        <div data-print="hide" className="flex flex-wrap gap-2.5 pt-1">
          <Link href={`/county/${county.id}/act`} className={buttonVariants({ size: "lg" })}>
            {bottleneck.anyRed ? "See what to do" : "Actions to keep this level"}
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Link>
          <Link href={planHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Make the action plan for the board
          </Link>
          <PrintButton size="lg" />
        </div>
      </header>

      <section aria-labelledby="steps-heading" className="flex flex-col gap-5">
        <Reveal className="flex flex-col gap-2">
          <p className="type-eyebrow">The first three steps, {LATEST_YEAR}</p>
          <h2 id="steps-heading" className="type-title">
            {bottleneck.anyRed ? "Where care is delayed" : "Where the pathway stands"}
          </h2>
          <p className="max-w-[68ch] text-base text-muted-foreground">
            Each step compared with Finland&apos;s level. The colours compare with Finland, not with a clinical standard.
          </p>
        </Reveal>
        <div className="grid gap-3 lg:grid-cols-3">
          {steps.map((step, i) => (
            <StepUnit key={step.stage} step={step} index={i} flag={step.stage === reasonStage ? "The main delay" : undefined}>
              {trends.get(step.stage) ? <div className="pt-1">{trends.get(step.stage)}</div> : null}
            </StepUnit>
          ))}
        </div>
      </section>

      <section aria-labelledby="limits-heading" className="flex flex-col gap-4">
        <Reveal className="flex flex-col gap-2">
          <p className="type-eyebrow">Read before you use these figures</p>
          <h2 id="limits-heading" className="type-title">
            What these figures cannot tell you
          </h2>
        </Reveal>
        <LimitationsBox items={limitations} visibleCount={4} />
      </section>

      <PathwayStrip countyId={county.id} />

      <CountyBrief countyId={county.id} />
      <CountyNews key={county.id} countyId={county.id} />
    </main>
  );
}

/** A short bold line per indicator limitation; the indicator's own text is the detail. */
const INDICATOR_TITLE: Record<string, string> = {
  [GP_WAIT_ID]: "GP wait: all visits, not only cancer",
  [REFERRAL_ID]: "Referrals: start of assessment only",
  [REFERRAL_LATE_ID]: "Over 21 days: context only",
};

/** The one grey line of each indicator limitation (twelve words or fewer); the full text is behind the chevron. */
const INDICATOR_SHORT: Record<string, string> = {
  [GP_WAIT_ID]: "Counts all non-urgent GP appointments, not only possible cancer.",
  [REFERRAL_ID]: "Measures when assessment starts, not when a specialist is seen.",
  [REFERRAL_LATE_ID]: "Whole percentages of 0-3% everywhere, so it barely separates counties.",
};

/** The first "HUS" of a text, spelled out. */
const spellHus = (text: string) =>
  text.includes("the HUS-wide value")
    ? text.replace("the HUS-wide value", `one value for ${HUS_FULL}`)
    : text.replace(/\bHUS\b(?! \()/, HUS_FULL);

function buildLimitations(county: County): LimitationItem[] {
  const items: LimitationItem[] = [];

  for (const indicatorId of [GP_WAIT_ID, REFERRAL_ID, REFERRAL_LATE_ID]) {
    const indicator = getIndicator(indicatorId);
    if (indicator) {
      items.push({
        title: INDICATOR_TITLE[indicatorId] ?? indicator.short_name,
        short: INDICATOR_SHORT[indicatorId] ?? indicator.short_name,
        text: spellHus(indicator.limitation),
        sourceId: indicator.source_id,
      });
    }
  }

  // The GP wait is a share of recorded visits; where that base moved a lot, say so (one line).
  const visitChange = getRecordedVisitChange(county.id);
  if (visitChange !== null && Math.abs(visitChange) > RECORDING_CHANGE_ABOVE) {
    items.push({
      title: "Recorded visits changed a lot",
      short: `Recorded visits ${describeVisitChange(visitChange)} since 2023; a rise may be partly recording.`,
      text: `The GP wait is a share of the visits recorded with waiting-time data. Recorded visits here ${describeVisitChange(visitChange)} between 2023 and 2025, more than ${Math.round(RECORDING_CHANGE_ABOVE * 100)}%, so part of a change in the share may be how visits are recorded, not how long visits waited. The share is shown as published.`,
      sourceId: `sotkanet-${GP_WAIT_ID}`,
    });
  }

  items.push({
    title: "Public health centres only",
    short: "Occupational and private doctors' visits are not in the GP wait.",
    text: "Visits to occupational or private doctors are not in the GP wait. In a Finnish study of lymphoma patients, those who started in public primary care waited a median 127 days from symptoms to treatment, against 76 days for private or occupational care.",
    sourceId: "kuitunen-2026",
  });

  // How many working-age visits skip that public queue (context only, Sotkanet 2371 vs 293).
  const occupational = getValue(county.id, "2371");
  const publicVisits = getValue(county.id, "293");
  const occupationalFinland = getValue("finland", "2371");
  const publicFinland = getValue("finland", "293");
  if (occupational && publicVisits && occupationalFinland && publicFinland) {
    const n = (value: number) => Math.round(value).toLocaleString("en-GB");
    items.push({
      title: "Many working-age visits skip the public queue",
      short: "Many working-age visits happen outside the public queue.",
      text: `Working-age people (15-64) in ${county.name} made ${n(occupational.value)} occupational-health doctor visits per 1,000 residents in ${occupational.year}, against ${n(publicVisits.value)} public primary-care doctor visits (Finland ${n(occupationalFinland.value)} and ${n(publicFinland.value)}). These are visits, not people. People over 64, who are most cancer patients, are not in these numbers.`,
      sourceId: "sotkanet-2371",
    });
  }

  // Cancer stage by county is not published; 5-year relative survival is (context only,
  // Sotkanet 3627 bowel, 3625 breast). Latest year is 2024. No comparison wording on purpose.
  const bowel = getValue(county.id, "3627", 2024);
  const breast = getValue(county.id, "3625", 2024);
  const bowelFinland = getValue("finland", "3627", 2024);
  const breastFinland = getValue("finland", "3625", 2024);
  if (bowel && breast && bowelFinland && breastFinland) {
    items.push({
      title: "Survival mixes early finding with treatment",
      short: "Cancer stage by county is not published; small counties vary.",
      text: `5-year relative survival here was ${bowel.value}% for bowel cancer and ${breast.value}% for breast cancer (Finland ${bowelFinland.value}% and ${breastFinland.value}%), for patients diagnosed ${bowel.year - 9}-${bowel.year}. Cancer stage by county is not published. Small counties vary from year to year.`,
      sourceId: "sotkanet-3627",
    });
  }

  items.push({
    id: "step-2",
    title: "Step 2 has no public indicator",
    short: "Nothing measures GP recognition of possible cancer in Finland.",
    text: "GP recognition of possible cancer is not measured anywhere in Finland, so step 2 is grey for every area. One candidate would be the share of cancers first found through an emergency visit.",
  });

  const shared = getStageGap(county.id, "referral")?.shared;
  const husWide = gaps.find((gap) => gap.shared)?.shared;
  if (shared) {
    items.push({
      id: "referral",
      title: "The referral figure is not this area's own",
      short: "One shared hospital-district figure covers four areas.",
      text: `${shared.name} handles hospital referrals from East, Central and West Uusimaa and Vantaa and Kerava, and THL publishes one ${shared.name}-wide number for them. So the step stays grey and is not used to rank or to pick actions. The link is the ${shared.name} report we used to check the number.`,
      sourceId: shared.confirmed_by,
    });
  } else if (stageStatus(county.id, "referral") === "no_data") {
    items.push({
      id: "referral",
      title: "No referral data for this area",
      short: "No county-level referral data is published here.",
      text: `Sotkanet publishes no county-level referral data for ${county.name}, so we cannot say whether referrals here are fast or slow.`,
    });
  } else {
    const referralYears = getTrend(county.id, REFERRAL_ID)
      .filter((point) => point.value !== null)
      .map((point) => point.year);
    if (referralYears.length > 0 && referralYears.length < YEARS.length) {
      items.push({
        title: "Referral trend is incomplete",
        short: "Some years have no published referral value.",
        text: `${county.name} has referral values for ${referralYears.join(", ")} only.`,
      });
    }
    if (county.id === "helsinki" && husWide) {
      items.push({
        title: "Helsinki's referral figure: city units only",
        short: "The figure covers the city's own units; most referrals go to HUS.",
        text: `Most hospital referrals from Helsinki go to ${HUS_FULL}, which processed ${formatPct(husWide.value)} within 3 days in ${LATEST_YEAR}.`,
        sourceId: "sotkanet-13",
      });
    }
  }

  const nationalGpWait = getNationalValue(GP_WAIT_ID);
  items.push({
    title: "At or better than Finland's level does not mean good",
    short: "Finland's level is itself a delay.",
    text: `Finland's level is itself a delay${
      nationalGpWait
        ? `: ${formatPct(nationalGpWait.value)} of non-urgent GP visits nationally come more than a week after the need for care was assessed`
        : ""
    }.`,
  });
  items.push({
    title: "Colours compare with Finland, not a target",
    short: "Colours compare with Finland; they are not a clinical standard.",
    text: `They compare this area's ${LATEST_YEAR} value with Finland's ${LATEST_YEAR} value on the same indicator. They are not a clinical standard.`,
  });

  return items;
}
