import { Disclosure } from "@/components/motion";
import { GradeGlyph } from "@/components/insights/confidence-badge";
import { INDICATOR_NAME, rules } from "@/lib/insights";

/**
 * "How we grade this number": a labelled button that opens the grading rules in place.
 * The rules are read from data/insights/rules.json, the same file the build script applies.
 */
export function GradingRules({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Disclosure show="How we grade this number" hide="Hide how we grade this number" defaultOpen={defaultOpen}>
      <GradingRulesBody />
    </Disclosure>
  );
}

/** The rules themselves, without the button (for a page that shows them open). */
export function GradingRulesBody() {
  return (
    <div className="flex max-w-[60rem] flex-col gap-5 rounded-[14px] bg-keylime-wash p-6 sm:p-7">
      <div className="flex flex-col gap-3">
        <h3 className="type-heading text-forest-ink">The four grades</h3>
        <ul className="flex flex-col gap-3">
          {rules.levels.map((level) => (
            <li key={level.level} className="flex items-start gap-3 text-base">
              <span className="mt-0.5 inline-flex min-w-[13.5rem] items-center gap-2 font-semibold text-forest-ink">
                <GradeGlyph level={level.level} />
                {level.label}
                <span className="sr-only">(shown as a {level.shape})</span>
              </span>
              <span className="text-pretty">{level.meaning}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="type-heading text-forest-ink">The rules, tried in this order</h3>
        <p className="text-base text-pretty">
          The first rule that fits a figure sets its grade; any other rule that also fits is listed with it.
        </p>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-base">
          {rules.grade_rules.map((rule) => (
            <li key={rule.id} className="text-pretty">
              <span className="font-semibold text-forest-ink">{rule.label}.</span> {rule.rule}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="type-heading text-forest-ink">What each figure covers</h3>
        <p className="text-base text-pretty">
          These go with every grade. They describe what the figure counts, not how reliable it is.
        </p>
        <ul className="flex flex-col gap-1.5 text-base">
          {Object.entries(rules.scope).map(([id, scope]) => (
            <li key={id} className="text-pretty">
              <span className="font-semibold">{INDICATOR_NAME[id] ?? id}</span> (Sotkanet {id}): {scope}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
