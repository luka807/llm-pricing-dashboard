/**
 * Normalizes any provider's pricing entry in pricing.json to a common unit:
 * USD per 1,000,000 tokens (input and output separately).
 *
 * Why this exists: not every provider prices per token. Some sell "credits"
 * or "compute units" that get consumed at some conversion rate per token
 * (or even per request, independent of token count). Tab 1's whole job is
 * putting every provider on the same axis, so every model — whatever its
 * native pricing model — should be run through this before it's displayed,
 * sorted, or fed into Tab 2's calculator.
 *
 * None of the 6 providers currently in pricing.json (OpenAI, Anthropic,
 * Google, Mistral, DeepSeek, xAI) turned out to need this — they all quote
 * straight USD-per-million-tokens rates, and are tagged `pricingModel: "token"`
 * accordingly. This is here so that if you add a provider that bills in
 * credits (AWS Bedrock Provisioned Throughput, Azure OpenAI PTUs, some
 * regional/Chinese providers, etc.), Tab 1 doesn't need new branching logic —
 * you just add a correctly-shaped entry to pricing.json.
 */

export type TokenPricedModel = {
  model: string;
  tier: "frontier" | "mid-range" | "lightweight";
  pricingModel: "token";
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion?: number | null;
  contextWindowTokens?: number | null;
  notes?: string | null;
};

export type CreditPricedModel = {
  model: string;
  tier: "frontier" | "mid-range" | "lightweight";
  pricingModel: "credit";
  /** USD cost of a single credit, e.g. from the provider's "buy credits" page ($10 for 10,000 credits -> 0.001). */
  usdPerCredit: number;
  /**
   * How many credits one input token consumes. If the provider instead
   * publishes "tokens per credit" (the inverse), convert with
   * creditsPerToken = 1 / tokensPerCredit before filling this in.
   */
  inputCreditsPerToken: number;
  outputCreditsPerToken: number;
  cachedInputPerMillion?: number | null;
  contextWindowTokens?: number | null;
  notes?: string | null;
};

export type ModelPricing = TokenPricedModel | CreditPricedModel;

export type NormalizedPricing = {
  model: string;
  tier: ModelPricing["tier"];
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion: number | null;
  contextWindowTokens: number | null;
  notes: string | null;
};

/**
 * Converts any ModelPricing entry to USD-per-million-tokens for both
 * input and output, regardless of how the provider natively bills.
 */
export function normalizeModelPricing(entry: ModelPricing): NormalizedPricing {
  const base = {
    model: entry.model,
    tier: entry.tier,
    cachedInputPerMillion: entry.cachedInputPerMillion ?? null,
    contextWindowTokens: entry.contextWindowTokens ?? null,
    notes: entry.notes ?? null,
  };

  if (entry.pricingModel === "token") {
    return {
      ...base,
      inputPerMillion: entry.inputPerMillion,
      outputPerMillion: entry.outputPerMillion,
    };
  }

  // Credit-based: $/credit * credits/token * 1,000,000 tokens/million = $/million tokens
  const ONE_MILLION = 1_000_000;
  return {
    ...base,
    inputPerMillion: entry.usdPerCredit * entry.inputCreditsPerToken * ONE_MILLION,
    outputPerMillion: entry.usdPerCredit * entry.outputCreditsPerToken * ONE_MILLION,
  };
}

/**
 * Convenience helper: given a provider's raw model list from pricing.json
 * (a mix of token- and credit-priced entries), returns every model
 * normalized to the same USD-per-million-tokens shape Tab 1 renders.
 */
export function normalizeProviderModels(models: ModelPricing[]): NormalizedPricing[] {
  return models.map(normalizeModelPricing);
}

/*
 * Worked example, for when you do hit a credit-based provider:
 *
 * Provider docs say: "$10 buys 10,000 credits. Chat completion consumes
 * 1 credit per 250 input tokens and 1 credit per 100 output tokens."
 *
 *   usdPerCredit = 10 / 10000 = 0.001
 *   inputCreditsPerToken  = 1 / 250 = 0.004
 *   outputCreditsPerToken = 1 / 100 = 0.01
 *
 *   inputPerMillion  = 0.001 * 0.004 * 1_000_000 = $4.00 / million input tokens
 *   outputPerMillion = 0.001 * 0.01  * 1_000_000 = $10.00 / million output tokens
 *
 * If instead the provider bills per-request rather than per-token (a flat
 * number of credits per call regardless of length), there is no faithful
 * per-token conversion — note that explicitly in that model's `notes` field
 * rather than forcing a number, since averaging it in would be misleading
 * on the Tab 1 chart.
 */
