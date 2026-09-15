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
    <div className="flex flex-col gap-2.5 border bg-[var(--card)] p-6 shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <span className="eyebrow">Models</span>
      <div className="flex flex-wrap gap-2">
        {models.map((m) => {
          const key = modelKey(m);
          const isOn = selectedKeys.has(key);
          const color = PROVIDER_COLOR_VAR[m.provider];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(key)}
              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border pr-3.5 pl-2.5 text-[13px]"
              style={{
                borderColor: isOn ? "var(--lnp-navy-deep)" : "var(--border)",
                background: isOn ? "var(--lnp-navy-deep)" : "var(--card)",
                color: isOn ? "#ffffff" : "var(--muted-foreground)",
                fontWeight: isOn ? 600 : 400,
              }}
            >
              <span className="inline-block h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: isOn ? color : "var(--border)" }} />
              {m.model}
            </button>
          );
        })}
      </div>
    </div>
  );
}
