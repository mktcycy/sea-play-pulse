import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, X, Share2, Info, Smartphone, Globe, Calendar, MonitorSmartphone, PlayCircle, Gamepad2 } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { useDemo } from "@/context/DemoContext";
import type { Game } from "@/lib/types";
import { getGame, gamesInMarket } from "@/data/games";
import { categoryColor, categoryLabel } from "@/data/categories";
import { tagLabel } from "@/data/tags";
import { tokenLabel, gameOneLiner } from "@/data/vocab";
import { GameThumb } from "@/components/GameThumb";
import { RailCard } from "@/components/GameCard";
import { Section } from "@/components/Section";
import { LevelBar, Stars, TrendArrow } from "@/components/Bits";
import { DemoButton, SaveButton, CompareButton } from "@/components/GameActions";
import { PlayTypeBadge, DemoStatusBadge } from "@/components/Badges";
import { MetaTags } from "@/components/Shared";
import { ReviewBlock } from "@/components/ReviewBlock";
import { EmptyState } from "@/components/EmptyState";
import { pick } from "@/i18n";
import { heatScore, rankOf, trendOf } from "@/lib/format";

const TERMS = ["rtp", "volatility", "wild", "scatter", "freeSpins", "bonusGame", "cascading", "maxWin"];

// Similar games scored by shared mechanic / theme / provider / controls.
function similarGames(game: Game, pool: Game[]): Game[] {
  return pool
    .filter((g) => g.id !== game.id)
    .map((g) => {
      let s = 0;
      if (g.provider === game.provider) s += 3;
      if (g.category === game.category) s += 2;
      s += g.mechanics.filter((m) => game.mechanics.includes(m)).length * 3;
      s += g.themes.filter((th) => game.themes.includes(th)).length * 2;
      s += g.operationTips.filter((o) => game.operationTips.includes(o)).length;
      return { g, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((x) => x.g);
}

export default function GameDetail() {
  const { id } = useParams();
  const { t, lang, market } = useMarket();
  const { addRecent, rate, ratings } = useSaved();
  const { push } = useToast();
  const { playDemo } = useDemo();
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
  const similar = similarGames(game, gamesInMarket(market));

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
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="chip" style={{ color }}>{categoryLabel(game.category, lang)}</span>
              <PlayTypeBadge type={game.demoType} />
              <DemoStatusBadge status={game.demoStatus} />
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight">{game.name}</h1>
            <p className="text-sm text-content-muted">{game.provider} · {gameOneLiner(game, lang)}</p>
            <div className="mt-2 flex items-center gap-3">
              <Stars value={game.rating} size={15} />
              <span className="tnum text-sm font-semibold text-content">{game.rating.toFixed(1)}</span>
            </div>
            <div className="mt-2.5"><MetaTags tokens={[...game.mechanics, ...game.experienceTags]} max={5} /></div>
            <p className="mt-3 text-sm leading-relaxed text-content-muted">{game.description}</p>

            {/* big demo CTA + play method */}
            <div className="mt-4">
              <DemoButton game={game} full label="auto" size="lg" />
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-content-faint">
                <Info size={11} />
                {game.demoType === "onsite"
                  ? pick(lang, "在本站直接試玩（示意）", "Chơi thử ngay tại trang (demo)", "Play right here (in-site demo)")
                  : pick(lang, "點擊後前往遊戲商官方免費試玩頁面", "Sẽ mở trang chơi thử chính thức của nhà cung cấp", "Opens the provider's official free-demo page")}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <SaveButton game={game} />
              <CompareButton game={game} />
              <button onClick={share} className="btn-ghost h-9 w-9 p-0" aria-label={t("action.share")}>
                <Share2 size={17} />
              </button>
            </div>
            <p className="mt-3 rounded-lg bg-surface-raised px-3 py-2 text-[11px] leading-relaxed text-content-faint">
              {t("disclaimer.noReal")}
            </p>
          </div>
        </div>
      </div>

      {/* market heat strip */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MarketHeat market="vn" label={t("detail.vnHeat")} game={game} />
        <MarketHeat market="ph" label={t("detail.phHeat")} game={game} />
      </div>

      {/* 3 quick highlights */}
      <Section title={pick(lang, "3 個特色快速看懂", "3 điểm nổi bật", "3 quick highlights")}>
        <div className="grid gap-2 sm:grid-cols-3">
          {game.quickHighlights.map((h, i) => (
            <div key={h} className="card flex items-center gap-2 p-3">
              <span className="tnum grid h-7 w-7 place-items-center rounded-lg bg-pulse/15 text-xs font-bold text-pulse">{i + 1}</span>
              <span className="text-sm font-medium">{tokenLabel(h, lang)}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* preview */}
      <Section title={pick(lang, "遊戲預覽", "Xem trước", "Preview")}>
        <button onClick={() => playDemo(game)} className="group relative block w-full overflow-hidden rounded-2xl" aria-label={t("action.tryFree")}>
          <GameThumb game={game} ratio="aspect-video" rounded="rounded-2xl" />
          <span className="absolute inset-0 grid place-items-center bg-black/30">
            <span className="flex flex-col items-center gap-1 text-white">
              <PlayCircle size={46} className="text-white/90 transition group-hover:scale-110" />
              <span className="text-xs font-medium">{pick(lang, "15–30 秒預覽（示意）", "Xem trước 15–30s (demo)", "15–30s preview (sample)")}</span>
            </span>
          </span>
        </button>
      </Section>

      {/* how to play */}
      <Section title={pick(lang, "操作方式", "Cách điều khiển", "How to play")}>
        <div className="card grid gap-2.5 p-4 sm:grid-cols-2">
          {game.operationTips.map((op) => (
            <div key={op} className="flex items-center gap-2 text-sm text-content-muted">
              <Gamepad2 size={14} className="shrink-0 text-pulse" /> {tokenLabel(op, lang)}
            </div>
          ))}
        </div>
      </Section>

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

      {/* AI player feedback */}
      <div className="mt-7">
        <ReviewBlock game={game} />
      </div>

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
