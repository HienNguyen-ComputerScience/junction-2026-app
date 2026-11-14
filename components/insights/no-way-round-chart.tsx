import { formatValue, type NwrArea, noWayRound } from "@/lib/insights";

const W = 460;
const H = 340;
const PAD = { left: 52, right: 18, top: 18, bottom: 56 };

type Axis = { min: number; max: number; ticks: number[] };

function scale(axis: Axis, size: number, from: number) {
  return (v: number) => from + ((v - axis.min) / (axis.max - axis.min)) * size;
}

/**
 * One panel: the GP wait (up = longer) against the use of one other route (right = more use).
 * Finland's values are the two dashed lines, so the top-left corner is "long wait, little use".
 */
function Panel({
  title,
  xKey,
  xAxis,
  xLabel,
  formatX,
}: {
  title: string;
  xKey: "occupational" | "private";
  xAxis: Axis;
  xLabel: string;
  formatX: (v: number) => string;
}) {
  const yAxis: Axis = { min: 30, max: 90, ticks: [30, 45, 60, 75, 90] };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = scale(xAxis, plotW, PAD.left);
  const yRaw = scale(yAxis, plotH, 0);
  const y = (v: number) => PAD.top + plotH - yRaw(v);
  const fx = x(noWayRound.finland[xKey]);
  const fy = y(noWayRound.finland.wait);
  const areas = noWayRound.areas;
  const labelled = (a: NwrArea) => a.tier === "every";
  const summary = `${title}. Each dot is one area. Finland: GP wait ${formatValue("6411", noWayRound.finland.wait)}, ${xLabel.toLowerCase()} ${formatX(noWayRound.finland[xKey])}. The same figures are in the table below.`;

  return (
    <figure className="flex min-w-0 flex-1 flex-col gap-2">
      <figcaption className="type-heading text-forest-ink">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
        {/* the "long wait, little use" corner */}
        <rect x={PAD.left} y={PAD.top} width={fx - PAD.left} height={fy - PAD.top} fill="var(--color-keylime-wash)" />
        <text x={PAD.left + 6} y={PAD.top + 16} fontSize="13" fill="var(--color-forest-ink)">
          Longer wait, less use
        </text>
        {yAxis.ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-border-mist)" />
            <text x={PAD.left - 8} y={y(t) + 4} fontSize="12" textAnchor="end" fill="var(--color-charcoal)">
              {t}%
            </text>
          </g>
        ))}
        {xAxis.ticks.map((t) => (
          <text key={t} x={x(t)} y={H - PAD.bottom + 18} fontSize="12" textAnchor="middle" fill="var(--color-charcoal)">
            {formatX(t)}
          </text>
        ))}
        <text x={PAD.left + plotW / 2} y={H - 10} fontSize="13" textAnchor="middle" fill="var(--color-charcoal)">
          {xLabel} →
        </text>
        <text
          transform={`translate(14 ${PAD.top + plotH / 2}) rotate(-90)`}
          fontSize="13"
          textAnchor="middle"
          fill="var(--color-charcoal)"
        >
          GP visits waiting over 7 days →
        </text>
        {/* Finland */}
        <line x1={fx} x2={fx} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--color-forest-ink)" strokeDasharray="4 4" />
        <line x1={PAD.left} x2={W - PAD.right} y1={fy} y2={fy} stroke="var(--color-forest-ink)" strokeDasharray="4 4" />
        <text x={fx + 4} y={PAD.top + plotH - 6} fontSize="12" fill="var(--color-forest-ink)">
          Finland
        </text>
        {areas.map((a) => {
          const cx = x(a[xKey].value);
          const cy = y(a.wait.value);
          if (a.tier === "every")
            return <circle key={a.county_id} cx={cx} cy={cy} r={7} fill="var(--color-forest-ink)" />;
          if (a.group === "long-few")
            return (
              <circle key={a.county_id} cx={cx} cy={cy} r={6} fill="var(--color-cream-paper)" stroke="var(--color-forest-ink)" strokeWidth={2} />
            );
          return <circle key={a.county_id} cx={cx} cy={cy} r={4.5} fill="var(--color-status-amber-bar)" opacity={0.75} />;
        })}
        {areas.filter(labelled).map((a) => (
          <text
            key={`${a.county_id}-label`}
            x={x(a[xKey].value) - 11}
            y={y(a.wait.value) + 4}
            fontSize="13"
            fontWeight="600"
            textAnchor="end"
            fill="var(--color-forest-ink)"
            stroke="var(--color-cream-paper)"
            strokeWidth="3"
            paintOrder="stroke"
          >
            {a.name}
          </text>
        ))}
      </svg>
    </figure>
  );
}

/** Legend in words and shapes, never colour alone. */
function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base">
      <li className="inline-flex items-center gap-2">
        <svg width="16" height="16" aria-hidden>
          <circle cx="8" cy="8" r="7" fill="var(--color-forest-ink)" />
        </svg>
        Long wait, few other routes, in every test
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="16" height="16" aria-hidden>
          <circle cx="8" cy="8" r="6" fill="var(--color-cream-paper)" stroke="var(--color-forest-ink)" strokeWidth="2" />
        </svg>
        Long wait, few other routes, on the main comparison only
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="16" height="16" aria-hidden>
          <circle cx="8" cy="8" r="4.5" fill="var(--color-status-amber-bar)" opacity="0.75" />
        </svg>
        Other areas
      </li>
      <li className="inline-flex items-center gap-2">
        <svg width="22" height="16" aria-hidden>
          <line x1="0" x2="22" y1="8" y2="8" stroke="var(--color-forest-ink)" strokeDasharray="4 4" strokeWidth="1.5" />
        </svg>
        Finland&apos;s value
      </li>
    </ul>
  );
}

/** Two small charts side by side (stacked on a phone): GP wait against each other route. */
export function NoWayRoundChart() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <Panel
          title="GP wait and occupational-health doctor visits"
          xKey="occupational"
          xAxis={{ min: 1000, max: 2400, ticks: [1000, 1400, 1800, 2200] }}
          xLabel="Occupational-health doctor visits per 1,000 aged 15–64"
          formatX={(v) => v.toLocaleString("en-GB")}
        />
        <Panel
          title="GP wait and private doctor use"
          xKey="private"
          xAxis={{ min: 15, max: 35, ticks: [15, 20, 25, 30, 35] }}
          xLabel="Residents reimbursed for a private doctor visit"
          formatX={(v) => `${v}%`}
        />
      </div>
      <Legend />
    </div>
  );
}
