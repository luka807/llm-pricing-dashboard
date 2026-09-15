"use client";

import { useMemo, useState } from "react";
import { ALL_MODELS, PROVIDERS, type Provider } from "@/lib/pricing";
import ModelSearch from "@/components/ModelSearch";
import ProviderFilter from "@/components/ProviderFilter";
import SegmentedControl from "@/components/SegmentedControl";
import CapabilityScatterChart, { type XMetric, type YMetric } from "@/components/CapabilityScatterChart";
import DataAsOfNote from "@/components/DataAsOfNote";

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_MODELS.filter((m) => providers.includes(m.provider) && (q === "" || m.model.toLowerCase().includes(q)));
  }, [search, providers]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <ModelSearch value={search} onChange={setSearch} />
          <div className="h-5 w-px bg-border" />
          <ProviderFilter selected={providers} onChange={setProviders} />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl options={X_OPTIONS} value={xMetric} onChange={setXMetric} />
          <SegmentedControl options={Y_OPTIONS} value={yMetric} onChange={setYMetric} />
        </div>
      </div>

      <CapabilityScatterChart models={filtered} xMetric={xMetric} yMetric={yMetric} />
      <DataAsOfNote />
    </div>
  );
}
