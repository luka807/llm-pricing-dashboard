"use client";

import { useMemo, useState } from "react";
import { ALL_MODELS, calcCost } from "@/lib/pricing";
import UsageInputForm, { type UsageInputs } from "@/components/UsageInputForm";
import ModelSelector, { modelKey } from "@/components/ModelSelector";
import CostResultsTable, { type CostRow } from "@/components/CostResultsTable";
import CostBarChart from "@/components/CostBarChart";
import EmptyState from "@/components/EmptyState";

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

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:flex-row sm:px-8">
      <div className="flex w-full shrink-0 flex-col gap-4 sm:w-80">
        <UsageInputForm value={usage} onChange={setUsage} />
        <ModelSelector models={ALL_MODELS} selectedKeys={selectedKeys} onToggle={toggleModel} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {rows.length === 0 ? (
          <EmptyState title="No models selected" description="Choose at least one model to see a cost comparison." />
        ) : (
          <>
            <CostResultsTable rows={rows} />
            <CostBarChart rows={rows} />
          </>
        )}
      </div>
    </div>
  );
}
