import type { CostRow } from "@/components/CostResultsTable";
import { formatUSD } from "@/lib/format";

type CostBarChartProps = {
  rows: CostRow[];
};

export default function CostBarChart({ rows }: CostBarChartProps) {
  const max = Math.max(...rows.map((r) => r.breakdown.totalCost), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-4.5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">Estimated cost by model</div>
        <div className="flex items-center gap-3.5 text-xs text-muted-foreground">
          <Legend color="var(--bar-input)" label="Input" />
          <Legend color="var(--bar-output)" label="Output" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const inputPct = (row.breakdown.inputCost / max) * 100;
          const outputPct = (row.breakdown.outputCost / max) * 100;
          return (
            <div key={`${row.model.provider}-${row.model.model}`} className="flex items-center gap-3">
              <div className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">{row.model.model}</div>
              <div className="relative h-[22px] flex-1 rounded bg-muted-2">
                <div className="absolute left-0 top-0 h-full rounded-l" style={{ width: `${inputPct}%`, background: "var(--bar-input)" }} />
                <div className="absolute top-0 h-full rounded-r" style={{ left: `${inputPct}%`, width: `${outputPct}%`, background: "var(--bar-output)" }} />
              </div>
              <div className="num w-20 shrink-0 text-right text-[12.5px] font-medium text-foreground">
                {formatUSD(row.breakdown.totalCost)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
