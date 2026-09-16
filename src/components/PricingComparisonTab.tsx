"use client";

import { useMemo, useState } from "react";
import { ALL_MODELS, PROVIDERS, PROVIDER_SOURCE_URL, type Model, type Provider, type Tier } from "@/lib/pricing";
import ModelSearch from "@/components/ModelSearch";
import ProviderFilter from "@/components/ProviderFilter";
import SegmentedControl from "@/components/SegmentedControl";
import PricingTable from "@/components/PricingTable";
import ModelDetailDrawer from "@/components/ModelDetailDrawer";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import MethodologyNote from "@/components/MethodologyNote";

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
    <section>
      <SectionHeader
        eyebrow="Pricing Comparison"
        title="Per-token pricing, side by side"
        description="Sort any numeric column to rank models by cost. Prices are USD per 1M tokens."
      />

      <div className="border bg-[var(--card)] shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-wrap items-end justify-between gap-5 border-b px-6 py-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-wrap items-end gap-5">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="eyebrow">Provider</span>
              <ProviderFilter selected={providers} onChange={setProviders} />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <span className="eyebrow">Search</span>
              <ModelSearch value={search} onChange={setSearch} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="eyebrow">Tier</span>
            <SegmentedControl options={TIER_OPTIONS} value={tier} onChange={setTier} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No models match these filters" description="Re-enable a provider or clear the search to see results." />
        ) : (
          <PricingTable models={filtered} onSelectModel={setSelected} />
        )}

        <p className="text-faint-foreground border-t px-6 py-3 font-mono text-xs" style={{ borderColor: "var(--border)" }}>
          {filtered.length} of {ALL_MODELS.length} models shown · click any row for full detail · prices in USD per
          1M tokens
        </p>
      </div>

      <ModelDetailDrawer model={selected} onClose={() => setSelected(null)} />

      <MethodologyNote
        items={[
          "Prices are pulled directly from each provider's official pricing page as of the \"data as of\" date in the footer — click any row for the source link.",
          "Figures are USD per 1,000,000 tokens at published list price; negotiated, enterprise, or volume-discount rates aren't reflected.",
          "Tier (frontier / mid-range / lightweight) is assigned by this dashboard based on each model's price and positioning within its own provider's lineup, not a third-party standard.",
          "Cached-input price reflects the provider's own published prompt-caching rate where one exists; where a provider doesn't publish one directly, it's derived from Artificial Analysis's published cache-hit discount for that model instead (flagged in the model's detail drawer). It's blank where neither source shows a distinct cached rate.",
          "LLM pricing changes frequently — treat this as a snapshot and verify against the source before relying on it.",
        ]}
        sources={[
          ...PROVIDERS.map((p) => ({ label: `${p} pricing`, url: PROVIDER_SOURCE_URL[p] })),
          { label: "Artificial Analysis (cached pricing)", url: "https://artificialanalysis.ai/models" },
        ]}
      />
    </section>
  );
}
