import { Download, ShieldCheck } from "lucide-react";

import { Disclosure, Reveal } from "@/components/motion";
import { SourceChip } from "@/components/source-chip";
import { buttonVariants } from "@/components/ui/button";
import { starterDataset } from "@/lib/insights";

export const STARTER_TEMPLATE_URL = "/api/insights/starter-template";

/** The download as a link that looks like a primary button: it says what it opens. */
export function StarterDownload({ label = "Download the Excel template (.xlsx)" }: { label?: string }) {
  return (
    <a
      href={STARTER_TEMPLATE_URL}
      download
      className={buttonVariants({ size: "lg", className: "h-auto max-w-full whitespace-normal text-left" })}
      data-print="hide"
    >
      <Download aria-hidden strokeWidth={1.75} data-icon="inline-start" />
      {label}
    </a>
  );
}

/**
 * The starter dataset: the counts a county can start keeping now so that, in six months, its own
 * cancer pathway is measurable. Each group of counts says which missing figure it closes, which
 * roadmap measure it supports and who publishes the same abroad. Aggregate counts only.
 */
export function StarterDataset({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const { sections, indicators, privacy, cancer_groups: groups } = starterDataset;
  const fieldCount = sections.reduce((n, s) => n + s.fields.length, 0);
  return (
    <section id="starter-dataset" aria-labelledby="starter-heading" className="flex scroll-mt-20 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="type-eyebrow">What to start recording</p>
        <Heading id="starter-heading" className="type-title">
          A starter dataset for your own cancer pathway
        </Heading>
      </div>
      <Reveal>
        <p className="max-w-[56rem] type-statement">
          Finland publishes nothing by area on how cancers are first found, how long diagnosis takes or when treatment
          starts. {fieldCount} quarterly counts, kept from now on, would let a county measure each of these within six
          months.
        </p>
      </Reveal>
      <div className="flex flex-col gap-4 rounded-[14px] bg-slate-hush p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 type-heading text-forest-ink">
          <ShieldCheck aria-hidden strokeWidth={1.75} className="size-5" />
          No patient data
        </p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-base">
          {privacy.map((p) => (
            <li key={p} className="text-pretty">
              {p}
            </li>
          ))}
        </ul>
        <p className="text-base text-pretty">
          One row per cancer group ({groups.length} rows: {groups.slice(0, -1).map((g) => g.split(" (")[0]).join(", ")} and
          the total), one sheet per quarter. The file also lists what each count means and what to calculate from it.
        </p>
        <div>
          <StarterDownload />
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {sections.map((s, i) => (
          <Reveal as="li" key={s.id} index={i} className="flex flex-col gap-4 rounded-[14px] bg-keylime-wash p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <p className="type-eyebrow">Counts {s.fields[0].id}–{s.fields[s.fields.length - 1].id}</p>
              <h3 className="type-heading text-forest-ink">{s.title}</h3>
            </div>
            <p className="max-w-[60rem] text-base text-pretty">{s.why}</p>
            <dl className="grid gap-x-6 gap-y-3 text-base md:grid-cols-[14rem_1fr]">
              <dt className="font-semibold">Missing figure it helps close</dt>
              <dd className="text-pretty">{s.data_gap?.missing}</dd>
              <dt className="font-semibold">National roadmap measure</dt>
              <dd className="text-pretty">
                {s.measure ? (
                  <>
                    {s.measure.id}: {s.measure.title} ({s.measure.pages})
                  </>
                ) : (
                  "None named in the roadmap."
                )}
              </dd>
              {s.basis ? (
                <>
                  <dt className="font-semibold">Finnish definition</dt>
                  <dd className="flex flex-col items-start gap-2 text-pretty">
                    {s.basis.text}
                    <SourceChip sourceId={s.basis.source_id} />
                  </dd>
                </>
              ) : null}
              {s.abroad ? (
                <>
                  <dt className="font-semibold">Published abroad</dt>
                  <dd className="flex flex-col items-start gap-2 text-pretty">
                    {s.abroad.text}
                    <SourceChip sourceId={s.abroad.source_id} />
                  </dd>
                </>
              ) : null}
            </dl>
            <Disclosure label={`the ${s.fields.length} counts in this group`} tone="quiet">
              <ul className="flex flex-col gap-2 text-base">
                {s.fields.map((f) => (
                  <li key={f.id} className="text-pretty">
                    <span className="font-semibold">
                      {f.id}. {f.header}
                    </span>
                    : {f.count}
                  </li>
                ))}
              </ul>
            </Disclosure>
          </Reveal>
        ))}
      </ol>

      <div className="flex flex-col gap-3">
        <h3 className="type-heading text-forest-ink">What the county can calculate from the counts</h3>
        <div className="relative w-full overflow-x-auto rounded-[14px] bg-cream-paper">
          <table className="w-full min-w-[44rem] border-collapse text-left text-base">
            <caption className="sr-only">Indicators the county can compute from the starter counts</caption>
            <thead>
              <tr className="border-b border-forest-ink/30">
                <th scope="col" className="px-4 py-2 font-semibold">Indicator</th>
                <th scope="col" className="px-4 py-2 font-semibold">How to calculate</th>
                <th scope="col" className="px-4 py-2 font-semibold">Compare with</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => (
                <tr key={ind.id} className="border-b border-border-mist align-top">
                  <th scope="row" className="px-4 py-3 font-semibold">
                    {ind.id}. {ind.name}
                  </th>
                  <td className="px-4 py-3 text-pretty">{ind.formula}</td>
                  <td className="flex flex-col items-start gap-2 px-4 py-3 text-pretty">
                    {ind.compare_with}
                    <SourceChip sourceId={ind.source_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
