import { SourceChip } from "@/components/source-chip";
import { getValue } from "@/lib/data";
import { formatValue } from "@/lib/insights";

/**
 * Which published figure stands in for Goal 3 of the national cancer strategy today, and what
 * replaces it once the starter dataset exists. Wording checked against the strategy (p. 5, p. 33)
 * and the roadmap (measure 3.1.2, p. 57).
 */
export function Goal3Link({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby="goal3-heading" className="flex flex-col gap-5 rounded-[14px] bg-keylime-wash p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="type-eyebrow">National cancer strategy, Goal 3</p>
        <Heading id="goal3-heading" className="type-title">
          &ldquo;Ensure equal and effective cancer care&rdquo;: what stands in for it today
        </Heading>
      </div>
      <Goal3Detail />
    </section>
  );
}

/** Goal 3's three measures, the stand-in today and what replaces it, without a heading or frame. */
export function Goal3Detail() {
  const referral = getValue("finland", "13", 2025);
  return (
    <div className="flex max-w-[60rem] flex-col gap-3 text-base">
      <p className="text-pretty">
        The strategy follows Goal 3 with three measures: five-year survival of the cancers with the poorest outlook
        reaches the Nordic level; cancer deaths fall by 10%; and patients reach care within the target times. The last
        is also the measure of roadmap action 3.1.2. None of the three is published by wellbeing services county.
      </p>
      <div className="flex flex-wrap gap-2">
        <SourceChip sourceId="stm-cancer-strategy-2026-2035" />
        <SourceChip sourceId="ev-files-kansallinen-syopastrategia-toimeenpanon-tiekartta-2" />
      </div>
      <p className="text-pretty">
        <span className="font-semibold">Stand-in today:</span> the share of hospital referrals processed within 3 days
        (Sotkanet 13; Finland overall:{" "}
        <span className="figure">{referral ? formatValue("13", referral.value) : "no value"}</span> in 2025). It is the
        only published, area-level timing figure after the GP, and it is the first step of the interval THL&apos;s
        guide follows (referral arrives → first treatment). It is not cancer-specific and stops before the patient is
        seen. Bowel and breast cancer survival are published by area, but they are not the poor-outlook cancers Goal 3
        names.
      </p>
      <div className="flex flex-wrap gap-2">
        <SourceChip sourceId="sotkanet-13" year={2025} />
        <SourceChip sourceId="thl-ohjaus-21-2016" />
      </div>
      <p className="text-pretty">
        <span className="font-semibold">Once the starter dataset exists:</span> the share of patients starting cancer
        treatment within 6 weeks of the referral (indicator I6 in the template) measures Goal 3 directly. When the national
        target times are set (due 2026–2028), they replace the 6-week line.
      </p>
    </div>
  );
}
