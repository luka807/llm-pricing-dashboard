"use client";

import { useEffect, useMemo } from "react";
import { PRICE_MILESTONES, PROVIDER_COLOR_VAR, milestoneBlendedPrice, type Model } from "@/lib/pricing";
import { formatContext, formatDate, formatUSD } from "@/lib/format";
import ProviderBadge from "@/components/ProviderBadge";

type ModelDetailDrawerProps = {
  model: Model | null;
  onClose: () => void;
};

const TIER_LABEL: Record<Model["tier"], string> = {
  frontier: "Frontier",
  "mid-range": "Mid-range",
  lightweight: "Lightweight",
};

function buildSparkline(model: Model) {
  const points = PRICE_MILESTONES.filter((m) => m.model === model.model)
    .map((m) => ({ t: Date.parse(m.date), price: milestoneBlendedPrice(m), date: m.date }))
    .filter((p): p is { t: number; price: number; date: string } => p.price != null)
    .sort((a, b) => a.t - b.t);

  if (points.length < 2) return null;

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const sy = (val: number) => (max === min ? 40 : 68 - ((val - min) / (max - min)) * 56);
  const sx = (i: number) => (i / (points.length - 1)) * 360;

  const pts: string[] = [];
  let prev = points[0].price;
  pts.push(`0,${sy(prev).toFixed(1)}`);
  for (let i = 1; i < points.length; i++) {
    if (points[i].price !== prev) {
      pts.push(`${sx(i).toFixed(1)},${sy(prev).toFixed(1)}`);
      pts.push(`${sx(i).toFixed(1)},${sy(points[i].price).toFixed(1)}`);
      prev = points[i].price;
    }
  }
  pts.push(`360,${sy(prev).toFixed(1)}`);

  return {
    path: pts.join(" "),
    note: `${formatUSD(points[0].price)} (${formatDate(points[0].date)}) → ${formatUSD(points[points.length - 1].price)} (${formatDate(points[points.length - 1].date)})`,
  };
}

export default function ModelDetailDrawer({ model, onClose }: ModelDetailDrawerProps) {
  useEffect(() => {
    if (!model) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [model, onClose]);

  const spark = useMemo(() => (model ? buildSparkline(model) : null), [model]);

  if (!model) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close model detail" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(9,43,95,0.34)" }} />
      <aside
        className="relative flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-[var(--card)] p-8 shadow-[var(--shadow-3)]"
        style={{ borderLeft: "5px solid var(--lnp-gold)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <ProviderBadge provider={model.provider} />
            <h2 className="font-display mt-2.5 text-[2.125rem] leading-tight font-extrabold" style={{ color: "var(--lnp-navy-deep)" }}>
              {model.model}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-faint-foreground shrink-0 cursor-pointer px-1.5 py-0.5 text-lg">
            ✕
          </button>
        </div>
        <hr className="rule-gold mb-6" />

        <div className="mb-6 grid grid-cols-2 gap-px border" style={{ background: "var(--border)", borderColor: "var(--border)" }}>
          <StatCell label="Input / 1M" value={formatUSD(model.inputPerMillion)} />
          <StatCell label="Output / 1M" value={formatUSD(model.outputPerMillion)} />
          <StatCell label="Cached / 1M" value={model.cachedInputPerMillion != null ? formatUSD(model.cachedInputPerMillion) : "—"} />
          <StatCell label="Tier" value={TIER_LABEL[model.tier]} />
        </div>

        <dl className="mb-6 grid gap-0">
          <DetailRow label="Context window" value={formatContext(model.contextWindowTokens)} mono />
          {model.intelligenceIndex != null && <DetailRow label="Intelligence index" value={String(model.intelligenceIndex)} mono />}
          {model.valueScore != null && <DetailRow label="Value score" value={`${model.valueScore} pts / $`} mono />}
        </dl>

        <p className="eyebrow mb-2.5">Blended price, published history</p>
        <div className="border p-4" style={{ borderColor: "var(--border)", background: "var(--lnp-paper)" }}>
          {spark ? (
            <>
              <svg viewBox="0 0 360 80" className="block h-[70px] w-full">
                <polyline
                  points={spark.path}
                  fill="none"
                  stroke={PROVIDER_COLOR_VAR[model.provider]}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-faint-foreground mt-2.5 font-mono text-xs">{spark.note}</p>
            </>
          ) : (
            <p className="text-faint-foreground py-4 text-center text-xs">No published price changes on record.</p>
          )}
        </div>

        {model.notes && (
          <p className="font-editorial text-muted-foreground mt-6 border-t pt-4 text-base leading-relaxed" style={{ borderColor: "var(--border)" }}>
            {model.notes}
          </p>
        )}

        <a
          href={model.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-80"
          style={{ color: "var(--link)" }}
        >
          View source pricing page
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </aside>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4" style={{ background: "var(--lnp-paper)" }}>
      <span className="font-display text-faint-foreground mb-1 block text-[10px] font-bold tracking-[0.1em] uppercase">{label}</span>
      <b className="font-mono text-[1.375rem]" style={{ color: "var(--lnp-navy-deep)" }}>
        {value}
      </b>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t py-2.5" style={{ borderColor: "var(--border)" }}>
      <dt className="font-display text-faint-foreground text-[12px] font-bold tracking-[0.08em] uppercase">{label}</dt>
      <dd className={`text-right text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
