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
    <div className={`flex h-8 overflow-hidden rounded-lg border border-border ${className}`}>
      {options.map((opt, i) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={`px-3 text-[12.5px] font-medium transition-colors ${i > 0 ? "border-l border-border" : ""}`}
            style={{
              background: isActive ? "var(--accent)" : "transparent",
              color: isActive ? "var(--accent-foreground)" : "var(--muted-foreground)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
