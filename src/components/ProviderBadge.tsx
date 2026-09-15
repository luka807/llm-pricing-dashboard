import { PROVIDER_COLOR_VAR, type Provider } from "@/lib/pricing";

type ProviderBadgeProps = {
  provider: Provider;
  className?: string;
};

export default function ProviderBadge({ provider, className = "" }: ProviderBadgeProps) {
  return (
    <span
      className={`font-display inline-block rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-[0.09em] whitespace-nowrap text-white uppercase ${className}`}
      style={{ background: PROVIDER_COLOR_VAR[provider] }}
    >
      {provider}
    </span>
  );
}
