import { Link } from "react-router-dom";
import { LayoutGrid, GitCompareArrows, ShieldCheck, Swords, Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { MarketSwitch } from "@/components/layout/MarketSwitch";

const LINKS = [
  { to: "/pulse", key: "nav.pulse", Icon: TrendingUp },
  { to: "/categories", key: "nav.categories", Icon: LayoutGrid },
  { to: "/match", key: "home.matchEntry", Icon: Sparkles },
  { to: "/compare", key: "nav.compare", Icon: GitCompareArrows },
  { to: "/duel", key: "duel.title", Icon: Swords },
  { to: "/check", key: "nav.checker", Icon: ShieldCheck },
];

export default function More() {
  const { t } = useMarket();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{t("nav.more")}</h1>

      <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-sm text-content-muted">{t("market.switch")}</span>
        <MarketSwitch />
      </div>
      <div className="card mt-3 flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-sm text-content-muted">Language</span>
        <LanguageSwitch />
      </div>

      <div className="mt-4 grid gap-2.5">
        {LINKS.map(({ to, key, Icon }) => (
          <Link key={to} to={to} className="card flex items-center gap-3 p-4 transition hover:border-pulse/40">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-raised text-pulse">
              <Icon size={20} />
            </span>
            <span className="flex-1 font-medium text-content">{t(key)}</span>
            <ChevronRight size={18} className="text-content-faint" />
          </Link>
        ))}
      </div>
    </div>
  );
}
