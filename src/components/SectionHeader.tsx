type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="font-display text-[28px] leading-snug font-extrabold" style={{ color: "var(--lnp-navy-deep)" }}>
        {title}
      </h2>
      <p className="mt-2 max-w-[72ch] text-sm text-muted-foreground">{description}</p>
      <hr className="rule-gold" />
    </div>
  );
}
