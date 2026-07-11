import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { DUELS, duelOfTheDay } from "@/data/duel";
import { getGame } from "@/data/games";
import { DuelCard } from "@/components/DuelCard";
import { GameThumb } from "@/components/GameThumb";

export default function Duel() {
  const { t } = useMarket();
  const { toggleCompare } = useSaved();
  const { push } = useToast();
  const today = duelOfTheDay();
  const a = getGame(today.gameA);
  const b = getGame(today.gameB);

  const compareBoth = () => {
    toggleCompare(today.gameA);
    const r = toggleCompare(today.gameB);
    if (r === "full") push(t("toast.compareFull"), "warn");
    else push(t("toast.compareAdded"), "success");
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2">
        <Swords size={20} className="text-pulse" />
        <h1 className="font-display text-2xl font-bold">{t("duel.title")}</h1>
      </div>
      <p className="mt-1 text-sm text-content-muted">{t("duel.subtitle")}</p>

      <div className="mt-4">
        <DuelCard duel={today} />
      </div>

      {/* market split */}
      {a && b && (
        <div className="card mt-4 p-4">
          <p className="eyebrow mb-3">Market split</p>
          <SplitRow label={t("duel.vnPref")} nameA={a.name} nameB={b.name} pctA={today.vnSplitA} accent="#F43F5E" />
          <div className="mt-3">
            <SplitRow label={t("duel.phPref")} nameA={a.name} nameB={b.name} pctA={today.phSplitA} accent="#38BDF8" />
          </div>
          <button onClick={compareBoth} className="btn-ghost mt-4 h-9 w-full">
            {t("duel.viewCompare")}
          </button>
        </div>
      )}

      {/* history */}
      <h2 className="section-title mt-7">近期對決</h2>
      <div className="mt-3 grid gap-2.5">
        {DUELS.map((d) => {
          const ga = getGame(d.gameA);
          const gb = getGame(d.gameB);
          if (!ga || !gb) return null;
          const total = d.votesA + d.votesB;
          const pctA = Math.round((d.votesA / total) * 100);
          return (
            <div key={d.id} className="card flex items-center gap-3 p-3">
              <Link to={`/game/${ga.id}`}>
                <GameThumb game={ga} className="w-12" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">
                  {ga.name} <span className="text-content-faint">vs</span> {gb.name}
                </p>
                <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-surface-line">
                  <div className="bg-pulse" style={{ width: `${pctA}%` }} />
                  <div className="bg-vn" style={{ width: `${100 - pctA}%` }} />
                </div>
                <p className="tnum mt-1 text-[10px] text-content-faint">{d.date} · {total.toLocaleString()} votes</p>
              </div>
              <Link to={`/game/${gb.id}`}>
                <GameThumb game={gb} className="w-12" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitRow({ label, nameA, nameB, pctA, accent }: { label: string; nameA: string; nameB: string; pctA: number; accent: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-content-muted">
        <span>{label}</span>
      </div>
      <div className="flex h-6 overflow-hidden rounded-lg bg-surface-line text-[11px] font-semibold">
        <div className="flex items-center justify-start px-2 text-ink" style={{ width: `${pctA}%`, backgroundColor: accent }}>
          {pctA}%
        </div>
        <div className="flex items-center justify-end px-2 text-content-muted" style={{ width: `${100 - pctA}%` }}>
          {100 - pctA}%
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-content-faint">
        <span className="truncate">{nameA}</span>
        <span className="truncate">{nameB}</span>
      </div>
    </div>
  );
}
