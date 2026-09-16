"use client";

import { useMemo, useState } from "react";
import { ALL_MODELS, PROVIDERS, PROVIDER_SOURCE_URL, calcCost } from "@/lib/pricing";
import UsageInputForm, { type UsageInputs } from "@/components/UsageInputForm";
import ModelSelector, { modelKey } from "@/components/ModelSelector";
import CostResultsTable, { type CostRow } from "@/components/CostResultsTable";
import CostBarChart from "@/components/CostBarChart";
import EmptyState from "@/components/EmptyState";
import SectionHeader from "@/components/SectionHeader";
import MethodologyNote from "@/components/MethodologyNote";

const DEFAULT_SELECTED_MODELS = [
  "GPT-5.6 Terra",
  "Claude Sonnet 5",
  "Gemini 3.8 Flash",
  "Mistral Medium 3.5",
  "DeepSeek-V4-Pro",
  "Grok 4.6",
];

export default function CostCalculatorTab() {
  const [usage, setUsage] = useState<UsageInputs>({
    inputTokensPerRequest: 1200,
    outputTokensPerRequest: 600,
    requests: 50000,
    requestUnit: "month",
    useCachedInput: false,
  });

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(ALL_MODELS.filter((m) => DEFAULT_SELECTED_MODELS.includes(m.model)).map(modelKey))
  );

  function toggleModel(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const rows: CostRow[] = useMemo(() => {
    const requestsPerMonth = usage.requestUnit === "day" ? usage.requests * 30 : usage.requests;
    return ALL_MODELS.filter((m) => selectedKeys.has(modelKey(m)))
      .map((model) => ({
        model,
        breakdown: calcCost(
          model,
          usage.inputTokensPerRequest,
          usage.outputTokensPerRequest,
          requestsPerMonth,
          usage.useCachedInput
        ),
      }))
      .sort((a, b) => a.breakdown.totalCost - b.breakdown.totalCost);
  }, [usage, selectedKeys]);

  const assumption =
    `${usage.inputTokensPerRequest.toLocaleString()} input + ${usage.outputTokensPerRequest.toLocaleString()} output tokens` +
    ` × ${usage.requests.toLocaleString()} requests / ${usage.requestUnit}` +
    (usage.useCachedInput ? " · cached input rate where published" : "");

  return (
    <section>
      <SectionHeader
        eyebrow="Cost Calculator"
        title="Estimate the cost of your workload"
        description="Enter expected token volumes; results update live and sort cheapest-first."
      />

      <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <UsageInputForm value={usage} onChange={setUsage} />
          <ModelSelector models={ALL_MODELS} selectedKeys={selectedKeys} onToggle={toggleModel} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {rows.length === 0 ? (
            <div className="border shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
              <EmptyState title="No models selected" description="Choose at least one model to see a cost comparison." />
            </div>
          ) : (
            <>
              <CostBarChart rows={rows} periodLabel={`per ${usage.requestUnit}`} />
              <CostResultsTable rows={rows} assumption={assumption} />
            </>
          )}
        </div>
      </div>

      <MethodologyNote
        items={[
          "Cost = (input tokens × requests ÷ 1,000,000 × input rate) + (output tokens × requests ÷ 1,000,000 × output rate), using current list prices from the Pricing Comparison tab.",
          "Toggling \"cached input\" substitutes the provider's published cached-input rate for input tokens only; output tokens are always billed at the standard output rate. Models without a published cached rate are unaffected by the toggle.",
          "A \"per day\" request volume is multiplied by 30 to approximate a monthly figure — no calendar-accurate day counts are used.",
          "No volume discounts, minimum commitments, batch-API discounts, or rate limits are modeled; this is a linear estimate only.",
        ]}
        sources={[
          ...PROVIDERS.map((p) => ({ label: `${p} pricing`, url: PROVIDER_SOURCE_URL[p] })),
          { label: "Artificial Analysis (cached pricing)", url: "https://artificialanalysis.ai/models" },
        ]}
      />
    </section>
  );
}
