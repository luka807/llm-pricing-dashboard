"use client";

import { useState } from "react";
import { ALL_MODELS, DATA_AS_OF, PROVIDER_COLOR_VAR, milestoneBlendedPrice, type PriceMilestone, type Provider } from "@/lib/pricing";
import { formatDate, formatUSD } from "@/lib/format";

type PriceHistoryChartProps = {
  milestones: PriceMilestone[];
};

type PlotPoint = {
  key: string;
  t: number;
  price: number;
  provider: Provider | null;
  model: string;
  synthetic: boolean;
  milestone?: PriceMilestone;
};

const PLOT_LEFT = 72;
const PLOT_RIGHT = 980;
const PLOT_TOP = 24;
const PLOT_BOTTOM = 340;

const CURRENT_PRICE_BY_KEY = new Map<string, number>(
  ALL_MODELS.map((m) => [`${m.provider}::${m.model}`, (m.inputPerMillion + m.outputPerMillion) / 2])
);

const NOW_T = Date.parse(DATA_AS_OF);

export default function PriceHistoryChart({ milestones }: PriceHistoryChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const rawPoints = milestones.map((m, i) => ({
    key: `real-${i}`,
    t: Date.parse(m.date),
    price: milestoneBlendedPrice(m),
    provider: (m.provider as Provider | null) ?? null,
    model: m.model,
    synthetic: false as const,
    milestone: m,
  }));
  const realPoints: PlotPoint[] = rawPoints.filter(
    (p): p is typeof p & { price: number } => p.price != null && p.price > 0
  );

  if (realPoints.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center border text-sm" style={{ borderColor: "var(--border)" }}>
        No pricing events match the current filters.
      </div>
    );
  }

  // Group by model so each series can be extended with a synthetic point at
  // today's current price — a model that hasn't changed since its last
  // recorded milestone should still read as "priced through today," not as
  // a line that mysteriously stops months or years ago.
  const seriesKey = (p: Pick<PlotPoint, "provider" | "model">) => `${p.provider ?? "industry"}::${p.model}`;
  const grouped = new Map<string, PlotPoint[]>();
  for (const p of realPoints) {
    const key = seriesKey(p);
    const group = grouped.get(key);
    if (group) group.push(p);
    else grouped.set(key, [p]);
  }

  const seriesGroups: PlotPoint[][] = [];
  for (const [key, group] of grouped) {
    const sorted = [...group].sort((a, b) => a.t - b.t);
    const current = CURRENT_PRICE_BY_KEY.get(key);
    const last = sorted[sorted.length - 1];
    if (current != null && NOW_T > last.t) {
      sorted.push({
        key: `synthetic-${key}`,
        t: NOW_T,
        price: current,
        provider: last.provider,
        model: last.model,
        synthetic: true,
      });
    }
    seriesGroups.push(sorted);
  }

  const points = seriesGroups.flat();

  const ts = points.map((p) => p.t);
  const logPrices = points.map((p) => Math.log10(p.price));
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const logMin = Math.min(...logPrices);
  const logMax = Math.max(...logPrices);

  const px = (t: number) => {
    const span = tMax - tMin || 1;
    return PLOT_LEFT + ((t - tMin) / span) * (PLOT_RIGHT - PLOT_LEFT);
  };
  const py = (logPrice: number) => {
    const span = logMax - logMin || 1;
    return PLOT_BOTTOM - ((logPrice - logMin) / span) * (PLOT_BOTTOM - PLOT_TOP);
  };

  const yTicks = Array.from({ length: 5 }, (_, i) => Math.pow(10, logMin + ((logMax - logMin) * i) / 4));

  const yearTicks: { label: string; t: number }[] = [];
  const startYear = new Date(tMin).getUTCFullYear();
  const endYear = new Date(tMax).getUTCFullYear();
  for (let y = startYear; y <= endYear; y++) {
    const t = Date.UTC(y, 0, 1);
    if (t >= tMin - 31536000000 && t <= tMax + 31536000000) yearTicks.push({ label: String(y), t });
  }

  const hoveredPoint = points.find((p) => p.key === hovered) ?? null;

  const connectors = seriesGroups.filter((group) => group.length > 1);

  return (
    <div className="border bg-[var(--card)] p-6 shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <div className="relative" style={{ aspectRatio: "1000 / 400" }}>
        <svg viewBox="0 0 1000 400" className="absolute inset-0 h-full w-full overflow-visible">
          {yTicks.map((t, i) => (
            <line key={i} x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={py(Math.log10(t))} y2={py(Math.log10(t))} stroke="var(--border)" strokeWidth={1} />
          ))}
          {yTicks.map((t, i) => (
            <text key={i} x={PLOT_LEFT - 10} y={py(Math.log10(t)) + 4} textAnchor="end" className="font-mono" style={{ fontSize: 11, fill: "var(--faint-foreground)" }}>
              {formatUSD(t)}
            </text>
          ))}
          <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM} stroke="var(--lnp-ink)" strokeWidth={1.5} />
          <line x1={PLOT_LEFT} x2={PLOT_LEFT} y1={PLOT_TOP} y2={PLOT_BOTTOM} stroke="var(--lnp-ink)" strokeWidth={1.5} />
          {yearTicks.map((y) => (
            <text key={y.label} x={px(y.t)} y={PLOT_BOTTOM + 22} textAnchor="middle" className="font-mono" style={{ fontSize: 11, fill: "var(--faint-foreground)" }}>
              {y.label}
            </text>
          ))}
          {connectors.map((group) => {
            const color = group[0].provider ? PROVIDER_COLOR_VAR[group[0].provider] : "var(--faint-foreground)";
            return (
              <polyline
                key={seriesKey(group[0])}
                points={group.map((p) => `${px(p.t)},${py(Math.log10(p.price))}`).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
          {points
            .filter((p) => !p.synthetic)
            .map((p) => {
              const isCut = p.milestone?.event === "price cut";
              const color = p.provider ? PROVIDER_COLOR_VAR[p.provider] : "var(--faint-foreground)";
              const cx = px(p.t);
              const cy = py(Math.log10(p.price));
              return (
                <g key={p.key} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(p.key)} onMouseLeave={() => setHovered((h) => (h === p.key ? null : h))}>
                  <circle cx={cx} cy={cy} r={6.5} fill="var(--card)" />
                  <circle cx={cx} cy={cy} r={5} fill={isCut ? "var(--card)" : color} stroke={color} strokeWidth={2} />
                </g>
              );
            })}
          {points
            .filter((p) => p.synthetic)
            .map((p) => {
              const color = p.provider ? PROVIDER_COLOR_VAR[p.provider] : "var(--faint-foreground)";
              const cx = px(p.t);
              const cy = py(Math.log10(p.price));
              return (
                <g key={p.key} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(p.key)} onMouseLeave={() => setHovered((h) => (h === p.key ? null : h))}>
                  <circle cx={cx} cy={cy} r={5.5} fill="var(--card)" />
                  <circle cx={cx} cy={cy} r={3.5} fill={color} />
                </g>
              );
            })}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-20 w-52 -translate-x-1/2 -translate-y-[calc(100%+10px)] border bg-[var(--card)] p-3 text-xs shadow-[var(--shadow-2)]"
            style={{ left: `${(px(hoveredPoint.t) / 1000) * 100}%`, top: `${(py(Math.log10(hoveredPoint.price)) / 400) * 100}%`, borderColor: "var(--border)" }}
          >
            <div className="mb-1 flex items-center gap-2 font-semibold" style={{ color: "var(--lnp-navy-deep)" }}>
              <span
                className="inline-block h-[9px] w-[9px] shrink-0 rounded-full"
                style={{ background: hoveredPoint.provider ? PROVIDER_COLOR_VAR[hoveredPoint.provider] : "var(--faint-foreground)" }}
              />
              {hoveredPoint.model}
            </div>
            <div className="text-muted-foreground mb-1">
              {hoveredPoint.provider ?? "Industry"} ·{" "}
              {hoveredPoint.synthetic ? `Current as of ${formatDate(DATA_AS_OF)}` : `${formatDate(hoveredPoint.milestone!.date)} · ${hoveredPoint.milestone!.event}`}
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Blended price</span>
              <span className="num font-mono text-foreground">{formatUSD(hoveredPoint.price)} / 1M</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-faint-foreground mt-3 text-center text-[11.5px]">
        Blended launch / price-cut rate over time ($ / 1M tokens, log scale) — lines run through to today&apos;s price for models still on the market
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-5 border-t pt-4 text-xs" style={{ borderColor: "var(--border)" }}>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--faint-foreground)" }} />
          Launch
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: "var(--faint-foreground)", background: "var(--card)" }} />
          Price cut
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--faint-foreground)" }} />
          Current price
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-[2px] w-4 rounded-full" style={{ background: "var(--faint-foreground)" }} />
          Same model over time
        </span>
      </div>
    </div>
  );
}
