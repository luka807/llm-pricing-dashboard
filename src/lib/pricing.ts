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

export const PROVIDER_COLOR_VAR: Record<Provider, string> = {
  OpenAI: "var(--series-1)",
  Anthropic: "var(--series-2)",
  Google: "var(--series-3)",
  Mistral: "var(--series-4)",
  DeepSeek: "var(--series-5)",
  xAI: "var(--series-6)",
} as Record<Provider, string>;

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
  if ("blendedPerMillion" in m && typeof m.blendedPerMillion === "number") {
    return m.blendedPerMillion;
  }
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
