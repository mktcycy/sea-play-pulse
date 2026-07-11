import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import type { Duel } from "@/lib/types";
import { getGame } from "@/data/games";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { GameThumb } from "./GameThumb";

export function DuelCard({ duel }: { duel: Duel }) {
  const { t, market } = useMarket();
  const { vote, hasVoted } = useSaved();
  const { push } = useToast();
  const a = getGame(duel.gameA);
  const b = getGame(duel.gameB);
  if (!a || !b) return null;

  const voted = hasVoted(duel.id);
  const total = duel.votesA + duel.votesB + (voted === "A" ? 1 : voted === "B" ? 1 : 0);
  const va = duel.votesA + (voted === "A" ? 1 : 0);
  const pctA = Math.round((va / total) * 100);
  const pctB = 100 - pctA;
  const localSplitA = market === "vn" ? duel.vnSplitA : duel.phSplitA;

  const cast = (choice: "A" | "B") => {
    if (voted) return;
    vote(duel.id, choice);
    push(t("toast.voted"), "success");
  };

  return (
    <div className="card overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <Swords size={16} className="text-pulse" aria-hidden />
        <h3 className="font-display text-sm font-bold">{t("duel.title")}</h3>
        {voted && <span className="chip ml-auto text-pulse">{t("duel.yourVote")}</span>}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        {([a, b] as const).map((g, idx) => {
          const choice = idx === 0 ? "A" : "B";
          const isMine = voted === choice;
          return (
            <div key={g.id} className={`flex flex-col ${idx === 1 ? "order-3" : ""}`}>
              <Link to={`/game/${g.id}`}>
                <GameThumb game={g} ratio="aspect-[4/3]" />
              </Link>
              <p className="mt-1.5 truncate text-center font-display text-xs font-semibold">{g.name}</p>
              <button
                onClick={() => cast(choice)}
                disabled={!!voted}
                className={`btn mt-1.5 h-8 text-xs ${
                  isMine ? "bg-pulse text-ink" : voted ? "border border-surface-line text-content-muted" : "btn-ghost"
                }`}
              >
                {voted ? `${idx === 0 ? pctA : pctB}%` : t("duel.pick")}
              </button>
            </div>
          );
        })}
        <div className="order-2 grid place-items-center">
          <span className="font-display text-xs font-bold text-content-faint">VS</span>
        </div>
      </div>

      {voted ? (
        <div className="mt-3">
          <div className="flex h-2 overflow-hidden rounded-full bg-surface-line">
            <div className="bg-pulse" style={{ width: `${pctA}%` }} />
            <div className="bg-vn" style={{ width: `${pctB}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-content-muted">
            <span>{t("duel.voted", { n: total.toLocaleString() })}</span>
            <span>
              {market === "vn" ? t("duel.vnPref") : t("duel.phPref")}:{" "}
              <span className="font-semibold text-content">{a.name} {localSplitA}%</span>
            </span>
          </div>
          <Link to="/duel" className="mt-2 inline-block text-xs font-semibold text-pulse">
            {t("duel.viewCompare")} →
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-center text-[11px] text-content-faint">{t("duel.subtitle")}</p>
      )}
    </div>
  );
}
