import { useMarket } from "@/context/MarketContext";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";

// Full-page transition flash when switching markets.
function MarketFlash() {
  const { switching, accent, market, t } = useMarket();
  if (!switching) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[65] grid place-items-center">
      <div className="absolute inset-0 animate-market-flash" style={{ backgroundColor: accent, opacity: 0.14 }} />
      <div className="animate-toast-in rounded-full border border-surface-line bg-ink-800/95 px-4 py-2 text-sm font-semibold shadow-card backdrop-blur">
        {t("market.switching", { market: t(`market.${market}`) })}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <MarketFlash />
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 lg:pb-10">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
