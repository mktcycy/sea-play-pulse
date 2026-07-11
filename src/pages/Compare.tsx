import { Link } from "react-router-dom";
import { X, Trophy, Zap, Gift, Flame } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { getGame } from "@/data/games";
import { categoryLabel } from "@/data/categories";
import type { Game } from "@/lib/types";
import { GameThumb } from "@/components/GameThumb";
import { LevelBar, Stars } from "@/components/Bits";
import { EmptyState } from "@/components/EmptyState";
import { DemoButton } from "@/components/GameActions";
import { heatScore } from "@/lib/format";

export default function Compare() {
  const { t, lang, market } = useMarket();
  const { compare, toggleCompare, clearCompare } = useSaved();
  const games = compare.map(getGame).filter(Boolean) as Game[];

  if (games.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold">{t("compare.title")}</h1>
        <div className="mt-4">
          <EmptyState
            icon="GitCompareArrows"
            title={t("compare.empty")}
            action={
              <Link to="/pulse" className="btn-primary">
                {t("compare.pickMore")}
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const best = {
    newbie: winnerBy(games, (g) => 6 - g.difficulty),
    fastest: winnerBy(games, (g) => g.pace),
    bonus: winnerBy(games, (g) => g.bonusRichness),
    hottest: winnerBy(games, (g) => heatScore(g, market)),
  };

  const rows: { key: string; get: (g: Game) => React.ReactNode; bar?: (g: Game) => number }[] = [
    { key: "detail.category", get: (g) => categoryLabel(g.category, lang) },
    { key: "metric.pace", get: (g) => `${g.pace}/5`, bar: (g) => g.pace },
    { key: "metric.difficulty", get: (g) => `${g.difficulty}/5`, bar: (g) => g.difficulty },
    { key: "metric.bigWin", get: (g) => `${g.bigWinPotential}/5`, bar: (g) => g.bigWinPotential },
    { key: "metric.winFrequency", get: (g) => `${g.winFrequency}/5`, bar: (g) => g.winFrequency },
    { key: "metric.bonus", get: (g) => `${g.bonusRichness}/5`, bar: (g) => g.bonusRichness },
    { key: "metric.mobile", get: (g) => `${g.mobileExperience}/5`, bar: (g) => g.mobileExperience },
    { key: "detail.vnHeat", get: (g) => (g.markets.includes("vn") ? `🔥 ${heatScore(g, "vn")}` : "—") },
    { key: "detail.phHeat", get: (g) => (g.markets.includes("ph") ? `🔥 ${heatScore(g, "ph")}` : "—") },
    { key: "metric.rating", get: (g) => <Stars value={g.rating} /> },
    { key: "metric.replay", get: (g) => `${g.replayRate}%` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t("compare.title")}</h1>
        <button onClick={clearCompare} className="btn-ghost h-8 text-xs">
          {t("compare.clear")}
        </button>
      </div>

      {/* verdict chips */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Verdict icon={<Trophy size={14} />} label={t("compare.bestNewbie")} game={best.newbie} />
        <Verdict icon={<Zap size={14} />} label={t("compare.fastest")} game={best.fastest} />
        <Verdict icon={<Gift size={14} />} label={t("compare.mostBonus")} game={best.bonus} />
        <Verdict icon={<Flame size={14} />} label={t("compare.hottest")} game={best.hottest} />
      </div>

      {/* comparison table (horizontal scroll on mobile) */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              <th className="w-28" />
              {games.map((g) => (
                <th key={g.id} className="p-2 align-top">
                  <div className="relative">
                    <button
                      onClick={() => toggleCompare(g.id)}
                      className="btn absolute -right-1 -top-1 z-10 h-6 w-6 bg-ink-800 p-0 text-content-muted"
                      aria-label="remove"
                    >
                      <X size={13} />
                    </button>
                    <Link to={`/game/${g.id}`}>
                      <GameThumb game={g} className="w-full" ratio="aspect-[4/3]" />
                    </Link>
                    <p className="mt-1.5 truncate text-center font-display text-xs font-semibold">{g.name}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="pr-2 text-xs text-content-muted">{t(row.key)}</td>
                {games.map((g) => (
                  <td key={g.id} className="rounded-lg bg-surface p-2 text-center align-middle">
                    <div className="text-sm font-medium text-content">{row.get(g)}</div>
                    {row.bar && (
                      <div className="mx-auto mt-1.5 max-w-[80px]">
                        <LevelBar value={row.bar(g)} />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {games.map((g) => (
                <td key={g.id} className="p-2">
                  <DemoButton game={g} full />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function winnerBy(games: Game[], score: (g: Game) => number): Game {
  return [...games].sort((a, b) => score(b) - score(a))[0];
}

function Verdict({ icon, label, game }: { icon: React.ReactNode; label: string; game: Game }) {
  return (
    <div className="card p-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
        <span className="text-pulse">{icon}</span> {label}
      </p>
      <Link to={`/game/${game.id}`} className="mt-1 block truncate text-sm font-semibold text-content hover:text-pulse">
        {game.name}
      </Link>
    </div>
  );
}
