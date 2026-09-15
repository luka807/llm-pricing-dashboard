"use client";

import { useMemo, useState } from "react";
import { type Model } from "@/lib/pricing";
import { formatContext, formatUSD } from "@/lib/format";
import ProviderBadge from "@/components/ProviderBadge";

type SortKey = "model" | "context" | "input" | "output" | "cached";

const SORT_ACCESSORS: Record<SortKey, (m: Model) => number | string> = {
  model: (m) => m.model,
  context: (m) => m.contextWindowTokens ?? -1,
  input: (m) => m.inputPerMillion,
  output: (m) => m.outputPerMillion,
  cached: (m) => m.cachedInputPerMillion ?? -1,
};

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "model", label: "Model", align: "left" },
  { key: "context", label: "Context", align: "right" },
  { key: "input", label: "Input / 1M", align: "right" },
  { key: "output", label: "Output / 1M", align: "right" },
  { key: "cached", label: "Cached / 1M", align: "right" },
];

type PricingTableProps = {
  models: Model[];
  onSelectModel: (model: Model) => void;
};

export default function PricingTable({ models, onSelectModel }: PricingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("input");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    const copy = [...models];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : av - (bv as number);
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [models, sortKey, sortAsc]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr style={{ background: "var(--lnp-navy-deep)" }}>
            <th className="font-display px-4 py-2.5 text-left text-[12px] font-bold tracking-[0.09em] text-white uppercase">
              Provider
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`font-display px-4 py-2.5 text-[12px] font-bold tracking-[0.09em] whitespace-nowrap text-white uppercase select-none ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                <button
                  onClick={() => handleSort(col.key)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 ${col.align === "right" ? "flex-row-reverse" : ""}`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-[9px]" style={{ color: "var(--lnp-gold)" }}>
                      {sortAsc ? "▲" : "▼"}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((model, i) => (
            <tr
              key={`${model.provider}-${model.model}`}
              onClick={() => onSelectModel(model)}
              className="group cursor-pointer border-b"
              style={{ background: i % 2 === 1 ? "var(--muted)" : "var(--card)", borderColor: "var(--border)" }}
            >
              <td className="px-4 py-2.5 group-hover:bg-[var(--highlight-soft)]">
                <ProviderBadge provider={model.provider} />
              </td>
              <td className="px-4 py-2.5 font-semibold group-hover:bg-[var(--highlight-soft)]" style={{ color: "var(--lnp-navy-deep)" }}>
                {model.model}
              </td>
              <td className="num text-muted-foreground px-4 py-2.5 text-right font-mono group-hover:bg-[var(--highlight-soft)]">
                {formatContext(model.contextWindowTokens)}
              </td>
              <td className="num px-4 py-2.5 text-right font-mono font-bold group-hover:bg-[var(--highlight-soft)]" style={{ color: "var(--lnp-navy-deep)" }}>
                {formatUSD(model.inputPerMillion)}
              </td>
              <td className="num px-4 py-2.5 text-right font-mono text-foreground group-hover:bg-[var(--highlight-soft)]">
                {formatUSD(model.outputPerMillion)}
              </td>
              <td className="num text-faint-foreground px-4 py-2.5 text-right font-mono group-hover:bg-[var(--highlight-soft)]">
                {model.cachedInputPerMillion != null ? formatUSD(model.cachedInputPerMillion) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
