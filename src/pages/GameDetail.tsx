import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, X, Share2, Info, Smartphone, Globe, Calendar, MonitorSmartphone } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import type { Game } from "@/lib/types";
import { getGame, gamesInMarket } from "@/data/games";
import { categoryColor, categoryLabel } from "@/data/categories";
import { tagLabel } from "@/data/tags";
import { GameThumb } from "@/components/GameThumb";
import { RailCard } from "@/components/GameCard";
import { Section } from "@/components/Section";
import { LevelBar, Stars, TrendArrow } from "@/components/Bits";
import { DemoButton, SaveButton, CompareButton } from "@/components/GameActions";
import { EmptyState } from "@/components/EmptyState";
import { heatScore, rankOf, trendOf } from "@/lib/format";

const TERMS = ["rtp", "volatility", "wild", "scatter", "freeSpins", "bonusGame", "cascading", "maxWin"];

export default function GameDetail() {
  const { id } = useParams();
  const { t, lang, market } = useMarket();
  const { addRecent, rate, ratings } = useSaved();
  const { push } = useToast();
  const game = id ? getGame(id) : undefined;
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  useEffect(() => {
    if (game) addRecent(game.id);
  }, [game, addRecent]);

  if (!game) {
    return (
      <EmptyState
        icon="Ghost"
        title="找不到這款遊戲"
        hint="它可能已下架或連結有誤。"
        action={
          <Link to="/pulse" className="btn-primary">
            {t("nav.pulse")}
          </Link>
        }
      />
    );
  }

  const color = categoryColor(game.category);
  const similar = gamesInMarket(market)
    .filter((g) => g.id !== game.id && (g.category === game.category || g.tags.some((x) => game.tags.includes(x))))
    .slice(0, 8);

  const indicators: { key: string; value: number }[] = [
    { key: "metric.bigWin", value: game.bigWinPotential },
    { key: "metric.winFrequency", value: game.winFrequency },
    { key: "metric.pace", value: game.pace },
    { key: "metric.bonus", value: game.bonusRichness },
    { key: "metric.difficulty", value: game.difficulty },
    { key: "metric.mobile", value: game.mobileExperience },
  ];

  const playerData: { key: string; value: number }[] = [
    { key: "metric.rating", value: Math.round((game.rating / 5) * 5) },
    { key: "metric.replayIntent", value: Math.max(1, Math.round(game.replayRate / 20)) },
    { key: "metric.mobile", value: game.mobileExperience },
    { key: "metric.newbie", value: Math.max(1, 6 - game.difficulty) },
    { key: "metric.bonusSat", value: game.bonusRichness },
  ];

  const myRating = ratings[game.id];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${game.name} — SEA Play Pulse`);
    } catch {
      /* noop */
    }
    push(t("toast.shared"), "success");
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* hero */}
      <div className="card overflow-hidden">
        <div className="grid gap-4 p-4 sm:grid-cols-[200px_1fr]">
          <GameThumb game={game} ratio="aspect-[4/3]" rounded="rounded-2xl" />
          <div>
            <span className="chip" style={{ color }}>
              {categoryLabel(game.category, lang)}
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight">{game.name}</h1>
            <p className="text-sm text-content-muted">{game.provider}</p>
            <div className="mt-2 flex items-center gap-3">
              <Stars value={game.rating} size={15} />
              <span className="tnum text-sm font-semibold text-content">{game.rating.toFixed(1)}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-content-muted">{game.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="min-w-[130px] flex-1">
                <DemoButton game={game} full />
              </div>
              <SaveButton game={game} />
              <CompareButton game={game} />
              <button onClick={share} className="btn-ghost h-9 w-9 p-0" aria-label={t("action.share")}>
                <Share2 size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* market heat strip */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MarketHeat market="vn" label={t("detail.vnHeat")} game={game} />
        <MarketHeat market="ph" label={t("detail.phHeat")} game={game} />
      </div>

      {/* basic info */}
      <Section title={t("detail.basic")}>
        <div className="card grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-sm sm:grid-cols-3">
          <Info2 icon={<Calendar size={14} />} label={t("detail.release")} value={game.releaseDate} />
          <Info2 icon={<MonitorSmartphone size={14} />} label={t("detail.orientation")} value={t(`orient.${game.orientation}`)} />
          <Info2 icon={<Smartphone size={14} />} label={t("detail.devices")} value={game.mobileFriendly ? "Mobile · Desktop" : "Desktop"} />
          <Info2 icon={<Globe size={14} />} label={t("detail.languages")} value={game.languages.join(" · ").toUpperCase()} />
          <Info2 icon={<Info size={14} />} label={t("detail.demoStatus")} value={game.demoAvailable ? t("misc.demoAvail") : t("misc.demoNo")} />
          <Info2 icon={<Info size={14} />} label={t("detail.provider")} value={game.provider} />
        </div>
      </Section>

      {/* player indicators */}
      <Section title={t("detail.indicators")}>
        <div className="card grid gap-3 p-4 sm:grid-cols-2">
          {indicators.map((ind) => (
            <div key={ind.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-content-muted">{t(ind.key)}</span>
                <span className="tnum font-semibold text-content">{ind.value}/5</span>
              </div>
              <LevelBar value={ind.value} color={color} />
            </div>
          ))}
        </div>
      </Section>

      {/* glossary */}
      <Section title={t("detail.glossary")}>
        <div className="flex flex-wrap gap-2">
          {TERMS.map((term) => {
            const open = openTerm === term;
            return (
              <div key={term} className="w-full sm:w-auto">
                <button
                  onClick={() => setOpenTerm(open ? null : term)}
                  aria-expanded={open}
                  className={`chip ${open ? "border-pulse/50 text-pulse" : "hover:text-content"}`}
                >
                  <Info size={12} /> {t(`term.${term}`)}
                </button>
                {open && (
                  <p className="mt-2 rounded-xl border border-surface-line bg-surface-raised p-3 text-xs leading-relaxed text-content-muted animate-fade-up">
                    {t(`term.${term}.desc`)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* fit */}
      <Section title={t("detail.fit")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-up">
              <Check size={15} /> {t("detail.fitYes")}
            </p>
            <ul className="grid gap-1.5">
              {game.recommendedFor.map((tag) => (
                <li key={tag} className="flex items-center gap-2 text-sm text-content-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-up" /> {tagLabel(tag, lang)}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-down">
              <X size={15} /> {t("detail.fitNo")}
            </p>
            <ul className="grid gap-1.5">
              {game.notRecommendedFor.map((tag) => (
                <li key={tag} className="flex items-center gap-2 text-sm text-content-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-down" /> {tagLabel(tag, lang)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* player data */}
      <Section title={t("detail.playerData")}>
        <div className="card grid gap-3 p-4 sm:grid-cols-2">
          {playerData.map((pd) => (
            <div key={pd.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-content-muted">{t(pd.key)}</span>
                <span className="tnum font-semibold text-content">{pd.value}/5</span>
              </div>
              <LevelBar value={pd.value} color="#26E0C0" />
            </div>
          ))}
        </div>
      </Section>

      {/* quick rate */}
      <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="font-display text-sm font-bold">{t("detail.rateThis")}</p>
          {myRating != null && <p className="text-xs text-pulse">{t("detail.thanksRate")}</p>}
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => {
                rate(game.id, n);
                push(t("toast.rated"), "success");
              }}
              aria-label={`${n} / 5`}
              className={`btn h-9 w-9 p-0 text-lg ${
                myRating && n <= myRating ? "text-flame" : "text-content-faint hover:text-flame"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* similar */}
      {similar.length > 0 && (
        <Section title={t("detail.similar")}>
          <div className="rail">
            {similar.map((g) => (
              <RailCard key={g.id} game={g} />
            ))}
          </div>
        </Section>
      )}

      <p className="mt-6 text-center text-[11px] text-content-faint">{t("misc.disclaimerShort")}</p>
    </div>
  );
}

function Info2({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] text-content-faint">
        <span>{icon}</span> {label}
      </p>
      <p className="mt-0.5 font-medium text-content">{value}</p>
    </div>
  );
}

function MarketHeat({ market, label, game }: { market: "vn" | "ph"; label: string; game: Game }) {
  const accent = market === "vn" ? "#F43F5E" : "#38BDF8";
  const heat = heatScore(game, market);
  const rank = rankOf(game, market);
  const trend = trendOf(game, market);
  const inMarket = game.markets.includes(market);
  return (
    <div className="card p-3.5">
      <p className="flex items-center gap-1.5 text-xs text-content-muted">
        <span aria-hidden>{market === "vn" ? "🇻🇳" : "🇵🇭"}</span> {label}
      </p>
      {inMarket ? (
        <div className="mt-1 flex items-baseline gap-2">
          <span className="tnum font-display text-2xl font-bold" style={{ color: accent }}>
            🔥 {heat}
          </span>
          <span className="tnum text-xs text-content-muted">#{rank}</span>
          <TrendArrow value={trend} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-content-faint">— 未在此市場上架</p>
      )}
    </div>
  );
}
