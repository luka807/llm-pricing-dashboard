type MethodologyNoteProps = {
  items: string[];
};

export default function MethodologyNote({ items }: MethodologyNoteProps) {
  return (
    <details className="group mt-6 border bg-[var(--card)] shadow-[var(--shadow-1)]" style={{ borderColor: "var(--border)" }}>
      <summary className="eyebrow flex cursor-pointer list-none items-center justify-between px-6 py-4 select-none marker:content-none">
        Methodology
        <span
          aria-hidden
          className="text-sm font-normal normal-case tracking-normal text-faint-foreground transition-transform group-open:rotate-180"
        >
          ⌄
        </span>
      </summary>
      <ul
        className="flex list-disc flex-col gap-2 border-t px-6 py-4 pl-10 text-[12.5px] leading-relaxed text-muted-foreground"
        style={{ borderColor: "var(--border)" }}
      >
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </details>
  );
}
