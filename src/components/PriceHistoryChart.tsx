"use client";

import { useState } from "react";
import { PROVIDER_COLOR_VAR, milestoneBlendedPrice, type PriceMilestone, type Provider } from "@/lib/pricing";
import { formatDate, formatUSD } from "@/lib/format";

type PriceHistoryChartProps = {
  milestones: PriceMilestone[];
};

export default function PriceHistoryChart({ milestones }: PriceHistoryChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const points = milestones
    .map((m, i) => ({ m, i, price: milestoneBlendedPrice(m), t: Date.parse(m.date) }))
    .filter((p): p is { m: PriceMilestone; i: number; price: number; t: number } => p.price != null && p.price > 0);

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border text-sm text-muted-foreground">
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

  function xPos(t: number) {
    const span = tMax - tMin || 1;
    return 3 + ((t - tMin) / span) * 94;
  }
  function yPos(logPrice: number) {
    const span = logMax - logMin || 1;
    return 90 - ((logPrice - logMin) / span) * 80;
  }

  const yearTicks: { label: string; t: number }[] = [];
  const startYear = new Date(tMin).getUTCFullYear();
  const endYear = new Date(tMax).getUTCFullYear();
  for (let y = startYear; y <= endYear; y++) {
    const t = Date.UTC(y, 0, 1);
    if (t >= tMin - 31536000000 && t <= tMax + 31536000000) yearTicks.push({ label: String(y), t });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4.5">
      <div className="relative mx-2 mt-1" style={{ height: 360 }}>
        {[0.1, 0.3, 0.5, 0.7].map((f) => (
          <div key={f} className="absolute left-0 right-0 border-t border-border" style={{ top: `${f * 100}%` }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0 border-t border-faint-foreground" />
        <div className="absolute bottom-0 left-0 top-0 border-l border-faint-foreground" />

        {points.map((p) => {
          const isCut = p.m.event === "price cut";
          const color = p.m.provider ? PROVIDER_COLOR_VAR[p.m.provider as Provider] : "var(--faint-foreground)";
          const left = xPos(p.t);
          const top = yPos(Math.log10(p.price));
          return (
            <div
              key={p.i}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: 11,
                height: 11,
                background: isCut ? "var(--card)" : color,
                border: `2px solid ${color}`,
              }}
              onMouseEnter={() => setHovered(p.i)}
              onMouseLeave={() => setHovered((h) => (h === p.i ? null : h))}
            >
              {hovered === p.i && (
                <div className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-lg border border-border bg-card p-2.5 text-xs shadow-xl">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                    <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: color }} />
                    {p.m.model}
                  </div>
                  <div className="mb-1 text-muted-foreground">
                    {p.m.provider ?? "Industry"} &middot; {formatDate(p.m.date)} &middot; {p.m.event}
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Blended price</span>
                    <span className="num text-foreground">{formatUSD(p.price)} / 1M</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative mx-2 mt-1.5 h-4">
        {yearTicks.map((y) => (
          <span
            key={y.label}
            className="num absolute -translate-x-1/2 text-[11px] text-faint-foreground"
            style={{ left: `${xPos(y.t)}%` }}
          >
            {y.label}
          </span>
        ))}
      </div>
      <div className="mt-2 text-center text-[11.5px] text-faint-foreground">
        Blended launch / price-cut rate over time ($ / 1M tokens, log scale)
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-3.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--faint-foreground)" }} />
          Launch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: "var(--faint-foreground)", background: "var(--card)" }} />
          Price cut
        </span>
      </div>
    </div>
  );
}
