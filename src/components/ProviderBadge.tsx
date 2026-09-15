import { PROVIDER_COLOR_VAR, type Provider } from "@/lib/pricing";

type ProviderBadgeProps = {
  provider: Provider;
  className?: string;
};

export default function ProviderBadge({ provider, className = "" }: ProviderBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ background: PROVIDER_COLOR_VAR[provider] }}
      />
      <span>{provider}</span>
    </span>
  );
}
