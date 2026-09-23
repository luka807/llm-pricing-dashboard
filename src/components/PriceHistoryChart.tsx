"use client";

import { useState } from "react";
import { PROVIDER_COLOR_VAR, milestoneBlendedPrice, type PriceMilestone, type Provider } from "@/lib/pricing";
import { formatDate, formatUSD } from "@/lib/format";

type PriceHistoryChartProps = {
  milestones: PriceMilestone[];
};

const PLOT_LEFT = 72;
const PLOT_RIGHT = 980;
const PLOT_TOP = 24;
const PLOT_BOTTOM = 340;

export default function PriceHistoryChart({ milestones }: PriceHistoryChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const points = milestones
    .map((m, i) => ({ m, i, price: milestoneBlendedPrice(m), t: Date.parse(m.date) }))
    .filter((p): p is { m: PriceMilestone; i: number; price: number; t: number } => p.price != null && p.price > 0);

  if (points.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center border text-sm" style={{ borderColor: "var(--border)" }}>
        No pricing events match the current filters.
      </div>
    );
  }

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

  const hoveredPoint = points.find((p) => p.i === hovered) ?? null;

  const series = new Map<string, typeof points>();
  for (const p of points) {
    const key = `${p.m.provider ?? "industry"}::${p.m.model}`;
    const group = series.get(key);
    if (group) group.push(p);
    else series.set(key, [p]);
  }
  const connectors = Array.from(series.values())
    .filter((group) => group.length > 1)
    .map((group) => [...group].sort((a, b) => a.t - b.t));

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
            const color = group[0].m.provider ? PROVIDER_COLOR_VAR[group[0].m.provider as Provider] : "var(--faint-foreground)";
            return (
              <polyline
                key={`${group[0].m.provider ?? "industry"}::${group[0].m.model}`}
                points={group.map((p) => `${px(p.t)},${py(Math.log10(p.price))}`).join(" ")}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
          {points.map((p) => {
            const isCut = p.m.event === "price cut";
            const color = p.m.provider ? PROVIDER_COLOR_VAR[p.m.provider as Provider] : "var(--faint-foreground)";
            const cx = px(p.t);
            const cy = py(Math.log10(p.price));
            return (
              <g key={p.i} style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(p.i)} onMouseLeave={() => setHovered((h) => (h === p.i ? null : h))}>
                <circle cx={cx} cy={cy} r={6.5} fill="var(--card)" />
                <circle cx={cx} cy={cy} r={5} fill={isCut ? "var(--card)" : color} stroke={color} strokeWidth={2} />
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
                style={{ background: hoveredPoint.m.provider ? PROVIDER_COLOR_VAR[hoveredPoint.m.provider as Provider] : "var(--faint-foreground)" }}
              />
              {hoveredPoint.m.model}
            </div>
            <div className="text-muted-foreground mb-1">
              {hoveredPoint.m.provider ?? "Industry"} · {formatDate(hoveredPoint.m.date)} · {hoveredPoint.m.event}
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Blended price</span>
              <span className="num font-mono text-foreground">{formatUSD(hoveredPoint.price)} / 1M</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-faint-foreground mt-3 text-center text-[11.5px]">
        Blended launch / price-cut rate over time ($ / 1M tokens, log scale)
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
          <span className="inline-block h-[2px] w-4 rounded-full" style={{ background: "var(--faint-foreground)" }} />
          Same model over time
        </span>
      </div>
    </div>
  );
}
