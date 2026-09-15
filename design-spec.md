# LLM Pricing Dashboard — Design Spec

> **Status: describes the app as built.** This reflects the actual implementation in
> `src/app` and `src/components` as of this writing — every route, component, data
> source, and interaction that exists in code today. It supersedes the earlier
> "proposed design" version of this document. Hand this to a design tool as ground
> truth for what it's redesigning.

## 1. Purpose

A single-page dashboard for comparing LLM API pricing, estimating cost for a given
usage pattern, relating price to model capability, and seeing how pricing has moved
over time. All data is static, checked into the repo as JSON, sourced from provider
pricing pages and third-party trackers (Artificial Analysis, BenchLM) — there is no
live API or backend.

## 2. Route structure

One route: `/` (`src/app/page.tsx`), which renders a single client component,
`DashboardApp`. There is no server-side data fetching or dynamic routing — all data
is imported at build time from `src/data/*.json`.

- `src/app/layout.tsx` — root HTML shell. Loads the Geist Sans / Geist Mono fonts via
  `next/font/google`, sets page `<title>`/`<meta description>` ("LLM Pricing
  Dashboard"), and wraps `children` in a full-height flex column `<body>`.
- `src/app/globals.css` — defines the color system as CSS custom properties (see
  §9) and maps them into Tailwind v4 via `@theme inline`, so components consume them
  as ordinary utility classes (`bg-card`, `text-muted-foreground`, etc.) rather than
  inline styles, except where a color is genuinely data-driven (provider/series
  colors), which use inline `style` bound to the same CSS variables.
- `src/app/page.tsx` — renders `<DashboardApp />`. No other content.

## 3. App shell — `DashboardApp`

Client component (`"use client"`) that owns the one piece of shared UI state: which
tab is active (`useState<TabKey>`, default `"pricing"`). Renders, top to bottom:

1. **Header row** — "LLM Pricing Dashboard" (bold, 19px) with a subtitle ("Compare
   pricing, estimate cost, and track changes across LLM providers"), and a small
   30×30px accent-colored square on the right (a placeholder logo mark — not
   interactive).
2. **`TabNav`** — the four-tab bar.
3. The active tab's component: `PricingComparisonTab`, `CostCalculatorTab`,
   `CostVsCapabilityTab`, or `PricingHistoryTab`, mounted/unmounted on switch (not
   hidden via CSS — each tab's local state, e.g. filters or the selected drawer
   model, resets when you navigate away and back).

Tab switching is pure client-side React state — there is no URL query param for the
active tab, so it is not deep-linkable or preserved on refresh.

## 4. `TabNav` (`src/components/TabNav.tsx`)

Renders four `role="tab"` buttons in a `role="tablist"`: **Pricing Comparison**,
**Cost Calculator**, **Cost vs. Capability**, **Pricing History**. The active tab is
bold with a 2px accent-colored underline; inactive tabs are muted and brighten on
hover. Clicking a tab calls the `onChange` callback passed down from `DashboardApp`.
Horizontally scrollable on narrow viewports (`overflow-x-auto`) rather than wrapping.

## 5. Data model

Three static JSON files in `src/data/`, joined and normalized by `src/lib/pricing.ts`:

- **`pricing.json`** — 16 models across 6 providers (OpenAI, Anthropic, Google,
  Mistral, DeepSeek, xAI). Each model has: `model` (name), `tier`
  (`frontier` | `mid-range` | `lightweight`), `inputPerMillion`, `outputPerMillion`,
  `cachedInputPerMillion` (nullable), `contextWindowTokens` (nullable), `notes`
  (nullable free text, often with sourcing detail), and a `pricingModel` discriminator
  (`"token"` or `"credit"` — all current entries are `"token"`). Each provider block
  also carries a `sourceUrl` to its official pricing page.
- **`benchmarks.json`** — per-model `intelligenceIndex` (0–100ish blended benchmark
  score) and `valueScore` (capability points per dollar of output cost), joined to
  `pricing.json` by provider + model name. Not every model has a `valueScore`.
- **`pricing-history.json`** — a curated, non-continuous list of industry pricing
  **milestones** (launches and price cuts) from GPT-4's March 2023 launch through
  September 2026, each with `date`, `provider` (nullable), `model`, `event`
  (`"launch"` | `"price cut"` | `"entered price index"`), either
  `inputPerMillion`/`outputPerMillion` or a single `blendedPerMillion`, `notes`, and
  `sourceConfidence` (`"high"` | `"aggregator"`). It also includes one special
  provider-less entry, a "Frontier token price index" snapshot (index value 16,
  vs. 100 at the March 2023 baseline).
- **`src/lib/normalizePricing.ts`** — converts either token-priced or credit-priced
  raw entries into a common `NormalizedPricing` shape (USD per 1M tokens for input
  and output). All current data is already token-priced, but every model is still
  routed through this so a future credit-billed provider needs no new branching.
- **`src/lib/pricing.ts`** — builds `ALL_MODELS` (the joined, normalized model list),
  exposes `PROVIDERS`, a fixed `PROVIDER_COLOR_VAR` map (one CSS color variable per
  provider), the cost-calculation function `calcCost`, and history helpers
  (`PRICE_MILESTONES`, `FRONTIER_INDEX`, `milestoneBlendedPrice`).
- **`src/lib/format.ts`** — `formatUSD` (adaptive precision: 3 decimals under $1, else
  2, with thousands separators), `formatContext` ("1M" / "256K"), `formatDate`.

## 6. Shared components

Used across two or more tabs:

- **`ProviderBadge`** (`ProviderBadge.tsx`) — a small colored dot + provider name.
  Standalone version exists but most tabs inline the same dot-plus-label pattern
  directly for layout control.
- **`PriceTag`** (`PriceTag.tsx`) — formats a dollar amount via `formatUSD` with a
  muted `/1M` suffix.
- **`ProviderFilter`** (`ProviderFilter.tsx`) — a row of toggleable pill buttons, one
  per provider, each with the provider's dot color. Multi-select: click to
  show/hide that provider everywhere on the current tab. All providers are selected
  by default. Used on the Pricing Comparison, Cost vs. Capability, and Pricing
  History tabs.
- **`ModelSearch`** (`ModelSearch.tsx`) — a bordered text input with a magnifying-glass
  icon; filters the current tab's model list by substring match on model name
  (case-insensitive). Used on Pricing Comparison and Cost vs. Capability.
- **`SegmentedControl`** (`SegmentedControl.tsx`) — a generic, reusable button-group
  (single-select). Backs every toggle in the app: the tier filter, the Cost vs.
  Capability axis-metric toggles, and the Pricing History event/time-range filters.
- **`EmptyState`** (`EmptyState.tsx`) — a dashed-border panel with a search icon,
  title, and description, shown whenever active filters produce zero results.
- **`DataAsOfNote`** (`DataAsOfNote.tsx`) — small muted footer text: "Data as of
  [date] · sourced from each provider's official pricing page," reading the date
  from `pricing.json`'s `generatedAt`.
- **`ModelDetailDrawer`** (`ModelDetailDrawer.tsx`) — a right-side overlay panel
  (click-outside or Escape to close) shown when a model row/point is selected.
  Displays: provider dot + name, a tier badge, model name; an **Overview** section
  (context window); a **Pricing** section (input, output, cached-input per 1M,
  each via `PriceTag`-style formatting); a **Capability** section (intelligence
  index, value score) when benchmark data exists; the model's `notes` text in a
  muted callout box, if present; and a "View source pricing page" link out to the
  provider's `sourceUrl`. Triggered from the Pricing Comparison table (row click).

## 7. Tab: Pricing Comparison (`PricingComparisonTab.tsx`)

**State:** search text, selected providers (default: all), tier filter (default:
"All tiers"), and the currently open drawer model (default: none).

**Layout:** a toolbar row (`ModelSearch` + `ProviderFilter` on the left, a tier
`SegmentedControl` — All tiers / Frontier / Mid-range / Lightweight — on the right),
then either an `EmptyState` or the table, then `DataAsOfNote`.

**`PricingTable`** (`PricingTable.tsx`): one row per model, columns Provider (dot +
name), Model, Context, Input/1M, Output/1M, Cached/1M. Every numeric column header
is clickable to sort (ascending, click again to reverse); the active sort column
shows a filled accent-colored arrow, others a faint gray one. Default sort: Input/1M
ascending. Rows zebra-stripe. Clicking anywhere on a row opens `ModelDetailDrawer`
for that model. A trailing chevron icon hints the row is expandable/clickable.

## 8. Tab: Cost Calculator (`CostCalculatorTab.tsx`)

**State:** usage inputs (input tokens/request, output tokens/request, request count,
request-count unit "day"/"month", a "use cached input pricing" toggle) and a set of
selected model keys.

**Defaults:** 1,200 input tokens/request, 600 output tokens/request, 50,000
requests/month, cached pricing off. Six models are pre-selected (one representative
model per provider: GPT-5.6 Terra, Claude Sonnet 5, Gemini 3.8 Flash, Mistral Medium
3.5, DeepSeek-V4-Pro, Grok 4.6).

**Layout:** a left sidebar (`UsageInputForm` above `ModelSelector`) and a right
column with results.

- **`UsageInputForm`** — number fields for input/output tokens per request; a
  requests field paired with a day/month segmented toggle; a "use cached input
  pricing" switch; and a one-line note explaining the cost formula. All inputs are
  live — no submit button, results recompute on every keystroke/toggle.
- **`ModelSelector`** — a scrollable checklist of all 16 models (checkbox + provider
  dot + name); click to add/remove a model from the comparison.
- **`CostResultsTable`** — one row per selected model, sorted ascending by total
  cost: Model, Input cost, Output cost, Total. The cheapest row is highlighted
  (accent-tinted background) and tagged with a "Cheapest" pill.
- **`CostBarChart`** — a horizontal bar per selected model (same ascending order),
  each bar segmented into input cost (light blue) and output cost (accent blue),
  with a legend and the total dollar figure at the right of each bar.
- If no models are selected, an `EmptyState` replaces the results.

Cost math (`calcCost` in `pricing.ts`): requests are normalized to a monthly count
(day × 30); `cost = (tokens ÷ 1,000,000) × price-per-1M`, summed for input and
output; the cached-input price is substituted for the standard input price when the
toggle is on and the model has one.

## 9. Tab: Cost vs. Capability (`CostVsCapabilityTab.tsx`)

**State:** search text, selected providers (default: all), X-axis metric (Input
price / Output price / **Blended**, default Blended), Y-axis metric (**Intelligence
index** / Value score, default Intelligence index).

**Layout:** toolbar (search + provider filter on the left, the two
`SegmentedControl` axis toggles on the right), then `CapabilityScatterChart`, then
`DataAsOfNote`.

**`CapabilityScatterChart`**: one dot per model, positioned by the selected X metric
(price, **log scale**) and Y metric, colored by provider. Hovering a dot shows a
tooltip card with model name, provider, exact price, and the Y-metric value.
X-axis tick labels are auto-generated at "nice" log steps (1/2/5 × 10ⁿ) across the
data's actual price range. Below the chart: a note when models are excluded for
lacking the selected Y metric (e.g. DeepSeek-V4-Flash has no published value
score), and a legend listing every provider's color. Models with a non-positive
price or a null Y value are filtered out before plotting.

## 10. Tab: Pricing History (`PricingHistoryTab.tsx`)

**State:** selected providers (default: all), event-type filter (All events /
Launches / Price cuts, default All), and a "since year" filter (auto-built from the
years present in the data — "All time" plus one option per later year, e.g.
"2025–now", "2026–now").

**Layout, top to bottom:**

1. **Headline stat card** — "‑84%" in large type, "since GPT-4's March 2023 launch,"
   with the index's own description text (BenchLM's frontier token price index, 100
   → 16) alongside it. Static — not affected by the filters below.
2. Filter row — `ProviderFilter` on the left, event-type and year `SegmentedControl`s
   on the right.
3. **`PriceHistoryChart`** — a scatter of every milestone event by date (x, linear)
   vs. blended price (y, **log scale**), colored by provider; filled dots are
   launches, hollow-ringed dots are price cuts (a small legend explains the
   distinction). Hovering a point shows date, provider, model, event type, and
   price. X-axis ticks are calendar years.
4. **`PriceChangeTable`** — every filtered milestone as a row, newest first: Date,
   Model (with its notes text underneath, when present), Event, Price (either
   "input / output" or a single "blended" figure, depending on what the source
   reported), and a Source confidence pill ("Verified" for `high`, "Aggregator"
   otherwise).

An `EmptyState` replaces the chart and table if the current filters match no
milestones.

## 11. Interaction summary (cross-tab)

| Interaction | Where |
|---|---|
| Switch tabs | `TabNav`, all pages (resets that tab's local state) |
| Filter by provider | Pricing Comparison, Cost vs. Capability, Pricing History |
| Filter by tier | Pricing Comparison |
| Search model by name | Pricing Comparison, Cost vs. Capability |
| Sort table column | Pricing Comparison (`PricingTable`) |
| Click a row/point for detail | Pricing Comparison → `ModelDetailDrawer` |
| Enter usage numbers, toggle cached pricing | Cost Calculator |
| Toggle day/month | Cost Calculator |
| Check/uncheck models to compare | Cost Calculator |
| Switch X/Y chart metric | Cost vs. Capability |
| Hover a chart point for a tooltip | Cost vs. Capability, Pricing History |
| Filter by event type / year | Pricing History |
| Close the detail drawer (click outside, ✕, or Escape) | Pricing Comparison |
| Follow "View source pricing page" | Model detail drawer |

## 12. Theming

Light/dark mode follows `prefers-color-scheme` (no manual toggle in the UI). All
colors are CSS custom properties defined in `globals.css`:

- Neutrals: `--background`, `--foreground`, `--card`, `--muted`, `--muted-2`,
  `--border`, `--muted-foreground`, `--faint-foreground`.
- Brand/interactive: `--accent`, `--accent-foreground`, `--accent-soft` (used for
  active tab underline, active segmented-control option, focus rings, the
  "cheapest" highlight/badge, links).
- Provider identity: `--series-1`…`--series-6` (OpenAI, Anthropic, Google, Mistral,
  DeepSeek, xAI, in that order) — one fixed color per provider, reused for filter
  chips, table dots, chart points, and legends everywhere.
- Chart-specific: `--bar-input` / `--bar-output` (the two segments of the Cost
  Calculator's bars — not tied to provider identity).
- Status: `--good` / `--critical` (defined, currently only referenced for future
  price-direction styling; the current `PriceChangeTable` does not yet color
  increases vs. decreases differently).
- Typography: Geist Sans throughout (`--font-sans`), tabular figures
  (`.num` / `font-variant-numeric: tabular-nums`) on every price, count, and date
  column so numbers align.

## 13. Known simplifications (current implementation, not the original spec)

- No batch-pricing toggle or modality filter — `pricing.json` has no such fields.
- No "column visibility" control on the Pricing Comparison table — all columns are
  always shown; the table scrolls horizontally on narrow viewports instead.
- Tab state is component state, not a URL query param — tabs are not deep-linkable.
- Pricing History is event/milestone-based (scatter + changelog), not a continuous
  per-model line chart, because the underlying data is a curated timeline of
  discrete launches and price cuts, not continuous daily pricing.
