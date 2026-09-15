import { formatUSD } from "@/lib/format";

type PriceTagProps = {
  amount: number;
  suffix?: string;
  className?: string;
};

export default function PriceTag({ amount, suffix = "/1M", className = "" }: PriceTagProps) {
  return (
    <span className={`num ${className}`}>
      {formatUSD(amount)}
      {suffix && <span className="text-faint-foreground"> {suffix}</span>}
    </span>
  );
}
