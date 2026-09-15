import { type CostBreakdown, type Model } from "@/lib/pricing";
import { formatUSD } from "@/lib/format";

export type CostRow = { model: Model; breakdown: CostBreakdown };

type CostResultsTableProps = {
  rows: CostRow[];
  assumption: string;
};

export default function CostResultsTable({ rows, assumption }: CostResultsTableProps) {
  return (
    <div className="border bg-[var(--card)] shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr style={{ background: "var(--lnp-navy-deep)" }}>
            <th className="font-display px-4 py-2.5 text-left text-[12px] font-bold tracking-[0.09em] text-white uppercase">Model</th>
            <th className="font-display px-4 py-2.5 text-right text-[12px] font-bold tracking-[0.09em] text-white uppercase">Input cost</th>
            <th className="font-display px-4 py-2.5 text-right text-[12px] font-bold tracking-[0.09em] text-white uppercase">Output cost</th>
            <th className="font-display px-4 py-2.5 text-right text-[12px] font-bold tracking-[0.09em] text-white uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.model.provider}-${row.model.model}`}
              className="border-t"
              style={{ background: i === 0 ? "var(--highlight-soft)" : "var(--card)", borderColor: "var(--border)" }}
            >
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2 font-semibold" style={{ color: "var(--lnp-navy-deep)" }}>
                  {row.model.model}
                  {i === 0 && (
                    <span
                      className="font-display inline-block rounded-full px-[7px] py-[2px] text-[10px] font-bold tracking-[0.1em] uppercase"
                      style={{ background: "var(--lnp-gold)", color: "var(--lnp-ink)" }}
                    >
                      Cheapest
                    </span>
                  )}
                </span>
              </td>
              <td className="num text-muted-foreground px-4 py-2.5 text-right font-mono">{formatUSD(row.breakdown.inputCost)}</td>
              <td className="num text-muted-foreground px-4 py-2.5 text-right font-mono">{formatUSD(row.breakdown.outputCost)}</td>
              <td className="num px-4 py-2.5 text-right font-mono font-bold" style={{ color: "var(--lnp-navy-deep)" }}>
                {formatUSD(row.breakdown.totalCost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-faint-foreground border-t px-4 py-3.5 font-mono text-xs leading-relaxed" style={{ borderColor: "var(--border)" }}>
        {assumption}
      </p>
    </div>
  );
}
