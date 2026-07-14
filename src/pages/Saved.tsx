import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Trash2, X } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved, type Bucket } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { getGame } from "@/data/games";
import { PLAYER_TYPES } from "@/data/quiz";
import { gameOneLiner } from "@/data/vocab";
import { tagLabel } from "@/data/tags";
import type { Game } from "@/lib/types";
import { GameThumb } from "@/components/GameThumb";
import { RecentPlayedRail } from "@/components/Shared";
import { DemoButton } from "@/components/GameActions";
import { EmptyState } from "@/components/EmptyState";
import { pick } from "@/i18n";

const BUCKETS: Bucket[] = ["want", "played", "liked"];
function bucketLabel(b: Bucket, lang: "zh" | "vi" | "en") {
  return pick(lang, { want: "想玩", played: "已試玩", liked: "喜歡" }[b], { want: "Muốn chơi", played: "Đã thử", liked: "Thích" }[b], { want: "Want", played: "Played", liked: "Liked" }[b]);
}

export default function Saved() {
  const { t, lang } = useMarket();
  const { saved, category, setCategory, toggleSave, clearRecent, quiz } = useSaved();
  const { push } = useToast();
  const [filter, setFilter] = useState<Bucket | "all">("all");

  const savedGames = saved.map(getGame).filter(Boolean) as Game[];
  const shown = savedGames.filter((g) => (filter === "all" ? true : (category[g.id] ?? "want") === filter));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-vn" fill="currentColor" />
          <h1 className="font-display text-2xl font-bold">{t("saved.title")}</h1>
        </div>
        <button onClick={() => { clearRecent(); push(t("toast.reportSent"), "info"); }} className="btn-ghost h-8 text-xs">
          <Trash2 size={14} /> {t("action.clear")}
        </button>
      </div>

      {quiz && (
        <div className="card mt-4 flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pulse/15 text-pulse"><Sparkles size={22} /></div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t("saved.result")}</p>
            <p className="font-display font-bold">{PLAYER_TYPES[quiz.typeId].label[lang]}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {PLAYER_TYPES[quiz.typeId].tags.map((tg) => <span key={tg} className="chip">{tagLabel(tg, lang)}</span>)}
            </div>
          </div>
          <Link to="/match" className="btn-ghost h-8 text-xs">{t("action.retake")}</Link>
        </div>
      )}

      <RecentPlayedRail />

      {/* saved games with buckets */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="section-title">{t("saved.games")}</h2>
          <div className="flex gap-1">
            {(["all", ...BUCKETS] as (Bucket | "all")[]).map((b) => (
              <button key={b} onClick={() => setFilter(b)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${filter === b ? "bg-surface-raised text-pulse" : "text-content-faint hover:text-content"}`}>
                {b === "all" ? t("discover.filterAll") : bucketLabel(b, lang)}
              </button>
            ))}
          </div>
        </div>

        {savedGames.length === 0 ? (
          <EmptyState
            icon="Heart"
            title={t("saved.empty")}
            action={<Link to="/discover" className="btn-primary">{t("nav.discover")}</Link>}
          />
        ) : shown.length === 0 ? (
          <EmptyState icon="Inbox" title={pick(lang, "這個分類還沒有遊戲", "Nhóm này chưa có game", "Nothing in this collection yet")} />
        ) : (
          <div className="grid gap-2.5">
            {shown.map((g) => (
              <div key={g.id} className="card p-2.5 sm:p-3">
                <div className="flex items-center gap-3">
                  <Link to={`/game/${g.id}`} className="shrink-0"><GameThumb game={g} className="w-16" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/game/${g.id}`} className="truncate font-display text-sm font-semibold hover:text-pulse">{g.name}</Link>
                    <p className="truncate text-xs text-content-muted">{gameOneLiner(g, lang)}</p>
                  </div>
                  <button onClick={() => { toggleSave(g.id); push(t("toast.unsaved"), "info"); }} aria-label={t("action.remove")} className="btn h-8 w-8 border border-surface-line bg-surface-raised p-0 text-content-muted hover:text-down">
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1.5 border-t border-surface-line pt-2">
                  <DemoButton game={g} label="free" />
                  <div className="ml-auto flex gap-1">
                    {BUCKETS.map((b) => {
                      const on = (category[g.id] ?? "want") === b;
                      return (
                        <button key={b} onClick={() => { setCategory(g.id, b); push(t("toast.categoryMoved"), "success"); }} className={`rounded-full px-2 py-1 text-[11px] font-semibold ${on ? "bg-pulse text-ink" : "border border-surface-line text-content-muted hover:text-content"}`}>
                          {bucketLabel(b, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
