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
    <nav
      role="tablist"
      aria-label="Dashboard sections"
      className="flex gap-8 overflow-x-auto"
      style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="font-display shrink-0 cursor-pointer appearance-none whitespace-nowrap bg-transparent pt-4 pb-3 text-[12px] font-bold tracking-[0.14em] uppercase outline-none"
            style={{
              borderBottom: `4px solid ${isActive ? "var(--lnp-gold)" : "transparent"}`,
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.62)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
