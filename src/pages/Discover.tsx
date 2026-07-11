import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import type { Game } from "@/lib/types";
import { gamesInMarket } from "@/data/games";
import { CATEGORIES, categoryLabel } from "@/data/categories";
import { tagLabel } from "@/data/tags";
import { RailCard } from "@/components/GameCard";
import { GameCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useSimulatedLoading } from "@/lib/useLoading";
import { heatScore } from "@/lib/format";

type Sort = "heat" | "replay" | "new";

export default function Discover() {
  const { t, lang, market } = useMarket();
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") ?? "all";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("heat");
  const loading = useSimulatedLoading(400, [market, cat, sort]);

  const setCat = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === "all") next.delete("cat");
    else next.set("cat", c);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = gamesInMarket(market).filter((g) => (cat === "all" ? true : g.category === cat));
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.provider.toLowerCase().includes(q) ||
          g.tags.some((tag) => tagLabel(tag, lang).toLowerCase().includes(q) || tag.includes(q)),
      );
    }
    const sorters: Record<Sort, (a: Game, b: Game) => number> = {
      heat: (a, b) => heatScore(b, market) - heatScore(a, market),
      replay: (a, b) => b.replayRate - a.replayRate,
      new: (a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate),
    };
    return [...list].sort(sorters[sort]);
  }, [query, cat, sort, market, lang]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{t("discover.title")}</h1>

      {/* search */}
      <div className="relative mt-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("discover.search")}
          className="w-full rounded-full border border-surface-line bg-ink-800 py-2.5 pl-9 pr-4 text-sm text-content placeholder:text-content-faint focus:border-pulse/60 focus:outline-none focus:ring-2 focus:ring-pulse/30"
        />
      </div>

      {/* category filter */}
      <div className="rail mt-3 -mx-1 px-1">
        <button
          onClick={() => setCat("all")}
          className={`btn h-8 shrink-0 text-xs ${cat === "all" ? "bg-pulse text-ink" : "btn-ghost"}`}
        >
          {t("discover.filterAll")}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`btn h-8 shrink-0 whitespace-nowrap text-xs ${cat === c.id ? "bg-pulse text-ink" : "btn-ghost"}`}
          >
            {categoryLabel(c.id, lang)}
          </button>
        ))}
      </div>

      {/* sort + count */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-content-muted">{t("discover.count", { n: results.length })}</span>
        <div className="flex gap-1">
          {(["heat", "replay", "new"] as Sort[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                sort === s ? "bg-surface-raised text-pulse" : "text-content-faint hover:text-content"
              }`}
            >
              {t(`discover.sort${s[0].toUpperCase()}${s.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="SearchX" title={t("discover.noResults")} />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((g) => (
            <RailCard key={g.id} game={g} full />
          ))}
        </div>
      )}
    </div>
  );
}
