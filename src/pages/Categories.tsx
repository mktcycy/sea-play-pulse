import { Link } from "react-router-dom";
import { useMarket } from "@/context/MarketContext";
import { CATEGORIES } from "@/data/categories";
import { gamesInMarket } from "@/data/games";
import { Icon } from "@/components/Icon";
import { heatScore } from "@/lib/format";

export default function Categories() {
  const { t, lang, market } = useMarket();
  const games = gamesInMarket(market);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{t("nav.categories")}</h1>
      <p className="mt-1 text-sm text-content-muted">{t(`market.${market}`)} · {t("misc.updated")}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const list = games.filter((g) => g.category === c.id);
          const top = [...list].sort((a, b) => heatScore(b, market) - heatScore(a, market)).slice(0, 3);
          return (
            <Link
              key={c.id}
              to={`/discover?cat=${c.id}`}
              className="card group flex flex-col gap-3 p-4 transition hover:border-pulse/40"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ backgroundColor: `${c.color}22`, color: c.color }}
                >
                  <Icon name={c.icon} size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-content">{c.label[lang]}</p>
                  <p className="tnum text-xs text-content-muted">{list.length} games</p>
                </div>
                <span
                  className="text-xs font-semibold opacity-0 transition group-hover:opacity-100"
                  style={{ color: c.color }}
                >
                  {t("home.viewAll")} →
                </span>
              </div>
              {top.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {top.map((g, i) => (
                    <span key={g.id} className="chip">
                      <span className="tnum mr-1 text-content-faint">#{i + 1}</span>
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
