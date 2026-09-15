import { PROVIDER_COLOR_VAR, type PriceMilestone, type Provider } from "@/lib/pricing";
import { formatDate, formatUSD } from "@/lib/format";

const EVENT_LABEL: Record<string, string> = {
  launch: "Launch",
  "price cut": "Price cut",
  "entered price index": "Index entry",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Verified",
  aggregator: "Aggregator",
};

type PriceChangeTableProps = {
  milestones: PriceMilestone[];
};

export default function PriceChangeTable({ milestones }: PriceChangeTableProps) {
  const sorted = [...milestones].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return (
    <div className="overflow-x-auto border bg-[var(--card)] shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr style={{ background: "var(--lnp-navy-deep)" }}>
            <th className="font-display px-4 py-2.5 text-left text-[12px] font-bold tracking-[0.09em] text-white uppercase">Date</th>
            <th className="font-display px-4 py-2.5 text-left text-[12px] font-bold tracking-[0.09em] text-white uppercase">Model</th>
            <th className="font-display px-4 py-2.5 text-left text-[12px] font-bold tracking-[0.09em] text-white uppercase">Event</th>
            <th className="font-display px-4 py-2.5 text-right text-[12px] font-bold tracking-[0.09em] text-white uppercase">Price</th>
            <th className="font-display px-4 py-2.5 text-left text-[12px] font-bold tracking-[0.09em] text-white uppercase">Source</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => (
            <tr key={`${m.date}-${m.model}-${i}`} className="border-t align-top" style={{ background: i % 2 === 1 ? "var(--muted)" : "var(--card)", borderColor: "var(--border)" }}>
              <td className="text-muted-foreground px-4 py-2.5 font-mono whitespace-nowrap">{formatDate(m.date)}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2 font-semibold" style={{ color: "var(--lnp-navy-deep)" }}>
                  {m.provider && (
                    <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: PROVIDER_COLOR_VAR[m.provider as Provider] }} />
                  )}
                  {m.model}
                </span>
                {m.notes && <div className="text-faint-foreground mt-1 max-w-xs text-xs leading-relaxed">{m.notes}</div>}
              </td>
              <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{EVENT_LABEL[m.event] ?? m.event}</td>
              <td className="num px-4 py-2.5 text-right font-mono text-foreground whitespace-nowrap">
                {"blendedPerMillion" in m && typeof m.blendedPerMillion === "number" ? (
                  <>{formatUSD(m.blendedPerMillion)} blended</>
                ) : typeof m.inputPerMillion === "number" && typeof m.outputPerMillion === "number" ? (
                  <>
                    {formatUSD(m.inputPerMillion)} in / {formatUSD(m.outputPerMillion)} out
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                <span
                  className="font-display rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-[0.08em] uppercase"
                  style={{
                    background: m.sourceConfidence === "high" ? "var(--highlight-soft)" : "var(--muted-2)",
                    color: m.sourceConfidence === "high" ? "var(--lnp-navy-deep)" : "var(--muted-foreground)",
                  }}
                >
                  {CONFIDENCE_LABEL[m.sourceConfidence] ?? m.sourceConfidence}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
