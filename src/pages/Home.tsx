import { Link } from "react-router-dom";
import { Sparkles, Flame, TrendingUp, Users, Repeat, Smartphone } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { gamesInMarket } from "@/data/games";
import { BOARDS, rankedFor } from "@/data/boards";
import { CATEGORIES, categoryLabel } from "@/data/categories";
import { Icon } from "@/components/Icon";
import { Section } from "@/components/Section";
import { RailCard, RankRow } from "@/components/GameCard";
import { DuelCard } from "@/components/DuelCard";
import { MarketTrendChart } from "@/components/MarketTrendChart";
import { PulseLine } from "@/components/PulseLine";
import { TodayPick, RecentPlayedRail } from "@/components/Shared";
import { GameCardSkeleton, RowSkeleton } from "@/components/Skeleton";
import { duelOfTheDay } from "@/data/duel";
import { useSimulatedLoading } from "@/lib/useLoading";
import { formatCount } from "@/lib/format";

export default function Home() {
  const { t, market, accent, lang } = useMarket();
  const loading = useSimulatedLoading(500, [market]);
  const games = gamesInMarket(market);

  const today = rankedFor(BOARDS.todayDemo, games, market).slice(0, 5);
  const rising = rankedFor(BOARDS.weekRising, games, market).slice(0, 8);
  const fresh = rankedFor(BOARDS.newHot, games, market).slice(0, 8);
  const duel = duelOfTheDay();

  const totalDemos = games.reduce((a, g) => a + g.demoCount24h, 0);
  const avgReplay = Math.round(games.reduce((a, g) => a + g.replayRate, 0) / games.length);
  const topReplay = Math.max(...games.map((g) => g.replayRate));

  return (
    <div>
      {/* Hero — the market pulse is the thesis */}
      <section className="relative overflow-hidden rounded-3xl border border-surface-line bg-surface p-5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.16 }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="eyebrow flex items-center gap-1.5">
              <span aria-hidden>{market === "vn" ? "🇻🇳" : "🇵🇭"}</span>
              {t(`market.${market}`)} · {t("misc.updated")}
            </span>
          </div>
          <h1 className="mt-2 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t("hero.title")}
          </h1>
          <PulseLine className="mt-2 h-5 w-56" color={accent} />
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-content-muted sm:text-base">
            {t("hero.subtitle")}
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Link to="/match" className="btn-primary w-full justify-center sm:w-auto">
              <Sparkles size={16} /> {t("hero.ctaMatch")}
            </Link>
            <Link to="/pulse" className="btn-ghost w-full justify-center sm:w-auto">
              <Flame size={16} /> {t("hero.ctaHot")}
            </Link>
          </div>
        </div>
      </section>

      {/* today's pick */}
      <div className="mt-7"><TodayPick /></div>

      {/* recently played */}
      <RecentPlayedRail />

      {/* Today's market top board */}
      <Section eyebrow="SEA Play Pulse" title={t("home.todayTop")} to="/pulse">
        <div className="grid gap-2.5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
            : today.map((g, i) => <RankRow key={g.id} game={g} rank={i + 1} />)}
        </div>
      </Section>

      {/* Rising fastest */}
      <Section title={t("home.weekRising")} to="/pulse">
        <div className="rail">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={i} />)
            : rising.map((g) => <RailCard key={g.id} game={g} />)}
        </div>
      </Section>

      {/* Match entry */}
      <section className="mt-7 overflow-hidden rounded-2xl border border-pulse/25 bg-gradient-to-br from-pulse/10 to-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <Sparkles size={18} className="text-pulse" /> {t("home.matchEntry")}
            </h2>
            <p className="mt-1 max-w-md text-sm text-content-muted">{t("home.matchEntryDesc")}</p>
            <Link to="/match" className="btn-primary mt-3">
              {t("action.startMatch")}
            </Link>
          </div>
          <div className="hidden shrink-0 sm:block">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-pulse/15 text-pulse">
              <Sparkles size={34} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <Section title={t("home.categories")} to="/categories">
        <div className="rail">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/discover?cat=${c.id}`}
              className="card flex w-28 shrink-0 snap-start flex-col items-center gap-2 p-3.5 transition hover:border-pulse/40"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ backgroundColor: `${c.color}22`, color: c.color }}
              >
                <Icon name={c.icon} size={22} />
              </span>
              <span className="text-center text-xs font-semibold text-content">{categoryLabel(c.id, lang)}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Daily duel */}
      <Section title={t("home.duel")} to="/duel">
        <DuelCard duel={duel} />
      </Section>

      {/* New games */}
      <Section title={t("home.newGames")} to="/discover">
        <div className="rail">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <GameCardSkeleton key={i} />)
            : fresh.map((g) => <RailCard key={g.id} game={g} />)}
        </div>
      </Section>

      {/* Player behavior trends */}
      <Section title={t("home.behavior")}>
        <div className="card p-4">
          <div className="mb-3 grid grid-cols-3 gap-2">
            <StatTile icon={<Flame size={15} />} label={t("metric.demo24h")} value={formatCount(totalDemos)} />
            <StatTile icon={<Repeat size={15} />} label={t("metric.replay")} value={`${avgReplay}%`} />
            <StatTile icon={<TrendingUp size={15} />} label={t("board.highestReplay")} value={`${topReplay}%`} />
          </div>
          <MarketTrendChart games={games} market={market} />
          <div className="mt-2 flex items-center gap-4 text-[11px] text-content-faint">
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {formatCount(games.reduce((a, g) => a + g.favoriteCount, 0))} {t("metric.favorites")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Smartphone size={12} /> {games.filter((g) => g.mobileFriendly).length} mobile-ready
            </span>
          </div>
        </div>
      </Section>

      <p className="mt-6 text-center text-[11px] text-content-faint">{t("misc.disclaimerShort")}</p>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-raised p-2.5">
      <div className="flex items-center gap-1.5 text-content-faint">
        <span className="text-pulse">{icon}</span>
        <span className="truncate text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="tnum mt-1 font-display text-lg font-bold text-content">{value}</p>
    </div>
  );
}
