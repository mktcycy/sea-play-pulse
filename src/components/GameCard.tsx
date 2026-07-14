import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import type { Game } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { categoryColor, categoryLabel } from "@/data/categories";
import { gameOneLiner, rankReason } from "@/data/vocab";
import { formatCount, heatScore, rankOf, trendOf } from "@/lib/format";
import { GameThumb } from "./GameThumb";
import { Sparkline } from "./Sparkline";
import { HeatPill, RankBadge, Stars, TrendArrow } from "./Bits";
import { CompareButton, DemoButton, SaveButton } from "./GameActions";
import { PlayTypeBadge, DemoStatusBadge } from "./Badges";
import { MetaTags } from "./Shared";

// Compact card for horizontal rails (or grids when `full`).
export function RailCard({ game, full = false }: { game: Game; full?: boolean }) {
  const { market, lang, t } = useMarket();
  return (
    <div className={`card ${full ? "w-full" : "w-48 shrink-0 snap-start"} p-3 animate-fade-up`}>
      <Link to={`/game/${game.id}`} aria-label={game.name}>
        <GameThumb game={game} />
      </Link>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="chip" style={{ color: categoryColor(game.category) }}>{categoryLabel(game.category, lang)}</span>
        <HeatPill score={heatScore(game, market)} />
      </div>
      <Link to={`/game/${game.id}`} className="mt-2 block">
        <p className="truncate font-display text-sm font-semibold text-content">{game.name}</p>
        <p className="truncate text-xs text-content-muted">{gameOneLiner(game, lang)}</p>
      </Link>
      <div className="mt-2 flex items-center gap-1.5">
        <PlayTypeBadge type={game.demoType} />
        <DemoStatusBadge status={game.demoStatus} />
      </div>
      {full && (
        <div className="mt-2">
          <MetaTags tokens={[...game.mechanics, ...game.experienceTags]} max={3} />
        </div>
      )}
      {full ? (
        <div className="mt-2.5 space-y-1.5">
          <DemoButton game={game} full />
          <div className="flex items-center gap-1.5">
            <Link to={`/game/${game.id}`} aria-label={t("action.viewDetail")} className="btn h-9 flex-1 border border-surface-line bg-surface-raised p-0 text-xs text-content-muted hover:text-content">
              <Info size={15} /> {t("action.viewDetail")}
            </Link>
            <SaveButton game={game} />
            <CompareButton game={game} />
          </div>
        </div>
      ) : (
        <div className="mt-2.5 flex items-center gap-1.5">
          <DemoButton game={game} />
          <SaveButton game={game} />
        </div>
      )}
    </div>
  );
}

// Ranked list row for the Pulse boards.
export function RankRow({ game, rank, showReason = true }: { game: Game; rank: number; showReason?: boolean }) {
  const { market, lang, t } = useMarket();
  const trend = trendOf(game, market);
  return (
    <div className="card p-2.5 sm:p-3 animate-fade-up">
      <div className="flex items-center gap-3">
        <RankBadge rank={rank} />
        <Link to={`/game/${game.id}`} className="shrink-0" aria-label={game.name}>
          <GameThumb game={game} className="w-16" ratio="aspect-[4/3]" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/game/${game.id}`} className="truncate font-display text-sm font-semibold text-content hover:text-pulse">{game.name}</Link>
            <TrendArrow value={trend} />
          </div>
          <p className="truncate text-xs text-content-muted">{game.provider} · {categoryLabel(game.category, lang)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] text-content-faint">
            <HeatPill score={heatScore(game, market)} />
            <span className="tnum">{formatCount(game.demoCount24h)} {t("metric.demo24h")}</span>
          </div>
          {showReason && <p className="mt-0.5 truncate text-[11px] text-content-faint">· {rankReason(game, market, lang)}</p>}
        </div>
        <div className="hidden shrink-0 sm:block"><Sparkline data={game.trendData} color={categoryColor(game.category)} /></div>
        <div className="shrink-0"><Stars value={game.rating} /></div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-surface-line pt-2">
        <DemoButton game={game} />
        <SaveButton game={game} />
        <CompareButton game={game} />
        <div className="ml-auto flex items-center gap-1.5"><PlayTypeBadge type={game.demoType} /></div>
      </div>
    </div>
  );
}

export function heatOf(game: Game, market: Parameters<typeof rankOf>[1]) {
  return { heat: heatScore(game, market), rank: rankOf(game, market), trend: trendOf(game, market) };
}
