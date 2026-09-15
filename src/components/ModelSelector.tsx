"use client";

import { PROVIDER_COLOR_VAR, type Model } from "@/lib/pricing";

export function modelKey(m: Pick<Model, "provider" | "model">): string {
  return `${m.provider}::${m.model}`;
}

type ModelSelectorProps = {
  models: Model[];
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
};

export default function ModelSelector({ models, selectedKeys, onToggle }: ModelSelectorProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4.5">
      <div className="mb-3 text-sm font-semibold text-foreground">Compare models</div>
      <div className="flex max-h-80 flex-col gap-2.5 overflow-y-auto">
        {models.map((m) => {
          const key = modelKey(m);
          const checked = selectedKeys.has(key);
          const color = PROVIDER_COLOR_VAR[m.provider];
          return (
            <label key={key} className="flex cursor-pointer items-center gap-2.5">
              <span
                className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded border"
                style={{ background: checked ? "var(--accent)" : "transparent", borderColor: checked ? "var(--accent)" : "var(--border)" }}
              >
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <input type="checkbox" className="sr-only" checked={checked} onChange={() => onToggle(key)} />
              <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: color }} />
              <span className="text-[13px] text-foreground">{m.model}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
