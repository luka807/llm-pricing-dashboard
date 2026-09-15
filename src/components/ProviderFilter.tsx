"use client";

import { PROVIDERS, PROVIDER_COLOR_VAR, type Provider } from "@/lib/pricing";

type ProviderFilterProps = {
  selected: Provider[];
  onChange: (providers: Provider[]) => void;
};

export default function ProviderFilter({ selected, onChange }: ProviderFilterProps) {
  function toggle(provider: Provider) {
    if (selected.includes(provider)) {
      onChange(selected.filter((p) => p !== provider));
    } else {
      onChange([...selected, provider]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PROVIDERS.map((provider) => {
        const isOn = selected.includes(provider);
        const color = PROVIDER_COLOR_VAR[provider];
        return (
          <button
            key={provider}
            type="button"
            aria-pressed={isOn}
            onClick={() => toggle(provider)}
            className="flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-opacity"
            style={{
              borderColor: isOn ? color : "var(--border)",
              background: isOn ? `color-mix(in srgb, ${color} 12%, var(--card))` : "transparent",
              color: isOn ? "var(--foreground)" : "var(--muted-foreground)",
              opacity: isOn ? 1 : 0.7,
            }}
          >
            <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: color }} />
            {provider}
          </button>
        );
      })}
    </div>
  );
}
