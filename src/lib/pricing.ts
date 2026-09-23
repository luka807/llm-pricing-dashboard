import pricingData from "@/data/pricing.json";
import benchmarksData from "@/data/benchmarks.json";
import historyData from "@/data/pricing-history.json";
import { normalizeProviderModels, type ModelPricing } from "@/lib/normalizePricing";

export type Provider = (typeof pricingData.providers)[number]["provider"];
export type Tier = "frontier" | "mid-range" | "lightweight";

export type Model = {
  provider: Provider;
  sourceUrl: string;
  model: string;
  tier: Tier;
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion: number | null;
  contextWindowTokens: number | null;
  notes: string | null;
  intelligenceIndex: number | null;
  valueScore: number | null;
};

export const PROVIDERS: Provider[] = pricingData.providers.map((p) => p.provider as Provider);

export const PROVIDER_SOURCE_URL: Record<Provider, string> = Object.fromEntries(
  pricingData.providers.map((p) => [p.provider, p.sourceUrl])
) as Record<Provider, string>;

export const PROVIDER_COLOR_VAR: Record<Provider, string> = {
  OpenAI: "var(--series-1)",
  Anthropic: "var(--series-2)",
  Google: "var(--series-3)",
  Mistral: "var(--series-4)",
  DeepSeek: "var(--series-5)",
  xAI: "var(--series-6)",
} as Record<Provider, string>;

// Curated generation-to-generation lineages for Tab 4's chart — e.g. Gemini
// 1.0 Pro -> 1.5 Pro -> 2.5 Pro -> 3 Pro Preview -> 3.1 Pro Preview is one
// continuous "Pro tier" line, not four unrelated models. Hand-maintained
// rather than inferred from names, since a wrong guess here (e.g. treating a
// same-tier sibling as a successor) would misstate the pricing history.
// Anything not listed here falls back to being its own single-model lineage.
export const MODEL_LINEAGES: { provider: Provider; label: string; models: string[] }[] = [
  // GPT-6 Astra deliberately excluded: it launched alongside GPT-5.6 Sol as a
  // separate, pricier frontier option, not a replacement for it — both are
  // still sold today (see pricing.json), so chaining them would falsely
  // suggest a succession and bury Astra's own current price mid-line.
  { provider: "OpenAI", label: "OpenAI flagship", models: ["GPT-3.5 Turbo", "GPT-4 (8K)", "GPT-4 Turbo", "GPT-4o", "GPT-5", "GPT-5.6 Sol"] },
  { provider: "Anthropic", label: "Claude flagship", models: ["Claude 2", "Claude 3 Opus", "Claude Opus 4.5", "Claude Opus 5"] },
  { provider: "Anthropic", label: "Claude Sonnet", models: ["Claude 3 Sonnet", "Claude 3.5 Sonnet", "Claude Sonnet 5"] },
  { provider: "Anthropic", label: "Claude Haiku", models: ["Claude 3 Haiku", "Claude 3.5 Haiku", "Claude Haiku 4.5"] },
  { provider: "Google", label: "Gemini Pro", models: ["Gemini 1.0 Pro", "Gemini 1.5 Pro", "Gemini 2.5 Pro", "Gemini 3 Pro Preview", "Gemini 3.1 Pro Preview"] },
  { provider: "Google", label: "Gemini Flash", models: ["Gemini 1.5 Flash", "Gemini 2.0 Flash", "Gemini 2.5 Flash", "Gemini 3 Flash Preview", "Gemini 3.6 Flash", "Gemini 3.7 Flash", "Gemini 3.8 Flash"] },
  { provider: "Google", label: "Gemini Flash-Lite", models: ["Gemini 2.5 Flash-Lite", "Gemini 3.5 Flash-Lite"] },
  { provider: "DeepSeek", label: "DeepSeek flagship", models: ["DeepSeek-V3", "DeepSeek-V3.1", "DeepSeek-V3.2-Exp", "DeepSeek-V4-Pro"] },
  { provider: "DeepSeek", label: "DeepSeek Flash", models: ["DeepSeek-V4-Flash", "DeepSeek-V4.1-Flash"] },
  { provider: "xAI", label: "Grok flagship", models: ["Grok 4", "Grok 4.3", "Grok 4.5", "Grok 4.6", "Grok 4.7"] },
];

export const MODEL_TO_LINEAGE_KEY: Map<string, string> = new Map(
  MODEL_LINEAGES.flatMap((lineage) => lineage.models.map((model) => [`${lineage.provider}::${model}`, `${lineage.provider}::${lineage.label}`]))
);

function findBenchmark(provider: string, model: string) {
  const providerEntry = benchmarksData.providers.find((p) => p.provider === provider);
  return providerEntry?.models.find((m) => m.model === model) ?? null;
}

export const ALL_MODELS: Model[] = pricingData.providers.flatMap((p) =>
  normalizeProviderModels(p.models as unknown as ModelPricing[]).map((normalized) => {
    const bench = findBenchmark(p.provider, normalized.model);
    return {
      provider: p.provider as Provider,
      sourceUrl: p.sourceUrl,
      model: normalized.model,
      tier: normalized.tier as Tier,
      inputPerMillion: normalized.inputPerMillion,
      outputPerMillion: normalized.outputPerMillion,
      cachedInputPerMillion: normalized.cachedInputPerMillion,
      contextWindowTokens: normalized.contextWindowTokens,
      notes: normalized.notes,
      intelligenceIndex: bench?.intelligenceIndex ?? null,
      valueScore: bench?.valueScore ?? null,
    };
  })
);

export const DATA_AS_OF = pricingData.generatedAt;

export type PriceMilestone = (typeof historyData.milestones)[number];

export const PRICE_MILESTONES: PriceMilestone[] = historyData.milestones.filter(
  (m) => m.model !== "Frontier token price index"
);

export const FRONTIER_INDEX = historyData.milestones.find(
  (m) => m.model === "Frontier token price index"
);

export const FRONTIER_INDEX_BASELINE = historyData.baseline;

export function milestoneBlendedPrice(m: PriceMilestone): number | null {
  if (typeof m.inputPerMillion === "number" && typeof m.outputPerMillion === "number") {
    return (m.inputPerMillion + m.outputPerMillion) / 2;
  }
  return null;
}

export type CostBreakdown = {
  inputCost: number;
  outputCost: number;
  totalCost: number;
};

export function calcCost(
  model: Pick<Model, "inputPerMillion" | "outputPerMillion" | "cachedInputPerMillion">,
  inputTokensPerRequest: number,
  outputTokensPerRequest: number,
  requests: number,
  useCachedInput: boolean
): CostBreakdown {
  const effectiveInputPrice =
    useCachedInput && model.cachedInputPerMillion != null
      ? model.cachedInputPerMillion
      : model.inputPerMillion;

  const inputCost = ((inputTokensPerRequest * requests) / 1_000_000) * effectiveInputPrice;
  const outputCost = ((outputTokensPerRequest * requests) / 1_000_000) * model.outputPerMillion;

  return { inputCost, outputCost, totalCost: inputCost + outputCost };
}
