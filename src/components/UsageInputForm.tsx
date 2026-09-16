"use client";

import SegmentedControl from "@/components/SegmentedControl";

export type UsageInputs = {
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  requests: number;
  requestUnit: "day" | "month";
  useCachedInput: boolean;
};

type UsageInputFormProps = {
  value: UsageInputs;
  onChange: (value: UsageInputs) => void;
};

const UNIT_OPTIONS: { value: "month" | "day"; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
];

export default function UsageInputForm({ value, onChange }: UsageInputFormProps) {
  function set<K extends keyof UsageInputs>(key: K, v: UsageInputs[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex flex-col gap-5 border bg-[var(--card)] p-6 shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <NumberField label="Input tokens per request" value={value.inputTokensPerRequest} onChange={(v) => set("inputTokensPerRequest", v)} />
      <NumberField label="Output tokens per request" value={value.outputTokensPerRequest} onChange={(v) => set("outputTokensPerRequest", v)} />
      <NumberField label="Requests" value={value.requests} onChange={(v) => set("requests", v)} />

      <div className="flex flex-col gap-2">
        <span className="eyebrow">Per</span>
        <SegmentedControl options={UNIT_OPTIONS} value={value.requestUnit} onChange={(v) => set("requestUnit", v)} className="self-start" />
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="eyebrow">Pricing options</span>
        <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.useCachedInput}
            onChange={(e) => set("useCachedInput", e.target.checked)}
            className="h-4 w-4"
            style={{ accentColor: "var(--lnp-navy-deep)" }}
          />
          Use cached input pricing
        </label>
      </div>

      <p className="text-faint-foreground font-mono text-[11.5px] leading-relaxed">
        Cost = (tokens ÷ 1,000,000) × price per 1M tokens, summed across all requests for the period above.
      </p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="num h-9 w-full rounded-[2px] border bg-[var(--card)] px-3 font-mono text-sm text-foreground"
        style={{ borderColor: "var(--border-strong)" }}
      />
    </div>
  );
}
