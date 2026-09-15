"use client";

export type TabKey = "pricing" | "calculator" | "capability" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pricing", label: "Pricing Comparison" },
  { key: "calculator", label: "Cost Calculator" },
  { key: "capability", label: "Cost vs. Capability" },
  { key: "history", label: "Pricing History" },
];

type TabNavProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto border-b border-border px-4 sm:px-8">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 flex-col items-center px-4 text-sm outline-none transition-colors ${
              isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="py-3">{tab.label}</span>
            <span
              className="h-[2px] w-full rounded-t-full"
              style={{ background: isActive ? "var(--accent)" : "transparent" }}
            />
          </button>
        );
      })}
    </div>
  );
}
