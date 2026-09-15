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

function pointRadius(ctx: number | null): number {
  if (ctx == null) return 7;
  const r = 5 + 7 * (Math.log(ctx / 128000) / Math.log(16));
  return Math.min(16, Math.max(5, r));
}

const PLOT_LEFT = 72;
const PLOT_RIGHT = 980;
const PLOT_TOP = 24;
const PLOT_BOTTOM = 410;

type CapabilityScatterChartProps = {
  models: Model[];
  xMetric: XMetric;
  yMetric: YMetric;
  onSelectModel: (model: Model) => void;
};

export default function CapabilityScatterChart({ models, xMetric, yMetric, onSelectModel }: CapabilityScatterChartProps) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const points = models
    .map((m) => ({ model: m, x: xValue(m, xMetric), y: yValue(m, yMetric) }))
    .filter((p): p is { model: Model; x: number; y: number } => p.y != null && p.x > 0);

  const excluded = models.length - points.length;

  if (points.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center border text-sm" style={{ borderColor: "var(--border)" }}>
        No models have {Y_LABEL[yMetric].toLowerCase()} data for the current filters.
      </div>
    );
  }

  const logXs = points.map((p) => Math.log10(p.x));
  const logXMin = Math.min(...logXs);
  const logXMax = Math.max(...logXs);
  const ys = points.map((p) => p.y);
  const yMin = Math.min(0, Math.min(...ys));
  const yMax = Math.max(...ys) * 1.08;

  const px = (logX: number) => {
    const span = logXMax - logXMin || 1;
    return PLOT_LEFT + ((logX - logXMin) / span) * (PLOT_RIGHT - PLOT_LEFT);
  };
  const py = (y: number) => {
    const span = yMax - yMin || 1;
    return PLOT_BOTTOM - ((y - yMin) / span) * (PLOT_BOTTOM - PLOT_TOP);
  };

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);
  const xTicks = buildLogTicks(Math.pow(10, logXMin), Math.pow(10, logXMax));

  const hovered = points.find((p) => `${p.model.provider}-${p.model.model}` === hoverKey) ?? null;

  return (
    <div className="border bg-[var(--card)] p-6 shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <svg viewBox="0 0 1000 470" className="block w-full overflow-visible" style={{ height: "auto" }}>
        {yTicks.map((t, i) => (
          <line key={i} x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={py(t)} y2={py(t)} stroke="var(--border)" strokeWidth={1} />
        ))}
        {yTicks.map((t, i) => (
          <text key={i} x={PLOT_LEFT - 10} y={py(t) + 4} textAnchor="end" className="font-mono" style={{ fontSize: 11, fill: "var(--faint-foreground)" }}>
            {Math.round(t)}
          </text>
        ))}
        <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM} stroke="var(--lnp-ink)" strokeWidth={1.5} />
        <line x1={PLOT_LEFT} x2={PLOT_LEFT} y1={PLOT_TOP} y2={PLOT_BOTTOM} stroke="var(--lnp-ink)" strokeWidth={1.5} />
        {xTicks.map((t, i) => (
          <text key={i} x={px(Math.log10(t))} y={PLOT_BOTTOM + 22} textAnchor="middle" className="font-mono" style={{ fontSize: 11, fill: "var(--faint-foreground)" }}>
            {formatUSD(t)}
          </text>
        ))}
        <text
          x={(PLOT_LEFT + PLOT_RIGHT) / 2}
          y={PLOT_BOTTOM + 50}
          textAnchor="middle"
          className="font-display"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fill: "var(--faint-foreground)", textTransform: "uppercase" }}
        >
          {X_LABEL[xMetric]} ($ / 1M tokens, log scale)
        </text>
        <text
          x={20}
          y={(PLOT_TOP + PLOT_BOTTOM) / 2}
          textAnchor="middle"
          transform={`rotate(-90 20 ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
          className="font-display"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", fill: "var(--faint-foreground)", textTransform: "uppercase" }}
        >
          {Y_LABEL[yMetric]}
        </text>
        {points.map((p) => {
          const key = `${p.model.provider}-${p.model.model}`;
          return (
            <circle
              key={key}
              cx={px(Math.log10(p.x))}
              cy={py(p.y)}
              r={pointRadius(p.model.contextWindowTokens)}
              fill={PROVIDER_COLOR_VAR[p.model.provider]}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverKey(key)}
              onMouseLeave={() => setHoverKey((h) => (h === key ? null : h))}
              onClick={() => onSelectModel(p.model)}
            />
          );
        })}
      </svg>

      <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-5 border-t pt-4 text-xs" style={{ borderColor: "var(--border)" }}>
        {PROVIDERS.map((p) => (
          <span key={p} className="inline-flex items-center gap-2">
            <span className="inline-block h-[11px] w-[11px] rounded-full" style={{ background: PROVIDER_COLOR_VAR[p] }} />
            {p}
          </span>
        ))}
        <span className="text-faint-foreground italic">
          {hovered
            ? `${hovered.model.model} · ${formatUSD(hovered.x)} / 1M · ${Y_LABEL[yMetric].toLowerCase()} ${hovered.y} · point size = context window`
            : "Hover a point for detail; click to open the full model record."}
        </span>
      </div>

      {excluded > 0 && (
        <div className="text-faint-foreground mt-2 text-center text-[11px]">
          {excluded} model{excluded > 1 ? "s" : ""} not shown — missing {Y_LABEL[yMetric].toLowerCase()} data.
        </div>
      )}
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
