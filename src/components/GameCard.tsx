import { Link } from "react-router-dom";
import type { Game } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { categoryColor, categoryLabel } from "@/data/categories";
import { formatCount, heatScore, rankOf, trendOf } from "@/lib/format";
import { GameThumb } from "./GameThumb";
import { Sparkline } from "./Sparkline";
import { HeatPill, RankBadge, Stars, TrendArrow } from "./Bits";
import { CompareButton, DemoButton, SaveButton } from "./GameActions";

// Compact card for horizontal rails (or grids when `full`).
export function RailCard({ game, full = false }: { game: Game; full?: boolean }) {
  const { market, lang } = useMarket();
  return (
    <div className={`card ${full ? "w-full" : "w-44 shrink-0 snap-start"} p-3 animate-fade-up`}>
      <Link to={`/game/${game.id}`} aria-label={game.name}>
        <GameThumb game={game} />
      </Link>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="chip" style={{ color: categoryColor(game.category) }}>
          {categoryLabel(game.category, lang)}
        </span>
        <HeatPill score={heatScore(game, market)} />
      </div>
      <Link to={`/game/${game.id}`} className="mt-2 block">
        <p className="truncate font-display text-sm font-semibold text-content">{game.name}</p>
        <p className="truncate text-xs text-content-muted">{game.provider}</p>
      </Link>
      <div className="mt-2.5 flex items-center gap-2">
        <DemoButton game={game} />
        <SaveButton game={game} />
      </div>
    </div>
  );
}

// Ranked list row for the Pulse boards.
export function RankRow({ game, rank }: { game: Game; rank: number }) {
  const { market, lang, t } = useMarket();
  const trend = trendOf(game, market);
  return (
    <div className="card flex items-center gap-3 p-2.5 sm:p-3 animate-fade-up">
      <RankBadge rank={rank} />
      <Link to={`/game/${game.id}`} className="shrink-0" aria-label={game.name}>
        <GameThumb game={game} className="w-16" ratio="aspect-[4/3]" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link to={`/game/${game.id}`} className="truncate font-display text-sm font-semibold text-content hover:text-pulse">
            {game.name}
          </Link>
          <TrendArrow value={trend} />
        </div>
        <p className="truncate text-xs text-content-muted">
          {game.provider} · {categoryLabel(game.category, lang)}
        </p>
        <div className="mt-1 flex items-center gap-2.5 text-[11px] text-content-faint">
          <span className="tnum inline-flex items-center gap-1">
            <HeatPill score={heatScore(game, market)} />
          </span>
          <span className="tnum">{formatCount(game.demoCount24h)} {t("metric.demo24h")}</span>
        </div>
      </div>
      <div className="hidden shrink-0 sm:block">
        <Sparkline data={game.trendData} color={categoryColor(game.category)} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Stars value={game.rating} />
        <div className="flex gap-1.5">
          <SaveButton game={game} />
          <CompareButton game={game} />
        </div>
      </div>
    </div>
  );
}

// Full detail-header stat strip (used on the game detail page hero).
export function heatOf(game: Game, market: Parameters<typeof rankOf>[1]) {
  return { heat: heatScore(game, market), rank: rankOf(game, market), trend: trendOf(game, market) };
}
