"use client";

import { useMemo, useState } from "react";
import { PROVIDER_COLOR_VAR, type Model } from "@/lib/pricing";
import { formatContext, formatUSD } from "@/lib/format";

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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Provider</th>
            {COLUMNS.map((col) => (
              <th key={col.key} className={`px-4 py-2.5 font-medium text-muted-foreground ${col.align === "right" ? "text-right" : "text-left"}`}>
                <button
                  onClick={() => handleSort(col.key)}
                  className={`inline-flex items-center gap-1 ${col.align === "right" ? "flex-row-reverse" : ""}`}
                >
                  {col.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={sortKey === col.key ? "var(--accent)" : "currentColor"}
                    strokeWidth="3"
                    className={sortKey === col.key ? "" : "text-faint-foreground"}
                    style={{ transform: sortKey === col.key && !sortAsc ? "rotate(180deg)" : undefined }}
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
              </th>
            ))}
            <th className="w-9" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((model, i) => (
            <tr
              key={`${model.provider}-${model.model}`}
              onClick={() => onSelectModel(model)}
              className="cursor-pointer border-t border-border hover:bg-muted"
              style={{ background: i % 2 === 1 ? "var(--muted)" : "transparent" }}
            >
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: PROVIDER_COLOR_VAR[model.provider] }} />
                  {model.provider}
                </span>
              </td>
              <td className="px-4 py-2.5 font-medium text-foreground">{model.model}</td>
              <td className="num px-4 py-2.5 text-right text-muted-foreground">{formatContext(model.contextWindowTokens)}</td>
              <td className="num px-4 py-2.5 text-right font-medium text-foreground">{formatUSD(model.inputPerMillion)}</td>
              <td className="num px-4 py-2.5 text-right text-muted-foreground">{formatUSD(model.outputPerMillion)}</td>
              <td className="num px-4 py-2.5 text-right text-muted-foreground">
                {model.cachedInputPerMillion != null ? formatUSD(model.cachedInputPerMillion) : "—"}
              </td>
              <td className="px-3 py-2.5 text-right">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline text-faint-foreground">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
