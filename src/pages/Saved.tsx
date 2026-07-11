import { Link } from "react-router-dom";
import { Sparkles, Clock, Heart } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { getGame, gamesInMarket } from "@/data/games";
import { BOARDS, rankedFor } from "@/data/boards";
import { PLAYER_TYPES } from "@/data/quiz";
import type { Game } from "@/lib/types";
import { RailCard, RankRow } from "@/components/GameCard";
import { Section } from "@/components/Section";
import { EmptyState } from "@/components/EmptyState";
import { tagLabel } from "@/data/tags";

export default function Saved() {
  const { t, lang, market } = useMarket();
  const { saved, recent, quiz } = useSaved();
  const savedGames = saved.map(getGame).filter(Boolean) as Game[];
  const recentGames = recent.map(getGame).filter(Boolean) as Game[];

  const fresh = rankedFor(BOARDS.newHot, gamesInMarket(market), market).slice(0, 6);
  const similarSeeds = savedGames[0];
  const similar = similarSeeds
    ? gamesInMarket(market)
        .filter((g) => g.id !== similarSeeds.id && (g.category === similarSeeds.category || g.tags.some((x) => similarSeeds.tags.includes(x))))
        .slice(0, 6)
    : [];

  return (
    <div>
      <div className="flex items-center gap-2">
        <Heart size={20} className="text-vn" fill="currentColor" />
        <h1 className="font-display text-2xl font-bold">{t("saved.title")}</h1>
      </div>

      {quiz && (
        <div className="card mt-4 flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pulse/15 text-pulse">
            <Sparkles size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t("saved.result")}</p>
            <p className="font-display font-bold">{PLAYER_TYPES[quiz.typeId].label[lang]}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {PLAYER_TYPES[quiz.typeId].tags.map((tg) => (
                <span key={tg} className="chip">
                  {tagLabel(tg, lang)}
                </span>
              ))}
            </div>
          </div>
          <Link to="/match" className="btn-ghost h-8 text-xs">
            {t("action.retake")}
          </Link>
        </div>
      )}

      <Section title={t("saved.games")}>
        {savedGames.length === 0 ? (
          <EmptyState
            icon="Heart"
            title={t("saved.empty")}
            action={
              <Link to="/pulse" className="btn-primary">
                {t("nav.pulse")}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-2.5">
            {savedGames.map((g, i) => (
              <RankRow key={g.id} game={g} rank={i + 1} />
            ))}
          </div>
        )}
      </Section>

      {recentGames.length > 0 && (
        <Section title={t("saved.recent")}>
          <div className="rail">
            {recentGames.map((g) => (
              <RailCard key={g.id} game={g} />
            ))}
          </div>
        </Section>
      )}

      {similar.length > 0 && (
        <Section title={t("saved.recommendSimilar")}>
          <div className="rail">
            {similar.map((g) => (
              <RailCard key={g.id} game={g} />
            ))}
          </div>
        </Section>
      )}

      <Section title={t("saved.recommendNew")}>
        <div className="rail">
          {fresh.map((g) => (
            <RailCard key={g.id} game={g} />
          ))}
        </div>
      </Section>

      <p className="mt-6 flex items-center justify-center gap-1 text-center text-[11px] text-content-faint">
        <Clock size={11} /> {t("misc.updated")} · {t("misc.disclaimerShort")}
      </p>
    </div>
  );
}
