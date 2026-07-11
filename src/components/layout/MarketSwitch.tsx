import { useMarket } from "@/context/MarketContext";
import type { MarketId } from "@/lib/types";

const FLAG: Record<MarketId, string> = { vn: "🇻🇳", ph: "🇵🇭" };

export function MarketSwitch({ compact = false }: { compact?: boolean }) {
  const { market, setMarket, t } = useMarket();
  const markets: MarketId[] = ["vn", "ph"];
  return (
    <div
      role="tablist"
      aria-label={t("market.switch")}
      className="inline-flex items-center rounded-full border border-surface-line bg-ink-800 p-0.5"
    >
      {markets.map((m) => {
        const active = market === m;
        const accent = m === "vn" ? "#F43F5E" : "#38BDF8";
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            onClick={() => setMarket(m)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active ? "text-ink" : "text-content-muted hover:text-content"
            }`}
            style={active ? { backgroundColor: accent } : undefined}
          >
            <span aria-hidden>{FLAG[m]}</span>
            {!compact && <span>{t(`market.${m}`)}</span>}
          </button>
        );
      })}
    </div>
  );
}
