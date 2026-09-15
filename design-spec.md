# LLM Pricing Dashboard — Design Spec

> **Status: proposed design, not yet built.** The repository currently contains only
> the default `create-next-app` scaffold (one welcome page, no tabs, no components,
> no data). This document specifies the dashboard described in `AGENTS.md` so a
> design tool can produce mockups/UI for it. Nothing below exists in code yet —
> treat it as the target to design toward, not a description of a running app.

## 1. Purpose

A single-page dashboard that helps someone choose and budget for an LLM API by
comparing pricing across providers and models, estimating cost for their own usage,
relating price to model capability, and seeing how pricing has moved over time.

## 2. Global layout

- **App shell**: a header/title bar at the top ("LLM Pricing Dashboard" + short
  subtitle), full-width content area below, no sidebar.
- **Tab bar**: a horizontal row of four tabs directly under the header, always
  visible. Only one tab's content is shown at a time (client-side tab switching,
  no page navigation/reload — likely a single route `/` with tab state in the URL
  as a query param, e.g. `?tab=calculator`, so a tab is linkable/bookmarkable and
  survives refresh).
- **Tabs, in order**:
  1. Pricing Comparison (default/landing tab)
  2. Cost Calculator
  3. Cost vs. Capability
  4. Pricing History
- **Footer** (optional/light): data-as-of date and a note on sources.
- **Theming**: supports light and dark mode (Tailwind `dark:` classes, matches
  system preference), consistent with the scaffold's existing dark-mode setup.
- **Responsive behavior**: tab bar collapses to a horizontal scroll or dropdown
  below a mobile breakpoint; tables scroll horizontally rather than reflow;
  charts resize to container width.

## 3. Shared data model

All tabs read from a common in-repo dataset (`src/data/`), not a live API.

- **Provider**: id, name, logo/color.
- **Model**: id, provider id, display name, family, modalities (text/image/etc.),
  context window size, release date, "current" flag (vs. deprecated).
- **PricingEntry**: model id, unit prices — input tokens (per 1M), output tokens
  (per 1M), optional cached-input price, optional batch-API discount price,
  currency, effective date.
- **CapabilityScore**: model id, benchmark name (e.g. MMLU, a general "quality
  index"), score, source/date.
- **PricingHistoryEntry**: model id, price (input/output), effective date, change
  type (initial listing / increase / decrease).

This model backs all four tabs; each tab is a different view/filter/chart over it.

## 4. Shared components

These are used across multiple tabs and should be designed once, reused everywhere.

- **`TabNav`** — the four-item tab bar. Displays tab label, highlights the active
  tab, shows a count badge only if relevant (none planned initially). Interaction:
  click/tap a tab to switch; keyboard arrow-key navigation between tabs.
- **`ProviderFilter`** — multi-select checklist or chip group of providers (e.g.
  OpenAI, Anthropic, Google, Meta, Mistral). Interaction: toggle a provider chip
  to show/hide its models everywhere on the current tab.
- **`ModelSearch`** — a text input that filters the visible model list/table/chart
  by name as the user types.
- **`ProviderBadge`** — small colored pill showing a provider's name/logo, used in
  table rows, legend entries, and tooltips for quick visual identification.
- **`PriceTag`** — formatted price display (e.g. "$3.00 / 1M input tokens"),
  used in table cells, calculator results, and chart tooltips.
- **`EmptyState`** — shown when a filter/search yields no matching models.
- **`DataAsOfNote`** — small text noting the date the underlying pricing data was
  last updated, shown near the top or bottom of each tab.

## 5. Tab: Pricing Comparison

**Purpose**: let the user scan and compare raw per-token pricing across models
side by side.

**Components**:
- `ProviderFilter` and `ModelSearch` above the table, plus a **modality filter**
  (text / vision / audio) and a toggle for **"show deprecated models"**.
- **`PricingTable`** — the main element. Columns: Provider (badge), Model name,
  Context window, Input price / 1M tokens, Output price / 1M tokens, Cached-input
  price (if available), Batch price (if available). Sortable by clicking any
  numeric column header (ascending/descending toggle). Rows group visually by
  provider (subtle background banding or sticky provider sub-headers).
- **`ColumnVisibilityMenu`** — lets the user show/hide optional columns (cached
  price, batch price, context window) to reduce clutter.
- Row interaction: clicking a row expands an inline detail panel or opens a side
  drawer with fuller model info (release date, modalities, notes) — a
  **`ModelDetailDrawer`**.

**Data displayed**: full PricingEntry rows joined with Model + Provider, filtered
by the shared filters.

## 6. Tab: Cost Calculator

**Purpose**: estimate the real dollar cost of a workload given expected token
volumes, and compare that estimate across models.

**Components**:
- **`UsageInputForm`** — the primary interactive element:
  - Numeric input: input tokens per request (or per month).
  - Numeric input: output tokens per request (or per month).
  - Numeric input: number of requests (with a unit toggle: per day / per month).
  - Optional toggle: "use cached input pricing where available."
  - Optional toggle: "use batch pricing where available."
  - Live-updates results as the user types (debounced), no submit button required.
- **`ModelSelector`** — checklist to choose which models to include in the
  comparison (defaults to a handful of popular models, reuses `ProviderFilter`
  styling).
- **`CostResultsTable`** — one row per selected model: input cost, output cost,
  total cost (per the chosen time unit), sorted ascending by total cost so the
  cheapest option surfaces first. Cheapest row visually highlighted.
- **`CostBarChart`** — horizontal bar chart mirroring the results table, one bar
  per model, length = total estimated cost, stacked/segmented into input vs.
  output cost. Hover tooltip shows exact dollar breakdown (`PriceTag`).
- **`AssumptionsNote`** — small text stating the formula used (e.g. "cost =
  (tokens / 1,000,000) × price per 1M tokens") so results are transparent.

**Data displayed**: derived (computed client-side) from PricingEntry ×
user-entered usage numbers. No server round-trip needed.

## 7. Tab: Cost vs. Capability

**Purpose**: visualize whether higher price correlates with higher capability, to
spot good-value models.

**Components**:
- **`ScatterPlot`** — X axis: price (a toggleable metric — input price, output
  price, or a blended price), Y axis: capability score. One point per model,
  colored by provider (shared color mapping with `ProviderBadge`), point size
  optionally encoding context window. Hovering a point shows a tooltip with model
  name, provider, exact price, and score (`PriceTag` reused).
- **`AxisMetricToggle`** — lets the user switch what's plotted on the X axis
  (input price / output price / blended) and Y axis (which benchmark, if more
  than one is available).
- **`ProviderFilter`** and **`ModelSearch`** — same shared components, filtering
  which points are plotted.
- **`QuadrantLabels`** or a simple "best value" reference line/diagonal — optional
  visual aid showing the value frontier (models that are cheap for their
  capability).
- Clicking a point opens the same `ModelDetailDrawer` used in the Pricing
  Comparison tab.

**Data displayed**: Model × PricingEntry × CapabilityScore joins.

**Empty/edge case**: models without a capability score are excluded from the plot
and listed in a small "not enough data" note rather than silently dropped.

## 8. Tab: Pricing History

**Purpose**: show how a model's (or provider's) pricing has changed over time.

**Components**:
- **`ModelSelector`** (single or multi-select, reused styling) — choose which
  model(s)' price history to plot; defaults to a small preset set of well-known
  models.
- **`PriceHistoryLineChart`** — X axis: date, Y axis: price per 1M tokens, one
  line per selected model (and typically two lines per model — input and output —
  distinguished by line style, e.g. solid vs. dashed, sharing that model's color).
  Step/line chart since prices change in discrete jumps, not continuously.
  Hovering shows the exact price and effective date at that point.
- **`MetricToggle`** — switch the chart between input price and output price (or
  show both, per above).
- **`PriceChangeTable`** — a chronological list/table below the chart: date,
  model, metric (input/output), old price → new price, % change, direction
  (increase/decrease shown with an up/down indicator and color).
- **`TimeRangeControl`** — quick-select range (e.g. Last 6 months / 1 year / All
  time) or a date-range picker to zoom the chart and filter the table.

**Data displayed**: PricingHistoryEntry series per selected model, sorted by date.

## 9. Interaction summary (cross-tab)

| Interaction | Where |
|---|---|
| Switch tabs | Tab bar, all pages |
| Filter by provider | Pricing Comparison, Cost vs. Capability, (Cost Calculator via model selector) |
| Search model by name | Pricing Comparison, Cost vs. Capability |
| Sort table column | Pricing Comparison, Cost Calculator results |
| Toggle optional columns | Pricing Comparison |
| Enter usage numbers | Cost Calculator |
| Toggle cached/batch pricing | Cost Calculator |
| Switch chart axis metric | Cost vs. Capability |
| Switch chart price metric | Pricing History |
| Select time range | Pricing History |
| Hover for tooltip detail | All charts |
| Click row/point for detail drawer | Pricing Comparison, Cost vs. Capability |
| Toggle light/dark mode | Global (follows system, no explicit switch planned) |

## 10. States to design for each data view

- **Loaded/default** — data present, no filters applied.
- **Filtered/empty** — filters or search exclude all rows/points; show `EmptyState`.
- **Loading** (if data ever moves to an async fetch instead of static import) —
  skeleton rows/chart placeholder.
- **Detail drawer open** — `ModelDetailDrawer` overlays or pushes content.

## 11. Out of scope (not part of this spec)

- User accounts, saved comparisons, or exporting reports.
- Live/real-time pricing fetched from provider APIs (data is static, checked into
  `src/data/`, with a manual "as of" date).
- Currency conversion (USD only).
