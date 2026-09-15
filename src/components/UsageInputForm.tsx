"use client";

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

export default function UsageInputForm({ value, onChange }: UsageInputFormProps) {
  function set<K extends keyof UsageInputs>(key: K, v: UsageInputs[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4.5">
      <div className="mb-3.5 text-sm font-semibold text-foreground">Usage inputs</div>

      <NumberField label="Input tokens per request" unit="tokens" value={value.inputTokensPerRequest} onChange={(v) => set("inputTokensPerRequest", v)} />
      <NumberField label="Output tokens per request" unit="tokens" value={value.outputTokensPerRequest} onChange={(v) => set("outputTokensPerRequest", v)} />

      <label className="mb-1.5 block text-xs text-muted-foreground">Requests</label>
      <div className="mb-4 flex gap-2">
        <input
          type="number"
          min={0}
          value={value.requests}
          onChange={(e) => set("requests", Math.max(0, Number(e.target.value)))}
          className="num h-9 flex-1 rounded-lg border border-border bg-muted px-3 text-[13.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex h-9 shrink-0 overflow-hidden rounded-lg border border-border">
          {(["month", "day"] as const).map((unit, i) => (
            <button
              key={unit}
              type="button"
              onClick={() => set("requestUnit", unit)}
              className={`px-3 text-[12.5px] font-medium ${i > 0 ? "border-l border-border" : ""}`}
              style={{
                background: value.requestUnit === unit ? "var(--accent)" : "transparent",
                color: value.requestUnit === unit ? "var(--accent-foreground)" : "var(--muted-foreground)",
              }}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <ToggleRow
        label="Use cached input pricing"
        checked={value.useCachedInput}
        onChange={(v) => set("useCachedInput", v)}
        first
      />

      <div className="mt-3 text-[11.5px] leading-relaxed text-faint-foreground">
        Cost = (tokens &divide; 1,000,000) &times; price per 1M tokens, summed across all requests for the period above.
      </div>
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      <div className="flex h-9 items-center justify-between rounded-lg border border-border bg-muted px-3">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="num w-full bg-transparent text-[13.5px] text-foreground focus:outline-none"
        />
        <span className="shrink-0 text-[11.5px] text-faint-foreground">{unit}</span>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  first,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  first?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${first ? "border-t border-border" : ""}`}>
      <span className="text-[13px] text-foreground">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-[19px] w-[34px] shrink-0 rounded-full border border-border transition-colors"
        style={{ background: checked ? "var(--accent)" : "var(--muted-2)" }}
      >
        <span
          className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all"
          style={{ left: checked ? "17px" : "2px" }}
        />
      </button>
    </div>
  );
}
