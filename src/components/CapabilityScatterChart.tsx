"use client";

import { useState } from "react";
import { PROVIDER_COLOR_VAR, PROVIDERS, type Model } from "@/lib/pricing";
import { formatUSD } from "@/lib/format";

export type XMetric = "input" | "output" | "blended";
export type YMetric = "intelligenceIndex" | "valueScore";

const X_LABEL: Record<XMetric, string> = {
  input: "Input price",
  output: "Output price",
  blended: "Blended price",
};

const Y_LABEL: Record<YMetric, string> = {
  intelligenceIndex: "Intelligence index",
  valueScore: "Value score (pts / $)",
};

function xValue(m: Model, metric: XMetric): number {
  if (metric === "input") return m.inputPerMillion;
  if (metric === "output") return m.outputPerMillion;
  return (m.inputPerMillion + m.outputPerMillion) / 2;
}

function yValue(m: Model, metric: YMetric): number | null {
  return metric === "intelligenceIndex" ? m.intelligenceIndex : m.valueScore;
}

type CapabilityScatterChartProps = {
  models: Model[];
  xMetric: XMetric;
  yMetric: YMetric;
};

export default function CapabilityScatterChart({ models, xMetric, yMetric }: CapabilityScatterChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const points = models
    .map((m) => ({ model: m, x: xValue(m, xMetric), y: yValue(m, yMetric) }))
    .filter((p): p is { model: Model; x: number; y: number } => p.y != null && p.x > 0);

  const excluded = models.length - points.length;

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border text-sm text-muted-foreground">
        No models have {Y_LABEL[yMetric].toLowerCase()} data for the current filters.
      </div>
    );
  }

  const xs = points.map((p) => Math.log10(p.x));
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, Math.min(...ys));
  const yMax = Math.max(...ys) * 1.08;

  function xPos(logX: number) {
    const span = xMax - xMin || 1;
    return 5 + ((logX - xMin) / span) * 90;
  }
  function yPos(y: number) {
    const span = yMax - yMin || 1;
    return 92 - ((y - yMin) / span) * 82;
  }

  const xTicks = buildLogTicks(Math.pow(10, xMin), Math.pow(10, xMax));

  return (
    <div className="rounded-xl border border-border bg-card p-4.5">
      <div className="relative mx-2 mt-1" style={{ height: 380 }}>
        {[0.1, 0.325, 0.55, 0.775].map((f) => (
          <div key={f} className="absolute left-0 right-0 border-t border-border" style={{ top: `${f * 100}%` }} />
        ))}
        <div className="absolute bottom-0 left-0 right-0 border-t border-faint-foreground" />
        <div className="absolute bottom-0 left-0 top-0 border-l border-faint-foreground" />

        {points.map((p) => {
          const key = `${p.model.provider}-${p.model.model}`;
          const left = xPos(Math.log10(p.x));
          const top = yPos(p.y);
          return (
            <div
              key={key}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: 12,
                height: 12,
                background: PROVIDER_COLOR_VAR[p.model.provider],
                borderColor: "var(--card)",
              }}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered((h) => (h === key ? null : h))}
            >
              {hovered === key && (
                <div className="absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-lg border border-border bg-card p-2.5 text-xs shadow-xl">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                    <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: PROVIDER_COLOR_VAR[p.model.provider] }} />
                    {p.model.model}
                  </div>
                  <div className="mb-1 text-muted-foreground">{p.model.provider}</div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{X_LABEL[xMetric]}</span>
                    <span className="num text-foreground">{formatUSD(p.x)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{Y_LABEL[yMetric]}</span>
                    <span className="num text-foreground">{p.y}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-2 mt-1.5 flex justify-between">
        {xTicks.map((t) => (
          <span key={t} className="num text-[11px] text-faint-foreground">
            {formatUSD(t)}
          </span>
        ))}
      </div>
      <div className="mt-1.5 text-center text-[11.5px] text-faint-foreground">
        {X_LABEL[xMetric]} ($ / 1M tokens, log scale) vs. {Y_LABEL[yMetric]}
      </div>

      {excluded > 0 && (
        <div className="mt-2 text-center text-[11px] text-faint-foreground">
          {excluded} model{excluded > 1 ? "s" : ""} not shown &mdash; missing {Y_LABEL[yMetric].toLowerCase()} data.
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-border pt-3.5">
        {PROVIDERS.map((p) => (
          <span key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR_VAR[p] }} />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildLogTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  const start = Math.floor(Math.log10(min));
  const end = Math.ceil(Math.log10(max));
  for (let exp = start; exp <= end; exp++) {
    for (const mult of [1, 2, 5]) {
      const v = mult * Math.pow(10, exp);
      if (v >= min * 0.95 && v <= max * 1.05) ticks.push(v);
    }
  }
  if (ticks.length <= 6) return ticks;
  const step = Math.ceil(ticks.length / 6);
  return ticks.filter((_, i) => i % step === 0);
}
