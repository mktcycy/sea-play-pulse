import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Shuffle } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useDemo } from "@/context/DemoContext";
import type { Game } from "@/lib/types";
import { gamesInMarket, randomPlayable } from "@/data/games";
import { CATEGORIES, categoryLabel } from "@/data/categories";
import { tagLabel } from "@/data/tags";
import { tokenLabel } from "@/data/vocab";
import { RailCard } from "@/components/GameCard";
import { GameCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useSimulatedLoading } from "@/lib/useLoading";
import { useSeo } from "@/lib/useSeo";
import { heatScore } from "@/lib/format";
import { pick } from "@/i18n";

type Sort = "heat" | "replay" | "new";

export default function Discover() {
  const { t, lang, market } = useMarket();
  const { playDemo } = useDemo();
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") ?? "all";
  const mech = params.get("mech") ?? "";
  const theme = params.get("theme") ?? "";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("heat");
  const [onlyDemo, setOnlyDemo] = useState(false);
  useSeo({ title: pick(lang, "找遊戲", "Tìm game", "Find games") + " | SEA Play Pulse", description: pick(lang, "依類型、玩法與主題探索可免費試玩的遊戲。", "Khám phá game chơi thử miễn phí theo loại, lối chơi, chủ đề.", "Discover free-demo games by type, mechanic and theme."), path: "/discover" });
  const loading = useSimulatedLoading(400, [market, cat, sort, mech, theme]);

  const patch = (key: string, val: string) => {
    const next = new URLSearchParams(params);
    if (!val || val === "all") next.delete(key);
    else next.set(key, val);
    setParams(next, { replace: true });
  };
  const reset = () => { setQuery(""); setOnlyDemo(false); setSort("heat"); setParams({}, { replace: true }); };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = gamesInMarket(market).filter((g) => (cat === "all" ? true : g.category === cat));
    if (mech) list = list.filter((g) => g.mechanics.includes(mech));
    if (theme) list = list.filter((g) => g.themes.includes(theme));
    if (onlyDemo) list = list.filter((g) => g.demoStatus === "ok");
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.provider.toLowerCase().includes(q) ||
          g.tags.some((tag) => tagLabel(tag, lang).toLowerCase().includes(q) || tag.includes(q)) ||
          g.mechanics.some((m) => tokenLabel(m, lang).toLowerCase().includes(q)),
      );
    }
    const sorters: Record<Sort, (a: Game, b: Game) => number> = {
      heat: (a, b) => heatScore(b, market) - heatScore(a, market),
      replay: (a, b) => b.replayRate - a.replayRate,
      new: (a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate),
    };
    return [...list].sort(sorters[sort]);
  }, [query, cat, mech, theme, onlyDemo, sort, market, lang]);

  const activeFilter = cat !== "all" || !!mech || !!theme || onlyDemo || !!query;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t("discover.title")}</h1>
        <button onClick={() => playDemo(randomPlayable(market))} className="btn-ghost h-9 text-xs">
          <Shuffle size={15} /> {t("action.randomPlay")}
        </button>
      </div>

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
        <button onClick={() => patch("cat", "all")} className={`btn h-8 shrink-0 text-xs ${cat === "all" ? "bg-pulse text-ink" : "btn-ghost"}`}>{t("discover.filterAll")}</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => patch("cat", c.id)} className={`btn h-8 shrink-0 whitespace-nowrap text-xs ${cat === c.id ? "bg-pulse text-ink" : "btn-ghost"}`}>
            {categoryLabel(c.id, lang)}
          </button>
        ))}
      </div>

      {/* sort + playable-only + count */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-content-muted">{t("discover.count", { n: results.length })}</span>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-content-muted">
            <input type="checkbox" checked={onlyDemo} onChange={(e) => setOnlyDemo(e.target.checked)} className="accent-[#26E0C0]" />
            {t("filter.onlyDemo")}
          </label>
        </div>
        <div className="flex gap-1">
          {(["heat", "replay", "new"] as Sort[]).map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sort === s ? "bg-surface-raised text-pulse" : "text-content-faint hover:text-content"}`}>
              {t(`discover.sort${s[0].toUpperCase()}${s.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="SearchX"
            title={t("discover.noResults")}
            hint={pick(lang, "試試其他關鍵字或篩選。", "Thử từ khoá hoặc bộ lọc khác.", "Try another keyword or filter.")}
            action={activeFilter ? <button onClick={reset} className="btn-primary">{t("action.reset")}</button> : undefined}
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((g) => <RailCard key={g.id} game={g} full />)}
        </div>
      )}
    </div>
  );
}
