export type MethodologySource = {
  label: string;
  url: string;
};

type MethodologyNoteProps = {
  items: string[];
  sources?: MethodologySource[];
};

export default function MethodologyNote({ items, sources }: MethodologyNoteProps) {
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

      {sources && sources.length > 0 && (
        <div className="border-t px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <span className="eyebrow mb-2 block">Sources</span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px]">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold hover:opacity-80"
                  style={{ color: "var(--link)" }}
                >
                  {source.label}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </details>
  );
}
