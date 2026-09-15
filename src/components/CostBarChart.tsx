import type { CostRow } from "@/components/CostResultsTable";
import { formatUSD } from "@/lib/format";

type CostBarChartProps = {
  rows: CostRow[];
  periodLabel: string;
};

export default function CostBarChart({ rows, periodLabel }: CostBarChartProps) {
  const max = Math.max(...rows.map((r) => r.breakdown.totalCost), 1);

  return (
    <div className="border bg-[var(--card)] p-6 shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <h3 className="font-display mb-5 text-sm font-bold" style={{ color: "var(--lnp-navy-deep)" }}>
        Estimated cost by model <span className="text-faint-foreground font-normal">· {periodLabel}</span>
      </h3>
      <div className="grid gap-3">
        {rows.map((row) => {
          const total = row.breakdown.totalCost;
          const pct = (total / max) * 100;
          const inputShare = total > 0 ? (row.breakdown.inputCost / total) * 100 : 0;
          return (
            <div key={`${row.model.provider}-${row.model.model}`} className="grid grid-cols-[180px_minmax(0,1fr)_110px] items-center gap-4">
              <div className="text-muted-foreground truncate text-sm font-semibold" style={{ color: "var(--lnp-navy-deep)" }}>
                {row.model.model}
              </div>
              <div className="h-[26px]" style={{ background: "var(--muted-2)" }}>
                <div className="flex h-full" style={{ width: `${pct}%`, minWidth: total > 0 ? 2 : 0 }}>
                  <div style={{ width: `${inputShare}%`, background: "var(--bar-input)" }} />
                  <div style={{ width: `${100 - inputShare}%`, background: "var(--bar-output)" }} />
                </div>
              </div>
              <div className="num text-right font-mono text-sm font-bold text-foreground">{formatUSD(total)}</div>
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground mt-5 flex items-center gap-5 text-xs">
        <Legend color="var(--bar-input)" label="Input" />
        <Legend color="var(--bar-output)" label="Output" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-[11px] w-[11px]" style={{ background: color }} />
      {label}
    </span>
  );
}
