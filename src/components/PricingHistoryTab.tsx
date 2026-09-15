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
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      {FRONTIER_INDEX && "indexValue" in FRONTIER_INDEX && (
        <div className="flex flex-wrap items-center gap-5 rounded-xl border border-border bg-card p-4.5">
          <div className="flex items-baseline gap-2">
            <span className="num text-3xl font-bold text-foreground">-84%</span>
            <span className="text-xs text-muted-foreground">since GPT-4&apos;s March 2023 launch</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
            {FRONTIER_INDEX_BASELINE.description}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProviderFilter selected={providers} onChange={setProviders} />
        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl options={EVENT_OPTIONS} value={eventType} onChange={setEventType} />
          <SegmentedControl
            options={yearOptions}
            value={String(minYear)}
            onChange={(v) => setMinYear(Number(v))}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No pricing events match your filters" description="Try a wider date range or more providers." />
      ) : (
        <>
          <PriceHistoryChart milestones={filtered} />
          <PriceChangeTable milestones={filtered} />
        </>
      )}
    </div>
  );
}
