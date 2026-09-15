"use client";

import { useMemo, useState } from "react";
import { ALL_MODELS, PROVIDERS, type Model, type Provider, type Tier } from "@/lib/pricing";
import ModelSearch from "@/components/ModelSearch";
import ProviderFilter from "@/components/ProviderFilter";
import SegmentedControl from "@/components/SegmentedControl";
import PricingTable from "@/components/PricingTable";
import ModelDetailDrawer from "@/components/ModelDetailDrawer";
import EmptyState from "@/components/EmptyState";
import DataAsOfNote from "@/components/DataAsOfNote";

const TIER_OPTIONS: { value: Tier | "all"; label: string }[] = [
  { value: "all", label: "All tiers" },
  { value: "frontier", label: "Frontier" },
  { value: "mid-range", label: "Mid-range" },
  { value: "lightweight", label: "Lightweight" },
];

export default function PricingComparisonTab() {
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<Provider[]>(PROVIDERS);
  const [tier, setTier] = useState<Tier | "all">("all");
  const [selected, setSelected] = useState<Model | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_MODELS.filter(
      (m) =>
        providers.includes(m.provider) &&
        (tier === "all" || m.tier === tier) &&
        (q === "" || m.model.toLowerCase().includes(q))
    );
  }, [search, providers, tier]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <ModelSearch value={search} onChange={setSearch} />
          <div className="h-5 w-px bg-border" />
          <ProviderFilter selected={providers} onChange={setProviders} />
        </div>
        <SegmentedControl options={TIER_OPTIONS} value={tier} onChange={setTier} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No models match your filters" description="Try clearing the search or selecting more providers." />
      ) : (
        <PricingTable models={filtered} onSelectModel={setSelected} />
      )}

      <DataAsOfNote />
      <ModelDetailDrawer model={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
