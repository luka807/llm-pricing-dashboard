"use client";

import { useEffect } from "react";
import { PROVIDER_COLOR_VAR, type Model } from "@/lib/pricing";
import { formatContext, formatUSD } from "@/lib/format";

type ModelDetailDrawerProps = {
  model: Model | null;
  onClose: () => void;
};

const TIER_LABEL: Record<Model["tier"], string> = {
  frontier: "Frontier",
  "mid-range": "Mid-range",
  lightweight: "Lightweight",
};

export default function ModelDetailDrawer({ model, onClose }: ModelDetailDrawerProps) {
  useEffect(() => {
    if (!model) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [model, onClose]);

  if (!model) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close model detail" onClick={onClose} className="absolute inset-0 bg-black/20" />
      <div className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: PROVIDER_COLOR_VAR[model.provider] }}
              />
              <span className="text-[12.5px] text-muted-foreground">{model.provider}</span>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {TIER_LABEL[model.tier]}
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">{model.model}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-5 text-[11.5px] font-semibold uppercase tracking-wide text-faint-foreground">Overview</div>
        <DetailRow label="Context window" value={formatContext(model.contextWindowTokens)} />

        <div className="mt-5 text-[11.5px] font-semibold uppercase tracking-wide text-faint-foreground">Pricing</div>
        <DetailRow label="Input / 1M tokens" value={formatUSD(model.inputPerMillion)} strong />
        <DetailRow label="Output / 1M tokens" value={formatUSD(model.outputPerMillion)} strong />
        <DetailRow
          label="Cached input / 1M"
          value={model.cachedInputPerMillion != null ? formatUSD(model.cachedInputPerMillion) : "—"}
          last
        />

        {(model.intelligenceIndex != null || model.valueScore != null) && (
          <>
            <div className="mt-5 text-[11.5px] font-semibold uppercase tracking-wide text-faint-foreground">Capability</div>
            {model.intelligenceIndex != null && (
              <DetailRow label="Intelligence index" value={String(model.intelligenceIndex)} />
            )}
            {model.valueScore != null && (
              <DetailRow label="Value score" value={`${model.valueScore} pts / $`} last />
            )}
          </>
        )}

        {model.notes && (
          <div className="mt-5 rounded-lg border border-border bg-muted p-3 text-[12.5px] leading-relaxed text-muted-foreground">
            {model.notes}
          </div>
        )}

        <a
          href={model.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:opacity-80"
        >
          View source pricing page
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  strong,
  last,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between border-t border-border py-2.5 ${last ? "border-b" : ""}`}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className={`num text-[13px] ${strong ? "font-semibold text-foreground" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
