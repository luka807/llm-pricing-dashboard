import { PROVIDER_COLOR_VAR, type CostBreakdown, type Model } from "@/lib/pricing";
import { formatUSD } from "@/lib/format";

export type CostRow = { model: Model; breakdown: CostBreakdown };

type CostResultsTableProps = {
  rows: CostRow[];
};

export default function CostResultsTable({ rows }: CostResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[480px] border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Model</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Input cost</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Output cost</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.model.provider}-${row.model.model}`}
              className="border-t border-border"
              style={{ background: i === 0 ? "var(--accent-soft)" : "transparent" }}
            >
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: PROVIDER_COLOR_VAR[row.model.provider] }} />
                  <span className="font-medium text-foreground">{row.model.model}</span>
                  {i === 0 && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground" style={{ background: "var(--accent)" }}>
                      Cheapest
                    </span>
                  )}
                </span>
              </td>
              <td className="num px-4 py-2.5 text-right text-muted-foreground">{formatUSD(row.breakdown.inputCost)}</td>
              <td className="num px-4 py-2.5 text-right text-muted-foreground">{formatUSD(row.breakdown.outputCost)}</td>
              <td className="num px-4 py-2.5 text-right font-semibold text-foreground">{formatUSD(row.breakdown.totalCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
