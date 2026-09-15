import { DATA_AS_OF } from "@/lib/pricing";
import { formatDate } from "@/lib/format";

export default function Footer() {
  return (
    <footer style={{ background: "var(--lnp-ink)", color: "rgba(255,255,255,0.6)" }} className="py-8 text-xs">
      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-6 px-8">
        <span>Pricing compiled from each provider&apos;s public pricing page — verify current rates before use.</span>
        <span className="font-mono">Data as of {formatDate(DATA_AS_OF)}</span>
      </div>
    </footer>
  );
}
