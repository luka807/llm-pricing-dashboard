import { DATA_AS_OF } from "@/lib/pricing";
import { formatDate } from "@/lib/format";

export default function DataAsOfNote({ className = "" }: { className?: string }) {
  return (
    <div className={`text-xs text-faint-foreground ${className}`}>
      Data as of {formatDate(DATA_AS_OF)} &middot; sourced from each provider&apos;s official pricing page
    </div>
  );
}
