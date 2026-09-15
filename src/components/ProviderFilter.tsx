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
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border pr-3.5 pl-2.5 text-[13px]"
            style={{
              borderColor: isOn ? "var(--lnp-navy-deep)" : "var(--border)",
              background: isOn ? "var(--lnp-navy-deep)" : "var(--card)",
              color: isOn ? "#ffffff" : "var(--muted-foreground)",
              fontWeight: isOn ? 600 : 400,
            }}
          >
            <span className="inline-block h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: isOn ? color : "var(--border)" }} />
            {provider}
          </button>
        );
      })}
    </div>
  );
}
