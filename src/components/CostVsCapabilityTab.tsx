"use client";

import { useMemo, useState } from "react";
import { ALL_MODELS, PROVIDERS, type Model, type Provider } from "@/lib/pricing";
import ModelSearch from "@/components/ModelSearch";
import ProviderFilter from "@/components/ProviderFilter";
import SegmentedControl from "@/components/SegmentedControl";
import CapabilityScatterChart, { type XMetric, type YMetric } from "@/components/CapabilityScatterChart";
import ModelDetailDrawer from "@/components/ModelDetailDrawer";
import SectionHeader from "@/components/SectionHeader";

const X_OPTIONS: { value: XMetric; label: string }[] = [
  { value: "input", label: "Input price" },
  { value: "output", label: "Output price" },
  { value: "blended", label: "Blended" },
];

const Y_OPTIONS: { value: YMetric; label: string }[] = [
  { value: "intelligenceIndex", label: "Intelligence index" },
  { value: "valueScore", label: "Value score" },
];

export default function CostVsCapabilityTab() {
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<Provider[]>(PROVIDERS);
  const [xMetric, setXMetric] = useState<XMetric>("blended");
  const [yMetric, setYMetric] = useState<YMetric>("intelligenceIndex");
  const [selected, setSelected] = useState<Model | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_MODELS.filter((m) => providers.includes(m.provider) && (q === "" || m.model.toLowerCase().includes(q)));
  }, [search, providers]);

  return (
    <section>
      <SectionHeader
        eyebrow="Cost vs. Capability"
        title="Is higher price buying higher capability?"
        description="Models toward the upper-left are cheap for their measured quality. Point size encodes context window. Click any point for detail."
      />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
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
        <div className="flex flex-wrap items-end gap-2.5">
          <SegmentedControl options={X_OPTIONS} value={xMetric} onChange={setXMetric} />
          <SegmentedControl options={Y_OPTIONS} value={yMetric} onChange={setYMetric} />
        </div>
      </div>

      <CapabilityScatterChart models={filtered} xMetric={xMetric} yMetric={yMetric} onSelectModel={setSelected} />

      <ModelDetailDrawer model={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
