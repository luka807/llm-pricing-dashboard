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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Model</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Event</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Price</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Source</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => (
            <tr key={`${m.date}-${m.model}-${i}`} className="border-t border-border align-top">
              <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{formatDate(m.date)}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  {m.provider && (
                    <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: PROVIDER_COLOR_VAR[m.provider as Provider] }} />
                  )}
                  {m.model}
                </span>
                {m.notes && <div className="mt-0.5 max-w-xs text-[12px] leading-relaxed text-faint-foreground">{m.notes}</div>}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{EVENT_LABEL[m.event] ?? m.event}</td>
              <td className="num whitespace-nowrap px-4 py-2.5 text-right text-foreground">
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
              <td className="whitespace-nowrap px-4 py-2.5">
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    background: m.sourceConfidence === "high" ? "var(--accent-soft)" : "var(--muted-2)",
                    color: m.sourceConfidence === "high" ? "var(--accent)" : "var(--muted-foreground)",
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
