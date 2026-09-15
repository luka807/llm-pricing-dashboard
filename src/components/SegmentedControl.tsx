"use client";

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div className={`flex h-8 overflow-hidden rounded-[2px] border ${className}`} style={{ borderColor: "var(--border-strong)" }}>
      {options.map((opt, i) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={`font-display px-3.5 text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors ${
              i > 0 ? "border-l" : ""
            }`}
            style={{
              borderColor: "var(--border)",
              background: isActive ? "var(--lnp-navy-deep)" : "var(--card)",
              color: isActive ? "#ffffff" : "var(--muted-foreground)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
