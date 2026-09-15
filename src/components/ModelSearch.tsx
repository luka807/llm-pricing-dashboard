"use client";

type ModelSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function ModelSearch({ value, onChange, placeholder = "Search models…" }: ModelSearchProps) {
  return (
    <div
      className="flex h-9 min-w-[220px] items-center gap-2 rounded-[2px] border bg-[var(--card)] px-3"
      style={{ borderColor: "var(--border-strong)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-faint-foreground">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] text-foreground placeholder:text-faint-foreground focus:outline-none"
      />
    </div>
  );
}
