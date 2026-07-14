import { Link } from "react-router-dom";
import { Sparkles, History, Play } from "lucide-react";
import type { Game } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useDemo } from "@/context/DemoContext";
import { getGame, todaysPick } from "@/data/games";
import { tokenLabel, gameOneLiner } from "@/data/vocab";
import { pick } from "@/i18n";
import { GameThumb } from "./GameThumb";
import { DemoButton, SaveButton } from "./GameActions";
import { PlayTypeBadge, DemoStatusBadge } from "./Badges";

// Renders any list of optimization tokens (mechanics/experience/themes) as chips.
export function MetaTags({ tokens, max = 4 }: { tokens: string[]; max?: number }) {
  const { lang } = useMarket();
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.slice(0, max).map((tk) => (
        <span key={tk} className="chip !py-0.5 !text-[11px]">{tokenLabel(tk, lang)}</span>
      ))}
    </div>
  );
}

// 今日推薦 — one featured game per day.
export function TodayPick() {
  const { market, lang, t } = useMarket();
  const g = todaysPick(market);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <Link to={`/game/${g.id}`} className="shrink-0"><GameThumb game={g} className="w-20" /></Link>
        <div className="min-w-0 flex-1">
          <p className="eyebrow flex items-center gap-1"><Sparkles size={11} className="text-flame" /> {pick(lang, "今日推薦", "Gợi ý hôm nay", "Today's pick")} · {t("misc.sampleData")}</p>
          <Link to={`/game/${g.id}`} className="mt-0.5 block truncate font-display font-bold hover:text-pulse">{g.name}</Link>
          <p className="truncate text-xs text-content-muted">{gameOneLiner(g, lang)}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <PlayTypeBadge type={g.demoType} />
            <DemoStatusBadge status={g.demoStatus} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-t border-surface-line p-2.5">
        <DemoButton game={g} label="auto" />
        <SaveButton game={g} />
      </div>
    </div>
  );
}

// 最近試玩 / 最近玩過 rail — quick return to recently played demos.
export function RecentPlayedRail({ title }: { title?: string }) {
  const { lang } = useMarket();
  const { recentPlayed } = useSaved();
  const games = recentPlayed.map(getGame).filter(Boolean) as Game[];
  if (games.length === 0) return null;
  return (
    <section className="mt-7">
      <h2 className="section-title mb-3 flex items-center gap-2">
        <History size={17} className="text-content-muted" /> {title ?? pick(lang, "最近試玩", "Chơi thử gần đây", "Recently played")}
      </h2>
      <QuickPlayBar games={games} />
    </section>
  );
}

// Compact horizontal quick-play strip (thumbnail → tap to replay).
export function QuickPlayBar({ games }: { games: Game[] }) {
  const { playDemo } = useDemo();
  if (games.length === 0) return null;
  return (
    <div className="rail">
      {games.map((g) => (
        <button
          key={g.id}
          onClick={() => playDemo(g)}
          className="group relative w-24 shrink-0 snap-start"
          aria-label={g.name}
        >
          <GameThumb game={g} className="w-24" ratio="aspect-[4/3]" />
          <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/30 opacity-0 transition group-hover:opacity-100">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-pulse text-ink"><Play size={16} fill="currentColor" /></span>
          </span>
          <span className="mt-1 block truncate text-[11px] text-content-muted">{g.name}</span>
        </button>
      ))}
    </div>
  );
}
