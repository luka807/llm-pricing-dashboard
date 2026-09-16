"use client";

import { useMemo, useState } from "react";
import {
  FRONTIER_INDEX,
  FRONTIER_INDEX_BASELINE,
  PRICE_MILESTONES,
  PROVIDERS,
  type Provider,
} from "@/lib/pricing";
import ProviderFilter from "@/components/ProviderFilter";
import SegmentedControl from "@/components/SegmentedControl";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import PriceChangeTable from "@/components/PriceChangeTable";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import MethodologyNote from "@/components/MethodologyNote";

const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "launch", label: "Launches" },
  { value: "price cut", label: "Price cuts" },
];

export default function PricingHistoryTab() {
  const years = useMemo(() => {
    const set = new Set(PRICE_MILESTONES.map((m) => new Date(m.date).getUTCFullYear()));
    return Array.from(set).sort();
  }, []);

  const [providers, setProviders] = useState<Provider[]>(PROVIDERS);
  const [eventType, setEventType] = useState("all");
  const [minYear, setMinYear] = useState<number>(years[0]);

  const yearOptions = [
    { value: String(years[0]), label: "All time" },
    ...years.filter((y) => y > years[0]).map((y) => ({ value: String(y), label: `${y}–now` })),
  ];

  const filtered = PRICE_MILESTONES.filter(
    (m) =>
      (m.provider == null || providers.includes(m.provider as Provider)) &&
      (eventType === "all" || m.event === eventType) &&
      new Date(m.date).getUTCFullYear() >= minYear
  );

  return (
    <section>
      <SectionHeader
        eyebrow="Pricing History"
        title="How pricing has moved"
        description="Each point is a published launch price or price cut; hover for detail."
      />

      {FRONTIER_INDEX && "indexValue" in FRONTIER_INDEX && (
        <div className="mb-6 flex flex-wrap items-center gap-6 border bg-[var(--card)] p-6 shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-baseline gap-2">
            <span className="num font-mono text-4xl font-extrabold" style={{ color: "var(--lnp-navy-deep)" }}>
              -84%
            </span>
            <span className="text-faint-foreground text-xs">since GPT-4&apos;s March 2023 launch</span>
          </div>
          <div className="h-8 w-px" style={{ background: "var(--border)" }} />
          <div className="text-muted-foreground max-w-md text-[12.5px] leading-relaxed">{FRONTIER_INDEX_BASELINE.description}</div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Provider</span>
          <ProviderFilter selected={providers} onChange={setProviders} />
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <SegmentedControl options={EVENT_OPTIONS} value={eventType} onChange={setEventType} />
          <SegmentedControl options={yearOptions} value={String(minYear)} onChange={(v) => setMinYear(Number(v))} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
          <EmptyState title="No pricing events match your filters" description="Try a wider date range or more providers." />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <PriceHistoryChart milestones={filtered} />
          <PriceChangeTable milestones={filtered} />
        </div>
      )}

      <MethodologyNote
        items={[
          "This tab shows curated launch-price and price-cut milestones, not continuous daily pricing data.",
          "Each point is the price as originally announced on that date — not today's price. See the Pricing Comparison tab for current rates.",
          "Rows tagged \"Verified\" were cross-checked against the original provider announcement; rows tagged \"Aggregator\" come from a third-party aggregator site and could not be independently cross-checked — treat them as reasonably-sourced rather than verified.",
          "The frontier token price index (shown above the filters) is sourced from BenchLM and anchored to GPT-4's March 2023 launch price as index value 100.",
        ]}
      />
    </section>
  );
}
