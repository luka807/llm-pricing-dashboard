type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="block h-1 w-11" style={{ background: "var(--lnp-gold)" }} />
      <div className="font-display text-lg font-extrabold" style={{ color: "var(--lnp-navy-deep)" }}>
        {title}
      </div>
      {description && <div className="max-w-xs text-sm text-muted-foreground">{description}</div>}
    </div>
  );
}
