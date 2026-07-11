import { ShieldCheck } from "lucide-react";
import { useMarket } from "@/context/MarketContext";

// Fixed responsible-gaming block. Copy avoids any profit/guarantee claims.
export function Footer() {
  const { t } = useMarket();
  const lines = ["rg.l1", "rg.l2", "rg.l3", "rg.l4", "rg.l5"];
  return (
    <footer className="mt-10 border-t border-surface-line bg-ink-800/60">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2 text-content">
          <ShieldCheck size={18} className="text-pulse" aria-hidden />
          <h2 className="font-display text-sm font-bold">{t("rg.title")}</h2>
        </div>
        <ul className="mt-3 grid gap-1.5 text-xs leading-relaxed text-content-muted sm:grid-cols-2">
          {lines.map((l) => (
            <li key={l} className="flex gap-2">
              <span className="mt-0.5 text-content-faint">·</span>
              <span>{t(l)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-content-faint">
          <span>© 2026 SEA Play Pulse</span>
          <span className="chip">{t("footer.demo")}</span>
          <span>{t("footer.source")}</span>
        </div>
      </div>
    </footer>
  );
}
